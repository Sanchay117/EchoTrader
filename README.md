# EchoTrader 🚀

A modern, production-quality paper trading platform built with **React**, **Node.js**, and **TypeScript**.

## Features

### 📈 Real-time Trading
*   **Live Market Data**: Simulated price feeds streaming via WebSockets for realistic price action.
*   **Interactive Charts**: Beautiful candlestick charts to visualize price history and trends.
*   **Instant Execution**: Market orders are filled immediately at the current simulated price.

### 🌍 Multi-Market Support
*   **US Markets**: Trade top US stocks like AAPL, TSLA, GOOGL in USD.
*   **Indian Markets**: Switch instantly to trade Indian giants like RELIANCE, TCS, HDFCBANK in INR.
*   **Smart Filtering**: Search and filter assets by name or symbol.

### 💼 Portfolio Management
*   **Real-time P&L**: Watch your equity and profit/loss update with every tick.
*   **Position Tracking**: Detailed breakdown of all your open positions.
*   **Order History**: (Coming Soon) Track all your past trades.

### 🎨 Modern Experience
*   **Glassmorphism UI**: A premium, dark-mode aesthetic with rich gradients and neon accents.
*   **Responsive Design**: Works beautifully on desktop and tablet.

## Tech Stack

*   **Frontend**: React, Vite, TypeScript, Vanilla CSS (Variables & Theming), Lightweight Charts
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

## 🚀 Future Improvements

We have an exciting roadmap to make EchoTrader the ultimate paper trading platform:

*   **Advanced Order Types**: Limit, Stop-Loss, and Take-Profit orders for better risk management.
*   **User Profiles & Leaderboards**: Compete with friends and see who has the highest alpha.
*   **Mobile Application**: A React Native mobile app for trading on the go.
*   **Social Trading**: Share your trades and follow top performers.
*   **News & Sentiment**: Real-time news feed and AI-driven sentiment analysis for each asset.
*   **Options Trading**: Support for options chains and complex strategies.

## License
MIT
