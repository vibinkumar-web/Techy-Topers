# Techy-Toppers Project Setup Guide

This guide provides instructions on how to set up and run the Techy-Toppers project, which consists of a PHP backend and a React frontend.

## System Requirements

To run this project, you need the following software installed on your system:

1.  **XAMPP** (or a separate installation of PHP and MySQL).
    -   **PHP**: Version 7.4 or higher.
    -   **MySQL**: Version 5.7 or higher.
2.  **Node.js**: Version 16 or higher (includes `npm`).
3.  **PowerShell**: For running the automated setup scripts (standard on Windows).

## Project Structure

-   `backend/`: Contains the PHP API and configuration.
-   `frontend/`: Contains the React application.
-   `ft_welcome.sql`: The database schema and data dump.
-   `setup_db.ps1`: Automated script to set up the database.
-   `start_backend.ps1`: Automated script to start the backend server.

---

## Setup Instructions

### Unified Startup (Recommended)

The easiest way to run the project is using the automated script from the **root directory**.

1.  **Install Dependencies** (First time only):
    Open a terminal in the project root (`c:\Users\LENOVO\Desktop\Techy-Toppers`) and run:
    ```bash
    npm install
    ```
    *Note: You also need to run `npm install` inside the `frontend` folder if you haven't already.*

2.  **Run the Project**:
    In the root directory, run:
    ```bash
    npm run dev
    ```
    This single command will:
    -   Setup/Verify the database.
    -   Start the PHP Backend server.
    -   Start the React Frontend server.

3.  Access the application at the URL shown in the terminal (usually `http://localhost:5173`).

---

### Manual Setup (Alternative)

If you prefer running things separately:

#### 1. Database Setup
```powershell
./setup_db.ps1
```

#### 2. Backend Setup
```powershell
./start_backend.ps1
```

#### 3. Frontend Setup
```bash
cd frontend
npm run dev
```

---

## Troubleshooting

-   **Database Connection Error**:
    -   Ensure MySQL is running in XAMPP.
    -   Verify credentials in `backend/config/db.php` (Default: user `root`, password empty).
-   **Backend Not Found (404/Network Error)**:
    -   Ensure the backend server is running on port **8000**.
    -   Open `http://localhost:8000/backend/test_db.php` in your browser to verify it is running and connected to the DB.
-   **"php" or "mysql" not recognized**:
    -   Use the provided `.ps1` scripts which attempt to find these tools automatically.
    -   Or add `C:\xampp\php` and `C:\xampp\mysql\bin` to your Windows System PATH environment variable.
