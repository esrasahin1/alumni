/**
 * View Layer: Renders Registration HTML Views.
 * Alumni Tracking System — Full Midnight (Dark & Premium) Design System.
 */

const { NAV_AUTH_CSS, renderNavbarLinks } = require('./navAuthHelper');

/**
 * Escapes HTML special characters to prevent XSS vulnerabilities.
 *
 * @param {*} str
 * @returns {string}
 */
const escapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Renders the shared Full Midnight page layout for authentication/registration pages.
 *
 * @param {string} title
 * @param {string} content
 * @param {Object} [options]
 * @param {string} [options.activePage='register']
 * @param {Object|null} [options.currentUser=null]
 * @returns {string} HTML string
 */
const getLayout = (title, content, { activePage = 'register', currentUser = null } = {}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Alumni Tracking System - Account Authentication and Registration.">
  <title>${escapeHtml(title)} - Alumni Tracking System</title>
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

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--midnight-navy);
      color: var(--secondary-text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    h1, h2, h3, .brand-title {
      font-family: "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: var(--soft-white);
      letter-spacing: -0.02em;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .skip-link {
      position: absolute;
      top: -40px;
      left: 16px;
      background: var(--lime);
      color: var(--midnight-navy);
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      font-weight: 700;
      z-index: 200;
      transition: top 0.2s;
    }

    .skip-link:focus {
      top: 12px;
    }

    /* Sticky Glassmorphic Top Navigation */
    .top-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(16, 24, 39, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--subtle-border);
      width: 100%;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, var(--electric-blue), #4361ee);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--soft-white);
      box-shadow: 0 4px 14px rgba(109, 140, 255, 0.35);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.15;
    }

    .brand-subtitle {
      font-size: 11px;
      color: var(--secondary-text);
      letter-spacing: 0.4px;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .nav-link {
      padding: 7px 13px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 500;
      color: var(--secondary-text);
      transition: var(--transition);
    }

    .nav-link:hover {
      color: var(--soft-white);
      background: rgba(109, 140, 255, 0.12);
    }

    .nav-link.active {
      color: var(--soft-white);
      background: rgba(109, 140, 255, 0.18);
      border: 1px solid rgba(109, 140, 255, 0.35);
    }

    .nav-cta {
      border: 1px solid rgba(213, 243, 106, 0.45);
      color: var(--lime);
      font-weight: 600;
    }

    .nav-cta:hover {
      background: rgba(213, 243, 106, 0.12) !important;
      border-color: var(--lime) !important;
      color: var(--lime) !important;
      transform: translateY(-1px);
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
      transition: var(--transition);
      flex-shrink: 0;
    }

    .mobile-menu-toggle:hover {
      border-color: var(--electric-blue);
      color: var(--lime);
    }

    .mobile-menu-toggle .icon-close {
      display: none;
    }

    .mobile-menu-toggle[aria-expanded="true"] .icon-hamburger {
      display: none;
    }

    .mobile-menu-toggle[aria-expanded="true"] .icon-close {
      display: block;
    }

    /* Main Content */
    .auth-main {
      flex: 1;
      width: 100%;
      padding: 40px 24px 64px;
    }

    .container {
      max-width: 760px;
      margin: 0 auto;
      width: 100%;
    }

    .breadcrumb-nav {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--secondary-text);
      margin-bottom: 16px;
    }

    .breadcrumb-nav a {
      color: var(--electric-blue);
      font-weight: 500;
    }

    .breadcrumb-nav a:hover {
      text-decoration: underline;
    }

    .page-header {
      margin-bottom: 28px;
    }

    .page-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--electric-blue);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .page-headline {
      font-size: 34px;
      font-weight: 800;
      line-height: 1.2;
      color: var(--soft-white);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .page-subtitle {
      font-size: 15px;
      color: var(--secondary-text);
      line-height: 1.6;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 600;
      vertical-align: middle;
    }

    .badge-navy {
      background: rgba(109, 140, 255, 0.12);
      color: var(--electric-blue);
      border: 1px solid rgba(109, 140, 255, 0.35);
    }

    /* Cards & Alerts */
    .card {
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-md);
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-card);
      transition: var(--transition);
    }

    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--soft-white);
      margin-bottom: 8px;
    }

    .card-description {
      font-size: 14px;
      color: var(--secondary-text);
      margin-bottom: 22px;
    }

    .card-success {
      border-color: rgba(52, 211, 153, 0.45);
      background: linear-gradient(180deg, rgba(52, 211, 153, 0.12) 0%, var(--secondary-navy) 100%);
    }

    .card-danger {
      border-color: rgba(229, 62, 62, 0.5);
      background: linear-gradient(180deg, rgba(229, 62, 62, 0.12) 0%, var(--secondary-navy) 100%);
    }

    .card-info {
      border-color: rgba(109, 140, 255, 0.5);
      background: linear-gradient(180deg, rgba(109, 140, 255, 0.14) 0%, var(--secondary-navy) 100%);
    }

    .alert-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--soft-white);
    }

    .alert-success-text {
      color: #a7f3d0;
      font-size: 14px;
    }

    .alert-info-text {
      color: #dbeafe;
      font-size: 14px;
    }

    .error-list {
      margin-left: 20px;
      color: #feb2b2;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* Form Controls */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .form-group {
      margin-bottom: 18px;
    }

    .form-grid .form-group {
      margin-bottom: 0;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.3px;
      margin-bottom: 8px;
      color: var(--secondary-text);
    }

    .required-mark {
      color: var(--lime);
      margin-left: 2px;
    }

    .optional-tag {
      font-size: 11px;
      font-weight: 500;
      color: #8392a8;
      margin-left: 6px;
    }

    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="number"],
    select {
      width: 100%;
      padding: 12px 14px;
      background-color: var(--midnight-navy);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-sm);
      font-size: 15px;
      color: var(--soft-white);
      box-sizing: border-box;
      font-family: inherit;
      transition: var(--transition);
    }

    input[type="text"]:focus,
    input[type="email"]:focus,
    input[type="password"]:focus,
    input[type="number"]:focus,
    select:focus {
      outline: none;
      border-color: var(--electric-blue);
      box-shadow: 0 0 0 3px rgba(109, 140, 255, 0.25);
    }

    input::placeholder {
      color: #5d6f8a;
    }

    .input-error {
      border-color: rgba(229, 62, 62, 0.85) !important;
    }

    .field-error {
      margin-top: 6px;
      font-size: 12px;
      color: #feb2b2;
      font-weight: 500;
    }

    .field-hint {
      margin-top: 6px;
      font-size: 12px;
      color: #8392a8;
    }

    .section-divider {
      border: none;
      border-top: 1px solid rgba(53, 68, 93, 0.6);
      margin: 22px 0;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 22px;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: var(--transition);
      font-family: inherit;
      line-height: 1.2;
    }

    .btn-lime {
      background-color: var(--lime);
      color: var(--midnight-navy);
      font-weight: 700;
      border: none;
    }

    .btn-lime:hover {
      background-color: var(--lime-hover);
      color: var(--midnight-navy);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(213, 243, 106, 0.3);
    }

    .btn-secondary-dark {
      background: rgba(32, 46, 70, 0.6);
      color: var(--soft-white);
      border: 1px solid var(--subtle-border);
    }

    .btn-secondary-dark:hover {
      background: rgba(40, 58, 88, 0.9);
      border-color: var(--electric-blue);
      color: var(--soft-white);
      transform: translateY(-1px);
    }

    .actions-cluster {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
      margin-top: 24px;
    }

    /* Footer */
    .footer {
      background: #0b111c;
      border-top: 1px solid var(--subtle-border);
      padding: 40px 24px 32px;
      margin-top: auto;
      width: 100%;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .footer-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(53, 68, 93, 0.6);
    }

    .footer-brand {
      font-size: 16px;
      font-weight: 700;
      color: var(--soft-white);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .footer-brand-icon {
      color: var(--lime);
      display: flex;
      align-items: center;
    }

    .footer-nav {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .footer-nav a {
      font-size: 12px;
      color: #8392a8;
      font-weight: 500;
      transition: var(--transition);
    }

    .footer-nav a:hover {
      color: var(--lime);
    }

    .footer-nav a.active {
      color: var(--electric-blue);
      font-weight: 600;
    }

    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
      font-size: 13px;
      color: #8392a8;
    }

    .arch-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .arch-tag {
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: var(--secondary-text);
    }

    @media (max-width: 900px) {
      .mobile-menu-toggle {
        display: flex;
      }

      .nav-container {
        flex-wrap: wrap;
      }

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

      .nav-menu.is-open {
        display: flex;
      }

      .nav-link {
        width: 100%;
        padding: 10px 14px;
        font-size: 14px;
      }

      .page-headline {
        font-size: 28px;
      }
    }

    @media (max-width: 640px) {
      .auth-main {
        padding: 24px 16px 48px;
      }

      .card {
        padding: 20px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .page-headline {
        font-size: 24px;
      }

      .footer-top, .footer-bottom {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .footer-nav {
        flex-direction: column;
        gap: 10px;
      }

      .actions-cluster {
        flex-direction: column;
        align-items: stretch;
      }

      .actions-cluster .btn {
        width: 100%;
      }
    }
  </style>
</head>
<body>

  <a href="#register-main-content" class="skip-link">Skip to main content</a>

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
        ${renderNavbarLinks({ currentUser, activeNav: activePage, escapeHtml })}
      </nav>
    </div>
  </header>

  <main class="auth-main" id="register-main-content">
    <div class="container">
      ${content}
    </div>
  </main>

  <footer class="footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span>Alumni Tracking System</span>
        </div>
        <div class="footer-nav">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/users">Users</a>
          <a href="/announcements">Announcements</a>
          <a href="/job-postings">Job Postings</a>
          <a href="/applications">Applications</a>
          <a href="/login" class="${activePage === 'login' ? 'active' : ''}">Login</a>
          <a href="/register" class="${activePage === 'register' ? 'active' : ''}">Register</a>
          <a href="/api/swagger" target="_blank">Swagger Docs</a>
          <a href="/api/health" target="_blank">System Health</a>
        </div>
      </div>
      <div class="footer-bottom">
        <div>&copy; 2026 Alumni Tracking System &bull; Enterprise Alumni &amp; Career Network</div>
        <div class="arch-tags">
          <span class="arch-tag">Node.js &amp; Express (MVC)</span>
          <span class="arch-tag">MySQL 8.0 Persistence</span>
          <span class="arch-tag">OpenAPI 3.0</span>
        </div>
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

/**
 * Renders the user registration page (GET /register and validation re-render on POST /register).
 * Never redisplays password or confirm_password values.
 *
 * @param {Object} [options]
 * @param {Object} [options.values={}] - Non-password form values to preserve
 * @param {Array<string>} [options.errors=[]] - Summary validation error messages
 * @param {Object} [options.fieldErrors={}] - Per-field error messages
 * @param {string} [options.successMessage=''] - Registration success banner message
 * @param {Object|null} [options.currentUser=null] - Currently authenticated user, if any
 * @returns {string} HTML string
 */
const renderRegisterPage = ({
  values = {},
  errors = [],
  fieldErrors = {},
  successMessage = '',
  currentUser = null
} = {}) => {
  const safeName = escapeHtml(values.name || '');
  const safeEmail = escapeHtml(values.email || '');
  const selectedRole = values.role === 'student' || values.role === 'alumni' ? values.role : '';
  const safeDepartment = escapeHtml(values.department || '');
  const safeGraduationYear = escapeHtml(values.graduation_year || '');
  const maxGraduationYear = new Date().getFullYear() + 10;

  const successBlock = successMessage
    ? `
      <div class="card card-success" role="status" aria-live="polite">
        <div class="alert-title">✅ Registration Successful</div>
        <p class="alert-success-text">${escapeHtml(successMessage)}</p>
      </div>`
    : '';

  const errorBlock = errors.length > 0
    ? `
      <div class="card card-danger" role="alert" aria-live="assertive">
        <div class="alert-title">⚠️ Please fix the following errors</div>
        <ul class="error-list">
          ${errors.map(err => `<li>${escapeHtml(err)}</li>`).join('')}
        </ul>
      </div>`
    : '';

  const content = `
    <div class="breadcrumb-nav">
      <a href="/">Home</a>
      <span>/</span>
      <span>Register</span>
    </div>

    <div class="page-header">
      <div class="page-eyebrow">🔐 ACCOUNT REGISTRATION</div>
      <h1 class="page-headline">Create Account <span class="badge badge-navy">Student &amp; Alumni</span></h1>
      <p class="page-subtitle">Register as a current student or university alumnus to join the Alumni Tracking System.</p>
    </div>

    ${successBlock}
    ${errorBlock}

    <div class="card">
      <h2 class="card-title">📝 Member Registration Form</h2>
      <p class="card-description">Fields marked with <span class="required-mark">*</span> are required. Your password must be at least 8 characters long.</p>

      <form id="registerForm" action="/register" method="POST">
        <div class="form-grid">
          <div class="form-group full-width">
            <label for="name">Full Name <span class="required-mark">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              required
              maxlength="255"
              autocomplete="name"
              value="${safeName}"
              class="${fieldErrors.name ? 'input-error' : ''}"
              placeholder="e.g. Ayşe Demir"
            >
            ${fieldErrors.name ? `<div class="field-error">${escapeHtml(fieldErrors.name)}</div>` : ''}
          </div>

          <div class="form-group full-width">
            <label for="email">Email <span class="required-mark">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              required
              maxlength="255"
              autocomplete="email"
              value="${safeEmail}"
              class="${fieldErrors.email ? 'input-error' : ''}"
              placeholder="e.g. ayse.demir@alumni.edu.tr"
            >
            ${fieldErrors.email ? `<div class="field-error">${escapeHtml(fieldErrors.email)}</div>` : ''}
          </div>

          <div class="form-group">
            <label for="password">Password <span class="required-mark">*</span></label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minlength="8"
              autocomplete="new-password"
              class="${fieldErrors.password ? 'input-error' : ''}"
              placeholder="At least 8 characters"
            >
            ${fieldErrors.password ? `<div class="field-error">${escapeHtml(fieldErrors.password)}</div>` : '<div class="field-hint">Minimum 8 characters.</div>'}
          </div>

          <div class="form-group">
            <label for="confirm_password">Confirm Password <span class="required-mark">*</span></label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              required
              minlength="8"
              autocomplete="new-password"
              class="${fieldErrors.confirm_password ? 'input-error' : ''}"
              placeholder="Re-enter your password"
            >
            ${fieldErrors.confirm_password ? `<div class="field-error">${escapeHtml(fieldErrors.confirm_password)}</div>` : ''}
          </div>

          <div class="form-group full-width">
            <label for="role">Account Type <span class="required-mark">*</span></label>
            <select
              id="role"
              name="role"
              required
              class="${fieldErrors.role ? 'input-error' : ''}"
            >
              <option value="" ${selectedRole === '' ? 'selected' : ''}>Select account type...</option>
              <option value="student" ${selectedRole === 'student' ? 'selected' : ''}>Student</option>
              <option value="alumni" ${selectedRole === 'alumni' ? 'selected' : ''}>Alumni</option>
            </select>
            ${fieldErrors.role ? `<div class="field-error">${escapeHtml(fieldErrors.role)}</div>` : ''}
          </div>
        </div>

        <hr class="section-divider">

        <div class="form-grid">
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
            ${fieldErrors.department ? `<div class="field-error">${escapeHtml(fieldErrors.department)}</div>` : ''}
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
            ${fieldErrors.graduation_year ? `<div class="field-error">${escapeHtml(fieldErrors.graduation_year)}</div>` : ''}
          </div>
        </div>

        <div class="actions-cluster">
          <button type="submit" id="registerSubmitBtn" class="btn btn-lime">Create Account</button>
          <a href="/login" class="btn btn-secondary-dark">Already have an account? Login</a>
          <a href="/" class="btn btn-secondary-dark">Back to Home</a>
        </div>
      </form>
    </div>
  `;

  return getLayout('Register', content, { activePage: 'register', currentUser });
};

/**
 * Renders the user login page (GET /login and error re-render on POST /login).
 * Never redisplays submitted password values.
 *
 * @param {Object} [options]
 * @param {Object} [options.values={}] - Non-password form values (email)
 * @param {Array<string>} [options.errors=[]] - Summary error messages
 * @param {Object} [options.fieldErrors={}] - Per-field error messages
 * @param {string} [options.successMessage=''] - Logout/info banner message
 * @param {string} [options.infoMessage=''] - Auth-required notice message
 * @param {Object|null} [options.currentUser=null] - Currently authenticated user, if any
 * @returns {string} HTML string
 */
const renderLoginPage = ({
  values = {},
  errors = [],
  fieldErrors = {},
  successMessage = '',
  infoMessage = '',
  currentUser = null
} = {}) => {
  const safeEmail = escapeHtml(values.email || '');

  const infoBlock = infoMessage
    ? `
      <div class="card card-info" role="status" aria-live="polite">
        <div class="alert-title">🔒 Authentication Required</div>
        <p class="alert-info-text">${escapeHtml(infoMessage)}</p>
      </div>`
    : '';

  const successBlock = successMessage
    ? `
      <div class="card card-success" role="status" aria-live="polite">
        <div class="alert-title">✅ Session Updated</div>
        <p class="alert-success-text">${escapeHtml(successMessage)}</p>
      </div>`
    : '';

  const errorBlock = errors.length > 0
    ? `
      <div class="card card-danger" role="alert" aria-live="assertive">
        <div class="alert-title">⚠️ Sign In Failed</div>
        <ul class="error-list">
          ${errors.map(err => `<li>${escapeHtml(err)}</li>`).join('')}
        </ul>
      </div>`
    : '';

  const activeSessionBlock = currentUser
    ? `
      <div class="card card-success">
        <div class="alert-title">👤 Active Session</div>
        <p class="alert-success-text" style="margin-bottom: 14px;">
          You are currently signed in as <strong>${escapeHtml(currentUser.name)}</strong> (${escapeHtml(currentUser.email)}).
        </p>
        <form action="/logout" method="POST" style="margin: 0;">
          <button type="submit" id="logoutBtn" class="btn btn-secondary-dark">Logout</button>
        </form>
      </div>`
    : '';

  const content = `
    <div class="breadcrumb-nav">
      <a href="/">Home</a>
      <span>/</span>
      <span>Login</span>
    </div>

    <div class="page-header">
      <div class="page-eyebrow">🔑 MEMBER AUTHENTICATION</div>
      <h1 class="page-headline">Sign In <span class="badge badge-navy">Alumni Portal</span></h1>
      <p class="page-subtitle">Sign in with your registered email address and password to start an authenticated session.</p>
    </div>

    ${infoBlock}
    ${successBlock}
    ${errorBlock}
    ${activeSessionBlock}

    <div class="card">
      <h2 class="card-title">🔐 Account Login</h2>
      <p class="card-description">Enter your registered credentials below. Passwords are never stored or displayed in plain text.</p>

      <form id="loginForm" action="/login" method="POST">
        <div class="form-group">
          <label for="email">Email <span class="required-mark">*</span></label>
          <input
            type="email"
            id="email"
            name="email"
            required
            maxlength="255"
            autocomplete="email"
            value="${safeEmail}"
            class="${fieldErrors.email ? 'input-error' : ''}"
            placeholder="e.g. ayse.demir@alumni.edu.tr"
          >
          ${fieldErrors.email ? `<div class="field-error">${escapeHtml(fieldErrors.email)}</div>` : ''}
        </div>

        <div class="form-group">
          <label for="password">Password <span class="required-mark">*</span></label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autocomplete="current-password"
            class="${fieldErrors.password ? 'input-error' : ''}"
            placeholder="Enter your password"
          >
          ${fieldErrors.password ? `<div class="field-error">${escapeHtml(fieldErrors.password)}</div>` : ''}
        </div>

        <div class="actions-cluster">
          <button type="submit" id="loginSubmitBtn" class="btn btn-lime">Sign In</button>
          <a href="/register" class="btn btn-secondary-dark">Create an Account</a>
          <a href="/" class="btn btn-secondary-dark">Back to Home</a>
        </div>
      </form>
    </div>
  `;

  return getLayout('Login', content, { activePage: 'login', currentUser });
};

module.exports = {
  escapeHtml,
  renderRegisterPage,
  renderLoginPage
};
