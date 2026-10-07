/**
 * View Layer: ApiUser HTML görünümlerini (şablonlarını) oluşturur.
 * ApiUserController'dan gelen verileri alarak istemciye sunulacak HTML sayfalarını üretir.
 */

/**
 * XSS zafiyetlerini önlemek için HTML özel karakterlerini filtreler.
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
 * Ortak CSS ve navigasyon başlığı
 */
const getLayout = (title, badgeText, content) => `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Alumni Tracking System (ApiUser)</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7fafc;
      margin: 0;
      padding: 30px 20px;
      color: #2d3748;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      padding: 32px;
      border-top: 4px solid #4c51bf;
    }
    .nav-links {
      margin-bottom: 22px;
      font-size: 14px;
      border-bottom: 1px solid #edf2f7;
      padding-bottom: 12px;
    }
    .nav-links a {
      color: #4c51bf;
      text-decoration: none;
      margin-right: 16px;
      font-weight: 500;
    }
    .nav-links a:hover {
      text-decoration: underline;
    }
    h1 {
      color: #2d3748;
      margin-top: 0;
      font-size: 26px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    h2 {
      color: #434190;
      font-size: 20px;
      margin-top: 28px;
      margin-bottom: 14px;
    }
    .badge {
      display: inline-block;
      background: #ebf4ff;
      color: #434190;
      padding: 4px 12px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 600;
      vertical-align: middle;
    }
    .badge-success { background: #f0fff4; color: #22543d; border: 1px solid #c6f6d5; }
    .badge-warning { background: #fffaf0; color: #744210; border: 1px solid #feebc8; }
    .badge-danger { background: #fff5f5; color: #742a2a; border: 1px solid #fed7d7; }
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
      background-color: #f7fafc;
      color: #4a5568;
      font-weight: 600;
    }
    tr:hover { background-color: #f7fafc; }
    .card {
      background-color: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 24px;
      margin: 20px 0;
    }
    .card-success { background: #f0fff4; border-color: #c6f6d5; }
    .card-danger { background: #fff5f5; border-color: #feb2b2; }
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
      border-color: #4c51bf;
      box-shadow: 0 0 0 3px rgba(76, 81, 191, 0.2);
    }
    .btn {
      display: inline-block;
      background-color: #4c51bf;
      color: #ffffff;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn:hover { background-color: #434190; }
    .btn-secondary { background-color: #edf2f7; color: #4a5568; }
    .btn-secondary:hover { background-color: #e2e8f0; }
    .btn-danger { background-color: #e53e3e; color: #fff; }
    .btn-danger:hover { background-color: #c53030; }
    .info-item {
      margin: 10px 0;
      font-size: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="nav-links">
      <a href="/">🏠 Ana Sayfa</a>
      <a href="/api/users">⚡ API Kullanıcılar (ApiUser View)</a>
      <a href="/users">👥 Kullanıcılar (User View)</a>
      <a href="/alumni">🎓 Alumni</a>
      <a href="/api/swagger">📑 Swagger UI</a>
    </div>
    ${content}
  </div>
</body>
</html>`;

/**
 * 1. GET /api/users: Tüm kullanıcıları listeler (Read - R)
 */
const renderUsersPage = (users = []) => {
  const userRows = users.length > 0
    ? users.map(user => `
      <tr>
        <td><strong>#${user.id}</strong></td>
        <td><a href="/api/users/${user.id}" style="color:#4c51bf; text-decoration:none; font-weight:600;">${escapeHtml(user.name)}</a></td>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.role || user.department || '-')}</td>
        <td>
          <a href="/api/users/${user.id}" class="btn btn-secondary" style="padding: 4px 10px; font-size: 12px;">Görüntüle</a>
        </td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="5" style="text-align: center; color: #777; padding: 24px;">
          Henüz kayıtlı kullanıcı bulunmamaktadır.
        </td>
      </tr>
    `;

  const content = `
    <h1>⚡ ApiUser Kullanıcı Listesi <span class="badge">ApiUser View Layer</span></h1>
    <p>Bu sayfa <strong>ApiUser Controller</strong> ve <strong>View Layer</strong> kullanılarak sunulmaktadır (CRUD: Read).</p>

    <h2>📋 Kayıtlı Kullanıcılar (${users.length})</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>İsim</th>
          <th>E-posta</th>
          <th>Detay / Rol</th>
          <th>İşlem</th>
        </tr>
      </thead>
      <tbody>
        ${userRows}
      </tbody>
    </table>

    <div class="card" style="margin-top: 32px;">
      <h2>➕ Yeni Kullanıcı Ekle (POST /api/users - Create)</h2>
      <form action="/api/users" method="POST">
        <div class="form-group">
          <label for="name">Adı ve Soyadı:</label>
          <input type="text" id="name" name="name" required placeholder="Örn: Ahmet Yılmaz">
        </div>
        <div class="form-group">
          <label for="email">E-posta Adresi:</label>
          <input type="email" id="email" name="email" required placeholder="Örn: ahmet@example.com">
        </div>
        <button type="submit" class="btn">Kullanıcıyı Kaydet</button>
      </form>
    </div>
  `;

  return getLayout("ApiUser Kullanıcı Listesi", "ApiUser View Layer", content);
};

/**
 * 2. POST /api/users: Yeni kullanıcı oluşturulduğunda HTML sayfası (Create - C)
 */
const renderUserCreatedPage = (user) => {
  const content = `
    <h1>✅ Kullanıcı Başarıyla Oluşturuldu! <span class="badge badge-success">Create (C)</span></h1>
    <p>Yeni kullanıcı ApiUser ve View Layer üzerinden başarıyla kaydedildi.</p>

    <div class="card card-success">
      <div class="info-item"><strong>Kullanıcı ID:</strong> #${user.id}</div>
      <div class="info-item"><strong>İsim:</strong> ${escapeHtml(user.name)}</div>
      <div class="info-item"><strong>E-posta:</strong> ${escapeHtml(user.email)}</div>
      ${user.role || user.department ? `<div class="info-item"><strong>Rol/Departman:</strong> ${escapeHtml(user.role || user.department)}</div>` : ''}
    </div>

    <div>
      <a href="/api/users" class="btn">📋 Kullanıcı Listesine Dön</a>
      <a href="/api/users/${user.id}" class="btn btn-secondary">🔍 Kullanıcı Detayı</a>
    </div>
  `;

  return getLayout("Kullanıcı Oluşturuldu (ApiUser)", "ApiUser View Layer", content);
};

/**
 * 3. GET /api/users/:id: Tek bir kullanıcının detay bilgisi (Read - R)
 */
const renderUserDetailPage = (user) => {
  const content = `
    <h1>👤 ApiUser Kullanıcı Detayı <span class="badge">Read (R)</span></h1>
    <p>ID: <strong>#${user.id}</strong> numaralı kullanıcının mevcut bilgileri:</p>

    <div class="card">
      <div class="info-item"><strong>ID:</strong> #${user.id}</div>
      <div class="info-item"><strong>İsim:</strong> ${escapeHtml(user.name)}</div>
      <div class="info-item"><strong>E-posta:</strong> ${escapeHtml(user.email)}</div>
      ${user.role || user.department ? `<div class="info-item"><strong>Rol/Departman:</strong> ${escapeHtml(user.role || user.department)}</div>` : ''}
    </div>

    <div>
      <a href="/api/users" class="btn">📋 Kullanıcı Listesine Dön</a>
    </div>
  `;

  return getLayout(`ApiUser Detayı #${user.id}`, "ApiUser View Layer", content);
};

/**
 * 4. PUT / PATCH /api/users/:id: Kullanıcı güncellendiğinde HTML sayfası (Update - U)
 */
const renderUserUpdatedPage = (user, { isPartial = false } = {}) => {
  const updateType = isPartial ? "Kısmi Güncelleme (PATCH)" : "Tam Güncelleme (PUT)";
  const badgeClass = isPartial ? "badge-warning" : "badge-success";

  const content = `
    <h1>✏️ Kullanıcı Başarıyla Güncellendi! <span class="badge ${badgeClass}">${escapeHtml(updateType)}</span></h1>
    <p>ApiUser bilgileri güncellendi ve güncel veriler View Layer ile sunuldu.</p>

    <div class="card card-success">
      <div class="info-item"><strong>Kullanıcı ID:</strong> #${user.id}</div>
      <div class="info-item"><strong>Güncel İsim:</strong> ${escapeHtml(user.name)}</div>
      <div class="info-item"><strong>Güncel E-posta:</strong> ${escapeHtml(user.email)}</div>
      ${user.role || user.department ? `<div class="info-item"><strong>Rol/Departman:</strong> ${escapeHtml(user.role || user.department)}</div>` : ''}
    </div>

    <div>
      <a href="/api/users" class="btn">📋 Kullanıcı Listesine Dön</a>
      <a href="/api/users/${user.id}" class="btn btn-secondary">🔍 Kullanıcı Detayı</a>
    </div>
  `;

  return getLayout("Kullanıcı Güncellendi (ApiUser)", "ApiUser View Layer", content);
};

/**
 * 5. DELETE /api/users/:id: Kullanıcı silindiğinde HTML sayfası (Delete - D)
 */
const renderUserDeletedPage = (id) => {
  const content = `
    <h1>🗑️ Kullanıcı Başarıyla Silindi! <span class="badge badge-danger">Delete (D)</span></h1>
    <p>ID: <strong>#${escapeHtml(id)}</strong> olan kullanıcı sistemden başarıyla silindi.</p>

    <div class="card card-danger">
      <p style="margin: 0; color: #742a2a; font-weight: 500;">
        Kullanıcı ApiUser listesinden kaldırıldı. Artık bu ID ile kullanıcıya erişilemez.
      </p>
    </div>

    <div>
      <a href="/api/users" class="btn">📋 Kullanıcı Listesine Dön</a>
    </div>
  `;

  return getLayout("Kullanıcı Silindi (ApiUser)", "ApiUser View Layer", content);
};

/**
 * 6. 404: Kullanıcı bulunamadığında HTML hata sayfası
 */
const renderUserNotFoundPage = (id) => {
  const content = `
    <h1>⚠️ Kullanıcı Bulunamadı <span class="badge badge-danger">404 Not Found</span></h1>
    <p>İstenen ID: <strong>#${escapeHtml(id)}</strong> numaralı kullanıcı mevcut değil.</p>

    <div class="card card-danger">
      <h3 style="margin-top:0; color: #742a2a;">Kullanıcı bulunamadı</h3>
      <p style="margin: 0; color: #4a5568;">
        Aradığınız kullanıcı silinmiş olabilir veya hiç var olmamış olabilir.
      </p>
    </div>

    <div>
      <a href="/api/users" class="btn">📋 Kullanıcı Listesine Dön</a>
    </div>
  `;

  return getLayout("Kullanıcı Bulunamadı (404 - ApiUser)", "ApiUser View Layer", content);
};

module.exports = {
  renderUsersPage,
  renderUserCreatedPage,
  renderUserDetailPage,
  renderUserUpdatedPage,
  renderUserDeletedPage,
  renderUserNotFoundPage
};
