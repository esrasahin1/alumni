const assert = require('assert');
const {
  getUserNavRole,
  getNavItems,
  renderNavAuthItems,
  renderNavbarLinks
} = require('./src/views/navAuthHelper');
const { renderHomePage } = require('./src/views/homeView');
const { renderAboutPage } = require('./src/views/aboutView');
const { renderLoginPage, renderRegisterPage } = require('./src/views/authView');
const { renderUsersPage } = require('./src/views/userView');
const { renderAnnouncementsPage } = require('./src/views/announcementView');
const { renderJobPostingsPage } = require('./src/views/jobPostingView');
const { renderApplicationsPage, renderMyApplicationsPage } = require('./src/views/applicationView');
const { renderUserJobsPage } = require('./src/views/userJobsView');
const { renderAdminDashboard } = require('./src/views/adminView');
const { renderNotFoundPage } = require('./src/views/notFoundView');
const { renderProfilePage } = require('./src/views/profileView');

function extractNavbarHtml(html) {
  const match = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/i);
  assert(match, 'Rendered HTML must contain a <nav> element');
  return match[0];
}

function hasHref(navHtml, href) {
  return navHtml.includes(`href="${href}"`);
}

function runNavigationUnitTests() {
  console.log('\n🧪 Running Task 6 Dynamic Navigation Unit Tests...\n');

  const guestUser = null;
  const studentUser = {
    id: 10,
    name: 'Selin Student',
    email: 'selin@example.com',
    role: 'student',
    auth_role: 'user'
  };
  const alumniUser = {
    id: 25,
    name: 'Mert Alumni',
    email: 'mert@example.com',
    role: 'alumni',
    auth_role: 'user'
  };
  const adminWithStudentRole = {
    id: 61,
    name: 'Esra Admin',
    email: 'esrasahin@gmail.com',
    role: 'student',
    auth_role: 'admin'
  };
  const adminWithAlumniRole = {
    id: 62,
    name: 'Kerem Admin',
    email: 'kerem@example.com',
    role: 'alumni',
    auth_role: 'admin'
  };

  // 1. Helper role resolution & precedence
  {
    assert.strictEqual(getUserNavRole(guestUser), 'guest');
    assert.strictEqual(getUserNavRole(studentUser), 'student');
    assert.strictEqual(getUserNavRole(alumniUser), 'alumni');
    assert.strictEqual(getUserNavRole(adminWithStudentRole), 'admin');
    assert.strictEqual(getUserNavRole(adminWithAlumniRole), 'admin');
    assert.strictEqual(getUserNavRole({ id: 99, name: 'Legacy User', auth_role: 'user' }), 'user');

    assert.deepStrictEqual(
      getNavItems(guestUser).map((i) => i.href),
      ['/', '/about', '/announcements', '/job-postings']
    );
    assert.deepStrictEqual(
      getNavItems(studentUser).map((i) => i.href),
      ['/', '/about', '/users', '/announcements', '/job-postings', '/applications', '/my-applications']
    );
    assert.deepStrictEqual(
      getNavItems(alumniUser).map((i) => i.href),
      ['/', '/about', '/users', '/announcements', '/job-postings', '/applications', '/my-applications', '/users/25/jobs']
    );
    assert.deepStrictEqual(
      getNavItems(adminWithAlumniRole).map((i) => i.href),
      ['/', '/about', '/users', '/announcements', '/job-postings', '/applications']
    );

    // Unsafe or non-integer user IDs must never emit an injectable My Job Postings URL
    const unsafeAlumni = { id: '25/../../admin', name: 'Bad', role: 'alumni', auth_role: 'user' };
    assert(!getNavItems(unsafeAlumni).some((i) => i.key === 'my-jobs'));
    console.log('✅ 1. Role resolution, auth_role precedence & safe My Job Postings URL checks passed');
  }

  // 2. XSS escaping & auth helper output
  {
    const xssUser = {
      id: 77,
      name: '<script>alert("xss")</script>',
      email: '"evil"@example.com',
      role: 'student',
      auth_role: 'user'
    };
    const navHtml = renderNavbarLinks({ currentUser: xssUser, activeNav: 'home' });
    assert(!navHtml.includes('<script>'));
    assert(navHtml.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'));
    assert(navHtml.includes('Student'));
    assert(renderNavAuthItems(guestUser).includes('href="/login"'));
    assert(renderNavAuthItems(guestUser).includes('href="/register"'));
    console.log('✅ 2. XSS escaping & backwards-compatible renderNavAuthItems verified');
  }

  // 3. Enforce identical dynamic navigation rules across ALL 10 MVC / Auth / Error views
  {
    const views = [
      { name: 'homeView', expectedActive: 'Home', render: (u) => renderHomePage(u) },
      { name: 'aboutView', expectedActive: 'About', render: (u) => renderAboutPage(u) },
      { name: 'authView(login)', expectedActive: 'Login', guestOnlyActive: true, render: (u) => renderLoginPage({ currentUser: u }) },
      { name: 'authView(register)', expectedActive: 'Register', guestOnlyActive: true, render: (u) => renderRegisterPage({ currentUser: u }) },
      { name: 'userView', expectedActive: 'Users', authOnlyActive: true, render: (u) => renderUsersPage([], u) },
      { name: 'announcementView', expectedActive: 'Announcements', render: (u) => renderAnnouncementsPage([], u) },
      { name: 'jobPostingView', expectedActive: 'Job Postings', render: (u) => renderJobPostingsPage([], u) },
      { name: 'applicationView', expectedActive: 'Applications', authOnlyActive: true, render: (u) => renderApplicationsPage([], { currentUser: u }) },
      { name: 'myApplicationsView', expectedActive: 'My Applications', studentAlumniActive: true, render: (u) => renderMyApplicationsPage([], { currentUser: u }) },
      {
        name: 'userJobsView(own)',
        expectedActive: 'Users',
        alumniOwnActive: 'My Job Postings',
        render: (u) => renderUserJobsPage({ id: 25, name: 'Mert Alumni', email: 'mert@example.com' }, [], u)
      },
      { name: 'adminView', expectedActive: 'Admin Panel', adminOnlyActive: true, render: (u) => renderAdminDashboard({ counts: {}, currentUser: u }) },
      { name: 'profileView', expectedActive: null, profileActive: true, render: (u) => renderProfilePage({ profile: u || {}, currentUser: u }) },
      { name: 'notFoundView', expectedActive: null, render: (u) => renderNotFoundPage({ originalUrl: '/missing', method: 'GET', user: u }) }
    ];

    for (const view of views) {
      // Guest checks
      const guestNav = extractNavbarHtml(view.render(guestUser));
      assert(hasHref(guestNav, '/'), `${view.name} Guest must see Home`);
      assert(hasHref(guestNav, '/about'), `${view.name} Guest must see About`);
      assert(hasHref(guestNav, '/announcements'), `${view.name} Guest must see Announcements`);
      assert(hasHref(guestNav, '/job-postings'), `${view.name} Guest must see Job Postings`);
      assert(hasHref(guestNav, '/login'), `${view.name} Guest must see Login`);
      assert(hasHref(guestNav, '/register'), `${view.name} Guest must see Register`);
      assert(hasHref(guestNav, '/api/swagger'), `${view.name} Guest must see Swagger UI`);
      assert(!hasHref(guestNav, '/users'), `${view.name} Guest must NOT see Users`);
      assert(!hasHref(guestNav, '/applications'), `${view.name} Guest must NOT see Applications`);
      assert(!hasHref(guestNav, '/my-applications'), `${view.name} Guest must NOT see My Applications`);
      assert(!guestNav.includes('My Job Postings'), `${view.name} Guest must NOT see My Job Postings`);
      assert(!hasHref(guestNav, '/admin'), `${view.name} Guest must NOT see Admin Panel`);
      assert(!hasHref(guestNav, '/profile'), `${view.name} Guest must NOT see Profile pill link`);
      assert(!guestNav.includes('action="/logout"'), `${view.name} Guest must NOT see Logout`);

      // Student checks
      const studentNav = extractNavbarHtml(view.render(studentUser));
      assert(hasHref(studentNav, '/'), `${view.name} Student must see Home`);
      assert(hasHref(studentNav, '/about'), `${view.name} Student must see About`);
      assert(hasHref(studentNav, '/users'), `${view.name} Student must see Users`);
      assert(hasHref(studentNav, '/announcements'), `${view.name} Student must see Announcements`);
      assert(hasHref(studentNav, '/job-postings'), `${view.name} Student must see Job Postings`);
      assert(hasHref(studentNav, '/applications'), `${view.name} Student must see Applications`);
      assert(hasHref(studentNav, '/my-applications'), `${view.name} Student must see My Applications`);
      assert(hasHref(studentNav, '/api/swagger'), `${view.name} Student must see Swagger UI`);
      assert(hasHref(studentNav, '/profile'), `${view.name} Student pill must link to /profile`);
      assert(studentNav.includes('Selin Student') && studentNav.includes('>Student<'), `${view.name} Student must see username and Student badge`);
      assert(studentNav.includes('action="/logout"'), `${view.name} Student must see Logout`);
      assert(!studentNav.includes('My Job Postings'), `${view.name} Student must NOT see My Job Postings`);
      assert(!hasHref(studentNav, '/admin'), `${view.name} Student must NOT see Admin Panel`);
      assert(!hasHref(studentNav, '/login') && !hasHref(studentNav, '/register'), `${view.name} Student must NOT see Login/Register`);

      // Alumni checks
      const alumniNav = extractNavbarHtml(view.render(alumniUser));
      assert(hasHref(alumniNav, '/'), `${view.name} Alumni must see Home`);
      assert(hasHref(alumniNav, '/about'), `${view.name} Alumni must see About`);
      assert(hasHref(alumniNav, '/users'), `${view.name} Alumni must see Users`);
      assert(hasHref(alumniNav, '/announcements'), `${view.name} Alumni must see Announcements`);
      assert(hasHref(alumniNav, '/job-postings'), `${view.name} Alumni must see Job Postings`);
      assert(hasHref(alumniNav, '/applications'), `${view.name} Alumni must see Applications`);
      assert(hasHref(alumniNav, '/my-applications'), `${view.name} Alumni must see My Applications`);
      assert(hasHref(alumniNav, '/users/25/jobs') && alumniNav.includes('My Job Postings'), `${view.name} Alumni must see My Job Postings with own ID`);
      assert(hasHref(alumniNav, '/api/swagger'), `${view.name} Alumni must see Swagger UI`);
      assert(hasHref(alumniNav, '/profile'), `${view.name} Alumni pill must link to /profile`);
      assert(alumniNav.includes('Mert Alumni') && alumniNav.includes('>Alumni<'), `${view.name} Alumni must see username and Alumni badge`);
      assert(alumniNav.includes('action="/logout"'), `${view.name} Alumni must see Logout`);
      assert(!hasHref(alumniNav, '/admin'), `${view.name} Alumni must NOT see Admin Panel`);
      assert(!hasHref(alumniNav, '/login') && !hasHref(alumniNav, '/register'), `${view.name} Alumni must NOT see Login/Register`);

      // Admin checks (both role='student' and role='alumni')
      for (const adminUser of [adminWithStudentRole, adminWithAlumniRole]) {
        const adminNav = extractNavbarHtml(view.render(adminUser));
        assert(hasHref(adminNav, '/'), `${view.name} Admin must see Home`);
        assert(hasHref(adminNav, '/about'), `${view.name} Admin must see About`);
        assert(hasHref(adminNav, '/users'), `${view.name} Admin must see Users`);
        assert(hasHref(adminNav, '/announcements'), `${view.name} Admin must see Announcements`);
        assert(hasHref(adminNav, '/job-postings'), `${view.name} Admin must see Job Postings`);
        assert(hasHref(adminNav, '/applications'), `${view.name} Admin must see Applications`);
        assert(hasHref(adminNav, '/admin') && adminNav.includes('Admin Panel'), `${view.name} Admin (${adminUser.role}) must see Admin Panel`);
        assert(hasHref(adminNav, '/api/swagger'), `${view.name} Admin must see Swagger UI`);
        assert(hasHref(adminNav, '/profile'), `${view.name} Admin pill must link to /profile`);
        assert(adminNav.includes(adminUser.name) && adminNav.includes('>Admin<'), `${view.name} Admin must see username and Admin badge`);
        assert(adminNav.includes('action="/logout"'), `${view.name} Admin must see Logout`);
        assert(!adminNav.includes('My Job Postings'), `${view.name} Admin (${adminUser.role}) must NOT see My Job Postings`);
        assert(!hasHref(adminNav, '/my-applications'), `${view.name} Admin (${adminUser.role}) must NOT see My Applications`);
        assert(!hasHref(adminNav, '/login') && !hasHref(adminNav, '/register'), `${view.name} Admin must NOT see Login/Register`);
      }

      if (view.profileActive) {
        assert(studentNav.includes('class="nav-user-pill active" aria-current="page"'), 'profileView should mark user pill active');
      }

      // Active link checks
      if (view.expectedActive) {
        if (view.guestOnlyActive) {
          assert(guestNav.includes(`class="nav-link active" aria-current="page">${view.expectedActive}</a>`), `${view.name} should mark ${view.expectedActive} active`);
        } else if (view.adminOnlyActive) {
          const admNav = extractNavbarHtml(view.render(adminWithStudentRole));
          assert(admNav.includes(`class="nav-link active" aria-current="page">${view.expectedActive}</a>`), `${view.name} should mark ${view.expectedActive} active`);
        } else if (view.alumniOwnActive) {
          assert(alumniNav.includes(`class="nav-link active" aria-current="page">${view.alumniOwnActive}</a>`), `${view.name} should mark My Job Postings active for own Alumni`);
          assert(studentNav.includes(`class="nav-link active" aria-current="page">${view.expectedActive}</a>`), `${view.name} should mark Users active for Student`);
        } else if (view.studentAlumniActive) {
          assert(studentNav.includes(`class="nav-link active" aria-current="page">${view.expectedActive}</a>`), `${view.name} should mark My Applications active for Student`);
          assert(alumniNav.includes(`class="nav-link active" aria-current="page">${view.expectedActive}</a>`), `${view.name} should mark My Applications active for Alumni`);
        } else if (!view.authOnlyActive) {
          assert(guestNav.includes(`class="nav-link active" aria-current="page">${view.expectedActive}</a>`), `${view.name} should mark ${view.expectedActive} active for Guest`);
          assert(studentNav.includes(`class="nav-link active" aria-current="page">${view.expectedActive}</a>`), `${view.name} should mark ${view.expectedActive} active for Student`);
        } else {
          assert(studentNav.includes(`class="nav-link active" aria-current="page">${view.expectedActive}</a>`), `${view.name} should mark ${view.expectedActive} active`);
        }
      }
    }

    // Verify Admin Panel internal sub-tabs remain intact
    const adminDashHtml = renderAdminDashboard({ counts: {}, currentUser: adminWithStudentRole });
    for (const tabLabel of ['Overview', 'Users', 'Announcements', 'Job Postings', 'Applications']) {
      assert(adminDashHtml.includes(`class="admin-tab`) && adminDashHtml.includes(`>${tabLabel}</a>`), `Admin sub-tab ${tabLabel} must remain intact`);
    }

    // Verify viewing another user's jobs as Alumni highlights Users instead of My Job Postings
    const otherUserJobsNav = extractNavbarHtml(
      renderUserJobsPage({ id: 99, name: 'Other User', email: 'other@example.com' }, [], alumniUser)
    );
    assert(otherUserJobsNav.includes('class="nav-link active" aria-current="page">Users</a>'));

    console.log(`✅ 3. Verified identical role-based navbar rules & active state across all ${views.length} view contexts`);
  }

  console.log('\n🎉 ALL TASK 6 DYNAMIC NAVIGATION UNIT TESTS PASSED! 🎉\n');
}

try {
  runNavigationUnitTests();
  process.exit(0);
} catch (error) {
  console.error('\n❌ NAVIGATION UNIT TEST FAILED:', error);
  process.exit(1);
}
