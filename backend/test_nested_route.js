const assert = require('assert');
const http = require('http');
const userModel = require('./src/models/userModel');
const jobPostingModel = require('./src/models/jobPostingModel');

const BASE_URL = process.env.TEST_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
const parsedUrl = new URL(BASE_URL);

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: path,
      method: method,
      headers: {
        'Accept': 'application/json'
      }
    };

    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Nested API Route Test Suite (GET & POST /api/users/:id/jobs)...\n');
  console.log(`📡 Connecting to running server at ${BASE_URL} ...`);

  // Sunucu aktiflik kontrolü
  try {
    const health = await request('/api/health');
    if (health.status !== 200) {
      throw new Error(`Sunucu beklenmeyen bir durum kodu döndü: ${health.status}`);
    }
    console.log(`✅ Sunucu aktif ve erişilebilir (${BASE_URL})\n`);
  } catch (err) {
    console.error(`\n❌ Sunucuya bağlanılamadı (${BASE_URL}). Lütfen önce sunucunun (veya Docker konteynerinin) çalıştığından emin olun.`);
    console.error(`Hata detayı: ${err.message}\n`);
    process.exit(1);
  }

  const createdJobIds = [];

  try {
    // 1. Test existing users in database
    console.log('--- Test 1: Fetching existing users from DB ---');
    const users = await userModel.getAllUsers();
    assert(users.length > 0, 'Database should have users');

    // İlanı olmayan bir test kullanıcısı ve izolasyon için ikinci bir kullanıcı belirle
    let testUser = null;
    let otherUser = null;

    for (const u of users) {
      const existingJobs = await jobPostingModel.getJobPostingsByUserId(u.id);
      if ((!existingJobs || existingJobs.length === 0) && !testUser) {
        testUser = u;
      } else if (!otherUser && u !== testUser) {
        otherUser = u;
      }
    }

    if (!testUser) {
      testUser = users[0];
    }
    if (!otherUser) {
      otherUser = users.find(u => u.id !== testUser.id) || testUser;
    }

    console.log(`✅ Selected test user #${testUser.id} (${testUser.name}, ${testUser.email})`);

    // 2. Test GET 404 for non-existent user ID
    console.log('\n--- Test 2: GET /api/users/999999/jobs (Non-existent user) ---');
    const resGetNonExistent = await request('/api/users/999999/jobs');
    console.log(`Status: ${resGetNonExistent.status}, Response:`, resGetNonExistent.body);
    assert.strictEqual(resGetNonExistent.status, 404, 'Status should be 404');
    assert.strictEqual(resGetNonExistent.body.message, 'Kullanıcı bulunamadı', 'Message should be "Kullanıcı bulunamadı"');
    console.log('✅ GET 404 returned correctly for non-existent user');

    // 3. Test GET 404 for invalid user ID format
    console.log('\n--- Test 3: GET /api/users/invalid_id/jobs (Invalid ID) ---');
    const resGetInvalid = await request('/api/users/invalid_id/jobs');
    console.log(`Status: ${resGetInvalid.status}, Response:`, resGetInvalid.body);
    assert.strictEqual(resGetInvalid.status, 404, 'Status should be 404');
    assert.strictEqual(resGetInvalid.body.message, 'Kullanıcı bulunamadı');
    console.log('✅ GET 404 returned correctly for invalid user ID');

    // 4. Test GET 200 empty array for user with no jobs
    console.log(`\n--- Test 4: GET /api/users/${testUser.id}/jobs (User with no jobs yet; existing NULL user_id jobs excluded) ---`);
    const resEmpty = await request(`/api/users/${testUser.id}/jobs`);
    console.log(`Status: ${resEmpty.status}, Response:`, resEmpty.body);
    assert.strictEqual(resEmpty.status, 200, 'Status should be 200');
    assert(Array.isArray(resEmpty.body), 'Response body should be an array');
    assert.strictEqual(resEmpty.body.length, 0, 'Array should be empty');
    console.log('✅ 200 empty array returned correctly (legacy jobs with user_id = NULL are properly excluded)');

    // 5. Test POST /api/users/:id/jobs with normal user -> 201 Created
    console.log(`\n--- Test 5: POST /api/users/${testUser.id}/jobs (Create job for user via nested route) ---`);
    const resNestedPost = await request(`/api/users/${testUser.id}/jobs`, 'POST', {
      title: 'TEST_NESTED_JOB Senior AI Engineer',
      company: 'DeepTech Corp',
      location: 'Istanbul / Remote',
      description: 'Nested POST test: looking for a Senior AI Engineer',
      contact_email: 'ai@deeptech.com'
    });
    console.log(`Status: ${resNestedPost.status}, Response:`, resNestedPost.body);
    assert.strictEqual(resNestedPost.status, 201, 'Status should be 201 Created');
    assert(resNestedPost.body.id, 'Job should have an ID');
    assert.strictEqual(resNestedPost.body.user_id, testUser.id, 'Response user_id must match URL user ID');
    assert.strictEqual(resNestedPost.body.userId, testUser.id, 'Response userId must match URL user ID');
    assert.strictEqual(resNestedPost.body.title, 'TEST_NESTED_JOB Senior AI Engineer');
    assert.strictEqual(resNestedPost.body.company, 'DeepTech Corp');
    createdJobIds.push(resNestedPost.body.id);
    console.log(`✅ POST /api/users/${testUser.id}/jobs created job #${resNestedPost.body.id} with user_id=${resNestedPost.body.user_id}`);

    // 6. Test POST /api/users/:id/jobs with body containing a different user_id -> URL ID must take precedence!
    console.log(`\n--- Test 6: POST /api/users/${testUser.id}/jobs with spoofed user_id in body ---`);
    const resSpoof = await request(`/api/users/${testUser.id}/jobs`, 'POST', {
      user_id: 888888,
      userId: 777777,
      title: 'TEST_NESTED_JOB Security Specialist',
      company: 'Cyber Defense Inc',
      location: 'Ankara / Hybrid',
      description: 'Testing URL ID precedence over body user_id',
      contact_email: 'security@cyberdefense.com'
    });
    console.log(`Status: ${resSpoof.status}, Response user_id: ${resSpoof.body.user_id}`);
    assert.strictEqual(resSpoof.status, 201, 'Status should be 201 Created');
    assert.strictEqual(resSpoof.body.user_id, testUser.id, 'user_id MUST be locked to URL ID, ignoring body.user_id');
    assert.strictEqual(resSpoof.body.userId, testUser.id, 'userId MUST be locked to URL ID, ignoring body.userId');
    createdJobIds.push(resSpoof.body.id);
    console.log(`✅ URL ID precedence verified! Job was assigned to #${testUser.id}, ignoring body's 888888.`);

    // 7. Test POST 404 for non-existent user ID
    console.log('\n--- Test 7: POST /api/users/999999/jobs (Non-existent user) ---');
    const resPostNonExistent = await request('/api/users/999999/jobs', 'POST', {
      title: 'TEST_NESTED_JOB Ghost Job',
      company: 'Ghost Corp',
      description: 'This job must not be created because user does not exist'
    });
    console.log(`Status: ${resPostNonExistent.status}, Response:`, resPostNonExistent.body);
    assert.strictEqual(resPostNonExistent.status, 404, 'Status should be 404');
    assert.strictEqual(resPostNonExistent.body.message, 'Kullanıcı bulunamadı', 'Message should be "Kullanıcı bulunamadı"');
    console.log('✅ POST 404 returned correctly for non-existent user');

    // 8. Test POST 404 for invalid user ID format
    console.log('\n--- Test 8: POST /api/users/invalid_id/jobs (Invalid user ID) ---');
    const resPostInvalid = await request('/api/users/invalid_id/jobs', 'POST', {
      title: 'TEST_NESTED_JOB Invalid Job',
      company: 'Invalid Corp',
      description: 'Should fail with 404'
    });
    console.log(`Status: ${resPostInvalid.status}, Response:`, resPostInvalid.body);
    assert.strictEqual(resPostInvalid.status, 404, 'Status should be 404');
    assert.strictEqual(resPostInvalid.body.message, 'Kullanıcı bulunamadı');
    console.log('✅ POST 404 returned correctly for invalid user ID');

    // 9. Test POST 400 for missing required fields
    console.log(`\n--- Test 9: POST /api/users/${testUser.id}/jobs with missing fields ---`);
    const resPostMissing = await request(`/api/users/${testUser.id}/jobs`, 'POST', {
      title: 'TEST_NESTED_JOB Only Title'
      // company and description missing
    });
    console.log(`Status: ${resPostMissing.status}, Response:`, resPostMissing.body);
    assert.strictEqual(resPostMissing.status, 400, 'Status should be 400 Bad Request');
    assert(resPostMissing.body.message.includes('zorunludur'), 'Message should indicate required fields');
    console.log('✅ POST 400 returned correctly for missing required fields');

    // 10. Verify GET /api/users/:id/jobs returns the newly created jobs
    console.log(`\n--- Test 10: GET /api/users/${testUser.id}/jobs (User now has 2 created jobs) ---`);
    const resWithJobs = await request(`/api/users/${testUser.id}/jobs`);
    console.log(`Status: ${resWithJobs.status}, Found jobs count: ${resWithJobs.body.length}`);
    assert.strictEqual(resWithJobs.status, 200, 'Status should be 200');
    assert(Array.isArray(resWithJobs.body), 'Response body should be an array');
    assert.strictEqual(resWithJobs.body.length, 2, 'Array should contain the 2 created job postings');
    assert(resWithJobs.body.every(j => j.user_id === testUser.id), 'All jobs must belong to testUser');
    console.log('✅ GET /api/users/:id/jobs still works perfectly and returns both created jobs!');

    // 11. Verify user isolation (another user sees empty array)
    console.log(`\n--- Test 11: GET /api/users/${otherUser.id}/jobs (Another user: ${otherUser.email}) ---`);
    const resOtherUser = await request(`/api/users/${otherUser.id}/jobs`);
    assert.strictEqual(resOtherUser.status, 200, 'Status should be 200');
    assert(Array.isArray(resOtherUser.body), 'Response body should be an array');
    const hasTestJob = resOtherUser.body.some(j => createdJobIds.includes(j.id));
    assert.strictEqual(hasTestJob, false, 'Other user should not see testUser jobs');
    console.log('✅ User isolation verified! Only testUser sees their nested jobs.');

    // 12. Test Swagger documentation contains both GET and POST for /api/users/{id}/jobs
    console.log('\n--- Test 12: Verify Swagger doc.json contains GET and POST for /api/users/{id}/jobs ---');
    const resSwagger = await request('/api/swagger/doc.json');
    assert.strictEqual(resSwagger.status, 200, 'Swagger doc should return 200');
    const usersJobsPath = resSwagger.body.paths['/api/users/{id}/jobs'];
    assert(usersJobsPath, 'Swagger paths should include /api/users/{id}/jobs');
    assert(usersJobsPath.get, 'Should have GET operation');
    assert(usersJobsPath.post, 'Should have POST operation');
    console.log('✅ Swagger OpenAPI document correctly includes both GET and POST for /api/users/{id}/jobs');

    // 13. Verify other existing endpoints still work
    console.log('\n--- Test 13: Verify existing endpoints are intact ---');
    const resUsers = await request('/api/users');
    assert.strictEqual(resUsers.status, 200, '/api/users should return 200');

    const resUserDetail = await request(`/api/users/${testUser.id}`);
    assert.strictEqual(resUserDetail.status, 200, `/api/users/${testUser.id} should return 200`);

    const resJobs = await request('/api/job-postings');
    assert.strictEqual(resJobs.status, 200, '/api/job-postings should return 200');

    const resHealth = await request('/api/health');
    assert.strictEqual(resHealth.status, 200, '/api/health should return 200');
    assert.strictEqual(resHealth.body.status, 'ok');
    console.log('✅ Existing endpoints (/api/users, /api/users/:id, /api/job-postings, /api/health) verified intact!');

    console.log('\n🎉 ALL NESTED ROUTE TESTS PASSED SUCCESSFULLY! 🎉\n');
  } finally {
    // Yalnızca bu test çalıştırmasında oluşturulan test iş ilanlarını temizle
    if (createdJobIds.length > 0) {
      console.log(`🧹 Cleaning up ${createdJobIds.length} test job posting(s) created by this run...`);
      for (const id of createdJobIds) {
        await jobPostingModel.deleteJobPosting(id);
      }
      console.log('✅ Temporary test job postings cleaned up.');
    }
  }
}

runTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
