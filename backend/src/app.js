const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const alumniRoutes = require('./routes/alumniRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const apiUserRoutes = require('./routes/apiUserRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const apiAnnouncementRoutes = require('./routes/apiAnnouncementRoutes');
const jobPostingRoutes = require('./routes/jobPostingRoutes');
const apiJobPostingRoutes = require('./routes/apiJobPostingRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const apiApplicationRoutes = require('./routes/apiApplicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const apiAdminRoutes = require('./routes/apiAdminRoutes');
const applicationController = require('./controllers/applicationController');
const apiApplicationController = require('./controllers/apiApplicationController');
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const notFoundMiddleware = require('./middlewares/notFoundMiddleware');
const errorHandlerMiddleware = require('./middlewares/errorHandlerMiddleware');
const { sessionMiddleware } = require('./config/session');
const { attachCurrentUser } = require('./middlewares/authContextMiddleware');
const { requireAuth } = require('./middlewares/requireAuthMiddleware');
const { renderHomePage } = require('./views/homeView');
const { renderAboutPage } = require('./views/aboutView');

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(loggerMiddleware);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(attachCurrentUser);

// 1. Ana Sayfa (GET /) - Alumni Tracking System Portal Dashboard
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderHomePage(req.user || null));
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

// 5. GET /about → About Page
app.get('/about', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderAboutPage(req.user || null));
});

// Rotalar
app.use('/', authRoutes);
app.use('/alumni', alumniRoutes);
app.use('/users', userRoutes);
app.use('/api/users', apiUserRoutes);
app.use('/announcements', announcementRoutes);
app.use('/api/announcements', apiAnnouncementRoutes);
app.use('/job-postings', jobPostingRoutes);
app.use('/api/job-postings', apiJobPostingRoutes);

// Nested routes under Job Postings (review/listing protected, guest submission preserved)
app.get('/job-postings/:jobPostingId/applications', requireAuth, applicationController.getApplicationsByJobPosting);
app.post('/job-postings/:jobPostingId/applications', applicationController.createApplicationForJobPosting);
app.get('/api/job-postings/:jobPostingId/applications', requireAuth, apiApplicationController.getApplicationsByJobPosting);
app.post('/api/job-postings/:jobPostingId/applications', apiApplicationController.createApplicationForJobPosting);

// Direct Application routes
app.use('/applications', applicationRoutes);
app.use('/api/applications', apiApplicationRoutes);

// Admin Panel & Admin API routes (protected by requireAuth + requireAdmin)
app.use('/admin', adminRoutes);
app.use('/api/admin', apiAdminRoutes);
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
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Alternatif sunucu sağlık kontrolü",
        description: "Alternatif kök seviyesinde çalışan sunucu sağlık kontrolü endpoint'i.",
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
    "/alumni": {
      get: {
        tags: ["Alumni"],
        summary: "Mezunlar ana durum kontrolü",
        description: "alumniRoutes üzerinden temel servis durumunu ('OK') döner.",
        responses: {
          "200": {
            description: "Servis aktif yanıtı",
            content: {
              "text/plain": {
                example: "OK"
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
    "/api/users/{id}/jobs": {
      get: {
        tags: ["ApiUser", "JobPosting"],
        summary: "Belirli bir kullanıcının oluşturduğu iş ilanlarını listeler (Nested Route)",
        description: "URL'deki kullanıcı ID'sine (id) karşılık gelen kullanıcının oluşturduğu tüm iş ilanlarını (job_postings.user_id ilişkisi üzerinden) döner. Kullanıcı bulunamazsa 404, kullanıcının henüz ilanı yoksa boş dizi ([]) döner.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "İş ilanları getirilmek istenen kullanıcının ID'si"
          }
        ],
        responses: {
          "200": {
            description: "Kullanıcıya ait iş ilanları listesi (ilan yoksa boş dizi döner)",
            content: {
              "application/json": {
                example: [
                  {
                    id: 1,
                    user_id: 1,
                    title: "Full Stack Developer",
                    company: "Tech Alumni Corp",
                    city: "Istanbul",
                    location: "Istanbul / Hybrid",
                    description: "Looking for a Full Stack Developer experienced with Node.js and modern web frameworks.",
                    contact_email: "esra.sahin@alumni.edu.tr",
                    createdAt: "2026-10-21T09:40:00.000Z",
                    createdDate: "2026-10-21T09:40:00.000Z"
                  }
                ]
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
      post: {
        tags: ["ApiUser", "JobPosting"],
        summary: "Belirli bir kullanıcı adına yeni iş ilanı oluşturur (Nested Route)",
        description: "URL'deki kullanıcı ID'sine (id) karşılık gelen kullanıcı adına yeni bir iş ilanı kaydeder. Kullanıcı bulunamazsa 404 döner. İlan sahipliği (user_id) için URL'deki ID esas alınır; body içindeki user_id dikkate alınmaz.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "İş ilanı oluşturulacak kullanıcının ID'si"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", maxLength: 120, example: "Full Stack Developer" },
                  company: { type: "string", example: "Tech Alumni Corp" },
                  city: { type: "string", example: "Istanbul" },
                  location: { type: "string", example: "Istanbul / Hybrid" },
                  description: { type: "string", example: "Looking for a Full Stack Developer experienced with Node.js and modern web frameworks." },
                  contact_email: { type: "string", example: "careers@techalumni.com" }
                },
                required: ["title", "company"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "İş ilanı kullanıcı adına başarıyla oluşturuldu",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  user_id: 1,
                  userId: 1,
                  title: "Full Stack Developer",
                  company: "Tech Alumni Corp",
                  city: "Istanbul",
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
            description: "Zorunlu alanlar eksik veya geçersiz",
            content: {
              "application/json": {
                example: { message: "Başlık (title) ve şirket (company) alanları zorunludur." }
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
                    city: "Istanbul",
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
                  title: { type: "string", maxLength: 120, example: "Full Stack Developer" },
                  company: { type: "string", example: "Tech Alumni Corp" },
                  city: { type: "string", example: "Istanbul" },
                  location: { type: "string", example: "Istanbul / Hybrid" },
                  description: { type: "string", example: "Looking for a Full Stack Developer experienced with Node.js and modern web frameworks." },
                  contact_email: { type: "string", example: "careers@techalumni.com" }
                },
                required: ["title", "company"]
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
                  city: "Istanbul",
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
                example: { message: "Başlık (title) ve şirket (company) alanları zorunludur." }
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
                  city: "Istanbul",
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
                  title: { type: "string", maxLength: 120, example: "Senior Backend Developer" },
                  company: { type: "string", example: "Tech Alumni Corp" },
                  city: { type: "string", example: "Remote" },
                  location: { type: "string", example: "Remote" },
                  description: { type: "string", example: "Looking for a Senior Backend Developer with Node.js/MySQL experience." },
                  contact_email: { type: "string", example: "careers@techalumni.com" }
                },
                required: ["title", "company"]
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
                example: { message: "Başlık (title) ve şirket (company) alanları zorunludur." }
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
                  title: { type: "string", maxLength: 120, example: "Lead Backend Developer" },
                  company: { type: "string", example: "Tech Alumni Corp" },
                  city: { type: "string", example: "Ankara" },
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
    "/api/admin/summary": {
      get: {
        tags: ["Admin"],
        summary: "Admin dashboard summary counts",
        description: "Requires an authenticated session with auth_role = 'admin'. Returns aggregate counts for users, admins, announcements, job postings, and applications.",
        responses: {
          "200": {
            description: "Dashboard summary counts",
            content: {
              "application/json": {
                example: { success: true, data: { users: 9, admins: 1, announcements: 5, jobPostings: 7, applications: 1, pendingApplications: 1 } }
              }
            }
          },
          "401": { description: "Authentication required", content: { "application/json": { example: { success: false, message: "Unauthorized" } } } },
          "403": { description: "Administrator access required", content: { "application/json": { example: { success: false, message: "Forbidden: Administrator access required." } } } }
        }
      }
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users (Admin)",
        description: "Requires admin role. Never returns password_hash.",
        responses: {
          "200": {
            description: "User list returned",
            content: {
              "application/json": {
                example: { success: true, data: [{ id: 1, name: "Jane Doe", email: "jane@example.com", role: "alumni", auth_role: "user", department: "CS", graduation_year: 2022 }] }
              }
            }
          },
          "401": { description: "Authentication required" },
          "403": { description: "Administrator access required" }
        }
      },
      post: {
        tags: ["Admin"],
        summary: "Create user (Admin; single-admin limit enforced)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", maxLength: 255 },
                  email: { type: "string", format: "email", maxLength: 255 },
                  password: { type: "string", minLength: 8, maxLength: 128 },
                  role: { type: "string", enum: ["student", "alumni"], nullable: true },
                  auth_role: { type: "string", enum: ["user", "admin"], default: "user" },
                  department: { type: "string", maxLength: 150, nullable: true },
                  graduation_year: { type: "integer", minimum: 1950, nullable: true }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "User created", content: { "application/json": { example: { success: true, data: { id: 10, name: "New User", email: "new@example.com", role: "student", auth_role: "user" } } } } },
          "400": { description: "Validation failed", content: { "application/json": { example: { success: false, message: "Validation failed.", errors: { email: "Email is required." } } } } },
          "401": { description: "Authentication required" },
          "403": { description: "Administrator access required" },
          "409": { description: "Duplicate email or second admin rejected (single-admin policy)" }
        }
      }
    },
    "/api/admin/users/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get single user details (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "User found" },
          "400": { description: "Invalid user ID" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "User not found" }
        }
      },
      put: {
        tags: ["Admin"],
        summary: "Update user including optional password reset (Admin; single-admin guard enforced)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "auth_role"],
                properties: {
                  name: { type: "string", maxLength: 255 },
                  email: { type: "string", format: "email", maxLength: 255 },
                  password: { type: "string", minLength: 8, maxLength: 128 },
                  role: { type: "string", enum: ["student", "alumni"], nullable: true },
                  auth_role: { type: "string", enum: ["user", "admin"] },
                  department: { type: "string", maxLength: 150, nullable: true },
                  graduation_year: { type: "integer", minimum: 1950, nullable: true }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "User updated" },
          "400": { description: "Invalid ID or validation failed" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "User not found" },
          "409": { description: "Sole admin demotion, second admin creation, or duplicate email blocked" }
        }
      },
      patch: {
        tags: ["Admin"],
        summary: "Partially update user (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 255 },
                  email: { type: "string", format: "email", maxLength: 255 },
                  password: { type: "string", minLength: 8, maxLength: 128 },
                  role: { type: "string", enum: ["student", "alumni"], nullable: true },
                  auth_role: { type: "string", enum: ["user", "admin"] },
                  department: { type: "string", maxLength: 150, nullable: true },
                  graduation_year: { type: "integer", minimum: 1950, nullable: true }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "User updated" },
          "400": { description: "Invalid ID or validation failed" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "User not found" },
          "409": { description: "Conflict (sole admin demotion, single-admin violation, or duplicate email)" }
        }
      },
      delete: {
        tags: ["Admin"],
        summary: "Safely delete user (detaches applications, blocks sole admin deletion)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "User deleted", content: { "application/json": { example: { success: true, message: "User deleted successfully.", detachedApplicationsCount: 0 } } } },
          "400": { description: "Invalid user ID" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "User not found" },
          "409": { description: "Cannot delete the sole administrator account" }
        }
      }
    },
    "/api/admin/announcements": {
      get: {
        tags: ["Admin"],
        summary: "List announcements (Admin)",
        responses: { "200": { description: "Announcement list returned" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
      },
      post: {
        tags: ["Admin"],
        summary: "Create announcement (Admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content"],
                properties: {
                  title: { type: "string", maxLength: 255 },
                  content: { type: "string" }
                }
              }
            }
          }
        },
        responses: { "201": { description: "Announcement created" }, "400": { description: "Validation failed" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
      }
    },
    "/api/admin/announcements/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get announcement by ID (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Announcement found" }, "400": { description: "Invalid ID" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Not found" } }
      },
      put: {
        tags: ["Admin"],
        summary: "Update announcement (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content"],
                properties: {
                  title: { type: "string", maxLength: 255 },
                  content: { type: "string" }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Announcement updated" }, "400": { description: "Validation failed" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Not found" } }
      },
      patch: {
        tags: ["Admin"],
        summary: "Patch announcement (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", maxLength: 255 },
                  content: { type: "string" }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Announcement updated" }, "400": { description: "Validation failed" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Not found" } }
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete announcement (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Announcement deleted" }, "400": { description: "Invalid ID" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Not found" } }
      }
    },
    "/api/admin/job-postings": {
      get: {
        tags: ["Admin"],
        summary: "List job postings (Admin)",
        responses: { "200": { description: "Job postings list returned" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
      },
      post: {
        tags: ["Admin"],
        summary: "Create job posting (Admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "company"],
                properties: {
                  title: { type: "string", maxLength: 120 },
                  company: { type: "string", maxLength: 255 },
                  location: { type: "string", maxLength: 255, nullable: true },
                  description: { type: "string", nullable: true },
                  contact_email: { type: "string", format: "email", maxLength: 255, nullable: true },
                  user_id: { type: "integer", nullable: true }
                }
              }
            }
          }
        },
        responses: { "201": { description: "Job posting created" }, "400": { description: "Validation failed" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
      }
    },
    "/api/admin/job-postings/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get job posting by ID (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Job posting found" }, "400": { description: "Invalid ID" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Not found" } }
      },
      put: {
        tags: ["Admin"],
        summary: "Update job posting (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "company"],
                properties: {
                  title: { type: "string", maxLength: 120 },
                  company: { type: "string", maxLength: 255 },
                  location: { type: "string", maxLength: 255, nullable: true },
                  description: { type: "string", nullable: true },
                  contact_email: { type: "string", format: "email", maxLength: 255, nullable: true },
                  user_id: { type: "integer", nullable: true }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Job posting updated" }, "400": { description: "Validation failed" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Not found" } }
      },
      patch: {
        tags: ["Admin"],
        summary: "Patch job posting (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", maxLength: 120 },
                  company: { type: "string", maxLength: 255 },
                  location: { type: "string", maxLength: 255, nullable: true },
                  description: { type: "string", nullable: true },
                  contact_email: { type: "string", format: "email", maxLength: 255, nullable: true },
                  user_id: { type: "integer", nullable: true }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Job posting updated" }, "400": { description: "Validation failed" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Not found" } }
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete job posting (transactionally blocked if applications exist)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Deleted" }, "400": { description: "Invalid ID" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Not found" }, "409": { description: "Has dependent applications" } }
      }
    },
    "/api/admin/applications": {
      get: {
        tags: ["Admin"],
        summary: "List applications (Admin)",
        responses: { "200": { description: "Applications list returned" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
      },
      post: {
        tags: ["Admin"],
        summary: "Create application (Admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["job_posting_id", "applicant_name", "applicant_email"],
                properties: {
                  job_posting_id: { type: "integer" },
                  user_id: { type: "integer", nullable: true },
                  applicant_name: { type: "string", maxLength: 255 },
                  applicant_email: { type: "string", format: "email", maxLength: 255 },
                  status: { type: "string", enum: ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"], default: "PENDING" },
                  resume_url: { type: "string", format: "uri", maxLength: 255, nullable: true },
                  cover_letter: { type: "string", nullable: true }
                }
              }
            }
          }
        },
        responses: { "201": { description: "Application created" }, "400": { description: "Validation failed" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
      }
    },
    "/api/admin/applications/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get application by ID (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Application found" }, "400": { description: "Invalid ID" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Not found" } }
      },
      put: {
        tags: ["Admin"],
        summary: "Update application status or details (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["job_posting_id", "applicant_name", "applicant_email", "status"],
                properties: {
                  job_posting_id: { type: "integer" },
                  user_id: { type: "integer", nullable: true },
                  applicant_name: { type: "string", maxLength: 255 },
                  applicant_email: { type: "string", format: "email", maxLength: 255 },
                  status: { type: "string", enum: ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"] },
                  resume_url: { type: "string", format: "uri", maxLength: 255, nullable: true },
                  cover_letter: { type: "string", nullable: true }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Application updated" }, "400": { description: "Validation failed" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Not found" } }
      },
      patch: {
        tags: ["Admin"],
        summary: "Patch application (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  job_posting_id: { type: "integer" },
                  user_id: { type: "integer", nullable: true },
                  applicant_name: { type: "string", maxLength: 255 },
                  applicant_email: { type: "string", format: "email", maxLength: 255 },
                  status: { type: "string", enum: ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"] },
                  resume_url: { type: "string", format: "uri", maxLength: 255, nullable: true },
                  cover_letter: { type: "string", nullable: true }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Application updated" }, "400": { description: "Validation failed" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Not found" } }
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete application (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Application deleted" }, "400": { description: "Invalid ID" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Not found" } }
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

// 404 Guardian Middleware (Tanımsız rotaları yakalayan son katman)
app.use(notFoundMiddleware);

// 5xx Guardian Middleware (Merkezi hata yakalama katmanı)
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor: http://localhost:${PORT}`);
});

module.exports = app;
