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
* **Middleware & Error Handling:** Custom Request Logger (`loggerMiddleware`), 404 Guardian (`notFoundMiddleware`), Centralized 5xx Guardian (`errorHandlerMiddleware`), Shared File Logger (`errorLogger`), CORS, Express JSON & URL-Encoded Parsers

---

## ⚙️ Installation & Running

There are two methods to run the project:

### Method A: Full Stack with Docker Compose (Recommended)

To build and start the entire stack (MySQL 8.0 database and Node.js backend service) with a single command from the project root:

```bash
docker compose up -d --build
```

*(On container startup, the backend service automatically waits for MySQL to become healthy, applies all pending schema migrations, loads initial seed data idempotently, and starts the Express server).*

The application will be accessible at `http://localhost:3000`, and Swagger UI will be available at `http://localhost:3000/api/swagger`.

> 💡 **Optional Verification:**
> To manually inspect migration or seed status inside the running container at any time:
> ```bash
> docker compose exec backend npm run migrate:status
> docker compose exec backend npm run migrate:verify
> ```

---

### Method B: Local Development (Hybrid)

To run the MySQL database in Docker and the Node.js application in your local terminal:

> 💡 **Directory Note for Beginners:**
> * **Docker Compose commands** (`docker compose ...`) must be run in the **project root directory** (`alumni/`) where `docker-compose.yml` is located.
> * **npm commands** (`npm install`, `npm run migrate`, `npm run seed`, `npm start`, `npm test`) must be run in the **`backend` directory** (`alumni/backend/`) where `package.json` resides.

#### 1. Install Dependencies

From the project root directory (`alumni/`), navigate into the `backend/` directory and install the required packages:

```bash
cd backend
npm install
```

#### 2. Start the Database and Run Migrations (Database Migration)

1. **Start the MySQL Database Container:**
   Return to the **project root directory** (`alumni/`) where `docker-compose.yml` is located (or open a second terminal), then launch the MySQL container:
   ```bash
   cd ..
   docker compose up -d db
   ```
2. **Apply Migrations:**
   Navigate back into the **`backend/` directory** to run migration commands:
   ```bash
   cd backend
   npm run migrate
   ```
3. **Verify Migration Status and Tables:**
   Still in the **`backend/` directory**, verify that all migration scripts applied cleanly:
   ```bash
   npm run migrate:status
   npm run migrate:verify
   ```
*(The rollback operation can be performed using `npm run migrate:down`).*

#### 3. Load Sample Data (Database Seeding)

Still in the **`backend/` directory**, insert sample records (`users`, `announcements`, `job_postings`) into the database in a safe and idempotent manner:

```bash
npm run seed
# or alternatively:
npm run db:seed
```
*(The seeder system executes the `userSeeder.js`, `announcementSeeder.js`, and `jobPostingSeeder.js` modules. When re-run, existing records are skipped, preventing duplicate data).*

#### 4. Start the Server

Still in the **`backend/` directory**, start the application:

```bash
npm start
```

The server starts by default at **`http://localhost:3000`**.

#### 5. Run Tests (Automated Test Suite)

> ℹ️ **Important Prerequisite:** The test suite (`test_nested_route.js`) performs end-to-end verification by sending direct HTTP requests to the running backend server. Therefore, before running tests, the backend application **must already be running** (either via Docker container or via `npm start` in the `backend/` directory at `http://127.0.0.1:3000`).

Open a separate terminal, navigate into the **`backend/` directory**, and run:

```bash
cd backend
npm test
```
*(This command runs the `test_nested_route.js` test suite configured in `backend/package.json`, automatically verifying all 19 scenarios—including 13 nested route/CRUD tests and 6 Task 2 business rule tests—against the running server).*

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
| **Generic 404 Page** | [http://localhost:3000/*](http://localhost:3000/any-invalid-url) | Branded error interface rendered for invalid or unmatched web URLs. Features automatic 5-second client-side redirection to home (`/`), manual "Ana Sayfaya Dön" button, and portal navigation. |

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
| **`PATCH`** | `/api/users/:id` | Partially updates only the submitted fields of the specified user | `200 OK` | `404 Not Found`, `409 Conflict` |
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
│   ├── logs/                 # Persistent error logs directory
│   │   └── error.logs        # Unified error and 404 audit log file (Task 6)
│   ├── src/
│   │   ├── config/           # Database connection pool (db.js)
│   │   ├── controllers/      # Request controllers and business logic
│   │   ├── database/         # Migrations, seeders, and factories
│   │   │   ├── factories/    # Mock data generators (userFactory, announcementFactory, jobPostingFactory)
│   │   │   ├── migrations/   # SQL/JS schema migration files (users, announcements, job_postings, applications, user_id FK, Task 2 rules)
│   │   │   ├── seeds/        # Idempotent sample data seeders (users, announcements, job_postings)
│   │   │   ├── migrate.js    # Migration CLI runner
│   │   │   └── seed.js       # Seed CLI runner
│   │   ├── middlewares/      # Custom Express middleware pipeline (Tasks 3–6)
│   │   │   ├── errorHandlerMiddleware.js # Centralized 5xx/4xx error handler (Task 5)
│   │   │   ├── errorLogger.js            # Shared file logging utility (Task 6)
│   │   │   ├── loggerMiddleware.js       # Terminal HTTP request logger (Task 3)
│   │   │   └── notFoundMiddleware.js     # Unmatched route 404 guardian (Task 4, 6, 7)
│   │   ├── models/           # MySQL 8.0 data models and asynchronous CRUD queries
│   │   ├── routes/           # API and web route definitions
│   │   ├── views/            # HTML UI and page templates
│   │   │   ├── announcementView.js
│   │   │   ├── apiUserView.js
│   │   │   ├── applicationView.js
│   │   │   ├── jobPostingView.js
│   │   │   ├── notFoundView.js           # Generic 404 page with 5s auto-redirect (Task 7)
│   │   │   └── userView.js
│   │   └── app.js            # Express server, middleware pipeline, and Swagger configuration
│   ├── test_nested_route.js  # Automated test suite (19 scenarios: nested API routes & Task 2 business rules)
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
│   │   ├── 005_add_user_id_to_job_postings.sql
│   │   ├── 006_update_job_postings_task2_rules.js
│   │   └── 006_update_job_postings_task2_rules.sql
│   ├── seeds/
│   │   ├── announcementSeeder.js
│   │   ├── jobPostingSeeder.js
│   │   └── userSeeder.js
│   ├── migrate.js
│   └── seed.js
├── middlewares/
│   ├── errorHandlerMiddleware.js # Centralized 5xx/4xx error handler (Task 5)
│   ├── errorLogger.js            # Resilient file logger for error.logs (Task 6)
│   ├── loggerMiddleware.js       # High-precision terminal request logger (Task 3)
│   └── notFoundMiddleware.js     # Unmatched route 404 guardian (Task 4, 6, 7)
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
│   ├── notFoundView.js           # Generic 404 view with 5s auto-redirect (Task 7)
│   └── userView.js
└── app.js
```

#### Layer Responsibilities:
* **`config/`**: Centralized MySQL connection pool configuration (`backend/src/config/db.js`) supporting environment variables, dynamic host resolution (`db` within Docker network or `localhost` on host), auto-reconnect, and health check validation.
* **`database/`**: Database lifecycle and schema management containing forward/rollback SQL migration scripts, realistic factory mock generators, and idempotent seed scripts.
* **`controllers/`**: Receives incoming requests from the route layer, executes business logic, coordinates with asynchronous models using `await`, handles validation and error reporting, and returns formatted HTML views or JSON responses.
* **`middlewares/`**: Intercepts the HTTP request-response cycle to execute cross-cutting concerns: terminal logging with timing (`loggerMiddleware.js`), route guarding for unmapped paths (`notFoundMiddleware.js`), centralized error handling with safe responses (`errorHandlerMiddleware.js`), and non-blocking file persistence (`errorLogger.js`).
* **`models/`**: Manages the data persistence layer, encapsulating asynchronous MySQL 8.0 queries via parameterized statements (`?`), returning structured records and promises to controllers.
* **`routes/`**: Defines HTTP route definitions (verbs and path patterns) and maps incoming requests to their respective controller handler functions.
* **`views/`**: Renders dynamic, accessible, and sanitized HTML templates for browser presentation using native JavaScript template literals, including entity interfaces and generic 404 error handling.
* **`app.js`**: Serves as the central server entry point; configures global middleware (CORS, body parsers, custom logger), mounts the route modules, sets up OpenAPI/Swagger UI documentation, registers terminal guardians (404 and error handler), and starts the HTTP listener.

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
* **Task 2 JobPosting Business Rules & Implementation:**
  All five core business rules defined in `ddd.md` are fully implemented and aligned across the database schema, models, controllers, and views via Migration `006_update_job_postings_task2_rules`:
  1. **`title` is required & maximum 120 characters:** Enforced in the database schema as `title VARCHAR(120) NOT NULL` (via Migration 006) and validated at model and controller levels (`jobPostingModel.js`, `jobPostingController.js`, `apiJobPostingController.js`, `apiUserController.js`). Missing titles return HTTP `400 Bad Request`, and titles exceeding 120 characters are rejected with HTTP `400 Bad Request` (`TITLE_TOO_LONG`).
  2. **`company` is required:** Enforced in the database schema as `company VARCHAR(255) NOT NULL` and validated across all web and REST API controllers (returns HTTP `400 Bad Request` if omitted).
  3. **`city` is optional:** Stored in the database column `location VARCHAR(255) NULL`. Full dual-field interoperability is supported: input payloads accept either `city` or `location`, and formatted outputs return both `city` and `location` aliases.
  4. **`description` is optional:** Updated in the database schema to `description TEXT NULL` (via Migration 006). Empty or omitted descriptions are normalized to `null` and successfully saved (`201 Created`) across all creation endpoints.
* **MySQL Database Persistence:**
  Job posting data is persistently stored in the `job_postings` table of the MySQL 8.0 relational database (`alumni_db`) using the connection pool via `mysql2/promise` (`backend/src/config/db.js`).
* **Table Schema & Attributes (Updated via Migration 006):**
  * `id`: `INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`
  * `user_id`: `INT UNSIGNED NULL` (Foreign key referencing `users(id)` with `ON DELETE SET NULL ON UPDATE CASCADE`. Identifies the user who created the job posting; `NULL` for legacy or unassigned postings)
  * `title`: `VARCHAR(120) NOT NULL` (Maximum 120 characters, updated via Migration 006)
  * `company`: `VARCHAR(255) NOT NULL` (Mandatory company/organization name)
  * `location`: `VARCHAR(255) NULL` (Optional position city/location, aliased to `city`)
  * `description`: `TEXT NULL` (Optional position description, updated via Migration 006)
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
    * **Create**: Job creation form with heading "➕ Yeni İş İlanı Ekle", submitted via the "İş İlanı Yayınla" button (`POST /job-postings`). Form input rules adhere strictly to Task 2 business rules:
      * **Title ("İş / Pozisyon Başlığı * (En fazla 120 karakter)")**: Mandatory field, enforced with HTML `required` and `maxlength="120"`.
      * **Company ("Şirket / Kurum Adı *")**: Mandatory field, enforced with HTML `required`.
      * **City / Location ("Şehir / Konum (Opsiyonel)")**: Optional field for city or work model (hybrid/remote); maps to both `location` and `city`.
      * **Contact Email ("İletişim / Başvuru E-posta (Opsiyonel)")**: Optional application email field.
      * **Description ("İş Tanımı ve Aranan Nitelikler (Opsiyonel)")**: Optional multi-line textarea, can be submitted empty.
      * **User ID ("Kullanıcı ID (İlan Sahibi - Opsiyonel)")**: Optional owner user ID linking the job to an existing registered user.
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
* **`notFoundView.js`:**
  * Generates the branded, responsive generic 404 HTML interface for unmatched web routes caught by `notFoundMiddleware`.
  * Renders the corporate navigation bar, a large `404` status hero, a `404 Not Found` badge, and an XSS-sanitized representation of the requested HTTP method and URL path via `escapeHtml`.
  * Implements a 5-second automatic client-side redirection to the home page (`/`) using `<meta http-equiv="refresh" content="5;url=/">` and a supporting JavaScript `setTimeout` fallback.
  * Features a clear notice explaining the countdown (*"⏱️ 5 saniye içinde otomatik olarak ana sayfaya yönlendirileceksiniz."*) alongside manual navigation buttons ("🏠 Ana Sayfaya Dön", "💼 İş İlanları", and "👥 Mezunlar ve Kullanıcılar").

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
  * Registering the pre-routing request timing logger (`loggerMiddleware`).
  * Registering global body parsing and CORS middleware (`cors`, `express.json`, `express.urlencoded`).
  * Mounting direct route modules (`app.use('/users', userRoutes)`, `app.use('/api/users', apiUserRoutes)`, `app.use('/announcements', announcementRoutes)`, `app.use('/api/announcements', apiAnnouncementRoutes)`, `app.use('/job-postings', jobPostingRoutes)`, `app.use('/api/job-postings', apiJobPostingRoutes)`, `app.use('/applications', applicationRoutes)`, `app.use('/api/applications', apiApplicationRoutes)`, `app.use('/alumni', alumniRoutes)`).
  * Registering nested application routes directly (`/job-postings/:jobPostingId/applications` and `/api/job-postings/:jobPostingId/applications`), while nested user job routes (`/api/users/:id/jobs` and `/users/:id/jobs`) are cleanly encapsulated within their respective router modules (`apiUserRoutes` and `userRoutes`).
  * Configuring OpenAPI 3.0 specifications and serving Swagger UI (`/api/swagger`).
  * Registering the terminal route guardian (`notFoundMiddleware`) and centralized error handler (`errorHandlerMiddleware`).
  * Starting the HTTP server on the configured port.
* **Database Persistence Achieved:** The transition from temporary in-memory arrays to persistent MySQL 8.0 relational database storage is complete for all four tables (`users`, `announcements`, `job_postings`, `applications`). All models query MySQL via parameterized prepared statements (`?`), all controller handlers asynchronously coordinate operations using `await`, and data persists across Docker container and server restarts via the persistent named volume `mysql_data` (defined under `volumes:` in `docker-compose.yml` as `mysql_data`, which Docker Compose automatically provisions on the host using the project prefix as `alumni_mysql_data`).
* **Containerization & Reproducibility:** The complete stack is Dockerized via `docker-compose.yml` and `backend/Dockerfile`. The backend container waits for MySQL healthiness before booting, guaranteeing robust and reproducible deployments across development and production environments.

---

## 🛡️ Middleware Pipeline & Error Handling Architecture (Tasks 3–7)

The application implements a robust, multi-stage Express middleware architecture designed to ensure total observability, graceful fault tolerance, secure error containment, and seamless user recovery across both REST API endpoints and server-rendered HTML views.

### 1. Middleware Pipeline & Execution Order

All middleware components are registered in [`backend/src/app.js`](backend/src/app.js) in a strict, deterministic sequence:

```text
Incoming HTTP Request
       │
       ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Logger Middleware (loggerMiddleware.js - Task 3)                    │
│    • Records high-precision start timestamp (Date.now())               │
│    • Listens to res.on('finish') to measure elapsed duration in ms     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. Core Security & Parsing Middleware                                  │
│    • cors() (Cross-Origin Resource Sharing)                            │
│    • express.json() & express.urlencoded() (Payload parsers)           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. Application Routes & Documentation                                  │
│    • Web MVC Routes (/users, /announcements, /job-postings, etc.)      │
│    • REST API Routes (/api/users, /api/job-postings, /api/health)      │
│    • Interactive Swagger UI (/api/swagger, /api/swagger/doc.json)     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
               ┌───────────────────┴───────────────────┐
               │ (Route matched & handled)             │ (No route matched)
               ▼                                       ▼
       [Response Sent]              ┌────────────────────────────────────┐
                                    │ 4. 404 Guardian Middleware         │
                                    │    (notFoundMiddleware.js - T4/T7) │
                                    │    • Appends 404 to error.logs     │
                                    │    • /api: JSON 404 + reason       │
                                    │    • Web: Generic 404 View + 5s    │
                                    │      automatic client redirect     │
                                    └────────────────────────────────────┘
                                                       │
                                 ┌─────────────────────┘
                                 │ (Synchronous error or next(err))
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 5. 5xx Guardian Middleware (errorHandlerMiddleware.js - Task 5)        │
│    • Express 4-parameter error signature: (err, req, res, next)        │
│    • Logs technical details & stack trace to terminal (console.error)  │
│    • Appends structured error & stack trace to logs/error.logs (Task 6)│
│    • Preserves valid HTTP status codes (e.g. 400 Bad Request)          │
│    • Returns safe, sanitized generic responses (no internal leakage)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Task 3: Logger Middleware (`loggerMiddleware.js`)

* **Source File:** [`backend/src/middlewares/loggerMiddleware.js`](backend/src/middlewares/loggerMiddleware.js)
* **Registration:** Mounted as the very first middleware in `backend/src/app.js` (`app.use(loggerMiddleware)`).
* **Behavior:**
  * Intercepts every incoming HTTP request before routing takes place.
  * Captures the initial request start time using `Date.now()`.
  * Registers a completion listener on `res.on('finish')` to calculate the exact round-trip duration in milliseconds.
  * Formats the current time as `HH:mm:ss` using local zero-padded time components.
  * Extracts the HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), request URL (`req.originalUrl || req.url`), and final response HTTP status code (`res.statusCode`).
* **Terminal Output Format:**
  ```text
  HH:mm:ss METHOD URL STATUS DURATION ms
  ```
* **Live Verified Output Examples:**
  ```text
  22:56:13 GET /api/health 200 6 ms
  22:56:13 GET /api/unknown-404-test 404 3 ms
  22:56:13 POST /api/users 400 12 ms
  22:59:30 POST /api/users/2/jobs 201 18 ms
  ```

---

### 3. Task 4: 404 Guardian Middleware (`notFoundMiddleware.js`)

* **Source File:** [`backend/src/middlewares/notFoundMiddleware.js`](backend/src/middlewares/notFoundMiddleware.js)
* **Registration:** Mounted immediately after all web routes, API routes, and Swagger endpoints, acting as the terminal boundary for unmatched paths.
* **Dual-Mode Response Protocol:**
  * **REST API Endpoints (`/api/...` or `Accept: application/json`):**
    Returns HTTP status **`404 Not Found`** with a structured, developer-friendly JSON payload stating the exact unmatched method and URL:
    ```json
    {
      "success": false,
      "message": "Route not found",
      "reason": "No route matches GET /api/unknown-endpoint."
    }
    ```
  * **Web Browser Endpoints (HTML requests):**
    Delegates to the presentation layer (`renderNotFoundPage` in [`notFoundView.js`](backend/src/views/notFoundView.js)) to render a branded, accessible HTML error page.
* **Audit Logging:** Every unmatched route request is automatically forwarded to [`errorLogger.js`](backend/src/middlewares/errorLogger.js) and appended to `backend/logs/error.logs` prior to sending the response.

---

### 4. Task 5: 5xx Guardian Middleware (`errorHandlerMiddleware.js`)

* **Source File:** [`backend/src/middlewares/errorHandlerMiddleware.js`](backend/src/middlewares/errorHandlerMiddleware.js)
* **Registration:** Mounted as the final handler in `backend/src/app.js` with the standard Express 4-parameter error signature: `(err, req, res, next)`.
* **Centralized Error Scope:**
  * Intercepts synchronous runtime exceptions thrown in middleware or route handlers.
  * Intercepts syntax and parsing errors triggered during body decoding (e.g., malformed JSON payloads in POST/PUT requests).
  * Intercepts asynchronous errors explicitly forwarded down the middleware chain via `next(err)`.
  * *(Note: In Express 4, unhandled promise rejections inside asynchronous route handlers must be caught via `try/catch` and passed to `next(err)` to reach centralized error handlers).*
* **Security & Information Leakage Prevention:**
  * **Terminal Logging:** Full technical error details, messages, and stack traces are logged to the server terminal via `console.error(err)` for operator debugging.
  * **Client Sanitization:** Technical error messages (`err.message`), database queries, and stack traces are **strictly stripped** from client responses to eliminate sensitive system leakage.
  * **Status Code Preservation:** Preserves valid HTTP status codes attached to the error object (e.g. `400 Bad Request` from body-parser, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`). Defaults unexpected internal errors to **`500 Internal Server Error`**.
* **Client Response Formats:**
  * **API JSON Response:**
    ```json
    {
      "success": false,
      "message": "Bad Request"
    }
    ```
    *(or `"Internal Server Error"` for 5xx failures)*.
  * **Web HTML Response:** Renders a clean, user-facing error document presenting safe headings and descriptions without stack traces.
* **Streaming Safety:** Verifies `if (res.headersSent) return next(err);` before attempting to write headers, delegating to default Express streaming handlers if output has already commenced.

---

### 5. Task 6: Resilient Error Logging (`errorLogger.js` & `logs/error.logs`)

* **Source File:** [`backend/src/middlewares/errorLogger.js`](backend/src/middlewares/errorLogger.js)
* **Log Destination:** [`backend/logs/error.logs`](backend/logs/error.logs)
* **Design Principles:**
  * **Zero External Dependencies:** Built entirely with Node.js standard `fs` and `path` modules.
  * **Dynamic Directory Resolution:** Resolves the log directory path dynamically relative to the middleware module using `path.resolve(__dirname, '../../logs')`.
  * **Self-Healing Provisioning:** Checks if the target `logs/` directory exists on each write; if missing, creates it recursively (`fs.mkdirSync(LOGS_DIR, { recursive: true })`).
  * **Append-Only Persistence:** Uses `fs.appendFile` to append every error entry to the log file without overwriting historical records.
  * **Fault Tolerance:** All file operations are wrapped in `try/catch` and safe async callbacks. File system I/O errors are reported to `console.error` and **never crash** the Express runtime or abort client responses.
  * **Deduplication & Selective Audit:** Successful requests (`200 OK`, `201 Created`, etc.) are never logged to `error.logs`. Unmatched routes log exactly once via `logNotFoundToFile`, and centralized errors log exactly once via `logErrorToFile`.
* **Standardized Log Entry Formats:**
  * **404 Unmatched Route Entry:**
    ```text
    [2026-11-11T20:15:50.970Z] GET /unknown-web-page 404 - Route not found
    ```
  * **Centralized Error Entry (with stack trace):**
    ```text
    [2026-11-11T19:58:55.304Z] POST /api/users - Error: Expected property name or '}' in JSON at position 2
    Stack: SyntaxError: Expected property name or '}' in JSON at position 2
        at JSON.parse (<anonymous>)
        at parse (/app/node_modules/body-parser/lib/types/json.js:96:19)
        at /app/node_modules/body-parser/lib/read.js:128:18
        ...
    ```

---

### 6. Task 7: Generic 404 Page & Automatic Redirection (`notFoundView.js`)

* **Source File:** [`backend/src/views/notFoundView.js`](backend/src/views/notFoundView.js)
* **Visual & Layout Features:**
  * Fully styled with the application's portal CSS design system, navigation bar (`🏠 Ana Sayfa`, `👥 Kullanıcılar`, `📢 Duyurular`, `💼 İş İlanları`, `📝 Başvurular`, `⚡ Swagger API`), responsive container, and footer.
  * Prominent `404` status code hero with a `<span class="badge badge-danger">404 Not Found</span>` badge.
  * Clear, user-friendly description: *"Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir."*
  * Contextual requested route card safely displaying the requested HTTP method and sanitized URL via `escapeHtml(url)` to prevent XSS attacks.
* **5-Second Client-Side Automatic Redirection:**
  * Employs standard W3C meta refresh in `<head>`:
    ```html
    <meta http-equiv="refresh" content="5;url=/">
    ```
  * Provides an explanatory banner informing the user:
    ```html
    <div class="redirect-notice">
      ⏱️ 5 saniye içinde otomatik olarak ana sayfaya yönlendirileceksiniz.
    </div>
    ```
  * Includes a JavaScript fallback timer (`setTimeout(() => window.location.href = '/', 5000)`).
  * Retains manual call-to-action buttons for immediate navigation:
    * `<a href="/" class="btn">🏠 Ana Sayfaya Dön</a>`
    * `<a href="/job-postings" class="btn btn-secondary">💼 İş İlanları</a>`
    * `<a href="/users" class="btn btn-secondary">👥 Mezunlar ve Kullanıcılar</a>`
* **Architectural Invariants:**
  * **HTTP Wire Status:** Returns HTTP status **`404 Not Found`** directly (avoiding 302 redirect loops and preserving accurate HTTP semantics for monitoring tools and search engines).
  * **API Isolation:** API consumers requesting `/api/*` or sending `Accept: application/json` continue receiving pure JSON responses without any HTML or redirection.

---

### 7. Verification Guide & Test Commands

The middleware pipeline can be validated across all five functional areas using the verification scenarios below:

| Test Scenario | Command | Expected Output & Behavior |
| :--- | :--- | :--- |
| **1. Logger Timing & Format** | `curl -i http://localhost:3000/api/health` | HTTP `200 OK`. Terminal outputs `HH:mm:ss GET /api/health 200 X ms`. Does **not** write to `error.logs`. |
| **2. API 404 JSON Response** | `curl -i http://localhost:3000/api/unknown-route` | HTTP `404 Not Found`. Body: `{"success":false,"message":"Route not found","reason":"No route matches GET /api/unknown-route."}`. Appends entry to `backend/logs/error.logs`. |
| **3. Web 404 HTML & Meta Refresh** | `curl -i -H "Accept: text/html" http://localhost:3000/unknown-page` | HTTP `404 Not Found`. HTML contains `<meta http-equiv="refresh" content="5;url=/">`, 5s notice, and manual return button. Appends entry to `error.logs`. |
| **4. Centralized Error Sanitization** | `curl -i -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d "{ malformed_json"` | HTTP `400 Bad Request`. Body: `{"success":false,"message":"Bad Request"}` (no stack trace leaked). Full stack trace written to terminal and `error.logs`. |
| **5. Log File Persistence** | Inspect `backend/logs/error.logs` | File contains timestamped `404` and `Error:` entries with full stack traces. |
| **6. Automated Test Suite (Nested Routes & Task 2)** | `npm test` *(from `backend/` directory)* | Executes `test_nested_route.js`. Verifies all **19/19 scenarios pass cleanly** (13 nested route & CRUD scenarios + 6 Task 2 validation scenarios) with all middleware active. |

