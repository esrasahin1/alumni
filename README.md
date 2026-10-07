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
│   │   ├── models/           # Veri modelleri ve in-memory veri yönetimi
│   │   ├── routes/           # API ve web rota tanımlamaları
│   │   ├── views/            # HTML arayüz ve sayfa şablonları
│   │   └── app.js            # Express sunucusu, ara katmanlar ve Swagger konfigürasyonu
│   ├── package.json          # Proje bağımlılıkları ve script'ler
│   └── package-lock.json
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
├── controllers/
│   ├── alumniController.js
│   ├── userController.js
│   └── apiUserController.js
│
├── models/
│   └── userModel.js
│
├── routes/
│   ├── alumniRoutes.js
│   ├── userRoutes.js
│   └── apiUserRoutes.js
│
├── views/
│   ├── userView.js
│   └── apiUserView.js
│
└── app.js
```

#### Layer Responsibilities:
* **`controllers/`**: Receives incoming requests from the route layer, executes business logic, coordinates with the model layer, and returns formatted HTML views or JSON responses.
* **`models/`**: Manages the data layer, encapsulating data storage and direct CRUD manipulation functions.
* **`routes/`**: Defines HTTP route definitions (verbs and path patterns) and maps incoming requests to their respective controller handler functions.
* **`views/`**: Renders dynamic, accessible, and sanitized HTML templates for browser presentation.
* **`app.js`**: Serves as the central server entry point; configures global middleware (CORS, body parsers), mounts the route modules, sets up OpenAPI/Swagger UI documentation, and starts the HTTP listener.

---

### 2. Model Layer (`models/userModel.js`)

* **In-Memory Data Storage:**  
  User data is stored in server memory using a native JavaScript array (`users = []`). No external database connection (such as PostgreSQL, MySQL, or MongoDB) is currently used.
* **Provided CRUD Functions:**  
  The model exposes the following functions to manage user records:
  * **`getAllUsers()`**: Returns the full array of existing users.
  * **`getUserById(id)`**: Searches and returns a single user matching the numeric ID (or `null` if not found).
  * **`createUser(userData)`**: Assigns an auto-incrementing ID (`users.length + 1` if not provided) and appends the new user record to the array.
  * **`updateUser(id, userData, isPartial = false)`**: Replaces user details while preserving the unique user ID (full replacement for PUT, partial merge for PATCH).
  * **`patchUser(id, partialData)`**: Partially updates specific fields of a user without modifying untouched fields.
  * **`deleteUser(id)`**: Removes the user record with the specified ID from the array and returns a boolean success status.

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

---

### 6. MVC Request Flow

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
  userModel.js (In-Memory Array Operations)
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
  userModel.js (In-Memory Array Operations)
       │
       ▼
 JSON Response ({ id: 1, name: "...", email: "..." })
```

---

### 7. Current Architecture Assessment

* **Modular MVC Structure:** The application now fully follows a modular, decoupled MVC-style architecture for all User operations. Model, View, Controller, and Route responsibilities are cleanly isolated into dedicated files and directories.
* **Separation of Concerns in `app.js`:** User CRUD and data management logic no longer reside inside `app.js`. `app.js` now serves strictly as the application entry point responsible for:
  * Initializing the Express instance.
  * Registering global middleware (`cors`, `express.json`, `express.urlencoded`).
  * Mounting route modules (`app.use('/users', userRoutes)`, `app.use('/api/users', apiUserRoutes)`, `app.use('/alumni', alumniRoutes)`).
  * Configuring OpenAPI 3.0 specifications and serving Swagger UI (`/api/swagger`).
  * Starting the HTTP server on the configured port.
* **Database Readiness:** By encapsulating all data operations in `models/userModel.js`, the application is well-prepared to integrate persistent databases (e.g., PostgreSQL, MongoDB) or ORMs in future iterations without altering controller, route, or view implementations.

