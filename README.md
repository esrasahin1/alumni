
```markdown
# 🎓 AI-Powered Alumni Tracking System

## 📖 About the Project & Course Scope

This project is being developed as part of the **Web Programming** course, featuring modern and **AI-powered** capabilities to build a comprehensive **Alumni Tracking System** web application. 

It is designed to help universities maintain strong connections with their alumni, track career growth, share job/internship opportunities, and build a professional institutional network. Throughout the semester, all architectural decisions, design choices, and iterative developments will be managed and tracked via this repository.

---

## 🏛️ Architecture and Design Decisions

During the system analysis and design phases, the following key decisions were made:
1. **Modular Monolithic / Service-Oriented Structure:** The project is structured with a clear separation of frontend and backend layers, designed in a modular way that can easily scale into a microservices architecture in the future.
2. **Containerization:** To eliminate environment discrepancies ("it works on my machine") and ensure seamless parity with production environments, the entire application runs on **Docker** and **Docker Compose**.
3. **Database Normalization:** Designed with relational integrity in mind using MySQL; a normalized schema was structured to handle users, roles, graduation details, professional experiences, and survey/announcement modules.

---

## 🛠️ Tech Stack

The project relies on industry-standard modern technologies:

*   **Frontend:** 
    *   JavaScript (ES6+) - Dynamic DOM manipulation and API integrations
    *   HTML5 / CSS3 - Modern and responsive user interface design
*   **Backend:** 
    *   Node.js - Asynchronous and scalable server-side environment
    *   Express.js - Fast and minimalist web application framework
*   **Database:** 
    *   MySQL - Relational database management system
*   **DevOps & Tools:** 
    *   Docker & Docker Compose - Multi-container orchestration and environment isolation
    *   Git & GitHub - Version control and collaboration workflow
*   **AI Integration:** 
    *   AI-powered resume analysis, alumni-career matching recommendations, and smart search modules (to be integrated progressively).

---

## 📂 Project Directory Structure

```text
alumni-tracking-system/
│
├── backend/                  # Node.js & Express server source code
│   ├── src/
│   │   ├── controllers/      # Request handlers and business logic
│   │   ├── models/           # Database models and queries (MySQL)
│   │   ├── routes/           # API route definitions
│   │   └── app.js            # Main application entry point
│   ├── Dockerfile            # Backend container configuration
│   └── package.json          # Node dependencies
│
├── frontend/                 # Web interface files
│   ├── public/               # Static HTML assets
│   ├── src/                  # JavaScript and CSS files
│   └── Dockerfile            # Frontend container configuration
│
├── database/                 # Database scripts
│   └── init.sql              # Schema creation and initial seed data
│
├── docker-compose.yml        # Orchestration configuration for App + Database
└── README.md                 # Project documentation

```

---

## ⚙️ Setup and Installation Guide (Docker)

To run this project locally, ensure you have **Docker** and **Docker Compose** installed on your machine.

### 1. Clone the Repository

```bash
git clone [https://github.com/esrasahin1/alumni.git](https://github.com/esrasahin1/alumni.git)
cd alumni

```

### 2. Start the System with Docker Compose

Run the following command in the project root directory:

```bash
docker-compose up --build

```

*This command will automatically:*

* Start the MySQL database container and execute `database/init.sql` to initialize tables.
* Build and start the Node.js backend server and frontend services.

### 3. Access the Application

* **Frontend Web Interface:** `http://localhost:3000`
* **Backend API Server:** `http://localhost:5000`
* **Database (MySQL):** `localhost:3306`

---

## 🔌 Core API Endpoints (Draft)

Planned and developing routes on the backend side:

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new alumni/user |
| `POST` | `/api/auth/login` | User authentication |
| `GET` | `/api/alumni` | List all alumni (with filtering options) |
| `GET` | `/api/alumni/:id` | Get detailed profile of a specific alumni |
| `POST` | `/api/jobs` | Post a new job or internship opportunity |
| `GET` | `/api/ai/match` | AI-based career and job matching suggestions |

---

## 👥 Development Process & Notes

* Sprints, commit histories, and version control procedures throughout the semester are managed strictly via this repository.
* Branching strategies and issue-tracking workflows are followed for updates and contributions.

```

---



