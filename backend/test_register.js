const assert = require('assert');
const http = require('http');
const userModel = require('./src/models/userModel');
const { verifyPassword } = require('./src/utils/passwordUtils');

const BASE_URL = process.env.TEST_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
const parsedUrl = new URL(BASE_URL);

function request(path, method = 'GET', body = null, contentType = 'application/json', accept = 'text/html') {
  return new Promise((resolve, reject) => {
    const headers = {
      Accept: accept
    };

    let payload = null;
    if (body !== null && body !== undefined) {
      headers['Content-Type'] = contentType;
      if (contentType === 'application/x-www-form-urlencoded') {
        payload = typeof body === 'string' ? body : new URLSearchParams(body).toString();
      } else {
        payload = typeof body === 'string' ? body : JSON.stringify(body);
      }
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsedBody = data;
        if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
          try {
            parsedBody = JSON.parse(data);
          } catch (e) {
            parsedBody = data;
          }
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsedBody, rawBody: data });
      });
    });

    req.on('error', reject);

    if (payload !== null) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Registration Test Suite (GET & POST /register)...\n');
  console.log(`📡 Connecting to running server at ${BASE_URL} ...`);

  try {
    const health = await request('/api/health', 'GET', null, 'application/json', 'application/json');
    if (health.status !== 200) {
      throw new Error(`Unexpected health status: ${health.status}`);
    }
    console.log(`✅ Server reachable at ${BASE_URL}\n`);
  } catch (err) {
    console.error(`\n❌ Could not connect to server at ${BASE_URL}: ${err.message}\n`);
    process.exit(1);
  }

  const createdUserIds = new Set();
  const trackUserId = (id) => {
    const numId = Number(id);
    if (Number.isInteger(numId) && numId > 0) {
      createdUserIds.add(numId);
    }
  };
  const trackUserByExactEmail = async (email) => {
    try {
      const user = await userModel.getUserByEmail(email);
      if (user && user.id) {
        trackUserId(user.id);
      }
      return user;
    } catch (lookupErr) {
      console.error(`⚠️  Could not look up test user (${email}) for tracking: ${lookupErr.message}`);
      return null;
    }
  };

  const runId = `${Date.now()}_${process.pid}_${Math.random().toString(36).slice(2, 8)}`;
  const studentEmail = `test.student.${runId}@alumni.edu.tr`;
  const alumniEmail = `test.alumni.${runId}@alumni.edu.tr`;
  const adminEmail = `test.admin.${runId}@alumni.edu.tr`;
  const weakEmail = `test.weak.${runId}@alumni.edu.tr`;
  const mismatchEmail = `test.mismatch.${runId}@alumni.edu.tr`;
  const badYearEmail = `test.badyear.${runId}@alumni.edu.tr`;
  const crudEmail = `test.crud.${runId}@alumni.edu.tr`;

  let testError = null;

  try {
    // 1. GET /register returns HTTP 200 and expected fields without admin option
    console.log('--- Test 1: GET /register returns HTTP 200 ---');
    const getRes = await request('/register', 'GET');
    assert.strictEqual(getRes.status, 200, 'GET /register should return 200 OK');
    assert(getRes.rawBody.includes('name="name"'), 'Form should contain name input');
    assert(getRes.rawBody.includes('name="email"'), 'Form should contain email input');
    assert(getRes.rawBody.includes('name="password"'), 'Form should contain password input');
    assert(getRes.rawBody.includes('name="confirm_password"'), 'Form should contain confirm_password input');
    assert(getRes.rawBody.includes('name="role"'), 'Form should contain role select');
    assert(getRes.rawBody.includes('value="student"'), 'Role select should allow student');
    assert(getRes.rawBody.includes('value="alumni"'), 'Role select should allow alumni');
    assert(!getRes.rawBody.includes('value="admin"'), 'Role select must NOT expose admin option');
    assert(getRes.rawBody.includes('name="department"'), 'Form should contain optional department input');
    assert(getRes.rawBody.includes('name="graduation_year"'), 'Form should contain optional graduation_year input');
    console.log('✅ GET /register verified');

    // 2. Student registration works (redirect-after-post, no auto-login/cookies)
    console.log('\n--- Test 2: Valid student registration succeeds with redirect-after-post ---');
    const studentPass = 'StudentPass123!';
    const studentRes = await request('/register', 'POST', {
      name: '  Test Student User  ',
      email: `  ${studentEmail.toUpperCase()}  `,
      password: studentPass,
      confirm_password: studentPass,
      role: 'student',
      department: 'Computer Engineering',
      graduation_year: '2027'
    }, 'application/x-www-form-urlencoded');

    // Track immediately after POST so cleanup runs even if a subsequent assertion fails
    const storedStudent = await trackUserByExactEmail(studentEmail);

    assert.strictEqual(studentRes.status, 303, 'Valid registration should redirect (303)');
    assert.strictEqual(studentRes.headers.location, '/register?registered=1', 'Should redirect to /register?registered=1');
    assert.strictEqual(studentRes.headers['set-cookie'], undefined, 'Registration must NOT set session/auth cookies');

    const redirectFollowRes = await request(studentRes.headers.location, 'GET');
    assert.strictEqual(redirectFollowRes.status, 200, 'Redirect target should return 200');
    assert(redirectFollowRes.rawBody.includes('Registration Successful'), 'Success banner should appear after redirect');

    assert(storedStudent, 'Student should exist in DB');
    assert.strictEqual(storedStudent.name, 'Test Student User', 'Name should be trimmed');
    assert.strictEqual(storedStudent.email, studentEmail, 'Email should be trimmed and lowercased');
    assert.strictEqual(storedStudent.role, 'student', 'Role should be student');
    assert.strictEqual(storedStudent.department, 'Computer Engineering');
    assert.strictEqual(storedStudent.graduation_year, 2027);
    assert(storedStudent.password_hash && storedStudent.password_hash !== studentPass, 'Password must be stored as hash, not plaintext');
    assert(storedStudent.password_hash.startsWith('scrypt$'), 'Password hash must use self-describing scrypt format');
    const isPasswordValid = await verifyPassword(studentPass, storedStudent.password_hash);
    assert.strictEqual(isPasswordValid, true, 'verifyPassword must validate stored hash');
    console.log('✅ Student registration, trimming, lowercasing, scrypt hashing, and PRG verified');

    // 3. Alumni registration works (without optional fields)
    console.log('\n--- Test 3: Valid alumni registration succeeds ---');
    const alumniPass = 'AlumniPass123!';
    const alumniRes = await request('/register', 'POST', {
      name: 'Test Alumni User',
      email: alumniEmail,
      password: alumniPass,
      confirm_password: alumniPass,
      role: 'alumni',
      department: '',
      graduation_year: ''
    }, 'application/x-www-form-urlencoded');

    // Track immediately after POST so cleanup runs even if a subsequent assertion fails
    const storedAlumni = await trackUserByExactEmail(alumniEmail);

    assert.strictEqual(alumniRes.status, 303, 'Alumni registration should redirect (303)');
    assert(storedAlumni, 'Alumni should exist in DB');
    assert.strictEqual(storedAlumni.role, 'alumni', 'Role should be alumni');
    assert.strictEqual(storedAlumni.department, null, 'Empty optional department should store NULL');
    assert.strictEqual(storedAlumni.graduation_year, null, 'Empty optional graduation_year should store NULL');
    console.log('✅ Alumni registration verified');

    // 4. Password hash is NOT exposed in public user responses
    console.log('\n--- Test 4: Password hash is not exposed in public user responses ---');
    const apiUsersRes = await request('/api/users', 'GET', null, 'application/json', 'application/json');
    assert.strictEqual(apiUsersRes.status, 200);
    assert(Array.isArray(apiUsersRes.body));
    const apiStudent = apiUsersRes.body.find((u) => u.id === storedStudent.id);
    assert(apiStudent, 'Student should be returned in /api/users');
    assert.strictEqual(apiStudent.password_hash, undefined, 'password_hash must not be exposed in /api/users');

    const apiUserDetailRes = await request(`/api/users/${storedStudent.id}`, 'GET', null, 'application/json', 'application/json');
    assert.strictEqual(apiUserDetailRes.status, 200);
    assert.strictEqual(apiUserDetailRes.body.password_hash, undefined, 'password_hash must not be exposed in /api/users/:id');

    const htmlUsersRes = await request('/users', 'GET');
    assert.strictEqual(htmlUsersRes.status, 200);
    assert(!htmlUsersRes.rawBody.includes(storedStudent.password_hash), 'password_hash must not appear in /users HTML');

    const htmlUserDetailRes = await request(`/users/${storedStudent.id}`, 'GET');
    assert.strictEqual(htmlUserDetailRes.status, 200);
    assert(!htmlUserDetailRes.rawBody.includes(storedStudent.password_hash), 'password_hash must not appear in /users/:id HTML');
    console.log('✅ Password hash exclusion across API and HTML views verified');

    // 5. Admin registration is rejected
    console.log('\n--- Test 5: Admin role registration is rejected ---');
    const adminRes = await request('/register', 'POST', {
      name: 'Attempted Admin',
      email: adminEmail,
      password: 'AdminPassword123',
      confirm_password: 'AdminPassword123',
      role: 'admin'
    }, 'application/x-www-form-urlencoded');
    const rejectedAdmin = await trackUserByExactEmail(adminEmail);
    assert.strictEqual(adminRes.status, 400, 'Admin self-registration must be rejected with 400');
    assert(adminRes.rawBody.includes('Invalid account type'), 'Should display clear invalid account type error');
    assert.strictEqual(rejectedAdmin, null, 'Admin user must NOT be created in DB');
    console.log('✅ Admin role rejection verified');

    // 6. Missing required fields are rejected
    console.log('\n--- Test 6: Missing required fields are rejected ---');
    const missingRes = await request('/register', 'POST', {
      name: '',
      email: '',
      password: '',
      confirm_password: '',
      role: ''
    }, 'application/x-www-form-urlencoded');
    assert.strictEqual(missingRes.status, 400);
    assert(missingRes.rawBody.includes('Full name is required'));
    assert(missingRes.rawBody.includes('Email address is required'));
    assert(missingRes.rawBody.includes('Password is required'));
    assert(missingRes.rawBody.includes('Account type is required'));
    console.log('✅ Missing required fields rejection verified');

    // 7. Invalid email is rejected (non-password fields preserved, password NOT redisplayed)
    console.log('\n--- Test 7: Invalid email is rejected ---');
    const badEmailRes = await request('/register', 'POST', {
      name: 'Bad Email User',
      email: 'not-an-email',
      password: 'SecretPassword99',
      confirm_password: 'SecretPassword99',
      role: 'student',
      department: 'Physics'
    }, 'application/x-www-form-urlencoded');
    assert.strictEqual(badEmailRes.status, 400);
    assert(badEmailRes.rawBody.includes('valid email address'));
    assert(badEmailRes.rawBody.includes('value="Bad Email User"'), 'Non-password name value should be preserved');
    assert(badEmailRes.rawBody.includes('value="Physics"'), 'Non-password department value should be preserved');
    assert(!badEmailRes.rawBody.includes('SecretPassword99'), 'Password must NEVER be redisplayed in HTML');
    console.log('✅ Invalid email rejection and safe form preservation verified');

    // 8. Weak password (< 8 characters) is rejected
    console.log('\n--- Test 8: Weak password is rejected ---');
    const weakPassRes = await request('/register', 'POST', {
      name: 'Weak Pass User',
      email: weakEmail,
      password: 'short',
      confirm_password: 'short',
      role: 'student'
    }, 'application/x-www-form-urlencoded');
    const rejectedWeakUser = await trackUserByExactEmail(weakEmail);
    assert.strictEqual(weakPassRes.status, 400);
    assert(weakPassRes.rawBody.includes('at least 8 characters'));
    assert(!weakPassRes.rawBody.includes('value="short"'), 'Weak password must not be redisplayed');
    assert.strictEqual(rejectedWeakUser, null, 'User with weak password must NOT be created in DB');
    console.log('✅ Weak password rejection verified');

    // 9. Mismatched password confirmation is rejected
    console.log('\n--- Test 9: Mismatched confirmation is rejected ---');
    const mismatchRes = await request('/register', 'POST', {
      name: 'Mismatch User',
      email: mismatchEmail,
      password: 'PasswordOne123',
      confirm_password: 'PasswordTwo123',
      role: 'alumni'
    }, 'application/x-www-form-urlencoded');
    const rejectedMismatchUser = await trackUserByExactEmail(mismatchEmail);
    assert.strictEqual(mismatchRes.status, 400);
    assert(mismatchRes.rawBody.includes('do not match'));
    assert(!mismatchRes.rawBody.includes('PasswordOne123'));
    assert(!mismatchRes.rawBody.includes('PasswordTwo123'));
    assert.strictEqual(rejectedMismatchUser, null, 'User with mismatched confirmation must NOT be created in DB');
    console.log('✅ Mismatched password confirmation rejection verified');

    // 10. Duplicate email is handled with 409 Conflict without exposing DB internals
    console.log('\n--- Test 10: Duplicate email is handled cleanly (409) ---');
    const dupRes = await request('/register', 'POST', {
      name: 'Duplicate User',
      email: studentEmail,
      password: 'AnotherPassword123',
      confirm_password: 'AnotherPassword123',
      role: 'student'
    }, 'application/x-www-form-urlencoded');
    assert.strictEqual(dupRes.status, 409, 'Duplicate email should return 409 Conflict');
    assert(dupRes.rawBody.includes('already registered'));
    assert(!dupRes.rawBody.includes('ER_DUP_ENTRY'), 'Database internals must not be exposed');
    assert(!dupRes.rawBody.includes('AnotherPassword123'), 'Password must not be redisplayed');
    console.log('✅ Duplicate email handling verified');

    // 11. Invalid graduation year is rejected
    console.log('\n--- Test 11: Invalid graduation year is rejected ---');
    const badYearRes = await request('/register', 'POST', {
      name: 'Bad Year User',
      email: badYearEmail,
      password: 'ValidPassword123',
      confirm_password: 'ValidPassword123',
      role: 'alumni',
      graduation_year: '1800'
    }, 'application/x-www-form-urlencoded');
    const rejectedBadYearUser = await trackUserByExactEmail(badYearEmail);
    assert.strictEqual(badYearRes.status, 400);
    assert(badYearRes.rawBody.includes('Graduation year'));
    assert.strictEqual(rejectedBadYearUser, null, 'User with invalid graduation year must NOT be created in DB');
    console.log('✅ Invalid graduation year rejection verified');

    // 12. Existing Users CRUD and nested /api/users/:id/jobs still work
    console.log('\n--- Test 12: Existing Users CRUD and nested jobs route still work ---');
    const createCrudRes = await request('/api/users', 'POST', {
      name: 'CRUD Compat User',
      email: crudEmail
    }, 'application/json', 'application/json');
    if (createCrudRes.body && createCrudRes.body.id) {
      trackUserId(createCrudRes.body.id);
    } else {
      await trackUserByExactEmail(crudEmail);
    }
    assert.strictEqual(createCrudRes.status, 201);
    assert(createCrudRes.body && createCrudRes.body.id);

    const nestedJobsRes = await request(`/api/users/${createCrudRes.body.id}/jobs`, 'GET', null, 'application/json', 'application/json');
    assert.strictEqual(nestedJobsRes.status, 200);
    assert(Array.isArray(nestedJobsRes.body));

    const patchCrudRes = await request(`/api/users/${createCrudRes.body.id}`, 'PATCH', {
      name: 'CRUD Compat Updated'
    }, 'application/json', 'application/json');
    assert.strictEqual(patchCrudRes.status, 200);
    assert.strictEqual(patchCrudRes.body.name, 'CRUD Compat Updated');
    console.log('✅ Existing Users CRUD and nested jobs route compatibility verified');

    console.log('\n🎉 ALL REGISTRATION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    testError = err;
    throw err;
  } finally {
    if (createdUserIds.size > 0) {
      console.log(`🧹 Cleaning up ${createdUserIds.size} temporary test user(s) by exact ID...`);
      const cleanupFailures = [];

      for (const id of createdUserIds) {
        try {
          const deleted = await userModel.deleteUser(id);
          if (!deleted) {
            console.warn(`⚠️  Tracked test user #${id} was already absent during cleanup.`);
          }
        } catch (cleanupErr) {
          cleanupFailures.push({ id, error: cleanupErr });
          console.error(`⚠️  Failed to delete temporary test user #${id}: ${cleanupErr.message}`);
        }
      }

      if (cleanupFailures.length === 0) {
        console.log('✅ Temporary test users cleaned up.');
      } else if (!testError) {
        // Only surface cleanup failure if no primary test error occurred
        const failedIds = cleanupFailures.map((f) => `#${f.id}`).join(', ');
        throw new Error(`Cleanup failed for tracked test user(s): ${failedIds}`);
      }
    }
  }
}

runTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
