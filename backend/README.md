# Stock Adjustment Backend

This is the backend for the Stock Adjustment system, built with Node.js, Express, and SQLite.

## Setup

1.  **Install Dependencies**:

    ```bash
    npm install express sqlite3 jsonwebtoken bcryptjs
    ```

2.  **Run the Application**:

    ```bash
    node index.js
    ```

    The server will run on `http://localhost:5000`.

## API Endpoints

-   `POST /register`: Register a new user.
-   `POST /login`: Authenticate a user and get a JWT token.
-   `POST /requests`: Create a new stock adjustment request (requires authentication).
-   `GET /requests`: Get all stock adjustment requests (requires authentication, supports filters and pagination).
-   `PUT /requests/:id/status`: Update the status of a request (requires authentication, role-based).
-   `GET /dashboard`: Get dashboard data (requires authentication, role-based).