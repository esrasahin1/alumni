# 🎓 Alumni Tracking System API

## 📖 Project Description

This project is a RESTful API application for an **Alumni Tracking System**, developed as part of the **Web Programming** course curriculum.

The system aims to strengthen communication between alumni and students, streamline career tracking, and foster institutional networking. The project architecture is built on Node.js and Express.js, designed with a modular and extensible structure.

---

## 🛠️ Technologies Used

* **Runtime Environment:** Node.js (v20+)
* **Web Framework:** Express.js (v4.19)
* **Documentation & Testing Interface:** Swagger UI (`swagger-ui-express` and OpenAPI 3.0)
* **Database & Persistence:** MySQL 8.0, `mysql2` (`mysql2/promise` Connection Pool), Docker Named Volume (logical name in `docker-compose.yml`: `mysql_data`, physical name created based on the project name: `alumni_mysql_data`)
* **Migration & Seeder:** Node.js-based Migration Runner (`backend/src/database/migrate.js`) and Idempotent Seeder (`backend/src/database/seed.js`)
* **Containerization:** Docker, Docker Compose (Multi-container: `db` + `backend`)
* **Middleware:** CORS, Express JSON Parser, Express URL-Encoded Parser

---

## ⚙️ Installation & Running

There are two methods to run the project:

### Method A: Full Stack with Docker Compose (Recommended)

To build and start the entire stack (MySQL 8.0 database and Node.js backend service) with a single command:

1. **Start the Containers:**
   ```bash
   docker compose up -d --build
   ```
2. **Run Migrations and Seeders:**
   ```bash
   docker compose exec backend npm run migrate
   docker compose exec backend npm run seed
   ```
3. The application will be accessible at `http://localhost:3000`, and Swagger UI will be available at `http://localhost:3000/api/swagger`.

---

### Method B: Local Development (Hybrid)

To run the MySQL database in Docker and the Node.js application in your local terminal:

#### 1. Install Dependencies

Navigate to the `backend` directory in your terminal and install the required packages:

```bash
cd backend
npm install
```

#### 2. Start the Database and Run Migrations (Database Migration)

1. **Start the MySQL Database Container:**
   ```bash
   docker compose up -d db
   ```
2. **Apply Migrations:**
   ```bash
   cd backend
   npm run migrate
   ```
3. **Verify Migration Status and Tables:**
   ```bash
   npm run migrate:status
   npm run migrate:verify
   ```
*(The rollback operation can be performed using `npm run migrate:down`).*

#### 3. Load Sample Data (Database Seeding)

To insert sample records (`users`, `announcements`, `job_postings`) into the database for testing and development in a safe and idempotent manner:

```bash
cd backend
npm run seed
# or alternatively:
npm run db:seed
```
*(The seeder system executes the `userSeeder.js`, `announcementSeeder.js`, and `jobPostingSeeder.js` modules. When re-run, existing records are skipped, preventing duplicate data).*

#### 4. Start the Server

To start the application:

```bash
npm start
```

The server starts by default at **`http://localhost:3000`**.

#### 5. Run Tests (Automated Test Suite)

> ℹ️ **Important Prerequisite:** The test suite (`test_nested_route.js`) performs end-to-end verification by sending direct HTTP requests to the running backend server. Therefore, before running tests, the backend application **must already be running** (either via Docker container or via `cd backend && npm start` at `http://127.0.0.1:3000`).

To verify nested API route functionality (`GET & POST /api/users/:id/jobs`), parameter precedence, error states (400, 404), and Swagger compliance:

```bash
npm test
```
*(This command runs the `test_nested_route.js` test suite, automatically verifying 13 scenarios against the running server).*

---

## 🖥️ User Interface (Web UI) & Page Navigation

The system features server-side rendered (SSR) HTML management interfaces that can be used directly from the browser, supporting core CRUD operations without requiring client-side JavaScript.

### 🚀 Starting the Application and Access

1. **With Docker Compose (Recommended):**
   ```bash
   docker compose up -d
   ```
2. **With Local Node.js:**
   ```bash
   cd backend
   npm start
   ```

Once the server is running, you can access the following web interfaces directly in your browser:

| Page / Module | URL Address | Supported UI Actions & Description |
| :--- | :--- | :--- |
| **Main Portal Dashboard** | [http://localhost:3000/](http://localhost:3000/) | Central dashboard providing quick access to Users, Announcements, Job Postings, Applications, and Swagger documentation. |
| **User Management** | [http://localhost:3000/users](http://localhost:3000/users) | List all alumni and students, create new users, view details, update, and delete. |
| **User Details Page** | [http://localhost:3000/users/:id](http://localhost:3000/users/1) | Interface to view profile details, update, and delete the user specified by ID. |
| **User Job Postings (Nested API)** | [http://localhost:3000/api/users/:id/jobs](http://localhost:3000/api/users/1/jobs) | Lists job postings created by a specific user (JSON API). |
| **User Job Postings (Web)** | [http://localhost:3000/users/:id/jobs](http://localhost:3000/users/1/jobs) | Displays job postings created by a specific user (Web / JSON). |
| **Announcement Management** | [http://localhost:3000/announcements](http://localhost:3000/announcements) | List announcements, publish new announcements, view details, edit, and delete. |
| **Announcement Details Page** | [http://localhost:3000/announcements/:id](http://localhost:3000/announcements/1) | Interface to view title, content, and creation date details, edit, and delete the selected announcement. |
| **Job Postings** | [http://localhost:3000/job-postings](http://localhost:3000/job-postings) | List active jobs and internships, publish new postings, edit, and delete. Direct access to applications for a posting from the table. |
| **Job Posting Details Page** | [http://localhost:3000/job-postings/:id](http://localhost:3000/job-postings/1) | Full description of the selected job posting, contact details, view applications button ("📋 Bu İlanın Başvurularını Gör"), direct apply button ("✍️ Bu İlana Başvur"), navigation link ("← Tüm İlanlara Dön"), and delete action ("Bu İlanı Sil"). |
| **Job-Specific Applications (Nested)** | [http://localhost:3000/job-postings/:jobPostingId/applications](http://localhost:3000/job-postings/1/applications) | Filtered list of applications received for a specific job posting, with quick application form ("➕ Yeni Başvuru Gönder", `#apply`) auto-filled at the bottom of the page. |
| **All Applications** | [http://localhost:3000/applications](http://localhost:3000/applications) | Overview list of all candidate job applications in the system, job posting links, resume links, and application submission form ("➕ Yeni Başvuru Gönder"). |
| **Application Details & Management** | [http://localhost:3000/applications/:id](http://localhost:3000/applications/1) | Application details, cover letter, resume link, status update control ("⚙️ Başvuru Durumunu Güncelle (PATCH)" with options `PENDING`, `REVIEWING`, `ACCEPTED`, `REJECTED` and "Durumu Kaydet" button), and delete button ("🗑️ Başvuruyu Sil"). |
| **Swagger UI (REST API)** | [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger) | Interactive interface to inspect and test all backend REST API endpoints live. |

---

## 🔌 API Endpoints

All active endpoints and status codes available in the project are listed in the table below:

| HTTP Method | Endpoint | Description | Success Status | Error Status |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/health` | Performs server health and activity check (JSON: `{ status: "ok" }`) | `200 OK` | - |
| **`GET`** | `/health` | Alternative server health check endpoint | `200 OK` | - |
| **`GET`** | `/alumni` | Returns alumni base status information response | `200 OK` | - |
| **`GET`** | `/users` | User list and management interface (HTML View) | `200 OK` | - |
| **`POST`** | `/users` | Adds a new user (HTML View) | `201 Created` | `409 Conflict` |
| **`GET`** | `/users/:id` | Renders detail page for user specified by ID (HTML View) | `200 OK` | `404 Not Found` |
| **`GET`** | `/users/:id/jobs` | Lists job postings created by a specific user (HTML / JSON) | `200 OK` | `404 Not Found` |
| **`PUT`** | `/users/:id` | Updates all user information (HTML / Fetch) | `200 OK` | `404 Not Found`, `409 Conflict` |
| **`PATCH`** | `/users/:id` | Partially updates user fields (HTML View) | `200 OK` | `404 Not Found`, `409 Conflict` |
| **`DELETE`** | `/users/:id` | Deletes the specified user from the system (HTML View) | `200 OK` / `204 No Content` | `404 Not Found` |
| **`GET`** | `/api/users` | Returns all users in the system as a list (JSON) | `200 OK` | - |
| **`POST`** | `/api/users` | Registers a new user (Assigns auto-incrementing ID) | `201 Created` | `409 Conflict` |
| **`GET`** | `/api/users/:id` | Retrieves details of a specific user specified by ID | `200 OK` | `404 Not Found` |
| **`GET`** | `/api/users/:id/jobs` | Lists job postings created by a specific user (Nested Route) | `200 OK` | `404 Not Found` |
| **`POST`** | `/api/users/:id/jobs` | Creates a new job posting on behalf of a specific user (Nested Route) | `201 Created` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/api/users/:id` | Updates all information of the specified user (ID preserved) | `200 OK` | `404 Not Found`, `409 Conflict` |
| **`PATCH`** | `/api/users/:id` | Partially updates only the submitted fields of the specified user | `200 OK` | `404 Not Found` |
| **`DELETE`** | `/api/users/:id` | Deletes the user with the specified ID from the system | `204 No Content` | `404 Not Found` |
| **`GET`** | `/announcements` | Announcement list and management interface (HTML View) | `200 OK` | - |
| **`POST`** | `/announcements` | Adds a new announcement (HTML View) | `201 Created` | - |
| **`GET`** | `/announcements/:id` | Renders detail page for announcement specified by ID (HTML View) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/announcements/:id` | Updates all information of the announcement (HTML / Fetch) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PATCH`** | `/announcements/:id` | Partially updates fields of the announcement | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`DELETE`** | `/announcements/:id` | Deletes the specified announcement from the system | `200 OK` / `204 No Content` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/api/announcements` | Returns all announcements in the system as a JSON list | `200 OK` | - |
| **`POST`** | `/api/announcements` | Registers a new announcement (JSON) | `201 Created` | - |
| **`GET`** | `/api/announcements/:id` | Retrieves details of the announcement specified by ID (JSON) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/api/announcements/:id` | Updates all information of the announcement (ID preserved) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PATCH`** | `/api/announcements/:id` | Partially updates fields of the announcement | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`DELETE`** | `/api/announcements/:id` | Deletes the announcement with the specified ID | `204 No Content` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/job-postings` | Job postings list and management interface (HTML View) | `200 OK` | - |
| **`POST`** | `/job-postings` | Adds a new job posting (HTML View) | `201 Created` | `400 Bad Request` |
| **`GET`** | `/job-postings/:id` | Renders detail page for job posting specified by ID (HTML View) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/job-postings/:id` | Updates all information of the job posting (HTML / Fetch) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PATCH`** | `/job-postings/:id` | Partially updates fields of the job posting | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`DELETE`** | `/job-postings/:id` | Deletes the specified job posting from the system | `200 OK` / `204 No Content` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/api/job-postings` | Returns all job postings in the system as a JSON list | `200 OK` | - |
| **`POST`** | `/api/job-postings` | Registers a new job posting (JSON) | `201 Created` | `400 Bad Request` |
| **`GET`** | `/api/job-postings/:id` | Retrieves details of the job posting specified by ID (JSON) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/api/job-postings/:id` | Updates all information of the job posting (ID preserved) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PATCH`** | `/api/job-postings/:id` | Partially updates fields of the job posting | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`DELETE`** | `/api/job-postings/:id` | Deletes the job posting with the specified ID | `204 No Content` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/applications` | Application list and new application form interface (HTML View) | `200 OK` | - |
| **`POST`** | `/applications` | Submits a new application (HTML View) | `201 Created` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/applications/:id` | Renders detail page for application specified by ID (HTML View) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/applications/:id` | Updates all information of the application (HTML / Fetch) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PATCH`** | `/applications/:id` | Partially updates status or fields of the application | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`DELETE`** | `/applications/:id` | Deletes the specified application from the system | `200 OK` / `204 No Content` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/job-postings/:jobPostingId/applications` | Lists applications for a specific job posting (HTML View) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`POST`** | `/job-postings/:jobPostingId/applications` | Creates a new application for a specific job posting (HTML View) | `201 Created` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/api/applications` | Returns all applications in the system as a JSON list | `200 OK` | - |
| **`POST`** | `/api/applications` | Registers a new application (JSON) | `201 Created` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/api/applications/:id` | Retrieves details of the application specified by ID (JSON) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PUT`** | `/api/applications/:id` | Updates all information of the application (JSON) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`PATCH`** | `/api/applications/:id` | Partially updates status or fields of the application (JSON) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`DELETE`** | `/api/applications/:id` | Deletes the application with the specified ID | `204 No Content` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/api/job-postings/:jobPostingId/applications` | Returns applications for a specific job posting as a JSON list | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **`POST`** | `/api/job-postings/:jobPostingId/applications` | Creates a JSON application for a specific job posting | `201 Created` | `400 Bad Request`, `404 Not Found` |
| **`GET`** | `/api/swagger` | Serves interactive Swagger UI documentation interface | `200 OK` | - |
| **`GET`** | `/api/swagger/doc.json` | Returns raw OpenAPI 3.0 JSON documentation | `200 OK` | - |

---

## 📑 Swagger UI Documentation

All API endpoints of the project are documented with an interactive Swagger UI interface.

* **Swagger UI Address:** [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger)
* **Raw OpenAPI JSON:** [http://localhost:3000/api/swagger/doc.json](http://localhost:3000/api/swagger/doc.json)

### Live Testing with Swagger UI:
1. Navigate to `http://localhost:3000/api/swagger` in your browser.
2. Click on the endpoint you want to test.
3. Click the **"Try it out"** button in the upper right.
4. After entering the required parameters or JSON request body, click the **"Execute"** button to view the live API response directly.

---

## 📌 Development Rule

> ⚠️ **Important Rule:**
> When adding a new endpoint or API feature to the project:
> 1. The **Swagger/OpenAPI documentation (`swaggerDocument`)** in `backend/src/app.js` must be updated.
> 2. The API table and related descriptions in **README.md** must be updated.
> 
> This ensures that the documentation and the live system always remain fully synchronized.

---

## 📂 Project Directory Structure

```text
alumni/
├── backend/
│   ├── src/
│   │   ├── config/           # Database connection pool (db.js)
│   │   ├── controllers/      # Request controllers and business logic
│   │   ├── database/         # Migrations, seeders, and factories
│   │   │   ├── factories/    # Mock data generators (userFactory, announcementFactory, jobPostingFactory)
│   │   │   ├── migrations/   # SQL/JS schema migration files (users, announcements, job_postings, applications, user_id FK)
│   │   │   ├── seeds/        # Idempotent sample data seeders (users, announcements, job_postings)
│   │   │   ├── migrate.js    # Migration CLI runner
│   │   │   └── seed.js       # Seed CLI runner
│   │   ├── models/           # MySQL 8.0 data models and asynchronous CRUD queries
│   │   ├── routes/           # API and web route definitions
│   │   ├── views/            # HTML UI and page templates
│   │   └── app.js            # Express server, middleware, and Swagger configuration
│   ├── test_nested_route.js  # Nested API route test suite (GET & POST /api/users/:id/jobs)
│   ├── .dockerignore         # Docker build ignore rules
│   ├── Dockerfile            # Backend Docker container configuration
│   ├── package.json          # Project dependencies and scripts
│   └── package-lock.json
├── docker-compose.yml        # Multi-container architecture (MySQL 8.0 + Node.js Backend)
├── ddd.md                    # Data Design Documentation
└── README.md                 # Project documentation and API guide
```

---

## 🏛️ MVC Architecture

This section documents the architectural structure of the **Alumni Tracking System** project for the course assignment (*"Document MVC architecture of your app and write it in README. Directories, folders, files"*).

The project implements a decoupled, modular **MVC (Model-View-Controller)** architecture across four core domain models: **User Management**, **Announcements**, **Job Postings**, and **Applications**. The responsibilities are clearly separated across dedicated directories under `backend/src/`.

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
│   │   ├── 001_create_users_table.sql
│   │   ├── 002_create_announcements_table.js
│   │   ├── 002_create_announcements_table.sql
│   │   ├── 003_create_job_postings_table.js
│   │   ├── 003_create_job_postings_table.sql
│   │   ├── 004_create_applications_table.js
│   │   ├── 004_create_applications_table.sql
│   │   ├── 005_add_user_id_to_job_postings.js
│   │   └── 005_add_user_id_to_job_postings.sql
│   ├── seeds/
│   │   ├── announcementSeeder.js
│   │   ├── jobPostingSeeder.js
│   │   └── userSeeder.js
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

### 2. Model Layer (`models/userModel.js`, `models/announcementModel.js`, `models/jobPostingModel.js`, `models/applicationModel.js`)

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

#### Job Posting Model (`models/jobPostingModel.js`):
* **MySQL Database Persistence:**
  Job posting data is persistently stored in the `job_postings` table of the MySQL 8.0 relational database (`alumni_db`) using the connection pool via `mysql2/promise` (`backend/src/config/db.js`).
* **Table Schema & Attributes:**
  * `id`: `INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`
  * `user_id`: `INT UNSIGNED NULL` (Foreign key referencing `users(id)` with `ON DELETE SET NULL ON UPDATE CASCADE`. Identifies the user who created the job posting; `NULL` for legacy or unassigned postings)
  * `title`: `VARCHAR(255) NOT NULL`
  * `company`: `VARCHAR(255) NOT NULL`
  * `location`: `VARCHAR(255) NULL`
  * `description`: `TEXT NOT NULL`
  * `contact_email`: `VARCHAR(255) NULL`
  * `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  * `updated_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
* **Normalization & Safe Parameterization:**
  Provides `formatJobPosting(row)` to normalize row structures into consistent formats (including `user_id`, `userId`, `createdAt`, and `createdDate` ISO strings). All SQL queries strictly use parameterized placeholders (`?`). Invalid, non-numeric, or missing IDs return `null` or `false` without runtime exceptions.
* **Provided Async CRUD Functions:**
  * **`getAllJobPostings()`**: Queries `SELECT id, user_id, title, company, location, description, contact_email, created_at, updated_at FROM job_postings ORDER BY id ASC` and returns all normalized job posting objects.
  * **`getJobPostingById(id)`**: Queries `SELECT ... FROM job_postings WHERE id = ? LIMIT 1` and returns the matching job posting or `null`.
  * **`getJobPostingsByUserId(userId)`**: First verifies that the target user exists in `users` (`SELECT id, name, email FROM users WHERE id = ? LIMIT 1`). If the user does not exist, returns `null` (enabling 404 response). If the user exists, returns an array of job postings where `user_id = ?` (ordered by `id ASC`).
  * **`getJobPostingsByContactEmail(email)`**: Queries `SELECT ... FROM job_postings WHERE contact_email = ? ORDER BY id ASC` and returns all matching job postings.
  * **`createJobPosting(jobPostingData)`**: Inserts a new job posting (`INSERT INTO job_postings (user_id, title, company, location, description, contact_email) VALUES (?, ?, ?, ?, ?, ?)`) and returns the newly created record with generated ID and timestamps.
  * **`updateJobPosting(id, jobPostingData, isPartial = false)`**: Replaces all fields (`UPDATE job_postings SET user_id = ?, title = ?, company = ?, location = ?, description = ?, contact_email = ? WHERE id = ?`), returning the updated record or `null`.
  * **`patchJobPosting(id, partialData)`**: Calls `updateJobPosting(id, partialData, true)` to partially update only the provided fields, keeping existing fields intact.
  * **`deleteJobPosting(id)`**: Removes the job posting record (`DELETE FROM job_postings WHERE id = ?`) and returns a boolean success flag (`true`/`false`).

#### Application Model (`models/applicationModel.js`):
* **MySQL Database Persistence & Application-Level References:**
  Application data is stored persistently in the `applications` table of MySQL 8.0 (`alumni_db`). In alignment with the decoupled architecture documented in `ddd.md`:
  * Migration files do not define database-level `FOREIGN KEY ... REFERENCES` constraints.
  * Relational integrity is validated and maintained directly at the application and controller level (`applicationController.js` and `apiApplicationController.js` verify that `job_posting_id` exists in `job_postings` before creation or update).
  * `job_posting_id` is an `INT UNSIGNED NOT NULL` column referencing the target job posting.
  * `user_id` is an `INT UNSIGNED NULL` column referencing an optional registered user (nullable to permit guest/unauthenticated candidate submissions without active session dependencies).
* **Table Schema & Attributes:**
  * `id`: `INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`
  * `job_posting_id`: `INT UNSIGNED NOT NULL` (Target job posting reference, validated at controller level)
  * `user_id`: `INT UNSIGNED NULL` (Optional registered user reference, nullable for guest applicants)
  * `applicant_name`: `VARCHAR(255) NOT NULL`
  * `applicant_email`: `VARCHAR(255) NOT NULL`
  * `resume_url`: `VARCHAR(255) NULL`
  * `cover_letter`: `TEXT NULL`
  * `status`: `VARCHAR(50) NOT NULL DEFAULT 'PENDING'` (Supports standard statuses: `PENDING`, `REVIEWING`, `ACCEPTED`, `REJECTED`)
  * `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  * `updated_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
* **Normalization & Dual Naming Support:**
  `formatApplication(row)` returns normalized records with support for both snake_case and camelCase field access (e.g., `job_posting_id` and `jobPostingId`, `applicant_name` and `applicantName`, `resume_url` and `resumeUrl`). All database queries use parameterized placeholders (`?`).
* **Provided Async CRUD Functions:**
  * **`getAllApplications()`**: Queries `SELECT id, job_posting_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at FROM applications ORDER BY id ASC` and returns all application records.
  * **`getApplicationById(id)`**: Queries `SELECT ... FROM applications WHERE id = ? LIMIT 1` and returns the matching application or `null`.
  * **`getApplicationsByJobPostingId(jobPostingId)`**: Queries `SELECT ... FROM applications WHERE job_posting_id = ? ORDER BY id ASC` to retrieve all applications submitted for a specific job posting.
  * **`createApplication(applicationData)`**: Inserts a new application record (`INSERT INTO applications (...) VALUES (?, ?, ?, ?, ?, ?, ?)`), automatically defaulting `status` to `'PENDING'` if not specified, and returns the created application.
  * **`updateApplication(id, applicationData, isPartial = false)`**: Replaces application fields via `UPDATE applications SET ... WHERE id = ?`.
  * **`patchApplication(id, partialData)`**: Executes partial updates (particularly useful for changing the application `status` to `REVIEWING`, `ACCEPTED`, or `REJECTED`).
  * **`deleteApplication(id)`**: Deletes the application record (`DELETE FROM applications WHERE id = ?`) and returns a boolean success status (`true`/`false`).

---

### 3. Controller Layer (`controllers/`)

The controller layer encapsulates application workflows and orchestrates communication between routes, models, and views:

* **`userController.js`:**
  * Handles requests sent to the **`/users`** route and nested user job route.
  * Implements controller functions: `getUsers`, `getUser`, `getUserJobs`, `createUser`, `updateUser`, `patchUser`, and `deleteUser`.
  * Integrates with [userView.js](file:///c:/Users/akema/Desktop/alumni/backend/src/views/userView.js) to return rich HTML view responses for browser users, with fallback JSON responses when explicitly requested via `Accept: application/json`.
* **`apiUserController.js`:**
  * Handles requests sent to the **`/api/users`** route and nested user job routes.
  * Implements REST API controller functions: `getUsers`, `getUser`, `getUserJobs`, `createUserJob`, `createUser`, `updateUser`, `patchUser`, and `deleteUser`.
  * Primarily focused on REST API clients, returning standard JSON responses with appropriate HTTP status codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`), while also supporting web view dashboards via [apiUserView.js](file:///c:/Users/akema/Desktop/alumni/backend/src/views/apiUserView.js).
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
* **`jobPostingController.js`:**
  * Handles requests sent to the **`/job-postings`** route for browser clients.
  * Implements all CRUD controller functions: `getJobPostings`, `getJobPosting`, `createJobPosting`, `updateJobPosting`, `patchJobPosting`, and `deleteJobPosting`.
  * Integrates with [jobPostingView.js](file:///c:/Users/akema/Desktop/alumni/backend/src/views/jobPostingView.js) to render dynamic HTML pages, supporting JSON fallback when requested.
  * Validates IDs and returns HTTP `400` for invalid/missing IDs or `404` for not-found records.
* **`apiJobPostingController.js`:**
  * Handles requests sent to the **`/api/job-postings`** route for REST API clients.
  * Implements all CRUD controller functions: `getJobPostings`, `getJobPosting`, `createJobPosting`, `updateJobPosting`, `patchJobPosting`, and `deleteJobPosting`.
  * Returns standard JSON responses with appropriate HTTP status codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`).
* **`applicationController.js`:**
  * Handles requests sent to **`/applications`** and nested **`/job-postings/:jobPostingId/applications`** routes for browser clients.
  * Implements CRUD and nested controller functions: `getApplications`, `getApplication`, `createApplication`, `updateApplication`, `patchApplication`, `deleteApplication`, `getApplicationsByJobPosting`, and `createApplicationForJobPosting`.
  * Integrates with [applicationView.js](file:///c:/Users/akema/Desktop/alumni/backend/src/views/applicationView.js) to render global application lists, nested job application views with parent job header context, and dedicated detail pages with in-place status modification (`PATCH /applications/:id`).
  * Validates ID parameters and guarantees consistency between route parameters (`:jobPostingId`) and payload data.
* **`apiApplicationController.js`:**
  * Handles requests sent to **`/api/applications`** and nested **`/api/job-postings/:jobPostingId/applications`** routes for REST API clients.
  * Implements CRUD and nested controller functions: `getApplications`, `getApplication`, `createApplication`, `updateApplication`, `patchApplication`, `deleteApplication`, `getApplicationsByJobPosting`, and `createApplicationForJobPosting`.
  * Returns standard JSON responses with appropriate HTTP status codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`).

---

### 4. Route Layer (`routes/`)

The route layer maps incoming HTTP methods and URL paths to their corresponding controller functions without containing inline business logic:

* **`userRoutes.js` (mounted at `/users`):**
  * `router.get('/', userController.getUsers)`
  * `router.post('/', userController.createUser)`
  * `router.get('/:id/jobs', userController.getUserJobs)`
  * `router.get('/:id', userController.getUser)`
  * `router.put('/:id', userController.updateUser)`
  * `router.patch('/:id', userController.patchUser)`
  * `router.delete('/:id', userController.deleteUser)`
* **`apiUserRoutes.js` (mounted at `/api/users`):**
  * `router.get('/', apiUserController.getUsers)`
  * `router.post('/', apiUserController.createUser)`
  * `router.get('/:id/jobs', apiUserController.getUserJobs)`
  * `router.post('/:id/jobs', apiUserController.createUserJob)`
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
* **`jobPostingRoutes.js` (mounted at `/job-postings`):**
  * `router.get('/', jobPostingController.getJobPostings)`
  * `router.post('/', jobPostingController.createJobPosting)`
  * `router.get('/:id', jobPostingController.getJobPosting)`
  * `router.put('/:id', jobPostingController.updateJobPosting)`
  * `router.patch('/:id', jobPostingController.patchJobPosting)`
  * `router.delete('/:id', jobPostingController.deleteJobPosting)`
* **`apiJobPostingRoutes.js` (mounted at `/api/job-postings`):**
  * `router.get('/', apiJobPostingController.getJobPostings)`
  * `router.post('/', apiJobPostingController.createJobPosting)`
  * `router.get('/:id', apiJobPostingController.getJobPosting)`
  * `router.put('/:id', apiJobPostingController.updateJobPosting)`
  * `router.patch('/:id', apiJobPostingController.patchJobPosting)`
  * `router.delete('/:id', apiJobPostingController.deleteJobPosting)`
* **`applicationRoutes.js` (mounted at `/applications`, uses `{ mergeParams: true }`):**
  * `router.get('/', applicationController.getApplications)`
  * `router.post('/', applicationController.createApplication)`
  * `router.get('/:id', applicationController.getApplication)`
  * `router.put('/:id', applicationController.updateApplication)`
  * `router.patch('/:id', applicationController.patchApplication)`
  * `router.delete('/:id', applicationController.deleteApplication)`
* **`apiApplicationRoutes.js` (mounted at `/api/applications`, uses `{ mergeParams: true }`):**
  * `router.get('/', apiApplicationController.getApplications)`
  * `router.post('/', apiApplicationController.createApplication)`
  * `router.get('/:id', apiApplicationController.getApplication)`
  * `router.put('/:id', apiApplicationController.updateApplication)`
  * `router.patch('/:id', apiApplicationController.patchApplication)`
  * `router.delete('/:id', apiApplicationController.deleteApplication)`
* **Nested Route Bindings in `app.js`:**
  * `app.get('/job-postings/:jobPostingId/applications', applicationController.getApplicationsByJobPosting)`
  * `app.post('/job-postings/:jobPostingId/applications', applicationController.createApplicationForJobPosting)`
  * `app.get('/api/job-postings/:jobPostingId/applications', apiApplicationController.getApplicationsByJobPosting)`
  * `app.post('/api/job-postings/:jobPostingId/applications', apiApplicationController.createApplicationForJobPosting)`
  *(Note: The nested user job posting routes `GET /api/users/:id/jobs`, `POST /api/users/:id/jobs`, and `GET /users/:id/jobs` are defined directly within the `apiUserRoutes.js` and `userRoutes.js` modules and mounted under `/api/users` and `/users` in `app.js`).*

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
* **`jobPostingView.js`:**
  * Generates the complete HTML interface for the `/job-postings` and `/job-postings/:id` endpoints.
  * Powers the interactive **Job Posting Management** screen with full CRUD support:
    * **Create**: Job creation form with title "➕ Yeni İş İlanı Ekle", submitted via the "İş İlanı Yayınla" button (`POST /job-postings`). Includes input fields for User ID ("Kullanıcı ID"), Title ("İş / Pozisyon Başlığı"), Company ("Şirket / Kurum Adı"), Location ("Konum / Çalışma Modeli"), Contact Email ("İletişim / Başvuru E-posta"), and Description ("İş Tanımı ve Aranan Nitelikler").
    * **Read (List)**: Structured table with `ID`, `Başlık` (Title), `Şirket` (Company), `Kullanıcı ID` (User ID), `Konum` (Location), `İletişim` (Contact), `Tarih` (Date), and `İşlemler` (Actions) columns, including action buttons "Detay", "Başvurular", "Düzenle", and "Sil".
    * **Read (Details)**: Dedicated detail page (`GET /job-postings/:id`) presenting full position info, linked user owner (`user_id`), timestamps, and prominent action buttons:
      * **"📋 Bu İlanın Başvurularını Gör"**: Direct link to the nested applications page (`/job-postings/:id/applications`).
      * **"✍️ Bu İlana Başvur"**: Direct link jumping straight to the application form (`/job-postings/:id/applications#apply`).
      * **"← Tüm İlanlara Dön"**: Navigation link returning to the job postings list.
      * **"Bu İlanı Sil"**: Confirmation button triggering confirmed deletion (`DELETE /job-postings/:id`).
    * **Update (Edit)**: In-page editing functionality (`editJob(job)`) that populates the form including `user_id`, updates the submit button label to "Güncellemeyi Kaydet (PUT)", and dispatches `PUT /job-postings/:id` requests.
    * **Delete**: Delete buttons ("Sil" in table row, "Bu İlanı Sil" on detail page) triggering confirmed `DELETE /job-postings/:id` requests to remove the job posting.
  * Employs an internal `escapeHtml` function to sanitize user input against Cross-Site Scripting (XSS).
* **`applicationView.js`:**
  * Generates the complete HTML interface for the `/applications`, `/applications/:id`, and nested `/job-postings/:jobPostingId/applications` endpoints.
  * Powers the interactive **Application Management** screen:
    * **Read (Global List)**: Comprehensive table of all applications across all jobs with `ID`, `İlan ID` (Job ID), `Başvuran` (Applicant), `E-posta` (Email), `Durum` (Status), `Özgeçmiş` (Resume), `Tarih` (Date), and `İşlemler` (Actions) columns, with row action button "Detay & Yönet". Status badges are color-coded (`PENDING`, `REVIEWING`, `ACCEPTED`, `REJECTED`).
    * **Read (Nested List)**: Filtered view for a specific job posting (`/job-postings/:jobPostingId/applications`) featuring parent job summary banner, navigation link "← İlan Detayına Dön" (Back to Job Details), "✍️ Bu İlana Başvur" jump button, and dedicated list of applications for that job posting.
    * **Create**: Application submission form (anchored at `#apply` with heading "➕ Yeni Başvuru Gönder"), dispatched via `POST /applications` (global) or `POST /job-postings/:jobPostingId/applications` (nested). In nested views, the target job posting ID (`job_posting_id`) is automatically locked and pre-filled as a hidden field; in global view, it accepts `Hedef İş İlanı ID` input along with applicant name ("Başvuran Ad Soyad"), email ("E-posta Adresi"), user ID ("Kullanıcı ID"), resume URL ("Özgeçmiş (CV) URL"), and cover letter ("Ön Yazı / Notlar").
    * **Read (Details)**: Dedicated detail page (`GET /applications/:id`) displaying candidate profile, cover letter, resume link, linked job summary, and navigation buttons ("← Tüm Başvurular", "💼 İlgili İlan (#id)", and "📋 Bu İlanın Tüm Başvuruları").
    * **Status Update (Edit)**: Status change control section ("⚙️ Başvuru Durumunu Güncelle (PATCH)") with four status options (`PENDING` "Beklemede", `REVIEWING` "İnceleniyor", `ACCEPTED` "Kabul Edildi", `REJECTED` "Reddedildi"), saved via the "Durumu Kaydet" button to dispatch `PATCH /applications/:id` with `{"status": newStatus}` and `Content-Type: application/json`.
    * **Delete**: Delete button ("🗑️ Başvuruyu Sil") triggering confirmed `DELETE /applications/:id` requests.
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

#### B. REST API Flow (`/api/users` & `/api/users/:id/jobs`)
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
  userModel.js / jobPostingModel.js (MySQL Database via db.js Pool)
       │
       ▼
 JSON Response ({ id: 1, ... } or [ { id: 1, user_id: 1, ... } ])
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

#### E. Job Posting Web View Flow (`/job-postings`)
```text
Client Request (Browser)
       │
       ▼
   app.js (Route Mounting & Middleware)
       │
       ▼
jobPostingRoutes.js (Endpoint Matching: GET, POST, PUT, DELETE)
       │
       ▼
jobPostingController.js (Request Parsing & Business Logic)
       │
       ▼
  jobPostingModel.js (MySQL Database via db.js Pool)
       │
       ▼
  jobPostingView.js (HTML Template Rendering & XSS Escaping)
       │
       ▼
 HTML Response (Rendered Page in Browser)
```

#### F. Job Posting REST API Flow (`/api/job-postings`)
```text
Client Request (API Client / Swagger)
       │
       ▼
   app.js (Route Mounting & Middleware)
       │
       ▼
apiJobPostingRoutes.js (Endpoint Matching: GET, POST, PUT, DELETE)
       │
       ▼
apiJobPostingController.js (Request Parsing & Validation)
       │
       ▼
  jobPostingModel.js (MySQL Database via db.js Pool)
       │
       ▼
 JSON Response ({ id: 1, title: "...", company: "...", ... })
```

---

#### G. Application Web View Flow (`/applications` and `/job-postings/:jobPostingId/applications`)
```text
Client Request (Browser)
       │
       ▼
   app.js (Route Mounting, Nested Route Matching & Middleware)
       │
       ▼
applicationRoutes.js / app.js Nested Handlers (GET, POST, PATCH, DELETE)
       │
       ▼
applicationController.js (ID/Payload Validation & Business Logic)
       │
       ▼
 applicationModel.js (MySQL Database via db.js Pool)
       │
       ▼
 applicationView.js (HTML Template Rendering & XSS Escaping)
       │
       ▼
 HTML Response (Rendered Page in Browser with Form & Status Badges)
```

#### H. Application REST API Flow (`/api/applications` and `/api/job-postings/:jobPostingId/applications`)
```text
Client Request (API Client / Swagger)
       │
       ▼
   app.js (Route Mounting & Middleware)
       │
       ▼
apiApplicationRoutes.js / app.js Nested API Handlers (GET, POST, PATCH, DELETE)
       │
       ▼
apiApplicationController.js (Request Parsing, Status Check & Validation)
       │
       ▼
 applicationModel.js (MySQL Database via db.js Pool)
       │
       ▼
 JSON Response ({ id: 1, job_posting_id: 1, applicant_name: "...", status: "PENDING", ... })
```

---

### 7. Current Architecture Assessment

* **Modular MVC Structure:** The application fully follows a modular, decoupled MVC architecture across all four domains: Users, Announcements, Job Postings, and Applications. Model, View, Controller, and Route responsibilities are cleanly isolated into dedicated files and directories.
* **Separation of Concerns in `app.js`:** CRUD and data management logic no longer reside inside `app.js`. `app.js` serves strictly as the application entry point responsible for:
  * Initializing the Express instance.
  * Registering global middleware (`cors`, `express.json`, `express.urlencoded`).
  * Mounting direct route modules (`app.use('/users', userRoutes)`, `app.use('/api/users', apiUserRoutes)`, `app.use('/announcements', announcementRoutes)`, `app.use('/api/announcements', apiAnnouncementRoutes)`, `app.use('/job-postings', jobPostingRoutes)`, `app.use('/api/job-postings', apiJobPostingRoutes)`, `app.use('/applications', applicationRoutes)`, `app.use('/api/applications', apiApplicationRoutes)`, `app.use('/alumni', alumniRoutes)`).
  * Registering nested application routes directly (`/job-postings/:jobPostingId/applications` and `/api/job-postings/:jobPostingId/applications`), while nested user job routes (`/api/users/:id/jobs` and `/users/:id/jobs`) are cleanly encapsulated within their respective router modules (`apiUserRoutes` and `userRoutes`).
  * Configuring OpenAPI 3.0 specifications and serving Swagger UI (`/api/swagger`).
  * Starting the HTTP server on the configured port.
* **Database Persistence Achieved:** The transition from temporary in-memory arrays to persistent MySQL 8.0 relational database storage is complete for all four tables (`users`, `announcements`, `job_postings`, `applications`). All models query MySQL via parameterized prepared statements (`?`), all controller handlers asynchronously coordinate operations using `await`, and data persists across Docker container and server restarts via the persistent named volume `mysql_data` (defined under `volumes:` in `docker-compose.yml` as `mysql_data`, which Docker Compose automatically provisions on the host using the project prefix as `alumni_mysql_data`).
* **Containerization & Reproducibility:** The complete stack is Dockerized via `docker-compose.yml` and `backend/Dockerfile`. The backend container waits for MySQL healthiness before booting, guaranteeing robust and reproducible deployments across development and production environments.

