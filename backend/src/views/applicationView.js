/**
 * View Layer: Renders Application HTML Views.
 * Alumni Tracking System — Full Midnight (Dark & Premium) Design System (Task 6).
 *
 * Design Inspirations:
 * - Claude: Typographic clarity, editorial calm, disciplined whitespace.
 * - BMW M: High-precision technical dark styling, hairline contours (#35445D), lime highlights (#D5F36A).
 * - Apple: Translucent glassmorphic navigation, fluid responsiveness, edge-to-edge depth.
 *
 * Master Color Palette:
 * - Midnight Navy:  #101827 (Primary canvas ground)
 * - Secondary Navy: #202E46 (Surface layer, elevated cards, table background)
 * - Electric Blue:  #6D8CFF (Accents, active navigation, focus rings)
 * - Lime:           #D5F36A (Primary CTA buttons, live nodes, high-contrast actions)
 * - Soft White:     #F4F5F7 (Headings, high-contrast typography)
 * - Secondary Text: #B9C3D2 (Descriptions, table headers, metadata)
 * - Subtle Border:  #35445D (1px hairline contours and dividers)
 */

const { isValidHttpUrl } = require('../controllers/applicationHelpers');

/**
 * Filters HTML special characters to prevent Cross-Site Scripting (XSS).
 *
 * @param {string} str
 * @returns {string}
 */
const { NAV_AUTH_CSS, renderNavbarLinks } = require('./navAuthHelper');

const escapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Formats a date string or timestamp into "MMM DD, YYYY" (e.g. "Oct 21, 2026") using UTC components.
 * Prevents UTC timezone day-shift and handles null, undefined or invalid dates safely.
 *
 * @param {string|Date|null|undefined} dateInput
 * @param {string} [fallback='-']
 * @returns {string} Formatted date string or fallback
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
 * Common Full Midnight Layout: Navigation, Typography, Styling and Footer
 *
 * @param {string} title - Page title
 * @param {string} badgeText - Badge text (e.g. Application View Layer, Details, Success, 404)
 * @param {string} content - Page body HTML content
 * @returns {string} Complete HTML document
 */
const getLayout = (title, badgeText, content, currentUser = null, activeNav = 'applications') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Alumni Tracking System - Candidate Applications and Pipeline in Full Midnight Dark &amp; Premium design.">
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

    a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
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
${NAV_AUTH_CSS}
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
    .applications-main {
      flex: 1;
      padding: 40px 24px 60px;
      width: 100%;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
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

    .card-description {
      font-size: 14px;
      color: var(--secondary-text);
      margin-bottom: 20px;
    }

    .card-success {
      border-color: rgba(52, 211, 153, 0.35);
      background: linear-gradient(180deg, rgba(52, 211, 153, 0.08) 0%, var(--secondary-navy) 100%);
    }

    .card-danger {
      border-color: rgba(229, 62, 62, 0.35);
      background: linear-gradient(180deg, rgba(229, 62, 62, 0.08) 0%, var(--secondary-navy) 100%);
    }

    /* Form Controls */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 18px;
    }

    .form-group {
      margin-bottom: 18px;
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

    input[type="text"], input[type="email"], input[type="number"], select, textarea {
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

    textarea {
      resize: vertical;
      min-height: 100px;
      line-height: 1.5;
    }

    input[type="text"]:focus, input[type="email"]:focus, input[type="number"]:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--electric-blue);
      box-shadow: 0 0 0 3px rgba(109, 140, 255, 0.25);
    }

    input::placeholder, textarea::placeholder {
      color: #5d6f8a;
    }

    .char-hint {
      font-size: 12px;
      color: #8392a8;
      margin-top: 4px;
      display: block;
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

    .btn-danger {
      background-color: rgba(229, 62, 62, 0.15);
      color: #feb2b2;
      border: 1px solid rgba(229, 62, 62, 0.35);
    }

    .btn-danger:hover {
      background-color: rgba(229, 62, 62, 0.3);
      border-color: var(--danger-red);
      color: #fff;
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

    .badge-pending, .badge-warning {
      background: rgba(221, 107, 32, 0.15);
      color: #fbd38d;
      border: 1px solid rgba(221, 107, 32, 0.35);
    }

    .badge-reviewing {
      background: rgba(109, 140, 255, 0.15);
      color: var(--electric-blue);
      border: 1px solid rgba(109, 140, 255, 0.4);
    }

    .badge-accepted, .badge-success {
      background: rgba(52, 211, 153, 0.15);
      color: var(--success-green);
      border: 1px solid rgba(52, 211, 153, 0.4);
    }

    .badge-rejected, .badge-danger {
      background: rgba(229, 62, 62, 0.15);
      color: #feb2b2;
      border: 1px solid rgba(229, 62, 62, 0.4);
    }

    /* Detail / Confirmation Info Items */
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
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
      min-width: 170px;
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

    /* Status Management Action Box */
    .management-action-card {
      background: #172235;
      border: 1px solid rgba(109, 140, 255, 0.3);
      border-radius: var(--radius-md);
      padding: 24px;
      margin-top: 24px;
    }

    .management-action-card h3 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--soft-white);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .management-action-card p {
      font-size: 14px;
      color: var(--secondary-text);
      margin-bottom: 18px;
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
      .applications-main {
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
  <a href="#applications-main-content" class="skip-link">Skip to main content</a>

  <!-- Top Sticky Navigation (Full Midnight Chrome with Applications Active) -->
  <header class="top-nav">
    <div class="nav-container">
      <a href="/" class="brand" title="Alumni Tracking System Home">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
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

      <!-- Desktop & Mobile Navigation Links -->
      <nav class="nav-menu" id="nav-menu" aria-label="Main Navigation">
        ${renderNavbarLinks({ currentUser, activeNav, escapeHtml })}
      </nav>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="applications-main" id="applications-main-content">
    <div class="container">
      ${content}
    </div>
  </main>

  <!-- Modern Dark Footer (Preserving Neutral Muted Footer Links & Structure) -->
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
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

/**
 * Maps application status string to a styled status badge.
 *
 * @param {string} status - Application status code (PENDING, REVIEWING, ACCEPTED, REJECTED)
 * @returns {string} HTML badge span
 */
const getStatusBadge = (status) => {
  const s = String(status || 'PENDING').toUpperCase();
  let badgeClass = 'badge-pending';
  if (s === 'ACCEPTED') badgeClass = 'badge-accepted';
  else if (s === 'REJECTED') badgeClass = 'badge-rejected';
  else if (s === 'REVIEWING') badgeClass = 'badge-reviewing';
  return `<span class="badge ${badgeClass}">${escapeHtml(s)}</span>`;
};

/**
 * 1. Applications main list and management page (GET /applications & GET /job-postings/:id/applications)
 * Supports both general directory mode and nested job-specific mode.
 *
 * @param {Array} applications - List of applications
 * @param {Object} options - Options object, e.g. { jobPosting: { id, title, company, ... } }
 * @returns {string} HTML content
 */
const renderSafeResumeLink = (url, { asButton = false } = {}) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return asButton
      ? '<span style="color: #8392a8;">No resume URL provided</span>'
      : '<span style="color: #5d6f8a;">None</span>';
  }
  const trimmed = url.trim();
  if (!isValidHttpUrl(trimmed)) {
    return `<span style="color: #f87171;" title="Unsafe URL blocked">${escapeHtml(trimmed)} (Unsafe URL blocked)</span>`;
  }
  const safeEscapedUrl = escapeHtml(trimmed);
  if (asButton) {
    return `<a href="${safeEscapedUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-lime btn-sm">📄 Open Resume / Portfolio Link</a>`;
  }
  return `<a href="${safeEscapedUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--electric-blue); text-decoration: underline;">Resume Link</a>`;
};

const renderApplicationsPage = (applications = [], options = {}) => {
  const isNested = Boolean(options && options.jobPosting);
  const isAdminView = Boolean(options && options.isAdminView);
  const currentUser = (options && options.currentUser) || null;
  const job = (options && options.jobPosting) || null;
  const csrfToken = (options && options.csrfToken) || '';

  const headerEyebrow = isNested
    ? `💼 JOB CANDIDATE PIPELINE`
    : (isAdminView ? `🛡️ ALL PORTAL APPLICATIONS` : `📋 RECEIVED APPLICATIONS`);

  const headerTitle = isNested
    ? `${escapeHtml(job.title)} — Applications`
    : (isAdminView ? `All Job Applications` : `Applications to Your Job Postings`);

  const subHeaderHtml = isNested
    ? `<p class="page-subtitle">Candidate applications submitted for job posting <strong>#${escapeHtml(job.id)} — ${escapeHtml(job.company)}</strong>.</p>
       <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
         <a href="/job-postings/${escapeHtml(job.id)}" class="btn btn-secondary btn-secondary-dark btn-sm">← Back to Job Details</a>
         <a href="#apply" class="btn btn-lime btn-sm">✍️ Submit Application for this Job</a>
       </div>`
    : (isAdminView
      ? `<p class="page-subtitle">Administrator view of all candidate submissions across active job postings.</p>
         <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
           <a href="/admin/applications" class="btn btn-secondary btn-secondary-dark btn-sm">🛡️ Open Admin Applications Console</a>
           <a href="/job-postings" class="btn btn-secondary btn-secondary-dark btn-sm">💼 Browse All Job Postings</a>
           <a href="#apply" class="btn btn-lime btn-sm">➕ Submit New Application</a>
         </div>`
      : `<p class="page-subtitle">Review candidate applications submitted to job postings published by your account. To track jobs you applied to, visit <a href="/my-applications" style="color: var(--lime); text-decoration: underline;">My Applications</a>.</p>
         <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
           <a href="/my-applications" class="btn btn-secondary btn-secondary-dark btn-sm">📝 My Applications</a>
           <a href="/job-postings" class="btn btn-secondary btn-secondary-dark btn-sm">💼 Browse Job Postings</a>
           <a href="#apply" class="btn btn-lime btn-sm">➕ Submit Application</a>
         </div>`);

  const postTargetUrl = isNested
    ? `/job-postings/${escapeHtml(job.id)}/applications`
    : `/applications`;

  const prefillName = currentUser && currentUser.name ? escapeHtml(currentUser.name) : '';
  const prefillEmail = currentUser && currentUser.email ? escapeHtml(currentUser.email) : '';

  const rows = applications && applications.length > 0
    ? applications.map(app => `
      <tr>
        <td><span class="id-pill">#${escapeHtml(app.id)}</span></td>
        <td>
          <a href="/job-postings/${escapeHtml(app.job_posting_id)}" style="color: var(--electric-blue); font-weight: 600; text-decoration: none;">
            #${escapeHtml(app.job_posting_id)}${app.job_title ? ` — ${escapeHtml(app.job_title)}` : ''}
          </a>
        </td>
        <td>
          <a href="/applications/${escapeHtml(app.id)}" style="color: var(--soft-white); font-weight: 600; text-decoration: none; display: inline-block; transition: color 0.2s;" onmouseover="this.style.color='var(--electric-blue)'" onmouseout="this.style.color='var(--soft-white)'">
            ${escapeHtml(app.applicant_name)}
          </a>
        </td>
        <td>${escapeHtml(app.applicant_email)}</td>
        <td>${getStatusBadge(app.status)}</td>
        <td>${renderSafeResumeLink(app.resume_url, { asButton: false })}</td>
        <td><small style="color: #8392a8; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${escapeHtml(formatDate(app.createdAt || app.createdDate || app.created_at))}</small></td>
        <td style="white-space: nowrap; text-align: right;">
          <a href="/applications/${escapeHtml(app.id)}" class="btn btn-secondary btn-secondary-dark btn-sm">View &amp; Manage</a>
        </td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--secondary-text); padding: 48px 24px;">
          <div style="font-size: 32px; margin-bottom: 12px;">📝</div>
          <div style="font-size: 16px; font-weight: 600; color: var(--soft-white); margin-bottom: 4px;">No candidate applications found.</div>
          <div>${isNested || isAdminView ? 'Applications submitted for this scope will appear here.' : 'Applications submitted to job postings owned by your account will appear here.'}</div>
        </td>
      </tr>
    `;

  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow">${headerEyebrow}</div>
      <h1 class="page-headline">${headerTitle} <span class="badge badge-navy">Application View Layer</span></h1>
      ${subHeaderHtml}
    </div>

    <!-- Quick Stats Cards (2-Card Refined Layout) -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${applications.length}</div>
        <div class="stat-label">Total Applications</div>
        <div class="stat-sublabel">Candidate applications recorded in system</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">CRUD</div>
        <div class="stat-label">Available Operations</div>
        <div class="stat-sublabel">CRUD &middot; Candidate Pipeline &middot; Status Updates</div>
      </div>
    </div>

    <!-- Active Applications Table -->
    <div style="margin-top: 24px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <h2 style="font-size: 22px; font-weight: 700; margin: 0; color: var(--soft-white);">📋 Candidate Applications (${applications.length})</h2>
      <a href="/api/applications" target="_blank" class="btn btn-secondary btn-secondary-dark btn-sm">🔌 API JSON Endpoint</a>
    </div>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Job ID</th>
            <th>Applicant Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Resume / CV</th>
            <th>Date</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <!-- Create Application Form Card (#apply anchor ID preserved) -->
    <div class="card" id="apply" style="margin-top: 36px; margin-bottom: 32px;">
      <h2 class="card-title" style="margin-top: 0;">➕ Submit New Application</h2>
      <p class="card-description">Apply directly for an open opportunity or record candidate credentials.</p>
      
      <form action="${postTargetUrl}" method="POST">
        ${currentUser ? `<input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">` : ''}
        ${isNested ? `<input type="hidden" name="job_posting_id" value="${escapeHtml(job.id)}">` : `
        <div class="form-grid">
          <div class="form-group full-width">
            <label for="job_posting_id">Target Job Posting ID *</label>
            <input type="number" id="job_posting_id" name="job_posting_id" required min="1" placeholder="e.g. 1" />
            <span class="char-hint">ID number of the active job posting to apply for</span>
          </div>
        </div>
        `}

        <div class="form-grid">
          <div class="form-group">
            <label for="applicant_name">Applicant Full Name *</label>
            <input type="text" id="applicant_name" name="applicant_name" required value="${prefillName}" placeholder="e.g. Jane Doe" />
          </div>

          <div class="form-group">
            <label for="applicant_email">Email Address *</label>
            <input type="email" id="applicant_email" name="applicant_email" required value="${prefillEmail}" placeholder="e.g. jane.doe@alumni.edu" />
          </div>

          <div class="form-group full-width">
            <label for="resume_url">Resume / CV URL (Optional)</label>
            <input type="text" id="resume_url" name="resume_url" placeholder="https://drive.google.com/... or portfolio link" />
          </div>

          <div class="form-group full-width">
            <label for="cover_letter">Cover Letter / Notes (Optional)</label>
            <textarea id="cover_letter" name="cover_letter" rows="4" placeholder="Brief statement regarding qualifications, experience, and motivation..."></textarea>
          </div>
        </div>

        <div style="margin-top: 10px;">
          <button type="submit" class="btn btn-lime">Submit Application</button>
        </div>
      </form>
    </div>
  `;

  return getLayout(isNested ? `${job.title} — Applications` : 'Job Applications', 'Application View Layer', content, currentUser, isNested ? 'job-postings' : 'applications');
};

/**
 * 1b. Personal My Applications page (GET /my-applications)
 * Shows ONLY the authenticated user's own submitted applications.
 *
 * @param {Array} applications
 * @param {Object} [options={}]
 * @returns {string}
 */
const renderMyApplicationsPage = (applications = [], options = {}) => {
  const currentUser = (options && options.currentUser) || null;
  const rows = Array.isArray(applications) ? applications : [];

  const statusCounts = rows.reduce(
    (acc, app) => {
      const s = String(app.status || 'PENDING').toUpperCase();
      if (s === 'ACCEPTED') acc.accepted += 1;
      else if (s === 'REVIEWING') acc.reviewing += 1;
      else if (s === 'REJECTED') acc.rejected += 1;
      else acc.pending += 1;
      return acc;
    },
    { pending: 0, reviewing: 0, accepted: 0, rejected: 0 }
  );

  const tableRows = rows.length > 0
    ? rows.map((app) => `
      <tr>
        <td><span class="id-pill">#${escapeHtml(app.id)}</span></td>
        <td>
          <a href="/job-postings/${escapeHtml(app.job_posting_id)}" style="color: var(--soft-white); font-weight: 600; text-decoration: none; display: inline-block; transition: color 0.2s;" onmouseover="this.style.color='var(--electric-blue)'" onmouseout="this.style.color='var(--soft-white)'">
            ${escapeHtml(app.job_title || `Job Posting #${app.job_posting_id}`)}
          </a>
        </td>
        <td><span class="badge badge-navy">${escapeHtml(app.job_company || 'Company')}</span></td>
        <td>${getStatusBadge(app.status)}</td>
        <td><small style="color: #8392a8; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${escapeHtml(formatDate(app.createdAt || app.createdDate || app.created_at))}</small></td>
        <td style="white-space: nowrap; text-align: right;">
          <a href="/job-postings/${escapeHtml(app.job_posting_id)}" class="btn btn-secondary btn-secondary-dark btn-sm" style="margin-right: 4px;">View Job</a>
          <a href="/applications/${escapeHtml(app.id)}" class="btn btn-secondary btn-secondary-dark btn-sm">Details</a>
        </td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--secondary-text); padding: 48px 24px;">
          <div style="font-size: 36px; margin-bottom: 12px;">📭</div>
          <div style="font-size: 17px; font-weight: 700; color: var(--soft-white); margin-bottom: 6px;">You have not submitted any job applications yet.</div>
          <p style="max-width: 480px; margin: 0 auto 18px; font-size: 14px;">Explore open career opportunities from our alumni network and track your application statuses right here.</p>
          <a href="/job-postings" class="btn btn-lime btn-sm">💼 Browse Job Postings</a>
        </td>
      </tr>
    `;

  const content = `
    <div class="breadcrumb-nav">
      <a href="/">Home</a>
      <span>/</span>
      <span>My Applications</span>
    </div>

    <div class="page-header">
      <div class="page-eyebrow">📝 PERSONAL APPLICATION TRACKER</div>
      <h1 class="page-headline">My Applications <span class="badge badge-navy">${rows.length} Total</span></h1>
      <p class="page-subtitle">Track every job application submitted with your account, check review statuses, and revisit target job postings.</p>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="/job-postings" class="btn btn-lime btn-sm">💼 Browse Job Postings</a>
        <a href="/profile" class="btn btn-secondary btn-secondary-dark btn-sm">👤 My Profile</a>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${rows.length}</div>
        <div class="stat-label">Submitted Applications</div>
        <div class="stat-sublabel">Total applications linked to your account</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${statusCounts.pending + statusCounts.reviewing}</div>
        <div class="stat-label">Active in Review</div>
        <div class="stat-sublabel">${statusCounts.pending} Pending &middot; ${statusCounts.reviewing} Reviewing &middot; ${statusCounts.accepted} Accepted</div>
      </div>
    </div>

    <div style="margin-top: 24px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <h2 style="font-size: 22px; font-weight: 700; margin: 0; color: var(--soft-white);">📋 Your Submitted Applications (${rows.length})</h2>
    </div>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Job Title</th>
            <th>Company</th>
            <th>Status</th>
            <th>Submitted Date</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;

  return getLayout('My Applications', 'Personal Applications', content, currentUser, 'my-applications');
};

/**
 * 2. Application detail & management page (GET /applications/:id)
 *
 * @param {Object} application - Single application object
 * @returns {string} HTML content
 */
const renderApplicationDetailPage = (application, currentUser = null, access = {}) => {
  const isAdmin = Boolean(currentUser && currentUser.auth_role === 'admin');
  const canUpdateStatus = access && access.canUpdateStatus !== undefined ? Boolean(access.canUpdateStatus) : isAdmin;
  const canDelete = access && access.canDelete !== undefined ? Boolean(access.canDelete) : isAdmin;
  const isApplicantOwner = Boolean(access && access.isApplicantOwner);
  const csrfToken = (access && access.csrfToken) || '';
  const backTarget = isApplicantOwner && !canUpdateStatus ? '/my-applications' : '/applications';
  const backLabel = isApplicantOwner && !canUpdateStatus ? '← Back to My Applications' : '← Back to Applications';

  const statusManagementHtml = canUpdateStatus
    ? `
    <!-- Status Management Card (Job Owner & Admin Only) -->
    <div class="management-action-card">
      <h3>⚙️ Application Status Management (PATCH)</h3>
      <p>Current Status: ${getStatusBadge(application.status)} &bull; Select a new review state to update the candidate pipeline.</p>

      <form id="statusForm" onsubmit="updateStatus(event, ${escapeHtml(application.id)})" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <label for="statusSelect" style="margin: 0; font-weight: 600; color: var(--soft-white);">Select New Status:</label>
        <select id="statusSelect" name="status" style="width: auto; min-width: 220px; font-weight: 600;">
          <option value="PENDING" ${application.status === 'PENDING' ? 'selected' : ''}>⏳ PENDING</option>
          <option value="REVIEWING" ${application.status === 'REVIEWING' ? 'selected' : ''}>🔍 REVIEWING</option>
          <option value="ACCEPTED" ${application.status === 'ACCEPTED' ? 'selected' : ''}>✅ ACCEPTED</option>
          <option value="REJECTED" ${application.status === 'REJECTED' ? 'selected' : ''}>❌ REJECTED</option>
        </select>
        <button type="submit" id="updateStatusBtn" class="btn btn-lime">Save Status</button>
      </form>
    </div>`
    : '';

  const deleteBtnHtml = canDelete
    ? `<button type="button" onclick="deleteApplication(${escapeHtml(application.id)})" class="btn btn-danger">${isApplicantOwner && !isAdmin ? 'Withdraw Application' : 'Delete This Application'}</button>`
    : '';

  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow">📝 CANDIDATE APPLICATION DETAILS</div>
      <h1 class="page-headline">
        Application #${escapeHtml(application.id)}
        <span class="badge badge-navy">Application View Layer</span>
      </h1>
      <p class="page-subtitle">Candidate submission overview, applicant background, job reference, and pipeline status management.</p>
    </div>

    <!-- Applicant Overview Card -->
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
        <h2 class="card-title" style="margin: 0; font-size: 24px;">${escapeHtml(application.applicant_name)}</h2>
        <div>${getStatusBadge(application.status)}</div>
      </div>

      <div class="info-list">
        <div class="info-item">
          <span class="info-label">Applicant Name:</span>
          <div style="font-weight: 700; color: var(--soft-white);">${escapeHtml(application.applicant_name)}</div>
        </div>

        <div class="info-item">
          <span class="info-label">Email Address:</span>
          <div>
            <a href="mailto:${escapeHtml(application.applicant_email)}" style="color: var(--electric-blue); font-weight: 600; text-decoration: none;">
              ${escapeHtml(application.applicant_email)}
            </a>
          </div>
        </div>

        <div class="info-item">
          <span class="info-label">User Reference:</span>
          <div>
            ${application.user_id 
              ? `<a href="/users/${escapeHtml(application.user_id)}" class="badge badge-navy" style="text-decoration:none;">👤 View User #${escapeHtml(application.user_id)} Profile</a>` 
              : '<span style="color: #8392a8;">Guest / Independent Applicant</span>'}
          </div>
        </div>

        <div class="info-item">
          <span class="info-label">Target Job Posting:</span>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <a href="/job-postings/${escapeHtml(application.job_posting_id)}" class="btn btn-secondary btn-secondary-dark btn-sm">💼 View Job Posting #${escapeHtml(application.job_posting_id)}</a>
            ${canUpdateStatus ? `<a href="/job-postings/${escapeHtml(application.job_posting_id)}/applications" class="btn btn-secondary btn-secondary-dark btn-sm">📋 View All Applications for this Job</a>` : ''}
          </div>
        </div>

        <div class="info-item">
          <span class="info-label">Resume / CV:</span>
          <div>
            ${renderSafeResumeLink(application.resume_url, { asButton: true })}
          </div>
        </div>

        <div class="info-item">
          <span class="info-label">Date Submitted:</span>
          <div><small style="color: #8392a8; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${escapeHtml(formatDate(application.createdAt || application.createdDate || application.created_at))}</small></div>
        </div>

        <div class="info-item">
          <span class="info-label">Last Updated:</span>
          <div><small style="color: #8392a8; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${escapeHtml(formatDate(application.updated_at))}</small></div>
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid var(--subtle-border); margin: 24px 0;" />

      <h3 style="font-size: 17px; font-weight: 700; color: var(--soft-white); margin-bottom: 12px;">Cover Letter &amp; Notes</h3>
      <div style="white-space: pre-wrap; line-height: 1.7; color: var(--soft-white); background: rgba(16, 24, 39, 0.5); padding: 18px; border-radius: var(--radius-sm); border: 1px solid var(--subtle-border); font-size: 14px;">${escapeHtml(application.cover_letter || 'No cover letter provided.')}</div>
    </div>

    ${statusManagementHtml}

    <!-- Bottom Actions Cluster -->
    <div class="actions-cluster" style="justify-content: space-between; align-items: center; margin-top: 28px;">
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        <a href="${backTarget}" class="btn btn-secondary btn-secondary-dark">${backLabel}</a>
        <a href="/job-postings/${escapeHtml(application.job_posting_id)}" class="btn btn-secondary btn-secondary-dark">💼 Target Job (#${escapeHtml(application.job_posting_id)})</a>
      </div>
      ${deleteBtnHtml}
    </div>

    <!-- Client-side Status Update & Delete Scripts -->
    <script>
      var appCsrfToken = ${JSON.stringify(String(csrfToken || '')).replace(/</g, '\\u003c')};

      function updateStatus(event, id) {
        event.preventDefault();
        var select = document.getElementById('statusSelect');
        var newStatus = select.value;
        var btn = document.getElementById('updateStatusBtn');
        btn.disabled = true;
        btn.innerText = 'Updating...';

        fetch('/applications/' + id, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-Token': appCsrfToken
          },
          body: JSON.stringify({ status: newStatus, _csrf: appCsrfToken })
        }).then(function(res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          window.location.reload();
        }).catch(function(err) {
          alert('Failed to update status: ' + err.message);
          btn.disabled = false;
          btn.innerText = 'Save Status';
        });
      }

      function deleteApplication(id) {
        if (confirm('Are you sure you want to delete application #' + id + '? This action cannot be undone.')) {
          fetch('/applications/' + id, {
            method: 'DELETE',
            headers: {
              'Accept': 'text/html',
              'X-CSRF-Token': appCsrfToken
            }
          }).then(function(res) {
            if (!res.ok && res.status !== 204) throw new Error('HTTP ' + res.status);
            window.location.href = '${backTarget}';
          }).catch(function(err) {
            alert('Failed to delete application: ' + err.message);
          });
        }
      }
    </script>
  `;

  return getLayout(`Application #${application.id}`, 'Details', content, currentUser);
};

/**
 * 3. Application not found page (404 Not Found)
 *
 * @param {string|number} id - Missing application ID
 * @returns {string} HTML content
 */
const renderApplicationNotFoundPage = (id, currentUser = null) => {
  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow" style="color: var(--danger-red);">⚠️ NOT FOUND &bull; 404</div>
      <h1 class="page-headline">Application Not Found</h1>
      <p class="page-subtitle">The requested application record could not be found or has been removed from the directory.</p>
    </div>

    <div class="card card-danger">
      <h2 class="card-title" style="margin-top: 0; color: #feb2b2;">
        Application Record Missing
      </h2>
      <p style="color: var(--soft-white); font-size: 15px; margin: 16px 0;">
        Application <strong style="color: #feb2b2;">#${escapeHtml(id)}</strong> does not exist in the active registry.
      </p>
      <div class="actions-cluster">
        <a href="/applications" class="btn btn-lime">← Back to All Applications</a>
        <a href="/" class="btn btn-secondary btn-secondary-dark">Home</a>
      </div>
    </div>
  `;

  return getLayout('Application Not Found', '404', content, currentUser);
};

/**
 * 4. Application successfully created page (201 Created)
 *
 * @param {Object} application - Newly created application object
 * @returns {string} HTML content
 */
const renderApplicationCreatedPage = (application, currentUser = null) => {
  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow" style="color: var(--success-green);">✅ SUCCESS &bull; 201 CREATED</div>
      <h1 class="page-headline">Application Successfully Submitted!</h1>
      <p class="page-subtitle">Your job application has been recorded and submitted for institutional review.</p>
    </div>

    <div class="card card-success">
      <h2 class="card-title" style="margin-top: 0; color: var(--success-green);">
        🎉 Submission Successful
      </h2>
      <div class="info-list" style="margin: 20px 0;">
        <div class="info-item">
          <span class="info-label">Application ID:</span>
          <div><span class="id-pill">#${escapeHtml(application.id)}</span></div>
        </div>
        <div class="info-item">
          <span class="info-label">Applicant:</span>
          <div style="font-weight: 700; color: var(--soft-white); font-size: 16px;">
            ${escapeHtml(application.applicant_name)} (${escapeHtml(application.applicant_email)})
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">Target Job Posting:</span>
          <div>
            <a href="/job-postings/${escapeHtml(application.job_posting_id)}" style="color: var(--electric-blue); font-weight: 600; text-decoration: none;">
              Job Posting #${escapeHtml(application.job_posting_id)}
            </a>
          </div>
        </div>
      </div>
      <div class="actions-cluster">
        ${currentUser ? `
        <a href="/my-applications" class="btn btn-lime">📝 My Applications</a>
        <a href="/applications/${escapeHtml(application.id)}" class="btn btn-secondary btn-secondary-dark">View Application Details</a>
        <a href="/job-postings/${escapeHtml(application.job_posting_id)}" class="btn btn-secondary btn-secondary-dark">Back to Job Posting</a>
        ` : `
        <a href="/job-postings/${escapeHtml(application.job_posting_id)}" class="btn btn-lime">← Back to Job Posting</a>
        <a href="/job-postings" class="btn btn-secondary btn-secondary-dark">Browse More Jobs</a>
        `}
      </div>
    </div>
  `;

  return getLayout('Application Submitted', 'Success', content, currentUser);
};

/**
 * 5. Application successfully updated page (200 OK)
 *
 * @param {Object} application - Updated application object
 * @param {Object} meta - Metadata (e.g. { isPartial: true/false })
 * @returns {string} HTML content
 */
const renderApplicationUpdatedPage = (application, meta = {}) => {
  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow" style="color: var(--success-green);">✅ SUCCESS &bull; 200 OK</div>
      <h1 class="page-headline">
        Application Successfully Updated! 
        ${meta.isPartial ? '<span class="badge badge-navy">Partial Update</span>' : ''}
      </h1>
      <p class="page-subtitle">The application status and credentials have been updated in the database.</p>
    </div>

    <div class="card card-success">
      <h2 class="card-title" style="margin-top: 0; color: var(--success-green);">
        🎉 Changes Saved
      </h2>
      <div class="info-list" style="margin: 20px 0;">
        <div class="info-item">
          <span class="info-label">Application ID:</span>
          <div><span class="id-pill">#${escapeHtml(application.id)}</span></div>
        </div>
        <div class="info-item">
          <span class="info-label">Status:</span>
          <div>${getStatusBadge(application.status)}</div>
        </div>
      </div>
      <div class="actions-cluster">
        <a href="/applications/${escapeHtml(application.id)}" class="btn btn-lime">View Updated Application</a>
        <a href="/applications" class="btn btn-secondary btn-secondary-dark">Back to Application Directory</a>
      </div>
    </div>
  `;

  return getLayout('Application Updated', 'Success', content, meta.currentUser || null);
};

/**
 * 6. Application successfully deleted page (200 OK)
 *
 * @param {string|number} id - Deleted application ID
 * @returns {string} HTML content
 */
const renderApplicationDeletedPage = (id, currentUser = null) => {
  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow" style="color: var(--warning-amber);">🗑️ REMOVED &bull; 200 OK</div>
      <h1 class="page-headline">Application Successfully Deleted</h1>
      <p class="page-subtitle">The candidate record and associated logs have been removed from the directory.</p>
    </div>

    <div class="card card-success">
      <h2 class="card-title" style="margin-top: 0; color: var(--success-green);">
        🗑️ Deletion Confirmed
      </h2>
      <p style="color: var(--soft-white); font-size: 15px; margin: 16px 0;">
        Application <strong style="color: var(--electric-blue);">#${escapeHtml(id)}</strong> has been permanently removed from the system.
      </p>
      <div class="actions-cluster">
        <a href="/applications" class="btn btn-lime">← Back to Application Directory</a>
        <a href="/" class="btn btn-secondary btn-secondary-dark">Home</a>
      </div>
    </div>
  `;

  return getLayout('Application Deleted', 'Success', content, currentUser);
};

module.exports = {
  escapeHtml,
  formatDate,
  renderApplicationsPage,
  renderMyApplicationsPage,
  renderApplicationDetailPage,
  renderApplicationNotFoundPage,
  renderApplicationCreatedPage,
  renderApplicationUpdatedPage,
  renderApplicationDeletedPage
};
