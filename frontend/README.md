# 🚀 MeetUp App - Frontend (Vite & TypeScript)

This directory contains the frontend application for the MeetUp project, built using **React** and **TypeScript**, and bundled with **Vite**.

---

## 🛠️ Technology Stack Overview

* **Framework:** React
* **Language:** TypeScript
* **Bundler/Dev Server:** Vite
* **Routing:** React Router DOM
* **Styling:** SCSS (Sass)

---

## ⚙️ Local Development (Getting Started)

These instructions are only for running the **frontend application**. You must ensure the **backend server** is also running for the application to fetch data!

### 1. Navigate and Install

Navigate into the frontend directory and install all necessary dependencies.

```bash
cd frontend
npm install
```

### 2. Available Scripts

Here are the primary commands you can run in this directory:

```bash
|  Command          | Description                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`     | Starts the development server. The application runs on [http://localhost:5173/](http://localhost:5173/) (or a sequential open port, e.g., 5174, if 5173 is in use). |
| `npm run build`   | Builds the application for production into the `./dist` directory.                                                                                                  |
| `npm run lint`    | Runs linting (ESLint) to identify code style and syntax issues.                                                                                                     |
| `npm run preview` | Serves the production build from `./dist` locally for final testing.                                                                                                |
```

Note on Warnings: During development, you might see Sass deprecation warnings. These are due to the use of outdated `@import` and global color functions (darken(), lighten()). We are in the process of migrating this syntax to the modern `@use` module system.

### 3. Access the Application

After running `npm run dev`, open your web browser and navigate to the address provided in your terminal, typically:

[http://localhost:5174/](http://localhost:5174/)

📚 Learn More 1

-Vite Documentation: [https://vitejs.dev/guide/](ttps://vitejs.dev/guide/)
-React Documentation: [https://react.dev/Sass](https://react.dev/Sass)
-Module System (@use): [https://sass-lang.com/documentation/at-rules/use](https://sass-lang.com/documentation/at-rules/use)
ci test Fri Oct 31 21:22:54 CET 2025 # ändra nåt i frontend/

FE
