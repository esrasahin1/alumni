# 🎓 Alumni Tracking System API

## 📖 Proje Açıklaması

Bu proje, **Web Programlama** dersi kapsamında geliştirilmekte olan bir **Mezun Takip Sistemi (Alumni Tracking System)** RESTful API uygulamasıdır. 

Sistem, mezunlar ve öğrenciler arasındaki iletişimi güçlendirmeyi, kariyer takibini kolaylaştırmayı ve kurumsal ağı desteklemeyi amaçlamaktadır. Proje mimarisi Node.js ve Express.js üzerine inşa edilmiş olup, modüler ve genişletilebilir bir yapıda tasarlanmıştır.

---

## 🛠️ Kullanılan Teknolojiler

* **Çalışma Ortamı:** Node.js (v20+)
* **Web Framework:** Express.js (v4.19)
* **Dokümantasyon & Test Arayüzü:** Swagger UI (`swagger-ui-express` ve OpenAPI 3.0)
* **Veritabanı & Kalıcılık:** MySQL 8.0, `mysql2` (`mysql2/promise` Connection Pool), Docker Named Volume (`alumni_mysql_data`)
* **Migrasyon & Seeder:** Node.js tabanlı Migration Runner (`backend/src/database/migrate.js`) ve Idempotent Seeder (`backend/src/database/seed.js`)
* **Konteynerizasyon:** Docker, Docker Compose (Multi-container: `db` + `backend`)
* **Ara Katmanlar (Middleware):** CORS, Express JSON Parser, Express URL-Encoded Parser

---

## ⚙️ Kurulum ve Çalıştırma

Projeyi çalıştırmak için iki yöntem bulunmaktadır:

### Yöntem A: Docker Compose ile Tam Yığın (Önerilen)

Tüm yığını (MySQL 8.0 veritabanı ve Node.js backend servisi) tek bir komutla derleyip başlatmak için:

1. **Konteynerleri Başlatın:**
   ```bash
   docker compose up -d --build
   ```
2. **Migrasyon ve Seed İşlemlerini Çalıştırın:**
   ```bash
   docker compose exec backend npm run migrate
   docker compose exec backend npm run seed
   ```
3. Uygulama `http://localhost:3000` adresinde, Swagger UI ise `http://localhost:3000/api/swagger` adresinde yayına girer.

---

### Yöntem B: Yerel Geliştirme (Hibrit)

MySQL veritabanını Docker üzerinde, Node.js uygulamasını yerel terminalinizde çalıştırmak için:

#### 1. Bağımlılıkları Yükleyin

Terminalde `backend` dizinine geçin ve gerekli paketleri kurun:

```bash
cd backend
npm install
```

#### 2. Veritabanını Başlatın ve Migrasyonları Çalıştırın (Database Migration)

1. **MySQL Veritabanı Konteynerini Başlatın:**
   ```bash
   docker compose up -d db
   ```
2. **Migrasyonları Uygulayın:**
   ```bash
   cd backend
   npm run migrate
   ```
3. **Migrasyon Durumunu ve Tabloları Doğrulayın:**
   ```bash
   npm run migrate:status
   npm run migrate:verify
   ```
*(Geri alma işlemi için `npm run migrate:down` komutu kullanılabilir).*

#### 3. Örnek Verileri Yükleyin (Database Seeding)

Veritabanına test ve geliştirme amaçlı örnek kayıtları (`users`, `announcements`) güvenli ve tekrarlanabilir (idempotent) şekilde eklemek için:

```bash
cd backend
npm run seed
# veya alternatif olarak:
npm run db:seed
```
*(Tekrar çalıştırıldığında mevcut kayıtlar atlanır, yinelenen veri oluşmaz).*

#### 4. Sunucuyu Başlatın

Uygulamayı başlatmak için:

```bash
npm start
```

Sunucu varsayılan olarak **`http://localhost:3000`** adresinde çalışmaya başlar.

---

## 🖥️ Kullanıcı Arayüzü (Web UI) ve Sayfa Erişimleri

Sistem, tarayıcı üzerinden doğrudan kullanılabilen ve JavaScript gerektirmeyen temel CRUD işlemlerini destekleyen sunucu taraflı render (SSR - Server-Side Rendered) HTML yönetim arayüzlerine sahiptir.

### 🚀 Uygulamayı Başlatma ve Erişim

1. **Docker Compose ile (Önerilen):**
   ```bash
   docker compose up -d
   ```
2. **Yerel Node.js ile:**
   ```bash
   cd backend
   npm start
   ```

Sunucu ayağa kalktıktan sonra aşağıdaki web arayüzlerine tarayıcınızdan doğrudan erişebilirsiniz:

| Sayfa / Modül | URL Adresi | Desteklenen UI Eylemleri ve Açıklama |
| :--- | :--- | :--- |
| **Ana Portal Dashboard** | [http://localhost:3000/](http://localhost:3000/) | Kullanıcılar, Duyurular, İş İlanları, Başvurular ve Swagger dokümantasyonuna hızlı erişim sağlayan merkezi dashboard. |
| **Kullanıcı Yönetimi** | [http://localhost:3000/users](http://localhost:3000/users) | Tüm mezun ve öğrencileri listeleme, yeni kullanıcı oluşturma, detay görüntüleme, güncelleme ve silme. |
| **Duyuru Yönetimi** | [http://localhost:3000/announcements](http://localhost:3000/announcements) | Duyuru listesi, yeni duyuru yayınlama, detay inceleme, düzenleme ve silme. |
| **İş İlanları (Job Postings)** | [http://localhost:3000/job-postings](http://localhost:3000/job-postings) | Aktif iş ve staj ilanlarını listeleme, yeni ilan yayınlama, düzenleme ve silme. Tablo üzerinden doğrudan ilanın başvurularına erişim. |
| **İş İlanı Detay Sayfası** | [http://localhost:3000/job-postings/:id](http://localhost:3000/job-postings/1) | Seçilen iş ilanının tam açıklaması, iletişim bilgileri, **ilana ait başvuruları görüntüleme butonu**, **doğrudan bu ilana başvur butonu** ve ilanı silme aksiyonu. |
| **İlana Özel Başvurular (Nested)** | [http://localhost:3000/job-postings/:jobPostingId/applications](http://localhost:3000/job-postings/1/applications) | Belirli bir iş ilanına gelen başvuruların filtrelenmiş listesi ve sayfa altında o ilana ait otomatik doldurulan **hızlı başvuru formu (`#apply`)**. |
| **Tüm Başvurular (Applications)** | [http://localhost:3000/applications](http://localhost:3000/applications) | Sistemdeki tüm aday iş başvurularının genel listesi, iş ilanı bağlantıları, CV görüntüleme ve yeni başvuru formu. |
| **Başvuru Detay & Yönetim** | [http://localhost:3000/applications/:id](http://localhost:3000/applications/1) | Başvuru detayları, ön yazı, CV bağlantısı, **başvuru durumunu güncelleme kontrolü** (`PATCH`: `PENDING`, `REVIEWING`, `ACCEPTED`, `REJECTED`) ve **başvuruyu silme butonu** (`DELETE`). |
| **Swagger UI (REST API)** | [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger) | Tüm backend REST API uç noktalarını interaktif olarak inceleme ve canlı test etme arayüzü. |

---

## 🔌 API Endpointleri

Projede aktif olarak bulunan tüm endpoint'ler ve durum kodları aşağıdaki tabloda listelenmiştir:

| HTTP Metodu | Endpoint | Açıklama | Başarılı Durum | Hata Durumu |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/health` | Sunucu sağlık ve aktiflik kontrolünü yapar | `200 OK` | - |
| **`GET`** | `/users` | Kullanıcı listesi ve yönetim arayüzü (HTML View) | `200 OK` | - |
| **`POST`** | `/users` | Yeni bir kullanıcı ekler (HTML View) | `201 Created` | `409 Conflict` |
| **`GET`** | `/users/:id` | ID'si verilen kullanıcının detay sayfasını sunar (HTML View) | `200 OK` | `404 Not Found` |
| **`PUT`** | `/users/:id` | Kullanıcının tüm bilgilerini günceller (HTML / Fetch) | `200 OK` | `404 Not Found`, `409 Conflict` |
| **`PATCH`** | `/users/:id` | Kullanıcının alanlarını kısmi olarak günceller (HTML View) | `200 OK` | `404 Not Found`, `409 Conflict` |
| **`DELETE`** | `/users/:id` | Belirtilen kullanıcıyı sistemden siler (HTML View) | `200 OK` / `204 No Content` | `404 Not Found` |
| **`GET`** | `/api/users` | Sistemdeki tüm kullanıcıları liste olarak döner (JSON) | `200 OK` | - |
| **`POST`** | `/api/users` | Yeni bir kullanıcı kaydeder (Otomatik artan ID atar) | `201 Created` | `409 Conflict` |
| **`GET`** | `/api/users/:id` | ID'si verilen belirli bir kullanıcının detaylarını getirir | `200 OK` | `404 Not Found` |
| **`PUT`** | `/api/users/:id` | Belirtilen kullanıcının tüm bilgilerini günceller (ID korunur) | `200 OK` | `404 Not Found`, `409 Conflict` |
| **`PATCH`** | `/api/users/:id` | Belirtilen kullanıcının sadece gönderilen alanlarını günceller | `200 OK` | `404 Not Found` |
| **`DELETE`** | `/api/users/:id` | Belirtilen ID'ye sahip kullanıcıyı sistemden siler | `204 No Content` | `404 Not Found` |
| **`GET`** | `/announcements` | Duyuru listesi ve yönetim arayüzü (HTML View) | `200 OK` | - |
| **`POST`** | `/announcements` | Yeni bir duyuru ekler (HTML View) | `201 Created` | - |
| **`GET`** | `/announcements/:id` | ID'si verilen duyurunun detay sayfasını sunar (HTML View) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/announcements/:id` | Duyurunun tüm bilgilerini günceller (HTML / Fetch) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PATCH`** | `/announcements/:id` | Duyurunun alanlarını kısmi olarak günceller | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`DELETE`** | `/announcements/:id` | Belirtilen duyuruyu sistemden siler | `200 OK` / `204 No Content` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/api/announcements` | Sistemdeki tüm duyuruları JSON listesi olarak döner | `200 OK` | - |
| **`POST`** | `/api/announcements` | Yeni bir duyuru kaydeder (JSON) | `201 Created` | - |
| **`GET`** | `/api/announcements/:id` | ID'si verilen duyurunun detaylarını getirir (JSON) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/api/announcements/:id` | Duyurunun tüm bilgilerini günceller (ID korunur) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PATCH`** | `/api/announcements/:id` | Duyurunun alanlarını kısmi olarak günceller | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`DELETE`** | `/api/announcements/:id` | Belirtilen ID'ye sahip duyuruyu siler | `204 No Content` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/job-postings` | İş ilanları listesi ve yönetim arayüzü (HTML View) | `200 OK` | - |
| **`POST`** | `/job-postings` | Yeni bir iş ilanı ekler (HTML View) | `201 Created` | `400 Bad Request` |
| **`GET`** | `/job-postings/:id` | ID'si verilen iş ilanının detay sayfasını sunar (HTML View) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/job-postings/:id` | İş ilanının tüm bilgilerini günceller (HTML / Fetch) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PATCH`** | `/job-postings/:id` | İş ilanının alanlarını kısmi olarak günceller | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`DELETE`** | `/job-postings/:id` | Belirtilen iş ilanını sistemden siler | `200 OK` / `204 No Content` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/api/job-postings` | Sistemdeki tüm iş ilanlarını JSON listesi olarak döner | `200 OK` | - |
| **`POST`** | `/api/job-postings` | Yeni bir iş ilanı kaydeder (JSON) | `201 Created` | `400 Bad Request` |
| **`GET`** | `/api/job-postings/:id` | ID'si verilen iş ilanının detaylarını getirir (JSON) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/api/job-postings/:id` | İş ilanının tüm bilgilerini günceller (ID korunur) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PATCH`** | `/api/job-postings/:id` | İş ilanının alanlarını kısmi olarak günceller | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`DELETE`** | `/api/job-postings/:id` | Belirtilen ID'ye sahip iş ilanını siler | `204 No Content` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/applications` | Başvuru listesi ve yeni başvuru formu arayüzü (HTML View) | `200 OK` | - |
| **`POST`** | `/applications` | Yeni bir başvuru gönderir (HTML View) | `201 Created` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/applications/:id` | ID'si verilen başvurunun detay sayfasını sunar (HTML View) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/applications/:id` | Başvurunun tüm bilgilerini günceller (HTML / Fetch) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PATCH`** | `/applications/:id` | Başvurunun durum veya alanlarını kısmi olarak günceller | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`DELETE`** | `/applications/:id` | Belirtilen başvuruyu sistemden siler | `200 OK` / `204 No Content` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/job-postings/:jobPostingId/applications` | Belirli bir iş ilanına ait başvuruları listeler (HTML View) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`POST`** | `/job-postings/:jobPostingId/applications` | Belirli bir iş ilanına yeni başvuru oluşturur (HTML View) | `201 Created` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/api/applications` | Sistemdeki tüm başvuruları JSON listesi olarak döner | `200 OK` | - |
| **`POST`** | `/api/applications` | Yeni bir başvuru kaydeder (JSON) | `201 Created` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/api/applications/:id` | ID'si verilen başvurunun detaylarını getirir (JSON) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/api/applications/:id` | Başvurunun tüm bilgilerini günceller (JSON) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PATCH`** | `/api/applications/:id` | Başvuru durum veya alanlarını kısmi olarak günceller (JSON) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`DELETE`** | `/api/applications/:id` | Belirtilen ID'ye sahip başvuruyu siler | `204 No Content` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/api/job-postings/:jobPostingId/applications` | Belirli bir iş ilanına ait başvuruları JSON listesi olarak döner | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`POST`** | `/api/job-postings/:jobPostingId/applications` | Belirli bir iş ilanına JSON başvurusu oluşturur | `201 Created` | `400 Bad Request`, `404 Not Found` |
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
│   │   ├── config/           # Veritabanı bağlantı havuzu (db.js)
│   │   ├── controllers/      # İstek kontrolcüleri ve iş mantığı
│   │   ├── database/         # Migrasyonlar, tohumlayıcılar (seeders) ve factory'ler
│   │   │   ├── factories/    # Mock veri üreticileri (userFactory, announcementFactory)
│   │   │   ├── migrations/   # SQL/JS şema göç dosyaları (users, announcements)
│   │   │   ├── seeds/        # Tekrarlanabilir örnek veri tohumlayıcıları
│   │   │   ├── migrate.js    # Migrasyon CLI çalıştırıcısı
│   │   │   └── seed.js       # Seed CLI çalıştırıcısı
│   │   ├── models/           # MySQL 8.0 veri modelleri ve asenkron CRUD sorguları
│   │   ├── routes/           # API ve web rota tanımlamaları
│   │   ├── views/            # HTML arayüz ve sayfa şablonları
│   │   └── app.js            # Express sunucusu, ara katmanlar ve Swagger konfigürasyonu
│   ├── .dockerignore         # Docker derleme hariç tutma kuralları
│   ├── Dockerfile            # Backend Docker konteyner yapılandırması
│   ├── package.json          # Proje bağımlılıkları ve script'ler
│   └── package-lock.json
├── docker-compose.yml        # Multi-container mimari (MySQL 8.0 + Node.js Backend)
├── ddd.md                    # Veri Tasarım Dokümantasyonu (Data Design Documentation)
└── README.md                 # Proje dokümantasyonu ve API kılavuzu
```

---

## 🏛️ MVC Architecture

This section documents the architectural structure of the **Alumni Tracking System** project for the course assignment (*"Document MVC architecture of your app and write it in README. Directories, folders, files"*).

The project implements a decoupled, modular **MVC (Model-View-Controller)** architecture for its User management and Alumni tracking features. The responsibilities are clearly separated across dedicated directories under `backend/src/`.

---

### 1. Project Directory & File Structure

Below is the current directory and file layout of `backend/src/`:

```text
backend/src/
├── config/
│   └── db.js                 # Centralized MySQL connection pool (mysql2/promise)
├── controllers/
│   ├── alumniController.js
│   ├── announcementController.js
│   ├── apiAnnouncementController.js
│   ├── apiApplicationController.js
│   ├── apiJobPostingController.js
│   ├── apiUserController.js
│   ├── applicationController.js
│   ├── jobPostingController.js
│   └── userController.js
├── database/
│   ├── factories/
│   │   ├── announcementFactory.js
│   │   ├── jobPostingFactory.js
│   │   └── userFactory.js
│   ├── migrations/
│   │   ├── 001_create_users_table.js
│   │   ├── 002_create_announcements_table.js
│   │   ├── 003_create_job_postings_table.js
│   │   └── 004_create_applications_table.js
│   ├── seeds/
│   │   ├── 001_seed_users.js
│   │   ├── 002_seed_announcements.js
│   │   └── jobPostingSeeder.js
│   ├── migrate.js
│   └── seed.js
├── models/
│   ├── announcementModel.js
│   ├── applicationModel.js
│   ├── jobPostingModel.js
│   └── userModel.js
├── routes/
│   ├── alumniRoutes.js
│   ├── announcementRoutes.js
│   ├── apiAnnouncementRoutes.js
│   ├── apiApplicationRoutes.js
│   ├── apiJobPostingRoutes.js
│   ├── apiUserRoutes.js
│   ├── applicationRoutes.js
│   ├── jobPostingRoutes.js
│   └── userRoutes.js
├── views/
│   ├── announcementView.js
│   ├── apiUserView.js
│   ├── applicationView.js
│   ├── jobPostingView.js
│   └── userView.js
└── app.js
```

#### Layer Responsibilities:
* **`config/`**: Centralized MySQL connection pool configuration (`backend/src/config/db.js`) supporting environment variables, dynamic host resolution (`db` within Docker network or `localhost` on host), auto-reconnect, and health check validation.
* **`database/`**: Database lifecycle and schema management containing forward/rollback SQL migration scripts, realistic factory mock generators, and idempotent seed scripts.
* **`controllers/`**: Receives incoming requests from the route layer, executes business logic, coordinates with asynchronous models using `await`, handles validation and error reporting, and returns formatted HTML views or JSON responses.
* **`models/`**: Manages the data persistence layer, encapsulating asynchronous MySQL 8.0 queries via parameterized statements (`?`), returning structured records and promises to controllers.
* **`routes/`**: Defines HTTP route definitions (verbs and path patterns) and maps incoming requests to their respective controller handler functions.
* **`views/`**: Renders dynamic, accessible, and sanitized HTML templates for browser presentation using native JavaScript template literals.
* **`app.js`**: Serves as the central server entry point; configures global middleware (CORS, body parsers), mounts the route modules, sets up OpenAPI/Swagger UI documentation, and starts the HTTP listener.

---

### 2. Model Layer (`models/userModel.js`, `models/announcementModel.js`)

> 💡 **Data Design Documentation:** For exhaustive entity schemas, field specifications, constraints, and relational designs, refer to [`ddd.md`](ddd.md).

#### User Model (`models/userModel.js`):
* **MySQL Database Persistence:**  
  User data is stored persistently in the `users` table of the MySQL 8.0 relational database (`alumni_db`) using the shared connection pool via `mysql2/promise` (`backend/src/config/db.js`). In-memory storage is no longer used.
* **Table Schema & Constraints:**  
  * `id`: `INT AUTO_INCREMENT PRIMARY KEY`
  * `name`: `VARCHAR(255) NOT NULL`
  * `email`: `VARCHAR(255) NOT NULL UNIQUE` (enforced at the database engine level)
  * `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  * `updated_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
* **Security & Validation:**  
  All SQL queries utilize parameterized placeholders (`?`) to guarantee complete protection against SQL injection. Unique constraint violations (`ER_DUP_ENTRY`) are surfaced to the controller layer.
* **Provided Async CRUD Functions:**  
  The model exposes asynchronous functions returning promises to manage user records:
  * **`getAllUsers()`**: Queries `SELECT * FROM users ORDER BY id ASC` and returns all user records.
  * **`getUserById(id)`**: Queries `SELECT * FROM users WHERE id = ?` and returns the matching user record (or `null` if not found).
  * **`createUser(userData)`**: Inserts a new user record (`INSERT INTO users (name, email) VALUES (?, ?)`), returning the created user with its generated ID and timestamps.
  * **`updateUser(id, userData, isPartial = false)`**: Updates user fields (`UPDATE users SET name = ?, email = ? WHERE id = ?`), returning the updated user record or `null`.
  * **`patchUser(id, partialData)`**: Dynamically constructs a parameterized update query for only the provided fields (`name` and/or `email`), preserving untouched fields.
  * **`deleteUser(id)`**: Deletes the user record (`DELETE FROM users WHERE id = ?`) and returns a boolean success status (`true`/`false`).

#### Announcement Model (`models/announcementModel.js`):
* **MySQL Database Persistence:**  
  Announcement data is stored persistently in the `announcements` table of the MySQL 8.0 relational database (`alumni_db`) using the shared connection pool via `mysql2/promise` (`backend/src/config/db.js`). In-memory storage is no longer used.
* **Table Schema & Attributes:**  
  * `id`: `INT AUTO_INCREMENT PRIMARY KEY`
  * `title`: `VARCHAR(255) NOT NULL`
  * `content`: `TEXT NOT NULL`
  * `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  * `updated_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
* **Entity Independence:**  
  Announcements represent broadcast/departmental bulletins and are independent entities. There is **no `author_id`** or foreign key relationship between `announcements` and `users`.
* **Safe ID Handling & Parameterized Queries:**  
  Numeric IDs are safely cast (`Number(id)`); invalid or missing IDs return `null` gracefully without runtime exceptions. All operations use parameterized SQL queries (`?`).
* **Provided Async CRUD Functions:**  
  * **`getAllAnnouncements()`**: Queries `SELECT * FROM announcements ORDER BY id ASC` and returns all announcement records.
  * **`getAnnouncementById(id)`**: Queries `SELECT * FROM announcements WHERE id = ?` and returns the matching announcement (or `null` if not found or invalid).
  * **`createAnnouncement(announcementData)`**: Inserts a new announcement (`INSERT INTO announcements (title, content) VALUES (?, ?)`), returning the newly created record with generated ID and timestamps.
  * **`updateAnnouncement(id, announcementData, isPartial = false)`**: Replaces title and content (`UPDATE announcements SET title = ?, content = ? WHERE id = ?`), returning the updated record or `null`.
  * **`patchAnnouncement(id, partialData)`**: Dynamically updates only the specified fields (`title` and/or `content`), preserving untouched fields.
  * **`deleteAnnouncement(id)`**: Removes the announcement record (`DELETE FROM announcements WHERE id = ?`) and returns a boolean success status (`true`/`false`).

---

### 3. Controller Layer (`controllers/`)

The controller layer encapsulates application workflows and orchestrates communication between routes, models, and views:

* **`userController.js`:**
  * Handles requests sent to the **`/users`** route.
  * Implements all CRUD controller functions: `getUsers`, `getUser`, `createUser`, `updateUser`, `patchUser`, and `deleteUser`.
  * Integrates with [userView.js](file:///c:/Users/akema/Desktop/alumni/backend/src/views/userView.js) to return rich HTML view responses for browser users, with fallback JSON responses when explicitly requested via `Accept: application/json`.
* **`apiUserController.js`:**
  * Handles requests sent to the **`/api/users`** route.
  * Implements all CRUD controller functions: `getUsers`, `getUser`, `createUser`, `updateUser`, `patchUser`, and `deleteUser`.
  * Primarily focused on REST API clients, returning standard JSON responses with appropriate HTTP status codes (200, 201, 204, 404), while also supporting web view dashboards via [apiUserView.js](file:///c:/Users/akema/Desktop/alumni/backend/src/views/apiUserView.js).
* **`alumniController.js`:**
  * Handles requests for the alumni route (`GET /alumni`) and returns the base status response.
* **`announcementController.js`:**
  * Handles requests sent to the **`/announcements`** route for browser clients.
  * Implements all CRUD controller functions: `getAnnouncements`, `getAnnouncement`, `createAnnouncement`, `updateAnnouncement`, `patchAnnouncement`, and `deleteAnnouncement`.
  * Integrates with [announcementView.js](file:///c:/Users/akema/Desktop/alumni/backend/src/views/announcementView.js) to render dynamic HTML pages, while safely supporting JSON fallback responses when requested.
  * Validates IDs and returns HTTP `400` for invalid/missing IDs or `404` for not-found records.
* **`apiAnnouncementController.js`:**
  * Handles requests sent to the **`/api/announcements`** route for REST API clients.
  * Implements all CRUD controller functions: `getAnnouncements`, `getAnnouncement`, `createAnnouncement`, `updateAnnouncement`, `patchAnnouncement`, and `deleteAnnouncement`.
  * Returns standard JSON responses with appropriate HTTP status codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`).

---

### 4. Route Layer (`routes/`)

The route layer maps incoming HTTP methods and URL paths to their corresponding controller functions without containing inline business logic:

* **`userRoutes.js` (mounted at `/users`):**
  * `router.get('/', userController.getUsers)`
  * `router.post('/', userController.createUser)`
  * `router.get('/:id', userController.getUser)`
  * `router.put('/:id', userController.updateUser)`
  * `router.patch('/:id', userController.patchUser)`
  * `router.delete('/:id', userController.deleteUser)`
* **`apiUserRoutes.js` (mounted at `/api/users`):**
  * `router.get('/', apiUserController.getUsers)`
  * `router.post('/', apiUserController.createUser)`
  * `router.get('/:id', apiUserController.getUser)`
  * `router.put('/:id', apiUserController.updateUser)`
  * `router.patch('/:id', apiUserController.patchUser)`
  * `router.delete('/:id', apiUserController.deleteUser)`
* **`alumniRoutes.js` (mounted at `/alumni`):**
  * `router.get('/', alumniController.getAlumni)`
* **`announcementRoutes.js` (mounted at `/announcements`):**
  * `router.get('/', announcementController.getAnnouncements)`
  * `router.post('/', announcementController.createAnnouncement)`
  * `router.get('/:id', announcementController.getAnnouncement)`
  * `router.put('/:id', announcementController.updateAnnouncement)`
  * `router.patch('/:id', announcementController.patchAnnouncement)`
  * `router.delete('/:id', announcementController.deleteAnnouncement)`
* **`apiAnnouncementRoutes.js` (mounted at `/api/announcements`):**
  * `router.get('/', apiAnnouncementController.getAnnouncements)`
  * `router.post('/', apiAnnouncementController.createAnnouncement)`
  * `router.get('/:id', apiAnnouncementController.getAnnouncement)`
  * `router.put('/:id', apiAnnouncementController.updateAnnouncement)`
  * `router.patch('/:id', apiAnnouncementController.patchAnnouncement)`
  * `router.delete('/:id', apiAnnouncementController.deleteAnnouncement)`

Each router file cleanly delegates execution directly to its respective controller.

---

### 5. View Layer (`views/`)

The presentation layer is implemented through modular view rendering files using native JavaScript template literals. **No external template engine (such as EJS, Pug, or Handlebars) is used**, keeping the project lightweight and dependency-free:

* **`userView.js`:**
  * Generates the complete HTML interface for the `/users` endpoint.
  * Powers the interactive **User Management** screen with full CRUD support:
    * **Create**: "Create New User" section with Name and Email inputs and an "Add User" button (`POST /users`).
    * **Read (List)**: Structured user table with `ID`, `Name`, `Email`, and `Actions` columns.
    * **Read (Details)**: Dedicated user detail page displaying all information for a specific user (`GET /users/:id`).
    * **Update (Edit)**: In-page editing functionality that populates the form, transitions to "Edit User (#id)", and dispatches `PUT /users/:id` requests to `userController.updateUser`.
    * **Delete**: Delete button triggering confirmed `DELETE /users/:id` requests to `userController.deleteUser` and updating the user list.
  * Employs an internal `escapeHtml` function to sanitize user input against Cross-Site Scripting (XSS).
* **`apiUserView.js`:**
  * Provides complementary HTML view templates and dashboards for the `/api/users` endpoints.
* **`announcementView.js`:**
  * Generates the complete HTML interface for the `/announcements` endpoint.
  * Powers the interactive **Announcement Management** screen with full CRUD support:
    * **Create**: "Create New Announcement" section with Title input and Content textarea (`POST /announcements`).
    * **Read (List)**: Structured announcement table with `ID`, `Title`, `Content`, `Created Date`, and `Actions` columns.
    * **Read (Details)**: Dedicated announcement detail page (`GET /announcements/:id`).
    * **Update (Edit)**: In-page editing functionality and standalone edit support (`PUT /announcements/:id`).
    * **Delete**: Delete button triggering confirmed deletion requests (`DELETE /announcements/:id`).
  * Employs an internal `escapeHtml` function to sanitize user input against Cross-Site Scripting (XSS).

---

#### 6. MVC Request Flow

The application executes requests through decoupled, end-to-end MVC flows:

#### A. Web View Flow (`/users`)
```text
Client Request (Browser)
       │
       ▼
   app.js (Route Mounting & Middleware)
       │
       ▼
userRoutes.js (Endpoint Matching: GET, POST, PUT, DELETE)
       │
       ▼
userController.js (Request Parsing & Business Logic)
       │
       ▼
  userModel.js (MySQL Database via db.js Pool)
       │
       ▼
  userView.js (HTML Template Rendering & XSS Escaping)
       │
       ▼
 HTML Response (Rendered Page in Browser)
```

#### B. REST API Flow (`/api/users`)
```text
Client Request (API Client / Swagger)
       │
       ▼
   app.js (Route Mounting & Middleware)
       │
       ▼
apiUserRoutes.js (Endpoint Matching)
       │
       ▼
apiUserController.js (Request Parsing & Validation)
       │
       ▼
  userModel.js (MySQL Database via db.js Pool)
       │
       ▼
 JSON Response ({ id: 1, name: "...", email: "..." })
```

---

#### C. Announcement Web View Flow (`/announcements`)
```text
Client Request (Browser)
       │
       ▼
   app.js (Route Mounting & Middleware)
       │
       ▼
announcementRoutes.js (Endpoint Matching: GET, POST, PUT, DELETE)
       │
       ▼
announcementController.js (Request Parsing & Business Logic)
       │
       ▼
 announcementModel.js (MySQL Database via db.js Pool)
       │
       ▼
 announcementView.js (HTML Template Rendering & XSS Escaping)
       │
       ▼
 HTML Response (Rendered Page in Browser)
```

#### D. Announcement REST API Flow (`/api/announcements`)
```text
Client Request (API Client / Swagger)
       │
       ▼
   app.js (Route Mounting & Middleware)
       │
       ▼
apiAnnouncementRoutes.js (Endpoint Matching: GET, POST, PUT, DELETE)
       │
       ▼
apiAnnouncementController.js (Request Parsing & Validation)
       │
       ▼
 announcementModel.js (MySQL Database via db.js Pool)
       │
       ▼
 JSON Response ({ id: 1, title: "...", content: "...", createdAt: "..." })
```

---

### 7. Current Architecture Assessment

* **Modular MVC Structure:** The application fully follows a modular, decoupled MVC architecture for both User and Announcement operations. Model, View, Controller, and Route responsibilities are cleanly isolated into dedicated files and directories.
* **Separation of Concerns in `app.js`:** User and Announcement CRUD and data management logic no longer reside inside `app.js`. `app.js` serves strictly as the application entry point responsible for:
  * Initializing the Express instance.
  * Registering global middleware (`cors`, `express.json`, `express.urlencoded`).
  * Mounting route modules (`app.use('/users', userRoutes)`, `app.use('/api/users', apiUserRoutes)`, `app.use('/announcements', announcementRoutes)`, `app.use('/api/announcements', apiAnnouncementRoutes)`, `app.use('/alumni', alumniRoutes)`).
  * Configuring OpenAPI 3.0 specifications and serving Swagger UI (`/api/swagger`).
  * Starting the HTTP server on the configured port.
* **Database Persistence Achieved:** The transition from temporary in-memory arrays to persistent MySQL 8.0 relational database storage is complete. Both models query MySQL via parameterized prepared statements (`?`), all controller handlers asynchronously coordinate operations using `await`, and data persists across Docker container and server restarts via the named volume `mysql_data`.
* **Containerization & Reproducibility:** The complete stack is Dockerized via `docker-compose.yml` and `backend/Dockerfile`. The backend container waits for MySQL healthiness before booting, guaranteeing robust and reproducible deployments across development and production environments.

