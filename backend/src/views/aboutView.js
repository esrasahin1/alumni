/**
 * View Layer: Renders the About Page HTML View.
 * Alumni Tracking System — Full Midnight (Dark & Premium) Design System.
 *
 * Visual & Functional Alignment with homeView.js:
 * - Palette: Midnight Navy #101827, Secondary Navy #202E46, Electric Blue #6D8CFF,
 *            Lime #D5F36A, Soft White #F4F5F7, Secondary Text #B9C3D2, Subtle Border #35445D.
 * - Typography: Space Grotesk (Headings) and DM Sans (Body).
 * - Navigation: Consistent sticky header with Home, About (active), and core destinations.
 * - Mobile Responsiveness: Accessible hamburger toggle, single-column responsive layout on narrow screens.
 */

/**
 * Escapes HTML special characters to prevent cross-site scripting (XSS).
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
 * Returns the Full Midnight About Page HTML string.
 *
 * @returns {string} HTML content
 */
const renderAboutPage = (currentUser = null) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="About Alumni Tracking System - Empowering university alumni and students through institutional networking, career opportunities, and verified data.">
  <title>About Alumni Tracking System - Mission, Architecture &amp; Community</title>
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

    h1, h2, h3, h4, .brand-title, .section-title, .page-headline {
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
      transition: top 0.2s;
    }

    .skip-link:focus {
      top: 14px;
    }

    /* Top Sticky Navigation */
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

    /* About Header Banner */
    .about-header-banner {
      position: relative;
      background: linear-gradient(180deg, rgba(32, 46, 70, 0.4) 0%, var(--midnight-navy) 100%);
      border-bottom: 1px solid var(--subtle-border);
      padding: 64px 24px 56px;
      text-align: center;
      overflow: hidden;
      width: 100%;
    }

    .banner-network-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.35;
      z-index: 0;
      overflow: hidden;
    }

    .banner-network-svg svg {
      width: 100%;
      height: 100%;
      max-width: 100%;
      object-fit: cover;
      display: block;
    }

    .banner-content {
      position: relative;
      z-index: 1;
      max-width: 820px;
      width: 100%;
      margin: 0 auto;
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

    .page-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--electric-blue);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }

    .page-headline {
      font-size: 42px;
      font-weight: 800;
      line-height: 1.15;
      color: var(--soft-white);
      margin-bottom: 16px;
      letter-spacing: -1px;
    }

    .page-subtitle {
      font-size: 17px;
      color: var(--secondary-text);
      max-width: 680px;
      margin: 0 auto 28px;
      line-height: 1.6;
    }

    .banner-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 24px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: var(--transition);
      border: 1px solid transparent;
    }

    .btn-lime {
      background: var(--lime);
      color: var(--midnight-navy);
      font-weight: 700;
      box-shadow: 0 4px 18px rgba(213, 243, 106, 0.35);
    }

    .btn-lime:hover {
      background: var(--lime-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(213, 243, 106, 0.5);
    }

    .btn-secondary-dark {
      background: rgba(32, 46, 70, 0.6);
      color: var(--soft-white);
      border-color: var(--subtle-border);
      backdrop-filter: blur(8px);
    }

    .btn-secondary-dark:hover {
      background: rgba(40, 58, 88, 0.85);
      border-color: var(--electric-blue);
      color: var(--soft-white);
      transform: translateY(-2px);
    }

    /* Main Content Layout */
    .about-main {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 56px 24px 72px;
    }

    .about-section {
      margin-bottom: 56px;
      width: 100%;
    }

    .section-header {
      margin-bottom: 28px;
    }

    .section-tag {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--electric-blue);
      margin-bottom: 8px;
    }

    .section-title {
      font-size: 26px;
      font-weight: 800;
      color: var(--soft-white);
      letter-spacing: -0.5px;
    }

    .section-desc {
      font-size: 15px;
      color: var(--secondary-text);
      margin-top: 6px;
      max-width: 760px;
    }

    /* Multi-Column Cards Grid */
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      width: 100%;
    }

    .about-card {
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-md);
      padding: 28px 24px;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      transition: var(--transition);
      min-width: 0;
      width: 100%;
    }

    .about-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-card-hover);
      border-color: var(--electric-blue);
    }

    .about-card-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: rgba(16, 24, 39, 0.7);
      border: 1px solid var(--subtle-border);
      color: var(--lime);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 18px;
    }

    .about-card h3 {
      font-size: 19px;
      font-weight: 700;
      color: var(--soft-white);
      margin-bottom: 10px;
    }

    .about-card p {
      font-size: 14px;
      color: var(--secondary-text);
      line-height: 1.6;
    }

    /* Architecture Highlights Banner */
    .arch-banner {
      background: linear-gradient(135deg, rgba(32, 46, 70, 0.75) 0%, rgba(16, 24, 39, 0.95) 100%);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-lg);
      padding: 36px 32px;
      margin-bottom: 56px;
      width: 100%;
    }

    .arch-banner h2 {
      font-size: 24px;
      font-weight: 800;
      color: var(--soft-white);
      margin-bottom: 12px;
    }

    .arch-banner p {
      font-size: 15px;
      color: var(--secondary-text);
      max-width: 820px;
      margin-bottom: 24px;
      line-height: 1.65;
    }

    .specs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      width: 100%;
    }

    .spec-item {
      background: rgba(16, 24, 39, 0.6);
      border: 1px solid var(--subtle-border);
      padding: 16px 20px;
      border-radius: var(--radius-sm);
      min-width: 0;
    }

    .spec-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--electric-blue);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }

    .spec-value {
      font-size: 15px;
      font-weight: 600;
      color: var(--soft-white);
    }

    /* Bottom Closing CTA */
    .closing-cta {
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-lg);
      padding: 36px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .closing-cta h2 {
      font-size: 24px;
      font-weight: 800;
      color: var(--soft-white);
    }

    .closing-cta p {
      font-size: 15px;
      color: var(--secondary-text);
      max-width: 600px;
    }

    .closing-cta-actions {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      justify-content: center;
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
      gap: 18px;
      flex-wrap: wrap;
    }

    .footer-nav a {
      font-size: 13px;
      color: var(--secondary-text);
      font-weight: 500;
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

    /* Reduced Motion & Responsive Breakpoints */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
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
        font-size: 32px;
      }

      .grid-3 {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }
    }

    @media (max-width: 768px) {
      .grid-3 {
        grid-template-columns: 1fr !important;
        gap: 20px;
      }

      .about-card {
        width: 100% !important;
      }

      .arch-banner {
        padding: 24px 18px;
      }

      .specs-grid {
        grid-template-columns: 1fr !important;
        gap: 12px;
      }

      .spec-item {
        width: 100% !important;
      }

      .closing-cta {
        padding: 28px 20px;
      }

      .banner-actions {
        flex-direction: column;
        width: 100%;
      }

      .banner-actions .btn {
        width: 100%;
      }

      .closing-cta-actions {
        flex-direction: column;
        width: 100%;
      }

      .closing-cta-actions .btn {
        width: 100%;
      }
    }

    @media (max-width: 640px) {
      .nav-container {
        padding: 12px 16px;
      }

      .about-main {
        padding: 32px 16px 48px;
      }

      .about-header-banner {
        padding: 44px 16px 36px;
      }

      .page-headline {
        font-size: 26px;
      }

      .page-subtitle {
        font-size: 15px;
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

      .arch-tags {
        flex-wrap: wrap;
        gap: 6px;
      }
    }
  </style>
</head>
<body>

  <!-- Keyboard Accessibility Skip Link -->
  <a href="#about-content" class="skip-link">Skip to main content</a>

  <!-- Top Sticky Navigation (Matching Full Midnight Chrome) -->
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

      <!-- Desktop & Mobile Navigation Links (Home & About Clearly Included) -->
      <nav class="nav-menu" id="nav-menu" aria-label="Main Navigation">
        <a href="/" class="nav-link">Home</a>
        <a href="/about" class="nav-link active">About</a>
        <a href="/users" class="nav-link">Users</a>
        <a href="/announcements" class="nav-link">Announcements</a>
        <a href="/job-postings" class="nav-link">Job Postings</a>
        <a href="/applications" class="nav-link">Applications</a>
        ${renderNavAuthItems(currentUser, escapeHtml)}
        <a href="/api/swagger" target="_blank" class="nav-link nav-cta">Swagger UI</a>
      </nav>
    </div>
  </header>

  <!-- About Header Banner -->
  <section class="about-header-banner" aria-labelledby="about-page-title">
    <div class="banner-network-svg" aria-hidden="true">
      <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="100" y1="60" x2="350" y2="180" stroke="#6D8CFF" stroke-width="1" stroke-opacity="0.3"/>
        <line x1="350" y1="180" x2="650" y2="90" stroke="#6D8CFF" stroke-width="1" stroke-opacity="0.25"/>
        <line x1="650" y1="90" x2="900" y2="200" stroke="#6D8CFF" stroke-width="1" stroke-opacity="0.3"/>
        <line x1="900" y1="200" x2="1100" y2="100" stroke="#6D8CFF" stroke-width="1" stroke-opacity="0.2"/>
        <circle cx="350" cy="180" r="5" fill="#6D8CFF" fill-opacity="0.7"/>
        <circle cx="650" cy="90" r="6" fill="#D5F36A" fill-opacity="0.8"/>
        <circle cx="900" cy="200" r="5" fill="#6D8CFF" fill-opacity="0.7"/>
      </svg>
    </div>

    <div class="banner-content">
      <div class="breadcrumb-nav">
        <a href="/">← Return to Home</a>
        <span>/</span>
        <span>About</span>
      </div>
      <div class="page-eyebrow">MISSION &amp; ARCHITECTURE</div>
      <h1 id="about-page-title" class="page-headline">Connecting Alumni, Empowering Futures.</h1>
      <p class="page-subtitle">A modern enterprise platform designed to bridge institutional heritage with professional opportunity across generations of graduates and students.</p>
      <div class="banner-actions">
        <a href="/" class="btn btn-lime">← Back to Dashboard</a>
        <a href="/job-postings" class="btn btn-secondary-dark">Explore Job Postings</a>
      </div>
    </div>
  </section>

  <!-- Main Content Layout -->
  <main id="about-content" class="about-main">

    <!-- Mission & Strategic Pillars -->
    <section class="about-section" aria-labelledby="pillars-heading">
      <div class="section-header">
        <div class="section-tag">STRATEGIC PILLARS</div>
        <h2 id="pillars-heading" class="section-title">Core Mission &amp; Purpose</h2>
        <p class="section-desc">The Alumni Tracking System is built to solve the challenges of institutional networking, career development, and graduate engagement through three foundational pillars.</p>
      </div>

      <div class="grid-3">
        <div class="about-card">
          <div class="about-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3>Verified Alumni Directory</h3>
          <p>Maintains reliable, up-to-date graduate records, fostering direct peer connections across graduating cohorts and professional disciplines.</p>
        </div>

        <div class="about-card">
          <div class="about-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <h3>Career &amp; Mentorship Bridge</h3>
          <p>Connects ambitious students and recent graduates with exclusive career opportunities and internships shared directly by established alumni.</p>
        </div>

        <div class="about-card">
          <div class="about-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 11l18-5v12L3 14v-3z"/>
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
            </svg>
          </div>
          <h3>Centralized Communications</h3>
          <p>Provides a single source of truth for institutional updates, academic milestones, networking events, and alumni success stories.</p>
        </div>
      </div>
    </section>

    <!-- Architecture & Platform Specifications -->
    <section class="about-section" aria-labelledby="arch-heading">
      <div class="arch-banner">
        <h2 id="arch-heading">Enterprise Engineering Architecture</h2>
        <p>The system is built on a resilient Model-View-Controller (MVC) foundation powered by Node.js, Express, and MySQL 8.0, with an interactive OpenAPI 3.0 REST specification.</p>

        <div class="specs-grid">
          <div class="spec-item">
            <div class="spec-title">Pattern</div>
            <div class="spec-value">Modular Express MVC</div>
          </div>
          <div class="spec-item">
            <div class="spec-title">Database</div>
            <div class="spec-value">MySQL 8.0 Persistence</div>
          </div>
          <div class="spec-item">
            <div class="spec-title">API Standard</div>
            <div class="spec-value">OpenAPI 3.0 / Swagger</div>
          </div>
          <div class="spec-item">
            <div class="spec-title">Design System</div>
            <div class="spec-value">Full Midnight (Dark &amp; Premium)</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stakeholder Value Proposition -->
    <section class="about-section" aria-labelledby="stakeholders-heading">
      <div class="section-header">
        <div class="section-tag">AUDIENCE &amp; BENEFICIARIES</div>
        <h2 id="stakeholders-heading" class="section-title">Who the Platform Serves</h2>
        <p class="section-desc">Designed with specific workflows tailored to alumni, rising students, and academic administrators.</p>
      </div>

      <div class="grid-3">
        <div class="about-card">
          <h3>Graduates &amp; Alumni</h3>
          <p>Stay engaged with their alma mater, recruit verified student talent for their organizations, and give back through mentorship and job postings.</p>
        </div>
        <div class="about-card">
          <h3>Current Students</h3>
          <p>Discover high-value internships, learn from the career pathways of former graduates, and submit direct job applications with tracked statuses.</p>
        </div>
        <div class="about-card">
          <h3>Faculty &amp; Administrators</h3>
          <p>Track graduate placement metrics, publish university-wide notices, and securely manage member records through administrative endpoints.</p>
        </div>
      </div>
    </section>

    <!-- Closing Call-to-Action -->
    <div class="closing-cta">
      <h2>Explore the Alumni Network</h2>
      <p>Discover registered alumni, browse active job opportunities, or inspect the interactive Swagger API documentation.</p>
      <div class="closing-cta-actions">
        <a href="/" class="btn btn-lime">Return to Dashboard</a>
        <a href="/users" class="btn btn-secondary-dark">View Users Directory</a>
        <a href="/api/swagger" target="_blank" class="btn btn-secondary-dark">Interactive API Docs ↗</a>
      </div>
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
      const toggleBtn = document.getElementById('mobile-menu-toggle');
      const navMenu = document.getElementById('nav-menu');
      if (toggleBtn && navMenu) {
        toggleBtn.addEventListener('click', function() {
          const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
          toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
          navMenu.classList.toggle('is-open');
        });

        // Close mobile menu on Escape key press
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
</html>
`;
};

module.exports = {
  escapeHtml,
  renderAboutPage
};
