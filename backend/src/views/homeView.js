/**
 * View Layer: Renders the Home (Index) HTML View.
 * Alumni Tracking System — Full Midnight (Dark & Premium) Design System.
 *
 * Design Inspirations:
 * - Claude: Typographic clarity, editorial calm, airy hierarchy, purposeful whitespace.
 * - BMW M: High-precision technical dark aesthetic, hairline contours, lime highlights.
 * - Apple: Edge-to-edge canvas visual depth, translucent glass overlays, continuous flow.
 *
 * Master Color Palette:
 * - Midnight Navy:  #101827 (Primary canvas ground)
 * - Secondary Navy: #202E46 (Surface layer, elevated cards)
 * - Electric Blue:  #6D8CFF (Connection lines, active nav, technical accents)
 * - Lime:           #D5F36A (Primary hero CTA, glowing nodes)
 * - Soft White:     #F4F5F7 (Primary headlines, crisp contrast text)
 * - Secondary Text: #B9C3D2 (Descriptions, supporting copy)
 * - Subtle Border:  #35445D (Hairline card & container dividers)
 */

/**
 * Escapes HTML special characters to prevent cross-site scripting (XSS).
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
 * Returns the refined Full Midnight - Dark & Premium Alumni Tracking System homepage HTML.
 *
 * @returns {string} HTML content
 */
const renderHomePage = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Alumni Tracking System - Full Midnight Dark &amp; Premium alumni tracking and career network platform.">
  <title>Alumni Tracking System - Alumni &amp; Career Portal</title>
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

    h1, h2, h3, .brand-title, .hero-eyebrow, .section-title, .card-title, .hero-headline, .hero-secondary {
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

    /* ==========================================================================
       HERO SECTION — FULL-WIDTH CONTINUOUS COMPOSITION (CRITICAL ARCHITECTURE)
       - The abstract connection-network visual is the full-width background layer.
       - All text, headings, and CTAs sit directly ON TOP with 100% transparent backgrounds.
       - NO opaque navy panel, NO card, NO solid rectangle, NO split columns.
       ========================================================================== */
    .hero-fullwidth {
      position: relative;
      width: 100%;
      min-height: 560px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 72px 24px 64px;
      background: var(--midnight-navy);
      border-bottom: 1px solid var(--subtle-border);
    }

    /* Abstract Connection-Network Visual (Bottom Layer) */
    .hero-network-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    }

    .hero-network-canvas svg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Gentle ambient light animations */
    @keyframes nodePulse {
      0%, 100% {
        opacity: 0.4;
        transform: scale(1);
      }
      50% {
        opacity: 0.9;
        transform: scale(1.15);
      }
    }

    @keyframes ambientGlow {
      0%, 100% {
        opacity: 0.25;
      }
      50% {
        opacity: 0.45;
      }
    }

    .pulse-node-slow {
      animation: nodePulse 6s ease-in-out infinite;
      transform-origin: center;
    }

    .pulse-node-fast {
      animation: nodePulse 4s ease-in-out infinite;
      transform-origin: center;
    }

    .ambient-glow-layer {
      animation: ambientGlow 8s ease-in-out infinite;
    }

    /* Foreground Content (Directly Over Background — 100% Transparent) */
    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 860px;
      margin: 0 auto;
      text-align: center;
      background: transparent !important;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: var(--electric-blue);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .hero-eyebrow::before,
    .hero-eyebrow::after {
      content: "";
      width: 32px;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--electric-blue));
    }

    .hero-eyebrow::after {
      background: linear-gradient(90deg, var(--electric-blue), transparent);
    }

    .hero-headline {
      font-size: 52px;
      font-weight: 800;
      line-height: 1.1;
      color: var(--soft-white);
      margin-bottom: 14px;
      letter-spacing: -1.2px;
      text-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
    }

    .hero-secondary {
      font-size: 22px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 16px;
      letter-spacing: -0.3px;
    }

    .hero-description {
      font-size: 16px;
      color: var(--secondary-text);
      max-width: 640px;
      line-height: 1.65;
      margin-bottom: 32px;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 28px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 28px;
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

    .hero-scroll-cue {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--secondary-text);
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      background: rgba(32, 46, 70, 0.4);
      border: 1px solid rgba(53, 68, 93, 0.5);
      transition: var(--transition);
    }

    .hero-scroll-cue:hover {
      color: var(--lime);
      border-color: var(--lime);
      background: rgba(32, 46, 70, 0.7);
    }

    /* Main Container */
    .main-content {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 56px 24px 72px;
    }

    /* Section Header */
    .section-header {
      margin-bottom: 32px;
    }

    .section-subtitle-tag {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--electric-blue);
      margin-bottom: 8px;
    }

    .section-title {
      font-size: 28px;
      font-weight: 800;
      color: var(--soft-white);
      letter-spacing: -0.5px;
    }

    .section-desc {
      font-size: 15px;
      color: var(--secondary-text);
      margin-top: 6px;
      max-width: 720px;
    }

    /* Core Modules Grid (Dark Navy Surfaces #202E46) */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 56px;
      width: 100%;
    }

    .card {
      background: var(--secondary-navy);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-md);
      padding: 28px 24px 24px;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: var(--transition);
      position: relative;
      min-width: 0;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-card-hover);
      border-color: var(--electric-blue);
    }

    .card-top {
      margin-bottom: 20px;
    }

    .card-header-flex {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }

    .card-icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: rgba(16, 24, 39, 0.6);
      color: var(--electric-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--subtle-border);
      transition: var(--transition);
      flex-shrink: 0;
    }

    .card:hover .card-icon-box {
      border-color: var(--electric-blue);
      color: var(--lime);
      background: rgba(109, 140, 255, 0.1);
    }

    .badge {
      display: inline-block;
      background: rgba(16, 24, 39, 0.6);
      color: var(--secondary-text);
      border: 1px solid var(--subtle-border);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .badge-blue {
      background: rgba(109, 140, 255, 0.12);
      color: #9cb2ff;
      border-color: rgba(109, 140, 255, 0.3);
    }

    .badge-lime {
      background: rgba(213, 243, 106, 0.12);
      color: var(--lime);
      border-color: rgba(213, 243, 106, 0.3);
    }

    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--soft-white);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-text {
      color: var(--secondary-text);
      font-size: 14px;
      line-height: 1.6;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      padding-top: 18px;
      border-top: 1px solid rgba(53, 68, 93, 0.6);
    }

    .btn-card-primary {
      background: rgba(16, 24, 39, 0.7);
      color: var(--soft-white);
      border: 1px solid var(--subtle-border);
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--radius-sm);
    }

    .btn-card-primary:hover {
      background: var(--electric-blue);
      border-color: var(--electric-blue);
      color: var(--midnight-navy);
      font-weight: 700;
    }

    .btn-card-secondary {
      background: transparent;
      color: var(--secondary-text);
      border: 1px solid rgba(53, 68, 93, 0.5);
      padding: 9px 14px;
      font-size: 13px;
      border-radius: var(--radius-sm);
    }

    .btn-card-secondary:hover {
      background: rgba(32, 46, 70, 0.5);
      border-color: var(--secondary-text);
      color: var(--soft-white);
    }

    /* Community Message Banner */
    .community-banner {
      background: linear-gradient(135deg, rgba(32, 46, 70, 0.85) 0%, rgba(16, 24, 39, 0.95) 100%);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-lg);
      padding: 32px 36px;
      margin-bottom: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
    }

    .community-text h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--soft-white);
      margin-bottom: 6px;
    }

    .community-text p {
      font-size: 14px;
      color: var(--secondary-text);
      max-width: 620px;
    }

    /* Developer / API Quick Links Bar */
    .api-preview-section {
      background: rgba(32, 46, 70, 0.5);
      border: 1px solid var(--subtle-border);
      border-radius: var(--radius-md);
      padding: 24px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }

    .api-preview-text h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--soft-white);
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .api-preview-text p {
      font-size: 13px;
      color: var(--secondary-text);
    }

    .api-endpoints-pill {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .endpoint-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 24, 39, 0.7);
      border: 1px solid var(--subtle-border);
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: var(--soft-white);
      font-weight: 600;
      transition: var(--transition);
    }

    .endpoint-badge:hover {
      border-color: var(--electric-blue);
      color: var(--lime);
      transform: translateY(-1px);
    }

    .endpoint-badge .method {
      color: var(--electric-blue);
      font-size: 11px;
      font-weight: 700;
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

      .hero-headline {
        font-size: 38px;
      }

      .hero-secondary {
        font-size: 19px;
      }

      .grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }
    }

    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .card {
        width: 100%;
      }

      .community-banner {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
        padding: 28px 24px;
      }

      .community-banner .btn {
        width: 100%;
      }

      .api-preview-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .api-endpoints-pill {
        width: 100%;
      }
    }

    @media (max-width: 640px) {
      .nav-container {
        padding: 12px 16px;
      }

      .main-content {
        padding: 36px 16px 48px;
      }

      .hero-fullwidth {
        padding: 56px 16px 48px;
        min-height: auto;
      }

      .hero-headline {
        font-size: 28px;
        letter-spacing: -0.5px;
      }

      .hero-secondary {
        font-size: 17px;
      }

      .hero-description {
        font-size: 14px;
      }

      .hero-actions {
        flex-direction: column;
        width: 100%;
      }

      .hero-actions .btn {
        width: 100%;
      }

      .card-actions {
        flex-direction: column;
      }

      .card-actions .btn {
        width: 100%;
        text-align: center;
        justify-content: center;
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
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Top Sticky Navigation (Midnight Chrome) -->
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

      <!-- Desktop & Mobile Navigation Links -->
      <nav class="nav-menu" id="nav-menu" aria-label="Main Navigation">
        <a href="/" class="nav-link active">Home</a>
        <a href="/about" class="nav-link">About</a>
        <a href="/users" class="nav-link">Users</a>
        <a href="/announcements" class="nav-link">Announcements</a>
        <a href="/job-postings" class="nav-link">Job Postings</a>
        <a href="/applications" class="nav-link">Applications</a>
        <a href="/register" class="nav-link">Register</a>
        <a href="/api/swagger" target="_blank" class="nav-link nav-cta">Swagger UI</a>
      </nav>
    </div>
  </header>

  <!-- ==========================================================================
       HERO (HIGHEST PRIORITY) — FULL-WIDTH CONTINUOUS COMPOSITION
       All copy, headings, and buttons sit directly ON TOP OF the visual.
       Text backgrounds are completely transparent. NO opaque navy panel or card.
       ========================================================================== -->
  <section class="hero-fullwidth" aria-labelledby="hero-title">
    <!-- Abstract connection-network visual (Edge-to-Edge Background Canvas) -->
    <div class="hero-network-canvas" aria-hidden="true">
      <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Deep ambient radial glow -->
          <radialGradient id="centerGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stop-color="#202E46" stop-opacity="0.8"/>
            <stop offset="50%" stop-color="#152136" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#101827" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="electricGlow" cx="50%" cy="30%" r="40%">
            <stop offset="0%" stop-color="#6D8CFF" stop-opacity="0.18"/>
            <stop offset="60%" stop-color="#6D8CFF" stop-opacity="0.04"/>
            <stop offset="100%" stop-color="#101827" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="limeGlow" cx="80%" cy="60%" r="30%">
            <stop offset="0%" stop-color="#D5F36A" stop-opacity="0.12"/>
            <stop offset="70%" stop-color="#101827" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Base ambient glow layers -->
        <rect width="1440" height="600" fill="url(#centerGlow)"/>
        <rect width="1440" height="600" fill="url(#electricGlow)" class="ambient-glow-layer"/>
        <rect width="1440" height="600" fill="url(#limeGlow)"/>

        <!-- Delicate Connection Lines (Network Topology) -->
        <g stroke="#6D8CFF" stroke-width="1" stroke-opacity="0.28">
          <line x1="80" y1="120" x2="240" y2="200"/>
          <line x1="240" y1="200" x2="420" y2="150"/>
          <line x1="420" y1="150" x2="560" y2="280"/>
          <line x1="560" y1="280" x2="720" y2="180"/>
          <line x1="720" y1="180" x2="880" y2="260"/>
          <line x1="880" y1="260" x2="1060" y2="170"/>
          <line x1="1060" y1="170" x2="1240" y2="230"/>
          <line x1="1240" y1="230" x2="1380" y2="140"/>

          <!-- Cross-connection mesh -->
          <line x1="240" y1="200" x2="310" y2="380" stroke-opacity="0.2"/>
          <line x1="310" y1="380" x2="560" y2="280" stroke-opacity="0.25"/>
          <line x1="560" y1="280" x2="680" y2="440" stroke-opacity="0.22"/>
          <line x1="680" y1="440" x2="720" y2="180" stroke-opacity="0.25"/>
          <line x1="720" y1="180" x2="940" y2="420" stroke-opacity="0.22"/>
          <line x1="940" y1="420" x2="880" y2="260" stroke-opacity="0.25"/>
          <line x1="880" y1="260" x2="1140" y2="370" stroke-opacity="0.2"/>
          <line x1="1140" y1="370" x2="1240" y2="230" stroke-opacity="0.2"/>

          <!-- Tertiary subtle links -->
          <line x1="150" y1="460" x2="310" y2="380" stroke-dasharray="4 4" stroke-opacity="0.15"/>
          <line x1="680" y1="440" x2="940" y2="420" stroke-dasharray="4 4" stroke-opacity="0.18"/>
          <line x1="1140" y1="370" x2="1320" y2="470" stroke-dasharray="4 4" stroke-opacity="0.15"/>
        </g>

        <!-- Connection Nodes (Electric Blue & Lime Highlights) -->
        <!-- Major Nodes -->
        <circle cx="240" cy="200" r="5" fill="#6D8CFF" fill-opacity="0.8"/>
        <circle cx="240" cy="200" r="10" stroke="#6D8CFF" stroke-opacity="0.3" stroke-width="1" class="pulse-node-slow"/>

        <circle cx="420" cy="150" r="4" fill="#6D8CFF" fill-opacity="0.7"/>

        <circle cx="560" cy="280" r="6" fill="#D5F36A" fill-opacity="0.9"/>
        <circle cx="560" cy="280" r="12" stroke="#D5F36A" stroke-opacity="0.3" stroke-width="1" class="pulse-node-fast"/>

        <circle cx="720" cy="180" r="5" fill="#6D8CFF" fill-opacity="0.9"/>
        <circle cx="720" cy="180" r="11" stroke="#6D8CFF" stroke-opacity="0.25" class="pulse-node-slow"/>

        <circle cx="880" cy="260" r="6" fill="#D5F36A" fill-opacity="0.85"/>
        <circle cx="880" cy="260" r="13" stroke="#D5F36A" stroke-opacity="0.28" class="pulse-node-fast"/>

        <circle cx="1060" cy="170" r="4" fill="#6D8CFF" fill-opacity="0.7"/>

        <circle cx="1240" cy="230" r="5" fill="#6D8CFF" fill-opacity="0.8"/>
        <circle cx="1240" cy="230" r="11" stroke="#6D8CFF" stroke-opacity="0.3" class="pulse-node-slow"/>

        <!-- Minor Ground Nodes -->
        <circle cx="80" cy="120" r="3" fill="#6D8CFF" fill-opacity="0.5"/>
        <circle cx="310" cy="380" r="4" fill="#6D8CFF" fill-opacity="0.6"/>
        <circle cx="680" cy="440" r="4" fill="#D5F36A" fill-opacity="0.7"/>
        <circle cx="940" cy="420" r="4" fill="#6D8CFF" fill-opacity="0.6"/>
        <circle cx="1140" cy="370" r="4" fill="#D5F36A" fill-opacity="0.7"/>
        <circle cx="1380" cy="140" r="3" fill="#6D8CFF" fill-opacity="0.5"/>
        <circle cx="150" cy="460" r="3" fill="#6D8CFF" fill-opacity="0.4"/>
        <circle cx="1320" cy="470" r="3" fill="#6D8CFF" fill-opacity="0.4"/>
      </svg>
    </div>

    <!-- Hero Content (Directly Layered Over Visual — Transparent Background) -->
    <div class="hero-content">
      <div class="hero-eyebrow">CONNECT · GROW · SUCCEED</div>
      <h1 id="hero-title" class="hero-headline">Your next chapter starts here.</h1>
      <p class="hero-secondary">One community. Endless possibilities.</p>
      <p class="hero-description">Connect with people, discover opportunities and build your professional future.</p>
      <div class="hero-actions">
        <a href="/job-postings" class="btn btn-lime">Explore Alumni ↗</a>
      </div>
      <a href="#portal-modules" class="hero-scroll-cue">Discover more ↓</a>
    </div>
  </section>

  <!-- Main Content Layout -->
  <main id="main-content" class="main-content">

    <!-- Core Modules Grid Section (Exactly One Presentation of All 6 Core Modules) -->
    <section id="portal-modules" aria-labelledby="modules-heading">
      <div class="section-header">
        <div class="section-subtitle-tag">PLATFORM ECOSYSTEM</div>
        <h2 id="modules-heading" class="section-title">Core Modules &amp; Services</h2>
        <p class="section-desc">Explore the primary management modules and live developer endpoints powering the Alumni Tracking System.</p>
      </div>

      <div class="grid">
        <!-- 1. Users -->
        <div class="card">
          <div class="card-top">
            <div class="card-header-flex">
              <div class="card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span class="badge badge-blue">Profiles &amp; Networking</span>
            </div>
            <h3 class="card-title">👥 Users</h3>
            <p class="card-text">Browse and manage registered alumni and student profiles, create new member records, or update contact and education details.</p>
          </div>
          <div class="card-actions">
            <a href="/users" class="btn btn-card-primary">Users Directory</a>
            <a href="/api/users" target="_blank" class="btn btn-card-secondary">JSON API</a>
          </div>
        </div>

        <!-- 2. Announcements -->
        <div class="card">
          <div class="card-top">
            <div class="card-header-flex">
              <div class="card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 11l18-5v12L3 14v-3z"/>
                  <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
                </svg>
              </div>
              <span class="badge badge-blue">News &amp; Events</span>
            </div>
            <h3 class="card-title">📢 Announcements</h3>
            <p class="card-text">Publish, update, and manage institutional announcements, academic updates, alumni gatherings, and community events.</p>
          </div>
          <div class="card-actions">
            <a href="/announcements" class="btn btn-card-primary">Announcements Board</a>
            <a href="/api/announcements" target="_blank" class="btn btn-card-secondary">JSON API</a>
          </div>
        </div>

        <!-- 3. Job Postings -->
        <div class="card">
          <div class="card-top">
            <div class="card-header-flex">
              <div class="card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <span class="badge badge-lime">Careers &amp; Internships</span>
            </div>
            <h3 class="card-title">💼 Job Postings</h3>
            <p class="card-text">Explore full-time career roles and internship opportunities, view hiring organization details, and review inbound candidate applications.</p>
          </div>
          <div class="card-actions">
            <a href="/job-postings" class="btn btn-card-primary">Job Board</a>
            <a href="/api/job-postings" target="_blank" class="btn btn-card-secondary">JSON API</a>
          </div>
        </div>

        <!-- 4. Applications -->
        <div class="card">
          <div class="card-top">
            <div class="card-header-flex">
              <div class="card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  <path d="M9 12h6"/>
                  <path d="M9 16h6"/>
                </svg>
              </div>
              <span class="badge badge-blue">Candidate Tracking</span>
            </div>
            <h3 class="card-title">📝 Applications</h3>
            <p class="card-text">Track and review job applications submitted by candidates, inspect attached CV links, and manage application review statuses.</p>
          </div>
          <div class="card-actions">
            <a href="/applications" class="btn btn-card-primary">Applications Board</a>
            <a href="/api/applications" target="_blank" class="btn btn-card-secondary">JSON API</a>
          </div>
        </div>

        <!-- 5. Swagger API Documentation -->
        <div class="card">
          <div class="card-top">
            <div class="card-header-flex">
              <div class="card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <span class="badge badge-lime">OpenAPI 3.0</span>
            </div>
            <h3 class="card-title">📖 Swagger API</h3>
            <p class="card-text">Interactively explore and test all backend RESTful endpoints with the live OpenAPI 3.0 documentation interface.</p>
          </div>
          <div class="card-actions">
            <a href="/api/swagger" target="_blank" class="btn btn-card-primary">Open Swagger UI</a>
            <a href="/api/swagger/doc.json" target="_blank" class="btn btn-card-secondary">doc.json</a>
          </div>
        </div>

        <!-- 6. System Health -->
        <div class="card">
          <div class="card-top">
            <div class="card-header-flex">
              <div class="card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <span class="badge badge-blue">MySQL &amp; Express</span>
            </div>
            <h3 class="card-title">🩺 System Health</h3>
            <p class="card-text">Monitor live operational metrics, Express service uptime, and MySQL database connection pool availability.</p>
          </div>
          <div class="card-actions">
            <a href="/api/health" target="_blank" class="btn btn-card-secondary">Check Health</a>
            <a href="/alumni" class="btn btn-card-secondary">Service Ping</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Concise Community Message Banner -->
    <div class="community-banner">
      <div class="community-text">
        <h3>One Community, Boundless Opportunities</h3>
        <p>Strengthening communication between alumni and students, streamlining career tracking, and fostering institutional networking.</p>
      </div>
      <div>
        <a href="/about" class="btn btn-secondary-dark">About the Platform</a>
      </div>
    </div>

    <!-- Quick API Reference for Developers -->
    <div class="api-preview-section">
      <div class="api-preview-text">
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 17l6-6-6-6M12 19h8"/>
          </svg>
          REST API Quick Reference
        </h3>
        <p>Ready-to-use JSON endpoints for client applications and third-party integrations.</p>
      </div>
      <div class="api-endpoints-pill">
        <a href="/api/users" target="_blank" class="endpoint-badge"><span class="method">GET</span> /api/users</a>
        <a href="/api/announcements" target="_blank" class="endpoint-badge"><span class="method">GET</span> /api/announcements</a>
        <a href="/api/job-postings" target="_blank" class="endpoint-badge"><span class="method">GET</span> /api/job-postings</a>
        <a href="/api/applications" target="_blank" class="endpoint-badge"><span class="method">GET</span> /api/applications</a>
        <a href="/api/health" target="_blank" class="endpoint-badge"><span class="method">GET</span> /api/health</a>
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
  renderHomePage
};
