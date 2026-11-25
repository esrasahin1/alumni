/**
 * View Layer: Renders User Management HTML Views.
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
 * - Lime:           #D5F36A (Primary CTA buttons, live nodes)
 * - Soft White:     #F4F5F7 (Headings, high-contrast text)
 * - Secondary Text: #B9C3D2 (Descriptions, table headers, metadata)
 * - Subtle Border:  #35445D (1px hairline contours and dividers)
 */

/**
 * XSS zafiyetlerini önlemek için HTML özel karakterlerini filtreler.
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
 * Ortak Full Midnight Layout: Navigation, Typography, Styling ve Footer
 *
 * @param {string} title - Sayfa başlığı
 * @param {string} badgeText - Rozet metni (ör. User View Layer)
 * @param {string} content - Sayfa gövdesi HTML içeriği
 * @returns {string} HTML sayfası
 */
const getLayout = (title, badgeText, content) => `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Alumni Tracking System - Users Management and Directory in Full Midnight Dark &amp; Premium design.">
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

    a:focus-visible, button:focus-visible, input:focus-visible {
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

    /* Top Sticky Navigation (Matching Home & About Full Midnight Chrome) */
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
    .users-main {
      flex: 1;
      width: 100%;
      padding: 40px 24px 64px;
    }

    .container {
      max-width: 1040px;
      margin: 0 auto;
      width: 100%;
    }

    /* Breadcrumbs */
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

    /* Page Header */
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
      max-width: 720px;
      line-height: 1.6;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-md);
      padding: 18px 20px;
      box-shadow: var(--shadow-card);
      transition: var(--transition);
    }

    .stat-card:hover {
      border-color: rgba(109, 140, 255, 0.4);
      transform: translateY(-2px);
    }

    .stat-value {
      font-family: "Space Grotesk", sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: var(--soft-white);
      line-height: 1.2;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--secondary-text);
    }

    .stat-sublabel {
      font-size: 11px;
      font-weight: 500;
      color: var(--secondary-text);
      margin-top: 4px;
      letter-spacing: 0.3px;
    }

    /* Card Components */
    .card {
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-md);
      padding: 28px;
      margin-bottom: 28px;
      box-shadow: var(--shadow-card);
      transition: var(--transition);
    }

    .card:hover {
      border-color: rgba(109, 140, 255, 0.35);
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
    .form-group {
      margin-bottom: 18px;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.3px;
      margin-bottom: 8px;
      color: var(--secondary-text);
    }

    input[type="text"], input[type="email"] {
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

    input[type="text"]:focus, input[type="email"]:focus {
      outline: none;
      border-color: var(--electric-blue);
      box-shadow: 0 0 0 3px rgba(109, 140, 255, 0.25);
    }

    input::placeholder {
      color: #5d6f8a;
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
      background-color: var(--warning-amber);
      color: #ffffff;
      border: none;
    }

    .btn-warning:hover {
      background-color: var(--warning-amber-hover);
      color: #ffffff;
      transform: translateY(-1px);
    }

    .btn-danger {
      background-color: var(--danger-red);
      color: #ffffff;
      border: none;
    }

    .btn-danger:hover {
      background-color: var(--danger-red-hover);
      color: #ffffff;
      transform: translateY(-1px);
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
      border-radius: var(--radius-sm);
    }

    /* Tables */
    .table-section-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--soft-white);
      margin-top: 36px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-card);
      margin-bottom: 28px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th {
      background-color: #1a2538;
      color: var(--secondary-text);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
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
      min-width: 140px;
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
      .users-main {
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
  <a href="#users-main-content" class="skip-link">Skip to main content</a>

  <!-- Top Sticky Navigation (Full Midnight Chrome with Users Active) -->
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
        <a href="/register" class="nav-link">Register</a>
        <a href="/api/swagger" target="_blank" class="nav-link nav-cta">Swagger UI</a>
      </nav>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="users-main" id="users-main-content">
    <div class="container">
      ${content}
    </div>
  </main>

  <!-- Modern Dark Footer (Preserving All Home/About Links & Structure) -->
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
          <a href="/register">Register</a>
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
 * 1. GET /users: Tüm kullanıcıları listeler (Read - R) ve User Management CRUD işlemlerini sunar
 *
 * @param {Array} users - Kullanıcı listesi
 * @returns {string} HTML içeriği
 */
const renderUsersPage = (users = []) => {
  const userRows = users.length > 0
    ? users.map(user => `
      <tr>
        <td><span class="id-pill">#${user.id}</span></td>
        <td>
          <div style="font-weight: 600; color: var(--soft-white);">${escapeHtml(user.name)}</div>
        </td>
        <td>
          <div style="color: var(--secondary-text);">${escapeHtml(user.email)}</div>
        </td>
        <td style="white-space: nowrap; text-align: right;">
          <a href="/users/${user.id}" class="btn btn-secondary btn-secondary-dark btn-sm" style="margin-right: 4px;">Details</a>
          <button type="button" class="btn btn-warning btn-sm" style="margin-right: 4px;" onclick="startEdit(this)" data-id="${user.id}" data-name="${escapeHtml(user.name)}" data-email="${escapeHtml(user.email)}">Edit</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Delete</button>
        </td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--secondary-text); padding: 48px 24px;">
          <div style="font-size: 32px; margin-bottom: 12px;">👥</div>
          <div style="font-size: 16px; font-weight: 600; color: var(--soft-white); margin-bottom: 4px;">Henüz kayıtlı kullanıcı bulunmamaktadır.</div>
          <div>Yukarıdaki formu kullanarak ilk kullanıcıyı sisteme kaydedebilirsiniz.</div>
        </td>
      </tr>
    `;

  const content = `
    <!-- Page Header Banner -->
    <div class="page-header">
      <div class="page-eyebrow">👥 IDENTITY &amp; ACCESS MANAGEMENT</div>
      <h1 class="page-headline">User Management <span class="badge badge-navy">User View Layer</span></h1>
      <p class="page-subtitle">Manage registered alumni, students, and faculty profiles. Perform full CRUD operations with persistent MySQL 8.0 storage.</p>
    </div>

    <!-- Quick Stats Cards (2-Card Refined Layout) -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${users.length}</div>
        <div class="stat-label">Registered Users</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">CRUD</div>
        <div class="stat-label">Available Operations</div>
        <div class="stat-sublabel">Create &middot; Read &middot; Update &middot; Delete</div>
      </div>
    </div>

    <!-- Create / Edit Form Card (DOM IDs Strictly Preserved) -->
    <div class="card" id="userFormCard" style="margin-bottom: 28px;">
      <h2 id="formTitle" class="card-title" style="margin-top: 0;">➕ Create New User</h2>
      <p class="card-description">Enter the candidate or alumnus credentials below to register or update records in the database.</p>
      <form id="userForm" action="/users" method="POST">
        <input type="hidden" id="userId" value="">
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" required placeholder="Enter full name (e.g. Ahmet Yılmaz)">
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required placeholder="Enter email address (e.g. ahmet@example.com)">
        </div>
        <div style="display: flex; gap: 8px; align-items: center; margin-top: 20px;">
          <button type="submit" id="submitBtn" class="btn btn-lime">Add User</button>
          <button type="button" id="cancelBtn" class="btn btn-secondary btn-secondary-dark" style="display: none;" onclick="resetForm()">Cancel</button>
        </div>
      </form>
    </div>

    <!-- User List Section -->
    <h2 class="table-section-title">📋 User List (${users.length})</h2>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 90px;">ID</th>
            <th>Name</th>
            <th>Email</th>
            <th style="width: 230px; text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${userRows}
        </tbody>
      </table>
    </div>

    <!-- Preserved Client-side Scripts for Form Manipulation & AJAX -->
    <script>
      function startEdit(button) {
        var id = button.getAttribute('data-id');
        var name = button.getAttribute('data-name');
        var email = button.getAttribute('data-email');

        document.getElementById('formTitle').innerText = '✏️ Edit User (#' + id + ')';
        document.getElementById('userId').value = id;
        document.getElementById('name').value = name;
        document.getElementById('email').value = email;
        document.getElementById('submitBtn').innerText = 'Update User';
        document.getElementById('cancelBtn').style.display = 'inline-block';

        var card = document.getElementById('userFormCard');
        if (card) {
          card.scrollIntoView({ behavior: 'smooth' });
        }
        document.getElementById('name').focus();
      }

      function resetForm() {
        document.getElementById('formTitle').innerText = '➕ Create New User';
        document.getElementById('userId').value = '';
        document.getElementById('userForm').reset();
        document.getElementById('submitBtn').innerText = 'Add User';
        document.getElementById('cancelBtn').style.display = 'none';
      }

      function deleteUser(id) {
        if (confirm('Are you sure you want to delete user #' + id + '?')) {
          fetch('/users/' + id, {
            method: 'DELETE'
          })
          .then(function(res) {
            if (res.ok) {
              window.location.reload();
            } else {
              alert('Failed to delete user #' + id);
            }
          })
          .catch(function(err) {
            alert('Error: ' + err.message);
          });
        }
      }

      document.addEventListener('DOMContentLoaded', function() {
        var form = document.getElementById('userForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
          var userId = document.getElementById('userId').value;
          if (userId) {
            e.preventDefault();
            var name = document.getElementById('name').value.trim();
            var email = document.getElementById('email').value.trim();

            fetch('/users/' + userId, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ name: name, email: email })
            })
            .then(function(res) {
              if (res.ok) {
                window.location.reload();
              } else {
                alert('Failed to update user #' + userId);
              }
            })
            .catch(function(err) {
              alert('Error: ' + err.message);
            });
          }
        });
      });
    </script>
  `;

  return getLayout("User Management", "User View Layer", content);
};

/**
 * 2. POST /users: Yeni kullanıcı oluşturulduğunda HTML sayfası (Create - C)
 *
 * @param {Object} user - Oluşturulan kullanıcı
 * @returns {string} HTML içeriği
 */
const renderUserCreatedPage = (user) => {
  const content = `
    <div class="breadcrumb-nav">
      <a href="/">Home</a>
      <span>/</span>
      <a href="/users">Users</a>
      <span>/</span>
      <span>Created</span>
    </div>

    <div class="page-header">
      <div class="page-eyebrow">✅ USER CREATION CONFIRMED</div>
      <h1 class="page-headline">User Created Successfully! <span class="badge badge-success">Create (C)</span></h1>
      <p class="page-subtitle">The user account was successfully saved to MySQL 8.0 and rendered via View Layer.</p>
    </div>

    <div class="card card-success">
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">User ID:</span>
          <span class="id-pill">#${user.id}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Full Name:</span>
          <strong>${escapeHtml(user.name)}</strong>
        </div>
        <div class="info-item">
          <span class="info-label">Email Address:</span>
          <span>${escapeHtml(user.email)}</span>
        </div>
        ${user.role || user.department ? `
        <div class="info-item">
          <span class="info-label">Role / Dept:</span>
          <span>${escapeHtml(user.role || user.department)}</span>
        </div>` : ''}
      </div>
    </div>

    <div class="actions-cluster">
      <a href="/users" class="btn btn-lime">📋 Kullanıcı Listesine Dön</a>
      <a href="/users/${user.id}" class="btn btn-secondary btn-secondary-dark">🔍 Kullanıcı Detayı</a>
    </div>
  `;

  return getLayout("Kullanıcı Oluşturuldu", "User View Layer", content);
};

/**
 * 3. GET /users/:id: Tek bir kullanıcının detay bilgisi (Read - R)
 *
 * @param {Object} user - Kullanıcı nesnesi
 * @returns {string} HTML içeriği
 */
const renderUserDetailPage = (user) => {
  const content = `
    <div class="breadcrumb-nav">
      <a href="/">Home</a>
      <span>/</span>
      <a href="/users">Users</a>
      <span>/</span>
      <span>User #${user.id}</span>
    </div>

    <div class="page-header">
      <div class="page-eyebrow">👤 MEMBER PROFILE OVERVIEW</div>
      <h1 class="page-headline">User Details <span class="badge badge-navy">Read (R)</span></h1>
      <p class="page-subtitle">Detailed account attributes and system persistence records for member #${user.id}.</p>
    </div>

    <div class="card">
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">Database ID:</span>
          <span class="id-pill">#${user.id}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Full Name:</span>
          <strong>${escapeHtml(user.name)}</strong>
        </div>
        <div class="info-item">
          <span class="info-label">Email Address:</span>
          <span>${escapeHtml(user.email)}</span>
        </div>
        ${user.role || user.department ? `
        <div class="info-item">
          <span class="info-label">Role / Dept:</span>
          <span>${escapeHtml(user.role || user.department)}</span>
        </div>` : `
        <div class="info-item">
          <span class="info-label">Role / Dept:</span>
          <span style="color: var(--secondary-text);">Alumnus / Student Member</span>
        </div>`}
        ${user.created_at ? `
        <div class="info-item">
          <span class="info-label">Member Since:</span>
          <span style="color: var(--secondary-text);">${escapeHtml(user.created_at)}</span>
        </div>` : ''}
      </div>
    </div>

    <div class="actions-cluster">
      <a href="/users" class="btn btn-lime">📋 Kullanıcı Listesine Dön</a>
      <a href="/users/${user.id}/jobs" class="btn btn-secondary btn-secondary-dark">💼 Kullanıcının İş İlanları</a>
      <a href="/api/users/${user.id}" target="_blank" class="btn btn-secondary btn-secondary-dark">⚡ View JSON API ↗</a>
    </div>
  `;

  return getLayout(`Kullanıcı Detayı #${user.id}`, "User View Layer", content);
};

/**
 * 4. PUT / PATCH /users/:id: Kullanıcı güncellendiğinde HTML sayfası (Update - U)
 *
 * @param {Object} user - Güncellenen kullanıcı nesnesi
 * @param {Object} [options] - Seçenekler
 * @param {boolean} [options.isPartial=false] - Kısmi güncelleme kontrolü
 * @returns {string} HTML içeriği
 */
const renderUserUpdatedPage = (user, { isPartial = false } = {}) => {
  const updateType = isPartial ? "Kısmi Güncelleme (PATCH)" : "Tam Güncelleme (PUT)";
  const badgeClass = isPartial ? "badge-warning" : "badge-success";

  const content = `
    <div class="breadcrumb-nav">
      <a href="/">Home</a>
      <span>/</span>
      <a href="/users">Users</a>
      <span>/</span>
      <span>Updated</span>
    </div>

    <div class="page-header">
      <div class="page-eyebrow">✏️ USER UPDATE CONFIRMED</div>
      <h1 class="page-headline">Kullanıcı Başarıyla Güncellendi! <span class="badge ${badgeClass}">${escapeHtml(updateType)}</span></h1>
      <p class="page-subtitle">Kullanıcı bilgileri MySQL 8.0 üzerinde güncellendi ve güncel veriler View Layer ile sunuldu.</p>
    </div>

    <div class="card card-success">
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">Kullanıcı ID:</span>
          <span class="id-pill">#${user.id}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Güncel İsim:</span>
          <strong>${escapeHtml(user.name)}</strong>
        </div>
        <div class="info-item">
          <span class="info-label">Güncel E-posta:</span>
          <span>${escapeHtml(user.email)}</span>
        </div>
        ${user.role || user.department ? `
        <div class="info-item">
          <span class="info-label">Rol/Departman:</span>
          <span>${escapeHtml(user.role || user.department)}</span>
        </div>` : ''}
      </div>
    </div>

    <div class="actions-cluster">
      <a href="/users" class="btn btn-lime">📋 Kullanıcı Listesine Dön</a>
      <a href="/users/${user.id}" class="btn btn-secondary btn-secondary-dark">🔍 Kullanıcı Detayı</a>
    </div>
  `;

  return getLayout("Kullanıcı Güncellendi", "User View Layer", content);
};

/**
 * 5. DELETE /users/:id: Kullanıcı silindiğinde HTML sayfası (Delete - D)
 *
 * @param {string|number} id - Silinen kullanıcı ID'si
 * @returns {string} HTML içeriği
 */
const renderUserDeletedPage = (id) => {
  const content = `
    <div class="breadcrumb-nav">
      <a href="/">Home</a>
      <span>/</span>
      <a href="/users">Users</a>
      <span>/</span>
      <span>Deleted</span>
    </div>

    <div class="page-header">
      <div class="page-eyebrow">🗑️ USER REMOVAL AUDIT</div>
      <h1 class="page-headline">Kullanıcı Başarıyla Silindi! <span class="badge badge-danger">Delete (D)</span></h1>
      <p class="page-subtitle">ID: <strong>#${escapeHtml(id)}</strong> olan kullanıcı sistemden başarıyla silindi.</p>
    </div>

    <div class="card card-danger">
      <p style="margin: 0; color: #feb2b2; font-weight: 500;">
        Kullanıcı MySQL 8.0 veritabanından kalıcı olarak kaldırıldı. Bu kullanıcıya ait var olan iş ilanlarının <code>user_id</code> alanları veri bütünlüğü için <code>NULL</code> olarak ayarlandı.
      </p>
    </div>

    <div class="actions-cluster">
      <a href="/users" class="btn btn-lime">📋 Kullanıcı Listesine Dön</a>
    </div>
  `;

  return getLayout("Kullanıcı Silindi", "User View Layer", content);
};

/**
 * 6. 404: Kullanıcı bulunamadığında HTML hata sayfası
 *
 * @param {string|number} id - Bulunamayan kullanıcı ID'si
 * @returns {string} HTML içeriği
 */
const renderUserNotFoundPage = (id) => {
  const content = `
    <div class="breadcrumb-nav">
      <a href="/">Home</a>
      <span>/</span>
      <a href="/users">Users</a>
      <span>/</span>
      <span>Not Found</span>
    </div>

    <div class="page-header">
      <div class="page-eyebrow">⚠️ RECORD NOT FOUND</div>
      <h1 class="page-headline">Kullanıcı Bulunamadı <span class="badge badge-danger">404 Not Found</span></h1>
      <p class="page-subtitle">İstenen ID: <strong>#${escapeHtml(id)}</strong> numaralı kullanıcı sistemde mevcut değil.</p>
    </div>

    <div class="card card-danger">
      <h3 style="margin-top: 0; margin-bottom: 8px; color: #feb2b2;">Kullanıcı Kaydı Mevcut Değil</h3>
      <p style="margin: 0; color: var(--secondary-text);">
        Aradığınız kullanıcı silinmiş olabilir veya hiç var olmamış olabilir. Lütfen ID numarasını kontrol ediniz veya kullanıcı dizininden arama yapınız.
      </p>
    </div>

    <div class="actions-cluster">
      <a href="/users" class="btn btn-lime">📋 Kullanıcı Listesine Dön</a>
      <a href="/" class="btn btn-secondary btn-secondary-dark">🏠 Ana Sayfaya Dön</a>
    </div>
  `;

  return getLayout("Kullanıcı Bulunamadı (404)", "User View Layer", content);
};

const userJobsView = require('./userJobsView');

module.exports = {
  escapeHtml,
  renderUsersPage,
  renderUserCreatedPage,
  renderUserDetailPage,
  renderUserUpdatedPage,
  renderUserDeletedPage,
  renderUserNotFoundPage,
  renderUserJobsPage: userJobsView.renderUserJobsPage
};
