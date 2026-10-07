/**
 * View Layer: User HTML görünümlerini (şablonlarını) oluşturur.
 * Controller'dan gelen verileri alarak istemciye sunulacak HTML sayfalarını üretir.
 */

/**
 * Kullanıcı listesini ve yeni kullanıcı ekleme formunu içeren HTML sayfasını üretir.
 * (CRUD: Read - R)
 * @param {Array} users - Kullanıcılar listesi
 * @returns {string} HTML sayfası
 */
const renderUsersPage = (users = []) => {
  const userRows = users.length > 0
    ? users.map(user => `
      <tr>
        <td><strong>#${user.id}</strong></td>
        <td>${escapeHtml(user.name || '')}</td>
        <td>${escapeHtml(user.email || '')}</td>
        <td>${escapeHtml(user.role || user.department || '-')}</td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="4" style="text-align: center; color: #777; padding: 24px;">
          Henüz kayıtlı kullanıcı bulunmamaktadır.
        </td>
      </tr>
    `;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kullanıcı Listesi - Alumni Tracking System</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 30px 20px;
      color: #333;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      padding: 32px;
    }
    h1 {
      color: #1a365d;
      margin-top: 0;
      font-size: 26px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
    }
    h2 {
      color: #2b6cb0;
      font-size: 20px;
      margin-top: 30px;
      margin-bottom: 14px;
    }
    .nav-links {
      margin-bottom: 20px;
      font-size: 14px;
    }
    .nav-links a {
      color: #3182ce;
      text-decoration: none;
      margin-right: 15px;
      font-weight: 500;
    }
    .nav-links a:hover {
      text-decoration: underline;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      padding: 12px 14px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background-color: #edf2f7;
      color: #4a5568;
      font-weight: 600;
    }
    tr:hover {
      background-color: #f7fafc;
    }
    .form-card {
      background-color: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 24px;
      margin-top: 30px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      font-weight: 600;
      margin-bottom: 6px;
      color: #4a5568;
      font-size: 14px;
    }
    input[type="text"], input[type="email"] {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      font-size: 15px;
      box-sizing: border-box;
    }
    input[type="text"]:focus, input[type="email"]:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
    }
    button[type="submit"] {
      background-color: #3182ce;
      color: #ffffff;
      padding: 11px 20px;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    button[type="submit"]:hover {
      background-color: #2b6cb0;
    }
    .badge {
      display: inline-block;
      background: #ebf8ff;
      color: #2b6cb0;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="nav-links">
      <a href="/">← Ana Sayfa</a>
      <a href="/alumni">Alumni Rota</a>
      <a href="/api/swagger">Swagger UI</a>
      <a href="/api/users">API Users (JSON)</a>
    </div>

    <h1>🎓 Alumni Tracking System - Kullanıcılar <span class="badge">View Layer</span></h1>
    <p>Bu sayfa MVC mimarisindeki <strong>View Layer</strong> (HTML Görünümü) kullanılarak render edilmiştir.</p>

    <h2>📋 Kayıtlı Kullanıcı Listesi (${users.length})</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>İsim</th>
          <th>E-posta</th>
          <th>Detay / Rol</th>
        </tr>
      </thead>
      <tbody>
        ${userRows}
      </tbody>
    </table>

    <div class="form-card">
      <h2>➕ Yeni Kullanıcı Oluştur (POST /users)</h2>
      <form action="/users" method="POST">
        <div class="form-group">
          <label for="name">Kullanıcı Adı ve Soyadı:</label>
          <input type="text" id="name" name="name" required placeholder="Örn: Esra Şahin">
        </div>
        <div class="form-group">
          <label for="email">E-posta Adresi:</label>
          <input type="email" id="email" name="email" required placeholder="Örn: esra@ogr.iu.edu.tr">
        </div>
        <button type="submit">Kullanıcıyı Kaydet</button>
      </form>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Yeni kullanıcı oluşturulduğunda başarı sonucunu gösteren HTML sayfasını üretir.
 * (CRUD: Create - C)
 * @param {Object} user - Oluşturulan yeni kullanıcı
 * @returns {string} HTML sayfası
 */
const renderUserCreatedPage = (user) => {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kullanıcı Oluşturuldu - Alumni Tracking System</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 40px 20px;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      padding: 36px;
      text-align: center;
    }
    .success-icon {
      font-size: 54px;
      color: #38a169;
      margin-bottom: 12px;
    }
    h1 {
      color: #22543d;
      margin-top: 0;
      font-size: 24px;
    }
    .user-card {
      background: #f0fff4;
      border: 1px solid #c6f6d5;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
      text-align: left;
    }
    .user-card p {
      margin: 8px 0;
      font-size: 15px;
    }
    .btn {
      display: inline-block;
      background-color: #3182ce;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin: 6px;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #2b6cb0;
    }
    .btn-secondary {
      background-color: #edf2f7;
      color: #4a5568;
    }
    .btn-secondary:hover {
      background-color: #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">✅</div>
    <h1>Kullanıcı Başarıyla Oluşturuldu!</h1>
    <p>Yeni kullanıcı sisteme kaydedildi ve View Layer üzerinden görüntülendi.</p>

    <div class="user-card">
      <p><strong>ID:</strong> #${user.id}</p>
      <p><strong>İsim:</strong> ${escapeHtml(user.name || '')}</p>
      <p><strong>E-posta:</strong> ${escapeHtml(user.email || '')}</p>
    </div>

    <div>
      <a href="/users" class="btn">📋 Kullanıcı Listesine Dön (GET /users)</a>
      <a href="/" class="btn btn-secondary">🏠 Ana Sayfa</a>
    </div>
  </div>
</body>
</html>`;
};

/**
 * XSS zafiyetlerini önlemek için HTML özel karakterlerini filtreler.
 * @param {string} str 
 * @returns {string}
 */
const escapeHtml = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

module.exports = {
  renderUsersPage,
  renderUserCreatedPage
};
