const { NAV_AUTH_CSS, renderNavbarLinks } = require('./navAuthHelper');

const escapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const formatDate = (dateInput, fallback = 'Not available') => {
  if (!dateInput) return fallback;
  try {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return fallback;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch (_) {
    return fallback;
  }
};

const formatAccountType = (role) => {
  const normalized = String(role || '').trim().toLowerCase();
  if (normalized === 'student') return 'Student';
  if (normalized === 'alumni') return 'Alumni';
  return 'Not specified';
};

/**
 * Renders the authenticated user's personal profile page (GET /profile) in Full Midnight style.
 *
 * @param {Object} [options={}]
 * @param {Object} [options.profile={}]
 * @param {Object|null} [options.values=null]
 * @param {string[]} [options.errors=[]]
 * @param {Object} [options.fieldErrors={}]
 * @param {string} [options.successMessage='']
 * @param {string} [options.csrfToken='']
 * @param {Object|null} [options.currentUser=null]
 * @returns {string}
 */
const renderProfilePage = ({
  profile = {},
  values = null,
  errors = [],
  fieldErrors = {},
  successMessage = '',
  csrfToken = '',
  currentUser = null
} = {}) => {
  const formValues = values || {
    name: profile.name || '',
    department: profile.department || '',
    graduation_year: profile.graduation_year !== null && profile.graduation_year !== undefined
      ? String(profile.graduation_year)
      : ''
  };

  const safeName = escapeHtml(formValues.name || '');
  const safeDepartment = escapeHtml(formValues.department || '');
  const safeGraduationYear = escapeHtml(formValues.graduation_year || '');
  const maxGraduationYear = new Date().getFullYear() + 10;

  const accountTypeLabel = formatAccountType(profile.role);
  const displayEmail = escapeHtml(profile.email || 'Not provided');
  const displayDept = profile.department ? escapeHtml(profile.department) : '<span class="muted-value">Not specified</span>';
  const displayGradYear =
    profile.graduation_year !== null && profile.graduation_year !== undefined && profile.graduation_year !== ''
      ? escapeHtml(profile.graduation_year)
      : '<span class="muted-value">Not specified</span>';
  const memberSince = escapeHtml(formatDate(profile.created_at));
  const isAdmin = String(profile.auth_role || '').toLowerCase() === 'admin';
  const isAlumni = !isAdmin && String(profile.role || '').toLowerCase() === 'alumni';

  const successBlock = successMessage
    ? `
      <div class="card card-success" role="status" aria-live="polite">
        <div class="alert-title">✅ Profile Updated</div>
        <p class="alert-success-text">${escapeHtml(successMessage)}</p>
      </div>`
    : '';

  const errorBlock = errors.length > 0
    ? `
      <div class="card card-danger" role="alert" aria-live="assertive">
        <div class="alert-title">⚠️ Please fix the following errors</div>
        <ul class="error-list">
          ${errors.map((err) => `<li>${escapeHtml(err)}</li>`).join('')}
        </ul>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Alumni Tracking System - Personal Profile Management.">
  <title>My Profile - Alumni Tracking System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=Space+Grotesk:wght@400..700&display=swap" rel="stylesheet">
  <style>
    :root {
      --midnight-navy: #101827;
      --secondary-navy: #202E46;
      --electric-blue: #6D8CFF;
      --lime: #D5F36A;
      --lime-hover: #e2fa82;
      --soft-white: #F4F5F7;
      --secondary-text: #B9C3D2;
      --subtle-border: #35445D;
      --border-focus: #6D8CFF;
      --danger-red: #e53e3e;
      --success-green: #34d399;
      --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.35);
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-full: 9999px;
      --transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; max-width: 100%; overflow-x: hidden; }
    body {
      font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--midnight-navy);
      color: var(--secondary-text);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-image: radial-gradient(circle at 12% 10%, rgba(109, 140, 255, 0.10) 0%, transparent 45%),
                        radial-gradient(circle at 88% 85%, rgba(213, 243, 106, 0.06) 0%, transparent 45%);
    }
    h1, h2, h3, .brand-title, .page-headline, .card-title {
      font-family: "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: var(--soft-white);
      letter-spacing: -0.02em;
    }
    a { color: inherit; text-decoration: none; transition: var(--transition); }
    a:focus-visible, button:focus-visible, input:focus-visible {
      outline: 2px solid var(--electric-blue);
      outline-offset: 3px;
    }

    .skip-link {
      position: absolute;
      top: -60px;
      left: 16px;
      background: var(--lime);
      color: var(--midnight-navy);
      padding: 10px 18px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 700;
      z-index: 9999;
    }
    .skip-link:focus { top: 14px; }

    .top-nav {
      background: rgba(16, 24, 39, 0.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--subtle-border);
      position: sticky;
      top: 0;
      z-index: 100;
      width: 100%;
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .brand { display: flex; align-items: center; gap: 12px; color: var(--soft-white); flex-shrink: 0; }
    .brand-icon {
      width: 40px;
      height: 40px;
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      color: var(--lime);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .brand-text { display: flex; flex-direction: column; }
    .brand-title { font-size: 18px; font-weight: 700; line-height: 1.2; }
    .brand-subtitle {
      font-size: 11px;
      color: var(--electric-blue);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }

    .nav-menu { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .nav-link {
      padding: 8px 14px;
      font-size: 14px;
      font-weight: 500;
      color: var(--secondary-text);
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .nav-link:hover {
      color: var(--soft-white);
      background: rgba(32, 46, 70, 0.5);
      border-color: rgba(53, 68, 93, 0.6);
    }
    .nav-link.active {
      color: var(--soft-white);
      background: rgba(109, 140, 255, 0.12);
      border-color: rgba(109, 140, 255, 0.35);
      font-weight: 600;
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
${NAV_AUTH_CSS}

    .mobile-menu-toggle {
      display: none;
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      color: var(--soft-white);
      width: 42px;
      height: 42px;
      border-radius: var(--radius-sm);
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .mobile-menu-toggle .icon-close { display: none; }
    .mobile-menu-toggle[aria-expanded="true"] .icon-hamburger { display: none; }
    .mobile-menu-toggle[aria-expanded="true"] .icon-close { display: block; }

    .profile-main { flex: 1; padding: 38px 20px 64px; }
    .container { max-width: 960px; margin: 0 auto; }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #8392a8;
      margin-bottom: 18px;
    }
    .breadcrumb-nav a:hover { color: var(--lime); }

    .page-header { margin-bottom: 28px; }
    .page-eyebrow {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--electric-blue);
      margin-bottom: 8px;
    }
    .page-headline {
      font-size: 32px;
      font-weight: 700;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 10px;
    }
    .page-subtitle { font-size: 15px; color: var(--secondary-text); max-width: 680px; }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge-navy {
      background: rgba(109, 140, 255, 0.14);
      color: #c7d6ff;
      border: 1px solid rgba(109, 140, 255, 0.35);
    }
    .badge-lime {
      background: rgba(213, 243, 106, 0.14);
      color: var(--lime);
      border: 1px solid rgba(213, 243, 106, 0.4);
    }

    .card {
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-md);
      padding: 26px;
      box-shadow: var(--shadow-card);
      margin-bottom: 24px;
    }
    .card-success {
      border-color: rgba(52, 211, 153, 0.45);
      background: rgba(52, 211, 153, 0.08);
    }
    .card-danger {
      border-color: rgba(229, 62, 62, 0.48);
      background: rgba(229, 62, 62, 0.08);
    }
    .alert-title { font-weight: 700; font-size: 15px; color: var(--soft-white); margin-bottom: 6px; }
    .alert-success-text { color: #a7f3d0; font-size: 14px; }
    .error-list { margin-left: 18px; color: #feb2b2; font-size: 14px; }

    .card-title { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
    .card-description { font-size: 14px; color: var(--secondary-text); margin-bottom: 20px; }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }
    .info-box {
      background: rgba(16, 24, 39, 0.55);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
    }
    .info-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #8392a8;
      margin-bottom: 4px;
      display: block;
    }
    .info-value {
      font-size: 15px;
      font-weight: 600;
      color: var(--soft-white);
      word-break: break-word;
    }
    .muted-value { color: #8392a8; font-weight: 400; }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: 1 / -1; }
    label { font-size: 13px; font-weight: 600; color: var(--soft-white); }
    .required-mark { color: var(--lime); }
    .optional-tag { color: #8392a8; font-weight: 400; font-size: 12px; }

    input {
      width: 100%;
      padding: 11px 14px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--subtle-border);
      background: rgba(16, 24, 39, 0.78);
      color: var(--soft-white);
      font-size: 14px;
      font-family: inherit;
    }
    input[readonly] {
      opacity: 0.72;
      cursor: not-allowed;
      background: rgba(16, 24, 39, 0.45);
    }
    .input-error { border-color: var(--danger-red); }
    .field-error { color: #feb2b2; font-size: 12px; font-weight: 500; }
    .field-hint { color: #8392a8; font-size: 12px; }

    .actions-cluster {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 22px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 11px 20px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      font-family: inherit;
    }
    .btn-lime { background: var(--lime); color: var(--midnight-navy); }
    .btn-lime:hover { background: var(--lime-hover); transform: translateY(-1px); }
    .btn-secondary-dark {
      background: rgba(16, 24, 39, 0.65);
      border-color: var(--subtle-border);
      color: var(--soft-white);
    }
    .btn-secondary-dark:hover { border-color: var(--electric-blue); color: var(--lime); }

    .footer {
      border-top: 1px solid var(--subtle-border);
      background: rgba(16, 24, 39, 0.75);
      padding: 28px 24px;
      margin-top: auto;
    }
    .footer-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }
    .footer-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; }
    .footer-brand { display: flex; align-items: center; gap: 10px; color: var(--soft-white); font-weight: 700; }
    .footer-nav { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; }
    .footer-nav a:hover { color: var(--lime); }
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 13px;
      color: #8392a8;
    }

    @media (max-width: 900px) {
      .mobile-menu-toggle { display: flex; }
      .nav-container { flex-wrap: wrap; }
      .nav-menu {
        display: none;
        width: 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
        padding-top: 14px;
        margin-top: 8px;
        border-top: 1px solid var(--subtle-border);
      }
      .nav-menu.is-open { display: flex; }
      .nav-link { width: 100%; padding: 10px 14px; }
      .info-grid, .form-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <a href="#profile-main-content" class="skip-link">Skip to main content</a>

  <header class="top-nav">
    <div class="nav-container">
      <a href="/" class="brand" title="Alumni Tracking System Home">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-title">Alumni Tracking System</span>
          <span class="brand-subtitle">Alumni &amp; Career Portal</span>
        </div>
      </a>

      <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Toggle navigation menu">
        <svg class="icon-hamburger" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <nav class="nav-menu" id="nav-menu" aria-label="Main Navigation">
        ${renderNavbarLinks({ currentUser, activeNav: 'profile', escapeHtml })}
      </nav>
    </div>
  </header>

  <main class="profile-main" id="profile-main-content">
    <div class="container">
      <div class="breadcrumb-nav">
        <a href="/">Home</a>
        <span>/</span>
        <span>My Profile</span>
      </div>

      <div class="page-header">
        <div class="page-eyebrow">👤 PERSONAL ACCOUNT WORKSPACE</div>
        <h1 class="page-headline">
          My Personal Profile
          <span class="badge ${accountTypeLabel === 'Alumni' ? 'badge-lime' : 'badge-navy'}">${escapeHtml(accountTypeLabel)}</span>
          ${isAdmin ? '<span class="badge badge-lime">Administrator</span>' : ''}
        </h1>
        <p class="page-subtitle">View your verified account details and keep your academic and contact information up to date.</p>
      </div>

      ${successBlock}
      ${errorBlock}

      <section class="card" aria-labelledby="account-overview-heading">
        <h2 class="card-title" id="account-overview-heading">📋 Account Overview</h2>
        <p class="card-description">Account identity and membership details loaded directly from your authenticated session.</p>

        <div class="info-grid">
          <div class="info-box">
            <span class="info-label">Full Name</span>
            <div class="info-value">${escapeHtml(profile.name || '')}</div>
          </div>
          <div class="info-box">
            <span class="info-label">Email Address</span>
            <div class="info-value">${displayEmail}</div>
          </div>
          <div class="info-box">
            <span class="info-label">Account Type</span>
            <div class="info-value">${escapeHtml(accountTypeLabel)}</div>
          </div>
          <div class="info-box">
            <span class="info-label">Department</span>
            <div class="info-value">${displayDept}</div>
          </div>
          <div class="info-box">
            <span class="info-label">Graduation Year</span>
            <div class="info-value">${displayGradYear}</div>
          </div>
          <div class="info-box">
            <span class="info-label">Member Since</span>
            <div class="info-value">${memberSince}</div>
          </div>
        </div>

        <div class="actions-cluster">
          <a href="/job-postings" class="btn btn-secondary-dark">💼 Browse Job Postings</a>
          ${isAlumni ? `<a href="/users/${escapeHtml(profile.id)}/jobs" class="btn btn-secondary-dark">📌 My Job Postings</a>` : ''}
          ${isAdmin ? '<a href="/admin" class="btn btn-secondary-dark">🛡️ Open Admin Panel</a>' : ''}
        </div>
      </section>

      <section class="card" aria-labelledby="edit-profile-heading">
        <h2 class="card-title" id="edit-profile-heading">✏️ Edit Profile Information</h2>
        <p class="card-description">You can update your full name, department, and graduation year. Email address and account roles are read-only for security.</p>

        <form id="profileForm" action="/profile" method="POST">
          <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="name">Full Name <span class="required-mark">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                required
                maxlength="255"
                value="${safeName}"
                class="${fieldErrors.name ? 'input-error' : ''}"
                placeholder="Enter your full name"
              >
              ${fieldErrors.name ? `<div class="field-error">${escapeHtml(fieldErrors.name)}</div>` : ''}
            </div>

            <div class="form-group">
              <label for="readonly-email">Email Address <span class="optional-tag">(Read-only)</span></label>
              <input type="email" id="readonly-email" value="${displayEmail}" readonly aria-readonly="true">
            </div>

            <div class="form-group">
              <label for="readonly-role">Account Type <span class="optional-tag">(Read-only)</span></label>
              <input type="text" id="readonly-role" value="${escapeHtml(accountTypeLabel)}" readonly aria-readonly="true">
            </div>

            <div class="form-group">
              <label for="department">Department <span class="optional-tag">(Optional)</span></label>
              <input
                type="text"
                id="department"
                name="department"
                maxlength="150"
                value="${safeDepartment}"
                class="${fieldErrors.department ? 'input-error' : ''}"
                placeholder="e.g. Computer Engineering"
              >
              ${fieldErrors.department ? `<div class="field-error">${escapeHtml(fieldErrors.department)}</div>` : '<div class="field-hint">Maximum 150 characters.</div>'}
            </div>

            <div class="form-group">
              <label for="graduation_year">Graduation Year <span class="optional-tag">(Optional)</span></label>
              <input
                type="number"
                id="graduation_year"
                name="graduation_year"
                min="1950"
                max="${maxGraduationYear}"
                step="1"
                value="${safeGraduationYear}"
                class="${fieldErrors.graduation_year ? 'input-error' : ''}"
                placeholder="e.g. 2024"
              >
              ${fieldErrors.graduation_year ? `<div class="field-error">${escapeHtml(fieldErrors.graduation_year)}</div>` : `<div class="field-hint">4-digit year between 1950 and ${maxGraduationYear}.</div>`}
            </div>
          </div>

          <div class="actions-cluster">
            <button type="submit" id="saveProfileBtn" class="btn btn-lime">Save Changes</button>
            <a href="/" class="btn btn-secondary-dark">← Back to Home</a>
          </div>
        </form>
      </section>
    </div>
  </main>

  <footer class="footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">Alumni Tracking System</div>
        <div class="footer-nav" aria-label="Quick Links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/announcements">Announcements</a>
          <a href="/job-postings">Job Postings</a>
          <a href="/api/swagger" target="_blank" rel="noopener">Swagger Docs</a>
          <a href="/api/health" target="_blank" rel="noopener">System Health</a>
        </div>
      </div>
      <div class="footer-bottom">
        <div>&copy; 2026 Alumni Tracking System &bull; Personal Profile</div>
      </div>
    </div>
  </footer>

  <script>
    (function() {
      var toggleBtn = document.getElementById('mobile-menu-toggle');
      var navMenu = document.getElementById('nav-menu');
      if (toggleBtn && navMenu) {
        toggleBtn.addEventListener('click', function() {
          var isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
          toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
          navMenu.classList.toggle('is-open');
        });
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
            navMenu.classList.remove('is-open');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.focus();
          }
        });
      }
    })();
  </script>
</body>
</html>`;
};

module.exports = {
  escapeHtml,
  formatDate,
  formatAccountType,
  renderProfilePage
};
