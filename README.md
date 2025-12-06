# SilverCloud System

The SilverCloud System is a comprehensive web-based application designed to streamline various business operations, including financial management, inventory tracking, and employee advance requests. It provides a user-friendly interface for efficient daily business activities.

## Key Features

*   **User Authentication:** Secure login and session management.
*   **Dashboard:** Provides an overview of financial data (income, expenses, stock status) with period-based filtering.
*   **Branch Management:** Functionality to manage and switch between different business branches.
*   **User & Role Management:** Tools for administering users, defining roles, and assigning permissions.
*   **Category Management:** Allows for the definition and organization of various income and expense categories.
*   **Invoice Upload (e-Fatura):** Supports uploading electronic invoices and assigning them to relevant categories.
*   **B2B Statement Upload:** Enables the upload of B2B account statements, including detailed transaction descriptions.
*   **Advance Request Management (Avans Talebi):** Users can view, add, edit, and delete advance requests. Editing, adding, and deleting are restricted to the current period, while past periods can be viewed.
*   **Other Expenses:** Module for recording and managing miscellaneous expenses.
*   **Income Entry:** Functionality to record various income sources.
*   **Stock Management:** Features for defining stock items, managing their prices, and performing stock counts.
*   **Employee Management:** Tools for managing employee data.
*   **Puantaj Management:** Functionality for managing attendance and timesheet data.

## Technologies Used

*   **Frontend:**
    *   React (with TypeScript)
    *   Vite (build tool)
    *   Tailwind CSS (for styling)
    *   XLSX library (for Excel file processing)
*   **Backend:**
    *   Python (FastAPI framework)
    *   MySQL (Database)
    *   SQLAlchemy (ORM)

## Setup and Installation

### Prerequisites

*   Node.js (LTS version recommended)
*   Python 3.x
*   npm or yarn (for Node.js package management)
*   MySQL Database (ensure it's running and accessible)

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd CopyCat
    ```
2.  Install the required Node.js packages:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The frontend application should now be accessible in your browser, typically at `http://localhost:5173`.

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  (Optional but recommended) Create and activate a Python virtual environment:
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```
3.  Install Python dependencies (assuming `requirements.txt` exists):
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure Database Connection:**
    Create a `.env.local` file in the project root directory (next to the `backend` and `CopyCat` folders) with your MySQL database credentials:
    ```
    DB_USER=your_mysql_user
    DB_PASSWORD=your_mysql_password
    DB_HOST=localhost
    DB_PORT=3306
    DB_NAME=your_database_name
    SECRET_KEY=your_super_secret_key_for_auth
    ```
    Replace `your_mysql_user`, `your_mysql_password`, `your_database_name`, and `your_super_secret_key_for_auth` with your actual database credentials and a strong secret key.

5.  Run the backend application (example for FastAPI with Uvicorn):
    ```bash
    uvicorn main:app --reload
    ```
    The backend API should now be running, typically accessible at `http://localhost:8000`.

## Usage

Once the frontend and backend servers are running:

1.  Open your web browser and go to the frontend URL (e.g., `http://localhost:5173`).
2.  Log in using your credentials.
3.  Explore the various modules available in the sidebar.

### Specific Module Notes:

*   **Avans Talebi (Advance Request):**
    *   Use the period filter to view advance requests for different months.
    *   Note that adding, editing, and deleting advance requests are only permitted for the *current* period. Past periods are read-only.
*   **B2B Ekstre (B2B Statement Upload):**
    *   When uploading Excel files, ensure they contain the following columns for proper data processing: "Tarih" (DD.AA.YYYY format), "Fiş No", "Fiş Türü", "Açıklama", "Borç", "Alacak", "Toplam Bakiye", "Fatura No", "Fatura Metni". The "Açıklama" field is crucial for detailed transaction descriptions.

## Project Structure (High-Level)

```
.
├── backend/             # Python backend application (FastAPI, database interaction)
│   ├── api/             # Defines API endpoints
│   ├── core/            # Core configurations, security utilities
│   ├── db/              # Database models and CRUD operations
│   ├── schemas/         # Pydantic schemas for data validation/serialization
│   └── venv/            # Python virtual environment
├── CopyCat/             # React frontend application
│   ├── public/          # Static assets
│   ├── src/             # Frontend source code
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Main application pages (e.g., AvansPage, B2BUploadPage)
│   │   ├── App.tsx      # Main application context and data provider setup
│   │   ├── constants.ts # Application-wide constants and mock data
│   │   └── types.ts     # TypeScript type definitions for data structures
│   └── ...              # Other frontend configuration files (package.json, tsconfig.json, vite.config.ts)
├── .env.local           # Environment variables for local development
├── .qoder/GEMINI.md     # This document (updated path)
└── ...                  # Other project-level files
```

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:
1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and ensure they adhere to the project's coding standards.
4.  Write and run tests if applicable.
5.  Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.