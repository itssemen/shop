# Backend Setup

This guide provides instructions on how to set up and run the Flask backend for this project.

## Prerequisites

- Python 3 (ensure it's installed and accessible via `python3`)
- `pip` (Python package installer)

## Setup Instructions

1.  **Navigate to the `backend` directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**
    This isolates the project's dependencies.
    ```bash
    python3 -m venv venv
    ```

3.  **Activate the virtual environment:**
    On macOS and Linux:
    ```bash
    source venv/bin/activate
    ```
    On Windows:
    ```bash
    .\venv\Scripts\activate
    ```
    Your terminal prompt should now show `(venv)` at the beginning.

4.  **Install dependencies:**
    This command installs Flask, Flask-Migrate, and other necessary packages listed in `requirements.txt`.
    ```bash
    pip install -r requirements.txt
    ```

5.  **Set the Flask application:**
    This environment variable tells Flask where your application is.
    ```bash
    export FLASK_APP=app.py
    ```
    On Windows (Command Prompt):
    ```bash
    set FLASK_APP=app.py
    ```
    On Windows (PowerShell):
    ```bash
    $env:FLASK_APP="app.py"
    ```

6.  **Run database migrations:**
    This command applies any pending database schema changes.
    ```bash
    flask db upgrade --directory migrations
    ```
    If you see "command not found: flask", ensure you have completed step 3 (activate venv) and step 4 (install dependencies) correctly.

7.  **Run the Flask application:**
    ```bash
    flask run
    ```
    The application should now be running, typically on `http://127.0.0.1:5000/`.

## Troubleshooting

-   **`flask: command not found`**:
    -   Ensure your virtual environment is activated (see step 3).
    -   Ensure you have installed the requirements (see step 4).
    -   If you've recently installed packages, sometimes deactivating (`deactivate`) and reactivating (`source venv/bin/activate`) the virtual environment can help the shell recognize new commands.
-   **PATH issues**: The `export PATH="$HOME/.local/bin:$PATH"` line from the original issue log is usually for globally installed user packages, not for virtual environment packages. Within an activated virtual environment, Python packages (like Flask) are typically found automatically. If you suspect PATH issues, ensure `venv/bin` (or `venv\Scripts` on Windows) is effectively at the start of your PATH when the venv is active.
