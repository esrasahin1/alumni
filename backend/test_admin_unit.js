const assert = require('assert');
const db = require('./src/config/db');
const { requireAdmin } = require('./src/middlewares/requireAdminMiddleware');
const { adminCsrfProtection } = require('./src/middlewares/adminCsrfMiddleware');
const { renderHomePage } = require('./src/views/homeView');
const { renderAboutPage } = require('./src/views/aboutView');
const { renderUsersPage } = require('./src/views/userView');
const { renderAnnouncementsPage } = require('./src/views/announcementView');
const { renderJobPostingsPage } = require('./src/views/jobPostingView');
const { renderApplicationsPage } = require('./src/views/applicationView');
const { renderUserJobsPage } = require('./src/views/userJobsView');
const { renderLoginPage } = require('./src/views/authView');
const {
  renderAdminDashboard,
  renderAdminUsersPage,
  renderAdminApplicationsPage,
  renderAdminErrorPage
} = require('./src/views/adminView');
const {
  validateAdminUserPayload,
  validateAnnouncementPayload,
  validateApplicationPayload
} = require('./src/controllers/adminHelpers');

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    locals: {},
    body: null,
    redirectUrl: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    type(t) {
      this.headers['content-type'] = t;
      return this;
    },
    setHeader(k, v) {
      this.headers[k] = v;
    },
    json(b) {
      this.body = b;
      return this;
    },
    send(b) {
      this.body = b;
      return this;
    },
    redirect(u) {
      this.redirectUrl = u;
      return this;
    }
  };
}

async function runOfflineUnitTests() {
  console.log('\n🧪 Running Offline Admin Panel Unit Tests (No DB Mutations)...\n');

  // 1. requireAdmin authorization tests
  {
    const rUnauthApi = mockRes();
    requireAdmin(
      { originalUrl: '/api/admin/summary', headers: { accept: 'application/json' }, user: null },
      rUnauthApi,
      () => assert.fail('Unauth API must not call next')
    );
    assert.strictEqual(rUnauthApi.statusCode, 401);

    const rUnauthHtml = mockRes();
    requireAdmin(
      { originalUrl: '/admin', headers: { accept: 'text/html' }, user: null },
      rUnauthHtml,
      () => assert.fail('Unauth HTML must not call next')
    );
    assert.strictEqual(rUnauthHtml.redirectUrl, '/login?authRequired=1');

    const rUserApi = mockRes();
    requireAdmin(
      { originalUrl: '/api/admin/users', headers: { accept: 'application/json' }, user: { id: 1, auth_role: 'user' } },
      rUserApi,
      () => assert.fail('Non-admin API must not call next')
    );
    assert.strictEqual(rUserApi.statusCode, 403);

    const rUserHtml = mockRes();
    requireAdmin(
      { originalUrl: '/admin/users', headers: { accept: 'text/html' }, user: { id: 1, name: 'Std', email: 's@e.com', auth_role: 'user' } },
      rUserHtml,
      () => assert.fail('Non-admin HTML must not call next')
    );
    assert.strictEqual(rUserHtml.statusCode, 403);
    assert(rUserHtml.body.includes('403 Forbidden'));

    let allowed = false;
    requireAdmin(
      { originalUrl: '/admin', headers: { accept: 'text/html' }, user: { id: 2, auth_role: 'admin' } },
      mockRes(),
      () => {
        allowed = true;
      }
    );
    assert.strictEqual(allowed, true);
    console.log('✅ 1. requireAdmin (401/302/403/next) verified');
  }

  // 2. Admin CSRF protection tests
  {
    const session = {};
    const resGet = mockRes();
    let getNext = false;
    const reqGet = { method: 'GET', session, user: { id: 2, auth_role: 'admin' } };
    adminCsrfProtection(reqGet, resGet, () => {
      getNext = true;
    });
    assert.strictEqual(getNext, true);
    assert(typeof reqGet.adminCsrfToken === 'string' && reqGet.adminCsrfToken.length >= 64);

    const resBadPost = mockRes();
    adminCsrfProtection(
      { method: 'POST', session, body: { _csrf: 'wrong-token' }, user: { id: 2, auth_role: 'admin' } },
      resBadPost,
      () => assert.fail('Invalid CSRF must not call next')
    );
    assert.strictEqual(resBadPost.statusCode, 403);
    assert(resBadPost.body.includes('Invalid CSRF Token'));

    let postNext = false;
    adminCsrfProtection(
      { method: 'POST', session, body: { _csrf: reqGet.adminCsrfToken }, user: { id: 2, auth_role: 'admin' } },
      mockRes(),
      () => {
        postNext = true;
      }
    );
    assert.strictEqual(postNext, true);
    console.log('✅ 2. adminCsrfProtection token lifecycle & 403 rejection verified');
  }

  // 3. Conditional Admin Panel nav link across ALL 9 view contexts
  {
    const stdUser = { id: 1, name: 'Student User', email: 's@u.edu', auth_role: 'user' };
    const admUser = { id: 2, name: 'Admin User', email: 'a@u.edu', auth_role: 'admin' };

    const viewsForUser = [
      ['homeView', (u) => renderHomePage(u)],
      ['aboutView', (u) => renderAboutPage(u)],
      ['userView', (u) => renderUsersPage([], u)],
      ['announcementView', (u) => renderAnnouncementsPage([], u)],
      ['jobPostingView', (u) => renderJobPostingsPage([], u)],
      ['applicationView', (u) => renderApplicationsPage([], { currentUser: u })],
      ['userJobsView', (u) => renderUserJobsPage({ id: 1, name: 'Bob', email: 'b@u.edu' }, [], u)],
      ['authView', (u) => renderLoginPage({ currentUser: u })]
    ];

    for (const [name, renderer] of viewsForUser) {
      assert(!renderer(null).includes('href="/admin"'), `${name} guest must NOT see Admin Panel link`);
      assert(!renderer(stdUser).includes('href="/admin"'), `${name} standard user must NOT see Admin Panel link`);
      assert(renderer(admUser).includes('href="/admin"'), `${name} admin MUST see Admin Panel link`);
    }
    console.log('✅ 3. Conditional Admin Panel link verified across all 9 view contexts');
  }

  // 4. Admin views XSS escaping, CSRF tokens, job_title rendering & error view
  {
    const token = 'test-csrf-token-123456';
    const admUser = { id: 2, name: '<script>xss</script>', email: 'a@u.edu', auth_role: 'admin' };
    const dashHtml = renderAdminDashboard({
      counts: { users: 5, admins: 1, announcements: 2, jobPostings: 3, applications: 4, pendingApplications: 1 },
      currentUser: admUser
    });
    assert(dashHtml.includes('&lt;script&gt;xss&lt;/script&gt;'));
    assert(!dashHtml.includes('<script>xss</script>'));

    const usersHtml = renderAdminUsersPage({ users: [], currentUser: admUser, csrfToken: token });
    assert(usersHtml.includes(`name="_csrf" value="${token}"`));

    const appsHtml = renderAdminApplicationsPage({
      applications: [
        {
          id: 9,
          job_posting_id: 4,
          job_title: 'Staff Engineer',
          job_company: 'Midnight Corp',
          applicant_name: 'Applicant One',
          applicant_email: 'one@example.com',
          status: 'PENDING'
        }
      ],
      currentUser: admUser,
      csrfToken: token
    });
    assert(appsHtml.includes('Staff Engineer') && appsHtml.includes('Midnight Corp'));

    const errHtml = renderAdminErrorPage({
      statusCode: 404,
      title: 'User Not Found',
      message: 'User #99 does not exist.',
      currentUser: admUser
    });
    assert(errHtml.includes('HTTP 404') && errHtml.includes('User #99 does not exist.'));
    console.log('✅ 4. Admin views XSS escaping, CSRF hidden inputs, job_title & error view verified');
  }

  // 5. Admin helper validations (URL, lengths, fields)
  {
    const badUser = validateAdminUserPayload(
      { name: 'A'.repeat(256), email: 'invalid', password: '123', auth_role: 'root', department: 'D'.repeat(151) },
      { isCreate: true }
    );
    assert.strictEqual(badUser.isValid, false);
    assert(badUser.errors.name && badUser.errors.email && badUser.errors.password && badUser.errors.auth_role && badUser.errors.department);

    const goodAnn = validateAnnouncementPayload({ title: 'Notice', content: 'Body' });
    assert.strictEqual(goodAnn.isValid, true);

    const badResume = await validateApplicationPayload({
      job_posting_id: '',
      applicant_name: 'Jane',
      applicant_email: 'jane@example.com',
      resume_url: 'javascript:alert(1)'
    });
    assert.strictEqual(badResume.isValid, false);
    assert(badResume.errors.resume_url);
    console.log('✅ 5. Admin validation rules (URL protocol, field lengths, roles) verified');
  }

  // 6. Transactional model unit tests (mocked pool/connection) for Single Admin + Delete Guards
  {
    const originalGetPool = db.getPool;
    try {
      let rolledBack = false;
      let committed = false;
      let activeHandler = null;
      db.getPool = async () => ({
        getConnection: async () => ({
          beginTransaction: async () => {},
          query: (...args) => activeHandler(...args),
          rollback: async () => {
            rolledBack = true;
          },
          commit: async () => {
            committed = true;
          },
          release: () => {}
        }),
        query: (...args) => activeHandler(...args)
      });

      delete require.cache[require.resolve('./src/models/userModel')];
      delete require.cache[require.resolve('./src/models/jobPostingModel')];
      const userModelMocked = require('./src/models/userModel');
      const jobModelMocked = require('./src/models/jobPostingModel');

      activeHandler = async (sql) => {
        if (sql.includes("auth_role = 'admin' FOR UPDATE")) {
          return [[{ id: 10, email: 'sole@u.edu' }]];
        }
        if (sql.includes('WHERE id = ? LIMIT 1 FOR UPDATE')) {
          return [[{ id: 10, name: 'Sole', email: 'sole@u.edu', role: 'alumni', auth_role: 'admin', department: null, graduation_year: null }]];
        }
        return [[]];
      };

      // 6a. Blocking second admin creation
      await assert.rejects(
        () =>
          userModelMocked.createUserAdmin({
            name: 'Second',
            email: 'second@u.edu',
            password_hash: 'scrypt$16384$8$1$00000000000000000000000000000000$' + 'a'.repeat(128),
            auth_role: 'admin'
          }),
        (err) => err.code === 'SINGLE_ADMIN_EXISTS'
      );

      // 6b. Blocking demoting sole admin inside transaction
      rolledBack = false;
      await assert.rejects(
        () => userModelMocked.updateUserAdmin(10, { auth_role: 'user' }),
        (err) => err.code === 'CANNOT_DEMOTE_LAST_ADMIN'
      );
      assert.strictEqual(rolledBack, true);

      // 6c. Blocking deleting sole admin via legacy deleteUser
      rolledBack = false;
      await assert.rejects(
        () => userModelMocked.deleteUser(10),
        (err) => err.code === 'CANNOT_DELETE_LAST_ADMIN'
      );
      assert.strictEqual(rolledBack, true);

      // 6d. Blocking CLI promotion when another admin exists
      activeHandler = async (sql) => {
        if (sql.includes("auth_role = 'admin' FOR UPDATE")) {
          return [[{ id: 10, email: 'sole@u.edu' }]];
        }
        if (sql.includes('WHERE email = ? LIMIT 1 FOR UPDATE')) {
          return [[{ id: 11, name: 'Other', email: 'other@u.edu', password_hash: 'hash', role: 'student', auth_role: 'user' }]];
        }
        return [[]];
      };
      await assert.rejects(
        () => userModelMocked.promoteUserToAdminByEmail('other@u.edu'),
        (err) => err.code === 'SINGLE_ADMIN_EXISTS'
      );

      // 6e. Blocking job posting deletion when applications exist
      rolledBack = false;
      activeHandler = async (sql) => {
        if (sql.includes('FROM job_postings WHERE id = ? LIMIT 1 FOR UPDATE')) {
          return [[{ id: 5 }]];
        }
        if (sql.includes('FROM applications WHERE job_posting_id = ? FOR UPDATE')) {
          return [[{ count: 2 }]];
        }
        return [[]];
      };
      await assert.rejects(
        () => jobModelMocked.deleteJobPosting(5),
        (err) => err.code === 'JOB_HAS_APPLICATIONS' && err.count === 2
      );
      assert.strictEqual(rolledBack, true);

      // 6f. Allowing non-admin deletion and detaching applications inside transaction
      committed = false;
      const queriesSeen = [];
      activeHandler = async (sql) => {
        queriesSeen.push(sql);
        if (sql.includes('WHERE id = ? LIMIT 1 FOR UPDATE')) {
          return [[{ id: 12, auth_role: 'user' }]];
        }
        if (sql.includes('UPDATE applications SET user_id = NULL')) {
          return [{ affectedRows: 3 }];
        }
        if (sql.includes('DELETE FROM users WHERE id = ?')) {
          return [{ affectedRows: 1 }];
        }
        return [[]];
      };
      const delRes = await userModelMocked.deleteUserAdmin(12);
      assert.strictEqual(delRes.deleted, true);
      assert.strictEqual(delRes.detachedApplicationsCount, 3);
      assert.strictEqual(committed, true);
      assert(queriesSeen.some((q) => q.includes('UPDATE applications SET user_id = NULL')));
      console.log('✅ 6. Transactional single-admin & FK-safe delete unit assertions verified');

      // 7. Transactional Application Create / Update / Concurrent Delete Locking Tests
      delete require.cache[require.resolve('./src/models/applicationModel')];
      const appModelMocked = require('./src/models/applicationModel');

      // 7a. Application creation when job posting exists (FOR SHARE + guest user_id = NULL)
      committed = false;
      rolledBack = false;
      const createQueries = [];
      activeHandler = async (sql, params) => {
        createQueries.push(sql);
        if (sql.includes('FROM job_postings WHERE id = ? LIMIT 1 FOR SHARE')) {
          return [[{ id: params[0] }]];
        }
        if (sql.includes('INSERT INTO applications')) {
          assert.strictEqual(params[0], 5);
          assert.strictEqual(params[1], null, 'Guest user_id must remain NULL');
          return [{ insertId: 77 }];
        }
        if (sql.includes('FROM applications WHERE id = ? LIMIT 1')) {
          return [[{
            id: 77,
            job_posting_id: 5,
            user_id: null,
            applicant_name: 'Guest Applicant',
            applicant_email: 'guest@example.com',
            resume_url: null,
            cover_letter: null,
            status: 'PENDING',
            created_at: new Date(),
            updated_at: new Date()
          }]];
        }
        return [[]];
      };
      const guestApp = await appModelMocked.createApplication({
        job_posting_id: 5,
        applicant_name: 'Guest Applicant',
        applicant_email: 'guest@example.com'
      });
      assert.strictEqual(guestApp.id, 77);
      assert.strictEqual(guestApp.user_id, null);
      assert.strictEqual(committed, true);
      assert(createQueries.some((q) => q.includes('FOR SHARE')));

      // 7b. Application creation when job posting does not exist -> rolled back + JOB_POSTING_NOT_FOUND
      rolledBack = false;
      activeHandler = async (sql) => {
        if (sql.includes('FROM job_postings WHERE id = ? LIMIT 1 FOR SHARE')) {
          return [[]];
        }
        return [[]];
      };
      await assert.rejects(
        () => appModelMocked.createApplication({ job_posting_id: 999, applicant_name: 'A', applicant_email: 'a@b.com' }),
        (err) => err.code === 'JOB_POSTING_NOT_FOUND'
      );
      assert.strictEqual(rolledBack, true);

      // 7c. Application update with valid target job posting -> FOR SHARE precedes FOR UPDATE
      committed = false;
      const updateOrder = [];
      activeHandler = async (sql, params) => {
        updateOrder.push(sql);
        if (sql.includes('FROM job_postings WHERE id = ? LIMIT 1 FOR SHARE')) {
          return [[{ id: params[0] }]];
        }
        if (sql.includes('FROM applications WHERE id = ? LIMIT 1 FOR UPDATE')) {
          return [[{
            id: 77,
            job_posting_id: 5,
            user_id: null,
            applicant_name: 'Guest Applicant',
            applicant_email: 'guest@example.com',
            resume_url: null,
            cover_letter: null,
            status: 'PENDING',
            created_at: new Date(),
            updated_at: new Date()
          }]];
        }
        if (sql.includes('UPDATE applications SET')) {
          assert.strictEqual(params[0], 8);
          return [{ affectedRows: 1 }];
        }
        if (sql.includes('FROM applications WHERE id = ? LIMIT 1')) {
          return [[{
            id: 77,
            job_posting_id: 8,
            user_id: null,
            applicant_name: 'Guest Applicant',
            applicant_email: 'guest@example.com',
            resume_url: null,
            cover_letter: null,
            status: 'REVIEWING',
            created_at: new Date(),
            updated_at: new Date()
          }]];
        }
        return [[]];
      };
      const updatedApp = await appModelMocked.updateApplication(77, {
        job_posting_id: 8,
        applicant_name: 'Guest Applicant',
        applicant_email: 'guest@example.com',
        status: 'REVIEWING'
      });
      assert.strictEqual(updatedApp.job_posting_id, 8);
      assert.strictEqual(committed, true);
      const jobLockIdx = updateOrder.findIndex((q) => q.includes('FOR SHARE'));
      const appLockIdx = updateOrder.findIndex((q) => q.includes('FOR UPDATE'));
      assert(jobLockIdx !== -1 && appLockIdx !== -1 && jobLockIdx < appLockIdx, 'Parent FOR SHARE must precede child FOR UPDATE');

      // 7d. Application update when target posting does not exist -> rolled back + JOB_POSTING_NOT_FOUND
      rolledBack = false;
      activeHandler = async (sql) => {
        if (sql.includes('FROM job_postings WHERE id = ? LIMIT 1 FOR SHARE')) {
          return [[]];
        }
        return [[]];
      };
      await assert.rejects(
        () => appModelMocked.patchApplication(77, { job_posting_id: 404 }),
        (err) => err.code === 'JOB_POSTING_NOT_FOUND'
      );
      assert.strictEqual(rolledBack, true);

      // 7e. Concurrent createApplication + deleteJobPosting simulation under S/X lock semantics (both orders -> 0 orphans)
      for (const firstOp of ['create', 'delete']) {
        const jobStore = new Map([[20, { id: 20, title: 'Concurrent Role' }]]);
        const appStore = [];
        let nextAppId = 1;
        let lockHeldBy = null;
        const lockWaiters = [];

        const acquireJobLock = async (mode, txId) => {
          while (lockHeldBy && (lockHeldBy.mode === 'X' || mode === 'X') && lockHeldBy.txId !== txId) {
            await new Promise((resolve) => lockWaiters.push(resolve));
          }
          lockHeldBy = { mode, txId };
        };
        const releaseJobLock = (txId) => {
          if (lockHeldBy && lockHeldBy.txId === txId) {
            lockHeldBy = null;
            while (lockWaiters.length > 0) {
              const fn = lockWaiters.shift();
              fn();
            }
          }
        };

        let txCounter = 0;
        db.getPool = async () => ({
          getConnection: async () => {
            const txId = ++txCounter;
            let pendingDelete = false;
            let pendingInsert = null;
            return {
              beginTransaction: async () => {},
              query: async (sql, params) => {
                if (sql.includes('FROM job_postings WHERE id = ? LIMIT 1 FOR UPDATE')) {
                  await acquireJobLock('X', txId);
                  const row = jobStore.get(params[0]);
                  return [row ? [row] : []];
                }
                if (sql.includes('FROM job_postings WHERE id = ? LIMIT 1 FOR SHARE')) {
                  await acquireJobLock('S', txId);
                  if (firstOp === 'create') {
                    await new Promise((r) => setTimeout(r, 10));
                  }
                  const row = jobStore.get(params[0]);
                  return [row ? [row] : []];
                }
                if (sql.includes('FROM applications WHERE job_posting_id = ? FOR UPDATE')) {
                  const count = appStore.filter((a) => a.job_posting_id === params[0]).length;
                  return [[{ count }]];
                }
                if (sql.includes('DELETE FROM job_postings WHERE id = ?')) {
                  pendingDelete = params[0];
                  return [{ affectedRows: jobStore.has(params[0]) ? 1 : 0 }];
                }
                if (sql.includes('INSERT INTO applications')) {
                  pendingInsert = {
                    id: nextAppId++,
                    job_posting_id: params[0],
                    user_id: params[1],
                    applicant_name: params[2],
                    applicant_email: params[3],
                    resume_url: params[4],
                    cover_letter: params[5],
                    status: params[6],
                    created_at: new Date(),
                    updated_at: new Date()
                  };
                  return [{ insertId: pendingInsert.id }];
                }
                if (sql.includes('FROM applications WHERE id = ? LIMIT 1')) {
                  return [pendingInsert ? [pendingInsert] : []];
                }
                return [[]];
              },
              commit: async () => {
                if (pendingDelete !== false) {
                  jobStore.delete(pendingDelete);
                }
                if (pendingInsert) {
                  appStore.push(pendingInsert);
                }
                releaseJobLock(txId);
              },
              rollback: async () => {
                pendingDelete = false;
                pendingInsert = null;
                releaseJobLock(txId);
              },
              release: () => {
                releaseJobLock(txId);
              }
            };
          }
        });

        delete require.cache[require.resolve('./src/models/jobPostingModel')];
        delete require.cache[require.resolve('./src/models/applicationModel')];
        const concJobModel = require('./src/models/jobPostingModel');
        const concAppModel = require('./src/models/applicationModel');

        const startDelete = () => concJobModel.deleteJobPosting(20).then(
          (ok) => ({ ok }),
          (err) => ({ err })
        );
        const startCreate = () =>
          concAppModel.createApplication({
            job_posting_id: 20,
            applicant_name: 'Race Tester',
            applicant_email: 'race@example.com'
          }).then(
            (app) => ({ app }),
            (err) => ({ err })
          );

        const [res1, res2] = firstOp === 'create'
          ? await Promise.all([startCreate(), new Promise((r) => setTimeout(() => r(startDelete()), 2))])
          : await Promise.all([startDelete(), new Promise((r) => setTimeout(() => r(startCreate()), 2))]);

        const orphans = appStore.filter((a) => !jobStore.has(a.job_posting_id));
        assert.strictEqual(orphans.length, 0, `Concurrent (${firstOp} first) must NEVER produce orphan applications`);
        if (firstOp === 'create') {
          assert(res1.app && res1.app.id === 1);
          assert(res2.err && res2.err.code === 'JOB_HAS_APPLICATIONS');
          assert.strictEqual(jobStore.has(20), true);
          assert.strictEqual(appStore.length, 1);
        } else {
          assert.strictEqual(res1.ok, true);
          assert(res2.err && res2.err.code === 'JOB_POSTING_NOT_FOUND');
          assert.strictEqual(jobStore.has(20), false);
          assert.strictEqual(appStore.length, 0);
        }
      }
      console.log('✅ 7. Transactional application create/update & concurrent delete locking assertions verified');
    } finally {
      db.getPool = originalGetPool;
      delete require.cache[require.resolve('./src/models/userModel')];
      delete require.cache[require.resolve('./src/models/jobPostingModel')];
      delete require.cache[require.resolve('./src/models/applicationModel')];
    }
  }

  console.log('\n🎉 ALL OFFLINE ADMIN UNIT TESTS PASSED! 🎉\n');
}

runOfflineUnitTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ OFFLINE UNIT TEST FAILED:', err);
    process.exit(1);
  });
