const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const alumniRoutes = require('./routes/alumniRoutes');
const userRoutes = require('./routes/userRoutes');
const apiUserRoutes = require('./routes/apiUserRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
        summary: "Tüm kullanıcıları listeler",
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
        summary: "Yeni bir kullanıcı oluşturur",
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
        summary: "ID'ye göre kullanıcı getirir",
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
        summary: "Kullanıcı bilgilerini tamamen günceller",
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
        summary: "Kullanıcının belirtilen alanlarını kısmi olarak günceller",
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
        summary: "Kullanıcıyı siler",
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
    "/api/swagger": {
      get: {
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
