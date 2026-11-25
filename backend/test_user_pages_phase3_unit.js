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
    if (payload !== null) {
      req.write(payload);
    }
    req.end();
  });
}

function extractCsrf(html) {
  const m = String(html || '').match(/name="_csrf"\s+value="([^"]+)"/);
  return m ? m[1] : '';
}

async function runPhase3Tests() {
  console.log('\n🧪 Running Task 7 Phase 3 User-Specific Pages & RBAC Tests (No Real DB Mutations)...\n');

  const originalGetPool = db.getPool;
  let server = null;

  try {
    const usersData = [
      {
        id: 18,
        name: 'Selin Student',
        email: 'selin.private@example.com',
        password_hash: 'scrypt:secret18',
        role: 'student',
        auth_role: 'user',
        department: 'Computer Engineering',
        graduation_year: 2027,
        created_at: new Date('2026-01-10T09:00:00Z'),
        updated_at: new Date('2026-01-10T09:00:00Z')
      },
      {
        id: 25,
        name: 'Mert Alumni',
        email: 'mert.private@example.com',
        password_hash: 'scrypt:secret25',
        role: 'alumni',
        auth_role: 'user',
        department: 'Software Engineering',
        graduation_year: 2021,
        created_at: new Date('2026-01-05T09:00:00Z'),
        updated_at: new Date('2026-01-05T09:00:00Z')
      },
      {
        id: 61,
        name: 'Aylin Admin',
        email: 'aylin.admin@example.com',
        password_hash: 'scrypt:secret61',
        role: 'student',
        auth_role: 'admin',
        department: 'Management',
        graduation_year: 2020,
        created_at: new Date('2026-01-01T09:00:00Z'),
        updated_at: new Date('2026-01-01T09:00:00Z')
      }
    ];
    let nextUserId = 100;

    const jobsData = [
      {
        id: 101,
        user_id: 25,
        title: 'Senior Backend Engineer',
        company: 'CloudTech',
        location: 'Istanbul',
        description: 'Build distributed systems',
        contact_email: 'jobs@cloudtech.com',
        created_at: new Date('2026-02-01T10:00:00Z'),
        updated_at: new Date('2026-02-01T10:00:00Z')
      },
      {
        id: 102,
        user_id: 18,
        title: 'Part-Time Frontend Intern',
        company: 'CampusLab',
        location: 'Ankara',
        description: 'Assist web UI tasks',
        contact_email: 'interns@campuslab.com',
        created_at: new Date('2026-02-02T10:00:00Z'),
        updated_at: new Date('2026-02-02T10:00:00Z')
      },
      {
        id: 103,
        user_id: null,
        title: 'Legacy Unowned Role',
        company: 'Archive Corp',
        location: 'Remote',
        description: 'Legacy posting',
        contact_email: 'legacy@archive.com',
        created_at: new Date('2026-01-20T10:00:00Z'),
        updated_at: new Date('2026-01-20T10:00:00Z')
      }
    ];
    let nextJobId = 200;

    const applicationsData = [
      {
        id: 1,
        job_posting_id: 101,
        user_id: 18,
        applicant_name: 'Selin Student',
        applicant_email: 'selin.private@example.com',
        resume_url: 'https://example.com/selin.pdf',
        cover_letter: 'Interested in backend',
        status: 'PENDING',
        created_at: new Date('2026-02-10T10:00:00Z'),
        updated_at: new Date('2026-02-10T10:00:00Z')
      }
    ];

    const announcementsData = [
      {
        id: 1,
        title: 'Spring Career Fair',
        content: 'Meet alumni recruiters on campus.',
        created_at: new Date('2026-02-05T10:00:00Z'),
        updated_at: new Date('2026-02-05T10:00:00Z')
      }
    ];
    let nextAnnouncementId = 10;

    const handleQuery = async (sql, params = []) => {
      // Users queries
      if (sql.includes('FROM users ORDER BY id ASC')) {
        return [[...usersData].sort((a, b) => a.id - b.id).map((u) => ({ ...u }))];
      }
      if (sql.includes('FROM users WHERE id = ? LIMIT 1')) {
        const uid = Number(params[0]);
        const user = usersData.find((u) => u.id === uid);
        return [user ? [{ ...user }] : []];
      }
      if (sql.startsWith('INSERT INTO users (name, email)')) {
        const created = {
          id: nextUserId++,
          name: params[0],
          email: params[1],
          role: 'student',
          auth_role: 'user',
          department: null,
          graduation_year: null,
          created_at: new Date(),
          updated_at: new Date()
        };
        usersData.push(created);
        return [{ insertId: created.id }];
      }
      if (sql.startsWith('UPDATE users SET name = ?, email = ? WHERE id = ?')) {
        const uid = Number(params[2]);
        const user = usersData.find((u) => u.id === uid);
        if (!user) return [{ affectedRows: 0 }];
        user.name = params[0];
        user.email = params[1];
        user.updated_at = new Date();
        return [{ affectedRows: 1 }];
      }
      if (sql.startsWith('UPDATE users SET name = ?, department = ?, graduation_year = ? WHERE id = ?')) {
        const uid = Number(params[3]);
        const user = usersData.find((u) => u.id === uid);
        if (!user) return [{ affectedRows: 0 }];
        user.name = params[0];
        user.department = params[1];
        user.graduation_year = params[2];
        user.updated_at = new Date();
        return [{ affectedRows: 1 }];
      }
      if (sql.startsWith("SELECT id FROM users WHERE auth_role = 'admin'")) {
        return [usersData.filter((u) => u.auth_role === 'admin').map((u) => ({ id: u.id }))];
      }
      if (sql.startsWith('UPDATE applications SET user_id = NULL WHERE user_id = ?')) {
        const uid = Number(params[0]);
        let count = 0;
        for (const a of applicationsData) {
          if (a.user_id === uid) {
            a.user_id = null;
            count += 1;
          }
        }
        return [{ affectedRows: count }];
      }
      if (sql.startsWith('DELETE FROM users WHERE id = ?')) {
        const uid = Number(params[0]);
        const idx = usersData.findIndex((u) => u.id === uid);
        if (idx === -1) return [{ affectedRows: 0 }];
        usersData.splice(idx, 1);
        return [{ affectedRows: 1 }];
      }

      // Job Postings queries
      if (sql.includes('FROM job_postings ORDER BY id ASC')) {
        return [[...jobsData].sort((a, b) => a.id - b.id).map((j) => ({ ...j }))];
      }
      if (sql.includes('FROM job_postings WHERE id = ? LIMIT 1')) {
        const jid = Number(params[0]);
        const job = jobsData.find((j) => j.id === jid);
        return [job ? [{ ...job }] : []];
      }
      if (sql.includes('FROM job_postings WHERE user_id = ? ORDER BY id ASC')) {
        const uid = Number(params[0]);
        return [jobsData.filter((j) => j.user_id === uid).sort((a, b) => a.id - b.id).map((j) => ({ ...j }))];
      }
      if (sql.startsWith('INSERT INTO job_postings')) {
        const created = {
          id: nextJobId++,
          user_id: params[0] !== null && params[0] !== undefined ? Number(params[0]) : null,
          title: params[1],
          company: params[2],
          location: params[3],
          description: params[4],
          contact_email: params[5],
          created_at: new Date(),
          updated_at: new Date()
        };
        jobsData.push(created);
        return [{ insertId: created.id }];
      }
      if (sql.startsWith('UPDATE job_postings SET')) {
        const jid = Number(params[6]);
        const job = jobsData.find((j) => j.id === jid);
        if (!job) return [{ affectedRows: 0 }];
        job.user_id = params[0] !== null && params[0] !== undefined ? Number(params[0]) : null;
        job.title = params[1];
        job.company = params[2];
        job.location = params[3];
        job.description = params[4];
        job.contact_email = params[5];
        job.updated_at = new Date();
        return [{ affectedRows: 1 }];
      }
      if (sql.includes('SELECT COUNT(*) AS count FROM applications WHERE job_posting_id = ?')) {
        const jid = Number(params[0]);
        return [[{ count: applicationsData.filter((a) => a.job_posting_id === jid).length }]];
      }
      if (sql.startsWith('DELETE FROM job_postings WHERE id = ?')) {
        const jid = Number(params[0]);
        const idx = jobsData.findIndex((j) => j.id === jid);
        if (idx === -1) return [{ affectedRows: 0 }];
        jobsData.splice(idx, 1);
        return [{ affectedRows: 1 }];
      }

      // Announcements queries
      if (sql.includes('FROM announcements ORDER BY id ASC')) {
        return [[...announcementsData].sort((a, b) => a.id - b.id).map((a) => ({ ...a }))];
      }
      if (sql.includes('FROM announcements WHERE id = ? LIMIT 1')) {
        const aid = Number(params[0]);
        const ann = announcementsData.find((a) => a.id === aid);
        return [ann ? [{ ...ann }] : []];
      }
      if (sql.startsWith('INSERT INTO announcements')) {
        const created = {
          id: nextAnnouncementId++,
          title: params[0],
          content: params[1],
          created_at: new Date(),
          updated_at: new Date()
        };
        announcementsData.push(created);
        return [{ insertId: created.id }];
      }
      if (sql.startsWith('UPDATE announcements SET')) {
        const aid = Number(params[2]);
        const ann = announcementsData.find((a) => a.id === aid);
        if (!ann) return [{ affectedRows: 0 }];
        ann.title = params[0];
        ann.content = params[1];
        ann.updated_at = new Date();
        return [{ affectedRows: 1 }];
      }
      if (sql.startsWith('DELETE FROM announcements WHERE id = ?')) {
        const aid = Number(params[0]);
        const idx = announcementsData.findIndex((a) => a.id === aid);
        if (idx === -1) return [{ affectedRows: 0 }];
        announcementsData.splice(idx, 1);
        return [{ affectedRows: 1 }];
      }

      // Applications queries
      if (sql.includes('FROM applications WHERE id = ? LIMIT 1')) {
        const aid = Number(params[0]);
        const app = applicationsData.find((a) => a.id === aid);
        return [app ? [{ ...app }] : []];
      }
      if (sql.startsWith('UPDATE applications SET')) {
        const aid = Number(params[7]);
        const app = applicationsData.find((a) => a.id === aid);
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
      throw new Error(`Unexpected SQL in test_user_pages_phase3_unit: ${sql}`);
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

    const modulesToClear = [
      './src/models/userModel',
      './src/models/jobPostingModel',
      './src/models/applicationModel',
      './src/models/announcementModel',
      './src/controllers/accessHelpers',
      './src/controllers/userController',
      './src/controllers/apiUserController',
      './src/controllers/jobPostingHelpers',
      './src/controllers/jobPostingController',
      './src/controllers/apiJobPostingController',
      './src/controllers/announcementController',
      './src/controllers/apiAnnouncementController',
      './src/controllers/applicationHelpers',
      './src/controllers/applicationController',
      './src/controllers/apiApplicationController',
      './src/middlewares/mvcCsrfFactory',
      './src/middlewares/applicationCsrfMiddleware',
      './src/routes/userRoutes',
      './src/routes/apiUserRoutes',
      './src/routes/jobPostingRoutes',
      './src/routes/apiJobPostingRoutes',
      './src/routes/announcementRoutes',
      './src/routes/apiAnnouncementRoutes',
      './src/routes/applicationRoutes',
      './src/routes/apiApplicationRoutes',
      './src/views/userView',
      './src/views/userJobsView',
      './src/views/jobPostingView',
      './src/views/announcementView',
      './src/views/applicationView'
    ];
    modulesToClear.forEach((m) => {
      delete require.cache[require.resolve(m)];
    });

    const jobPostingModel = require('./src/models/jobPostingModel');
    const userModel = require('./src/models/userModel');
    const userRoutes = require('./src/routes/userRoutes');
    const apiUserRoutes = require('./src/routes/apiUserRoutes');
    const jobPostingRoutes = require('./src/routes/jobPostingRoutes');
    const apiJobPostingRoutes = require('./src/routes/apiJobPostingRoutes');
    const announcementRoutes = require('./src/routes/announcementRoutes');
    const apiAnnouncementRoutes = require('./src/routes/apiAnnouncementRoutes');
    const applicationRoutes = require('./src/routes/applicationRoutes');
    const apiApplicationRoutes = require('./src/routes/apiApplicationRoutes');

    const sessions = new Map();
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res, next) => {
      const mockUid = req.headers['x-mock-user-id'];
      const userObj = mockUid ? usersData.find((u) => u.id === Number(mockUid)) || null : null;
      req.user = userObj ? { ...userObj } : null;
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

    app.use('/users', userRoutes);
    app.use('/api/users', apiUserRoutes);
    app.use('/job-postings', jobPostingRoutes);
    app.use('/api/job-postings', apiJobPostingRoutes);
    app.use('/announcements', announcementRoutes);
    app.use('/api/announcements', apiAnnouncementRoutes);
    app.use('/applications', applicationRoutes);
    app.use('/api/applications', apiApplicationRoutes);

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', resolve);
    });

    // 1. My Job Postings (/users/:id/jobs & /api/users/:id/jobs)
    const guestUserJobs = await requestApp(server, '/users/25/jobs', 'GET', null, { accept: 'text/html' });
    assert.strictEqual(guestUserJobs.status, 302);
    assert.strictEqual(guestUserJobs.headers.location, '/login?authRequired=1');

    const s18OtherJobsHtml = await requestApp(server, '/users/25/jobs', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18' });
    assert.strictEqual(s18OtherJobsHtml.status, 403, 'Student must NOT view Alumni /users/25/jobs');

    const s18OtherJobsApi = await requestApp(server, '/api/users/25/jobs', 'GET', null, { accept: 'application/json', 'x-mock-user-id': '18' });
    assert.strictEqual(s18OtherJobsApi.status, 403);

    const s18NonExistentJobs = await requestApp(server, '/users/999999/jobs', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18' });
    assert.strictEqual(s18NonExistentJobs.status, 403, 'Cross-user non-existent ID must not allow probing');

    const s18PostOtherUserJob = await requestApp(
      server,
      '/api/users/25/jobs',
      'POST',
      { title: 'Hijacked Posting', company: 'Spoof Corp' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '18' }
    );
    assert.strictEqual(s18PostOtherUserJob.status, 403, 'Must NOT post job under another user ID');

    const a25OwnJobs = await requestApp(server, '/users/25/jobs', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '25', 'x-mock-session-id': 's25' });
    assert.strictEqual(a25OwnJobs.status, 200);
    assert(a25OwnJobs.rawBody.includes('Senior Backend Engineer'));
    assert(!a25OwnJobs.rawBody.includes('Part-Time Frontend Intern'));
    assert(a25OwnJobs.rawBody.includes('editMyJob(') && a25OwnJobs.rawBody.includes('deleteMyJob('));
    const a25JobCsrf = extractCsrf(a25OwnJobs.rawBody);
    assert(a25JobCsrf, 'My Job Postings must embed CSRF token');

    // Admin with role='student' & auth_role='admin' CAN access /users/25/jobs
    const admUserJobs = await requestApp(server, '/users/25/jobs', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '61' });
    assert.strictEqual(admUserJobs.status, 200);
    console.log('✅ 1. My Job Postings (/users/:id/jobs) ownership & Admin auth_role access verified');

    // 2. Users Directory (/users & /api/users) - Limited Read-Only for non-admins
    const guestUsers = await requestApp(server, '/users', 'GET', null, { accept: 'text/html' });
    assert.strictEqual(guestUsers.status, 302);

    const s18UsersHtml = await requestApp(server, '/users', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18' });
    assert.strictEqual(s18UsersHtml.status, 200);
    assert(!s18UsersHtml.rawBody.includes('id="userForm"'), 'Normal user must NOT see Create User form');
    assert(!s18UsersHtml.rawBody.includes('onclick="startEdit'), 'Normal user must NOT see Edit buttons on /users');
    assert(!s18UsersHtml.rawBody.includes('onclick="deleteUser'), 'Normal user must NOT see Delete buttons on /users');
    assert(!s18UsersHtml.rawBody.includes('mert.private@example.com'), 'Normal user directory must NOT expose other users emails');
    assert(!s18UsersHtml.rawBody.includes('scrypt:'), 'Directory must NEVER expose password_hash');

    const s18UsersApi = await requestApp(server, '/api/users', 'GET', null, { accept: 'application/json', 'x-mock-user-id': '18' });
    assert.strictEqual(s18UsersApi.status, 200);
    const mertInApi = s18UsersApi.body.find((u) => u.id === 25);
    assert(mertInApi && mertInApi.email === undefined && mertInApi.auth_role === undefined && mertInApi.password_hash === undefined);

    // Non-admin blocked from user creation and deletion
    const s18CreateUserApi = await requestApp(
      server,
      '/api/users',
      'POST',
      { name: 'Fake', email: 'fake@example.com' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '18' }
    );
    assert.strictEqual(s18CreateUserApi.status, 403);

    const s18DeleteOtherApi = await requestApp(server, '/api/users/25', 'DELETE', null, { accept: 'application/json', 'x-mock-user-id': '18' });
    assert.strictEqual(s18DeleteOtherApi.status, 403);

    const s18DeleteSelfApi = await requestApp(server, '/api/users/18', 'DELETE', null, { accept: 'application/json', 'x-mock-user-id': '18' });
    assert.strictEqual(s18DeleteSelfApi.status, 403);

    // Admin sees CRUD & CSRF on /users and can create/delete users
    const admUsersHtml = await requestApp(server, '/users', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '61', 'x-mock-session-id': 's61' });
    assert.strictEqual(admUsersHtml.status, 200);
    assert(admUsersHtml.rawBody.includes('id="userForm"'));
    const admUserCsrf = extractCsrf(admUsersHtml.rawBody);
    assert(admUserCsrf);

    const admMvcCreateNoCsrf = await requestApp(
      server,
      '/users',
      'POST',
      { name: 'No Csrf', email: 'nocsrf@example.com' },
      { accept: 'text/html', 'x-mock-user-id': '61', 'x-mock-session-id': 's61' }
    );
    assert.strictEqual(admMvcCreateNoCsrf.status, 403);

    const admMvcCreateOk = await requestApp(
      server,
      '/users',
      'POST',
      { name: 'Created By Admin', email: 'createdbyadmin@example.com', _csrf: admUserCsrf },
      { accept: 'text/html', 'x-mock-user-id': '61', 'x-mock-session-id': 's61' }
    );
    assert.strictEqual(admMvcCreateOk.status, 201);
    const createdAdminUser = usersData.find((u) => u.email === 'createdbyadmin@example.com');
    assert(createdAdminUser);

    const admDeleteOk = await requestApp(
      server,
      `/users/${createdAdminUser.id}`,
      'DELETE',
      null,
      { accept: 'application/json', 'x-mock-user-id': '61', 'x-mock-session-id': 's61', 'x-csrf-token': admUserCsrf }
    );
    assert.strictEqual(admDeleteOk.status, 204);
    console.log('✅ 2. Users Directory read-only privacy, Admin CRUD, and MVC CSRF verified');

    // 3. User Detail (/users/:id & /api/users/:id)
    const s18ViewMertHtml = await requestApp(server, '/users/25', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18' });
    assert.strictEqual(s18ViewMertHtml.status, 200);
    assert(s18ViewMertHtml.rawBody.includes('Mert Alumni'));
    assert(s18ViewMertHtml.rawBody.includes('Software Engineering'));
    assert(!s18ViewMertHtml.rawBody.includes('mert.private@example.com'), 'Other user detail must NOT show private email');
    assert(!s18ViewMertHtml.rawBody.includes('/users/25/jobs'), 'Other user detail must NOT show My Job Postings link');
    assert(!s18ViewMertHtml.rawBody.includes('Edit My Profile'), 'Other user detail must NOT show Edit My Profile button');
    assert(!s18ViewMertHtml.rawBody.includes('Manage in Admin Console'), 'Student must NOT see Admin Console link on detail page');

    const s18ViewSelfHtml = await requestApp(server, '/users/18', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18' });
    assert.strictEqual(s18ViewSelfHtml.status, 200);
    assert(s18ViewSelfHtml.rawBody.includes('selin.private@example.com'));
    assert(s18ViewSelfHtml.rawBody.includes('Edit My Profile'));

    const s18ViewMertApi = await requestApp(server, '/api/users/25', 'GET', null, { accept: 'application/json', 'x-mock-user-id': '18' });
    assert.strictEqual(s18ViewMertApi.status, 200);
    assert.strictEqual(s18ViewMertApi.body.email, undefined);
    assert.strictEqual(s18ViewMertApi.body.auth_role, undefined);
    assert.strictEqual(s18ViewMertApi.body.password_hash, undefined);

    const s18ViewSelfApi = await requestApp(server, '/api/users/18', 'GET', null, { accept: 'application/json', 'x-mock-user-id': '18' });
    assert.strictEqual(s18ViewSelfApi.status, 200);
    assert.strictEqual(s18ViewSelfApi.body.email, 'selin.private@example.com');

    // Cross-user update blocked; self-update cannot escalate role/auth_role
    const s18PatchOther = await requestApp(
      server,
      '/api/users/25',
      'PATCH',
      { name: 'Hacked Mert' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '18' }
    );
    assert.strictEqual(s18PatchOther.status, 403);

    const s18PatchSelfEscalate = await requestApp(
      server,
      '/api/users/18',
      'PATCH',
      { name: 'Selin Updated', department: 'AI Engineering', role: 'alumni', auth_role: 'admin', email: 'evil@example.com' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '18' }
    );
    assert.strictEqual(s18PatchSelfEscalate.status, 200);
    assert.strictEqual(s18PatchSelfEscalate.body.name, 'Selin Updated');
    assert.strictEqual(s18PatchSelfEscalate.body.department, 'AI Engineering');
    assert.strictEqual(s18PatchSelfEscalate.body.role, 'student', 'role must NOT change');
    assert.strictEqual(s18PatchSelfEscalate.body.auth_role, 'user', 'auth_role must NOT escalate');
    assert.strictEqual(s18PatchSelfEscalate.body.email, 'selin.private@example.com', 'email must NOT change via non-admin self update');
    console.log('✅ 3. User Detail privacy, self-only edit & role/auth_role immutability verified');

    // 4. Job Postings (/job-postings, /job-postings/:id, /api/job-postings/:id)
    const guestJobsList = await requestApp(server, '/job-postings', 'GET', null, { accept: 'text/html' });
    assert.strictEqual(guestJobsList.status, 200);
    assert(guestJobsList.rawBody.includes('Senior Backend Engineer'));
    assert(!guestJobsList.rawBody.includes('id="jobForm"'), 'Guest must NOT see job create form');
    assert(!guestJobsList.rawBody.includes('onclick="deleteJob'), 'Guest must NOT see Delete button');

    const guestJobDetail = await requestApp(server, '/job-postings/101', 'GET', null, { accept: 'text/html' });
    assert.strictEqual(guestJobDetail.status, 200);
    assert(!guestJobDetail.rawBody.includes('Delete This Posting'), 'Guest must NOT see Delete This Posting button');

    // Non-owner Student cannot edit or delete Alumni #25 job #101 or unowned legacy #103
    const s18EditOtherJobApi = await requestApp(
      server,
      '/api/job-postings/101',
      'PUT',
      { title: 'Tampered', company: 'Evil' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '18' }
    );
    assert.strictEqual(s18EditOtherJobApi.status, 403);

    const s18DeleteOtherJobApi = await requestApp(server, '/api/job-postings/101', 'DELETE', null, { accept: 'application/json', 'x-mock-user-id': '18' });
    assert.strictEqual(s18DeleteOtherJobApi.status, 403);

    const s18DeleteLegacyJobApi = await requestApp(server, '/api/job-postings/103', 'DELETE', null, { accept: 'application/json', 'x-mock-user-id': '18' });
    assert.strictEqual(s18DeleteLegacyJobApi.status, 403, 'Non-admin cannot delete unowned legacy job');

    // Non-admin create forces req.user.id even if body attempts to spoof user_id=25
    const s18CreateSpoofJob = await requestApp(
      server,
      '/api/job-postings',
      'POST',
      { title: 'Student Posted Role', company: 'StudyHub', user_id: 25 },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '18' }
    );
    assert.strictEqual(s18CreateSpoofJob.status, 201);
    assert.strictEqual(s18CreateSpoofJob.body.user_id, 18, 'POST /api/job-postings must force req.user.id for non-admin');

    // Owner Alumni #25 CAN edit & delete own posting via MVC with CSRF (and fails without CSRF)
    const a25EditJobNoCsrf = await requestApp(
      server,
      '/job-postings/101',
      'PUT',
      { title: 'No Csrf Edit', company: 'CloudTech' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '25', 'x-mock-session-id': 's25' }
    );
    assert.strictEqual(a25EditJobNoCsrf.status, 403);

    const a25EditJobWithCsrf = await requestApp(
      server,
      `/job-postings/${s18CreateSpoofJob.body.id}`,
      'DELETE',
      null,
      { accept: 'application/json', 'x-mock-user-id': '25', 'x-mock-session-id': 's25', 'x-csrf-token': a25JobCsrf }
    );
    assert.strictEqual(a25EditJobWithCsrf.status, 403, 'Alumni #25 cannot delete Student #18 job even with valid CSRF');

    // Student #18 can edit/delete own created job via MVC with valid CSRF, and cannot reassign user_id
    const s18JobsList = await requestApp(server, '/job-postings', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 's18' });
    const s18JobCsrf = extractCsrf(s18JobsList.rawBody);
    assert(s18JobCsrf);

    const s18PatchOwnJob = await requestApp(
      server,
      `/job-postings/${s18CreateSpoofJob.body.id}`,
      'PATCH',
      { title: 'Updated By Owner', user_id: 25, _csrf: s18JobCsrf },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '18', 'x-mock-session-id': 's18' }
    );
    assert.strictEqual(s18PatchOwnJob.status, 200);
    assert.strictEqual(s18PatchOwnJob.body.title, 'Updated By Owner');
    assert.strictEqual(s18PatchOwnJob.body.user_id, 18, 'Owner cannot transfer job user_id');

    const s18DeleteOwnJob = await requestApp(
      server,
      `/job-postings/${s18CreateSpoofJob.body.id}`,
      'DELETE',
      null,
      { accept: 'application/json', 'x-mock-user-id': '18', 'x-mock-session-id': 's18', 'x-csrf-token': s18JobCsrf }
    );
    assert.strictEqual(s18DeleteOwnJob.status, 204);

    // Admin can delete legacy unowned job #103
    const admDeleteLegacy = await requestApp(server, '/api/job-postings/103', 'DELETE', null, { accept: 'application/json', 'x-mock-user-id': '61' });
    assert.strictEqual(admDeleteLegacy.status, 204);

    // Strict ID checks in models
    assert.strictEqual(await jobPostingModel.getJobPostingById(true), null);
    assert.strictEqual(await jobPostingModel.deleteJobPosting([1]), false);
    assert.strictEqual(await userModel.getDirectoryUserById(true), null);
    console.log('✅ 4. Job Postings ownership, CSRF, user_id lock & strict model ID checks verified');

    // 5. Application Detail (/applications/:id) preserved
    const s18AppDetail = await requestApp(server, '/applications/1', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18' });
    assert.strictEqual(s18AppDetail.status, 200);
    assert(!s18AppDetail.rawBody.includes('id="statusForm"'), 'Applicant must NOT see status update form');

    const s18SelfApprove = await requestApp(
      server,
      '/api/applications/1',
      'PATCH',
      { status: 'ACCEPTED' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '18' }
    );
    assert.strictEqual(s18SelfApprove.status, 403, 'Applicant must NOT change own status');

    const a25ReviewApp = await requestApp(
      server,
      '/api/applications/1',
      'PATCH',
      { status: 'REVIEWING' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '25' }
    );
    assert.strictEqual(a25ReviewApp.status, 200);
    assert.strictEqual(a25ReviewApp.body.status, 'REVIEWING');
    console.log('✅ 5. Application Detail permissions & anti-self-status preserved');

    // 6. MVC POST /job-postings CSRF & user_id spoofing
    const mvcJobNoCsrf = await requestApp(
      server,
      '/job-postings',
      'POST',
      { title: 'MVC Job No CSRF', company: 'Test Co' },
      { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 's18' }
    );
    assert.strictEqual(mvcJobNoCsrf.status, 403, 'MVC POST /job-postings without CSRF must return 403');

    const mvcJobBadCsrf = await requestApp(
      server,
      '/job-postings',
      'POST',
      { title: 'MVC Job Bad CSRF', company: 'Test Co', _csrf: 'wrong-token' },
      { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 's18' }
    );
    assert.strictEqual(mvcJobBadCsrf.status, 403, 'MVC POST /job-postings with invalid CSRF must return 403');

    const mvcJobValidCsrfSpoof = await requestApp(
      server,
      '/job-postings',
      'POST',
      { title: 'MVC Job Valid', company: 'Real Co', user_id: '25', _csrf: s18JobCsrf },
      { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 's18' }
    );
    assert.strictEqual(mvcJobValidCsrfSpoof.status, 201);
    const createdMvcJob = jobsData.find((j) => j.title === 'MVC Job Valid');
    assert(createdMvcJob && createdMvcJob.user_id === 18, 'MVC POST /job-postings must force req.user.id despite spoofed user_id');
    console.log('✅ 6. MVC POST /job-postings CSRF & user_id spoofing prevention verified');

    // 7. MVC PUT & PATCH /users/:id CSRF enforcement (self + Admin)
    const s18UsersForCsrf = await requestApp(server, '/users', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 's18-u' });
    assert.strictEqual(s18UsersForCsrf.status, 200);
    // Obtain student userCsrfToken from session directly via authenticated /users/:id? No, non-admin HTML hides userForm,
    // so check missing/invalid/cross-session CSRF rejection on PUT & PATCH /users/:id, plus Admin PUT & PATCH with valid CSRF!
    const s18MvcPutNoCsrf = await requestApp(
      server,
      '/users/18',
      'PUT',
      { name: 'No Csrf Put', department: 'CS' },
      { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 's18-u' }
    );
    assert.strictEqual(s18MvcPutNoCsrf.status, 403, 'MVC PUT /users/:id without CSRF must return 403');

    const s18MvcPatchInvalidCsrf = await requestApp(
      server,
      '/users/18',
      'PATCH',
      { name: 'Bad Csrf Patch', _csrf: 'bad-token' },
      { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 's18-u' }
    );
    assert.strictEqual(s18MvcPatchInvalidCsrf.status, 403, 'MVC PATCH /users/:id with invalid CSRF must return 403');

    const s18MvcPatchCrossSession = await requestApp(
      server,
      '/users/18',
      'PATCH',
      { name: 'Cross Session', _csrf: admUserCsrf },
      { accept: 'text/html', 'x-mock-user-id': '18', 'x-mock-session-id': 's18-u' }
    );
    assert.strictEqual(s18MvcPatchCrossSession.status, 403, 'Cross-session CSRF token on PATCH /users/:id must return 403');

    const admMvcPutUserNoCsrf = await requestApp(
      server,
      '/users/25',
      'PUT',
      { name: 'Mert No CSRF', email: 'mert.private@example.com' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '61', 'x-mock-session-id': 's61' }
    );
    assert.strictEqual(admMvcPutUserNoCsrf.status, 403);

    const admMvcPutUserOk = await requestApp(
      server,
      '/users/25',
      'PUT',
      { name: 'Mert PUT OK', email: 'mert.private@example.com', _csrf: admUserCsrf },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '61', 'x-mock-session-id': 's61' }
    );
    assert.strictEqual(admMvcPutUserOk.status, 200);
    assert.strictEqual(admMvcPutUserOk.body.name, 'Mert PUT OK');

    const admMvcPatchUserOk = await requestApp(
      server,
      '/users/25',
      'PATCH',
      { name: 'Mert Alumni' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '61', 'x-mock-session-id': 's61', 'x-csrf-token': admUserCsrf }
    );
    assert.strictEqual(admMvcPatchUserOk.status, 200);
    assert.strictEqual(admMvcPatchUserOk.body.name, 'Mert Alumni');
    console.log('✅ 7. MVC PUT & PATCH /users/:id CSRF enforcement verified');

    // 8. MVC & API job posting PATCH invalid company validation
    const invalidCompanies = ['', '   ', ['ArrayCo'], { name: 'ObjCo' }, 12345, true, null, 'C'.repeat(256)];
    for (const badCompany of invalidCompanies) {
      const apiPatchBadCo = await requestApp(
        server,
        '/api/job-postings/101',
        'PATCH',
        { company: badCompany },
        { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '25' }
      );
      assert.strictEqual(apiPatchBadCo.status, 400, `API PATCH must reject invalid company: ${JSON.stringify(badCompany)}`);

      const mvcPatchBadCo = await requestApp(
        server,
        '/job-postings/101',
        'PATCH',
        { company: badCompany, _csrf: a25JobCsrf },
        { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '25', 'x-mock-session-id': 's25' }
      );
      assert.strictEqual(mvcPatchBadCo.status, 400, `MVC PATCH must reject invalid company: ${JSON.stringify(badCompany)}`);
    }
    const validPatchCo = await requestApp(
      server,
      '/api/job-postings/101',
      'PATCH',
      { company: 'CloudTech Global' },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '25' }
    );
    assert.strictEqual(validPatchCo.status, 200);
    assert.strictEqual(validPatchCo.body.company, 'CloudTech Global');
    console.log('✅ 8. MVC & API job posting PATCH company validation verified');

    // 9. Admin job posting create invalid user_id validation
    const admJobsPage = await requestApp(server, '/job-postings', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '61', 'x-mock-session-id': 's61-j' });
    const admJobCsrf = extractCsrf(admJobsPage.rawBody);
    assert(admJobCsrf);

    const invalidAdminUserIds = [true, false, [1], { id: 1 }, -5, 0, 1.5, 'notanid', '1abc'];
    for (const badUid of invalidAdminUserIds) {
      const apiBadUid = await requestApp(
        server,
        '/api/job-postings',
        'POST',
        { title: 'Admin Job', company: 'AdminCo', user_id: badUid },
        { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '61' }
      );
      assert.strictEqual(apiBadUid.status, 400, `API Admin POST must reject invalid user_id=${JSON.stringify(badUid)} with 400`);

      const mvcBadUid = await requestApp(
        server,
        '/job-postings',
        'POST',
        { title: 'Admin Job', company: 'AdminCo', user_id: badUid, _csrf: admJobCsrf },
        { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '61', 'x-mock-session-id': 's61-j' }
      );
      assert.strictEqual(mvcBadUid.status, 400, `MVC Admin POST must reject invalid user_id=${JSON.stringify(badUid)} with 400`);
    }

    const admExplicitNullUid = await requestApp(
      server,
      '/api/job-postings',
      'POST',
      { title: 'Admin Unowned Job', company: 'AdminCo', user_id: null },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '61' }
    );
    assert.strictEqual(admExplicitNullUid.status, 201);
    assert.strictEqual(admExplicitNullUid.body.user_id, null);
    console.log('✅ 9. Admin job posting invalid user_id 400 validation & explicit null verified');

    // 10. Announcements Security (Guest, Student, Alumni, Admin across MVC & API + CSRF)
    for (const [label, uid] of [['Guest', null], ['Student', '18'], ['Alumni', '25']]) {
      const headers = uid ? { accept: 'text/html', 'x-mock-user-id': uid } : { accept: 'text/html' };
      const listRes = await requestApp(server, '/announcements', 'GET', null, headers);
      assert.strictEqual(listRes.status, 200, `${label} must be able to read /announcements`);
      assert(listRes.rawBody.includes('Spring Career Fair'));
      assert(!listRes.rawBody.includes('id="announcementForm"'), `${label} must NOT see announcement create form`);
      assert(!listRes.rawBody.includes('onclick="deleteAnnouncement'), `${label} must NOT see Delete button`);

      const detailRes = await requestApp(server, '/announcements/1', 'GET', null, headers);
      assert.strictEqual(detailRes.status, 200, `${label} must be able to read /announcements/1`);
      assert(!detailRes.rawBody.includes('Duyuruyu Sil'), `${label} detail page must NOT show Delete button`);
    }

    // Guest mutations blocked cleanly
    const guestAnnPostMvc = await requestApp(server, '/announcements', 'POST', { title: 'G', content: 'C' }, { accept: 'text/html' });
    assert.strictEqual(guestAnnPostMvc.status, 302);
    const guestAnnPostApi = await requestApp(server, '/api/announcements', 'POST', { title: 'G', content: 'C' }, { 'Content-Type': 'application/json', accept: 'application/json' });
    assert.strictEqual(guestAnnPostApi.status, 401);

    // Student & Alumni blocked with 403 across MVC & API POST, PUT, PATCH, DELETE
    for (const [roleName, uid] of [['Student', '18'], ['Alumni', '25']]) {
      for (const [method, mvcPath, apiPath, body] of [
        ['POST', '/announcements', '/api/announcements', { title: 'X', content: 'Y' }],
        ['PUT', '/announcements/1', '/api/announcements/1', { title: 'X', content: 'Y' }],
        ['PATCH', '/announcements/1', '/api/announcements/1', { title: 'X' }],
        ['DELETE', '/announcements/1', '/api/announcements/1', null]
      ]) {
        const mvcForbidden = await requestApp(server, mvcPath, method, body, { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': uid });
        assert.strictEqual(mvcForbidden.status, 403, `${roleName} must receive 403 on MVC ${method} ${mvcPath}`);

        const apiForbidden = await requestApp(server, apiPath, method, body, { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': uid });
        assert.strictEqual(apiForbidden.status, 403, `${roleName} must receive 403 on API ${method} ${apiPath}`);
      }
    }

    // Admin MVC CSRF + CRUD + API CRUD
    const admAnnPage = await requestApp(server, '/announcements', 'GET', null, { accept: 'text/html', 'x-mock-user-id': '61', 'x-mock-session-id': 's61-ann' });
    assert.strictEqual(admAnnPage.status, 200);
    assert(admAnnPage.rawBody.includes('id="announcementForm"'));
    const admAnnCsrf = extractCsrf(admAnnPage.rawBody);
    assert(admAnnCsrf);

    const admAnnNoCsrf = await requestApp(server, '/announcements', 'POST', { title: 'No Csrf', content: 'Body' }, { accept: 'text/html', 'x-mock-user-id': '61', 'x-mock-session-id': 's61-ann' });
    assert.strictEqual(admAnnNoCsrf.status, 403);

    const admAnnCreateMvc = await requestApp(
      server,
      '/announcements',
      'POST',
      { title: 'Admin Bulletin MVC', content: 'Created via MVC CSRF', _csrf: admAnnCsrf },
      { accept: 'text/html', 'x-mock-user-id': '61', 'x-mock-session-id': 's61-ann' }
    );
    assert.strictEqual(admAnnCreateMvc.status, 201);
    const createdAnn = announcementsData.find((a) => a.title === 'Admin Bulletin MVC');
    assert(createdAnn);

    const admAnnPatchMvc = await requestApp(
      server,
      `/announcements/${createdAnn.id}`,
      'PATCH',
      { title: 'Admin Bulletin Updated', _csrf: admAnnCsrf },
      { 'Content-Type': 'application/json', accept: 'application/json', 'x-mock-user-id': '61', 'x-mock-session-id': 's61-ann' }
    );
    assert.strictEqual(admAnnPatchMvc.status, 200);
    assert.strictEqual(admAnnPatchMvc.body.title, 'Admin Bulletin Updated');

    const admAnnDeleteApi = await requestApp(
      server,
      `/api/announcements/${createdAnn.id}`,
      'DELETE',
      null,
      { accept: 'application/json', 'x-mock-user-id': '61' }
    );
    assert.strictEqual(admAnnDeleteApi.status, 204);
    console.log('✅ 10. Announcements Admin-only RBAC, CSRF & Public Read verified');
  } finally {
    if (server) {
      await new Promise((r) => server.close(r));
    }
    db.getPool = originalGetPool;
  }

  console.log('\n🎉 ALL TASK 7 PHASE 3 USER-SPECIFIC PAGES UNIT TESTS PASSED! 🎉\n');
}

runPhase3Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ TASK 7 PHASE 3 UNIT TEST FAILED:', err);
    process.exit(1);
  });
