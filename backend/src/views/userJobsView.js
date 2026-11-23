/**
 * View Layer: Renders User Job Postings HTML View (GET /users/:id/jobs).
 * Alumni Tracking System — Full Midnight (Dark & Premium) Design System (Task 6).
 */

/**
 * Filters HTML special characters to prevent Cross-Site Scripting (XSS).
 *
 * @param {string} str
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
 * Formats a date string into "MMM DD, YYYY" (e.g. "Oct 21, 2026") using UTC components.
 *
 * @param {string|Date|null|undefined} dateInput
 * @param {string} [fallback='-']
 * @returns {string}
 */
const formatDate = (dateInput, fallback = '-') => {
  if (!dateInput) return fallback;
  try {
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return fallback;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[dateInput.getUTCMonth()]} ${dateInput.getUTCDate()}, ${dateInput.getUTCFullYear()}`;
    }
    const s = String(dateInput).trim();
    const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const monthIdx = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (monthIdx >= 0 && monthIdx < 12 && day >= 1 && day <= 31) {
        return `${months[monthIdx]} ${day}, ${year}`;
      }
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return fallback;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch (e) {
    return fallback;
  }
};

/**
 * Renders the User Job Postings HTML Page (GET /users/:id/jobs).
 *
 * @param {Object} user - User record { id, name, email }
 * @param {Array} jobPostings - List of job postings created by the user
 * @returns {string} HTML content
 */
const renderUserJobsPage = (user = {}, jobPostings = []) => {
  const jobs = Array.isArray(jobPostings) ? jobPostings : [];
  const userName = user && user.name ? user.name : `User #${user && user.id ? user.id : 'Unknown'}`;
  const userEmail = user && user.email ? user.email : '-';
  const userId = user && user.id ? user.id : '-';

  const rows = jobs.length > 0
    ? jobs.map(job => `
      <tr>
        <td><span class="id-pill">#${escapeHtml(job.id)}</span></td>
        <td>
          <a href="/job-postings/${escapeHtml(job.id)}" style="color: var(--soft-white); font-weight: 600; text-decoration: none; display: inline-block; transition: color 0.2s;" onmouseover="this.style.color='var(--electric-blue)'" onmouseout="this.style.color='var(--soft-white)'">
            ${escapeHtml(job.title)}
          </a>
        </td>
        <td><span class="badge badge-company">${escapeHtml(job.company)}</span></td>
        <td>${escapeHtml(job.location || job.city || '-')}</td>
        <td><small style="color: #8392a8; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${escapeHtml(formatDate(job.createdAt || job.createdDate || job.created_at))}</small></td>
        <td style="white-space: nowrap; text-align: right;">
          <a href="/job-postings/${escapeHtml(job.id)}" class="btn btn-secondary btn-secondary-dark btn-sm" style="margin-right: 4px;">View Details</a>
          <a href="/job-postings/${escapeHtml(job.id)}/applications" class="btn btn-secondary btn-secondary-dark btn-sm">Applications</a>
        </td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--secondary-text); padding: 48px 24px;">
          <div style="font-size: 32px; margin-bottom: 12px;">💼</div>
          <div style="font-size: 16px; font-weight: 600; color: var(--soft-white); margin-bottom: 4px;">No job postings found.</div>
          <div>This user has not published any career opportunities yet.</div>
        </td>
      </tr>
    `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Alumni Tracking System - Job Postings by ${escapeHtml(userName)} in Full Midnight Dark &amp; Premium design.">
  <title>User Job Postings - ${escapeHtml(userName)} - Alumni Tracking System</title>
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
      --danger-red-hover: #c53030;
      --warning-amber: #dd6b20;
      --warning-amber-hover: #c05621;
      --success-green: #34d399;
      --shadow-ambient: 0 8px 32px rgba(0, 0, 0, 0.45);
      --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.35);
      --shadow-card-hover: 0 12px 32px rgba(16, 24, 39, 0.8), 0 0 20px rgba(109, 140, 255, 0.15);
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 16px;
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

    h1, h2, h3, h4, .brand-title, .section-title, .page-headline, .card-title {
      font-family: "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: var(--soft-white);
      letter-spacing: -0.02em;
    }

    a {
      color: inherit;
      text-decoration: none;
      transition: var(--transition);
    }

    a:focus-visible, button:focus-visible {
      outline: 2px solid var(--electric-blue);
      outline-offset: 2px;
    }

    /* Accessibility Skip Link */
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
      transition: top 0.2s;
    }

    .skip-link:focus {
      top: 14px;
    }

    /* Top Sticky Navigation (Matching Full Midnight Chrome) */
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
      position: relative;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--soft-white);
      flex-shrink: 0;
    }

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
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      transition: var(--transition);
      flex-shrink: 0;
    }

    .brand:hover .brand-icon {
      border-color: var(--electric-blue);
      transform: translateY(-1px);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 11px;
      color: var(--electric-blue);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }

    /* Navigation Menu */
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

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
      color: var(--lime) !important;
      transform: translateY(-1px);
    }

    /* Mobile Menu Toggle Button */
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

    /* Main Container */
    .user-jobs-main {
      flex: 1;
      padding: 40px 24px 60px;
      width: 100%;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    /* Breadcrumbs */
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #8392a8;
      margin-bottom: 20px;
    }

    .breadcrumb-nav a {
      color: var(--electric-blue);
      text-decoration: none;
    }

    .breadcrumb-nav a:hover {
      text-decoration: underline;
    }

    .breadcrumb-nav span {
      color: #5d6f8a;
    }

    /* Header Banner */
    .page-header {
      margin-bottom: 32px;
    }

    .page-eyebrow {
      font-size: 12px;
      font-weight: 700;
      color: var(--electric-blue);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-headline {
      font-size: 34px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .page-subtitle {
      font-size: 15px;
      color: var(--secondary-text);
      max-width: 760px;
      line-height: 1.6;
    }

    /* 2-Card Refined Statistics Section */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-md);
      padding: 24px;
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-card);
      transition: var(--transition);
    }

    .stat-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--electric-blue), var(--lime));
      opacity: 0.8;
    }

    .stat-card:hover {
      border-color: var(--electric-blue);
      box-shadow: var(--shadow-card-hover);
      transform: translateY(-2px);
    }

    .stat-value {
      font-family: "Space Grotesk", sans-serif;
      font-size: 36px;
      font-weight: 700;
      color: var(--soft-white);
      line-height: 1.1;
      margin-bottom: 6px;
    }

    .stat-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--secondary-text);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-sublabel {
      font-size: 12px;
      color: #8392a8;
      margin-top: 4px;
    }

    /* Content Cards */
    .card {
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-md);
      padding: 28px;
      margin-bottom: 32px;
      box-shadow: var(--shadow-card);
      transition: var(--transition);
    }

    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--soft-white);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
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

    .btn-secondary, .btn-secondary-dark {
      background: rgba(32, 46, 70, 0.6);
      color: var(--soft-white);
      border: 1px solid var(--subtle-border);
    }

    .btn-secondary:hover, .btn-secondary-dark:hover {
      background: rgba(40, 58, 88, 0.9);
      border-color: var(--electric-blue);
      color: var(--soft-white);
      transform: translateY(-1px);
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 4px;
    }

    /* Table Styles */
    .table-responsive {
      width: 100%;
      overflow-x: auto;
      border-radius: var(--radius-md);
      border: 1px solid var(--subtle-border);
      background: var(--secondary-navy);
      box-shadow: var(--shadow-card);
      margin-top: 16px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    thead {
      background: #192437;
    }

    th {
      font-family: "Space Grotesk", sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: var(--secondary-text);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 14px 18px;
      border-bottom: 1px solid var(--subtle-border);
      white-space: nowrap;
    }

    td {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(53, 68, 93, 0.6);
      color: var(--soft-white);
      font-size: 14px;
      vertical-align: middle;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background-color: rgba(109, 140, 255, 0.05);
    }

    .id-pill {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: rgba(109, 140, 255, 0.12);
      color: var(--electric-blue);
      border: 1px solid rgba(109, 140, 255, 0.3);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
    }

    /* Badges */
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

    .badge-company {
      background: rgba(32, 46, 70, 0.9);
      color: var(--soft-white);
      border: 1px solid var(--subtle-border);
      font-weight: 600;
    }

    /* Info list */
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 16px 0;
    }

    .info-item {
      display: flex;
      align-items: baseline;
      gap: 12px;
      font-size: 15px;
      color: var(--soft-white);
      flex-wrap: wrap;
    }

    .info-label {
      min-width: 160px;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--secondary-text);
    }

    .actions-cluster {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
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

    /* Responsive Breakpoints */
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
      .user-jobs-main {
        padding: 24px 16px 40px;
      }

      .card {
        padding: 20px;
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
      }

      .actions-cluster .btn {
        width: 100%;
      }
    }
  </style>
</head>
<body>

  <!-- Keyboard Accessibility Skip Link -->
  <a href="#user-jobs-main-content" class="skip-link">Skip to main content</a>

  <!-- Top Sticky Navigation (Full Midnight Chrome with Users Active) -->
  <header class="top-nav">
    <div class="nav-container">
      <a href="/" class="brand" title="Alumni Tracking System Home">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-title">Alumni Tracking System</span>
          <span class="brand-subtitle">Alumni &amp; Career Portal</span>
        </div>
      </a>

      <!-- Mobile Menu Toggle Button -->
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

      <!-- Desktop & Mobile Navigation Links (Users Clearly Marked Active) -->
      <nav class="nav-menu" id="nav-menu" aria-label="Main Navigation">
        <a href="/" class="nav-link">Home</a>
        <a href="/about" class="nav-link">About</a>
        <a href="/users" class="nav-link active">Users</a>
        <a href="/announcements" class="nav-link">Announcements</a>
        <a href="/job-postings" class="nav-link">Job Postings</a>
        <a href="/applications" class="nav-link">Applications</a>
        <a href="/api/swagger" target="_blank" class="nav-link nav-cta">Swagger UI</a>
      </nav>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="user-jobs-main" id="user-jobs-main-content">
    <div class="container">

      <!-- Breadcrumbs -->
      <div class="breadcrumb-nav">
        <a href="/">Home</a>
        <span>/</span>
        <a href="/users">Users</a>
        <span>/</span>
        <a href="/users/${escapeHtml(userId)}">#${escapeHtml(userId)} ${escapeHtml(userName)}</a>
        <span>/</span>
        <span>User Job Postings</span>
      </div>

      <!-- Page Header Banner -->
      <div class="page-header">
        <div class="page-eyebrow">💼 ALUMNI CAREER PORTAL</div>
        <h1 class="page-headline">User Job Postings <span class="badge badge-navy">User #${escapeHtml(userId)}</span></h1>
        <p class="page-subtitle">Career opportunities and job postings published by <strong>${escapeHtml(userName)}</strong> (${escapeHtml(userEmail)}).</p>
      </div>

      <!-- Quick Stats Cards (2-Card Refined Layout) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${jobs.length}</div>
          <div class="stat-label">Published Postings</div>
          <div class="stat-sublabel">Total job postings owned by this user</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">#${escapeHtml(userId)}</div>
          <div class="stat-label">Publisher Account</div>
          <div class="stat-sublabel">${escapeHtml(userName)} &bull; ${escapeHtml(userEmail)}</div>
        </div>
      </div>

      <!-- Publisher Profile Card -->
      <div class="card" style="margin-bottom: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <h2 class="card-title" style="margin: 0; font-size: 20px;">👤 Publisher Profile</h2>
          <div>
            <a href="/users/${escapeHtml(userId)}" class="btn btn-secondary btn-secondary-dark btn-sm">View User Details</a>
          </div>
        </div>

        <div class="info-list">
          <div class="info-item">
            <span class="info-label">User ID:</span>
            <div><span class="id-pill">#${escapeHtml(userId)}</span></div>
          </div>
          <div class="info-item">
            <span class="info-label">Full Name:</span>
            <div style="font-weight: 700; color: var(--soft-white);">${escapeHtml(userName)}</div>
          </div>
          <div class="info-item">
            <span class="info-label">Email Address:</span>
            <div>
              <a href="mailto:${escapeHtml(userEmail)}" style="color: var(--electric-blue); font-weight: 600; text-decoration: none;">
                ${escapeHtml(userEmail)}
              </a>
            </div>
          </div>
          <div class="info-item">
            <span class="info-label">Active Listings:</span>
            <div><span class="badge badge-navy">${jobs.length} Published Position${jobs.length === 1 ? '' : 's'}</span></div>
          </div>
        </div>
      </div>

      <!-- Job Postings List Table -->
      <div style="margin-top: 24px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <h2 style="font-size: 22px; font-weight: 700; margin: 0; color: var(--soft-white);">📋 Published Job Listings (${jobs.length})</h2>
        <a href="/api/users/${escapeHtml(userId)}/jobs" target="_blank" class="btn btn-secondary btn-secondary-dark btn-sm">🔌 API JSON Endpoint</a>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Job Title</th>
              <th>Company</th>
              <th>City / Location</th>
              <th>Created Date</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>

      <!-- Bottom Actions Cluster -->
      <div class="actions-cluster" style="justify-content: space-between; align-items: center; margin-top: 32px;">
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          <a href="/users/${escapeHtml(userId)}" class="btn btn-secondary btn-secondary-dark">← Back to User Details</a>
          <a href="/users" class="btn btn-secondary btn-secondary-dark">📋 All Users Directory</a>
        </div>
        <a href="/job-postings" class="btn btn-lime">💼 Browse All Job Postings</a>
      </div>

    </div>
  </main>

  <!-- Modern Dark Footer -->
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span>Alumni Tracking System</span>
        </div>
        <div class="footer-nav" aria-label="Quick Links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/users">Users</a>
          <a href="/announcements">Announcements</a>
          <a href="/job-postings">Job Postings</a>
          <a href="/applications">Applications</a>
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

  <!-- Accessible Mobile Menu Toggle Script -->
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
  renderUserJobsPage
};
