# Stock Adjustment Management System

This is a full-stack application for managing stock adjustment requests, built with Node.js (Express), React, and SQLite.

## Project Structure

-   `backend/`: Contains the Node.js Express API.
-   `frontend/`: Contains the React user interface.

## Setup and Installation

1.  **Navigate to the project root directory**:

    ```bash
    cd stock-adjustment-app
    ```

2.  **Install dependencies for both frontend and backend**:

    ```bash
    npm run install-all
    ```

    *Alternatively, you can install them separately:*

    ```bash
    cd backend
    npm install
    cd ../frontend
    npm install
    ```

## Running the Application

From the project root directory, run:

```bash
npm start
```

This command will concurrently start both the backend server (on `http://localhost:5000`) and the frontend development server (on `http://localhost:3000`).

## Features Implemented

-   **User Authentication**: Register and Login with JWT.
-   **Role-Based Access Control**: Solicitante, Gestor, PCP, and Administrador roles with different permissions.
-   **Stock Adjustment Request Management**:
    -   Create new requests.
    -   View requests with filters and pagination.
    -   Approve/Reprove requests (Gestor).
    -   Mark requests as 'Concluído' (PCP).
-   **Dashboard**: Overview of request statuses.

## Technologies Used

-   **Backend**: Node.js, Express, SQLite, JWT, bcryptjs.
-   **Frontend**: React, React Router DOM, Axios.

## Default Admin User

Upon first run of the backend, a default admin user will be created if it doesn't exist:

-   **Email**: `admin@example.com`
-   **Password**: `adminpassword`