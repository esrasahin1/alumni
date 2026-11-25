const { ALLOWED_APPLICATION_STATUSES } = require('../models/applicationModel');
const { renderNavbarLinks } = require('./navAuthHelper');

const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return escapeHtml(date.toISOString().slice(0, 16).replace('T', ' '));
};

const getAdminLayout = (title, activeSection, content, currentUser = null) => {
  const subTabs = [
    { key: 'overview', href: '/admin', label: 'Overview' },
    { key: 'users', href: '/admin/users', label: 'Users' },
    { key: 'announcements', href: '/admin/announcements', label: 'Announcements' },
    { key: 'job-postings', href: '/admin/job-postings', label: 'Job Postings' },
    { key: 'applications', href: '/admin/applications', label: 'Applications' }
  ]
    .map(
      (tab) =>
        `<a href="${tab.href}" class="admin-tab ${activeSection === tab.key ? 'active' : ''}">${tab.label}</a>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} — Admin Panel | Alumni Tracking System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --midnight-navy: #101827;
      --secondary-navy: #202E46;
      --surface-card: #162135;
      --electric-blue: #6D8CFF;
      --electric-blue-hover: #5878F0;
      --lime: #D5F36A;
      --lime-hover: #C6E853;
      --soft-white: #F4F5F7;
      --secondary-text: #B9C3D2;
      --muted-text: #7F8FA6;
      --subtle-border: #35445D;
      --danger: #FF6B7A;
      --danger-bg: rgba(255, 107, 122, 0.12);
      --success: #5EEAD4;
      --success-bg: rgba(94, 234, 212, 0.12);
      --warning: #FBBF24;
      --warning-bg: rgba(251, 191, 36, 0.12);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--midnight-navy);
      color: var(--soft-white);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-image: radial-gradient(circle at 12% 10%, rgba(109, 140, 255, 0.10) 0%, transparent 45%),
                        radial-gradient(circle at 88% 85%, rgba(213, 243, 106, 0.06) 0%, transparent 45%);
    }

    h1, h2, h3, .brand-title { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
    a { color: inherit; }

    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(16, 24, 39, 0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--subtle-border);
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--soft-white);
      font-weight: 800;
      font-size: 1.15rem;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--electric-blue), #4F6FE8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .nav-link {
      text-decoration: none;
      color: var(--secondary-text);
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .nav-link:hover, .nav-link.active {
      color: var(--soft-white);
      background: rgba(109, 140, 255, 0.14);
    }
    .nav-user-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.42rem 0.85rem;
      border-radius: 999px;
      background: rgba(213, 243, 106, 0.14);
      border: 1px solid rgba(213, 243, 106, 0.32);
      color: var(--lime);
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .nav-role-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.12rem 0.48rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .nav-role-admin {
      background: rgba(251, 191, 36, 0.2);
      border: 1px solid rgba(251, 191, 36, 0.5);
      color: #fde68a;
    }
    .nav-role-alumni {
      background: rgba(213, 243, 106, 0.18);
      border: 1px solid rgba(213, 243, 106, 0.45);
      color: var(--lime);
    }
    .nav-role-student {
      background: rgba(109, 140, 255, 0.22);
      border: 1px solid rgba(109, 140, 255, 0.5);
      color: #c7d6ff;
    }
    .nav-role-user {
      background: rgba(185, 195, 210, 0.15);
      border: 1px solid rgba(185, 195, 210, 0.35);
      color: var(--secondary-text);
    }
    .nav-cta {
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      color: var(--lime) !important;
      font-weight: 600;
    }
    .nav-cta:hover {
      background: rgba(213, 243, 106, 0.12) !important;
      border-color: var(--lime) !important;
    }
    .nav-logout-btn {
      background: transparent;
      border: 1px solid var(--subtle-border);
      cursor: pointer;
      font-family: inherit;
    }
    .nav-logout-btn:hover {
      border-color: var(--danger);
      color: var(--danger);
      background: var(--danger-bg);
    }
    .mobile-toggle {
      display: none;
      background: transparent;
      border: 1px solid var(--subtle-border);
      color: var(--soft-white);
      border-radius: 8px;
      padding: 0.45rem 0.7rem;
      font-size: 1.1rem;
      cursor: pointer;
    }

    .container {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.5rem 3.5rem;
      flex: 1;
    }

    .admin-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .admin-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.28rem 0.75rem;
      border-radius: 999px;
      background: rgba(213, 243, 106, 0.14);
      border: 1px solid rgba(213, 243, 106, 0.35);
      color: var(--lime);
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 0.55rem;
    }
    .admin-hero h1 { font-size: 1.9rem; font-weight: 800; line-height: 1.2; }
    .admin-hero p { color: var(--secondary-text); margin-top: 0.35rem; font-size: 0.95rem; }

    .admin-tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      padding-bottom: 1rem;
      margin-bottom: 1.75rem;
      border-bottom: 1px solid var(--subtle-border);
    }
    .admin-tab {
      text-decoration: none;
      color: var(--secondary-text);
      background: var(--surface-card);
      border: 1px solid var(--subtle-border);
      padding: 0.55rem 1rem;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .admin-tab:hover { border-color: var(--electric-blue); color: var(--soft-white); }
    .admin-tab.active {
      background: var(--electric-blue);
      border-color: var(--electric-blue);
      color: #fff;
    }

    .alert {
      padding: 0.95rem 1.1rem;
      border-radius: 10px;
      margin-bottom: 1.25rem;
      font-size: 0.92rem;
      border: 1px solid;
    }
    .alert-success {
      background: var(--success-bg);
      border-color: rgba(94, 234, 212, 0.35);
      color: var(--success);
    }
    .alert-error {
      background: var(--danger-bg);
      border-color: rgba(255, 107, 122, 0.38);
      color: #FFB4BC;
    }
    .alert-warning {
      background: var(--warning-bg);
      border-color: rgba(251, 191, 36, 0.38);
      color: #FDE68A;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.15rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--surface-card);
      border: 1px solid var(--subtle-border);
      border-radius: 14px;
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      transition: border-color 0.2s, transform 0.2s;
    }
    .stat-card:hover { border-color: var(--electric-blue); transform: translateY(-2px); }
    .stat-label { color: var(--secondary-text); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .stat-value { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 2.2rem; font-weight: 800; color: var(--lime); line-height: 1.1; }
    .stat-meta { color: var(--muted-text); font-size: 0.84rem; }
    .stat-link { margin-top: 0.4rem; color: var(--electric-blue); font-size: 0.88rem; font-weight: 600; text-decoration: none; }
    .stat-link:hover { text-decoration: underline; }

    .grid-2 {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 1.5rem;
      align-items: start;
    }
    @media (max-width: 980px) {
      .grid-2 { grid-template-columns: 1fr; }
    }

    .card {
      background: var(--surface-card);
      border: 1px solid var(--subtle-border);
      border-radius: 14px;
      padding: 1.4rem;
      margin-bottom: 1.25rem;
    }
    .card h2 {
      font-size: 1.12rem;
      font-weight: 700;
      margin-bottom: 0.35rem;
    }
    .card-subtitle {
      color: var(--secondary-text);
      font-size: 0.86rem;
      margin-bottom: 1.15rem;
    }

    .form-group { margin-bottom: 1rem; }
    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--secondary-text);
      margin-bottom: 0.35rem;
    }
    .form-control {
      width: 100%;
      background: var(--midnight-navy);
      border: 1px solid var(--subtle-border);
      border-radius: 9px;
      padding: 0.62rem 0.8rem;
      color: var(--soft-white);
      font-family: inherit;
      font-size: 0.92rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-control:focus { border-color: var(--electric-blue); }
    textarea.form-control { min-height: 92px; resize: vertical; }
    .field-error { color: var(--danger); font-size: 0.8rem; margin-top: 0.28rem; }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.6rem 1.05rem;
      border-radius: 9px;
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-primary { background: var(--lime); color: var(--midnight-navy); }
    .btn-primary:hover { background: var(--lime-hover); }
    .btn-secondary { background: var(--secondary-navy); color: var(--soft-white); border-color: var(--subtle-border); }
    .btn-secondary:hover { border-color: var(--electric-blue); }
    .btn-danger { background: var(--danger-bg); color: var(--danger); border-color: rgba(255, 107, 122, 0.35); }
    .btn-danger:hover { background: rgba(255, 107, 122, 0.22); }
    .btn-sm { padding: 0.36rem 0.7rem; font-size: 0.8rem; border-radius: 7px; }

    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    th, td {
      padding: 0.75rem 0.7rem;
      text-align: left;
      border-bottom: 1px solid rgba(53, 68, 93, 0.65);
      vertical-align: top;
    }
    th {
      color: var(--secondary-text);
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
    }
    tr:hover td { background: rgba(32, 46, 70, 0.35); }
    .actions-cell { display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap; }

    .pill {
      display: inline-block;
      padding: 0.2rem 0.58rem;
      border-radius: 999px;
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      border: 1px solid transparent;
      white-space: nowrap;
    }
    .pill-admin { background: rgba(213, 243, 106, 0.15); color: var(--lime); border-color: rgba(213, 243, 106, 0.35); }
    .pill-user { background: rgba(109, 140, 255, 0.14); color: var(--electric-blue); border-color: rgba(109, 140, 255, 0.35); }
    .pill-muted { background: rgba(127, 143, 166, 0.14); color: var(--secondary-text); border-color: rgba(127, 143, 166, 0.25); }
    .pill-pending { background: var(--warning-bg); color: var(--warning); border-color: rgba(251, 191, 36, 0.35); }
    .pill-reviewing { background: rgba(109, 140, 255, 0.14); color: var(--electric-blue); border-color: rgba(109, 140, 255, 0.35); }
    .pill-accepted { background: var(--success-bg); color: var(--success); border-color: rgba(94, 234, 212, 0.35); }
    .pill-rejected { background: var(--danger-bg); color: var(--danger); border-color: rgba(255, 107, 122, 0.35); }

    .empty-state {
      text-align: center;
      padding: 2.2rem 1rem;
      color: var(--muted-text);
    }

    footer {
      border-top: 1px solid var(--subtle-border);
      padding: 1.25rem 1.5rem;
      text-align: center;
      color: var(--muted-text);
      font-size: 0.85rem;
    }

    @media (max-width: 820px) {
      .mobile-toggle { display: inline-block; }
      .nav-links {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--midnight-navy);
        border-bottom: 1px solid var(--subtle-border);
        padding: 1rem 1.5rem;
        flex-direction: column;
        align-items: flex-start;
      }
      .nav-links.open { display: flex; }
    }
  </style>
</head>
<body>
  <header class="navbar">
    <div class="nav-container">
      <a href="/" class="brand">
        <span class="brand-icon">A</span>
        <span class="brand-title">Alumni Tracking</span>
      </a>
      <button class="mobile-toggle" onclick="document.querySelector('.nav-links').classList.toggle('open')" aria-label="Toggle Menu">&#9776;</button>
      <nav class="nav-links" aria-label="Main Navigation">
        ${renderNavbarLinks({ currentUser, activeNav: 'admin', escapeHtml })}
      </nav>
    </div>
  </header>

  <main class="container">
    <div class="admin-hero">
      <div>
        <div class="admin-badge">Administrator Workspace</div>
        <h1>${escapeHtml(title)}</h1>
        <p>Manage platform users, announcements, job postings, and applications from one protected console.</p>
      </div>
      <div>
        <a href="/api/swagger" class="btn btn-secondary btn-sm" target="_blank" rel="noopener">API Docs (Swagger)</a>
      </div>
    </div>

    <div class="admin-tabs">
      ${subTabs}
    </div>

    ${content}
  </main>

  <footer>
    Alumni Tracking System &mdash; Protected Admin Console
  </footer>
</body>
</html>`;
};

const renderAlerts = ({ successMessage, errorMessage, warningMessage } = {}) => {
  const parts = [];
  if (successMessage) {
    parts.push(`<div class="alert alert-success">${escapeHtml(successMessage)}</div>`);
  }
  if (errorMessage) {
    parts.push(`<div class="alert alert-error">${escapeHtml(errorMessage)}</div>`);
  }
  if (warningMessage) {
    parts.push(`<div class="alert alert-warning">${escapeHtml(warningMessage)}</div>`);
  }
  return parts.join('\n');
};

const csrfField = (csrfToken = '') =>
  `<input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}" />`;

const statusPillClass = (status) => {
  const upper = String(status || 'PENDING').toUpperCase();
  if (upper === 'REVIEWING') return 'pill-reviewing';
  if (upper === 'ACCEPTED') return 'pill-accepted';
  if (upper === 'REJECTED') return 'pill-rejected';
  return 'pill-pending';
};

const renderAdminErrorPage = ({
  statusCode = 404,
  title = 'Error',
  message = 'The requested record could not be processed.',
  backHref = '/admin',
  backLabel = 'Back to Admin Dashboard',
  currentUser = null
} = {}) => {
  const content = `
    <div class="alert alert-error"><strong>HTTP ${Number(statusCode)}:</strong> ${escapeHtml(message)}</div>
    <div class="card" style="max-width: 640px;">
      <h2>${escapeHtml(title)}</h2>
      <p class="card-subtitle">${escapeHtml(message)}</p>
      <div class="actions-cell">
        <a href="${escapeHtml(backHref)}" class="btn btn-primary">${escapeHtml(backLabel)}</a>
        <a href="/admin" class="btn btn-secondary">Overview</a>
      </div>
    </div>
  `;
  return getAdminLayout(title, 'overview', content, currentUser);
};

const renderAdminDashboard = ({ counts = {}, currentUser = null }) => {
  const content = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Users</div>
        <div class="stat-value">${Number(counts.users || 0)}</div>
        <div class="stat-meta">${Number(counts.admins || 0)} admin(s) active</div>
        <a href="/admin/users" class="stat-link">Manage Users &rarr;</a>
      </div>
      <div class="stat-card">
        <div class="stat-label">Announcements</div>
        <div class="stat-value">${Number(counts.announcements || 0)}</div>
        <div class="stat-meta">Campus news &amp; events</div>
        <a href="/admin/announcements" class="stat-link">Manage Announcements &rarr;</a>
      </div>
      <div class="stat-card">
        <div class="stat-label">Job Postings</div>
        <div class="stat-value">${Number(counts.jobPostings || 0)}</div>
        <div class="stat-meta">Alumni &amp; employer opportunities</div>
        <a href="/admin/job-postings" class="stat-link">Manage Job Postings &rarr;</a>
      </div>
      <div class="stat-card">
        <div class="stat-label">Applications</div>
        <div class="stat-value">${Number(counts.applications || 0)}</div>
        <div class="stat-meta">${Number(counts.pendingApplications || 0)} pending review</div>
        <a href="/admin/applications" class="stat-link">Manage Applications &rarr;</a>
      </div>
    </div>

    <div class="card">
      <h2>Quick Operations</h2>
      <p class="card-subtitle">Select a resource below to create, edit, review, or safely remove records. Passwords and secrets are never displayed.</p>
      <div class="actions-cell">
        <a href="/admin/users" class="btn btn-primary">Create or Manage Users</a>
        <a href="/admin/announcements" class="btn btn-secondary">Publish Announcement</a>
        <a href="/admin/job-postings" class="btn btn-secondary">Post New Job</a>
        <a href="/admin/applications" class="btn btn-secondary">Review Applications</a>
      </div>
    </div>
  `;

  return getAdminLayout('Admin Dashboard', 'overview', content, currentUser);
};

const renderAdminUsersPage = ({
  users = [],
  values = {},
  errors = {},
  successMessage = '',
  errorMessage = '',
  currentUser = null,
  csrfToken = ''
}) => {
  const maxYear = new Date().getFullYear() + 10;
  const rowsHtml =
    users.length === 0
      ? `<tr><td colspan="7" class="empty-state">No users found in the database.</td></tr>`
      : users
          .map(
            (u) => `
          <tr>
            <td>#${u.id}</td>
            <td>
              <strong>${escapeHtml(u.name)}</strong><br/>
              <span style="color: var(--muted-text); font-size: 0.82rem;">${escapeHtml(u.email)}</span>
            </td>
            <td><span class="pill ${u.auth_role === 'admin' ? 'pill-admin' : 'pill-user'}">${escapeHtml(u.auth_role || 'user')}</span></td>
            <td>${u.role ? `<span class="pill pill-muted">${escapeHtml(u.role)}</span>` : '<span style="color: var(--muted-text);">—</span>'}</td>
            <td>${escapeHtml(u.department || '—')}${u.graduation_year ? ` (${escapeHtml(u.graduation_year)})` : ''}</td>
            <td>${formatDate(u.created_at)}</td>
            <td>
              <div class="actions-cell">
                <a href="/admin/users/${u.id}/edit" class="btn btn-secondary btn-sm">Edit</a>
                <form action="/admin/users/${u.id}/delete" method="POST" style="margin:0;" onsubmit="return confirm('Delete user ${escapeHtml(u.email)}? Any job applications linked to this user will be kept as unlinked guest submissions (user_id = NULL).');">
                  ${csrfField(csrfToken)}
                  <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                </form>
              </div>
            </td>
          </tr>`
          )
          .join('');

  const content = `
    ${renderAlerts({ successMessage, errorMessage })}
    <div class="grid-2">
      <div class="card">
        <h2>Create User</h2>
        <p class="card-subtitle">Single-admin policy: only one administrator account is allowed in the system; new accounts created here should use <code>user</code>.</p>
        <form action="/admin/users" method="POST">
          ${csrfField(csrfToken)}
          <div class="form-group">
            <label class="form-label" for="name">Full Name *</label>
            <input class="form-control" id="name" name="name" type="text" maxlength="255" required value="${escapeHtml(values.name || '')}" />
            ${errors.name ? `<div class="field-error">${escapeHtml(errors.name)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="email">Email Address *</label>
            <input class="form-control" id="email" name="email" type="email" maxlength="255" required value="${escapeHtml(values.email || '')}" />
            ${errors.email ? `<div class="field-error">${escapeHtml(errors.email)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password * (8–128 chars)</label>
            <input class="form-control" id="password" name="password" type="password" minlength="8" maxlength="128" required />
            ${errors.password ? `<div class="field-error">${escapeHtml(errors.password)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="role">Account Type</label>
            <select class="form-control" id="role" name="role">
              <option value="" ${!values.role ? 'selected' : ''}>Not specified (NULL)</option>
              <option value="student" ${values.role === 'student' ? 'selected' : ''}>Student</option>
              <option value="alumni" ${values.role === 'alumni' ? 'selected' : ''}>Alumni</option>
            </select>
            ${errors.role ? `<div class="field-error">${escapeHtml(errors.role)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="auth_role">Authorization Role *</label>
            <select class="form-control" id="auth_role" name="auth_role">
              <option value="user" ${values.auth_role !== 'admin' ? 'selected' : ''}>user (Standard)</option>
              <option value="admin" ${values.auth_role === 'admin' ? 'selected' : ''}>admin (Single Administrator Only)</option>
            </select>
            ${errors.auth_role ? `<div class="field-error">${escapeHtml(errors.auth_role)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="department">Department (optional)</label>
            <input class="form-control" id="department" name="department" type="text" maxlength="150" value="${escapeHtml(values.department || '')}" />
            ${errors.department ? `<div class="field-error">${escapeHtml(errors.department)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="graduation_year">Graduation Year (optional)</label>
            <input class="form-control" id="graduation_year" name="graduation_year" type="number" min="1950" max="${maxYear}" value="${escapeHtml(values.graduation_year || '')}" />
            ${errors.graduation_year ? `<div class="field-error">${escapeHtml(errors.graduation_year)}</div>` : ''}
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Create User</button>
        </form>
      </div>

      <div class="card">
        <h2>All Users (${users.length})</h2>
        <p class="card-subtitle">Deleting or demoting the sole administrator account is blocked to prevent lockout.</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Auth Role</th>
                <th>Type</th>
                <th>Academic</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  return getAdminLayout('Manage Users', 'users', content, currentUser);
};

const renderAdminUserEditPage = ({
  user,
  dependencies = { jobPostingsCount: 0, applicationsCount: 0 },
  values = {},
  errors = {},
  errorMessage = '',
  currentUser = null,
  csrfToken = ''
}) => {
  const maxYear = new Date().getFullYear() + 10;
  const v = {
    name: values.name !== undefined ? values.name : user.name,
    email: values.email !== undefined ? values.email : user.email,
    role: values.role !== undefined ? values.role : (user.role || ''),
    auth_role: values.auth_role !== undefined ? values.auth_role : (user.auth_role || 'user'),
    department: values.department !== undefined ? values.department : (user.department || ''),
    graduation_year: values.graduation_year !== undefined ? values.graduation_year : (user.graduation_year || '')
  };

  const content = `
    ${renderAlerts({ errorMessage })}
    <div class="card" style="max-width: 720px;">
      <h2>Edit User #${user.id}</h2>
      <p class="card-subtitle">
        Related records: ${Number(dependencies.jobPostingsCount || 0)} job posting(s),
        ${Number(dependencies.applicationsCount || 0)} application(s).
        Leave password blank to keep existing credentials unchanged. Single-admin rule prevents having 0 or &gt;1 admins.
      </p>
      <form action="/admin/users/${user.id}" method="POST">
        ${csrfField(csrfToken)}
        <div class="form-group">
          <label class="form-label" for="name">Full Name *</label>
          <input class="form-control" id="name" name="name" type="text" maxlength="255" required value="${escapeHtml(v.name || '')}" />
          ${errors.name ? `<div class="field-error">${escapeHtml(errors.name)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="email">Email Address *</label>
          <input class="form-control" id="email" name="email" type="email" maxlength="255" required value="${escapeHtml(v.email || '')}" />
          ${errors.email ? `<div class="field-error">${escapeHtml(errors.email)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="password">Reset Password (optional, 8–128 chars)</label>
          <input class="form-control" id="password" name="password" type="password" minlength="8" maxlength="128" placeholder="Leave blank to preserve current password" />
          ${errors.password ? `<div class="field-error">${escapeHtml(errors.password)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="role">Account Type</label>
          <select class="form-control" id="role" name="role">
            <option value="" ${!v.role ? 'selected' : ''}>Not specified (NULL)</option>
            <option value="student" ${v.role === 'student' ? 'selected' : ''}>Student</option>
            <option value="alumni" ${v.role === 'alumni' ? 'selected' : ''}>Alumni</option>
          </select>
          ${errors.role ? `<div class="field-error">${escapeHtml(errors.role)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="auth_role">Authorization Role *</label>
          <select class="form-control" id="auth_role" name="auth_role">
            <option value="user" ${v.auth_role !== 'admin' ? 'selected' : ''}>user (Standard)</option>
            <option value="admin" ${v.auth_role === 'admin' ? 'selected' : ''}>admin (Single Administrator Only)</option>
          </select>
          ${errors.auth_role ? `<div class="field-error">${escapeHtml(errors.auth_role)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="department">Department (optional)</label>
          <input class="form-control" id="department" name="department" type="text" maxlength="150" value="${escapeHtml(v.department || '')}" />
          ${errors.department ? `<div class="field-error">${escapeHtml(errors.department)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="graduation_year">Graduation Year (optional)</label>
          <input class="form-control" id="graduation_year" name="graduation_year" type="number" min="1950" max="${maxYear}" value="${escapeHtml(v.graduation_year || '')}" />
          ${errors.graduation_year ? `<div class="field-error">${escapeHtml(errors.graduation_year)}</div>` : ''}
        </div>
        <div class="actions-cell">
          <button type="submit" class="btn btn-primary">Save Changes</button>
          <a href="/admin/users" class="btn btn-secondary">Back to Users</a>
        </div>
      </form>
    </div>
  `;

  return getAdminLayout(`Edit User #${user.id}`, 'users', content, currentUser);
};

const renderAdminAnnouncementsPage = ({
  announcements = [],
  values = {},
  errors = {},
  successMessage = '',
  errorMessage = '',
  currentUser = null,
  csrfToken = ''
}) => {
  const rowsHtml =
    announcements.length === 0
      ? `<tr><td colspan="5" class="empty-state">No announcements found.</td></tr>`
      : announcements
          .map(
            (a) => `
          <tr>
            <td>#${a.id}</td>
            <td><strong>${escapeHtml(a.title)}</strong></td>
            <td style="color: var(--secondary-text); max-width: 340px;">${escapeHtml(
              String(a.content || '').length > 140
                ? `${String(a.content).slice(0, 140)}...`
                : a.content
            )}</td>
            <td>${formatDate(a.created_at)}</td>
            <td>
              <div class="actions-cell">
                <a href="/admin/announcements/${a.id}/edit" class="btn btn-secondary btn-sm">Edit</a>
                <form action="/admin/announcements/${a.id}/delete" method="POST" style="margin:0;" onsubmit="return confirm('Delete announcement #${a.id}?');">
                  ${csrfField(csrfToken)}
                  <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                </form>
              </div>
            </td>
          </tr>`
          )
          .join('');

  const content = `
    ${renderAlerts({ successMessage, errorMessage })}
    <div class="grid-2">
      <div class="card">
        <h2>Create Announcement</h2>
        <p class="card-subtitle">Publish a campus or alumni announcement visible in the public Announcements board.</p>
        <form action="/admin/announcements" method="POST">
          ${csrfField(csrfToken)}
          <div class="form-group">
            <label class="form-label" for="title">Title *</label>
            <input class="form-control" id="title" name="title" type="text" maxlength="255" required value="${escapeHtml(values.title || '')}" />
            ${errors.title ? `<div class="field-error">${escapeHtml(errors.title)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="content">Content *</label>
            <textarea class="form-control" id="content" name="content" required>${escapeHtml(values.content || '')}</textarea>
            ${errors.content ? `<div class="field-error">${escapeHtml(errors.content)}</div>` : ''}
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Publish Announcement</button>
        </form>
      </div>

      <div class="card">
        <h2>All Announcements (${announcements.length})</h2>
        <p class="card-subtitle">Edit or remove announcements across the system.</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Content</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  return getAdminLayout('Manage Announcements', 'announcements', content, currentUser);
};

const renderAdminAnnouncementEditPage = ({
  announcement,
  values = {},
  errors = {},
  errorMessage = '',
  currentUser = null,
  csrfToken = ''
}) => {
  const v = {
    title: values.title !== undefined ? values.title : announcement.title,
    content: values.content !== undefined ? values.content : announcement.content
  };

  const content = `
    ${renderAlerts({ errorMessage })}
    <div class="card" style="max-width: 720px;">
      <h2>Edit Announcement #${announcement.id}</h2>
      <p class="card-subtitle">Update the title or body of this announcement.</p>
      <form action="/admin/announcements/${announcement.id}" method="POST">
        ${csrfField(csrfToken)}
        <div class="form-group">
          <label class="form-label" for="title">Title *</label>
          <input class="form-control" id="title" name="title" type="text" maxlength="255" required value="${escapeHtml(v.title || '')}" />
          ${errors.title ? `<div class="field-error">${escapeHtml(errors.title)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="content">Content *</label>
          <textarea class="form-control" id="content" name="content" rows="6" required>${escapeHtml(v.content || '')}</textarea>
          ${errors.content ? `<div class="field-error">${escapeHtml(errors.content)}</div>` : ''}
        </div>
        <div class="actions-cell">
          <button type="submit" class="btn btn-primary">Save Changes</button>
          <a href="/admin/announcements" class="btn btn-secondary">Back to Announcements</a>
        </div>
      </form>
    </div>
  `;

  return getAdminLayout(`Edit Announcement #${announcement.id}`, 'announcements', content, currentUser);
};

const renderAdminJobPostingsPage = ({
  jobPostings = [],
  users = [],
  values = {},
  errors = {},
  successMessage = '',
  errorMessage = '',
  currentUser = null,
  csrfToken = ''
}) => {
  const userOptions = users
    .map(
      (u) =>
        `<option value="${u.id}" ${String(values.user_id || '') === String(u.id) ? 'selected' : ''}>#${u.id} ${escapeHtml(u.name)} (${escapeHtml(u.email)})</option>`
    )
    .join('');

  const rowsHtml =
    jobPostings.length === 0
      ? `<tr><td colspan="6" class="empty-state">No job postings found.</td></tr>`
      : jobPostings
          .map(
            (job) => `
          <tr>
            <td>#${job.id}</td>
            <td>
              <strong>${escapeHtml(job.title)}</strong><br/>
              <span style="color: var(--secondary-text); font-size: 0.82rem;">${escapeHtml(job.company)}</span>
            </td>
            <td>${escapeHtml(job.location || job.city || '—')}</td>
            <td>${job.user_id ? `User #${job.user_id}` : '<span style="color: var(--muted-text);">Unassigned</span>'}</td>
            <td>${formatDate(job.created_at)}</td>
            <td>
              <div class="actions-cell">
                <a href="/admin/job-postings/${job.id}/edit" class="btn btn-secondary btn-sm">Edit</a>
                <form action="/admin/job-postings/${job.id}/delete" method="POST" style="margin:0;" onsubmit="return confirm('Delete job posting #${job.id}? Deletion is blocked if applications exist for this posting.');">
                  ${csrfField(csrfToken)}
                  <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                </form>
              </div>
            </td>
          </tr>`
          )
          .join('');

  const content = `
    ${renderAlerts({ successMessage, errorMessage })}
    <div class="grid-2">
      <div class="card">
        <h2>Create Job Posting</h2>
        <p class="card-subtitle">Job titles are limited to 120 characters. Postings with applications cannot be deleted directly.</p>
        <form action="/admin/job-postings" method="POST">
          ${csrfField(csrfToken)}
          <div class="form-group">
            <label class="form-label" for="title">Job Title * (max 120 chars)</label>
            <input class="form-control" id="title" name="title" type="text" maxlength="120" required value="${escapeHtml(values.title || '')}" />
            ${errors.title ? `<div class="field-error">${escapeHtml(errors.title)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="company">Company *</label>
            <input class="form-control" id="company" name="company" type="text" maxlength="255" required value="${escapeHtml(values.company || '')}" />
            ${errors.company ? `<div class="field-error">${escapeHtml(errors.company)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="location">Location / City</label>
            <input class="form-control" id="location" name="location" type="text" maxlength="255" value="${escapeHtml(values.location || '')}" />
            ${errors.location ? `<div class="field-error">${escapeHtml(errors.location)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="contact_email">Contact Email</label>
            <input class="form-control" id="contact_email" name="contact_email" type="email" maxlength="255" value="${escapeHtml(values.contact_email || '')}" />
            ${errors.contact_email ? `<div class="field-error">${escapeHtml(errors.contact_email)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="user_id">Posted By User (optional)</label>
            <select class="form-control" id="user_id" name="user_id">
              <option value="">Unassigned (NULL)</option>
              ${userOptions}
            </select>
            ${errors.user_id ? `<div class="field-error">${escapeHtml(errors.user_id)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="description">Description</label>
            <textarea class="form-control" id="description" name="description">${escapeHtml(values.description || '')}</textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Create Job Posting</button>
        </form>
      </div>

      <div class="card">
        <h2>All Job Postings (${jobPostings.length})</h2>
        <p class="card-subtitle">Manage job board listings and ownership.</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Role &amp; Company</th>
                <th>Location</th>
                <th>Owner</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  return getAdminLayout('Manage Job Postings', 'job-postings', content, currentUser);
};

const renderAdminJobPostingEditPage = ({
  jobPosting,
  users = [],
  applicationsCount = 0,
  values = {},
  errors = {},
  errorMessage = '',
  currentUser = null,
  csrfToken = ''
}) => {
  const v = {
    title: values.title !== undefined ? values.title : jobPosting.title,
    company: values.company !== undefined ? values.company : jobPosting.company,
    location: values.location !== undefined ? values.location : (jobPosting.location || jobPosting.city || ''),
    contact_email: values.contact_email !== undefined ? values.contact_email : (jobPosting.contact_email || ''),
    user_id: values.user_id !== undefined ? values.user_id : (jobPosting.user_id || ''),
    description: values.description !== undefined ? values.description : (jobPosting.description || '')
  };

  const userOptions = users
    .map(
      (u) =>
        `<option value="${u.id}" ${String(v.user_id || '') === String(u.id) ? 'selected' : ''}>#${u.id} ${escapeHtml(u.name)} (${escapeHtml(u.email)})</option>`
    )
    .join('');

  const content = `
    ${renderAlerts({
      errorMessage,
      warningMessage:
        applicationsCount > 0
          ? `This job posting currently has ${applicationsCount} application(s). Delete or reassign those applications before deleting this job posting.`
          : ''
    })}
    <div class="card" style="max-width: 720px;">
      <h2>Edit Job Posting #${jobPosting.id}</h2>
      <p class="card-subtitle">Update job details, owner, or description.</p>
      <form action="/admin/job-postings/${jobPosting.id}" method="POST">
        ${csrfField(csrfToken)}
        <div class="form-group">
          <label class="form-label" for="title">Job Title * (max 120 chars)</label>
          <input class="form-control" id="title" name="title" type="text" maxlength="120" required value="${escapeHtml(v.title || '')}" />
          ${errors.title ? `<div class="field-error">${escapeHtml(errors.title)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="company">Company *</label>
          <input class="form-control" id="company" name="company" type="text" maxlength="255" required value="${escapeHtml(v.company || '')}" />
          ${errors.company ? `<div class="field-error">${escapeHtml(errors.company)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="location">Location / City</label>
          <input class="form-control" id="location" name="location" type="text" maxlength="255" value="${escapeHtml(v.location || '')}" />
          ${errors.location ? `<div class="field-error">${escapeHtml(errors.location)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="contact_email">Contact Email</label>
          <input class="form-control" id="contact_email" name="contact_email" type="email" maxlength="255" value="${escapeHtml(v.contact_email || '')}" />
          ${errors.contact_email ? `<div class="field-error">${escapeHtml(errors.contact_email)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="user_id">Posted By User (optional)</label>
          <select class="form-control" id="user_id" name="user_id">
            <option value="">Unassigned (NULL)</option>
            ${userOptions}
          </select>
          ${errors.user_id ? `<div class="field-error">${escapeHtml(errors.user_id)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="description">Description</label>
          <textarea class="form-control" id="description" name="description" rows="5">${escapeHtml(v.description || '')}</textarea>
        </div>
        <div class="actions-cell">
          <button type="submit" class="btn btn-primary">Save Changes</button>
          <a href="/admin/job-postings" class="btn btn-secondary">Back to Job Postings</a>
        </div>
      </form>
    </div>
  `;

  return getAdminLayout(`Edit Job Posting #${jobPosting.id}`, 'job-postings', content, currentUser);
};

const renderAdminApplicationsPage = ({
  applications = [],
  jobPostings = [],
  users = [],
  values = {},
  errors = {},
  successMessage = '',
  errorMessage = '',
  currentUser = null,
  csrfToken = ''
}) => {
  const jobOptions = jobPostings
    .map(
      (j) =>
        `<option value="${j.id}" ${String(values.job_posting_id || '') === String(j.id) ? 'selected' : ''}>#${j.id} ${escapeHtml(j.title)} — ${escapeHtml(j.company)}</option>`
    )
    .join('');

  const userOptions = users
    .map(
      (u) =>
        `<option value="${u.id}" ${String(values.user_id || '') === String(u.id) ? 'selected' : ''}>#${u.id} ${escapeHtml(u.name)} (${escapeHtml(u.email)})</option>`
    )
    .join('');

  const statusOptions = ALLOWED_APPLICATION_STATUSES.map(
    (st) => `<option value="${st}" ${(values.status || 'PENDING') === st ? 'selected' : ''}>${st}</option>`
  ).join('');

  const rowsHtml =
    applications.length === 0
      ? `<tr><td colspan="7" class="empty-state">No applications found.</td></tr>`
      : applications
          .map(
            (app) => `
          <tr>
            <td>#${app.id}</td>
            <td>
              <strong>${escapeHtml(app.applicant_name)}</strong><br/>
              <span style="color: var(--muted-text); font-size: 0.82rem;">${escapeHtml(app.applicant_email)}</span>
            </td>
            <td>Job #${app.job_posting_id}${app.job_title ? `<br/><span style="color: var(--secondary-text); font-size: 0.82rem;">${escapeHtml(app.job_title)}${app.job_company ? ` (${escapeHtml(app.job_company)})` : ''}</span>` : ''}</td>
            <td>${app.user_id ? `User #${app.user_id}` : '<span style="color: var(--muted-text);">Guest (NULL)</span>'}</td>
            <td><span class="pill ${statusPillClass(app.status)}">${escapeHtml(app.status)}</span></td>
            <td>${formatDate(app.created_at)}</td>
            <td>
              <div class="actions-cell">
                <a href="/admin/applications/${app.id}/edit" class="btn btn-secondary btn-sm">Edit</a>
                <form action="/admin/applications/${app.id}/delete" method="POST" style="margin:0;" onsubmit="return confirm('Delete application #${app.id}?');">
                  ${csrfField(csrfToken)}
                  <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                </form>
              </div>
            </td>
          </tr>`
          )
          .join('');

  const content = `
    ${renderAlerts({ successMessage, errorMessage })}
    <div class="grid-2">
      <div class="card">
        <h2>Create Application</h2>
        <p class="card-subtitle">Create a linked user application or an unlinked guest application (user_id = NULL).</p>
        <form action="/admin/applications" method="POST">
          ${csrfField(csrfToken)}
          <div class="form-group">
            <label class="form-label" for="job_posting_id">Job Posting *</label>
            <select class="form-control" id="job_posting_id" name="job_posting_id" required>
              <option value="">Select a job posting...</option>
              ${jobOptions}
            </select>
            ${errors.job_posting_id ? `<div class="field-error">${escapeHtml(errors.job_posting_id)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="user_id">Linked User (optional — leave empty for guest)</label>
            <select class="form-control" id="user_id" name="user_id">
              <option value="">Guest / No Linked User (NULL)</option>
              ${userOptions}
            </select>
            ${errors.user_id ? `<div class="field-error">${escapeHtml(errors.user_id)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="applicant_name">Applicant Name *</label>
            <input class="form-control" id="applicant_name" name="applicant_name" type="text" maxlength="255" required value="${escapeHtml(values.applicant_name || '')}" />
            ${errors.applicant_name ? `<div class="field-error">${escapeHtml(errors.applicant_name)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="applicant_email">Applicant Email *</label>
            <input class="form-control" id="applicant_email" name="applicant_email" type="email" maxlength="255" required value="${escapeHtml(values.applicant_email || '')}" />
            ${errors.applicant_email ? `<div class="field-error">${escapeHtml(errors.applicant_email)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="status">Status *</label>
            <select class="form-control" id="status" name="status">
              ${statusOptions}
            </select>
            ${errors.status ? `<div class="field-error">${escapeHtml(errors.status)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="resume_url">Resume URL (optional)</label>
            <input class="form-control" id="resume_url" name="resume_url" type="url" maxlength="255" value="${escapeHtml(values.resume_url || '')}" />
            ${errors.resume_url ? `<div class="field-error">${escapeHtml(errors.resume_url)}</div>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label" for="cover_letter">Cover Letter (optional)</label>
            <textarea class="form-control" id="cover_letter" name="cover_letter">${escapeHtml(values.cover_letter || '')}</textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Create Application</button>
        </form>
      </div>

      <div class="card">
        <h2>All Applications (${applications.length})</h2>
        <p class="card-subtitle">Review applicant statuses and update or remove records.</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Applicant</th>
                <th>Job Posting</th>
                <th>User Link</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  return getAdminLayout('Manage Applications', 'applications', content, currentUser);
};

const renderAdminApplicationEditPage = ({
  application,
  jobPostings = [],
  users = [],
  values = {},
  errors = {},
  errorMessage = '',
  currentUser = null,
  csrfToken = ''
}) => {
  const v = {
    job_posting_id: values.job_posting_id !== undefined ? values.job_posting_id : application.job_posting_id,
    user_id: values.user_id !== undefined ? values.user_id : (application.user_id || ''),
    applicant_name: values.applicant_name !== undefined ? values.applicant_name : application.applicant_name,
    applicant_email: values.applicant_email !== undefined ? values.applicant_email : application.applicant_email,
    status: values.status !== undefined ? values.status : application.status,
    resume_url: values.resume_url !== undefined ? values.resume_url : (application.resume_url || ''),
    cover_letter: values.cover_letter !== undefined ? values.cover_letter : (application.cover_letter || '')
  };

  const jobOptions = jobPostings
    .map(
      (j) =>
        `<option value="${j.id}" ${String(v.job_posting_id || '') === String(j.id) ? 'selected' : ''}>#${j.id} ${escapeHtml(j.title)} — ${escapeHtml(j.company)}</option>`
    )
    .join('');

  const userOptions = users
    .map(
      (u) =>
        `<option value="${u.id}" ${String(v.user_id || '') === String(u.id) ? 'selected' : ''}>#${u.id} ${escapeHtml(u.name)} (${escapeHtml(u.email)})</option>`
    )
    .join('');

  const statusOptions = ALLOWED_APPLICATION_STATUSES.map(
    (st) => `<option value="${st}" ${v.status === st ? 'selected' : ''}>${st}</option>`
  ).join('');

  const content = `
    ${renderAlerts({ errorMessage })}
    <div class="card" style="max-width: 720px;">
      <h2>Edit Application #${application.id}</h2>
      <p class="card-subtitle">Update application review status, applicant contact info, or linked job posting.</p>
      <form action="/admin/applications/${application.id}" method="POST">
        ${csrfField(csrfToken)}
        <div class="form-group">
          <label class="form-label" for="job_posting_id">Job Posting *</label>
          <select class="form-control" id="job_posting_id" name="job_posting_id" required>
            ${jobOptions}
          </select>
          ${errors.job_posting_id ? `<div class="field-error">${escapeHtml(errors.job_posting_id)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="user_id">Linked User (optional — empty keeps guest NULL)</label>
          <select class="form-control" id="user_id" name="user_id">
            <option value="">Guest / No Linked User (NULL)</option>
            ${userOptions}
          </select>
          ${errors.user_id ? `<div class="field-error">${escapeHtml(errors.user_id)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="applicant_name">Applicant Name *</label>
          <input class="form-control" id="applicant_name" name="applicant_name" type="text" maxlength="255" required value="${escapeHtml(v.applicant_name || '')}" />
          ${errors.applicant_name ? `<div class="field-error">${escapeHtml(errors.applicant_name)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="applicant_email">Applicant Email *</label>
          <input class="form-control" id="applicant_email" name="applicant_email" type="email" maxlength="255" required value="${escapeHtml(v.applicant_email || '')}" />
          ${errors.applicant_email ? `<div class="field-error">${escapeHtml(errors.applicant_email)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="status">Status *</label>
          <select class="form-control" id="status" name="status">
            ${statusOptions}
          </select>
          ${errors.status ? `<div class="field-error">${escapeHtml(errors.status)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="resume_url">Resume URL (optional)</label>
          <input class="form-control" id="resume_url" name="resume_url" type="url" maxlength="255" value="${escapeHtml(v.resume_url || '')}" />
          ${errors.resume_url ? `<div class="field-error">${escapeHtml(errors.resume_url)}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label" for="cover_letter">Cover Letter (optional)</label>
          <textarea class="form-control" id="cover_letter" name="cover_letter" rows="5">${escapeHtml(v.cover_letter || '')}</textarea>
        </div>
        <div class="actions-cell">
          <button type="submit" class="btn btn-primary">Save Changes</button>
          <a href="/admin/applications" class="btn btn-secondary">Back to Applications</a>
        </div>
      </form>
    </div>
  `;

  return getAdminLayout(`Edit Application #${application.id}`, 'applications', content, currentUser);
};

module.exports = {
  renderAdminErrorPage,
  renderAdminDashboard,
  renderAdminUsersPage,
  renderAdminUserEditPage,
  renderAdminAnnouncementsPage,
  renderAdminAnnouncementEditPage,
  renderAdminJobPostingsPage,
  renderAdminJobPostingEditPage,
  renderAdminApplicationsPage,
  renderAdminApplicationEditPage
};
