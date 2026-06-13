# Box Cricket Live Scoring App

A real-time live scoring application for Box Cricket tournaments with an Admin Dashboard and a Broadcast TV Graphic.

## Prerequisites

1. **Node.js** (v14 or higher recommended)
2. **PostgreSQL** database server

## Database Setup

1. Make sure you have PostgreSQL installed and running.
2. The application expects a database named `box_cricket`.
3. The default database credentials in `server.js` are:
   - **User:** `postgres`
   - **Password:** `toor`
   - **Host:** `localhost`
   - **Port:** `5432`
   *(If your credentials differ, update them in `server.js` or the relevant config files).*
4. The database schema and initial state will be automatically created and seeded the first time you start the server.

## Installation

1. Open a terminal in the project folder (`box_cricket`).
2. Install the required Node.js dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   npm start
   ```
   *You should see output indicating that the backend server is running on `http://localhost:3000` and has connected to the PostgreSQL database.*

2. **Admin Panel:**
   - Open `admin.html` in your web browser (or double-click the file).
   - Use this dashboard to update scores, take wickets, and manage the match.

3. **Live TV Broadcast Graphic:**
   - Open `index.html` in your web browser (or double-click the file).
   - Move this window to your extended TV/Monitor and make it fullscreen (F11).
   - This screen will automatically sync with the Admin Panel in real-time.

## Features

- **Real-Time Sync:** Powered by Socket.IO, updates from the admin panel appear instantly on the broadcast screen.
- **Dynamic Overlays:** Automated animations for FOUR, SIX, WICKETS, FREE HITS, and End of Over Summaries.
- **Match State Resilience:** The current match state is constantly saved to the PostgreSQL database, meaning you can refresh or restart without losing the score.
- **Undo System:** Make a mistake? Use the "Undo Last Action" button in the admin panel.
- **High-Quality Player Images:** Supports uploading and syncing base64 encoded player images dynamically.
