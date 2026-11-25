const assert = require('assert');
const express = require('express');
const http = require('http');
const db = require('./src/config/db');
const { requireAuth } = require('./src/middlewares/requireAuthMiddleware');

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
          let parsed = data;
          if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
            try {
              parsed = JSON.parse(data);
            } catch (_) {
              parsed = data;
            }
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, rawBody: data });
        });
      }
    );
    req.on('error', reject);
    if (payload !== null) req.write(payload);
    req.end();
  });
}

async function runMyApplicationsTests() {
  console.log('\n🧪 Running Task 7 Phase 2 My Applications & Ownership Tests (No Real DB Mutations)...\n');

  const originalGetPool = db.getPool;
  let server = null;

  try {
    const users = new Map([
      [18, { id: 18, name: 'Student Eighteen', email: 'student18@example.com', role: 'student', auth_role: 'user' }],
      [19, { id: 19, name: 'Student Nineteen', email: 'student19@example.com', role: 'student', auth_role: 'user' }],
      [25, { id: 25, name: 'Alumni TwentyFive', email: 'alumni25@example.com', role: 'alumni', auth_role: 'user' }],
      [61, { id: 61, name: 'Admin SixtyOne', email: 'admin61@example.com', role: 'student', auth_role: 'admin' }]
    ]);

    const jobPostings = new Map([
      [101, { id: 101, user_id: 25, title: 'Alumni 25 Backend Engineer <script>x</script>', company: 'Alumni Labs', location: 'Istanbul', description: 'Node', contact_email: 'jobs@alumni.edu', created_at: new Date('2026-02-01T10:00:00Z'), updated_at: new Date('2026-02-01T10:00:00Z') }],
      [102, { id: 102, user_id: 19, title: 'Student 19 Research Asst', company: 'Campus Lab', location: 'Ankara', description: 'Lab', contact_email: 'lab@campus.edu', created_at: new Date('2026-02-02T10:00:00Z'), updated_at: new Date('2026-02-02T10:00:00Z') }]
    ]);

    let nextAppId = 4;
    const applications = [
      {
        id: 1,
        job_posting_id: 101,
        user_id: 18,
        applicant_name: 'Student Eighteen',
        applicant_email: 'student18@example.com',
        resume_url: 'https://example.com/s18.pdf',
        cover_letter: 'Private cover letter for Student 18',
        status: 'PENDING',
        created_at: new Date('2026-02-10T10:00:00Z'),
        updated_at: new Date('2026-02-10T10:00:00Z')
      },
      {
        id: 2,
        job_posting_id: 102,
        user_id: 25,
        applicant_name: 'Alumni TwentyFive',
        applicant_email: 'alumni25@example.com',
        resume_url: null,
        cover_letter: 'Private cover letter for Alumni 25',
        status: 'REVIEWING',
        created_at: new Date('2026-02-11T10:00:00Z'),
        updated_at: new Date('2026-02-11T10:00:00Z')
      },
      {
        id: 3,
        job_posting_id: 101,
        user_id: null,
        applicant_name: 'Guest Applicant',
        applicant_email: 'guest@example.com',
        resume_url: null,
        cover_letter: 'Guest cover letter',
        status: 'PENDING',
        created_at: new Date('2026-02-12T10:00:00Z'),
        updated_at: new Date('2026-02-12T10:00:00Z')
      }
    ];

    const joinJob = (app) => {
      const jp = jobPostings.get(app.job_posting_id);
      return {
        ...app,
        job_title: jp ? jp.title : null,
        job_company: jp ? jp.company : null
      };
    };

    const handleQuery = async (sql, params = []) => {
      // job_postings queries
      if (sql.includes('FROM job_postings WHERE id = ? LIMIT 1')) {
        const job = jobPostings.get(Number(params[0]));
        return [job ? [{ ...job }] : []];
      }
      if (sql.includes('FROM job_postings ORDER BY id ASC')) {
        return [Array.from(jobPostings.values())];
      }

      // applications queries
      if (sql.includes('FROM applications a') && sql.includes('WHERE a.user_id = ?')) {
        const uid = Number(params[0]);
        return [applications.filter((a) => a.user_id === uid).sort((a, b) => b.id - a.id).map(joinJob)];
      }
      if (sql.includes('FROM applications a') && sql.includes('WHERE jp.user_id = ?')) {
        const ownerId = Number(params[0]);
        return [
          applications
            .filter((a) => {
              const jp = jobPostings.get(a.job_posting_id);
              return jp && jp.user_id === ownerId;
            })
            .sort((a, b) => b.id - a.id)
            .map(joinJob)
        ];
      }
      if (sql.includes('FROM applications a') && sql.includes('ORDER BY a.id DESC')) {
        return [[...applications].sort((a, b) => b.id - a.id).map(joinJob)];
      }
      if (sql.includes('FROM applications ORDER BY id ASC')) {
        return [[...applications].sort((a, b) => a.id - b.id)];
      }
      if (sql.includes('SELECT COUNT(*) AS count FROM applications WHERE job_posting_id = ?')) {
        const jid = Number(params[0]);
        return [[{ count: applications.filter((a) => a.job_posting_id === jid).length }]];
      }
      if (sql.includes('FROM applications WHERE job_posting_id = ?')) {
        const jid = Number(params[0]);
        return [applications.filter((a) => a.job_posting_id === jid).sort((a, b) => a.id - b.id)];
      }
      if (sql.includes('FROM applications WHERE id = ? LIMIT 1')) {
        const aid = Number(params[0]);
        const app = applications.find((a) => a.id === aid);
        return [app ? [{ ...app }] : []];
      }
      if (sql.startsWith('INSERT INTO applications')) {
        const created = {
          id: nextAppId++,
          job_posting_id: Number(params[0]),
          user_id: params[1] !== null && params[1] !== undefined ? Number(params[1]) : null,
          applicant_name: params[2],
          applicant_email: params[3],
          resume_url: params[4],
          cover_letter: params[5],
          status: params[6],
          created_at: new Date(),
          updated_at: new Date()
        };
        applications.push(created);
        return [{ insertId: created.id }];
      }
      if (sql.startsWith('UPDATE applications SET')) {
        const app = applications.find((a) => a.id === Number(params[7]));
        if (!app) return [{ affectedRows: 0 }];
        app.job_posting_id = Number(params[0]);
        app.user_id = params[1] !== null && params[1] !== undefined ? Number(params[1]) : null;
        app.applicant_name = params[2];
        app.applicant_email = params[3];
        app.resume_url = params[4];
        app.cover_letter = params[5];
        app.status = params[6];
        app.updated_at = new Date();
        return [{ affectedRows: 1 }];
      }
      if (sql.startsWith('DELETE FROM applications WHERE id = ?')) {
        const idx = applications.findIndex((a) => a.id === Number(params[0]));
        if (idx === -1) return [{ affectedRows: 0 }];
        applications.splice(idx, 1);
        return [{ affectedRows: 1 }];
      }
      throw new Error(`Unexpected SQL in test_my_applications_unit: ${sql}`);
    };

    db.getPool = async () => ({
      query: handleQuery,
      getConnection: async () => ({
        beginTransaction: async () => {},
        query: handleQuery,
        commit: async () => {},
        rollback: async () => {},
        release: () => {}
      })
    });

    delete require.cache[require.resolve('./src/models/applicationModel')];
    delete require.cache[require.resolve('./src/models/jobPostingModel')];
    delete require.cache[require.resolve('./src/controllers/applicationHelpers')];
    delete require.cache[require.resolve('./src/controllers/applicationController')];
    delete require.cache[require.resolve('./src/controllers/apiApplicationController')];
    delete require.cache[require.resolve('./src/controllers/jobPostingController')];
    delete require.cache[require.resolve('./src/middlewares/applicationCsrfMiddleware')];
    delete require.cache[require.resolve('./src/routes/applicationRoutes')];
    delete require.cache[require.resolve('./src/routes/apiApplicationRoutes')];
    delete require.cache[require.resolve('./src/routes/jobPostingRoutes')];
    delete require.cache[require.resolve('./src/views/applicationView')];
    delete require.cache[require.resolve('./src/views/jobPostingView')];

    const applicationModel = require('./src/models/applicationModel');
    const applicationController = require('./src/controllers/applicationController');
    const apiApplicationController = require('./src/controllers/apiApplicationController');
    const applicationRoutes = require('./src/routes/applicationRoutes');
    const apiApplicationRoutes = require('./src/routes/apiApplicationRoutes');
    const jobPostingRoutes = require('./src/routes/jobPostingRoutes');
    const { applicationCsrfProtection } = require('./src/middlewares/applicationCsrfMiddleware');

    const sessions = new Map();
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res, next) => {
      const mockUid = req.headers['x-mock-user-id'];
      req.user = mockUid ? users.get(Number(mockUid)) || null : null;
      const sid = req.headers['x-mock-session-id'] || (req.user ? `user-${req.user.id}` : 'guest');
      if (!sessions.has(sid)) {
        sessions.set(sid, {});
      }
      req.session = sessions.get(sid);
      if (req.user) {
        req.session.userId = req.user.id;
      }
      res.locals.currentUser = req.user;
      next();
    });

    app.get('/my-applications', requireAuth, applicationController.getMyApplications);
    app.use('/job-postings', jobPostingRoutes);
    app.get('/job-postings/:jobPostingId/applications', requireAuth, applicationCsrfProtection, applicationController.getApplicationsByJobPosting);
    app.post('/job-postings/:jobPostingId/applications', applicationCsrfProtection, applicationController.createApplicationForJobPosting);
    app.get('/api/job-postings/:jobPostingId/applications', requireAuth, apiApplicationController.getApplicationsByJobPosting);
    app.post('/api/job-postings/:jobPostingId/applications', apiApplicationController.createApplicationForJobPosting);
    app.use('/applications', applicationRoutes);
    app.use('/api/applications', apiApplicationRoutes);

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', resolve);
    });

    // 1. Guest denied access to /my-applications
    const guestMyAppsHtml = await requestApp(server, '/my-applications', 'GET', null, { accept: 'text/html' });
    assert.strictEqual(guestMyAppsHtml.status, 302);
    assert.strictEqual(guestMyAppsHtml.headers.location, '/login?authRequired=1');
    const guestMyAppsApi = await requestApp(server, '/my-applications', 'GET', null, { accept: 'application/json' });
    assert.strictEqual(guestMyAppsApi.status, 401);
    console.log('✅ 1. Guest denied access to /my-applications (302 / 401)');

    // 2. Student (#18), Alumni (#25), Admin (#61) see ONLY their own applications on /my-applications (spoofed ?user_id ignored)
    const s18MyApps = await requestApp(server, '/my-applications?user_id=25', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18' });
    assert.strictEqual(s18MyApps.status, 200);
    assert(s18MyApps.rawBody.includes('Alumni 25 Backend Engineer &lt;script&gt;x&lt;/script&gt;'));
    assert(!s18MyApps.rawBody.includes('<script>x</script>'));
    assert(!s18MyApps.rawBody.includes('Student 19 Research Asst'), 'Student 18 must NOT see Alumni 25 application');
    assert(!s18MyApps.rawBody.includes('guest@example.com'), 'Student 18 must NOT see guest application');

    const a25MyApps = await requestApp(server, '/my-applications?user_id=18', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '25' });
    assert.strictEqual(a25MyApps.status, 200);
    assert(a25MyApps.rawBody.includes('Student 19 Research Asst'));
    assert(!a25MyApps.rawBody.includes('Alumni 25 Backend Engineer'), 'Alumni 25 must NOT see Student 18 application on /my-applications');

    const adm61MyApps = await requestApp(server, '/my-applications?user_id=18', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '61' });
    assert.strictEqual(adm61MyApps.status, 200);
    assert(adm61MyApps.rawBody.includes('You have not submitted any job applications yet.'), 'Admin /my-applications must show only Admin own applications (0)');
    assert(!adm61MyApps.rawBody.includes('Alumni 25 Backend Engineer') && !adm61MyApps.rawBody.includes('Student 19 Research Asst'));
    console.log('✅ 2. Student, Alumni, and Admin /my-applications isolation & XSS escaping verified');

    // 3. Cross-user application detail denied (403) & allowed for owner / job owner / admin
    const s19ReadsS18 = await requestApp(server, '/applications/1', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '19' });
    assert.strictEqual(s19ReadsS18.status, 403);
    assert(!s19ReadsS18.rawBody.includes('Private cover letter for Student 18'));

    const s19ReadsS18Api = await requestApp(server, '/api/applications/1', 'GET', null, { accept: 'application/json', 'x-mock-user-id': '19' });
    assert.strictEqual(s19ReadsS18Api.status, 403);

    const s18ReadsA25 = await requestApp(server, '/applications/2', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18' });
    assert.strictEqual(s18ReadsA25.status, 403);

    // Owner (#18) can view own detail, but MUST NOT see status update form
    const s18ReadsOwn = await requestApp(server, '/applications/1', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18' });
    assert.strictEqual(s18ReadsOwn.status, 200);
    assert(s18ReadsOwn.rawBody.includes('Private cover letter for Student 18'));
    assert(!s18ReadsOwn.rawBody.includes('Application Status Management'));

    // Job posting owner (#25 for job 101) can view app #1 and guest app #3, and sees status management form
    const a25ReadsGuestApp = await requestApp(server, '/applications/3', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '25' });
    assert.strictEqual(a25ReadsGuestApp.status, 200);
    assert(a25ReadsGuestApp.rawBody.includes('Application Status Management'));
    console.log('✅ 3. Cross-user application detail blocking & owner/job-owner visibility verified');

    // 4. Status change & mutation ownership rules
    // Applicant (#18) CANNOT change their own status via PATCH or PUT (MVC or API)
    const selfAcceptApi = await requestApp(server, '/api/applications/1', 'PATCH', { status: 'ACCEPTED' }, { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '18' });
    assert.strictEqual(selfAcceptApi.status, 403);
    const selfAcceptPut = await requestApp(server, '/applications/1', 'PUT', { status: 'ACCEPTED' }, { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '18' });
    assert.strictEqual(selfAcceptPut.status, 403);
    assert.strictEqual(applications.find((a) => a.id === 1).status, 'PENDING');

    // Non-owner (#19) CANNOT change status of app #1 or app #3
    const nonOwnerPatch = await requestApp(server, '/api/applications/3', 'PATCH', { status: 'ACCEPTED' }, { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '19' });
    assert.strictEqual(nonOwnerPatch.status, 403);

    // Job owner (#25 for job 101) CAN review & update status of app #1 and guest app #3
    const ownerReview = await requestApp(server, '/api/applications/3', 'PATCH', { status: 'REVIEWING', user_id: 19 }, { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '25' });
    assert.strictEqual(ownerReview.status, 200);
    assert.strictEqual(ownerReview.body.status, 'REVIEWING');
    assert.strictEqual(ownerReview.body.user_id, null, 'Job owner must NOT overwrite application user_id');

    // Invalid status rejected with 400
    const badStatus = await requestApp(server, '/api/applications/3', 'PATCH', { status: 'SUPER_APPROVED' }, { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '25' });
    assert.strictEqual(badStatus.status, 400);

    // Admin (#61) can update any application
    const adminReview = await requestApp(server, '/api/applications/1', 'PATCH', { status: 'ACCEPTED' }, { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '61' });
    assert.strictEqual(adminReview.status, 200);
    assert.strictEqual(adminReview.body.status, 'ACCEPTED');
    console.log('✅ 4. Applicant self-approval blocked (403) & job-owner/admin review verified');

    // 5. Job posting applications list & /applications scoping
    const nonOwnerJobApps = await requestApp(server, '/job-postings/101/applications', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18' });
    assert.strictEqual(nonOwnerJobApps.status, 403);
    const nonOwnerJobAppsApi = await requestApp(server, '/api/job-postings/101/applications', 'GET', null, { accept: 'application/json', 'x-mock-user-id': '18' });
    assert.strictEqual(nonOwnerJobAppsApi.status, 403);

    const ownerJobApps = await requestApp(server, '/job-postings/101/applications', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '25' });
    assert.strictEqual(ownerJobApps.status, 200);
    assert(ownerJobApps.rawBody.includes('student18@example.com') && ownerJobApps.rawBody.includes('guest@example.com'));

    // /applications shows ONLY applications to own job postings for Student/Alumni, and ALL for Admin
    const s18AppsPage = await requestApp(server, '/applications', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18' });
    assert.strictEqual(s18AppsPage.status, 200);
    assert(!s18AppsPage.rawBody.includes('guest@example.com') && !s18AppsPage.rawBody.includes('alumni25@example.com'));

    const a25AppsPage = await requestApp(server, '/applications', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '25' });
    assert.strictEqual(a25AppsPage.status, 200);
    assert(a25AppsPage.rawBody.includes('guest@example.com') && a25AppsPage.rawBody.includes('student18@example.com'));
    assert(!a25AppsPage.rawBody.includes('href="/applications/2"') && !a25AppsPage.rawBody.includes('Student 19 Research Asst'), 'Alumni 25 must NOT see applications for Student 19 job');

    const a25AppsApi = await requestApp(server, '/api/applications', 'GET', null, { accept: 'application/json', 'x-mock-user-id': '25' });
    assert.strictEqual(a25AppsApi.status, 200);
    assert.deepStrictEqual(a25AppsApi.body.map((a) => a.id), [3, 1]);

    const admAppsApi = await requestApp(server, '/api/applications', 'GET', null, { accept: 'application/json', 'x-mock-user-id': '61' });
    assert.strictEqual(admAppsApi.status, 200);
    assert.strictEqual(admAppsApi.body.length, 3, 'Admin must see all 3 applications including guest app');
    console.log('✅ 5. /applications & /job-postings/:id/applications role scoping verified');

    // 6. Submission integrity & anti-spoofing (direct + nested, MVC + API)
    // Guest submission trying to spoof user_id=18 and status=ACCEPTED
    const guestSpoofDirect = await requestApp(
      server,
      '/api/applications',
      'POST',
      { job_posting_id: 101, user_id: 18, status: 'ACCEPTED', applicant_name: 'Guest Spoofer', applicant_email: 'gs@example.com' },
      { 'Content-Type': 'application/json', accept: 'application/json' }
    );
    assert.strictEqual(guestSpoofDirect.status, 201);
    assert.strictEqual(guestSpoofDirect.body.user_id, null, 'Guest submission MUST force user_id = NULL');
    assert.strictEqual(guestSpoofDirect.body.status, 'PENDING', 'Guest submission MUST force status = PENDING');

    const guestSpoofNested = await requestApp(
      server,
      '/job-postings/101/applications',
      'POST',
      { user_id: '25', status: 'ACCEPTED', applicant_name: 'Guest Web', applicant_email: 'gw@example.com' },
      { accept: 'text/html' }
    );
    assert.strictEqual(guestSpoofNested.status, 201);
    const createdGuestWeb = applications.find((a) => a.applicant_email === 'gw@example.com');
    assert(createdGuestWeb && createdGuestWeb.user_id === null && createdGuestWeb.status === 'PENDING');

    // Logged-in Student (#19) submitting while attempting to spoof user_id=18 and status=ACCEPTED
    const authedSpoofNested = await requestApp(
      server,
      '/api/job-postings/101/applications',
      'POST',
      { user_id: 18, status: 'ACCEPTED', applicant_name: 'Student Nineteen', applicant_email: 'student19@example.com' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '19' }
    );
    assert.strictEqual(authedSpoofNested.status, 201);
    assert.strictEqual(authedSpoofNested.body.user_id, 19, 'Logged-in submission MUST use req.user.id');
    assert.strictEqual(authedSpoofNested.body.status, 'PENDING', 'Logged-in submission MUST force status = PENDING');
    console.log('✅ 6. Guest (NULL) & authenticated (req.user.id) submission anti-spoofing verified');

    // 7. Deletion ownership rules
    const nonOwnerDelete = await requestApp(server, `/api/applications/${authedSpoofNested.body.id}`, 'DELETE', null, { accept: 'application/json', 'x-mock-user-id': '18' });
    assert.strictEqual(nonOwnerDelete.status, 403);
    const jobOwnerDeleteGuest = await requestApp(server, '/api/applications/3', 'DELETE', null, { accept: 'application/json', 'x-mock-user-id': '25' });
    assert.strictEqual(jobOwnerDeleteGuest.status, 403);
    const applicantOwnDelete = await requestApp(server, `/api/applications/${authedSpoofNested.body.id}`, 'DELETE', null, { accept: 'application/json', 'x-mock-user-id': '19' });
    assert.strictEqual(applicantOwnDelete.status, 204);
    const adminDeleteGuest = await requestApp(server, '/api/applications/3', 'DELETE', null, { accept: 'application/json', 'x-mock-user-id': '61' });
    assert.strictEqual(adminDeleteGuest.status, 204);
    console.log('✅ 7. Delete ownership restrictions (applicant owner & admin) verified');

    // Helper to extract hidden _csrf token from rendered HTML form
    function extractCsrf(html) {
      const m = html.match(/name="_csrf"\s+value="([^"]+)"/);
      return m ? m[1] : '';
    }

    // 8. Resume URL security (HTTP/HTTPS only, max 255 chars, unsafe legacy DB URL guard)
    const unsafeUrls = [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      `https://example.com/${'a'.repeat(245)}`
    ];
    for (const badUrl of unsafeUrls) {
      const apiReject = await requestApp(
        server,
        '/api/applications',
        'POST',
        { job_posting_id: 101, applicant_name: 'Bad Url', applicant_email: 'bad@example.com', resume_url: badUrl },
        { 'Content-Type': 'application/json', accept: 'application/json' }
      );
      assert.strictEqual(apiReject.status, 400, `Expected 400 for unsafe/too-long resume_url: ${badUrl}`);

      const apiAdminPutReject = await requestApp(
        server,
        '/api/applications/1',
        'PUT',
        { job_posting_id: 101, applicant_name: 'Student 18', applicant_email: 'student18@example.com', resume_url: badUrl },
        { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '61' }
      );
      assert.strictEqual(apiAdminPutReject.status, 400, `Expected 400 on Admin PUT for unsafe resume_url: ${badUrl}`);
    }

    const validHttpsApp = await requestApp(
      server,
      '/api/applications',
      'POST',
      { job_posting_id: 101, applicant_name: 'Safe Url', applicant_email: 'safe@example.com', resume_url: 'https://example.com/resume.pdf' },
      { 'Content-Type': 'application/json', accept: 'application/json' }
    );
    assert.strictEqual(validHttpsApp.status, 201);
    assert.strictEqual(validHttpsApp.body.resume_url, 'https://example.com/resume.pdf');

    // Legacy DB record containing javascript:alert(1) must NEVER render <a href="javascript:...">
    const legacyUnsafeId = nextAppId++;
    applications.push({
      id: legacyUnsafeId,
      job_posting_id: 101,
      user_id: null,
      applicant_name: 'Legacy Unsafe',
      applicant_email: 'legacy@example.com',
      resume_url: 'javascript:alert(1)',
      cover_letter: null,
      status: 'PENDING',
      created_at: new Date(),
      updated_at: new Date()
    });
    const listWithLegacy = await requestApp(server, '/applications', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '25' });
    assert.strictEqual(listWithLegacy.status, 200);
    assert(!listWithLegacy.rawBody.includes('href="javascript:'), 'Unsafe URL must never render as clickable href in list');
    assert(listWithLegacy.rawBody.includes('Unsafe URL blocked'));

    const detailWithLegacy = await requestApp(server, `/applications/${legacyUnsafeId}`, 'GET', null, { accept: 'text/html', 'x-mock-user-id': '25' });
    assert.strictEqual(detailWithLegacy.status, 200);
    assert(!detailWithLegacy.rawBody.includes('href="javascript:'), 'Unsafe URL must never render as clickable href in detail');
    assert(detailWithLegacy.rawBody.includes('Unsafe URL blocked'));
    console.log('✅ 8. Resume URL protocol/length validation & unsafe legacy render blocking verified');

    // 9. Email, length, scalar validation & Admin MVC PUT parity
    const invalidEmailRes = await requestApp(
      server,
      '/api/applications',
      'POST',
      { job_posting_id: 101, applicant_name: 'Valid Name', applicant_email: 'not-an-email' },
      { 'Content-Type': 'application/json', accept: 'application/json' }
    );
    assert.strictEqual(invalidEmailRes.status, 400);

    const longNameRes = await requestApp(
      server,
      '/api/applications',
      'POST',
      { job_posting_id: 101, applicant_name: 'A'.repeat(256), applicant_email: 'long@example.com' },
      { 'Content-Type': 'application/json', accept: 'application/json' }
    );
    assert.strictEqual(longNameRes.status, 400);

    const longEmailRes = await requestApp(
      server,
      '/api/applications',
      'POST',
      { job_posting_id: 101, applicant_name: 'Long Email', applicant_email: `${'a'.repeat(250)}@b.com` },
      { 'Content-Type': 'application/json', accept: 'application/json' }
    );
    assert.strictEqual(longEmailRes.status, 400);

    const arrayNameRes = await requestApp(
      server,
      '/api/applications',
      'POST',
      { job_posting_id: 101, applicant_name: ['Arr'], applicant_email: 'arr@example.com' },
      { 'Content-Type': 'application/json', accept: 'application/json' }
    );
    assert.strictEqual(arrayNameRes.status, 400);

    // Admin MVC PUT required-fields validation parity
    const admAppsPage = await requestApp(server, '/applications', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '61' });
    const admCsrf = extractCsrf(admAppsPage.rawBody);
    assert(admCsrf, 'Admin /applications page must embed _csrf token');
    const admMvcPutMissing = await requestApp(
      server,
      '/applications/1',
      'PUT',
      { job_posting_id: 101, applicant_name: '', applicant_email: 'student18@example.com', _csrf: admCsrf },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '61' }
    );
    assert.strictEqual(admMvcPutMissing.status, 400);

    const admMvcPutValid = await requestApp(
      server,
      '/applications/1',
      'PUT',
      {
        job_posting_id: 101,
        applicant_name: 'Student 18 Updated',
        applicant_email: 'student18@example.com',
        resume_url: 'https://example.com/s18.pdf',
        status: 'REVIEWING',
        _csrf: admCsrf
      },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '61' }
    );
    assert.strictEqual(admMvcPutValid.status, 200);
    assert.strictEqual(admMvcPutValid.body.applicant_name, 'Student 18 Updated');
    console.log('✅ 9. Email/length/type validation & Admin MVC PUT required-field parity verified');

    // 10. CSRF protection for MVC application mutations & preserved Guest submission
    const s18JobPage = await requestApp(server, '/job-postings/101', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 'sess-s18' });
    assert.strictEqual(s18JobPage.status, 200);
    const s18Csrf = extractCsrf(s18JobPage.rawBody);
    assert(s18Csrf, 'Authenticated /job-postings/:id form must include _csrf token');

    // Missing CSRF -> 403
    const mvcCreateMissingCsrf = await requestApp(
      server,
      '/applications',
      'POST',
      { job_posting_id: 101, applicant_name: 'Student 18', applicant_email: 'student18@example.com' },
      { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 'sess-s18' }
    );
    assert.strictEqual(mvcCreateMissingCsrf.status, 403);

    // Invalid CSRF -> 403
    const mvcCreateInvalidCsrf = await requestApp(
      server,
      '/job-postings/101/applications',
      'POST',
      { applicant_name: 'Student 18', applicant_email: 'student18@example.com', _csrf: 'bad-token-123' },
      { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 'sess-s18' }
    );
    assert.strictEqual(mvcCreateInvalidCsrf.status, 403);

    // Cross-session CSRF (Admin's token sent from Student 18's session) -> 403
    const mvcCreateCrossSession = await requestApp(
      server,
      '/applications',
      'POST',
      { job_posting_id: 101, applicant_name: 'Student 18', applicant_email: 'student18@example.com', _csrf: admCsrf },
      { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 'sess-s18' }
    );
    assert.strictEqual(mvcCreateCrossSession.status, 403);

    // Valid CSRF -> 201
    const mvcCreateValidCsrf = await requestApp(
      server,
      '/job-postings/101/applications',
      'POST',
      { applicant_name: 'Student 18 CSRF OK', applicant_email: 's18csrf@example.com', _csrf: s18Csrf },
      { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 'sess-s18' }
    );
    assert.strictEqual(mvcCreateValidCsrf.status, 201);
    const csrfCreatedApp = applications.find((a) => a.applicant_email === 's18csrf@example.com');
    assert(csrfCreatedApp && csrfCreatedApp.user_id === 18);

    // Authenticated PATCH & DELETE without CSRF -> 403; with valid CSRF -> 200/204
    const ownerAppsPage = await requestApp(server, '/applications', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '25', 'x-mock-session-id': 'sess-a25' });
    const a25Csrf = extractCsrf(ownerAppsPage.rawBody);
    assert(a25Csrf);

    const patchMissingCsrf = await requestApp(
      server,
      `/applications/${csrfCreatedApp.id}`,
      'PATCH',
      { status: 'REVIEWING' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '25', 'x-mock-session-id': 'sess-a25' }
    );
    assert.strictEqual(patchMissingCsrf.status, 403);

    const patchValidCsrf = await requestApp(
      server,
      `/applications/${csrfCreatedApp.id}`,
      'PATCH',
      { status: 'REVIEWING' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '25', 'x-mock-session-id': 'sess-a25', 'x-csrf-token': a25Csrf }
    );
    assert.strictEqual(patchValidCsrf.status, 200);
    assert.strictEqual(patchValidCsrf.body.status, 'REVIEWING');

    const deleteMissingCsrf = await requestApp(
      server,
      `/applications/${csrfCreatedApp.id}`,
      'DELETE',
      null,
      { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 'sess-s18' }
    );
    assert.strictEqual(deleteMissingCsrf.status, 403);

    const deleteValidCsrf = await requestApp(
      server,
      `/applications/${csrfCreatedApp.id}`,
      'DELETE',
      null,
      { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 'sess-s18', 'x-csrf-token': s18Csrf }
    );
    assert.strictEqual(deleteValidCsrf.status, 200);

    // Public Guest submission WITHOUT CSRF still succeeds (201)
    const guestNoCsrf = await requestApp(
      server,
      '/applications',
      'POST',
      { job_posting_id: 101, applicant_name: 'Guest No Csrf', applicant_email: 'guestnocsrf@example.com' },
      { accept: 'text/html' }
    );
    assert.strictEqual(guestNoCsrf.status, 201);
    console.log('✅ 10. MVC CSRF enforcement (missing/invalid/cross-session 403) & Guest bypass verified');

    // 11. Self-application prevention (job owner cannot apply to own job posting)
    // Owner Alumni #25 owns Job #101 -> blocked on MVC direct, MVC nested, API direct, API nested
    const selfMvcDirect = await requestApp(
      server,
      '/applications',
      'POST',
      { job_posting_id: 101, applicant_name: 'Alumni 25', applicant_email: 'a25@example.com', _csrf: a25Csrf },
      { accept: 'text/html', 'x-mock-user-id': '25', 'x-mock-session-id': 'sess-a25' }
    );
    assert.strictEqual(selfMvcDirect.status, 403);

    const selfMvcNested = await requestApp(
      server,
      '/job-postings/101/applications',
      'POST',
      { applicant_name: 'Alumni 25', applicant_email: 'a25@example.com', _csrf: a25Csrf },
      { accept: 'text/html', 'x-mock-user-id': '25', 'x-mock-session-id': 'sess-a25' }
    );
    assert.strictEqual(selfMvcNested.status, 403);

    const selfApiDirect = await requestApp(
      server,
      '/api/applications',
      'POST',
      { job_posting_id: 101, applicant_name: 'Alumni 25', applicant_email: 'a25@example.com' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '25' }
    );
    assert.strictEqual(selfApiDirect.status, 403);

    const selfApiNested = await requestApp(
      server,
      '/api/job-postings/101/applications',
      'POST',
      { applicant_name: 'Alumni 25', applicant_email: 'a25@example.com' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '25' }
    );
    assert.strictEqual(selfApiNested.status, 403);

    // Owner view hides #apply form on /job-postings/101; Guest & non-owner see #apply form
    const ownerJobDetail = await requestApp(server, '/job-postings/101', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '25', 'x-mock-session-id': 'sess-a25' });
    assert.strictEqual(ownerJobDetail.status, 200);
    assert(!ownerJobDetail.rawBody.includes('action="/job-postings/101/applications"'), 'Job owner detail page must hide apply form');
    assert(ownerJobDetail.rawBody.includes('/job-postings/101/applications'));

    const guestJobDetail = await requestApp(server, '/job-postings/101', 'GET', null, { accept: 'text/html' });
    assert.strictEqual(guestJobDetail.status, 200);
    assert(guestJobDetail.rawBody.includes('action="/job-postings/101/applications"'), 'Guest must still see apply form');
    console.log('✅ 11. Self-application prevention (MVC/API + hidden owner form) verified');

    // 12. Strict ID validation in applicationModel
    assert.strictEqual(applicationModel.idIsInvalid(true), true);
    assert.strictEqual(applicationModel.idIsInvalid(false), true);
    assert.strictEqual(applicationModel.idIsInvalid([]), true);
    assert.strictEqual(applicationModel.idIsInvalid([1]), true);
    assert.strictEqual(applicationModel.idIsInvalid({}), true);
    assert.strictEqual(applicationModel.idIsInvalid('1abc'), true);
    assert.strictEqual(applicationModel.idIsInvalid(0), true);
    assert.strictEqual(applicationModel.idIsInvalid(-3), true);
    assert.strictEqual(applicationModel.idIsInvalid(1.5), true);
    assert.strictEqual(applicationModel.idIsInvalid(1), false);
    assert.strictEqual(applicationModel.idIsInvalid(' 42 '), false);

    assert.strictEqual(await applicationModel.getApplicationById(true), null);
    assert.deepStrictEqual(await applicationModel.getApplicationsByJobPostingId([1]), []);
    assert.strictEqual(await applicationModel.updateApplication(true, { status: 'ACCEPTED' }, true), null);
    assert.strictEqual(await applicationModel.deleteApplication(true), false);
    assert.strictEqual(await applicationModel.countApplicationsByJobPostingId(true), 0);
    console.log('✅ 12. Strict ID validation rejecting booleans/arrays/objects verified');
  } finally {
    if (server) {
      await new Promise((r) => server.close(r));
    }
    db.getPool = originalGetPool;
    delete require.cache[require.resolve('./src/models/applicationModel')];
    delete require.cache[require.resolve('./src/models/jobPostingModel')];
    delete require.cache[require.resolve('./src/controllers/applicationHelpers')];
    delete require.cache[require.resolve('./src/controllers/applicationController')];
    delete require.cache[require.resolve('./src/controllers/apiApplicationController')];
    delete require.cache[require.resolve('./src/controllers/jobPostingController')];
    delete require.cache[require.resolve('./src/middlewares/applicationCsrfMiddleware')];
    delete require.cache[require.resolve('./src/routes/applicationRoutes')];
    delete require.cache[require.resolve('./src/routes/apiApplicationRoutes')];
    delete require.cache[require.resolve('./src/routes/jobPostingRoutes')];
    delete require.cache[require.resolve('./src/views/applicationView')];
    delete require.cache[require.resolve('./src/views/jobPostingView')];
  }

  console.log('\n🎉 ALL TASK 7 PHASE 2 MY APPLICATIONS UNIT TESTS PASSED! 🎉\n');
}

runMyApplicationsTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ MY APPLICATIONS UNIT TEST FAILED:', err);
    process.exit(1);
  });
