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

function renderNavAuthItems(currentUser = null, escapeHtml = defaultEscapeHtml) {
  const adminNavItem =
    currentUser && currentUser.auth_role === 'admin'
      ? '<a href="/admin" class="nav-link">Admin Panel</a>'
      : '';

  const authNavItems = currentUser
    ? `<span class="nav-user-pill" title="${escapeHtml(currentUser.email || '')}">👤 ${escapeHtml(currentUser.name)}</span>
        <form action="/logout" method="POST" style="display:inline; margin:0;">
          <button type="submit" class="nav-link nav-logout-btn">Logout</button>
        </form>`
    : `<a href="/login" class="nav-link">Login</a>
        <a href="/register" class="nav-link">Register</a>`;

  return `${adminNavItem}\n        ${authNavItems}`;
}

module.exports = {
  NAV_AUTH_CSS,
  renderNavAuthItems
};
