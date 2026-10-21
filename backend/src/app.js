const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const alumniRoutes = require('./routes/alumniRoutes');
const userRoutes = require('./routes/userRoutes');
const apiUserRoutes = require('./routes/apiUserRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const apiAnnouncementRoutes = require('./routes/apiAnnouncementRoutes');
const jobPostingRoutes = require('./routes/jobPostingRoutes');
const apiJobPostingRoutes = require('./routes/apiJobPostingRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const apiApplicationRoutes = require('./routes/apiApplicationRoutes');
const applicationController = require('./controllers/applicationController');
const apiApplicationController = require('./controllers/apiApplicationController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Ana Sayfa (GET /) - Alumni Tracking System Portal Dashboard
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alumni Tracking System - Portal Dashboard</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 30px 20px;
      color: #333;
    }
    .container {
      max-width: 1040px;
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
    .header {
      margin-bottom: 28px;
    }
    h1 {
      color: #1a365d;
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 28px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .lead {
      color: #4a5568;
      font-size: 15px;
      margin: 0;
      line-height: 1.5;
    }
    .badge {
      display: inline-block;
      background: #ebf8ff;
      color: #2b6cb0;
      padding: 4px 12px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 600;
      vertical-align: middle;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      gap: 20px;
      margin-top: 24px;
    }
    .card {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.06);
    }
    .card h2 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 19px;
      color: #2b6cb0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card p {
      color: #4a5568;
      font-size: 14px;
      line-height: 1.5;
      margin-top: 0;
      margin-bottom: 18px;
      flex-grow: 1;
    }
    .btn-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-block;
      background-color: #3182ce;
      color: #ffffff;
      padding: 8px 14px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn:hover { background-color: #2b6cb0; }
    .btn-secondary { background-color: #edf2f7; color: #4a5568; border: 1px solid #cbd5e0; }
    .btn-secondary:hover { background-color: #e2e8f0; color: #2d3748; }
    .btn-success { background-color: #38a169; color: #fff; }
    .btn-success:hover { background-color: #2f855a; }
    .footer-info {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid #edf2f7;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      color: #718096;
      font-size: 13px;
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
      <a href="/api/swagger" target="_blank">📖 Swagger UI</a>
    </div>

    <div class="header">
      <h1>🎓 Alumni Tracking System <span class="badge">Yönetim &amp; Takip Portalı</span></h1>
      <p class="lead">Mezunlar, öğrenciler ve kariyer fırsatlarını bir araya getiren merkezi yönetim platformu.</p>
    </div>

    <div class="grid">
      <div class="card">
        <div>
          <h2>👥 Kullanıcılar</h2>
          <p>Kayıtlı mezun ve öğrenci profillerini listeleyin, yeni kullanıcı ekleyin veya kullanıcı bilgilerini düzenleyin.</p>
        </div>
        <div class="btn-group">
          <a href="/users" class="btn">Kullanıcı Sayfası</a>
          <a href="/api/users" target="_blank" class="btn btn-secondary">JSON API</a>
        </div>
      </div>

      <div class="card">
        <div>
          <h2>📢 Duyurular</h2>
          <p>Üniversite, kariyer ve mezunlar arası duyuru ve etkinlikleri yayınlayın, güncelleyin veya kaldırın.</p>
        </div>
        <div class="btn-group">
          <a href="/announcements" class="btn">Duyuru Sayfası</a>
          <a href="/api/announcements" target="_blank" class="btn btn-secondary">JSON API</a>
        </div>
      </div>

      <div class="card">
        <div>
          <h2>💼 İş İlanları</h2>
          <p>Açık pozisyon ve staj ilanlarını yayınlayın, şirket detaylarını görüntüleyin ve ilana gelen başvuruları inceleyin.</p>
        </div>
        <div class="btn-group">
          <a href="/job-postings" class="btn">İlanlar Sayfası</a>
          <a href="/api/job-postings" target="_blank" class="btn btn-secondary">JSON API</a>
        </div>
      </div>

      <div class="card">
        <div>
          <h2>📝 Başvurular</h2>
          <p>İş ilanlarına yapılan aday başvurularını takip edin, CV bağlantılarını inceleyin ve başvuru durumlarını yönetin.</p>
        </div>
        <div class="btn-group">
          <a href="/applications" class="btn">Başvuru Sayfası</a>
          <a href="/api/applications" target="_blank" class="btn btn-secondary">JSON API</a>
        </div>
      </div>

      <div class="card">
        <div>
          <h2>📖 Swagger API Dokümantasyonu</h2>
          <p>Tüm REST API endpoint'lerini interaktif Swagger / OpenAPI 3.0 arayüzü ile canlı olarak keşfedin ve test edin.</p>
        </div>
        <div class="btn-group">
          <a href="/api/swagger" target="_blank" class="btn btn-success">Swagger UI'ı Aç</a>
          <a href="/api/swagger/doc.json" target="_blank" class="btn btn-secondary">doc.json</a>
        </div>
      </div>

      <div class="card">
        <div>
          <h2>🩺 Sistem Sağlığı</h2>
          <p>API servisinin ve veritabanı bağlantı havuzunun anlık durumunu sağlık endpoint'i üzerinden kontrol edin.</p>
        </div>
        <div class="btn-group">
          <a href="/api/health" target="_blank" class="btn btn-secondary">Sağlık Kontrolü (Health)</a>
        </div>
      </div>
    </div>

    <div class="footer-info">
      <div>Mimarî: <strong>Node.js &amp; Express MVC</strong> (Model-View-Controller)</div>
      <div>Veritabanı: <strong>MySQL 8.0 Persistence</strong></div>
    </div>
  </div>
</body>
</html>`);
});

// 2. GET /hello → "Hello World!"
app.get('/hello', (req, res) => {
  res.send('Hello World!');
});

// 3. GET /hello/esra → "Hello Esra"
app.get('/hello/esra', (req, res) => {
  res.send('Hello Esra');
});

// 4. GET /sum/{number1}/{number2} → İki sayıyı toplar
app.get('/sum/:number1/:number2', (req, res) => {
  const number1 = Number(req.params.number1);
  const number2 = Number(req.params.number2);
  const total = number1 + number2;
  res.send(total.toString());
});

// 5. GET /about → Temporary About Page
app.get('/about', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>About Alumni Tracking System</title>
</head>
<body>
  <h1>About Alumni Tracking System</h1>
  <p>Bu proje mezun takip sistemi olarak tasarlanmış olup üniversite ve mezun ilişkilerini güçlendirmeyi amaçlamaktadır.</p>
  <p><strong>Temporary About Page</strong></p>
</body>
</html>`);
});

// Rotalar
app.use('/alumni', alumniRoutes);
app.use('/users', userRoutes);
app.use('/api/users', apiUserRoutes);
app.use('/announcements', announcementRoutes);
app.use('/api/announcements', apiAnnouncementRoutes);
app.use('/job-postings', jobPostingRoutes);
app.use('/api/job-postings', apiJobPostingRoutes);

// Nested routes under Job Postings
app.get('/job-postings/:jobPostingId/applications', applicationController.getApplicationsByJobPosting);
app.post('/job-postings/:jobPostingId/applications', applicationController.createApplicationForJobPosting);
app.get('/api/job-postings/:jobPostingId/applications', apiApplicationController.getApplicationsByJobPosting);
app.post('/api/job-postings/:jobPostingId/applications', apiApplicationController.createApplicationForJobPosting);

// Direct Application routes
app.use('/applications', applicationRoutes);
app.use('/api/applications', apiApplicationRoutes);
app.get('/ok', (req, res) => res.status(200).send('ok'));

// GET /api/health → JSON formatında { "status": "ok" } cevabı döner
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "ok" });
});

// GET /health → Alternatif olarak aynı JSON cevabını döner
app.get('/health', (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Swagger / OpenAPI 3.0 Dokümantasyonu
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Alumni Tracking System API",
    version: "1.0.0",
    description: "Web Programming Dersi - Alumni Tracking System REST API Dokümantasyonu (MVC: Route -> Controller -> Model)"
  },
  servers: [
    {
      url: "/",
      description: "Mevcut Sunucu"
    }
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Sunucu sağlık kontrolü",
        description: "API sunucusunun çalışıp çalışmadığını kontrol eder.",
        responses: {
          "200": {
            description: "Sunucu aktif ve sağlıklı",
            content: {
              "application/json": {
                example: { status: "ok" }
              }
            }
          }
        }
      }
    },
    "/api/users": {
      get: {
        tags: ["ApiUser"],
        summary: "Tüm kullanıcıları listeler (ApiUser)",
        description: "apiUserRoutes ve apiUserController üzerinden mevcut tüm kullanıcıları dizi olarak döner.",
        responses: {
          "200": {
            description: "Kullanıcı listesi",
            content: {
              "application/json": {
                example: [
                  { id: 1, name: "Esra Sahin", email: "esra@ogr.iu.edu.tr" }
                ]
              }
            }
          }
        }
      },
      post: {
        tags: ["ApiUser"],
        summary: "Yeni bir kullanıcı oluşturur (ApiUser)",
        description: "apiUserRoutes ve apiUserController üzerinden yeni bir kullanıcı ekler ve otomatik artan ID ile döner.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Esra Sahin" },
                  email: { type: "string", example: "esra@ogr.iu.edu.tr" }
                },
                required: ["name", "email"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Kullanıcı başarıyla oluşturuldu",
            content: {
              "application/json": {
                example: { id: 1, name: "Esra Sahin", email: "esra@ogr.iu.edu.tr" }
              }
            }
          }
        }
      }
    },
    "/api/users/{id}": {
      get: {
        tags: ["ApiUser"],
        summary: "ID'ye göre kullanıcı getirir (ApiUser)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Getirilmek istenen kullanıcının ID'si"
          }
        ],
        responses: {
          "200": {
            description: "Kullanıcı bulundu",
            content: {
              "application/json": {
                example: { id: 1, name: "Esra Sahin", email: "esra@ogr.iu.edu.tr" }
              }
            }
          },
          "404": {
            description: "Kullanıcı bulunamadı",
            content: {
              "application/json": {
                example: { message: "Kullanıcı bulunamadı" }
              }
            }
          }
        }
      },
      put: {
        tags: ["ApiUser"],
        summary: "Kullanıcı bilgilerini tamamen günceller (ApiUser)",
        description: "Mevcut kullanıcının tüm bilgilerini değiştirir (ID korunur).",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Güncellenecek kullanıcının ID'si"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Esra Yeni" },
                  email: { type: "string", example: "esrayeni@ogr.iu.edu.tr" }
                },
                required: ["name", "email"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Kullanıcı başarıyla güncellendi",
            content: {
              "application/json": {
                example: { id: 1, name: "Esra Yeni", email: "esrayeni@ogr.iu.edu.tr" }
              }
            }
          },
          "404": {
            description: "Kullanıcı bulunamadı",
            content: {
              "application/json": {
                example: { message: "Kullanıcı bulunamadı" }
              }
            }
          }
        }
      },
      patch: {
        tags: ["ApiUser"],
        summary: "Kullanıcının belirtilen alanlarını kısmi olarak günceller (ApiUser)",
        description: "Yalnızca gönderilen alanlar güncellenir, diğer alanlar ve ID korunur.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Kısmi güncellenecek kullanıcının ID'si"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Esra Guncel" },
                  email: { type: "string", example: "esra@ogr.iu.edu.tr" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Kullanıcı kısmi olarak güncellendi",
            content: {
              "application/json": {
                example: { id: 1, name: "Esra Guncel", email: "esra@ogr.iu.edu.tr" }
              }
            }
          },
          "404": {
            description: "Kullanıcı bulunamadı",
            content: {
              "application/json": {
                example: { message: "Kullanıcı bulunamadı" }
              }
            }
          }
        }
      },
      delete: {
        tags: ["ApiUser"],
        summary: "Kullanıcıyı siler (ApiUser)",
        description: "Belirtilen ID'ye sahip kullanıcıyı diziden siler.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Silinecek kullanıcının ID'si"
          }
        ],
        responses: {
          "204": { description: "Kullanıcı başarıyla silindi (İçerik yok)" },
          "404": {
            description: "Kullanıcı bulunamadı",
            content: {
              "application/json": {
                example: { message: "Kullanıcı bulunamadı" }
              }
            }
          }
        }
      }
    },
    "/users": {
      get: {
        tags: ["User"],
        summary: "Tüm kullanıcıları listeler (User)",
        description: "userRoutes ve userController üzerinden mevcut tüm kullanıcıları dizi olarak döner.",
        responses: {
          "200": {
            description: "Kullanıcı listesi",
            content: {
              "application/json": {
                example: [
                  { id: 1, name: "Esra Sahin", email: "esra@ogr.iu.edu.tr" }
                ]
              }
            }
          }
        }
      },
      post: {
        tags: ["User"],
        summary: "Yeni bir kullanıcı oluşturur (User)",
        description: "userRoutes ve userController üzerinden yeni bir kullanıcı ekler ve otomatik artan ID ile döner.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Esra Sahin" },
                  email: { type: "string", example: "esra@ogr.iu.edu.tr" }
                },
                required: ["name", "email"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Kullanıcı başarıyla oluşturuldu",
            content: {
              "application/json": {
                example: { id: 1, name: "Esra Sahin", email: "esra@ogr.iu.edu.tr" }
              }
            }
          }
        }
      }
    },
    "/users/{id}": {
      get: {
        tags: ["User"],
        summary: "ID'ye göre kullanıcı getirir (User)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Getirilmek istenen kullanıcının ID'si"
          }
        ],
        responses: {
          "200": {
            description: "Kullanıcı bulundu",
            content: {
              "application/json": {
                example: { id: 1, name: "Esra Sahin", email: "esra@ogr.iu.edu.tr" }
              }
            }
          },
          "404": {
            description: "Kullanıcı bulunamadı",
            content: {
              "application/json": {
                example: { message: "Kullanıcı bulunamadı" }
              }
            }
          }
        }
      },
      put: {
        tags: ["User"],
        summary: "Kullanıcı bilgilerini tamamen günceller (User)",
        description: "Mevcut kullanıcının tüm bilgilerini değiştirir (ID korunur).",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Güncellenecek kullanıcının ID'si"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Esra Yeni" },
                  email: { type: "string", example: "esrayeni@ogr.iu.edu.tr" }
                },
                required: ["name", "email"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Kullanıcı başarıyla güncellendi",
            content: {
              "application/json": {
                example: { id: 1, name: "Esra Yeni", email: "esrayeni@ogr.iu.edu.tr" }
              }
            }
          },
          "404": {
            description: "Kullanıcı bulunamadı",
            content: {
              "application/json": {
                example: { message: "Kullanıcı bulunamadı" }
              }
            }
          }
        }
      },
      patch: {
        tags: ["User"],
        summary: "Kullanıcının belirtilen alanlarını kısmi olarak günceller (User)",
        description: "Yalnızca gönderilen alanlar güncellenir, diğer alanlar ve ID korunur.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Kısmi güncellenecek kullanıcının ID'si"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Esra Guncel" },
                  email: { type: "string", example: "esra@ogr.iu.edu.tr" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Kullanıcı kısmi olarak güncellendi",
            content: {
              "application/json": {
                example: { id: 1, name: "Esra Guncel", email: "esra@ogr.iu.edu.tr" }
              }
            }
          },
          "404": {
            description: "Kullanıcı bulunamadı",
            content: {
              "application/json": {
                example: { message: "Kullanıcı bulunamadı" }
              }
            }
          }
        }
      },
      delete: {
        tags: ["User"],
        summary: "Kullanıcıyı siler (User)",
        description: "Belirtilen ID'ye sahip kullanıcıyı diziden siler.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Silinecek kullanıcının ID'si"
          }
        ],
        responses: {
          "204": { description: "Kullanıcı başarıyla silindi (İçerik yok)" },
          "404": {
            description: "Kullanıcı bulunamadı",
            content: {
              "application/json": {
                example: { message: "Kullanıcı bulunamadı" }
              }
            }
          }
        }
      }
    },
    "/api/announcements": {
      get: {
        tags: ["Announcement"],
        summary: "Tüm duyuruları listeler",
        description: "apiAnnouncementRoutes ve apiAnnouncementController üzerinden mevcut tüm duyuruları JSON dizisi olarak döner.",
        responses: {
          "200": {
            description: "Duyuru listesi",
            content: {
              "application/json": {
                example: [
                  {
                    id: 1,
                    title: "Mezunlar Buluşması",
                    content: "Yıllık mezunlar buluşması bu hafta sonu kampüste yapılacaktır.",
                    createdAt: "2026-10-13T17:00:00.000Z",
                    createdDate: "2026-10-13T17:00:00.000Z"
                  }
                ]
              }
            }
          }
        }
      },
      post: {
        tags: ["Announcement"],
        summary: "Yeni bir duyuru oluşturur",
        description: "apiAnnouncementRoutes ve apiAnnouncementController üzerinden yeni bir duyuru ekler ve oluşturulan duyuruyu döner.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Mezunlar Buluşması" },
                  content: { type: "string", example: "Yıllık mezunlar buluşması bu hafta sonu kampüste yapılacaktır." }
                },
                required: ["title", "content"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Duyuru başarıyla oluşturuldu",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  title: "Mezunlar Buluşması",
                  content: "Yıllık mezunlar buluşması bu hafta sonu kampüste yapılacaktır.",
                  createdAt: "2026-10-13T17:00:00.000Z",
                  createdDate: "2026-10-13T17:00:00.000Z"
                }
              }
            }
          }
        }
      }
    },
    "/api/announcements/{id}": {
      get: {
        tags: ["Announcement"],
        summary: "ID'ye göre duyuru getirir",
        description: "Belirtilen ID'ye sahip tek bir duyuruyu döner.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Getirilmek istenen duyurunun ID'si"
          }
        ],
        responses: {
          "200": {
            description: "Duyuru bulundu",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  title: "Mezunlar Buluşması",
                  content: "Yıllık mezunlar buluşması bu hafta sonu kampüste yapılacaktır.",
                  createdAt: "2026-10-13T17:00:00.000Z",
                  createdDate: "2026-10-13T17:00:00.000Z"
                }
              }
            }
          },
          "400": {
            description: "Geçersiz veya eksik duyuru ID'si",
            content: {
              "application/json": {
                example: { message: "Geçersiz veya eksik duyuru ID'si" }
              }
            }
          },
          "404": {
            description: "Duyuru bulunamadı",
            content: {
              "application/json": {
                example: { message: "Duyuru bulunamadı" }
              }
            }
          }
        }
      },
      put: {
        tags: ["Announcement"],
        summary: "Duyuru bilgilerini tamamen günceller",
        description: "Mevcut duyurunun tüm bilgilerini değiştirir (ID korunur).",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Güncellenecek duyurunun ID'si"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Güncellenmiş Başlık" },
                  content: { type: "string", example: "Güncellenmiş duyuru içeriği." }
                },
                required: ["title", "content"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Duyuru başarıyla güncellendi",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  title: "Güncellenmiş Başlık",
                  content: "Güncellenmiş duyuru içeriği.",
                  createdAt: "2026-10-13T17:00:00.000Z",
                  createdDate: "2026-10-13T17:00:00.000Z"
                }
              }
            }
          },
          "400": {
            description: "Geçersiz veya eksik duyuru ID'si",
            content: {
              "application/json": {
                example: { message: "Geçersiz veya eksik duyuru ID'si" }
              }
            }
          },
          "404": {
            description: "Duyuru bulunamadı",
            content: {
              "application/json": {
                example: { message: "Duyuru bulunamadı" }
              }
            }
          }
        }
      },
      patch: {
        tags: ["Announcement"],
        summary: "Duyurunun belirtilen alanlarını kısmi olarak günceller",
        description: "Yalnızca gönderilen alanlar güncellenir, diğer alanlar ve ID korunur.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Kısmi güncellenecek duyurunun ID'si"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Kısmi Güncellenmiş Başlık" },
                  content: { type: "string", example: "Kısmi güncellenmiş içerik." }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Duyuru kısmi olarak güncellendi",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  title: "Kısmi Güncellenmiş Başlık",
                  content: "Kısmi güncellenmiş içerik.",
                  createdAt: "2026-10-13T17:00:00.000Z",
                  createdDate: "2026-10-13T17:00:00.000Z"
                }
              }
            }
          },
          "400": {
            description: "Geçersiz veya eksik duyuru ID'si",
            content: {
              "application/json": {
                example: { message: "Geçersiz veya eksik duyuru ID'si" }
              }
            }
          },
          "404": {
            description: "Duyuru bulunamadı",
            content: {
              "application/json": {
                example: { message: "Duyuru bulunamadı" }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Announcement"],
        summary: "Duyuruyu siler",
        description: "Belirtilen ID'ye sahip duyuruyu listeden siler.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Silinecek duyurunun ID'si"
          }
        ],
        responses: {
          "204": { description: "Duyuru başarıyla silindi (İçerik yok)" },
          "400": {
            description: "Geçersiz veya eksik duyuru ID'si",
            content: {
              "application/json": {
                example: { message: "Geçersiz veya eksik duyuru ID'si" }
              }
            }
          },
          "404": {
            description: "Duyuru bulunamadı",
            content: {
              "application/json": {
                example: { message: "Duyuru bulunamadı" }
              }
            }
          }
        }
      }
    },
    "/api/job-postings": {
      get: {
        tags: ["JobPosting"],
        summary: "Tüm iş ilanlarını listeler",
        description: "apiJobPostingRoutes ve apiJobPostingController üzerinden mevcut tüm iş ilanlarını JSON dizisi olarak döner.",
        responses: {
          "200": {
            description: "İş ilanları listesi",
            content: {
              "application/json": {
                example: [
                  {
                    id: 1,
                    title: "Full Stack Developer",
                    company: "Tech Alumni Corp",
                    location: "Istanbul / Hybrid",
                    description: "Looking for a Full Stack Developer experienced with Node.js and modern web frameworks.",
                    contact_email: "careers@techalumni.com",
                    createdAt: "2026-10-21T09:40:00.000Z",
                    createdDate: "2026-10-21T09:40:00.000Z"
                  }
                ]
              }
            }
          }
        }
      },
      post: {
        tags: ["JobPosting"],
        summary: "Yeni bir iş ilanı oluşturur",
        description: "apiJobPostingRoutes ve apiJobPostingController üzerinden yeni bir iş ilanı ekler ve oluşturulan ilanı döner.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Full Stack Developer" },
                  company: { type: "string", example: "Tech Alumni Corp" },
                  location: { type: "string", example: "Istanbul / Hybrid" },
                  description: { type: "string", example: "Looking for a Full Stack Developer experienced with Node.js and modern web frameworks." },
                  contact_email: { type: "string", example: "careers@techalumni.com" }
                },
                required: ["title", "company", "description"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "İş ilanı başarıyla oluşturuldu",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  title: "Full Stack Developer",
                  company: "Tech Alumni Corp",
                  location: "Istanbul / Hybrid",
                  description: "Looking for a Full Stack Developer experienced with Node.js and modern web frameworks.",
                  contact_email: "careers@techalumni.com",
                  createdAt: "2026-10-21T09:40:00.000Z",
                  createdDate: "2026-10-21T09:40:00.000Z"
                }
              }
            }
          },
          "400": {
            description: "Eksik veya geçersiz alanlar",
            content: {
              "application/json": {
                example: { message: "Başlık (title), şirket (company) ve açıklama (description) alanları zorunludur." }
              }
            }
          }
        }
      }
    },
    "/api/job-postings/{id}": {
      get: {
        tags: ["JobPosting"],
        summary: "ID'ye göre iş ilanı getirir",
        description: "Belirtilen ID'ye sahip tek bir iş ilanını döner.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Getirilmek istenen iş ilanının ID'si"
          }
        ],
        responses: {
          "200": {
            description: "İş ilanı bulundu",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  title: "Full Stack Developer",
                  company: "Tech Alumni Corp",
                  location: "Istanbul / Hybrid",
                  description: "Looking for a Full Stack Developer experienced with Node.js and modern web frameworks.",
                  contact_email: "careers@techalumni.com",
                  createdAt: "2026-10-21T09:40:00.000Z",
                  createdDate: "2026-10-21T09:40:00.000Z"
                }
              }
            }
          },
          "400": {
            description: "Geçersiz veya eksik iş ilanı ID'si",
            content: {
              "application/json": {
                example: { message: "Geçersiz veya eksik iş ilanı ID'si" }
              }
            }
          },
          "404": {
            description: "İş ilanı bulunamadı",
            content: {
              "application/json": {
                example: { message: "İş ilanı bulunamadı" }
              }
            }
          }
        }
      },
      put: {
        tags: ["JobPosting"],
        summary: "İş ilanı bilgilerini tamamen günceller",
        description: "Mevcut iş ilanının tüm bilgilerini değiştirir (ID korunur).",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Güncellenecek iş ilanının ID'si"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Senior Backend Developer" },
                  company: { type: "string", example: "Tech Alumni Corp" },
                  location: { type: "string", example: "Remote" },
                  description: { type: "string", example: "Looking for a Senior Backend Developer with Node.js/MySQL experience." },
                  contact_email: { type: "string", example: "careers@techalumni.com" }
                },
                required: ["title", "company", "description"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "İş ilanı başarıyla güncellendi",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  title: "Senior Backend Developer",
                  company: "Tech Alumni Corp",
                  location: "Remote",
                  description: "Looking for a Senior Backend Developer with Node.js/MySQL experience.",
                  contact_email: "careers@techalumni.com",
                  createdAt: "2026-10-21T09:40:00.000Z",
                  createdDate: "2026-10-21T09:40:00.000Z"
                }
              }
            }
          },
          "400": {
            description: "Geçersiz veya eksik iş ilanı ID'si veya eksik alanlar",
            content: {
              "application/json": {
                example: { message: "Başlık (title), şirket (company) ve açıklama (description) alanları zorunludur." }
              }
            }
          },
          "404": {
            description: "İş ilanı bulunamadı",
            content: {
              "application/json": {
                example: { message: "İş ilanı bulunamadı" }
              }
            }
          }
        }
      },
      patch: {
        tags: ["JobPosting"],
        summary: "İş ilanının belirtilen alanlarını kısmi olarak günceller",
        description: "Yalnızca gönderilen alanlar güncellenir, diğer alanlar ve ID korunur.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Kısmi güncellenecek iş ilanının ID'si"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Lead Backend Developer" },
                  company: { type: "string", example: "Tech Alumni Corp" },
                  location: { type: "string", example: "Ankara / Remote" },
                  description: { type: "string", example: "Updated description..." },
                  contact_email: { type: "string", example: "jobs@techalumni.com" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "İş ilanı kısmi olarak güncellendi",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  title: "Lead Backend Developer",
                  company: "Tech Alumni Corp",
                  location: "Ankara / Remote",
                  description: "Updated description...",
                  contact_email: "jobs@techalumni.com",
                  createdAt: "2026-10-21T09:40:00.000Z",
                  createdDate: "2026-10-21T09:40:00.000Z"
                }
              }
            }
          },
          "400": {
            description: "Geçersiz veya eksik iş ilanı ID'si",
            content: {
              "application/json": {
                example: { message: "Geçersiz veya eksik iş ilanı ID'si" }
              }
            }
          },
          "404": {
            description: "İş ilanı bulunamadı",
            content: {
              "application/json": {
                example: { message: "İş ilanı bulunamadı" }
              }
            }
          }
        }
      },
      delete: {
        tags: ["JobPosting"],
        summary: "İş ilanını siler",
        description: "Belirtilen ID'ye sahip iş ilanını sistemden siler.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Silinecek iş ilanının ID'si"
          }
        ],
        responses: {
          "204": { description: "İş ilanı başarıyla silindi (İçerik yok)" },
          "400": {
            description: "Geçersiz veya eksik iş ilanı ID'si",
            content: {
              "application/json": {
                example: { message: "Geçersiz veya eksik iş ilanı ID'si" }
              }
            }
          },
          "404": {
            description: "İş ilanı bulunamadı",
            content: {
              "application/json": {
                example: { message: "İş ilanı bulunamadı" }
              }
            }
          }
        }
      }
    },
    "/api/job-postings/{jobPostingId}/applications": {
      get: {
        tags: ["ApiApplication", "JobPosting"],
        summary: "Belirli bir iş ilanına ait başvuruları listeler",
        description: "jobPostingId parametresine karşılık gelen iş ilanına yapılmış tüm başvuruları döner.",
        parameters: [
          {
            name: "jobPostingId",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Hedef iş ilanının ID'si"
          }
        ],
        responses: {
          "200": {
            description: "Başvuru listesi",
            content: {
              "application/json": {
                example: [
                  {
                    id: 1,
                    job_posting_id: 1,
                    user_id: null,
                    applicant_name: "Canan Yılmaz",
                    applicant_email: "canan.yilmaz@alumni.edu.tr",
                    resume_url: "https://example.com/cv.pdf",
                    cover_letter: "Pozisyona başvurmak istiyorum.",
                    status: "PENDING",
                    createdAt: "2026-10-21T11:25:00.000Z",
                    createdDate: "2026-10-21T11:25:00.000Z"
                  }
                ]
              }
            }
          },
          "400": {
            description: "Geçersiz veya eksik iş ilanı ID'si",
            content: {
              "application/json": {
                example: { message: "Geçersiz veya eksik iş ilanı ID'si" }
              }
            }
          },
          "404": {
            description: "İş ilanı bulunamadı",
            content: {
              "application/json": {
                example: { message: "İş ilanı bulunamadı" }
              }
            }
          }
        }
      },
      post: {
        tags: ["ApiApplication", "JobPosting"],
        summary: "Belirli bir iş ilanı altına yeni başvuru oluşturur",
        description: "URL'deki jobPostingId parametresini hedef alarak yeni bir başvuru kaydı oluşturur.",
        parameters: [
          {
            name: "jobPostingId",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Hedef iş ilanının ID'si"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  applicant_name: { type: "string", example: "Canan Yılmaz" },
                  applicant_email: { type: "string", example: "canan.yilmaz@alumni.edu.tr" },
                  user_id: { type: "integer", nullable: true, example: null },
                  resume_url: { type: "string", nullable: true, example: "https://example.com/cv.pdf" },
                  cover_letter: { type: "string", nullable: true, example: "Pozisyona başvurmak istiyorum." },
                  status: { type: "string", example: "PENDING" }
                },
                required: ["applicant_name", "applicant_email"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Başvuru başarıyla oluşturuldu",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  job_posting_id: 1,
                  user_id: null,
                  applicant_name: "Canan Yılmaz",
                  applicant_email: "canan.yilmaz@alumni.edu.tr",
                  resume_url: "https://example.com/cv.pdf",
                  cover_letter: "Pozisyona başvurmak istiyorum.",
                  status: "PENDING",
                  createdAt: "2026-10-21T11:25:00.000Z",
                  createdDate: "2026-10-21T11:25:00.000Z"
                }
              }
            }
          },
          "400": {
            description: "Eksik alan veya çelişkili iş ilanı ID'si",
            content: {
              "application/json": {
                example: { message: "Başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur." }
              }
            }
          },
          "404": {
            description: "İş ilanı bulunamadı",
            content: {
              "application/json": {
                example: { message: "İş ilanı bulunamadı" }
              }
            }
          }
        }
      }
    },
    "/api/applications": {
      get: {
        tags: ["ApiApplication"],
        summary: "Tüm başvuruları listeler (ApiApplication)",
        description: "Sistemde kayıtlı tüm iş başvurularını dizi olarak döner.",
        responses: {
          "200": {
            description: "Başvuru listesi",
            content: {
              "application/json": {
                example: [
                  {
                    id: 1,
                    job_posting_id: 1,
                    user_id: null,
                    applicant_name: "Canan Yılmaz",
                    applicant_email: "canan.yilmaz@alumni.edu.tr",
                    resume_url: "https://example.com/cv.pdf",
                    cover_letter: "Pozisyona başvurmak istiyorum.",
                    status: "PENDING",
                    createdAt: "2026-10-21T11:25:00.000Z",
                    createdDate: "2026-10-21T11:25:00.000Z"
                  }
                ]
              }
            }
          }
        }
      },
      post: {
        tags: ["ApiApplication"],
        summary: "Yeni başvuru oluşturur (ApiApplication)",
        description: "Doğrudan iş ilanı ID'si belirterek yeni bir başvuru kaydı ekler.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  job_posting_id: { type: "integer", example: 1 },
                  applicant_name: { type: "string", example: "Canan Yılmaz" },
                  applicant_email: { type: "string", example: "canan.yilmaz@alumni.edu.tr" },
                  user_id: { type: "integer", nullable: true, example: null },
                  resume_url: { type: "string", nullable: true, example: "https://example.com/cv.pdf" },
                  cover_letter: { type: "string", nullable: true, example: "Pozisyona başvurmak istiyorum." },
                  status: { type: "string", example: "PENDING" }
                },
                required: ["job_posting_id", "applicant_name", "applicant_email"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Başvuru başarıyla oluşturuldu",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  job_posting_id: 1,
                  user_id: null,
                  applicant_name: "Canan Yılmaz",
                  applicant_email: "canan.yilmaz@alumni.edu.tr",
                  resume_url: "https://example.com/cv.pdf",
                  cover_letter: "Pozisyona başvurmak istiyorum.",
                  status: "PENDING",
                  createdAt: "2026-10-21T11:25:00.000Z",
                  createdDate: "2026-10-21T11:25:00.000Z"
                }
              }
            }
          },
          "400": {
            description: "Eksik veya geçersiz alanlar",
            content: {
              "application/json": {
                example: { message: "İş ilanı ID'si (job_posting_id), başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur." }
              }
            }
          },
          "404": {
            description: "Belirtilen iş ilanı bulunamadı",
            content: {
              "application/json": {
                example: { message: "Belirtilen iş ilanı bulunamadı" }
              }
            }
          }
        }
      }
    },
    "/api/applications/{id}": {
      get: {
        tags: ["ApiApplication"],
        summary: "ID'ye göre başvuru getirir",
        description: "Belirtilen ID'ye sahip tek bir başvuruyu döner.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Getirilmek istenen başvurunun ID'si"
          }
        ],
        responses: {
          "200": {
            description: "Başvuru bulundu",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  job_posting_id: 1,
                  user_id: null,
                  applicant_name: "Canan Yılmaz",
                  applicant_email: "canan.yilmaz@alumni.edu.tr",
                  resume_url: "https://example.com/cv.pdf",
                  cover_letter: "Pozisyona başvurmak istiyorum.",
                  status: "PENDING",
                  createdAt: "2026-10-21T11:25:00.000Z",
                  createdDate: "2026-10-21T11:25:00.000Z"
                }
              }
            }
          },
          "400": {
            description: "Geçersiz veya eksik başvuru ID'si",
            content: {
              "application/json": {
                example: { message: "Geçersiz veya eksik başvuru ID'si" }
              }
            }
          },
          "404": {
            description: "Başvuru bulunamadı",
            content: {
              "application/json": {
                example: { message: "Başvuru bulunamadı" }
              }
            }
          }
        }
      },
      put: {
        tags: ["ApiApplication"],
        summary: "Başvuru bilgilerini tam günceller (PUT)",
        description: "Belirtilen ID'ye sahip başvurunun tüm bilgilerini günceller.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Güncellenecek başvurunun ID'si"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  job_posting_id: { type: "integer", example: 1 },
                  applicant_name: { type: "string", example: "Canan Yılmaz" },
                  applicant_email: { type: "string", example: "canan.yilmaz@alumni.edu.tr" },
                  user_id: { type: "integer", nullable: true, example: null },
                  resume_url: { type: "string", nullable: true, example: "https://example.com/cv.pdf" },
                  cover_letter: { type: "string", nullable: true, example: "Güncellenmiş ön yazı..." },
                  status: { type: "string", example: "REVIEWING" }
                },
                required: ["job_posting_id", "applicant_name", "applicant_email"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Başvuru başarıyla güncellendi",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  job_posting_id: 1,
                  user_id: null,
                  applicant_name: "Canan Yılmaz",
                  applicant_email: "canan.yilmaz@alumni.edu.tr",
                  resume_url: "https://example.com/cv.pdf",
                  cover_letter: "Güncellenmiş ön yazı...",
                  status: "REVIEWING",
                  createdAt: "2026-10-21T11:25:00.000Z",
                  createdDate: "2026-10-21T11:25:00.000Z"
                }
              }
            }
          },
          "400": {
            description: "Geçersiz veya eksik alanlar",
            content: {
              "application/json": {
                example: { message: "İş ilanı ID'si (job_posting_id), başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur." }
              }
            }
          },
          "404": {
            description: "Başvuru veya iş ilanı bulunamadı",
            content: {
              "application/json": {
                example: { message: "Başvuru bulunamadı" }
              }
            }
          }
        }
      },
      patch: {
        tags: ["ApiApplication"],
        summary: "Başvuru bilgilerini kısmi günceller (PATCH)",
        description: "Belirtilen ID'ye sahip başvurunun sadece gönderilen alanlarını günceller.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Kısmi güncellenecek başvurunun ID'si"
          }
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "ACCEPTED" },
                  cover_letter: { type: "string", example: "Ek notlar..." }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Başvuru kısmi olarak güncellendi",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  job_posting_id: 1,
                  user_id: null,
                  applicant_name: "Canan Yılmaz",
                  applicant_email: "canan.yilmaz@alumni.edu.tr",
                  resume_url: "https://example.com/cv.pdf",
                  cover_letter: "Ek notlar...",
                  status: "ACCEPTED",
                  createdAt: "2026-10-21T11:25:00.000Z",
                  createdDate: "2026-10-21T11:25:00.000Z"
                }
              }
            }
          },
          "400": {
            description: "Geçersiz veya eksik başvuru ID'si",
            content: {
              "application/json": {
                example: { message: "Geçersiz veya eksik başvuru ID'si" }
              }
            }
          },
          "404": {
            description: "Başvuru bulunamadı",
            content: {
              "application/json": {
                example: { message: "Başvuru bulunamadı" }
              }
            }
          }
        }
      },
      delete: {
        tags: ["ApiApplication"],
        summary: "Başvuruyu siler",
        description: "Belirtilen ID'ye sahip başvuruyu sistemden siler.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "Silinecek başvurunun ID'si"
          }
        ],
        responses: {
          "204": { description: "Başvuru başarıyla silindi (İçerik yok)" },
          "400": {
            description: "Geçersiz veya eksik başvuru ID'si",
            content: {
              "application/json": {
                example: { message: "Geçersiz veya eksik başvuru ID'si" }
              }
            }
          },
          "404": {
            description: "Başvuru bulunamadı",
            content: {
              "application/json": {
                example: { message: "Başvuru bulunamadı" }
              }
            }
          }
        }
      }
    },
    "/api/swagger": {
      get: {
        tags: ["Swagger"],
        summary: "Swagger UI Arayüzü",
        description: "İnteraktif Swagger API dokümantasyon ekranı.",
        responses: {
          "200": {
            description: "Swagger UI HTML sayfası"
          }
        }
      }
    }
  }
};

// GET /api/swagger/doc.json → İstenirse ham OpenAPI JSON dokümantasyonunu döner
app.get('/api/swagger/doc.json', (req, res) => {
  res.status(200).json(swaggerDocument);
});

// Swagger UI arayüzü (/api/swagger üzerinden görsel ve test edilebilir arayüz sunar)
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor: http://localhost:${PORT}`);
});

module.exports = app;
