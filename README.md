# EchoTrader 🚀

A modern, production-quality paper trading platform built with **React**, **Node.js**, and **TypeScript**.

## Features

*   **Real-time Market Simulation**: Live price updates via WebSockets for both **US** and **Indian** markets.
*   **Multi-Market Support**: Seamlessly switch between US Stocks (USD) and Indian Stocks (INR).
*   **Modern UI/UX**: Sleek "Glassmorphism" design with dark mode, gradients, and neon accents.
*   **Portfolio Tracking**: Real-time P&L updates, equity tracking, and position management.
*   **Instant Order Execution**: Market orders are filled immediately at the current simulated price.

## Tech Stack

*   **Frontend**: React, Vite, TypeScript, Vanilla CSS (Variables & Theming)
*   **Backend**: Node.js, Express, TypeScript, WebSockets (`ws`)
*   **Database**: SQLite (via Prisma ORM)

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd EchoTrader
    ```

2.  **Install Dependencies**
    ```bash
    # Server
    cd server
    npm install
    
    # Client
    cd ../client
    npm install
    ```

3.  **Initialize Database**
    ```bash
    cd server
    npx prisma generate
    npx prisma db push
    ```

### Running the App

1.  **Start the Backend**
    ```bash
    cd server
    npm run dev
    ```
    Server will start on `http://localhost:3000`

2.  **Start the Frontend**
    ```bash
    cd client
    npm run dev
    ```
    Client will start on `http://localhost:5173`

3.  **Open in Browser**
    Navigate to `http://localhost:5173` and create an account to start trading!

## License
MIT
