# 🎓 Alumni Tracking System API

## 📖 Proje Açıklaması

Bu proje, **Web Programlama** dersi kapsamında geliştirilmekte olan bir **Mezun Takip Sistemi (Alumni Tracking System)** RESTful API uygulamasıdır. 

Sistem, mezunlar ve öğrenciler arasındaki iletişimi güçlendirmeyi, kariyer takibini kolaylaştırmayı ve kurumsal ağı desteklemeyi amaçlamaktadır. Proje mimarisi Node.js ve Express.js üzerine inşa edilmiş olup, modüler ve genişletilebilir bir yapıda tasarlanmıştır.

---

## 🛠️ Kullanılan Teknolojiler

* **Çalışma Ortamı:** Node.js
* **Web Framework:** Express.js
* **Dokümantasyon & Test Arayüzü:** Swagger UI (`swagger-ui-express` ve OpenAPI 3.0)
* **Veri Depolama:** In-Memory (Bellek İçi Dizi - Başlangıç aşaması)
* **Ara Katmanlar (Middleware):** CORS, Express JSON Parser

---

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

### 1. Bağımlılıkları Yükleyin

Terminalde `backend` dizinine geçin ve gerekli paketleri kurun:

```bash
cd backend
npm install
```

### 2. Sunucuyu Başlatın

Uygulamayı başlatmak için:

```bash
npm start
```

Sunucu varsayılan olarak **`http://localhost:3000`** adresinde çalışmaya başlar.

---

## 🔌 API Endpointleri

Projede aktif olarak bulunan tüm endpoint'ler ve durum kodları aşağıdaki tabloda listelenmiştir:

| HTTP Metodu | Endpoint | Açıklama | Başarılı Durum | Hata Durumu |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/health` | Sunucu sağlık ve aktiflik kontrolünü yapar | `200 OK` | - |
| **`GET`** | `/api/users` | Sistemdeki tüm kullanıcıları liste olarak döner | `200 OK` | - |
| **`POST`** | `/api/users` | Yeni bir kullanıcı kaydeder (Otomatik artan ID atar) | `201 Created` | - |
| **`GET`** | `/api/users/:id` | ID'si verilen belirli bir kullanıcının detaylarını getirir | `200 OK` | `404 Not Found` |
| **`PUT`** | `/api/users/:id` | Belirtilen kullanıcının tüm bilgilerini günceller (ID korunur) | `200 OK` | `404 Not Found` |
| **`PATCH`** | `/api/users/:id` | Belirtilen kullanıcının sadece gönderilen alanlarını günceller | `200 OK` | `404 Not Found` |
| **`DELETE`** | `/api/users/:id` | Belirtilen ID'ye sahip kullanıcıyı sistemden siler | `204 No Content` | `404 Not Found` |
| **`GET`** | `/api/swagger` | İnteraktif Swagger UI dokümantasyon ekranını sunar | `200 OK` | - |

---

## 📑 Swagger UI Dokümantasyonu

Projenin tüm API endpoint'leri interaktif Swagger UI arayüzü ile belgelenmiştir.

* **Swagger UI Adresi:** [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger)
* **Ham OpenAPI JSON:** [http://localhost:3000/api/swagger/doc.json](http://localhost:3000/api/swagger/doc.json)

### Swagger UI ile Canlı Test:
1. Tarayıcınızdan `http://localhost:3000/api/swagger` adresine gidin.
2. Test etmek istediğiniz endpoint'in üzerine tıklayın.
3. Sağ üstteki **"Try it out"** butonuna basın.
4. Gerekli parametre veya JSON gövdesini girdikten sonra **"Execute"** butonuna tıklayarak doğrudan canlı API yanıtını görüntüleyin.

---

## 📌 Geliştirme Kuralı

> ⚠️ **Önemli Kural:**
> Projeye yeni bir endpoint veya API özelliği eklendiğinde:
> 1. `backend/src/app.js` içerisindeki **Swagger/OpenAPI dokümantasyonu (`swaggerDocument`)** güncellenmelidir.
> 2. **README.md** dosyasındaki API tablosu ve ilgili açıklamalar güncellenmelidir.
> 
> Böylece dokümantasyon ve canlı sistem her zaman birbiriyle tam senkronize kalır.

---

## 📂 Proje Dizin Yapısı

```text
alumni/
├── backend/
│   ├── src/
│   │   ├── controllers/      # İstek kontrolcüleri ve iş mantığı
│   │   ├── routes/           # API rota tanımlamaları
│   │   └── app.js            # Express sunucusu, rotalar ve Swagger konfigürasyonu
│   ├── package.json          # Proje bağımlılıkları ve script'ler
│   └── package-lock.json
└── README.md                 # Proje dokümantasyonu ve API kılavuzu
```
