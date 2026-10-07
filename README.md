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

---

## 🏛️ MVC Architecture

This section documents the architectural structure of the **Alumni Tracking System** project for the course assignment (*"Document MVC architecture of your app and write it in README. Directories, folders, files"*).

> **Architectural Status:** This application is currently an early-stage REST API and **does not follow a fully decoupled classic MVC (Model-View-Controller) architecture**. Core responsibilities (routing, controller business logic, and in-memory data management) are largely co-located within `backend/src/app.js`.

---

### 1. Project Directory & File Structure

Below is the actual file and directory structure of the repository (excluding `node_modules` and `.git`):

```text
alumni/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── alumniController.js   # Alumni controller function
│   │   ├── routes/
│   │   │   └── alumniRoutes.js       # Alumni route definitions
│   │   └── app.js                    # Main server file, inline routes, inline handlers, and in-memory store
│   ├── package.json                  # Backend dependencies and scripts
│   └── package-lock.json             # Exact dependency lockfile
└── README.md                         # Project documentation
```

* **Actual directories present:** `backend/src/controllers`, `backend/src/routes`.
* **Missing MVC directories:** There is currently **no `models/` folder** and **no `views/` folder**.

---

### 2. Routes

Routes in this project are split between a dedicated route file and inline route handlers inside `app.js`:

#### A. Dedicated Route File (`backend/src/routes/alumniRoutes.js`)
Mounted in `app.js` using `app.use('/alumni', alumniRoutes)`:
* **`GET /alumni`** (defined as `router.get('/')` inside `alumniRoutes.js`): Delegates request handling directly to `alumniController.getAlumni`.

#### B. Direct Routes Defined in `backend/src/app.js`
The majority of endpoints are declared directly in `app.js` using Express application routing:

* **Static / Informational Endpoints:**
  * **`GET /`**: Serves a basic inline HTML page ("Temporary One Main Page").
  * **`GET /hello`**: Returns plain text `"Hello World!"`.
  * **`GET /hello/esra`**: Returns plain text `"Hello Esra"`.
  * **`GET /sum/:number1/:number2`**: Computes and returns the arithmetic sum of two route parameters.
  * **`GET /about`**: Serves an inline HTML page ("Temporary About Page").
  * **`GET /ok`**: Returns plain text `"ok"`.
  * **`GET /api/health` & `GET /health`**: Returns server health status JSON `{ "status": "ok" }`.

* **User CRUD API Endpoints:**
  * **`POST /api/users`**: Creates a new user with an auto-incremented ID and returns `201 Created`.
  * **`GET /api/users`**: Returns the list of all users in memory as JSON (`200 OK`).
  * **`GET /api/users/:id`**: Finds a user by ID; returns `200 OK` or `404 Not Found`.
  * **`PUT /api/users/:id`**: Replaces all user fields while preserving the ID; returns `200 OK` or `404 Not Found`.
  * **`PATCH /api/users/:id`**: Partially updates specific fields of a user; returns `200 OK` or `404 Not Found`.
  * **`DELETE /api/users/:id`**: Deletes a user by ID; returns `204 No Content` or `404 Not Found`.

* **Documentation Endpoints:**
  * **`GET /api/swagger/doc.json`**: Serves the raw OpenAPI 3.0 specification JSON object.
  * **`USE /api/swagger`**: Serves the interactive Swagger UI documentation.

---

### 3. Model (Data Layer)

* **Does a Model layer exist?**  
  **No.** There is no dedicated `models/` directory or model schema files (e.g., `userModel.js`) in the codebase.
* **Where and how data is stored:**  
  User data is stored directly in server memory using a plain JavaScript array inside `backend/src/app.js`:
  ```javascript
  const users = [];
  ```
* **Data Management:**  
  All CRUD operations are performed directly on this in-memory array using standard array methods (`push()`, `find()`, `findIndex()`, `splice()`) inside the callback functions of `app.js`.
* **Persistence:**  
  There is no persistent database (e.g., PostgreSQL, MongoDB, MySQL) and no ORM/ODM (e.g., Prisma, Sequelize, Mongoose). All data is stored in RAM and is reset when the server restarts.

---

### 4. Controller (Business Logic Layer)

* **Do controller files exist?**  
  **Partially.** A controller directory exists (`backend/src/controllers/`) containing:
  * `alumniController.js`: Defines `getAlumni` which returns HTTP 200 with `'OK'`.
* **Where request handling is implemented:**  
  For the primary data entity—the User CRUD endpoints (`/api/users`)—there is **no separate controller file** (e.g., no `userController.js`).  
  All request parsing (`req.body`, `req.params`), business logic, and HTTP response handling are written as inline callback functions directly in `backend/src/app.js`.

---

### 5. View (Presentation Layer)

* **Does a View layer exist?**  
  **No.** There is no dedicated `views/` directory, no server-side template engine configured (e.g., EJS, Pug, Handlebars), and no frontend framework folder.
* **Current Presentation Mechanism:**  
  * The application primarily acts as a **RESTful JSON API**, returning structured JSON data via `res.json()`.
  * Minimal HTML is served by two endpoints (`GET /` and `GET /about`), which return inline HTML string templates directly via `res.send()` with `Content-Type: text/html`.
  * An interactive visual interface is also provided by the Swagger UI middleware at `/api/swagger`.

---

### 6. MVC Request Flow

Because the project is not yet fully separated into traditional MVC layers, the request flow differs depending on the endpoint:

#### A. Modular Flow (`/alumni`)
This endpoint follows a decoupled Route-to-Controller structure:
```text
Client Request (GET /alumni)
       │
       ▼
Express App (app.js)
       │
       ▼
Router (backend/src/routes/alumniRoutes.js)
       │
       ▼
Controller (backend/src/controllers/alumniController.js -> getAlumni)
       │
       ▼
HTTP Response ("OK")
```

#### B. Inline Flow (`/api/users`)
This endpoint combines routing, controller logic, and data storage in `app.js`:
```text
Client Request (e.g., POST /api/users)
       │
       ▼
Express App (app.js) [Acts as Router]
       │
       ▼
Inline Handler in app.js [Acts as Controller]
       │
       ▼
In-Memory 'users' Array in app.js [Acts as Model / Data Store]
       │
       ▼
JSON Response (e.g., 201 Created with User JSON)
```

#### C. Inline View Flow (`GET /` and `GET /about`)
```text
Client Request (GET /)
       │
       ▼
Inline Handler in app.js
       │
       ▼
Inline HTML String Template [Acts as Minimal View]
       │
       ▼
HTML Response (text/html)
```

---

### 7. Architectural Assessment & Future Improvements

#### Current Architecture Assessment:
1. **High Coupling in `app.js`:** Currently, `app.js` handles multiple distinct responsibilities: Express app setup, middleware registration, route definitions, controller logic for users, in-memory data storage, and OpenAPI documentation schema.
2. **Emerging MVC Separation:** The creation of `alumniRoutes.js` and `alumniController.js` establishes the foundation for MVC separation, but it currently only applies to the `/alumni` route.

#### Future Separation (When Database is Introduced - Theoretical Plan):
To transform this into a clean, decoupled MVC architecture without changing application behavior:
* **Model Layer:** Create a `models/` folder (e.g., `models/userModel.js`) to define database schemas (e.g., PostgreSQL/MongoDB), handle database queries, and encapsulate data validation.
* **Controller Layer:** Create `controllers/userController.js` and move the inline handlers from `app.js` into modular methods (`getAllUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`).
* **Route Layer:** Create `routes/userRoutes.js` to map endpoints (`/api/users`) cleanly to their corresponding controller methods.
* **View Layer:** Keep the backend as a decoupled RESTful JSON API to serve a modern client frontend (e.g., React, Vue), or add a `views/` directory with a template engine if server-side rendering is desired.
* **Clean Entry Point:** `app.js` will then only be responsible for initializing middleware, mounting route modules (`app.use('/api/users', userRoutes)`), and starting the HTTP server.

