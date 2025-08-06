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
    *   Python (likely FastAPI, based on project structure)
    *   (Potentially MySQL or another relational database)

## Setup and Installation

### Prerequisites

*   Node.js (LTS version recommended)
*   Python 3.x
*   npm or yarn (for Node.js package management)

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
4.  Run the backend application (example for FastAPI with Uvicorn):
    ```bash
    uvicorn main:app --reload
    ```
    Adjust the command based on your specific backend framework and entry point.

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
└── .env.local           # Environment variables for local development
└── GEMINI.md            # This document
└── ...                  # Other project-level files
```

## Contributing

Contributions are welcome! Please refer to the project's contribution guidelines (if available) for details on how to submit pull requests, report issues, and contribute to the development.

## License

(Specify your project's license here, e.g., MIT License, Apache License 2.0, etc.)
