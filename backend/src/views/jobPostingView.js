/**
 * View Layer: Renders Job Posting HTML Views.
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

/**
 * Filters HTML special characters to prevent Cross-Site Scripting (XSS).
 *
 * @param {string} str
 * @returns {string}
 */
const { NAV_AUTH_CSS, renderNavAuthItems } = require('./navAuthHelper');

const escapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Common Full Midnight Layout: Navigation, Typography, Styling and Footer
 *
 * @param {string} title - Page title
 * @param {string} badgeText - Badge text (e.g. Job View Layer, Details, Success, 404)
 * @param {string} content - Page body HTML content
 * @returns {string} Complete HTML document
 */
const getLayout = (title, badgeText, content, currentUser = null) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Alumni Tracking System - Career Opportunities and Job Postings in Full Midnight Dark &amp; Premium design.">
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

    a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible {
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
    .job-postings-main {
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
      max-width: 720px;
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

    input[type="text"], input[type="email"], input[type="number"], textarea {
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
      min-height: 110px;
      line-height: 1.5;
    }

    input[type="text"]:focus, input[type="email"]:focus, input[type="number"]:focus, textarea:focus {
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

    .btn-warning {
      background-color: rgba(221, 107, 32, 0.15);
      color: #fbd38d;
      border: 1px solid rgba(221, 107, 32, 0.35);
    }

    .btn-warning:hover {
      background-color: rgba(221, 107, 32, 0.3);
      border-color: var(--warning-amber);
      color: #fff;
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

    .badge-company {
      background: rgba(32, 46, 70, 0.9);
      color: var(--soft-white);
      border: 1px solid var(--subtle-border);
      font-weight: 600;
    }

    .badge-success {
      background: rgba(52, 211, 153, 0.12);
      color: var(--success-green);
      border: 1px solid rgba(52, 211, 153, 0.35);
    }

    .badge-warning {
      background: rgba(221, 107, 32, 0.15);
      color: #fbd38d;
      border: 1px solid rgba(221, 107, 32, 0.35);
    }

    .badge-danger {
      background: rgba(229, 62, 62, 0.15);
      color: #feb2b2;
      border: 1px solid rgba(229, 62, 62, 0.35);
    }

    /* Detail / Confirmation Info Items */
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

    /* Nested Application Action Box */
    .nested-action-card {
      background: #172235;
      border: 1px solid rgba(109, 140, 255, 0.3);
      border-radius: var(--radius-md);
      padding: 24px;
      margin-top: 24px;
    }

    .nested-action-card h3 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--soft-white);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nested-action-card p {
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
      .job-postings-main {
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
  <a href="#job-postings-main-content" class="skip-link">Skip to main content</a>

  <!-- Top Sticky Navigation (Full Midnight Chrome with Job Postings Active) -->
  <header class="top-nav">
    <div class="nav-container">
      <a href="/" class="brand" title="Alumni Tracking System Home">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
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

      <!-- Desktop & Mobile Navigation Links (Job Postings Clearly Marked Active) -->
      <nav class="nav-menu" id="nav-menu" aria-label="Main Navigation">
        <a href="/" class="nav-link">Home</a>
        <a href="/about" class="nav-link">About</a>
        <a href="/users" class="nav-link">Users</a>
        <a href="/announcements" class="nav-link">Announcements</a>
        <a href="/job-postings" class="nav-link active">Job Postings</a>
        <a href="/applications" class="nav-link">Applications</a>
        ${renderNavAuthItems(currentUser, escapeHtml)}
        <a href="/api/swagger" target="_blank" class="nav-link nav-cta">Swagger UI</a>
      </nav>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="job-postings-main" id="job-postings-main-content">
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
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
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
 * 1. Job Postings main list and management page (GET /job-postings)
 *
 * @param {Array} jobPostings - List of job postings
 * @returns {string} HTML content
 */
const renderJobPostingsPage = (jobPostings = [], currentUser = null) => {
  const tableRows = jobPostings && jobPostings.length > 0
    ? jobPostings.map(job => `
      <tr>
        <td><span class="id-pill">#${escapeHtml(job.id)}</span></td>
        <td>
          <a href="/job-postings/${escapeHtml(job.id)}" style="color: var(--soft-white); font-weight: 600; text-decoration: none; display: inline-block; transition: color 0.2s;" onmouseover="this.style.color='var(--electric-blue)'" onmouseout="this.style.color='var(--soft-white)'">
            ${escapeHtml(job.title)}
          </a>
        </td>
        <td><span class="badge badge-company">${escapeHtml(job.company)}</span></td>
        <td>${job.user_id ? `<a href="/users/${escapeHtml(job.user_id)}" style="color: var(--electric-blue); font-weight: 600; text-decoration: none;">#${escapeHtml(job.user_id)}</a>` : '<span style="color: #5d6f8a;">-</span>'}</td>
        <td>${escapeHtml(job.location || job.city || '-')}</td>
        <td>${escapeHtml(job.contact_email || '-')}</td>
        <td><small style="color: #8392a8; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${escapeHtml(job.createdDate || job.createdAt || job.created_at || '-')}</small></td>
        <td style="white-space: nowrap; text-align: right;">
          <a href="/job-postings/${escapeHtml(job.id)}" class="btn btn-secondary btn-secondary-dark btn-sm" style="margin-right: 4px;">View Details</a>
          <a href="/job-postings/${escapeHtml(job.id)}/applications" class="btn btn-secondary btn-secondary-dark btn-sm" style="margin-right: 4px;">Applications</a>
          <button type="button" onclick="editJob(${escapeHtml(JSON.stringify(job))})" class="btn btn-warning btn-sm" style="margin-right: 4px;">Edit</button>
          <button type="button" onclick="deleteJob(${escapeHtml(job.id)})" class="btn btn-danger btn-sm">Delete</button>
        </td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--secondary-text); padding: 48px 24px;">
          <div style="font-size: 32px; margin-bottom: 12px;">💼</div>
          <div style="font-size: 16px; font-weight: 600; color: var(--soft-white); margin-bottom: 4px;">No job postings found.</div>
          <div>You can publish the first career opportunity using the form above.</div>
        </td>
      </tr>
    `;

  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow">💼 CAREER &amp; TALENT OPPORTUNITIES</div>
      <h1 class="page-headline">Career &amp; Job Opportunities <span class="badge badge-navy">Job View Layer</span></h1>
      <p class="page-subtitle">Explore, manage career opportunities, and track applications for our alumni and corporate partners.</p>
    </div>

    <!-- Quick Stats Cards (2-Card Refined Layout) -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${jobPostings.length}</div>
        <div class="stat-label">Active Listings</div>
        <div class="stat-sublabel">Currently published positions across the portal</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">CRUD</div>
        <div class="stat-label">Available Operations</div>
        <div class="stat-sublabel">Create &middot; Read &middot; Update &middot; Delete &middot; Applications</div>
      </div>
    </div>

    <!-- Create / Edit Form Card (DOM IDs Strictly Preserved) -->
    <div class="card" id="jobPostingFormCard" style="margin-bottom: 32px;">
      <h2 id="formTitle" class="card-title" style="margin-top: 0;">➕ Create New Job Posting</h2>
      <p class="card-description">Publish a new job opportunity or update an existing position's details.</p>
      <form id="jobForm" method="POST" action="/job-postings">
        <input type="hidden" id="editJobId" name="_id" value="" />
        
        <div class="form-grid">
          <div class="form-group">
            <label for="title">Job Title * (Maximum 120 characters)</label>
            <input type="text" id="title" name="title" required maxlength="120" placeholder="e.g. Senior Full Stack Engineer" />
            <span class="char-hint">Maximum 120 characters (Task 2 rule)</span>
          </div>

          <div class="form-group">
            <label for="company">Company *</label>
            <input type="text" id="company" name="company" required placeholder="e.g. Alumni Tech Corp" />
          </div>

          <div class="form-group">
            <label for="user_id">Posted By (User ID - Optional)</label>
            <input type="number" id="user_id" name="user_id" placeholder="e.g. 1 (Registered user ID)" min="1" />
            <span class="char-hint">Account ID of the posting alumnus / recruiter</span>
          </div>

          <div class="form-group">
            <label for="location">Location (Optional)</label>
            <input type="text" id="location" name="location" placeholder="e.g. Istanbul / Hybrid or Remote" />
          </div>

          <div class="form-group full-width">
            <label for="contact_email">Contact Email (Optional)</label>
            <input type="email" id="contact_email" name="contact_email" placeholder="e.g. careers@alumnitech.com" />
          </div>

          <div class="form-group full-width">
            <label for="description">Job Description &amp; Requirements (Optional)</label>
            <textarea id="description" name="description" rows="5" placeholder="Key responsibilities, qualifications, requirements, and application instructions..."></textarea>
          </div>
        </div>

        <div style="display: flex; gap: 10px; align-items: center; margin-top: 10px; flex-wrap: wrap;">
          <button type="submit" id="submitBtn" class="btn btn-lime">Publish Job Posting</button>
          <button type="button" id="cancelBtn" class="btn btn-secondary btn-secondary-dark" style="display:none;" onclick="resetForm()">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Active Job Postings Table -->
    <div style="margin-top: 24px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <h2 style="font-size: 22px; font-weight: 700; margin: 0; color: var(--soft-white);">📋 Active Job Listings (${jobPostings.length})</h2>
      <a href="/api/job-postings" target="_blank" class="btn btn-secondary btn-secondary-dark btn-sm">🔌 API JSON Endpoint</a>
    </div>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Job Title</th>
            <th>Company</th>
            <th>Posted By</th>
            <th>Location</th>
            <th>Contact</th>
            <th>Date</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>

    <!-- Client-side CRUD and AJAX PUT/DELETE Script (Strictly Preserved Functions) -->
    <script>
      function editJob(job) {
        document.getElementById('editJobId').value = job.id;
        document.getElementById('user_id').value = (job.user_id !== null && job.user_id !== undefined) ? job.user_id : '';
        document.getElementById('title').value = job.title || '';
        document.getElementById('company').value = job.company || '';
        document.getElementById('location').value = job.location || job.city || '';
        document.getElementById('contact_email').value = job.contact_email || '';
        document.getElementById('description').value = job.description || '';
        document.getElementById('submitBtn').innerText = 'Save Changes (PUT)';
        document.getElementById('cancelBtn').style.display = 'inline-flex';
        var formTitle = document.getElementById('formTitle');
        if (formTitle) {
          formTitle.innerText = '✏️ Edit Job Posting (#' + job.id + ')';
        }
        var formCard = document.getElementById('jobPostingFormCard') || document.getElementById('jobForm');
        if (formCard) {
          formCard.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }

      function resetForm() {
        document.getElementById('editJobId').value = '';
        document.getElementById('user_id').value = '';
        document.getElementById('jobForm').reset();
        document.getElementById('submitBtn').innerText = 'Publish Job Posting';
        document.getElementById('cancelBtn').style.display = 'none';
        var formTitle = document.getElementById('formTitle');
        if (formTitle) {
          formTitle.innerText = '➕ Create New Job Posting';
        }
      }

      document.getElementById('jobForm').addEventListener('submit', function(e) {
        var editId = document.getElementById('editJobId').value;
        if (editId) {
          e.preventDefault();
          var userIdVal = document.getElementById('user_id').value;
          var payload = {
            user_id: userIdVal ? Number(userIdVal) : null,
            title: document.getElementById('title').value,
            company: document.getElementById('company').value,
            location: document.getElementById('location').value,
            contact_email: document.getElementById('contact_email').value,
            description: document.getElementById('description').value
          };
          fetch('/job-postings/' + editId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'text/html' },
            body: JSON.stringify(payload)
          }).then(function(res) {
            window.location.href = '/job-postings/' + editId;
          }).catch(function(err) {
            alert('Update error: ' + err.message);
          });
        }
      });

      function deleteJob(id) {
        if (confirm('Are you sure you want to delete job posting #' + id + '?')) {
          fetch('/job-postings/' + id, {
            method: 'DELETE',
            headers: { 'Accept': 'text/html' }
          }).then(function(res) {
            window.location.reload();
          }).catch(function(err) {
            alert('Delete error: ' + err.message);
          });
        }
      }
    </script>
  `;

  return getLayout('Career & Job Opportunities', 'Job View Layer', content, currentUser);
};

/**
 * 2. Job posting detail page (GET /job-postings/:id)
 *
 * @param {Object} job - Single job posting object
 * @returns {string} HTML content
 */
const renderJobPostingDetailPage = (job, currentUser = null) => {
  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow">💼 JOB POSTING DETAILS</div>
      <h1 class="page-headline">
        ${escapeHtml(job.title)}
        <span class="badge badge-navy">#${escapeHtml(job.id)}</span>
      </h1>
      <p class="page-subtitle">Comprehensive position details, company overview, and application options for this career opportunity.</p>
    </div>

    <!-- Job Posting Info Card -->
    <div class="card">
      <h2 class="card-title" style="margin-top: 0; font-size: 22px;">
        ${escapeHtml(job.title)}
      </h2>
      
      <div class="info-list" style="margin-top: 20px;">
        <div class="info-item">
          <span class="info-label">Company:</span>
          <div><span class="badge badge-company" style="font-size: 13px;">${escapeHtml(job.company)}</span></div>
        </div>

        <div class="info-item">
          <span class="info-label">Posted By:</span>
          <div>
            ${job.user_id 
              ? `<a href="/users/${escapeHtml(job.user_id)}" class="badge badge-navy" style="text-decoration:none;">👤 View User #${escapeHtml(job.user_id)} Profile</a>` 
              : '<span style="color: #8392a8;">Corporate / System (Not specified)</span>'}
          </div>
        </div>

        <div class="info-item">
          <span class="info-label">Location:</span>
          <div>${escapeHtml(job.city || job.location || 'Not specified')}</div>
        </div>

        <div class="info-item">
          <span class="info-label">Contact Email:</span>
          <div>
            ${job.contact_email 
              ? `<a href="mailto:${escapeHtml(job.contact_email)}" style="color: var(--electric-blue); font-weight: 600; text-decoration: none;">${escapeHtml(job.contact_email)}</a>` 
              : '<span style="color: #8392a8;">Not specified</span>'}
          </div>
        </div>

        <div class="info-item">
          <span class="info-label">Date Posted:</span>
          <div><span style="color: #8392a8; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${escapeHtml(job.createdDate || job.createdAt || job.created_at || '-')}</span></div>
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid var(--subtle-border); margin: 24px 0;" />

      <h3 style="font-size: 17px; font-weight: 700; color: var(--soft-white); margin-bottom: 12px;">Job Description &amp; Requirements</h3>
      <div style="white-space: pre-wrap; line-height: 1.7; color: var(--soft-white); background: rgba(16, 24, 39, 0.5); padding: 18px; border-radius: var(--radius-sm); border: 1px solid var(--subtle-border); font-size: 14px;">${escapeHtml(job.description || 'No description or requirements provided for this position.')}</div>
    </div>

    <!-- Nested Applications Action Box -->
    <div class="nested-action-card">
      <h3>📌 Application Process for this Position</h3>
      <p>Review candidate applications submitted for this role or fill out a new job application form directly.</p>
      <div style="display: flex; flex-wrap: wrap; gap: 12px;">
        <a href="/job-postings/${escapeHtml(job.id)}/applications" class="btn btn-secondary btn-secondary-dark">📋 View Applications</a>
        <a href="/job-postings/${escapeHtml(job.id)}/applications#apply" class="btn btn-lime">✍️ Apply for this Position</a>
      </div>
    </div>

    <!-- Bottom Actions Cluster -->
    <div class="actions-cluster" style="justify-content: space-between; align-items: center; margin-top: 28px;">
      <a href="/job-postings" class="btn btn-secondary btn-secondary-dark">← Back to All Postings</a>
      <button type="button" onclick="deleteJobDetail(${escapeHtml(job.id)})" class="btn btn-danger">Delete This Posting</button>
    </div>

    <script>
      function deleteJobDetail(id) {
        if (confirm('Are you sure you want to delete job posting #' + id + '? This action cannot be undone.')) {
          fetch('/job-postings/' + id, {
            method: 'DELETE',
            headers: { 'Accept': 'text/html' }
          }).then(function() {
            window.location.href = '/job-postings';
          }).catch(function(err) {
            alert('Delete error: ' + err.message);
          });
        }
      }
    </script>
  `;

  return getLayout(`Job Posting #${job.id}`, 'Details', content, currentUser);
};

/**
 * 3. Job posting not found page (404)
 *
 * @param {string|number} id - Missing job posting ID
 * @returns {string} HTML content
 */
const renderJobPostingNotFoundPage = (id, currentUser = null) => {
  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow" style="color: var(--danger-red);">⚠️ NOT FOUND &bull; 404</div>
      <h1 class="page-headline">Job Posting Not Found</h1>
      <p class="page-subtitle">The requested career opportunity does not exist in the database or has been removed.</p>
    </div>

    <div class="card card-danger">
      <h2 class="card-title" style="margin-top: 0; color: #feb2b2;">
        Job Posting Not Found
      </h2>
      <p style="color: var(--soft-white); font-size: 15px; margin: 16px 0;">
        Job posting <strong style="color: #feb2b2;">#${escapeHtml(id)}</strong> could not be found or may have been unlisted.
      </p>
      <div class="actions-cluster">
        <a href="/job-postings" class="btn btn-lime">← Back to Job Listings</a>
        <a href="/" class="btn btn-secondary btn-secondary-dark">Home</a>
      </div>
    </div>
  `;

  return getLayout('Job Posting Not Found', '404', content, currentUser);
};

/**
 * 4. Job posting successfully created page (201)
 *
 * @param {Object} job - Newly created job posting object
 * @returns {string} HTML content
 */
const renderJobPostingCreatedPage = (job, currentUser = null) => {
  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow" style="color: var(--success-green);">✅ SUCCESS &bull; 201 CREATED</div>
      <h1 class="page-headline">Job Posting Successfully Published!</h1>
      <p class="page-subtitle">The new career opportunity has been recorded in the Alumni portal and is now open for applications.</p>
    </div>

    <div class="card card-success">
      <h2 class="card-title" style="margin-top: 0; color: var(--success-green);">
        🎉 Publication Successful
      </h2>
      <div class="info-list" style="margin: 20px 0;">
        <div class="info-item">
          <span class="info-label">Posting ID:</span>
          <div><span class="id-pill">#${escapeHtml(job.id)}</span></div>
        </div>
        <div class="info-item">
          <span class="info-label">Job Title:</span>
          <div style="font-weight: 700; color: var(--soft-white); font-size: 16px;">${escapeHtml(job.title)}</div>
        </div>
        <div class="info-item">
          <span class="info-label">Company:</span>
          <div><span class="badge badge-company">${escapeHtml(job.company)}</span></div>
        </div>
      </div>
      <div class="actions-cluster">
        <a href="/job-postings/${escapeHtml(job.id)}" class="btn btn-lime">View Job Posting</a>
        <a href="/job-postings" class="btn btn-secondary btn-secondary-dark">All Job Postings</a>
      </div>
    </div>
  `;

  return getLayout('Job Posting Published', 'Success', content, currentUser);
};

/**
 * 5. Job posting successfully updated page (200)
 *
 * @param {Object} job - Updated job posting object
 * @param {Object} meta - Metadata (e.g. { isPartial: true/false })
 * @returns {string} HTML content
 */
const renderJobPostingUpdatedPage = (job, meta = {}) => {
  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow" style="color: var(--success-green);">✅ SUCCESS &bull; 200 OK</div>
      <h1 class="page-headline">
        Job Posting Successfully Updated! 
        ${meta.isPartial ? '<span class="badge badge-navy">Partial Update</span>' : ''}
      </h1>
      <p class="page-subtitle">Job posting information has been synchronized and successfully updated.</p>
    </div>

    <div class="card card-success">
      <h2 class="card-title" style="margin-top: 0; color: var(--success-green);">
        🎉 Changes Saved
      </h2>
      <div class="info-list" style="margin: 20px 0;">
        <div class="info-item">
          <span class="info-label">Posting ID:</span>
          <div><span class="id-pill">#${escapeHtml(job.id)}</span></div>
        </div>
        <div class="info-item">
          <span class="info-label">Job Title:</span>
          <div style="font-weight: 700; color: var(--soft-white); font-size: 16px;">${escapeHtml(job.title)}</div>
        </div>
        <div class="info-item">
          <span class="info-label">Company:</span>
          <div><span class="badge badge-company">${escapeHtml(job.company)}</span></div>
        </div>
      </div>
      <div class="actions-cluster">
        <a href="/job-postings/${escapeHtml(job.id)}" class="btn btn-lime">View Updated Posting</a>
        <a href="/job-postings" class="btn btn-secondary btn-secondary-dark">Back to Job Listings</a>
      </div>
    </div>
  `;

  return getLayout('Job Posting Updated', 'Success', content, meta.currentUser || null);
};

/**
 * 6. Job posting successfully deleted page (200)
 *
 * @param {string|number} id - Deleted job posting ID
 * @returns {string} HTML content
 */
const renderJobPostingDeletedPage = (id, currentUser = null) => {
  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow" style="color: var(--warning-amber);">🗑️ REMOVED &bull; 200 OK</div>
      <h1 class="page-headline">Job Posting Successfully Deleted</h1>
      <p class="page-subtitle">The career opportunity and related records have been removed from the active directory.</p>
    </div>

    <div class="card card-success">
      <h2 class="card-title" style="margin-top: 0; color: var(--success-green);">
        🗑️ Deletion Confirmed
      </h2>
      <p style="color: var(--soft-white); font-size: 15px; margin: 16px 0;">
        Job posting <strong style="color: var(--electric-blue);">#${escapeHtml(id)}</strong> has been successfully deleted.
      </p>
      <div class="actions-cluster">
        <a href="/job-postings" class="btn btn-lime">← Back to Job Listings</a>
        <a href="/" class="btn btn-secondary btn-secondary-dark">Home</a>
      </div>
    </div>
  `;

  return getLayout('Job Posting Deleted', 'Success', content, currentUser);
};

module.exports = {
  escapeHtml,
  renderJobPostingsPage,
  renderJobPostingDetailPage,
  renderJobPostingNotFoundPage,
  renderJobPostingCreatedPage,
  renderJobPostingUpdatedPage,
  renderJobPostingDeletedPage
};
