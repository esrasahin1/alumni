/**
 * View Layer: Generic 404 Not Found HTML görünümünü oluşturur.
 * Eşleşmeyen veya geçersiz web isteklerinde kullanıcıya sunulacak kurumsal şablonu üretir.
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
 * Genel 404 HTML sayfası oluşturucu.
 * Projenin portal dashboard'u ve diğer view katmanlarıyla tam uyumlu,
 * responsive, modern ve profesyonel bir hata arayüzü sunar.
 *
 * @param {import('express').Request|string|object} reqOrUrl - İstek nesnesi veya URL
 * @returns {string} HTML içeriği
 */
const renderNotFoundPage = (reqOrUrl) => {
  let url = '';
  let method = 'GET';

  if (typeof reqOrUrl === 'string') {
    url = reqOrUrl;
  } else if (reqOrUrl && typeof reqOrUrl === 'object') {
    url = reqOrUrl.originalUrl || reqOrUrl.url || '';
    method = reqOrUrl.method || 'GET';
  }

  const safeUrl = escapeHtml(url);
  const safeMethod = escapeHtml(method);

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="5;url=/">
  <title>404 Sayfa Bulunamadı - Alumni Tracking System</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 30px 20px;
      color: #333;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      padding: 36px;
    }
    .nav-links {
      margin-bottom: 24px;
      font-size: 14px;
      border-bottom: 1px solid #edf2f7;
      padding-bottom: 14px;
    }
    .nav-links a {
      color: #3182ce;
      text-decoration: none;
      margin-right: 16px;
      font-weight: 500;
    }
    .nav-links a:hover {
      text-decoration: underline;
    }
    .error-hero {
      text-align: center;
      padding: 24px 12px 16px;
    }
    .error-code {
      font-size: 72px;
      font-weight: 800;
      color: #e53e3e;
      line-height: 1;
      margin: 0 0 10px;
      letter-spacing: -2px;
    }
    h1 {
      color: #1a365d;
      font-size: 26px;
      margin: 0 0 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .lead {
      color: #4a5568;
      font-size: 16px;
      margin: 0 0 20px;
      line-height: 1.5;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 600;
      vertical-align: middle;
    }
    .badge-danger {
      background: #fff5f5;
      color: #742a2a;
      border: 1px solid #feb2b2;
    }
    .card {
      background-color: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 20px auto;
      max-width: 680px;
      text-align: left;
    }
    .card-danger {
      background: #fff5f5;
      border-color: #feb2b2;
    }
    .card h3 {
      margin-top: 0;
      margin-bottom: 8px;
      color: #742a2a;
      font-size: 16px;
    }
    .card p {
      margin: 0;
      color: #4a5568;
      font-size: 14px;
      line-height: 1.5;
    }
    .url-display {
      background: #edf2f7;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: Consolas, Monaco, "Courier New", monospace;
      font-size: 13px;
      color: #2d3748;
      word-break: break-all;
    }
    .redirect-notice {
      display: inline-block;
      background: #ebf8ff;
      border: 1px solid #bee3f8;
      color: #2b6cb0;
      padding: 10px 18px;
      border-radius: 6px;
      font-size: 14px;
      margin: 16px auto 8px;
      line-height: 1.5;
    }
    .btn-group {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 28px;
    }
    .btn {
      display: inline-block;
      background-color: #3182ce;
      color: #ffffff;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.15s;
    }
    .btn:hover {
      background-color: #2b6cb0;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background-color: #edf2f7;
      color: #4a5568;
    }
    .btn-secondary:hover {
      background-color: #e2e8f0;
      color: #2d3748;
    }
    .footer-note {
      text-align: center;
      color: #a0aec0;
      font-size: 12px;
      margin-top: 32px;
      border-top: 1px solid #edf2f7;
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="nav-links">
      <a href="/">🏠 Ana Sayfa</a>
      <a href="/users">👥 Kullanıcılar</a>
      <a href="/announcements">📢 Duyurular</a>
      <a href="/job-postings">💼 İş İlanları</a>
      <a href="/applications">📝 Başvurular</a>
      <a href="/api/swagger">⚡ Swagger API</a>
    </div>

    <div class="error-hero">
      <div class="error-code">404</div>
      <h1>
        <span>Sayfa Bulunamadı</span>
        <span class="badge badge-danger">404 Not Found</span>
      </h1>
      <p class="lead">
        Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
      </p>

      ${url ? `
      <div class="card card-danger">
        <h3>İstenen Adres:</h3>
        <p>
          <strong>Metot:</strong> ${safeMethod} &nbsp;|&nbsp;
          <strong>Adres:</strong> <span class="url-display">${safeUrl}</span>
        </p>
      </div>` : ''}

      <div class="redirect-notice">
        ⏱️ 5 saniye içinde otomatik olarak ana sayfaya yönlendirileceksiniz.
      </div>

      <div class="btn-group">
        <a href="/" class="btn">🏠 Ana Sayfaya Dön</a>
        <a href="/job-postings" class="btn btn-secondary">💼 İş İlanları</a>
        <a href="/users" class="btn btn-secondary">👥 Mezunlar ve Kullanıcılar</a>
      </div>
    </div>

    <div class="footer-note">
      Alumni Tracking System &bull; Üniversite Mezun Takip Sistemi
    </div>
  </div>

  <script>
    setTimeout(function() {
      window.location.href = '/';
    }, 5000);
  </script>
</body>
</html>
`;
};

module.exports = {
  escapeHtml,
  renderNotFoundPage
};
