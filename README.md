# LAN Party Vote

A beautiful web app for LAN parties where players vote on the next game to play. One admin starts and controls the vote, players join and vote for their preferred games. Games are filterable by maximum player count.

## Features

- **WebSocket real-time** — all clients update instantly
- **Admin controls** — start vote, end vote, reset
- **Game filtering** — filter games by max player count before voting
- **Beautiful dark theme** — neon purple/blue LAN party aesthetic
- **Auto-reconnect** — survives network hiccups
- **Docker Compose** — one command to run everything

## Quick Start

### Prerequisites

- Docker & Docker Compose installed

### Run

```bash
docker compose up --build
```

Open **http://localhost:8080** in your browser. On a LAN party, other players open `http://<your-ip>:8080`.

### Admin

The default admin name is **`Admin`**. Change it by setting the `ADMIN_NAME` environment variable in `compose.yaml`.

When you log in as the admin, you'll see admin controls:

1. **Select max player count** — filters which games appear in the vote
2. **Start Vote** — begins the voting round
3. **End Vote** — shows results early (before everyone votes)
4. **Reset** — clears results and returns to idle

## Running Locally (Without Docker)

### Server

```bash
cd server
npm install
# Set admin name (optional, defaults to "Admin")
export ADMIN_NAME="Admin"
node src/app.js
```

### Client

```bash
cd client
npm install

# Development mode (auto-reloads)
npm start

# Production build
npm run build
```

> **Note:** When running locally without Docker, you need to configure the client to connect to the server. In development mode, you can set up a proxy in `package.json` or modify the socket URL in `src/components/App.tsx`.

## Configuration

### Environment Variables (Server)

| Variable     | Default | Description                    |
|-------------|---------|--------------------------------|
| `PORT`      | `7071`  | WebSocket server port          |
| `ADMIN_NAME`| `Admin` | Username that gets admin rights|

### Adding Games

Edit the `GAMES` array in `server/src/app.js`. Each game has:

```js
{ id: 1, name: 'Game Name', maxPlayers: 4, genre: 'Genre' }
```

## How It Works

1. Players open the website and enter their name
2. The admin selects a max player filter and starts the vote
3. Players pick up to 3 games they want to play
4. Once everyone has voted (or the admin ends it), results are shown
5. The game with the most votes wins

## Tech Stack

- **Backend:** Node.js + `ws` (WebSocket)
- **Frontend:** React + TypeScript + Tailwind CSS
- **Deployment:** Docker Compose + Nginx (reverse proxy + WebSocket support)
