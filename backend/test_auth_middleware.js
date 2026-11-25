const assert = require('assert');
const http = require('http');
const userModel = require('./src/models/userModel');
const announcementModel = require('./src/models/announcementModel');
const jobPostingModel = require('./src/models/jobPostingModel');
const applicationModel = require('./src/models/applicationModel');
const { SESSION_COOKIE_NAME, sessionStore } = require('./src/config/session');

const BASE_URL = process.env.TEST_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
const parsedUrl = new URL(BASE_URL);

function request(path, method = 'GET', body = null, {
  contentType = 'application/json',
  accept = 'text/html',
  cookie = ''
} = {}) {
  return new Promise((resolve, reject) => {
    const headers = {
      Accept: accept
    };
    if (cookie) {
      headers.Cookie = cookie;
    }

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

function extractSessionCookie(setCookieHeaders = []) {
  const list = Array.isArray(setCookieHeaders) ? setCookieHeaders : (setCookieHeaders ? [setCookieHeaders] : []);
  const match = list.find((header) => header.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return null;

  const cookiePair = match.split(';')[0];
  const rawValue = cookiePair.slice(`${SESSION_COOKIE_NAME}=`.length);
  const decodedValue = decodeURIComponent(rawValue);
  let sessionId = null;
  if (decodedValue.startsWith('s:')) {
    const dotIdx = decodedValue.indexOf('.', 2);
    sessionId = dotIdx !== -1 ? decodedValue.slice(2, dotIdx) : decodedValue.slice(2);
  }

  return { rawHeader: match, cookiePair, sessionId };
}

async function runTests() {
  console.log('🧪 Starting Auth Middleware Test Suite (Task 4)...\n');
  console.log(`📡 Connecting to running server at ${BASE_URL} ...`);

  try {
    const health = await request('/api/health', 'GET', null, { accept: 'application/json' });
    if (health.status !== 200) {
      throw new Error(`Unexpected health status: ${health.status}`);
    }
    console.log(`✅ Server reachable at ${BASE_URL}\n`);
  } catch (err) {
    console.error(`\n❌ Could not connect to server at ${BASE_URL}: ${err.message}\n`);
    process.exit(1);
  }

  const createdUserIds = new Set();
  const createdAnnouncementIds = new Set();
  const createdJobIds = new Set();
  const createdApplicationIds = new Set();
  const trackedSessionIds = new Set();

  const runId = `${Date.now()}_${process.pid}_${Math.random().toString(36).slice(2, 8)}`;
  const testEmail = `mw.user.${runId}@alumni.edu.tr`;
  const testPass = 'MiddlewarePass123!';

  let testError = null;

  try {
    // 1. Public pages and public APIs remain accessible without login
    console.log('--- Test 1: Public pages and public GET endpoints remain accessible ---');
    for (const publicPath of ['/', '/about', '/login', '/register', '/announcements', '/job-postings']) {
      const res = await request(publicPath, 'GET', null, { accept: 'text/html' });
      assert.strictEqual(res.status, 200, `Public page ${publicPath} should return 200`);
    }
    for (const publicApiPath of ['/api/health', '/health', '/api/swagger/doc.json', '/api/announcements', '/api/job-postings']) {
      const res = await request(publicApiPath, 'GET', null, { accept: 'application/json' });
      assert.strictEqual(res.status, 200, `Public API ${publicApiPath} should return 200`);
    }
    console.log('✅ All public pages and public endpoints verified accessible');

    // 2. Unauthenticated browser requests redirect to /login?authRequired=1
    console.log('\n--- Test 2: Unauthenticated browser requests redirect to /login?authRequired=1 ---');
    const protectedBrowserRoutes = [
      ['GET', '/users'],
      ['GET', '/users/1'],
      ['GET', '/users/1/jobs'],
      ['POST', '/users'],
      ['POST', '/announcements'],
      ['POST', '/job-postings'],
      ['GET', '/applications'],
      ['GET', '/applications/1'],
      ['GET', '/job-postings/1/applications']
    ];
    for (const [method, path] of protectedBrowserRoutes) {
      const res = await request(path, method, method === 'POST' ? {} : null, {
        contentType: 'application/x-www-form-urlencoded',
        accept: 'text/html'
      });
      assert.strictEqual(res.status, 302, `${method} ${path} should redirect unauthenticated browser requests`);
      assert.strictEqual(res.headers.location, '/login?authRequired=1', `${method} ${path} should redirect to /login?authRequired=1`);
    }

    const authNoticeRes = await request('/login?authRequired=1', 'GET');
    assert.strictEqual(authNoticeRes.status, 200);
    assert(authNoticeRes.rawBody.includes('Authentication Required'), 'Login page must show authRequired notice');
    assert(authNoticeRes.rawBody.includes('Please sign in to access that page.'));
    console.log('✅ Unauthenticated browser redirects and login notice verified');

    // 3. Unauthenticated API / JSON requests return HTTP 401 JSON
    console.log('\n--- Test 3: Unauthenticated API/JSON requests return HTTP 401 JSON ---');
    const protectedApiRoutes = [
      ['GET', '/api/users'],
      ['POST', '/api/users'],
      ['GET', '/api/users/1'],
      ['GET', '/api/users/1/jobs'],
      ['POST', '/api/users/1/jobs'],
      ['POST', '/api/announcements'],
      ['PUT', '/api/announcements/1'],
      ['DELETE', '/api/announcements/1'],
      ['POST', '/api/job-postings'],
      ['PATCH', '/api/job-postings/1'],
      ['DELETE', '/api/job-postings/1'],
      ['GET', '/api/applications'],
      ['GET', '/api/applications/1'],
      ['PATCH', '/api/applications/1'],
      ['DELETE', '/api/applications/1'],
      ['GET', '/api/job-postings/1/applications'],
      ['GET', '/users'] // JSON-preferring client on web route
    ];
    for (const [method, path] of protectedApiRoutes) {
      const res = await request(path, method, ['POST', 'PUT', 'PATCH'].includes(method) ? {} : null, {
        contentType: 'application/json',
        accept: 'application/json'
      });
      assert.strictEqual(res.status, 401, `${method} ${path} should return 401 for unauthenticated JSON/API`);
      assert.deepStrictEqual(res.body, { success: false, message: 'Unauthorized' });
    }
    console.log('✅ Unauthenticated API/JSON 401 responses verified');

    // 4. Register & sign in to obtain an authenticated session
    console.log('\n--- Test 4: Register and login to obtain authenticated session ---');
    const regRes = await request('/register', 'POST', {
      name: 'Middleware Test User',
      email: testEmail,
      password: testPass,
      confirm_password: testPass,
      role: 'alumni',
      department: 'Software Engineering',
      graduation_year: '2022'
    }, { contentType: 'application/x-www-form-urlencoded' });
    const testUser = await userModel.getUserByEmail(testEmail);
    if (testUser && testUser.id) createdUserIds.add(testUser.id);
    assert.strictEqual(regRes.status, 303);
    assert(testUser && testUser.id);

    const loginRes = await request('/login', 'POST', {
      email: testEmail,
      password: testPass
    }, { contentType: 'application/x-www-form-urlencoded' });
    assert.strictEqual(loginRes.status, 303);
    const sessionCookie = extractSessionCookie(loginRes.headers['set-cookie']);
    assert(sessionCookie && sessionCookie.sessionId);
    trackedSessionIds.add(sessionCookie.sessionId);
    console.log('✅ Authenticated session established');

    // 5. Authenticated requests succeed across protected MVC & API routes
    console.log('\n--- Test 5: Authenticated requests succeed across protected routes ---');
    const authedUsersHtml = await request('/users', 'GET', null, { cookie: sessionCookie.cookiePair });
    assert.strictEqual(authedUsersHtml.status, 200);

    const authedUserDetailHtml = await request(`/users/${testUser.id}`, 'GET', null, { cookie: sessionCookie.cookiePair });
    assert.strictEqual(authedUserDetailHtml.status, 200);

    const authedUsersApi = await request('/api/users', 'GET', null, { accept: 'application/json', cookie: sessionCookie.cookiePair });
    assert.strictEqual(authedUsersApi.status, 200);
    assert(Array.isArray(authedUsersApi.body));

    const annRes = await request('/api/announcements', 'POST', {
      title: `TEST_MW_ANN ${runId}`,
      content: 'Protected announcement creation test'
    }, { accept: 'application/json', cookie: sessionCookie.cookiePair });
    if (annRes.body && annRes.body.id) createdAnnouncementIds.add(annRes.body.id);
    assert.strictEqual(annRes.status, 201);

    const jobRes = await request(`/api/users/${testUser.id}/jobs`, 'POST', {
      title: `TEST_MW_JOB ${runId}`,
      company: 'Middleware Corp',
      city: 'Istanbul'
    }, { accept: 'application/json', cookie: sessionCookie.cookiePair });
    if (jobRes.body && jobRes.body.id) createdJobIds.add(jobRes.body.id);
    assert.strictEqual(jobRes.status, 201);
    assert.strictEqual(jobRes.body.user_id, testUser.id);

    const nestedJobsRes = await request(`/api/users/${testUser.id}/jobs`, 'GET', null, { accept: 'application/json', cookie: sessionCookie.cookiePair });
    assert.strictEqual(nestedJobsRes.status, 200);
    assert(nestedJobsRes.body.some((j) => j.id === jobRes.body.id));

    // Public GET job detail remains accessible without cookie
    const publicJobDetail = await request(`/job-postings/${jobRes.body.id}`, 'GET', null, { accept: 'text/html' });
    assert.strictEqual(publicJobDetail.status, 200);

    // 6. Guest job application submission remains accessible without login (user_id = NULL)
    console.log('\n--- Test 6: Guest job application submission remains accessible with user_id = NULL ---');
    const guestAppApiRes = await request(`/api/job-postings/${jobRes.body.id}/applications`, 'POST', {
      applicant_name: 'Guest Candidate',
      applicant_email: `guest.candidate.${runId}@example.com`,
      cover_letter: 'Guest submission without session'
    }, { accept: 'application/json' });
    if (guestAppApiRes.body && guestAppApiRes.body.id) createdApplicationIds.add(guestAppApiRes.body.id);
    assert.strictEqual(guestAppApiRes.status, 201, 'Guest API application submission should succeed');
    assert.strictEqual(guestAppApiRes.body.user_id, null, 'Guest application must preserve user_id = NULL');

    const guestAppWebRes = await request('/applications', 'POST', {
      job_posting_id: String(jobRes.body.id),
      applicant_name: 'Guest Web Candidate',
      applicant_email: `guest.web.${runId}@example.com`
    }, { contentType: 'application/x-www-form-urlencoded', accept: 'text/html' });
    assert.strictEqual(guestAppWebRes.status, 201, 'Guest web application submission should succeed');
    const jobApps = await applicationModel.getApplicationsByJobPostingId(jobRes.body.id);
    const guestWebApp = jobApps.find((a) => a.applicant_email === `guest.web.${runId}@example.com`);
    if (guestWebApp && guestWebApp.id) createdApplicationIds.add(guestWebApp.id);
    assert(guestWebApp && guestWebApp.user_id === null, 'Guest web application must preserve user_id = NULL');

    // Authenticated application review & management succeeds
    const authedAppsRes = await request(`/api/job-postings/${jobRes.body.id}/applications`, 'GET', null, {
      accept: 'application/json',
      cookie: sessionCookie.cookiePair
    });
    assert.strictEqual(authedAppsRes.status, 200);
    assert.strictEqual(authedAppsRes.body.length, 2);

    const patchAppRes = await request(`/api/applications/${guestAppApiRes.body.id}`, 'PATCH', {
      status: 'REVIEWING'
    }, { accept: 'application/json', cookie: sessionCookie.cookiePair });
    assert.strictEqual(patchAppRes.status, 200);
    assert.strictEqual(patchAppRes.body.status, 'REVIEWING');
    console.log('✅ Authenticated protected routes and guest application submission verified');

    // 7. Logged-out session is blocked again
    console.log('\n--- Test 7: Logged-out session is blocked again ---');
    const logoutRes = await request('/logout', 'POST', null, {
      contentType: 'application/x-www-form-urlencoded',
      cookie: sessionCookie.cookiePair
    });
    assert.strictEqual(logoutRes.status, 303);

    const blockedHtmlAfterLogout = await request('/users', 'GET', null, {
      accept: 'text/html',
      cookie: sessionCookie.cookiePair
    });
    assert.strictEqual(blockedHtmlAfterLogout.status, 302);
    assert.strictEqual(blockedHtmlAfterLogout.headers.location, '/login?authRequired=1');

    const blockedApiAfterLogout = await request('/api/users', 'GET', null, {
      accept: 'application/json',
      cookie: sessionCookie.cookiePair
    });
    assert.strictEqual(blockedApiAfterLogout.status, 401);
    assert.deepStrictEqual(blockedApiAfterLogout.body, { success: false, message: 'Unauthorized' });
    console.log('✅ Post-logout route protection verified');

    console.log('\n🎉 ALL AUTH MIDDLEWARE TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    testError = err;
    throw err;
  } finally {
    const cleanupFailures = [];

    for (const appId of createdApplicationIds) {
      try {
        await applicationModel.deleteApplication(appId);
      } catch (err) {
        cleanupFailures.push(`application:#${appId}`);
        console.error(`⚠️  Failed to delete test application #${appId}: ${err.message}`);
      }
    }

    for (const jobId of createdJobIds) {
      try {
        await jobPostingModel.deleteJobPosting(jobId);
      } catch (err) {
        cleanupFailures.push(`job:#${jobId}`);
        console.error(`⚠️  Failed to delete test job #${jobId}: ${err.message}`);
      }
    }

    for (const annId of createdAnnouncementIds) {
      try {
        await announcementModel.deleteAnnouncement(annId);
      } catch (err) {
        cleanupFailures.push(`announcement:#${annId}`);
        console.error(`⚠️  Failed to delete test announcement #${annId}: ${err.message}`);
      }
    }

    for (const sid of trackedSessionIds) {
      try {
        await sessionStore.destroy(sid);
      } catch (err) {
        cleanupFailures.push(`session:${sid}`);
        console.error(`⚠️  Failed to delete test session (${sid}): ${err.message}`);
      }
    }

    for (const userId of createdUserIds) {
      try {
        await userModel.deleteUser(userId);
      } catch (err) {
        cleanupFailures.push(`user:#${userId}`);
        console.error(`⚠️  Failed to delete test user #${userId}: ${err.message}`);
      }
    }

    if (cleanupFailures.length === 0) {
      console.log('✅ Temporary auth middleware test records cleaned up.');
    } else if (!testError) {
      throw new Error(`Cleanup failed for: ${cleanupFailures.join(', ')}`);
    }
  }
}

runTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
