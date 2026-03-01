# 🚖 Techy Topers — Taxi Booking Management System

A full-stack taxi booking and fleet management application built with a **React (Vite)** frontend and a **PHP** backend, using **MySQL** as the database.

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [Running the Project](#-running-the-project)
- [Login Credentials](#-login-credentials)
- [Port Configuration](#-port-configuration)
- [Troubleshooting](#-troubleshooting)

---

## 🔧 Prerequisites

Make sure the following are installed on your system before getting started:

| Software | Purpose | Download |
|----------|---------|----------|
| **Node.js** (v18+) | Run the React frontend | [nodejs.org](https://nodejs.org/) |
| **XAMPP** | MySQL database & PHP runtime | [apachefriends.org](https://www.apachefriends.org/) |

### Verify installations:

```bash
node -v        # Should show v18 or higher
npm -v         # Should show npm version
php -v         # Should show PHP version (from XAMPP)
```

> **Note:** PHP should be available in your PATH or at `C:\xampp\php\php.exe`. MySQL should be at `C:\xampp\mysql\bin\mysql.exe`.

---

## 📁 Project Structure

```
Techy-Topers-main/
├── backend/                  # PHP Backend
│   ├── api/                  # API endpoints (PHP files)
│   ├── config/               # Database configuration
│   └── test_db.php           # Database connection test
├── frontend/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── pages/            # All page components (Login, Dashboard, Bookings, etc.)
│   │   ├── context/          # Auth context (API base URL config)
│   │   └── ...
│   ├── package.json          # Frontend dependencies
│   └── index.html            # Entry HTML file
├── ft_welcome.sql            # Main database dump
├── ft_register_setup.sql     # Registration table setup
├── setup_db.ps1              # Database setup script
├── start_backend.ps1         # Backend start script
├── package.json              # Root package.json (npm scripts)
└── README.md                 # This file
```

---

## 🛠️ Setup Instructions

### Step 1: Start XAMPP MySQL

1. Open **XAMPP Control Panel**
2. Click **Start** next to **MySQL**
3. Make sure MySQL is running on **port 3306** (default)

### Step 2: Install Dependencies

Open a terminal in the project root folder (`Techy-Topers-main`) and run:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3: Setup Database

This will create the `ft_welcome` database and import all the required tables and data:

```bash
npm run setup-db
```

> ℹ️ If the database already exists, you may see some warnings — these can be safely ignored if the tables are correct.

---

## 🚀 Running the Project

### Option 1: Run Both Together (Recommended)

From the **project root** directory:

```bash
npm run dev
```

This starts both the backend and frontend concurrently.

### Option 2: Run Separately (Two Terminals)

**Terminal 1 — Start Backend** (from project root):

```bash
npm run start-backend
```

> Starts PHP development server at **http://localhost:8080**

**Terminal 2 — Start Frontend** (from project root):

```bash
npm run start-frontend
```

Or navigate to the frontend directory:

```bash
cd frontend
npm run dev
```

> Starts Vite dev server at **http://localhost:5173**

### After Starting:

Open your browser and go to: **http://localhost:5173**

---

## 🔑 Login Credentials

| Username (Mobile) | Password  |
|--------------------|-----------|
| `9524522210`       | `4321`    |
| `8489228080`       | `rajark07`|

---

## ⚙️ Port Configuration

| Service  | Default Port | Config File |
|----------|-------------|-------------|
| Backend (PHP) | `8080` | `start_backend.ps1` |
| Frontend (Vite) | `5173` | `frontend/vite.config.js` |
| MySQL | `3306` | XAMPP Control Panel |

If you change the backend port, also update the `baseURL` in:
- `frontend/src/context/AuthContext.jsx`

---

## 🛑 Troubleshooting

### ❌ `npm run start-backend` fails
- Make sure **PHP** is installed (XAMPP) and port `8080` is not in use.
- Verify PHP path: `C:\xampp\php\php.exe`

### ❌ `npm run setup-db` fails
- Make sure **MySQL is running** in XAMPP.
- Verify MySQL path: `C:\xampp\mysql\bin\mysql.exe`

### ❌ Frontend can't connect to Backend
- Ensure the backend is running at `http://localhost:8080`.
- Check that `baseURL` in `frontend/src/context/AuthContext.jsx` matches your backend URL.

### ❌ `ENOENT: no such file or directory, package.json`
- Make sure you're running commands from the **project root** directory (`Techy-Topers-main/`), not from `backend/` or `frontend/`.

### ❌ Login not working
- Verify the database was imported correctly: `npm run setup-db`
- Check database connection: Open `http://localhost:8080/backend/test_db.php` in your browser.

---

## 📜 Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run backend + frontend together |
| `npm run start-backend` | Start PHP backend server only |
| `npm run start-frontend` | Start React frontend dev server only |
| `npm run setup-db` | Create database & import SQL data |

---

> Built with ❤️ by Techy Topers