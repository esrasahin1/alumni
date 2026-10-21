/**
 * View Layer: Application HTML görünümlerini (şablonlarını) oluşturur.
 * ApplicationController'dan gelen verileri alarak istemciye sunulacak HTML sayfalarını üretir.
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
      max-width: 960px;
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
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 9999px;
      background-color: #e2e8f0;
      color: #4a5568;
    }
    .badge-pending { background-color: #feebc8; color: #7b341e; }
    .badge-reviewing { background-color: #bee3f8; color: #2a4365; }
    .badge-accepted { background-color: #c6f6d5; color: #22543d; }
    .badge-rejected { background-color: #fed7d7; color: #742a2a; }
    .table-container {
      overflow-x: auto;
      margin-top: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th, td {
      padding: 12px 14px;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background-color: #f7fafc;
      color: #4a5568;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    tr:hover {
      background-color: #f8fafc;
    }
    .btn {
      display: inline-block;
      padding: 8px 16px;
      background-color: #3182ce;
      color: #fff;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      cursor: pointer;
    }
    .btn:hover {
      background-color: #2b6cb0;
    }
    .btn-secondary {
      background-color: #718096;
    }
    .btn-secondary:hover {
      background-color: #4a5568;
    }
    .btn-success {
      background-color: #38a169;
    }
    .btn-success:hover {
      background-color: #2f855a;
    }
    .btn-danger {
      background-color: #e53e3e;
    }
    .btn-danger:hover {
      background-color: #c53030;
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 24px;
      margin-top: 20px;
      background: #fafafa;
    }
    .card-success {
      border-color: #68d391;
      background: #f0fff4;
    }
    .card-error {
      border-color: #fc8181;
      background: #fff5f5;
    }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      font-weight: 600;
      margin-bottom: 6px;
      color: #2d3748;
      font-size: 14px;
    }
    input[type="text"], input[type="email"], input[type="number"], select, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
      font-family: inherit;
    }
    textarea {
      min-height: 90px;
      resize: vertical;
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
      <a href="/api/swagger">📖 API Dokümantasyonu (Swagger)</a>
    </div>
    ${content}
  </div>
</body>
</html>`;

/**
 * Durum koduna göre rozet stil sınıfı
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
 * Başvurular listesi sayfası (200 OK)
 */
const renderApplicationsPage = (applications = [], options = {}) => {
  const isNested = Boolean(options.jobPosting);
  const job = options.jobPosting || null;

  const headerTitle = isNested
    ? `💼 ${escapeHtml(job.title)} — Başvurular`
    : `📝 İş Başvuruları`;

  const subHeader = isNested
    ? `<p style="color: #4a5568;">Bu liste <strong>#${escapeHtml(job.id)} — ${escapeHtml(job.company)}</strong> ilanına ait başvuruları göstermektedir. <a href="/job-postings/${escapeHtml(job.id)}" class="btn btn-secondary btn-sm" style="margin-left: 6px;">← İlan Detayına Dön</a> <a href="#apply" class="btn btn-sm" style="margin-left: 6px;">✍️ Bu İlana Başvur</a></p>`
    : `<p style="color: #4a5568;">Sistemde kayıtlı olan tüm aday iş başvuruları aşağıda listelenmiştir. <a href="/job-postings" class="btn btn-secondary btn-sm" style="margin-left: 6px;">💼 Tüm İş İlanlarına Git</a> <a href="#apply" class="btn btn-sm" style="margin-left: 6px;">➕ Yeni Başvuru Gönder</a></p>`;

  const postTargetUrl = isNested
    ? `/job-postings/${escapeHtml(job.id)}/applications`
    : `/applications`;

  let rows = '';
  if (applications && applications.length > 0) {
    rows = applications.map(app => `
      <tr>
        <td><strong>#${escapeHtml(app.id)}</strong></td>
        <td><a href="/job-postings/${escapeHtml(app.job_posting_id)}">#${escapeHtml(app.job_posting_id)}</a></td>
        <td><strong>${escapeHtml(app.applicant_name)}</strong></td>
        <td>${escapeHtml(app.applicant_email)}</td>
        <td>${getStatusBadge(app.status)}</td>
        <td>${app.resume_url ? `<a href="${escapeHtml(app.resume_url)}" target="_blank" rel="noopener">CV Linki</a>` : '<span style="color:#a0aec0;">Yok</span>'}</td>
        <td>${escapeHtml(app.createdAt ? app.createdAt.substring(0, 10) : '')}</td>
        <td>
          <a href="/applications/${escapeHtml(app.id)}" class="btn" style="padding: 4px 10px; font-size: 12px;">Detay & Yönet</a>
        </td>
      </tr>
    `).join('');
  } else {
    rows = `<tr><td colspan="8" style="text-align: center; color: #718096; padding: 24px;">Henüz kayıtlı başvuru bulunmamaktadır.</td></tr>`;
  }

  const content = `
    <h1>${headerTitle}</h1>
    ${subHeader}

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>İlan ID</th>
            <th>Başvuran</th>
            <th>E-posta</th>
            <th>Durum</th>
            <th>Özgeçmiş</th>
            <th>Tarih</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <div class="card" id="apply" style="margin-top: 36px;">
      <h2>➕ Yeni Başvuru Gönder</h2>
      <form action="${postTargetUrl}" method="POST">
        ${isNested ? `<input type="hidden" name="job_posting_id" value="${escapeHtml(job.id)}">` : `
        <div class="form-group">
          <label for="job_posting_id">Hedef İş İlanı ID *</label>
          <input type="number" id="job_posting_id" name="job_posting_id" required placeholder="Örn: 1">
        </div>
        `}
        <div class="form-group">
          <label for="applicant_name">Başvuran Ad Soyad *</label>
          <input type="text" id="applicant_name" name="applicant_name" required placeholder="Örn: Ayşe Yılmaz">
        </div>
        <div class="form-group">
          <label for="applicant_email">E-posta Adresi *</label>
          <input type="email" id="applicant_email" name="applicant_email" required placeholder="Örn: ayse@alumni.edu.tr">
        </div>
        <div class="form-group">
          <label for="user_id">Kullanıcı ID (Opsiyonel)</label>
          <input type="number" id="user_id" name="user_id" placeholder="Kayıtlı mezun ise ID giriniz">
        </div>
        <div class="form-group">
          <label for="resume_url">Özgeçmiş (CV) URL (Opsiyonel)</label>
          <input type="text" id="resume_url" name="resume_url" placeholder="https://drive.google.com/... veya dosya bağlantısı">
        </div>
        <div class="form-group">
          <label for="cover_letter">Ön Yazı / Notlar (Opsiyonel)</label>
          <textarea id="cover_letter" name="cover_letter" placeholder="Kendinizden ve bu pozisyona ilginizden bahsedin..."></textarea>
        </div>
        <button type="submit" class="btn">Başvuruyu Gönder</button>
      </form>
    </div>
  `;

  return getLayout(isNested ? `${job.title} Başvuruları` : 'İş Başvuruları', 'Liste', content);
};

/**
 * Başvuru detay sayfası (200 OK)
 */
const renderApplicationDetailPage = (application) => {
  const content = `
    <h1>📝 Başvuru #${escapeHtml(application.id)} Detayı</h1>
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="margin: 0;">${escapeHtml(application.applicant_name)}</h2>
        ${getStatusBadge(application.status)}
      </div>
      <p><strong>Hedef İş İlanı:</strong> <a href="/job-postings/${escapeHtml(application.job_posting_id)}" style="color: #3182ce; font-weight: 600;">İş İlanı #${escapeHtml(application.job_posting_id)}</a></p>
      <p><strong>E-posta:</strong> <a href="mailto:${escapeHtml(application.applicant_email)}">${escapeHtml(application.applicant_email)}</a></p>
      <p><strong>Kullanıcı Referansı:</strong> ${application.user_id ? `<a href="/users/${escapeHtml(application.user_id)}">User #${escapeHtml(application.user_id)}</a>` : '<span style="color:#718096;">Misafir / Bağımsız Başvuru</span>'}</p>
      <p><strong>Özgeçmiş (CV):</strong> ${application.resume_url ? `<a href="${escapeHtml(application.resume_url)}" target="_blank" rel="noopener">📄 Görüntüle / İndir</a>` : 'Belirtilmedi'}</p>
      <p><strong>Ön Yazı:</strong></p>
      <div style="background: #fff; padding: 14px; border-radius: 6px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${escapeHtml(application.cover_letter || 'Ön yazı girilmemiş.')}</div>
      <p style="color: #718096; font-size: 13px; margin-top: 16px;">
        Başvuru Tarihi: ${escapeHtml(application.createdAt || '')} | Son Güncelleme: ${escapeHtml(application.updated_at || '')}
      </p>
    </div>

    <div class="card" style="background: #edf2f7; border-color: #cbd5e0; margin-top: 20px;">
      <h3 style="margin-top: 0; color: #2d3748;">⚙️ Başvuru Durumunu Güncelle (PATCH)</h3>
      <p style="color: #4a5568; font-size: 14px; margin-bottom: 14px;">Mevcut durum: ${getStatusBadge(application.status)}</p>
      <form id="statusForm" onsubmit="updateStatus(event, ${escapeHtml(application.id)})" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <label for="statusSelect" style="margin: 0; font-weight: 600;">Yeni Durum Seçin:</label>
        <select id="statusSelect" name="status" style="width: auto; min-width: 200px; padding: 8px 12px; font-weight: 600;">
          <option value="PENDING" ${application.status === 'PENDING' ? 'selected' : ''}>⏳ PENDING (Beklemede)</option>
          <option value="REVIEWING" ${application.status === 'REVIEWING' ? 'selected' : ''}>🔍 REVIEWING (İnceleniyor)</option>
          <option value="ACCEPTED" ${application.status === 'ACCEPTED' ? 'selected' : ''}>✅ ACCEPTED (Kabul Edildi)</option>
          <option value="REJECTED" ${application.status === 'REJECTED' ? 'selected' : ''}>❌ REJECTED (Reddedildi)</option>
        </select>
        <button type="submit" id="updateStatusBtn" class="btn">Durumu Kaydet</button>
      </form>
    </div>

    <div style="margin-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        <a href="/applications" class="btn btn-secondary">← Tüm Başvurular</a>
        <a href="/job-postings/${escapeHtml(application.job_posting_id)}" class="btn btn-secondary">💼 İlgili İlan (#${escapeHtml(application.job_posting_id)})</a>
        <a href="/job-postings/${escapeHtml(application.job_posting_id)}/applications" class="btn btn-secondary">📋 Bu İlanın Tüm Başvuruları</a>
      </div>
      <button onclick="deleteApplication(${escapeHtml(application.id)})" class="btn btn-danger">🗑️ Başvuruyu Sil</button>
    </div>

    <script>
      function updateStatus(event, id) {
        event.preventDefault();
        var select = document.getElementById('statusSelect');
        var newStatus = select.value;
        var btn = document.getElementById('updateStatusBtn');
        btn.disabled = true;
        btn.innerText = 'Güncelleniyor...';

        fetch('/applications/' + id, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }).then(function(res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          window.location.reload();
        }).catch(function(err) {
          alert('Durum güncellenirken hata oluştu: ' + err.message);
          btn.disabled = false;
          btn.innerText = 'Durumu Kaydet';
        });
      }

      function deleteApplication(id) {
        if (confirm('#' + id + ' numaralı başvuruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
          fetch('/applications/' + id, {
            method: 'DELETE',
            headers: { 'Accept': 'text/html' }
          }).then(function(res) {
            if (!res.ok && res.status !== 204) throw new Error('HTTP ' + res.status);
            window.location.href = '/applications';
          }).catch(function(err) {
            alert('Başvuru silinirken hata oluştu: ' + err.message);
          });
        }
      }
    </script>
  `;

  return getLayout(`Başvuru #${application.id}`, 'Detay', content);
};

/**
 * Başvuru bulunamadı sayfası (404 Not Found)
 */
const renderApplicationNotFoundPage = (id) => {
  const content = `
    <div class="card card-error">
      <h2>⚠️ Başvuru Bulunamadı</h2>
      <p>Belirtilen ID (<strong>#${escapeHtml(id)}</strong>) ile eşleşen bir başvuru kaydı bulunamadı.</p>
      <a href="/applications" class="btn btn-secondary">← Başvuru Listesine Dön</a>
    </div>
  `;
  return getLayout('Başvuru Bulunamadı', '404', content);
};

/**
 * Başvuru başarıyla oluşturuldu sayfası (201 Created)
 */
const renderApplicationCreatedPage = (application) => {
  const content = `
    <div class="card card-success">
      <h2>🎉 Başvurunuz Başarıyla Alındı!</h2>
      <p><strong>Başvuru ID:</strong> #${escapeHtml(application.id)}</p>
      <p><strong>Aday:</strong> ${escapeHtml(application.applicant_name)} (${escapeHtml(application.applicant_email)})</p>
      <p><strong>Hedef İlan:</strong> <a href="/job-postings/${escapeHtml(application.job_posting_id)}">İlan #${escapeHtml(application.job_posting_id)}</a></p>
      <div style="margin-top: 18px;">
        <a href="/applications/${escapeHtml(application.id)}" class="btn">Başvuruyu İncele</a>
        <a href="/job-postings/${escapeHtml(application.job_posting_id)}/applications" class="btn btn-secondary">İlan Başvurularına Git</a>
        <a href="/applications" class="btn btn-secondary">Tüm Başvurular</a>
      </div>
    </div>
  `;
  return getLayout('Başvuru Oluşturuldu', '201', content);
};

/**
 * Başvuru güncellendi sayfası (200 OK)
 */
const renderApplicationUpdatedPage = (application, meta = {}) => {
  const content = `
    <div class="card card-success">
      <h2>✅ Başvuru Başarıyla Güncellendi! ${meta.isPartial ? '<span class="badge">Kısmi</span>' : ''}</h2>
      <p><strong>Başvuru ID:</strong> #${escapeHtml(application.id)}</p>
      <p><strong>Durum:</strong> ${getStatusBadge(application.status)}</p>
      <div style="margin-top: 18px;">
        <a href="/applications/${escapeHtml(application.id)}" class="btn">Güncel Başvuruyu Gör</a>
        <a href="/applications" class="btn btn-secondary">Başvuru Listesi</a>
      </div>
    </div>
  `;
  return getLayout('Başvuru Güncellendi', 'Başarılı', content);
};

/**
 * Başvuru silindi sayfası (200 OK)
 */
const renderApplicationDeletedPage = (id) => {
  const content = `
    <div class="card card-success">
      <h2>🗑️ Başvuru Başarıyla Silindi</h2>
      <p><strong>#${escapeHtml(id)}</strong> numaralı başvuru kaydı sistemden kaldırıldı.</p>
      <a href="/applications" class="btn btn-secondary">← Başvuru Listesine Dön</a>
    </div>
  `;
  return getLayout('Başvuru Silindi', 'Başarılı', content);
};

module.exports = {
  escapeHtml,
  renderApplicationsPage,
  renderApplicationDetailPage,
  renderApplicationNotFoundPage,
  renderApplicationCreatedPage,
  renderApplicationUpdatedPage,
  renderApplicationDeletedPage
};
