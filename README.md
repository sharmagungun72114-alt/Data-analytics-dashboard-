# Full-Stack Business Intelligence & Data Analytics Dashboard

A professional, GitHub-ready, full-stack Business Intelligence (BI) and Data Analytics Dashboard. This application provides a modern, beginner-friendly template for monitoring critical business indicators, compiling operational reports, reviewing client accounts, and exporting metrics as CSV sheets. 

It is designed to run entirely locally using a embedded SQLite database on top of a Node.js/Express.js backend, coupled with a high-performance React (Vite) client.

---

## 🚀 Key Features

*   **🔒 Demo Authentication**: Pure local sign-in flow (User: `admin`, Password: `admin123`) with role-based metadata, persisting across sessions.
*   **📊 KPI Performance indicators**: Real-time aggregated statistics calculated directly from SQLite datasets:
    *   *Total Revenue*: Unified earnings across product channels.
    *   *Items Sold*: Volume metric of total transacted units.
    *   *Total Customers*: Live headcount from user portfolio records.
    *   *Monthly Growth*: Dynamic month-over-month calculation comparing current (July) vs. prior month (June).
*   **📈 Rich Visual Charts**: Dynamic, beautiful, and interactive charts powered by **Chart.js** via `react-chartjs-2`:
    *   *Sales Trend*: Area/line chart tracking earnings across multi-month calendars.
    *   *Customer Status*: Pie/Donut chart breaking down Active vs. Inactive clients.
    *   *Revenue by Category*: Bar chart representing sales performance per sector (Software, Electronics, Furniture, etc.).
*   **👥 Enterprise Accounts Table**: High-fidelity records table supporting:
    *   *Search*: Real-time keyword filtering.
    *   *Sort*: Interactive column sorting (Name, Revenue, Signup Date).
    *   *Filters*: Filter on Active/Inactive state.
    *   *Pagination*: Limits result set with responsive navigation controls.
*   **📥 CSV & JSON Interoperability**:
    *   *Export CSV*: Directly query SQLite and download RFC-compliant CSV spreadsheet logs.
    *   *Import JSON*: Batch-upload corporate customer datasets with schema validation and syntax help cards.
*   **📄 Executive Operational Reports**: Filter and review corporate summaries. Clicking on reports loads a detailed view modal.
*   **🎨 Responsive Slate Theme**: Stunning design using custom Plain CSS featuring both **Dark Mode** and **Light Mode** configurations.

---

## 🛠️ Technology Stack

### Frontend
*   **React (Vite)**: Version 19, fast, lightweight, and type-safe.
*   **React Router Dom**: Dynamic browser path routing.
*   **Chart.js / React-Chartjs-2**: High-performance canvas-based visualization.
*   **Axios**: Server communication and API client.
*   **Lucide-React**: Modern, clean vector icon suite.
*   **Plain CSS**: Custom variables, responsive grid systems, and transition animations without Tailwind bloat.

### Backend & Database
*   **Node.js & Express.js**: Asynchronous API server.
*   **SQLite3**: Clean SQL backend storing data in a local `database.sqlite` file.
*   **TypeScript (tsx & esbuild)**: Native TypeScript server compiled to standalone bundle `dist/server.cjs`.

---

## 📁 Folder Structure

```text
data-analytics-dashboard/
├── server/
│   └── db.ts            # SQLite database connections, tables schema, and data seeds
├── src/
│   ├── components/
│   │   └── Sidebar.tsx  # Dynamic sidebar navigation drawer
│   ├── pages/
│   │   ├── Dashboard.tsx # Aggregated KPI metrics and main graphs
│   │   ├── Analytics.tsx # Dual-axis volume charts and top product tables
│   │   ├── Reports.tsx   # Operational summaries with detailed drawers
│   │   ├── Customers.tsx # Complete account matrix with import/export capabilities
│   │   ├── Settings.tsx  # Dark mode toggles and local storage sync
│   │   ├── Profile.tsx   # Edit display name and email address inside SQLite
│   │   └── NotFound.tsx  # Professional custom 404 page
│   ├── App.tsx          # Router, session, and global theme configurations
│   ├── main.tsx         # Virtual DOM entry point
│   ├── index.css        # Professional Plain CSS stylesheet (Variables, Dark mode, Table styles)
│   └── types.ts         # Shared interfaces and database models
├── server.ts            # Entry-point Express server, Vite middleware, and API endpoints
├── metadata.json        # Container permissions configuration
├── package.json         # Unified client-server scripts & dependencies
└── README.md            # Project guide and manuals
```

---

## ⚙️ Installation & Running locally

Ensure you have **Node.js** (v18+) installed on your local computer.

1.  **Clone / Unzip the Project**:
    ```bash
    cd data-analytics-dashboard
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The application will launch on **`http://localhost:3000`** containing both the React frontend and the Express backend working seamlessly under hot module reloading.

4.  **Build for Production**:
    ```bash
    npm run build
    ```
    This produces a highly compressed production build inside `dist/` and bundles the Express backend server into a single file `dist/server.cjs`.

5.  **Start Production Server**:
    ```bash
    npm run start
    ```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Query/Body Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/login` | Simple session authentication | `body: { username, password }` |
| **GET** | `/api/dashboard` | Compiles primary KPIs and chart coordinates | None |
| **GET** | `/api/analytics` | High-level business analytical numbers | None |
| **GET** | `/api/customers` | Searches, sorts, and filters customer profiles | `search`, `status`, `sortBy`, `sortOrder`, `page`, `limit` |
| **GET** | `/api/reports` | Queries business operational statements | `search`, `category`, `status` |
| **PUT** | `/api/profile` | Updates logged-in user profile inside SQLite | `body: { id, name, email }` |
| **POST** | `/api/import` | Batch-imports new portfolios into database | `body: { type: 'customers'\|'sales', data: [] }` |
| **GET** | `/api/export` | Generates and stream downloads data as CSV | `type: 'customers'\|'sales'` |

---

## 🔮 Future Improvements

1.  **Advanced Access Control (RBAC)**: Support multiple user levels (e.g., Guest, Editor, Admin) with corresponding route write blocks.
2.  **External DB Dialects**: Structure query adapters to seamlessly toggle between SQLite, PostgreSQL, or MySQL via Drizzle ORM or custom query builders.
3.  **Real-Time Subscriptions**: Integrate WebSocket channels for live ticket sale triggers and visual progress pulses.
4.  **Auto-Sourced Exchange Rates**: Fetch currency conversions dynamically to toggle visual output between USD, EUR, and GBP.

---

## 📄 License

This project is licensed under the Apache-2.0 License - see the code files for license headers.
