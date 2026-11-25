const assert = require('assert');
const express = require('express');
const http = require('http');
const db = require('./src/config/db');
const { requireAuth } = require('./src/middlewares/requireAuthMiddleware');
const { validateProfileInput } = require('./src/controllers/profileController');

function extractCsrfToken(html) {
  const match = html.match(/name="_csrf"\s+value="([^"]+)"/i);
  return match ? match[1] : '';
}

function requestApp(server, path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const reqHeaders = { ...headers };
    let payload = null;
    if (body !== null && body !== undefined) {
      if (typeof body === 'string') {
        payload = body;
      } else {
        reqHeaders['Content-Type'] = reqHeaders['Content-Type'] || 'application/x-www-form-urlencoded';
        payload = reqHeaders['Content-Type'] === 'application/json'
          ? JSON.stringify(body)
          : new URLSearchParams(body).toString();
      }
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: addr.port,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (c) => {
          data += c;
        });
        res.on('end', () => {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        });
      }
    );
    req.on('error', reject);
    if (payload !== null) req.write(payload);
    req.end();
  });
}

async function runProfileUnitTests() {
  console.log('\n🧪 Running Task 7 Phase 1 Personal Profile Unit Tests (No Real DB Mutations)...\n');

  // 1. Validation, non-string/object/array rejection & mass-assignment stripping unit checks
  {
    const badEmpty = validateProfileInput({ name: '   ', department: 'CS', graduation_year: '2024' });
    assert.strictEqual(badEmpty.errors.length, 1);
    assert(badEmpty.fieldErrors.name);

    const badLongName = validateProfileInput({ name: 'A'.repeat(256) });
    assert(badLongName.fieldErrors.name);

    const badLongDept = validateProfileInput({ name: 'Valid Name', department: 'D'.repeat(151) });
    assert(badLongDept.fieldErrors.department);

    const badGradFormat = validateProfileInput({ name: 'Valid Name', graduation_year: 'abcd' });
    assert(badGradFormat.fieldErrors.graduation_year);

    const badGradRange = validateProfileInput({ name: 'Valid Name', graduation_year: '1900' });
    assert(badGradRange.fieldErrors.graduation_year);

    // Non-string / object / array / boolean inputs must be rejected cleanly
    const arrayFields = validateProfileInput({
      name: ['Alice', 'Bob'],
      department: ['CS', 'Math'],
      graduation_year: ['2024', '2025']
    });
    assert.strictEqual(arrayFields.errors.length, 3);
    assert.strictEqual(arrayFields.fieldErrors.name, 'Full name must be a valid string.');
    assert.strictEqual(arrayFields.fieldErrors.department, 'Department must be a valid string.');
    assert.strictEqual(arrayFields.fieldErrors.graduation_year, 'Graduation year must be a valid scalar 4-digit year.');

    const objectFields = validateProfileInput({
      name: { first: 'Alice' },
      department: { code: 'CS' },
      graduation_year: true
    });
    assert.strictEqual(objectFields.errors.length, 3);
    assert(objectFields.fieldErrors.name && objectFields.fieldErrors.department && objectFields.fieldErrors.graduation_year);

    const boolAndFloatFields = validateProfileInput({
      name: 12345,
      department: false,
      graduation_year: 2024.5
    });
    assert.strictEqual(boolAndFloatFields.errors.length, 3);

    const validNumericYear = validateProfileInput({
      name: 'Scalar Year User',
      department: 'CS',
      graduation_year: 2026
    });
    assert.strictEqual(validNumericYear.errors.length, 0);
    assert.strictEqual(validNumericYear.parsedData.graduation_year, 2026);

    const escalated = validateProfileInput({
      id: 1,
      name: '  Selin Yılmaz  ',
      email: 'hacked@evil.com',
      role: 'alumni',
      auth_role: 'admin',
      department: '  Software Engineering  ',
      graduation_year: '2026'
    });
    assert.strictEqual(escalated.errors.length, 0);
    assert.deepStrictEqual(escalated.parsedData, {
      name: 'Selin Yılmaz',
      department: 'Software Engineering',
      graduation_year: 2026
    });
    assert.strictEqual(escalated.parsedData.role, undefined);
    assert.strictEqual(escalated.parsedData.auth_role, undefined);
    assert.strictEqual(escalated.parsedData.email, undefined);
    assert.strictEqual(escalated.parsedData.id, undefined);
    console.log('✅ 1. Strict scalar validation, object/array rejection & mass-assignment stripping verified');
  }

  // 2. HTTP route behavior via mocked DB & session stores (CSRF + Auth + Role isolation)
  const originalGetPool = db.getPool;
  let server = null;

  try {
    const store = new Map([
      [
        18,
        {
          id: 18,
          name: 'Student User',
          email: 'student@example.com',
          password_hash: 'scrypt$secret_hash',
          role: 'student',
          auth_role: 'user',
          department: 'Computer Engineering',
          graduation_year: 2027,
          created_at: new Date('2026-01-15T10:00:00Z'),
          updated_at: new Date('2026-01-15T10:00:00Z')
        }
      ],
      [
        25,
        {
          id: 25,
          name: 'Alumni User',
          email: 'alumni@example.com',
          password_hash: 'scrypt$secret_hash',
          role: 'alumni',
          auth_role: 'user',
          department: 'Electrical Engineering',
          graduation_year: 2020,
          created_at: new Date('2025-05-10T10:00:00Z'),
          updated_at: new Date('2025-05-10T10:00:00Z')
        }
      ],
      [
        61,
        {
          id: 61,
          name: 'Admin User',
          email: 'admin@example.com',
          password_hash: 'scrypt$secret_hash',
          role: 'student',
          auth_role: 'admin',
          department: 'Software Engineering',
          graduation_year: 2026,
          created_at: new Date('2026-02-01T10:00:00Z'),
          updated_at: new Date('2026-02-01T10:00:00Z')
        }
      ]
    ]);

    const sessions = new Map([
      ['18', {}],
      ['25', {}],
      ['61', {}]
    ]);

    const recordedSqlUpdates = [];
    db.getPool = async () => ({
      query: async (sql, params = []) => {
        if (sql.includes('FROM users WHERE id = ? LIMIT 1')) {
          const user = store.get(Number(params[0]));
          if (!user) return [[]];
          const { password_hash: _omit, ...safeUser } = user;
          return [[safeUser]];
        }
        if (sql.startsWith('UPDATE users SET name = ?, department = ?, graduation_year = ? WHERE id = ?')) {
          recordedSqlUpdates.push({ sql, params: [...params] });
          const targetId = Number(params[3]);
          const existing = store.get(targetId);
          if (!existing) return [{ affectedRows: 0 }];
          existing.name = params[0];
          existing.department = params[1];
          existing.graduation_year = params[2];
          existing.updated_at = new Date();
          return [{ affectedRows: 1 }];
        }
        throw new Error(`Unexpected SQL in test_profile_unit: ${sql}`);
      }
    });

    delete require.cache[require.resolve('./src/models/userModel')];
    delete require.cache[require.resolve('./src/controllers/profileController')];
    delete require.cache[require.resolve('./src/routes/profileRoutes')];
    const profileRoutes = require('./src/routes/profileRoutes');

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res, next) => {
      const mockUid = req.headers['x-mock-user-id'];
      req.user = mockUid ? store.get(Number(mockUid)) || null : null;
      req.session = mockUid ? sessions.get(String(mockUid)) || null : null;
      res.locals.currentUser = req.user;
      next();
    });
    app.use('/profile', profileRoutes);

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', resolve);
    });

    // 2a. Guest denied (302 HTML redirect + 401 JSON)
    const guestGetHtml = await requestApp(server, '/profile', 'GET', null, { accept: 'text/html' });
    assert.strictEqual(guestGetHtml.status, 302);
    assert.strictEqual(guestGetHtml.headers.location, '/login?authRequired=1');

    const guestPostHtml = await requestApp(server, '/profile', 'POST', { name: 'Hack' }, { accept: 'text/html' });
    assert.strictEqual(guestPostHtml.status, 302);
    assert.strictEqual(guestPostHtml.headers.location, '/login?authRequired=1');

    const guestApi = await requestApp(server, '/profile', 'GET', null, { accept: 'application/json' });
    assert.strictEqual(guestApi.status, 401);

    // 2b. Student, Alumni, Admin can view ONLY their own profile (even if spoofed ?id= is passed) & receive CSRF token
    const csrfTokens = {};
    for (const [uid, expectedRoleText, expectedOtherEmail] of [
      ['18', 'Student', 'alumni@example.com'],
      ['25', 'Alumni', 'student@example.com'],
      ['61', 'Administrator', 'alumni@example.com']
    ]) {
      const res = await requestApp(server, '/profile?id=999', 'GET', null, {
        accept: 'text/html',
        'x-mock-user-id': uid
      });
      assert.strictEqual(res.status, 200);
      const user = store.get(Number(uid));
      assert(res.body.includes(user.name), `Profile must show own name for #${uid}`);
      assert(res.body.includes(user.email), `Profile must show own email for #${uid}`);
      assert(res.body.includes(expectedRoleText), `Profile must show ${expectedRoleText} for #${uid}`);
      assert(res.body.includes(user.department), `Profile must show department for #${uid}`);
      assert(res.body.includes(String(user.graduation_year)), `Profile must show graduation year for #${uid}`);
      assert(!res.body.includes(expectedOtherEmail), 'Profile must NEVER expose another user email');
      assert(!res.body.includes('scrypt$'), 'Profile must NEVER expose password_hash');

      const token = extractCsrfToken(res.body);
      assert(token && token.length >= 64, `GET /profile must embed a session CSRF token for #${uid}`);
      csrfTokens[uid] = token;
    }

    // Alumni shortcut & Admin shortcut visibility on profile page
    const alumniHtml = await requestApp(server, '/profile', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '25' });
    assert(alumniHtml.body.includes('href="/users/25/jobs"'));
    assert(!alumniHtml.body.includes('href="/admin"'));

    const adminHtml = await requestApp(server, '/profile', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '61' });
    assert(adminHtml.body.includes('href="/admin"'));

    // 2c. CSRF protection: missing or invalid token rejected with 403 and no DB write
    const missingCsrf = await requestApp(
      server,
      '/profile',
      'POST',
      { name: 'Should Not Save', department: 'CS', graduation_year: '2026' },
      { accept: 'text/html', 'x-mock-user-id': '18' }
    );
    assert.strictEqual(missingCsrf.status, 403);
    assert(missingCsrf.body.includes('Invalid CSRF Token'));
    assert.strictEqual(recordedSqlUpdates.length, 0);

    const invalidCsrf = await requestApp(
      server,
      '/profile',
      'POST',
      { _csrf: 'wrong-csrf-token-value', name: 'Should Not Save' },
      { accept: 'text/html', 'x-mock-user-id': '18' }
    );
    assert.strictEqual(invalidCsrf.status, 403);
    assert(invalidCsrf.body.includes('Invalid CSRF Token'));
    assert.strictEqual(recordedSqlUpdates.length, 0);

    // Cross-user CSRF token (Alumni token submitted by Student session) must also fail 403
    const crossUserCsrf = await requestApp(
      server,
      '/profile',
      'POST',
      { _csrf: csrfTokens['25'], name: 'Cross Session CSRF' },
      { accept: 'text/html', 'x-mock-user-id': '18' }
    );
    assert.strictEqual(crossUserCsrf.status, 403);
    assert.strictEqual(recordedSqlUpdates.length, 0);

    // 2d. Object/array JSON payloads rejected with 400 even with valid CSRF token
    const objectPayloadRes = await requestApp(
      server,
      '/profile',
      'POST',
      {
        _csrf: csrfTokens['18'],
        name: ['Bad', 'Array'],
        department: { nested: 'obj' },
        graduation_year: { year: 2026 }
      },
      { 'Content-Type': 'application/json', accept: 'text/html', 'x-mock-user-id': '18' }
    );
    assert.strictEqual(objectPayloadRes.status, 400);
    assert(objectPayloadRes.body.includes('Full name must be a valid string.'));
    assert(objectPayloadRes.body.includes('Department must be a valid string.'));
    assert(objectPayloadRes.body.includes('Graduation year must be a valid scalar 4-digit year.'));
    assert.strictEqual(recordedSqlUpdates.length, 0);

    // 2e. Student POST /profile with valid CSRF + attempted role, auth_role, id, email escalation + PRG check
    const studentPost = await requestApp(
      server,
      '/profile',
      'POST',
      {
        _csrf: csrfTokens['18'],
        id: '61',
        user_id: '61',
        name: 'Student Updated <script>xss</script>',
        email: 'evil@attacker.com',
        role: 'alumni',
        auth_role: 'admin',
        department: 'Artificial Intelligence',
        graduation_year: '2028'
      },
      { accept: 'text/html', 'x-mock-user-id': '18' }
    );
    assert.strictEqual(studentPost.status, 303);
    assert.strictEqual(studentPost.headers.location, '/profile?updated=1');

    assert.strictEqual(recordedSqlUpdates.length, 1);
    assert.deepStrictEqual(recordedSqlUpdates[0].params, [
      'Student Updated <script>xss</script>',
      'Artificial Intelligence',
      2028,
      18
    ]);
    const updatedStudent = store.get(18);
    assert.strictEqual(updatedStudent.role, 'student', 'role must NEVER change via /profile');
    assert.strictEqual(updatedStudent.auth_role, 'user', 'auth_role must NEVER escalate via /profile');
    assert.strictEqual(updatedStudent.email, 'student@example.com', 'email must NEVER change via /profile');
    assert.strictEqual(store.get(61).name, 'Admin User', 'Other user #61 must remain untouched');

    // Verify GET /profile?updated=1 shows success banner and escaped name
    const afterUpdateGet = await requestApp(server, '/profile?updated=1', 'GET', null, {
      accept: 'text/html',
      'x-mock-user-id': '18'
    });
    assert.strictEqual(afterUpdateGet.status, 200);
    assert(afterUpdateGet.body.includes('Your profile details have been updated successfully.'));
    assert(afterUpdateGet.body.includes('Student Updated &lt;script&gt;xss&lt;/script&gt;'));
    assert(!afterUpdateGet.body.includes('<script>xss</script>'));

    // 2f. Invalid scalar input rejected with 400 and preserves DB state
    const badPost = await requestApp(
      server,
      '/profile',
      'POST',
      { _csrf: csrfTokens['25'], name: '', department: 'Valid Dept', graduation_year: 'not-a-year' },
      { accept: 'text/html', 'x-mock-user-id': '25' }
    );
    assert.strictEqual(badPost.status, 400);
    assert(badPost.body.includes('Full name is required.'));
    assert(badPost.body.includes('Graduation year must be a valid 4-digit year'));
    assert.strictEqual(store.get(25).name, 'Alumni User', 'Invalid POST must NOT mutate DB');

    // 2g. Alumni clearing optional fields sets NULL cleanly and redirects 303
    const clearOptPost = await requestApp(
      server,
      '/profile',
      'POST',
      { _csrf: csrfTokens['25'], name: 'Alumni Updated', department: '', graduation_year: '' },
      { accept: 'text/html', 'x-mock-user-id': '25' }
    );
    assert.strictEqual(clearOptPost.status, 303);
    assert.strictEqual(store.get(25).department, null);
    assert.strictEqual(store.get(25).graduation_year, null);

    // 2h. Admin updating own profile preserves auth_role='admin'
    const adminPost = await requestApp(
      server,
      '/profile',
      'POST',
      { _csrf: csrfTokens['61'], name: 'Admin Updated', department: 'CS', graduation_year: '2026', auth_role: 'user', role: 'alumni' },
      { accept: 'text/html', 'x-mock-user-id': '61' }
    );
    assert.strictEqual(adminPost.status, 303);
    assert.strictEqual(store.get(61).auth_role, 'admin', 'Admin auth_role must stay admin');
    assert.strictEqual(store.get(61).role, 'student', 'Admin role must stay student');

    assert(typeof requireAuth === 'function');
    console.log('✅ 2. CSRF protection, object/array rejection, escalation prevention & profile updates passed');
  } finally {
    if (server) {
      await new Promise((r) => server.close(r));
    }
    db.getPool = originalGetPool;
    delete require.cache[require.resolve('./src/models/userModel')];
    delete require.cache[require.resolve('./src/controllers/profileController')];
    delete require.cache[require.resolve('./src/routes/profileRoutes')];
  }

  console.log('\n🎉 ALL TASK 7 PHASE 1 PROFILE UNIT TESTS PASSED! 🎉\n');
}

runProfileUnitTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ PROFILE UNIT TEST FAILED:', err);
    process.exit(1);
  });
