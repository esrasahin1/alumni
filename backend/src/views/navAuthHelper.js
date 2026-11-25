const defaultEscapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const NAV_AUTH_CSS = `
    .nav-user-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-full, 9999px);
      background: rgba(109, 140, 255, 0.14);
      border: 1px solid rgba(109, 140, 255, 0.35);
      color: var(--soft-white, #F4F5F7);
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .nav-user-pill:hover,
    .nav-user-pill.active {
      background: rgba(109, 140, 255, 0.24);
      border-color: var(--electric-blue, #6D8CFF);
      color: #ffffff;
    }

    .nav-role-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      line-height: 1.3;
    }

    .nav-role-student {
      background: rgba(109, 140, 255, 0.22);
      border: 1px solid rgba(109, 140, 255, 0.5);
      color: #c7d6ff;
    }

    .nav-role-alumni {
      background: rgba(213, 243, 106, 0.16);
      border: 1px solid rgba(213, 243, 106, 0.45);
      color: var(--lime, #D5F36A);
    }

    .nav-role-admin {
      background: rgba(251, 191, 36, 0.18);
      border: 1px solid rgba(251, 191, 36, 0.5);
      color: #fde68a;
    }

    .nav-role-user {
      background: rgba(185, 195, 210, 0.14);
      border: 1px solid rgba(185, 195, 210, 0.35);
      color: var(--secondary-text, #B9C3D2);
    }

    .nav-logout-btn {
      background: transparent;
      border: 1px solid rgba(229, 62, 62, 0.45);
      color: #feb2b2;
      cursor: pointer;
      font-family: inherit;
    }

    .nav-logout-btn:hover {
      background: rgba(229, 62, 62, 0.16);
      border-color: #e53e3e;
      color: #ffffff;
    }
`;

/**
 * Resolves the effective navigation role for the current request user.
 * Authorization role (`auth_role === 'admin'`) always takes precedence over account type (`users.role`).
 *
 * @param {Object|null} currentUser
 * @returns {'guest'|'admin'|'alumni'|'student'|'user'}
 */
function getUserNavRole(currentUser = null) {
  if (!currentUser || typeof currentUser !== 'object') {
    return 'guest';
  }

  const authRole = String(currentUser.auth_role || '').trim().toLowerCase();
  if (authRole === 'admin') {
    return 'admin';
  }

  const accountRole = String(currentUser.role || '').trim().toLowerCase();
  if (accountRole === 'alumni') {
    return 'alumni';
  }
  if (accountRole === 'student') {
    return 'student';
  }

  return 'user';
}

/**
 * Extracts a safe positive integer user ID for dynamic profile/job URLs.
 *
 * @param {Object|null} currentUser
 * @returns {number|null}
 */
function getSafeUserId(currentUser = null) {
  if (!currentUser || currentUser.id === undefined || currentUser.id === null || currentUser.id === '') {
    return null;
  }
  const numericId = Number(currentUser.id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }
  return numericId;
}

/**
 * Returns display badge metadata for the logged-in user's effective role.
 *
 * @param {Object|null} currentUser
 * @returns {{ label: string, badgeClass: string }|null}
 */
function getNavRoleBadgeMeta(currentUser = null) {
  const navRole = getUserNavRole(currentUser);
  if (navRole === 'admin') {
    return { label: 'Admin', badgeClass: 'nav-role-admin' };
  }
  if (navRole === 'alumni') {
    return { label: 'Alumni', badgeClass: 'nav-role-alumni' };
  }
  if (navRole === 'student') {
    return { label: 'Student', badgeClass: 'nav-role-student' };
  }
  if (navRole === 'user') {
    return { label: 'User', badgeClass: 'nav-role-user' };
  }
  return null;
}

/**
 * Returns the primary navigation items allowed for the current user's role.
 * Menu visibility is strictly UX; route-level access control remains enforced by requireAuth / requireAdmin.
 *
 * @param {Object|null} currentUser
 * @returns {Array<{ key: string, href: string, label: string }>}
 */
function getNavItems(currentUser = null) {
  const navRole = getUserNavRole(currentUser);

  if (navRole === 'guest') {
    return [
      { key: 'home', href: '/', label: 'Home' },
      { key: 'about', href: '/about', label: 'About' },
      { key: 'announcements', href: '/announcements', label: 'Announcements' },
      { key: 'job-postings', href: '/job-postings', label: 'Job Postings' }
    ];
  }

  const items = [
    { key: 'home', href: '/', label: 'Home' },
    { key: 'about', href: '/about', label: 'About' },
    { key: 'users', href: '/users', label: 'Users' },
    { key: 'announcements', href: '/announcements', label: 'Announcements' },
    { key: 'job-postings', href: '/job-postings', label: 'Job Postings' },
    { key: 'applications', href: '/applications', label: 'Applications' }
  ];

  // Student & Alumni receive My Applications; Alumni additionally receive My Job Postings.
  if (navRole === 'student' || navRole === 'alumni') {
    items.push({
      key: 'my-applications',
      href: '/my-applications',
      label: 'My Applications'
    });
  }

  // Only Alumni (non-admin) receive the dedicated My Job Postings shortcut.
  if (navRole === 'alumni') {
    const safeUserId = getSafeUserId(currentUser);
    if (safeUserId !== null) {
      items.push({
        key: 'my-jobs',
        href: `/users/${safeUserId}/jobs`,
        label: 'My Job Postings'
      });
    }
  }

  return items;
}

/**
 * Renders user-specific auth & role navigation items (Admin Panel, User pill + Role badge, Logout OR Login/Register).
 * Preserves backwards compatibility for callers invoking renderNavAuthItems(currentUser, escapeHtml, options).
 *
 * @param {Object|null} [currentUser=null]
 * @param {Function} [escapeHtml=defaultEscapeHtml]
 * @param {Object} [options={}]
 * @param {string} [options.activeNav='']
 * @returns {string}
 */
function renderNavAuthItems(currentUser = null, escapeHtml = defaultEscapeHtml, options = {}) {
  const safeEscape = typeof escapeHtml === 'function' ? escapeHtml : defaultEscapeHtml;
  const activeNav = options && options.activeNav ? String(options.activeNav) : '';
  const navRole = getUserNavRole(currentUser);

  if (navRole === 'guest') {
    const loginActive = activeNav === 'login' ? ' active' : '';
    const loginCurrent = activeNav === 'login' ? ' aria-current="page"' : '';
    const registerActive = activeNav === 'register' ? ' active' : '';
    const registerCurrent = activeNav === 'register' ? ' aria-current="page"' : '';

    return `<a href="/login" class="nav-link${loginActive}"${loginCurrent}>Login</a>
        <a href="/register" class="nav-link${registerActive}"${registerCurrent}>Register</a>`;
  }

  const adminActive = activeNav === 'admin' ? ' active' : '';
  const adminCurrent = activeNav === 'admin' ? ' aria-current="page"' : '';
  const adminNavItem =
    navRole === 'admin'
      ? `<a href="/admin" class="nav-link${adminActive}"${adminCurrent}>Admin Panel</a>`
      : '';

  const badgeMeta = getNavRoleBadgeMeta(currentUser);
  const badgeHtml = badgeMeta
    ? ` <span class="nav-role-badge ${safeEscape(badgeMeta.badgeClass)}">${safeEscape(badgeMeta.label)}</span>`
    : '';
  const displayName = safeEscape(currentUser.name || currentUser.email || 'User');
  const titleEmail = safeEscape(currentUser.email || '');
  const profileActive = activeNav === 'profile' ? ' active' : '';
  const profileCurrent = activeNav === 'profile' ? ' aria-current="page"' : '';
  const pillTitle = titleEmail ? `${titleEmail} — My Profile` : 'My Profile';

  const authNavItems = `<a href="/profile" class="nav-user-pill${profileActive}"${profileCurrent} title="${pillTitle}">👤 ${displayName}${badgeHtml}</a>
        <form action="/logout" method="POST" style="display:inline; margin:0;">
          <button type="submit" class="nav-link nav-logout-btn">Logout</button>
        </form>`;

  return adminNavItem ? `${adminNavItem}\n        ${authNavItems}` : authNavItems;
}

/**
 * Renders the complete centralized role-based navigation links for the navbar.
 *
 * @param {Object} [options={}]
 * @param {Object|null} [options.currentUser=null]
 * @param {string} [options.activeNav='']
 * @param {Function} [options.escapeHtml=defaultEscapeHtml]
 * @param {boolean} [options.includeSwagger=true]
 * @returns {string}
 */
function renderNavbarLinks({
  currentUser = null,
  activeNav = '',
  escapeHtml = defaultEscapeHtml,
  includeSwagger = true
} = {}) {
  const safeEscape = typeof escapeHtml === 'function' ? escapeHtml : defaultEscapeHtml;
  const primaryLinks = getNavItems(currentUser)
    .map((item) => {
      const isActive = item.key === activeNav;
      const activeClass = isActive ? ' active' : '';
      const ariaCurrent = isActive ? ' aria-current="page"' : '';
      return `<a href="${safeEscape(item.href)}" class="nav-link${activeClass}"${ariaCurrent}>${safeEscape(item.label)}</a>`;
    })
    .join('\n        ');

  const authItems = renderNavAuthItems(currentUser, safeEscape, { activeNav });
  const swaggerItem = includeSwagger
    ? '\n        <a href="/api/swagger" target="_blank" rel="noopener" class="nav-link nav-cta">Swagger UI</a>'
    : '';

  return `${primaryLinks}\n        ${authItems}${swaggerItem}`;
}

module.exports = {
  NAV_AUTH_CSS,
  getUserNavRole,
  getNavRoleBadgeMeta,
  getNavItems,
  renderNavAuthItems,
  renderNavbarLinks
};
