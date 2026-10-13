const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const alumniRoutes = require('./routes/alumniRoutes');
const userRoutes = require('./routes/userRoutes');
const apiUserRoutes = require('./routes/apiUserRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const apiAnnouncementRoutes = require('./routes/apiAnnouncementRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Ana Sayfa (GET /) - Temporary One Main Page
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Alumni Tracking System</title>
</head>
<body>
  <h1>Alumni Tracking System</h1>
  <p>Mezunlarımızı ve öğrencilerimizi bir araya getiren kariyer ve iletişim takip platformu.</p>
  <p><strong>Temporary One Main Page</strong></p>
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
