# Clothing Store Website Project

This project is a dynamic clothing store website with a frontend (HTML, CSS, JavaScript) that interacts with a Python Flask backend and an SQLite database.

## Project Structure

-   **/backend**: Contains the Flask backend application.
    -   `app.py`: Main application file, initializes Flask app and extensions.
    -   `extensions.py`: Initializes Flask extensions like SQLAlchemy and Migrate.
    -   `models/`: Defines SQLAlchemy database models (`product_model.py`, `user_model.py`, `cart_model.py`).
    -   `routes/`: Defines API blueprints and routes (`products.py`, `users.py`, `cart.py`).
    -   `migrations/`: Contains Alembic database migration scripts. (This directory is managed by Flask-Migrate and should be present in the repository).
    -   `instance/database/store.db`: The SQLite database file (created automatically in the `backend/instance/database/` directory after running migrations).
    -   `requirements.txt`: Lists Python dependencies for the backend.
    -   `seed_db.py`: Script to populate the database with initial sample data.
-   **/frontend**: Contains the static frontend application.
    -   `index.html`: Main HTML page for the single-page application (SPA) experience.
    -   `css/style.css`: Stylesheets for the frontend.
    -   `js/script.js`: JavaScript files for frontend logic (product display, auth, cart).
-   `README.md`: This file, providing project overview and setup instructions.

## Setup and Running the Project

Follow these steps to set up and run the project on your local machine.

### 1. Backend Setup

**Prerequisites:**
*   Python 3 (Python 3.7 or newer recommended)
*   `pip` (Python package installer)
*   `git` (for cloning the repository, if applicable)

**Steps:**

1.  **Clone the Repository (if not already done):**
    ```bash
    # git clone <repository_url>
    # cd <repository_directory_name>
    ```
    (Assume you are in the project's root directory where `backend` and `frontend` folders are located.)

2.  **Navigate to the Backend Directory:**
    ```bash
    cd backend
    ```

3.  **Create and Activate a Virtual Environment:**
    *   **For macOS/Linux:**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    *   **For Windows:**
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```
    Your terminal prompt should now indicate the `(venv)` is active.

4.  **Install Dependencies:**
    (Ensure your virtual environment is active)
    ```bash
    pip install -r requirements.txt
    ```

5.  **Set Up Environment Variables for Flask:**
    The Flask CLI needs to know where your application is. These commands are typically run in the terminal session where you'll run `flask` commands.
    *   **For macOS/Linux:**
        ```bash
        export FLASK_APP=app.py
        export PATH="$HOME/.local/bin:$PATH" # Add this if 'flask' command is not found after installation
        ```
    *   **For Windows (Command Prompt):**
        ```bash
        set FLASK_APP=app.py
        ```
    *   **For Windows (PowerShell):**
        ```bash
        $env:FLASK_APP = "app.py"
        ```
    (Note: The `backend/app.py` file is structured such that Flask's CLI can discover the `app` instance.)

6.  **Database Setup (SQLite):**
    The project uses SQLite. The database file will be created at `backend/instance/database/store.db`.
    The `backend/migrations` directory, containing migration scripts, is included in the repository.

    *   **Apply Database Migrations:**
        This command reads the migration scripts in `backend/migrations` and applies them to create or update your database schema. This step will create the `backend/instance/database/store.db` file if it doesn't exist, along with all defined tables (products, users, cart_items).
        (Ensure you are in the `backend` directory with `FLASK_APP` set and `(venv)` active)
        ```bash
        flask db upgrade --directory migrations
        ```
        (The `--directory migrations` assumes the `migrations` folder is directly within the `backend` directory, which it is.)

7.  **Seed the Database (Optional but Recommended):**
    To populate the database with initial sample products:
    *   Ensure your virtual environment is active and you are in the `backend` directory.
    *   Run the seed script:
        ```bash
        python seed_db.py
        ```
    This script uses the Flask app context to interact with the database.

8.  **Run the Backend Server:**
    *   Ensure your virtual environment is active and you are in the `backend` directory.
    *   Start the Flask development server:
        ```bash
        flask run
        ```
    *   The backend server will typically start on `http://127.0.0.1:5000/`. You should see output in your terminal indicating it's running. Keep this terminal window open.

### 2. Frontend Setup

**Prerequisites:**
*   A modern web browser (e.g., Chrome, Firefox, Edge).
*   Python 3 (if using `python -m http.server` for serving).

**Steps:**

1.  **Open a New Terminal Window/Tab.**

2.  **Navigate to the Frontend Directory:**
    From the project's root directory:
    ```bash
    cd frontend
    ```

3.  **Running the Frontend (Recommended Method):**
    To avoid potential CORS issues when the frontend (served from `file:///` protocol) tries to communicate with the backend API (`http://127.0.0.1:5000`), it's best to serve the frontend files using a simple local HTTP server.

    *   Ensure you are in the `frontend` directory.
    *   Run one of the following commands:
        *   **If you have Python 3:**
            ```bash
            python -m http.server 8080
            ```
            (You can use another port like 8000 or 8001 if 8080 is in use.)
        *   **If you have Python 2 (less common now):**
            ```bash
            python -m SimpleHTTPServer 8080
            ```
    *   After starting the server, open your web browser and navigate to `http://127.0.0.1:8080/`. The `index.html` page should load.

    *   **Alternative (VS Code):** If using Visual Studio Code, the "Live Server" extension provides an easy way to serve the `frontend` directory.

**Accessing the Application:**
With the backend running (e.g., on `http://127.0.0.1:5000`) and the frontend served (e.g., on `http://127.0.0.1:8080`), you can now use the e-commerce store application by visiting `http://127.0.0.1:8080` in your browser. The frontend JavaScript (`js/script.js`) is configured to make API calls to the backend at `http://127.0.0.1:5000/api`.

## Key Technologies

*   **Backend:** Flask (Python), SQLAlchemy (ORM), Flask-Migrate (Alembic for database migrations), Werkzeug (password hashing).
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (Single Page Application style interaction with backend API).
*   **Database:** SQLite (file-based, located at `backend/instance/database/store.db`).

## Contributing

Currently, this project is not actively seeking contributions. However, if you find issues or have suggestions, you can report them by opening an issue on the project's repository (if applicable).
(This section can be expanded with details on coding standards, branch strategy, and pull request processes if the project were open to external contributions.)