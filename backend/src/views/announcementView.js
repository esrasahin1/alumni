/**
 * View Layer: Announcement HTML görünümlerini (şablonlarını) oluşturur.
 * AnnouncementController'dan gelen verileri alarak istemciye sunulacak HTML sayfalarını üretir.
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
  <title>${escapeHtml(title)} - Alumni Tracking System</title>
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
    .nav-links {
      margin-bottom: 22px;
      font-size: 14px;
      border-bottom: 1px solid #edf2f7;
      padding-bottom: 12px;
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
    h1 {
      color: #1a365d;
      margin-top: 0;
      font-size: 26px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    h2 {
      color: #2b6cb0;
      font-size: 20px;
      margin-top: 28px;
      margin-bottom: 14px;
    }
    .badge {
      display: inline-block;
      background: #ebf8ff;
      color: #2b6cb0;
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
      vertical-align: top;
    }
    th {
      background-color: #edf2f7;
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
    input[type="text"], textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      font-size: 15px;
      box-sizing: border-box;
      font-family: inherit;
    }
    input[type="text"]:focus, textarea:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
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
      transition: background-color 0.2s;
    }
    .btn:hover { background-color: #2b6cb0; }
    .btn-secondary { background-color: #edf2f7; color: #4a5568; }
    .btn-secondary:hover { background-color: #e2e8f0; }
    .btn-danger { background-color: #e53e3e; color: #fff; }
    .btn-danger:hover { background-color: #c53030; }
    .btn-warning { background-color: #dd6b20; color: #fff; }
    .btn-warning:hover { background-color: #c05621; }
    .btn-sm { padding: 6px 12px; font-size: 13px; }
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
      <a href="/users">👥 Kullanıcılar (User View)</a>
      <a href="/api/users">⚡ API Kullanıcılar (ApiUser View)</a>
      <a href="/announcements">📢 Duyurular (Announcement View)</a>
      <a href="/api/announcements">⚡ API Duyurular</a>
      <a href="/alumni">🎓 Alumni</a>
      <a href="/api/swagger">📑 Swagger UI</a>
    </div>
    ${content}
  </div>
</body>
</html>`;

/**
 * 1. GET /announcements: Tüm duyuruları listeler (Read - R) ve CRUD formunu sunar
 */
const renderAnnouncementsPage = (announcements = []) => {
  const announcementRows = announcements.length > 0
    ? announcements.map(announcement => `
      <tr>
        <td><strong>#${announcement.id}</strong></td>
        <td>${escapeHtml(announcement.title)}</td>
        <td style="max-width: 280px; word-break: break-word;">${escapeHtml(announcement.content)}</td>
        <td><small style="color: #718096;">${escapeHtml(announcement.createdAt || announcement.createdDate || '-')}</small></td>
        <td style="white-space: nowrap;">
          <a href="/announcements/${announcement.id}" class="btn btn-secondary btn-sm" style="margin-right: 4px;">Details</a>
          <button type="button" class="btn btn-warning btn-sm" style="margin-right: 4px;" onclick="startEdit(this)" data-id="${announcement.id}" data-title="${escapeHtml(announcement.title)}" data-content="${escapeHtml(announcement.content)}">Edit</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="deleteAnnouncement(${announcement.id})">Delete</button>
        </td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="5" style="text-align: center; color: #777; padding: 24px;">
          Henüz kayıtlı duyuru bulunmamaktadır.
        </td>
      </tr>
    `;

  const content = `
    <h1>📢 Announcement Management</h1>
    <p>Manage announcements and perform CRUD operations with Announcement View.</p>

    <div class="card" id="announcementFormCard" style="margin-bottom: 28px;">
      <h2 id="formTitle" style="margin-top: 0;">➕ Create New Announcement</h2>
      <form id="announcementForm" action="/announcements" method="POST">
        <input type="hidden" id="announcementId" value="">
        <div class="form-group">
          <label for="title">Title (Başlık):</label>
          <input type="text" id="title" name="title" required placeholder="Enter announcement title">
        </div>
        <div class="form-group">
          <label for="content">Content (İçerik):</label>
          <textarea id="content" name="content" rows="4" required placeholder="Enter announcement content"></textarea>
        </div>
        <button type="submit" id="submitBtn" class="btn">Add Announcement</button>
        <button type="button" id="cancelBtn" class="btn btn-secondary" style="display: none; margin-left: 8px;" onclick="resetForm()">Cancel</button>
      </form>
    </div>

    <h2>📋 Announcement List (${announcements.length})</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 70px;">ID</th>
          <th>Title</th>
          <th>Content</th>
          <th style="width: 170px;">Created Date</th>
          <th style="width: 220px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${announcementRows}
      </tbody>
    </table>

    <script>
      function startEdit(button) {
        var id = button.getAttribute('data-id');
        var title = button.getAttribute('data-title');
        var content = button.getAttribute('data-content');

        document.getElementById('formTitle').innerText = '✏️ Edit Announcement (#' + id + ')';
        document.getElementById('announcementId').value = id;
        document.getElementById('title').value = title;
        document.getElementById('content').value = content;
        document.getElementById('submitBtn').innerText = 'Update Announcement';
        document.getElementById('cancelBtn').style.display = 'inline-block';

        var card = document.getElementById('announcementFormCard');
        if (card) {
          card.scrollIntoView({ behavior: 'smooth' });
        }
        document.getElementById('title').focus();
      }

      function resetForm() {
        document.getElementById('formTitle').innerText = '➕ Create New Announcement';
        document.getElementById('announcementId').value = '';
        document.getElementById('announcementForm').reset();
        document.getElementById('submitBtn').innerText = 'Add Announcement';
        document.getElementById('cancelBtn').style.display = 'none';
      }

      function deleteAnnouncement(id) {
        if (confirm('Are you sure you want to delete announcement #' + id + '?')) {
          fetch('/announcements/' + id, {
            method: 'DELETE'
          })
          .then(function(res) {
            if (res.ok) {
              window.location.reload();
            } else {
              alert('Failed to delete announcement #' + id);
            }
          })
          .catch(function(err) {
            alert('Error: ' + err.message);
          });
        }
      }

      document.addEventListener('DOMContentLoaded', function() {
        var form = document.getElementById('announcementForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
          var announcementId = document.getElementById('announcementId').value;
          if (announcementId) {
            e.preventDefault();
            var title = document.getElementById('title').value.trim();
            var content = document.getElementById('content').value.trim();

            fetch('/announcements/' + announcementId, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ title: title, content: content })
            })
            .then(function(res) {
              if (res.ok) {
                window.location.reload();
              } else {
                alert('Failed to update announcement #' + announcementId);
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

  return getLayout("Announcement Management", "Announcement View Layer", content);
};

/**
 * 2. POST /announcements: Yeni duyuru oluşturulduğunda HTML sayfası (Create - C)
 */
const renderAnnouncementCreatedPage = (announcement) => {
  const content = `
    <h1>✅ Duyuru Başarıyla Oluşturuldu! <span class="badge badge-success">Create (C)</span></h1>
    <p>Yeni duyuru sisteme kaydedildi ve View Layer üzerinden görüntülendi.</p>

    <div class="card card-success">
      <div class="info-item"><strong>Duyuru ID:</strong> #${announcement.id}</div>
      <div class="info-item"><strong>Başlık:</strong> ${escapeHtml(announcement.title)}</div>
      <div class="info-item"><strong>İçerik:</strong> ${escapeHtml(announcement.content)}</div>
      <div class="info-item"><strong>Oluşturulma Tarihi:</strong> ${escapeHtml(announcement.createdAt || announcement.createdDate || '-')}</div>
    </div>

    <div>
      <a href="/announcements" class="btn">📋 Duyuru Listesine Dön</a>
      <a href="/announcements/${announcement.id}" class="btn btn-secondary">🔍 Duyuru Detayı</a>
    </div>
  `;

  return getLayout("Duyuru Oluşturuldu", "Announcement View Layer", content);
};

/**
 * 3. GET /announcements/:id: Tek bir duyurunun detay bilgisi (Read - R)
 */
const renderAnnouncementDetailPage = (announcement) => {
  const content = `
    <h1>📢 Duyuru Detayı <span class="badge">Read (R)</span></h1>
    <p>ID: <strong>#${announcement.id}</strong> numaralı duyurunun mevcut bilgileri:</p>

    <div class="card">
      <div class="info-item"><strong>ID:</strong> #${announcement.id}</div>
      <div class="info-item"><strong>Başlık:</strong> ${escapeHtml(announcement.title)}</div>
      <div class="info-item"><strong>İçerik:</strong> ${escapeHtml(announcement.content)}</div>
      <div class="info-item"><strong>Oluşturulma Tarihi:</strong> ${escapeHtml(announcement.createdAt || announcement.createdDate || '-')}</div>
    </div>

    <div>
      <a href="/announcements" class="btn">📋 Duyuru Listesine Dön</a>
      <button type="button" class="btn btn-danger" onclick="deleteAnnouncement(${announcement.id})">🗑️ Duyuruyu Sil</button>
    </div>

    <script>
      function deleteAnnouncement(id) {
        if (confirm('Bu duyuruyu silmek istediğinize emin misiniz? (#' + id + ')')) {
          fetch('/announcements/' + id, {
            method: 'DELETE'
          })
          .then(function(res) {
            if (res.ok) {
              window.location.href = '/announcements';
            } else {
              alert('Duyuru silinemedi (#' + id + ')');
            }
          })
          .catch(function(err) {
            alert('Hata: ' + err.message);
          });
        }
      }
    </script>
  `;

  return getLayout(`Duyuru Detayı #${announcement.id}`, "Announcement View Layer", content);
};

/**
 * 4. PUT / PATCH /announcements/:id: Duyuru güncellendiğinde HTML sayfası (Update - U)
 */
const renderAnnouncementUpdatedPage = (announcement, { isPartial = false } = {}) => {
  const updateType = isPartial ? "Kısmi Güncelleme (PATCH)" : "Tam Güncelleme (PUT)";
  const badgeClass = isPartial ? "badge-warning" : "badge-success";

  const content = `
    <h1>✏️ Duyuru Başarıyla Güncellendi! <span class="badge ${badgeClass}">${escapeHtml(updateType)}</span></h1>
    <p>Duyuru bilgileri güncellendi ve güncel veriler View Layer ile sunuldu.</p>

    <div class="card card-success">
      <div class="info-item"><strong>Duyuru ID:</strong> #${announcement.id}</div>
      <div class="info-item"><strong>Güncel Başlık:</strong> ${escapeHtml(announcement.title)}</div>
      <div class="info-item"><strong>Güncel İçerik:</strong> ${escapeHtml(announcement.content)}</div>
      <div class="info-item"><strong>Oluşturulma Tarihi:</strong> ${escapeHtml(announcement.createdAt || announcement.createdDate || '-')}</div>
    </div>

    <div>
      <a href="/announcements" class="btn">📋 Duyuru Listesine Dön</a>
      <a href="/announcements/${announcement.id}" class="btn btn-secondary">🔍 Duyuru Detayı</a>
    </div>
  `;

  return getLayout("Duyuru Güncellendi", "Announcement View Layer", content);
};

/**
 * 5. DELETE /announcements/:id: Duyuru silindiğinde HTML sayfası (Delete - D)
 */
const renderAnnouncementDeletedPage = (id) => {
  const content = `
    <h1>🗑️ Duyuru Başarıyla Silindi! <span class="badge badge-danger">Delete (D)</span></h1>
    <p>ID: <strong>#${escapeHtml(id)}</strong> olan duyuru sistemden başarıyla silindi.</p>

    <div class="card card-danger">
      <p style="margin: 0; color: #742a2a; font-weight: 500;">
        Duyuru bellekteki listeden kaldırıldı. Artık bu ID ile duyuruya erişilemez.
      </p>
    </div>

    <div>
      <a href="/announcements" class="btn">📋 Duyuru Listesine Dön</a>
    </div>
  `;

  return getLayout("Duyuru Silindi", "Announcement View Layer", content);
};

/**
 * 6. 404 / 400: Duyuru bulunamadığında veya geçersiz olduğunda HTML hata sayfası
 */
const renderAnnouncementNotFoundPage = (id) => {
  const content = `
    <h1>⚠️ Duyuru Bulunamadı <span class="badge badge-danger">Hata / 404 Not Found</span></h1>
    <p>İstenen ID: <strong>#${escapeHtml(id)}</strong> numaralı duyuru mevcut değil veya geçersiz.</p>

    <div class="card card-danger">
      <h3 style="margin-top:0; color: #742a2a;">Duyuru bulunamadı</h3>
      <p style="margin: 0; color: #4a5568;">
        Aradığınız duyuru silinmiş olabilir, henüz eklenmemiş olabilir veya geçersiz bir ID girdiniz.
      </p>
    </div>

    <div>
      <a href="/announcements" class="btn">📋 Duyuru Listesine Dön</a>
    </div>
  `;

  return getLayout("Duyuru Bulunamadı", "Announcement View Layer", content);
};

/**
 * 7. Duyuru Düzenleme Sayfası (Opsiyonel bağımsız form görünümü)
 */
const renderEditAnnouncementPage = (announcement) => {
  const content = `
    <h1>✏️ Duyuru Düzenle (#${announcement.id}) <span class="badge badge-warning">Edit</span></h1>
    <p>Duyuru bilgilerini güncelleyiniz:</p>

    <div class="card">
      <form id="editAnnouncementForm">
        <div class="form-group">
          <label for="editTitle">Başlık (Title):</label>
          <input type="text" id="editTitle" name="title" value="${escapeHtml(announcement.title)}" required>
        </div>
        <div class="form-group">
          <label for="editContent">İçerik (Content):</label>
          <textarea id="editContent" name="content" rows="5" required>${escapeHtml(announcement.content)}</textarea>
        </div>
        <button type="submit" class="btn">💾 Değişiklikleri Kaydet</button>
        <a href="/announcements" class="btn btn-secondary" style="margin-left: 8px;">İptal</a>
      </form>
    </div>

    <script>
      document.getElementById('editAnnouncementForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var title = document.getElementById('editTitle').value.trim();
        var content = document.getElementById('editContent').value.trim();

        fetch('/announcements/${announcement.id}', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title, content: content })
        })
        .then(function(res) {
          if (res.ok) {
            window.location.href = '/announcements/${announcement.id}';
          } else {
            alert('Güncelleme başarısız oldu.');
          }
        })
        .catch(function(err) {
          alert('Hata: ' + err.message);
        });
      });
    </script>
  `;

  return getLayout(`Duyuru Düzenle #${announcement.id}`, "Announcement View Layer", content);
};

module.exports = {
  renderAnnouncementsPage,
  renderAnnouncementCreatedPage,
  renderAnnouncementDetailPage,
  renderAnnouncementUpdatedPage,
  renderAnnouncementDeletedPage,
  renderAnnouncementNotFoundPage,
  renderEditAnnouncementPage
};
