# 🎨 Alumni Tracking System — Brand Identity & Visual Style Guide

---

## 1. Executive Summary & Brand Overview

This document provides the authoritative **Brand Identity & Visual Style Guide** for the **Alumni Tracking System**. It establishes the core brand definition, institutional purpose, target audience, color palette, design tone, typography, and iconography standards in alignment with the active codebase (`backend/src/views/`, `backend/src/app.js`, and project documentation).

> [!NOTE]
> The Alumni Tracking System combines server-side rendered (SSR) web interfaces with a RESTful API backend built on Node.js, Express, and MySQL 8.0.
> **Approved Visual Direction (Task 6): Full Midnight — Dark & Premium.**
> The visual identity embraces an elite, contemporary dark aesthetic that fuses academic permanence with modern digital luxury and precision engineering. Drawing inspiration from **Claude** (editorial warmth, typographic discipline), **BMW M** (high-precision technical dark aesthetics, deliberate performance accents), and **Apple** (understated elegance, translucent layering, fluid visual hierarchy), the platform balances institutional gravitas with an uncompromisingly modern digital experience.

### Related Documentation Cross-Reference
* **System & API Guide:** [`README.md`](README.md)
* **Data Design Documentation (DDD):** [`ddd.md`](ddd.md)
* **Homepage View Implementation:** [`backend/src/views/homeView.js`](backend/src/views/homeView.js)
* **OpenAPI / Swagger Documentation:** [`backend/src/app.js`](backend/src/app.js) (`/api/swagger`)

---

## 2. Brand Identity & Purpose

### 2.1 Project Name
* **Official English Name:** **Alumni Tracking System**
* **API Documentation Title:** **Alumni Tracking System API**
* **Turkish Context / Subtitle:** **Mezun Takip ve Kariyer Portalı** (*Yönetim & Takip Portalı*)
* **Repository Identifier:** `alumni` / `alumni-backend`

### 2.2 Core Purpose & Mission
Developed as part of the **Web Programming** course curriculum, the Alumni Tracking System is a centralized web platform and RESTful service designed to:
1. **Bridge Academia and Career:** Connect university alumni with current students to facilitate mentorship, knowledge transfer, and professional networking.
2. **Streamline Opportunity Tracking:** Provide a dedicated space for posting and discovering active job vacancies, internship opportunities, and career announcements.
3. **Institutional Relationship Management:** Maintain an accurate, structured repository of registered alumni and student profiles.
4. **Transparent Application Handling:** Allow candidates to submit applications with resume links and cover letters, and enable job creators to review applicant statuses through structured review states (`PENDING`, `REVIEWING`, `ACCEPTED`, `REJECTED`).
5. **Open Integration:** Expose fully documented RESTful JSON endpoints accompanied by an interactive OpenAPI 3.0 Swagger interface.

### 2.3 Brand Values (Evidence-Based)
* **Institutional Credibility:** A dignified, academic visual aesthetic that honors university traditions while projecting modern technological capability.
* **Clarity & Efficiency:** Clean, uncluttered layouts that prioritize readability, rapid task completion, and intuitive navigation.
* **Reliability & Transparency:** Direct data visibility through structured tables, status badges, and comprehensive API documentation.
* **Lightweight Independence:** Elimination of heavy external UI libraries and template engines in favor of native JavaScript template literals and self-contained styling.

---

## 3. Target Audience & Stakeholders

The Alumni Tracking System is tailored to five distinct user segments:

| Target Segment | Role & Context | Primary Platform Interactions |
| :--- | :--- | :--- |
| **Alumni (Mezunlar)** | University graduates working in various industries. | • Maintain active profiles and contact information.<br>• Share career opportunities and corporate job postings (`/job-postings`).<br>• Connect with fellow graduates and faculty. |
| **Students (Öğrenciler)** | Current undergraduate and graduate students preparing for employment. | • Browse active job openings and internship listings.<br>• Submit direct applications with CV links and personal cover letters.<br>• Read departmental news and career announcements. |
| **University Administrators & Faculty** | Department heads, career center personnel, and system operators. | • Oversee the registered user directory (`/users`).<br>• Publish institutional bulletins, events, and announcements (`/announcements`).<br>• Monitor application pipelines and candidate statuses (`/applications`). |
| **Recruiters & Partner Companies** | Hiring managers and corporate partners seeking talent from the alumni pool. | • Review candidate applications submitted for specific job postings.<br>• Update candidate review stages from `PENDING` to `ACCEPTED` or `REJECTED`. |
| **Developers & System Integrators** | Technical consumers building integrations or mobile clients. | • Explore and test RESTful JSON endpoints via Swagger UI (`/api/swagger`).<br>• Inspect health status endpoints (`/api/health`, `/health`, `/alumni`). |

---

## 4. Visual Identity & Color Palette

The approved visual identity adheres to the **Full Midnight — Dark & Premium** design system. The entire homepage is rendered on a dark midnight canvas—generic light dashboard cards and white page grounds are strictly superseded by an immersive, high-contrast dark environment with surgical accents.

### 4.1 Master Full Midnight Palette (Task 6 Approved Standard)

| Color Token | Hex Code | Visual Sample | Role & Application |
| :--- | :--- | :--- | :--- |
| **Midnight Navy** | `#101827` | ![#101827](https://via.placeholder.com/15/101827/000000?text=+) `#101827` | Primary canvas ground; immersive dark foundation across the entire page. |
| **Secondary Navy** | `#202E46` | ![#202E46](https://via.placeholder.com/15/202E46/000000?text=+) `#202E46` | Surface layer; modular cards, elevated content sections, chrome backing. |
| **Electric Blue** | `#6D8CFF` | ![#6D8CFF](https://via.placeholder.com/15/6D8CFF/000000?text=+) `#6D8CFF` | Vibrant brand accent; connection network lines, active navigation pills, link hovers. |
| **Lime** | `#D5F36A` | ![#D5F36A](https://via.placeholder.com/15/D5F36A/000000?text=+) `#D5F36A` | High-energy primary CTA; glowing particle nodes, primary action buttons, key metrics. |
| **Soft White** | `#F4F5F7` | ![#F4F5F7](https://via.placeholder.com/15/F4F5F7/000000?text=+) `#F4F5F7` | Primary typography; high-contrast headlines, card titles, prominent text. |
| **Secondary Text** | `#B9C3D2` | ![#B9C3D2](https://via.placeholder.com/15/B9C3D2/000000?text=+) `#B9C3D2` | Secondary typography; subheads, descriptions, metadata, timestamp captions. |
| **Subtle Border** | `#35445D` | ![#35445D](https://via.placeholder.com/15/35445D/000000?text=+) `#35445D` | Structural hairline dividers (1px); card outlines, navigation dividers, input borders. |

### 4.2 Semantic Status & Application Workflow Palette
Preserved across candidate review workflows (`applicationView.js`):

| Semantic State | Hex Values (Text / Fill / Border) | Usage in Platform |
| :--- | :--- | :--- |
| **Success / Active** | `#065f46` (text), `#ecfdf5` (bg), `#a7f3d0` (border) | • Live portal status dot.<br>• OpenAPI 3.0 badge on Swagger card.<br>• `ACCEPTED` candidate status badges in applications. |
| **Reviewing** | `#2a4365` (text), `#bee3f8` (bg) | • `REVIEWING` candidate status badge in applications (`applicationView.js`). |
| **Danger / Rejected** | `#742a2a` (text), `#fff5f5` (bg), `#feb2b2` (border) | • 404 error headline and badge (`#e53e3e`).<br>• Delete action buttons (`.btn-danger`).<br>• `REJECTED` candidate status badges. |
| **Pending** | `#7b341e` (text), `#feebc8` (bg) | • `PENDING` initial application status badge in applications (`applicationView.js`). |

---

## 5. Design Tone & Visual Style

### 5.1 Design Philosophy: Full Midnight — Dark & Premium
The visual direction draws curated inspiration from three benchmark design systems:
1. **Claude (Editorial Depth & Typographic Discipline):** Intellectual warmth, confident typographic hierarchy, generous breathing room, and distraction-free content presentation.
2. **BMW M (Technical Precision & Deliberate Accents):** High-precision dark technical aesthetic, sharp 1px hairline contours (`#35445D`), and high-energy lime (`#D5F36A`) accents placed intentionally.
3. **Apple (Restrained Elegance & Layered Depth):** Translucent glassmorphic chrome (`backdrop-filter: blur`), subtle ambient lighting, seamless edge-to-edge visuals, and fluid responsiveness.

### 5.2 Hero Composition Rules (Highest Priority)
* **Continuous Edge-to-Edge Visual:** The hero section is rendered as a full-width abstract connection-network visual covering the entire hero background.
* **Direct Foreground Layering:** All text, headings, badges, descriptions, and CTA buttons sit directly ON TOP OF the visual.
* **100% Transparent Text Backgrounds:** Text containers must remain completely transparent. Never isolate text inside an opaque navy card, solid panel, or separated split column.
* **Authentic Copy Hierarchy:**
  * **Eyebrow:** `CONNECT · GROW · SUCCEED`
  * **Headline:** `Your next chapter starts here.`
  * **Secondary:** `One community. Endless possibilities.`
  * **Description:** `Connect with people, discover opportunities and build your professional future.`
  * **Primary CTA:** `Explore Alumni ↗` (accented with Lime `#D5F36A`)
  * **Scroll Cue:** `Discover more ↓` (subtle secondary text `#B9C3D2`)
* **Structured Modularity:** Content is partitioned into distinct card units and clearly labeled sections, preventing visual overload.
* **Purposeful Contrast:** Deep navy headers and buttons sit against pure white cards and soft gray canvases, directing attention naturally to interactive pathways.
* **Subtle Elevation:** Multi-layered box shadows (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`) create spatial hierarchy without distracting skeumorphism.
* **Smooth Micro-Interactions:** Subtle vertical shifts (`transform: translateY(-2px)` or `-4px`) and cubic-bezier transitions (`0.2s cubic-bezier(0.4, 0, 0.2, 1)`) deliver responsive tactile feedback.

### 5.2 Layout Architecture
* **Top Navigation Bar:** Midnight dark sticky header (`position: sticky; top: 0; background: rgba(16, 24, 39, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid #35445D`) with brand lockup, navigation links, and a Swagger UI launcher.
* **Hero Section:** Full-width, edge-to-edge abstract connection-network visual with delicate electric blue connection lines and subtle lime particle nodes. All text and CTA elements sit directly on top with completely transparent text backgrounds.
* **Core Modules Grid:** Responsive auto-fill grid (`minmax(340px, 1fr)`) housing the 6 primary domain modules with dark navy card surfaces (`#202E46`), subtle hairline borders (`#35445D`), and soft white typography.
* **Platform Features Banner:** High-precision value proposition section reinforcing community, career, and architectural strengths.
* **Developer API Bar:** Dark monospace-accented quick-reference strip showcasing available RESTful endpoints.
* **Footer:** Deep midnight footer (`#101827`) with subtle top border (`#35445D`), displaying branding, quick links (`/about`, `/api/swagger`, `/api/health`), copyright, and architectural stack metadata chips.

### 5.3 Responsive Behavior
The interface adapts smoothly across all viewport widths:
* **Desktop ($> 900\text{px}$):** Multi-column grid (3 columns), centered hero CTA cluster, and horizontal navigation.
* **Tablet ($641\text{px} - 900\text{px}$):** 2-column card grid, fluid font scaling, and optimized spacing.
* **Mobile ($\le 640\text{px}$):** Single-column grid, stacked full-width button actions (`width: 100%`), flexible navigation wrapping, and minimum tap targets of $44\text{px}$ for accessibility.

---

## 6. Typography & Iconography

### 6.1 Font System
The typographic system combines contemporary geometric confidence with crystal-clear legibility:

#### Headings Typography (Display, H1, H2, H3, Section Titles)
```css
font-family: "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```
* Delivers editorial authority, architectural precision, and a distinctive technical character.

#### Body & UI Typography (Prose, Descriptions, Inputs, Labels)
```css
font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```
* Optimized for high-density legibility, effortless reading comfort, and warm institutional presence.

#### Technical & Monospace Typography (API Paths, Methods, Payloads)
```css
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

#### Typographic Scale & Hierarchy
| Level | Font Size | Line Height | Weight | Letter Spacing | Element / Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Eyebrow** | `13px` / `14px` | `1.2` | `700` | `+2.0px` (Uppercase) | `CONNECT · GROW · SUCCEED` |
| **Hero Headline H1**| `44px` (`30px` mobile) | `1.15` | `800` | `-1.0px` | `Your next chapter starts here.` |
| **Hero Secondary** | `22px` (`18px` mobile) | `1.3` | `600` | `-0.2px` | `One community. Endless possibilities.` |
| **Hero Description**| `16px` (`15px` mobile) | `1.6` | `400` | `Normal` | `Connect with people, discover opportunities...` |
| **Section Title H2** | `26px` / `24px` | `1.3` | `800` | `-0.4px` | Major section headers (`<h2>`) |
| **Card Title H3** | `20px` / `18px` | `1.35` | `700` | `Normal` | Module cards, feature titles |
| **Standard Body** | `14px` | `1.55` | `400` | `Normal` | Card descriptions, general prose |
| **Primary Lime CTA** | `15px` | `1.0` | `700` | `+0.2px` | `Explore Alumni ↗` |
| **Scroll Cue** | `13px` | `1.2` | `500` | `+0.5px` | `Discover more ↓` |
| **Badges & Chips** | `11px` / `12px` | `1.0` | `600` | `+0.2px` | Status chips, architecture tags |

### 6.2 Iconography Standards
The visual system exclusively utilizes **inline SVG vector graphics** (`viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`). This eliminates icon font rendering artifacts and prevents external network requests.

| Icon Subject | Domain Association | Visual Implementation |
| :--- | :--- | :--- |
| **Graduation Cap (Mortarboard)** | Core Brand Mark / Alumni Identity | Featured in brand logo box (`.brand-icon`), hero badge, and footer brand mark. |
| **Users Group** | User Management (`/users`) | Header navigation, module card icon box (`👥`), feature item icon. |
| **Megaphone / Horn** | Announcements (`/announcements`) | Header navigation, module card icon box (`📢`). |
| **Briefcase** | Job Postings (`/job-postings`) | Header navigation, hero primary CTA, module card icon box (`💼`). |
| **Clipboard & Checklist** | Applications (`/applications`) | Header navigation, module card icon box (`📝`). |
| **Code Brackets / Terminal** | OpenAPI / Swagger (`/api/swagger`) | Header navigation CTA, hero outline CTA, Swagger card icon box (`📖`). |
| **Activity Pulse / Heartbeat** | Health & Status (`/api/health`) | System health card icon box (`🩺`). |

### 6.3 Emoji Accents
Emojis are employed contextually as supplementary navigation anchors (`🏠`, `👥`, `📢`, `💼`, `📝`, `📖`, `🩺`, `🎓`, `🚀`, `🛡️`). They reinforce visual recognition without replacing formal labels or semantic HTML.

---

## 7. Component Design Patterns

### 7.1 Buttons & Call-to-Actions (CTAs)
* **Primary Lime CTA Button (`.btn-lime`):** High-energy primary action (`background: #D5F36A; color: #101827; font-weight: 700; border-radius: 6px;`). Used for the headline hero action `Explore Alumni ↗` with energetic glow hover.
* **Secondary Ghost / Border Button (`.btn-secondary-dark`):** Translucent dark button (`background: rgba(32, 46, 70, 0.6); color: #F4F5F7; border: 1px solid #35445D`) with electric blue hover.
* **Card Primary Button (`.btn-card-primary`):** Solid electric blue fill (`#6D8CFF`) or midnight navy fill with soft white text used for module navigation.
* **Card Secondary Button (`.btn-card-secondary`):** Subtle dark gray fill with secondary text used for raw JSON API inspection.

### 7.2 Badges & Status Chips
Badges use pill contours (`border-radius: 9999px`), concise uppercase or capitalized typography, and soft colored fills bordered by matching tinted strokes:
* **Navy Badge (`.badge-navy`):** Neutral category tags (`Profil & İletişim`, `Kariyer & Staj`).
* **Success Badge (`.badge-success`):** Validated standards (`OpenAPI 3.0`).
* **Architecture Tag (`.arch-tag`):** Neutral system tags in the footer (`Node.js & Express MVC`, `MySQL 8.0 Persistence`, `OpenAPI 3.0`).

---

## 8. Governance & Brand Consistency

When maintaining or extending the Alumni Tracking System:
1. **Palette Adherence:** Limit UI components to the established navy blue, white, and light gray values. Do not introduce arbitrary accent hues.
2. **Native Asset Integrity:** Maintain the reliance on inline SVGs and system-native typography. Do not link external icon fonts (e.g., FontAwesome) or web fonts (e.g., Google Fonts) that degrade offline reliability.
3. **MVC Conformance:** Render all user-facing visual templates inside `backend/src/views/` using standardized HTML template literals and `escapeHtml` sanitization.
4. **Documentation Synchronization:** Any adjustment to color tokens, routing structures, or layout patterns must be reflected across both `README.md` and this document.
