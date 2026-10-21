/**
 * View Layer: Job Posting HTML görünümlerini (şablonlarını) oluşturur.
 * JobPostingController'dan gelen verileri alarak istemciye sunulacak HTML sayfalarını üretir.
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
    input[type="text"], input[type="email"], textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      font-size: 15px;
      box-sizing: border-box;
      font-family: inherit;
    }
    input[type="text"]:focus, input[type="email"]:focus, textarea:focus {
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
    .btn-success { background-color: #38a169; color: #fff; }
    .btn-success:hover { background-color: #2f855a; }
    .btn-danger { background-color: #e53e3e; color: #fff; }
    .btn-danger:hover { background-color: #c53030; }
    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      margin-right: 4px;
    }
    .actions {
      white-space: nowrap;
    }
    .text-muted { color: #718096; font-size: 13px; }
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
      <a href="/api/job-postings" target="_blank">🔌 API JSON</a>
      <a href="/api/swagger" target="_blank">📑 Swagger UI</a>
    </div>
    <h1>${escapeHtml(title)} ${badgeText ? `<span class="badge">${escapeHtml(badgeText)}</span>` : ''}</h1>
    ${content}
  </div>
</body>
</html>`;

/**
 * İş ilanları ana liste ve oluşturma sayfası (GET /job-postings)
 */
const renderJobPostingsPage = (jobPostings = []) => {
  const tableRows = jobPostings && jobPostings.length > 0
    ? jobPostings.map(job => `
      <tr>
        <td><strong>#${escapeHtml(job.id)}</strong></td>
        <td>
          <a href="/job-postings/${escapeHtml(job.id)}" style="color: #2b6cb0; font-weight: 600; text-decoration: none;">
            ${escapeHtml(job.title)}
          </a>
        </td>
        <td><span class="badge" style="background:#e2e8f0; color:#2d3748;">${escapeHtml(job.company)}</span></td>
        <td>${escapeHtml(job.location || '-')}</td>
        <td>${escapeHtml(job.contact_email || '-')}</td>
        <td class="text-muted">${escapeHtml(job.createdDate || job.createdAt || job.created_at || '-')}</td>
        <td class="actions">
          <a href="/job-postings/${escapeHtml(job.id)}" class="btn btn-secondary btn-sm">Detay</a>
          <a href="/job-postings/${escapeHtml(job.id)}/applications" class="btn btn-secondary btn-sm">Başvurular</a>
          <button onclick="editJob(${escapeHtml(JSON.stringify(job))})" class="btn btn-secondary btn-sm">Düzenle</button>
          <button onclick="deleteJob(${escapeHtml(job.id)})" class="btn btn-danger btn-sm">Sil</button>
        </td>
      </tr>
    `).join('')
    : `<tr><td colspan="7" style="text-align: center; color: #718096; padding: 24px;">Henüz kayıtlı bir iş ilanı bulunmuyor.</td></tr>`;

  const content = `
    <h2>➕ Yeni İş İlanı Ekle</h2>
    <div class="card">
      <form id="jobForm" method="POST" action="/job-postings">
        <input type="hidden" id="editJobId" name="_id" value="" />
        <div class="form-group">
          <label for="title">İş / Pozisyon Başlığı *</label>
          <input type="text" id="title" name="title" required placeholder="Örn: Full Stack Developer" />
        </div>
        <div class="form-group">
          <label for="company">Şirket / Kurum Adı *</label>
          <input type="text" id="company" name="company" required placeholder="Örn: Tech Alumni Corp" />
        </div>
        <div class="form-group">
          <label for="location">Konum / Çalışma Modeli (Opsiyonel)</label>
          <input type="text" id="location" name="location" placeholder="Örn: İstanbul / Hibrit veya Uzaktan" />
        </div>
        <div class="form-group">
          <label for="contact_email">İletişim / Başvuru E-posta (Opsiyonel)</label>
          <input type="email" id="contact_email" name="contact_email" placeholder="Örn: kariyer@techalumni.com" />
        </div>
        <div class="form-group">
          <label for="description">İş Tanımı ve Aranan Nitelikler *</label>
          <textarea id="description" name="description" rows="5" required placeholder="Pozisyon sorumlulukları, yetkinlikler ve başvuru bilgileri..."></textarea>
        </div>
        <button type="submit" id="submitBtn" class="btn">İş İlanı Yayınla</button>
        <button type="button" id="cancelBtn" class="btn btn-secondary" style="display:none;" onclick="resetForm()">İptal</button>
      </form>
    </div>

    <h2>📋 Aktif İş İlanları Listesi (${jobPostings.length})</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Başlık</th>
          <th>Şirket</th>
          <th>Konum</th>
          <th>İletişim</th>
          <th>Tarih</th>
          <th>İşlemler</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <script>
      function editJob(job) {
        document.getElementById('editJobId').value = job.id;
        document.getElementById('title').value = job.title || '';
        document.getElementById('company').value = job.company || '';
        document.getElementById('location').value = job.location || '';
        document.getElementById('contact_email').value = job.contact_email || '';
        document.getElementById('description').value = job.description || '';
        document.getElementById('submitBtn').innerText = 'Güncellemeyi Kaydet (PUT)';
        document.getElementById('cancelBtn').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      function resetForm() {
        document.getElementById('editJobId').value = '';
        document.getElementById('jobForm').reset();
        document.getElementById('submitBtn').innerText = 'İş İlanı Yayınla';
        document.getElementById('cancelBtn').style.display = 'none';
      }

      document.getElementById('jobForm').addEventListener('submit', function(e) {
        var editId = document.getElementById('editJobId').value;
        if (editId) {
          e.preventDefault();
          var payload = {
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
            alert('Güncelleme hatası: ' + err.message);
          });
        }
      });

      function deleteJob(id) {
        if (confirm('#' + id + ' numaralı iş ilanını silmek istediğinize emin misiniz?')) {
          fetch('/job-postings/' + id, {
            method: 'DELETE',
            headers: { 'Accept': 'text/html' }
          }).then(function(res) {
            window.location.reload();
          }).catch(function(err) {
            alert('Silme hatası: ' + err.message);
          });
        }
      }
    </script>
  `;

  return getLayout('Kariyer ve İş İlanları', 'MVC View', content);
};

/**
 * İş ilanı detay sayfası (GET /job-postings/:id)
 */
const renderJobPostingDetailPage = (job) => {
  const content = `
    <div class="card">
      <h2>${escapeHtml(job.title)}</h2>
      <p><strong>Şirket:</strong> <span class="badge" style="background:#e2e8f0; color:#2d3748;">${escapeHtml(job.company)}</span></p>
      <p><strong>Konum:</strong> ${escapeHtml(job.location || 'Belirtilmedi')}</p>
      <p><strong>İletişim:</strong> ${job.contact_email ? `<a href="mailto:${escapeHtml(job.contact_email)}">${escapeHtml(job.contact_email)}</a>` : 'Belirtilmedi'}</p>
      <p><strong>Yayın Tarihi:</strong> <span class="text-muted">${escapeHtml(job.createdDate || job.createdAt || job.created_at || '-')}</span></p>
      <hr style="border:none; border-top:1px solid #e2e8f0; margin:16px 0;" />
      <h3>Açıklama ve Nitelikler</h3>
      <div style="white-space: pre-wrap; line-height: 1.6; color: #4a5568;">${escapeHtml(job.description)}</div>
    </div>

    <div class="card" style="background: #edf2f7; border-color: #cbd5e0; margin-top: 20px;">
      <h3 style="margin-top: 0; color: #2d3748;">📌 Bu İlan İçin Başvuru İşlemleri</h3>
      <p style="margin-bottom: 16px; color: #4a5568;">Bu pozisyona yapılan başvuruları listeleyebilir veya doğrudan yeni bir başvuru formu doldurabilirsiniz.</p>
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        <a href="/job-postings/${escapeHtml(job.id)}/applications" class="btn">📋 Bu İlanın Başvurularını Gör</a>
        <a href="/job-postings/${escapeHtml(job.id)}/applications#apply" class="btn btn-success">✍️ Bu İlana Başvur</a>
      </div>
    </div>

    <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <a href="/job-postings" class="btn btn-secondary">← Tüm İlanlara Dön</a>
      <button onclick="deleteJobDetail(${escapeHtml(job.id)})" class="btn btn-danger">Bu İlanı Sil</button>
    </div>
    <script>
      function deleteJobDetail(id) {
        if (confirm('#' + id + ' numaralı iş ilanını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
          fetch('/job-postings/' + id, {
            method: 'DELETE',
            headers: { 'Accept': 'text/html' }
          }).then(function() {
            window.location.href = '/job-postings';
          }).catch(function(err) {
            alert('Silme hatası: ' + err.message);
          });
        }
      }
    </script>
  `;
  return getLayout(`İş İlanı #${job.id}`, 'Detay', content);
};

/**
 * İş ilanı bulunamadı sayfası (404)
 */
const renderJobPostingNotFoundPage = (id) => {
  const content = `
    <div class="card card-danger">
      <h2>İş İlanı Bulunamadı</h2>
      <p>Aradığınız <strong>#${escapeHtml(id)}</strong> numaralı iş ilanı sistemde mevcut değil veya kaldırılmış olabilir.</p>
      <a href="/job-postings" class="btn btn-secondary">← İlan Listesine Dön</a>
    </div>
  `;
  return getLayout('İlan Bulunamadı', '404', content);
};

/**
 * İş ilanı başarıyla oluşturuldu sayfası (201)
 */
const renderJobPostingCreatedPage = (job) => {
  const content = `
    <div class="card card-success">
      <h2>✅ İş İlanı Başarıyla Yayınlandı!</h2>
      <p><strong>Başlık:</strong> ${escapeHtml(job.title)}</p>
      <p><strong>Şirket:</strong> ${escapeHtml(job.company)}</p>
      <p><strong>ID:</strong> #${escapeHtml(job.id)}</p>
      <div style="margin-top: 18px;">
        <a href="/job-postings/${escapeHtml(job.id)}" class="btn">İlanı Görüntüle</a>
        <a href="/job-postings" class="btn btn-secondary">Tüm İlanlar</a>
      </div>
    </div>
  `;
  return getLayout('İlan Yayınlandı', 'Başarılı', content);
};

/**
 * İş ilanı başarıyla güncellendi sayfası (200)
 */
const renderJobPostingUpdatedPage = (job, meta = {}) => {
  const content = `
    <div class="card card-success">
      <h2>✅ İş İlanı Başarıyla Güncellendi! ${meta.isPartial ? '<span class="badge">Kısmi</span>' : ''}</h2>
      <p><strong>Başlık:</strong> ${escapeHtml(job.title)}</p>
      <p><strong>Şirket:</strong> ${escapeHtml(job.company)}</p>
      <p><strong>ID:</strong> #${escapeHtml(job.id)}</p>
      <div style="margin-top: 18px;">
        <a href="/job-postings/${escapeHtml(job.id)}" class="btn">Güncellenmiş İlanı Gör</a>
        <a href="/job-postings" class="btn btn-secondary">İlan Listesine Dön</a>
      </div>
    </div>
  `;
  return getLayout('İlan Güncellendi', 'Başarılı', content);
};

/**
 * İş ilanı başarıyla silindi sayfası (200)
 */
const renderJobPostingDeletedPage = (id) => {
  const content = `
    <div class="card card-success">
      <h2>🗑️ İş İlanı Başarıyla Silindi</h2>
      <p><strong>#${escapeHtml(id)}</strong> numaralı iş ilanı sistemden kaldırıldı.</p>
      <a href="/job-postings" class="btn btn-secondary">← İlan Listesine Dön</a>
    </div>
  `;
  return getLayout('İlan Silindi', 'Başarılı', content);
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
