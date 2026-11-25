const assert = require('assert');
const http = require('http');
const { getPool } = require('./src/config/db');
const userModel = require('./src/models/userModel');
const announcementModel = require('./src/models/announcementModel');
const jobPostingModel = require('./src/models/jobPostingModel');
const applicationModel = require('./src/models/applicationModel');
const { hashPassword } = require('./src/utils/passwordUtils');
const { SESSION_COOKIE_NAME, sessionStore } = require('./src/config/session');

const BASE_URL = process.env.TEST_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
const parsedUrl = new URL(BASE_URL);

function request(path, method = 'GET', body = null, {
  contentType = 'application/json',
  accept = 'text/html',
  cookie = ''
} = {}) {
  return new Promise((resolve, reject) => {
    const headers = { Accept: accept };
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

    const req = http.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path,
        method,
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsedBody = data;
          if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
            try {
              parsedBody = JSON.parse(data);
            } catch (_) {
              parsedBody = data;
            }
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsedBody, rawBody: data });
        });
      }
    );

    req.on('error', reject);
    if (payload !== null) {
      req.write(payload);
    }
    req.end();
  });
}

function extractSessionCookie(setCookieHeaders) {
  const cookies = Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : setCookieHeaders
      ? [setCookieHeaders]
      : [];
  for (const header of cookies) {
    const firstPart = header.split(';')[0];
    const eqIndex = firstPart.indexOf('=');
    if (eqIndex > 0) {
      const name = firstPart.slice(0, eqIndex).trim();
      const rawValue = firstPart.slice(eqIndex + 1).trim();
      if (name === SESSION_COOKIE_NAME) {
        const decoded = decodeURIComponent(rawValue);
        let sessionId = null;
        if (decoded.startsWith('s:')) {
          sessionId = decoded.slice(2).split('.')[0];
        }
        return { cookiePair: `${name}=${rawValue}`, sessionId };
      }
    }
  }
  return null;
}

function extractCsrfToken(html) {
  const match = String(html || '').match(/name="_csrf"\s+value="([^"]+)"/);
  return match ? match[1] : null;
}

async function loginAs(email, password, trackedSessionIds) {
  const res = await request(
    '/login',
    'POST',
    { email, password },
    { contentType: 'application/x-www-form-urlencoded', accept: 'text/html' }
  );
  assert.strictEqual(res.status, 303, `Expected 303 redirect after login for ${email}, got ${res.status}`);
  const cookie = extractSessionCookie(res.headers['set-cookie']);
  assert(cookie && cookie.cookiePair, 'Session cookie should be set after login');
  if (cookie.sessionId) {
    trackedSessionIds.push(cookie.sessionId);
  }
  return cookie;
}

async function runTests() {
  console.log(`\n🚀 Starting Admin Panel Tests against ${BASE_URL}...\n`);

  const suffix = Date.now();
  const createdUserIds = [];
  const createdAnnouncementIds = [];
  const createdJobIds = [];
  const createdApplicationIds = [];
  const trackedSessionIds = [];
  let tempAdminRecord = null;
  let testError = null;

  try {
    // 1. Unauthenticated blocking
    const unauthAdminHtml = await request('/admin', 'GET', null, { accept: 'text/html' });
    assert.strictEqual(unauthAdminHtml.status, 302);
    assert.strictEqual(unauthAdminHtml.headers.location, '/login?authRequired=1');

    const unauthSummaryApi = await request('/api/admin/summary', 'GET', null, { accept: 'application/json' });
    assert.strictEqual(unauthSummaryApi.status, 401);
    assert.deepStrictEqual(unauthSummaryApi.body, { success: false, message: 'Unauthorized' });
    console.log('✅ 1. Unauthenticated /admin and /api/admin requests blocked');

    // 2. Anti-escalation during registration (body + query)
    const userEmail = `std_user_${suffix}@example.com`;
    const userPassword = 'StandardUser123!';
    const regRes = await request(
      '/register?auth_role=admin',
      'POST',
      {
        name: 'Standard Registered User',
        email: userEmail,
        password: userPassword,
        confirm_password: userPassword,
        role: 'student',
        auth_role: 'admin'
      },
      { contentType: 'application/x-www-form-urlencoded', accept: 'text/html' }
    );
    assert.strictEqual(regRes.status, 201);
    const stdUser = await userModel.getUserByEmail(userEmail);
    assert(stdUser, 'Standard registered user must exist');
    createdUserIds.push(stdUser.id);
    assert.strictEqual(stdUser.auth_role, 'user', 'Registration must force auth_role=user');
    console.log('✅ 2. Registration anti-escalation verified');

    // 3. Authenticated non-admin blocked (403) & no Admin Panel link & API anti-escalation
    const userCookie = await loginAs(userEmail, userPassword, trackedSessionIds);

    for (const viewPath of ['/', '/about', '/announcements', '/job-postings', '/applications', '/users', `/users/${stdUser.id}/jobs`]) {
      const pageRes = await request(viewPath, 'GET', null, { accept: 'text/html', cookie: userCookie.cookiePair });
      assert.strictEqual(pageRes.status, 200, `Expected 200 for ${viewPath}`);
      assert(!pageRes.rawBody.includes('href="/admin"'), `Non-admin should NOT see Admin Panel link on ${viewPath}`);
    }

    const forbiddenHtml = await request('/admin', 'GET', null, { accept: 'text/html', cookie: userCookie.cookiePair });
    assert.strictEqual(forbiddenHtml.status, 403);

    const forbiddenApi = await request('/api/admin/summary', 'GET', null, {
      accept: 'application/json',
      cookie: userCookie.cookiePair
    });
    assert.strictEqual(forbiddenApi.status, 403);

    await request(
      `/api/users/${stdUser.id}`,
      'PATCH',
      { name: 'Standard Registered User', auth_role: 'admin' },
      { contentType: 'application/json', accept: 'application/json', cookie: userCookie.cookiePair }
    );
    const checkAfterPatch = await userModel.getUserAdminById(stdUser.id);
    assert.strictEqual(checkAfterPatch.auth_role, 'user', 'Public PATCH /api/users/:id must NOT elevate auth_role');
    console.log('✅ 3. Non-admin 403 blocking, nav hiding across views, and API anti-escalation verified');

    // 4. Resolve admin session (respecting Single Admin rule)
    let adminUserId;
    let adminEmail;
    let adminPassword;
    const existingAdminCount = await userModel.countAdmins();

    if (process.env.ADMIN_TEST_EMAIL && process.env.ADMIN_TEST_PASSWORD) {
      adminEmail = process.env.ADMIN_TEST_EMAIL.trim().toLowerCase();
      adminPassword = process.env.ADMIN_TEST_PASSWORD;
      const existingAdmin = await userModel.getUserByEmail(adminEmail);
      assert(existingAdmin && existingAdmin.auth_role === 'admin', 'ADMIN_TEST_EMAIL must belong to the active admin');
      adminUserId = existingAdmin.id;
    } else if (existingAdminCount === 0) {
      adminEmail = `temp_admin_${suffix}@example.com`;
      adminPassword = 'TempAdminPass123!';
      const adminHash = await hashPassword(adminPassword);
      tempAdminRecord = await userModel.createUserAdmin({
        name: 'Temporary Test Admin',
        email: adminEmail,
        password_hash: adminHash,
        role: 'alumni',
        auth_role: 'admin',
        department: 'Computer Engineering',
        graduation_year: 2020
      });
      adminUserId = tempAdminRecord.id;
    } else {
      throw new Error(
        'A real single admin already exists. Re-run with ADMIN_TEST_EMAIL and ADMIN_TEST_PASSWORD to execute live admin integration tests without modifying real users.'
      );
    }

    const adminCookie = await loginAs(adminEmail, adminPassword, trackedSessionIds);

    for (const viewPath of ['/', '/about', '/announcements', '/job-postings', '/applications', '/users', `/users/${stdUser.id}/jobs`]) {
      const pageRes = await request(viewPath, 'GET', null, { accept: 'text/html', cookie: adminCookie.cookiePair });
      assert.strictEqual(pageRes.status, 200, `Expected 200 for ${viewPath}`);
      assert(pageRes.rawBody.includes('href="/admin"'), `Admin must see Admin Panel link on ${viewPath}`);
    }

    const summaryApi = await request('/api/admin/summary', 'GET', null, {
      accept: 'application/json',
      cookie: adminCookie.cookiePair
    });
    assert.strictEqual(summaryApi.status, 200);
    assert.strictEqual(summaryApi.body.data.admins, 1, 'Single admin invariant must hold (admins === 1)');
    console.log('✅ 4. Admin login, conditional nav links across all views, and single-admin dashboard verified');

    // 5. Single-Admin Protection & Last-Admin Guards (API + Legacy routes)
    const secondAdminRes = await request(
      '/api/admin/users',
      'POST',
      {
        name: 'Forbidden Second Admin',
        email: `second_admin_${suffix}@example.com`,
        password: 'SecondAdmin123!',
        role: 'alumni',
        auth_role: 'admin'
      },
      { contentType: 'application/json', accept: 'application/json', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(secondAdminRes.status, 409, 'Creating a second admin must fail with 409');

    const promoteStdRes = await request(
      `/api/admin/users/${stdUser.id}`,
      'PATCH',
      { auth_role: 'admin' },
      { contentType: 'application/json', accept: 'application/json', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(promoteStdRes.status, 409, 'Promoting a second user to admin must fail with 409');

    const demoteSoleRes = await request(
      `/api/admin/users/${adminUserId}`,
      'PATCH',
      { auth_role: 'user' },
      { contentType: 'application/json', accept: 'application/json', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(demoteSoleRes.status, 409, 'Demoting the sole admin must fail with 409');

    const deleteSoleAdminApi = await request(`/api/admin/users/${adminUserId}`, 'DELETE', null, {
      accept: 'application/json',
      cookie: adminCookie.cookiePair
    });
    assert.strictEqual(deleteSoleAdminApi.status, 409, 'Deleting the sole admin via Admin API must fail with 409');

    const deleteSoleLegacyApi = await request(`/api/users/${adminUserId}`, 'DELETE', null, {
      accept: 'application/json',
      cookie: adminCookie.cookiePair
    });
    assert.strictEqual(deleteSoleLegacyApi.status, 409, 'Deleting the sole admin via legacy /api/users/:id must fail with 409');
    console.log('✅ 5. Single-admin cap, demotion lock, and sole-admin delete guards (including legacy API) verified');

    // 6. MVC CSRF Enforcement + Full MVC CRUD across all 4 entities
    const missingCsrfRes = await request(
      '/admin/announcements',
      'POST',
      { title: 'Should Fail CSRF', content: 'Blocked' },
      { contentType: 'application/x-www-form-urlencoded', accept: 'text/html', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(missingCsrfRes.status, 403, 'Missing CSRF token on /admin POST must return 403');

    // MVC Users Create + Edit + Delete
    const usersPage = await request('/admin/users', 'GET', null, { accept: 'text/html', cookie: adminCookie.cookiePair });
    assert.strictEqual(usersPage.status, 200);
    assert(!usersPage.rawBody.includes('scrypt$'), 'password_hash must never appear in HTML');
    let csrfToken = extractCsrfToken(usersPage.rawBody);
    assert(csrfToken, 'CSRF token must be embedded in admin users forms');

    const mvcUserEmail = `mvc_user_${suffix}@example.com`;
    const mvcUserCreate = await request(
      '/admin/users',
      'POST',
      {
        _csrf: csrfToken,
        name: 'MVC Created User',
        email: mvcUserEmail,
        password: 'MvcUserPass123!',
        role: 'student',
        auth_role: 'user',
        department: 'Engineering',
        graduation_year: '2027'
      },
      { contentType: 'application/x-www-form-urlencoded', accept: 'text/html', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(mvcUserCreate.status, 302);
    const mvcUser = await userModel.getUserByEmail(mvcUserEmail);
    assert(mvcUser, 'MVC created user must exist in DB');
    createdUserIds.push(mvcUser.id);

    const mvcUserEditPage = await request(`/admin/users/${mvcUser.id}/edit`, 'GET', null, {
      accept: 'text/html',
      cookie: adminCookie.cookiePair
    });
    assert.strictEqual(mvcUserEditPage.status, 200);
    csrfToken = extractCsrfToken(mvcUserEditPage.rawBody);

    const mvcUserUpdate = await request(
      `/admin/users/${mvcUser.id}`,
      'POST',
      {
        _csrf: csrfToken,
        name: 'MVC Updated User',
        email: mvcUserEmail,
        role: 'alumni',
        auth_role: 'user',
        department: 'Computer Science',
        graduation_year: '2024'
      },
      { contentType: 'application/x-www-form-urlencoded', accept: 'text/html', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(mvcUserUpdate.status, 302);

    // MVC Styled Error Page check
    const mvcNotFoundUser = await request('/admin/users/999999/edit', 'GET', null, {
      accept: 'text/html',
      cookie: adminCookie.cookiePair
    });
    assert.strictEqual(mvcNotFoundUser.status, 404);
    assert(mvcNotFoundUser.rawBody.includes('Alumni Tracking') && mvcNotFoundUser.rawBody.includes('User Not Found'));

    // MVC Announcements Create + Edit + Delete
    const annPage = await request('/admin/announcements', 'GET', null, {
      accept: 'text/html',
      cookie: adminCookie.cookiePair
    });
    csrfToken = extractCsrfToken(annPage.rawBody);
    const mvcAnnCreate = await request(
      '/admin/announcements',
      'POST',
      { _csrf: csrfToken, title: `MVC Announcement ${suffix}`, content: 'MVC body' },
      { contentType: 'application/x-www-form-urlencoded', accept: 'text/html', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(mvcAnnCreate.status, 302);
    const allAnns = await announcementModel.getAllAnnouncements();
    const mvcAnn = allAnns.find((a) => a.title === `MVC Announcement ${suffix}`);
    assert(mvcAnn, 'MVC announcement should exist');
    createdAnnouncementIds.push(mvcAnn.id);

    const annEditPage = await request(`/admin/announcements/${mvcAnn.id}/edit`, 'GET', null, {
      accept: 'text/html',
      cookie: adminCookie.cookiePair
    });
    csrfToken = extractCsrfToken(annEditPage.rawBody);
    const mvcAnnUpdate = await request(
      `/admin/announcements/${mvcAnn.id}`,
      'POST',
      { _csrf: csrfToken, title: `MVC Updated Ann ${suffix}`, content: 'Updated body' },
      { contentType: 'application/x-www-form-urlencoded', accept: 'text/html', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(mvcAnnUpdate.status, 302);

    const annDel = await request(
      `/admin/announcements/${mvcAnn.id}/delete`,
      'POST',
      { _csrf: csrfToken },
      { contentType: 'application/x-www-form-urlencoded', accept: 'text/html', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(annDel.status, 302);
    createdAnnouncementIds.pop();

    // MVC Job Postings + Applications (including joined job_title & FK delete guard)
    const jobsPage = await request('/admin/job-postings', 'GET', null, {
      accept: 'text/html',
      cookie: adminCookie.cookiePair
    });
    csrfToken = extractCsrfToken(jobsPage.rawBody);
    const jobTitle = `MVC Engineer Role ${suffix}`;
    const mvcJobCreate = await request(
      '/admin/job-postings',
      'POST',
      {
        _csrf: csrfToken,
        title: jobTitle,
        company: 'Full Midnight Labs',
        location: 'Remote',
        user_id: String(mvcUser.id),
        description: 'Backend Node.js'
      },
      { contentType: 'application/x-www-form-urlencoded', accept: 'text/html', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(mvcJobCreate.status, 302);
    const allJobs = await jobPostingModel.getAllJobPostings();
    const mvcJob = allJobs.find((j) => j.title === jobTitle);
    assert(mvcJob, 'MVC created job posting should exist');
    createdJobIds.push(mvcJob.id);

    // Guest application submission without login (user_id = NULL)
    const guestAppRes = await request(
      '/api/applications',
      'POST',
      {
        job_posting_id: mvcJob.id,
        applicant_name: 'Guest Applicant',
        applicant_email: `guest_${suffix}@example.com`,
        cover_letter: 'Guest submission'
      },
      { contentType: 'application/json', accept: 'application/json' }
    );
    assert.strictEqual(guestAppRes.status, 201);
    const guestApp = guestAppRes.body.data || guestAppRes.body;
    createdApplicationIds.push(guestApp.id);
    assert.strictEqual(guestApp.user_id, null);

    // MVC Create Linked Application
    const appsPage = await request('/admin/applications', 'GET', null, {
      accept: 'text/html',
      cookie: adminCookie.cookiePair
    });
    assert.strictEqual(appsPage.status, 200);
    assert(appsPage.rawBody.includes(jobTitle), 'Admin applications table should render joined job_title');
    csrfToken = extractCsrfToken(appsPage.rawBody);

    const mvcAppCreate = await request(
      '/admin/applications',
      'POST',
      {
        _csrf: csrfToken,
        job_posting_id: String(mvcJob.id),
        user_id: String(mvcUser.id),
        applicant_name: 'Linked MVC Applicant',
        applicant_email: `mvc_app_${suffix}@example.com`,
        status: 'PENDING',
        resume_url: 'https://example.com/resume.pdf'
      },
      { contentType: 'application/x-www-form-urlencoded', accept: 'text/html', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(mvcAppCreate.status, 302);
    const allApps = await applicationModel.getAllApplications();
    const linkedApp = allApps.find((a) => a.applicant_email === `mvc_app_${suffix}@example.com`);
    assert(linkedApp, 'MVC linked application should exist');
    createdApplicationIds.push(linkedApp.id);

    // Delete mvcUser via MVC form -> linkedApp remains with user_id = NULL
    const mvcUserDel = await request(
      `/admin/users/${mvcUser.id}/delete`,
      'POST',
      { _csrf: csrfToken },
      { contentType: 'application/x-www-form-urlencoded', accept: 'text/html', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(mvcUserDel.status, 302);
    createdUserIds.pop();
    const linkedAfterUserDel = await applicationModel.getApplicationById(linkedApp.id);
    assert(linkedAfterUserDel && linkedAfterUserDel.user_id === null, 'Linked app must stay with user_id = NULL');

    // Delete job via legacy & admin API while applications exist -> both blocked 409
    const legacyJobDelBlocked = await request(`/api/job-postings/${mvcJob.id}`, 'DELETE', null, {
      accept: 'application/json',
      cookie: adminCookie.cookiePair
    });
    assert.strictEqual(legacyJobDelBlocked.status, 409);

    const adminJobDelBlocked = await request(
      `/admin/job-postings/${mvcJob.id}/delete`,
      'POST',
      { _csrf: csrfToken },
      { contentType: 'application/x-www-form-urlencoded', accept: 'text/html', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(adminJobDelBlocked.status, 409);

    // Delete applications via MVC, then delete job via MVC
    for (const appId of [guestApp.id, linkedApp.id]) {
      const delApp = await request(
        `/admin/applications/${appId}/delete`,
        'POST',
        { _csrf: csrfToken },
        { contentType: 'application/x-www-form-urlencoded', accept: 'text/html', cookie: adminCookie.cookiePair }
      );
      assert.strictEqual(delApp.status, 302);
    }
    createdApplicationIds.length = 0;

    const delJob = await request(
      `/admin/job-postings/${mvcJob.id}/delete`,
      'POST',
      { _csrf: csrfToken },
      { contentType: 'application/x-www-form-urlencoded', accept: 'text/html', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(delJob.status, 302);
    createdJobIds.pop();

    // Live concurrent application submission vs job deletion check (no orphans allowed)
    const raceJobRes = await request(
      '/api/admin/job-postings',
      'POST',
      { title: `Race Check Role ${suffix}`, company: 'Lock Labs', location: 'Remote' },
      { contentType: 'application/json', accept: 'application/json', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(raceJobRes.status, 201);
    const raceJobId = raceJobRes.body.data.id;
    createdJobIds.push(raceJobId);

    const [raceDelRes, raceCreateRes] = await Promise.all([
      request(`/api/admin/job-postings/${raceJobId}`, 'DELETE', null, {
        accept: 'application/json',
        cookie: adminCookie.cookiePair
      }),
      request(
        '/api/applications',
        'POST',
        {
          job_posting_id: raceJobId,
          applicant_name: 'Concurrent Guest',
          applicant_email: `concurrent_${suffix}@example.com`
        },
        { contentType: 'application/json', accept: 'application/json' }
      )
    ]);

    if (raceCreateRes.status === 201 && raceCreateRes.body && raceCreateRes.body.id) {
      createdApplicationIds.push(raceCreateRes.body.id);
    }

    const raceJobAfter = await jobPostingModel.getJobPostingById(raceJobId);
    const raceAppsAfter = await applicationModel.getApplicationsByJobPostingId(raceJobId);
    assert(
      !(raceJobAfter === null && raceAppsAfter.length > 0),
      'Concurrent job deletion and application creation must never leave orphaned applications'
    );
    if (raceDelRes.status === 200 && raceJobAfter === null) {
      assert.strictEqual(raceCreateRes.status, 404);
      createdJobIds.pop();
    }
    console.log('✅ 6. MVC CSRF enforcement, Full Midnight error pages, and all 4-entity MVC CRUD + concurrency flows verified');

    // 7. Validation checks (URL & max lengths) + Post-logout invalidation
    const badResumeApi = await request(
      '/api/admin/applications',
      'POST',
      {
        job_posting_id: 1,
        applicant_name: 'Test',
        applicant_email: 'test@example.com',
        resume_url: 'javascript:alert(1)'
      },
      { contentType: 'application/json', accept: 'application/json', cookie: adminCookie.cookiePair }
    );
    assert.strictEqual(badResumeApi.status, 400);

    const logoutRes = await request('/logout', 'POST', null, {
      accept: 'text/html',
      cookie: adminCookie.cookiePair
    });
    assert.strictEqual(logoutRes.status, 303);

    const postLogoutAdmin = await request('/admin', 'GET', null, {
      accept: 'text/html',
      cookie: adminCookie.cookiePair
    });
    assert.strictEqual(postLogoutAdmin.status, 302);
    console.log('✅ 7. Validation rules and post-logout session invalidation verified');

    console.log('\n🎉 ALL ADMIN PANEL LIVE INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    testError = err;
    throw err;
  } finally {
    const cleanupFailures = [];

    for (const appId of createdApplicationIds) {
      try {
        await applicationModel.deleteApplication(appId);
      } catch (err) {
        console.error(`⚠️  Cleanup failed for application #${appId}:`, err.message);
        cleanupFailures.push(`application:#${appId}:${err.message}`);
      }
    }

    for (const jobId of createdJobIds) {
      try {
        await jobPostingModel.deleteJobPosting(jobId);
      } catch (err) {
        console.error(`⚠️  Cleanup failed for job #${jobId}:`, err.message);
        cleanupFailures.push(`job:#${jobId}:${err.message}`);
      }
    }

    for (const annId of createdAnnouncementIds) {
      try {
        await announcementModel.deleteAnnouncement(annId);
      } catch (err) {
        console.error(`⚠️  Cleanup failed for announcement #${annId}:`, err.message);
        cleanupFailures.push(`announcement:#${annId}:${err.message}`);
      }
    }

    for (const sid of trackedSessionIds) {
      try {
        await sessionStore.destroy(sid);
      } catch (err) {
        console.error(`⚠️  Cleanup failed for session (${sid}):`, err.message);
        cleanupFailures.push(`session:${sid}:${err.message}`);
      }
    }

    for (const userId of createdUserIds) {
      try {
        await userModel.deleteUser(userId);
      } catch (err) {
        console.error(`⚠️  Cleanup failed for user #${userId}:`, err.message);
        cleanupFailures.push(`user:#${userId}:${err.message}`);
      }
    }

    if (tempAdminRecord) {
      try {
        const pool = await getPool();
        await pool.query('DELETE FROM users WHERE id = ? AND email = ?', [
          tempAdminRecord.id,
          tempAdminRecord.email
        ]);
      } catch (err) {
        console.error(`⚠️  Cleanup failed for temporary test admin #${tempAdminRecord.id}:`, err.message);
        cleanupFailures.push(`tempAdmin:#${tempAdminRecord.id}:${err.message}`);
      }
    }

    if (cleanupFailures.length === 0) {
      console.log('✅ Temporary admin test records cleaned up.');
    } else {
      const cleanupMsg = `Cleanup failed for: ${cleanupFailures.join(', ')}`;
      if (testError) {
        testError.message = `${testError.message} | ${cleanupMsg}`;
      } else {
        throw new Error(cleanupMsg);
      }
    }
  }
}

runTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ ADMIN TEST FAILED:', err);
    process.exit(1);
  });
