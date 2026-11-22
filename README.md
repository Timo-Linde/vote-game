# LAN Party Vote

A real-time web app for LAN parties where a group of players votes on what game to play next. One person acts as admin to start and control voting rounds, while everyone else joins, picks their favorite games, and watches live results appear.

Built for local networks -- no accounts, no cloud, no sign-up. Just open a browser on your phone or laptop and vote.

## How It Works

1. **Players join** -- open `http://<host-ip>:8080` in any browser and enter a display name.
2. **Admin sets a player filter** -- choose how many people will play (e.g. "up to 4"). Only games that support that many players are shown.
3. **Admin starts the vote** -- all connected players see a list of games and can pick up to 3 choices each.
4. **Results appear** -- once every player has voted (or the admin ends it early), a ranked results screen shows the winner and full breakdown with vote counts and percentages.
5. **Reset and repeat** -- the admin resets the board and starts a new round.

Players can also **suggest games** not in the library. The admin reviews suggestions and approves them, which adds the game to the persistent library for future rounds.

## Features

- **Real-time WebSocket updates** -- all clients sync instantly; no page refresh needed.
- **Admin controls** -- start vote, end vote early, reset, filter by player count, approve/reject game suggestions.
- **Persistent game library** -- games are stored in SQLite and survive restarts. New games can be added at runtime via the suggestion system.
- **Game suggestions** -- any player can suggest a game; the admin approves or rejects it.
- **Auto-reconnect** -- survives network drops and reconnects automatically.
- **Dark neon theme** -- built for dimly-lit LAN party environments.
- **Docker Compose** -- one command to deploy the full stack.

## Architecture

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│   Client        │  ◄──────────────────►      │   Server        │
│   React + TS    │   JSON messages on /ws      │   Node.js + ws  │
│   Tailwind CSS  │                             │   better-sqlite3│
│   nginx (proxy) │                             │   SQLite DB     │
└────────┬────────┘                             └─────────────────┘
         │
         │ port 8080
         ▼
   Your browser
```

- **Client** -- React 18 + TypeScript, styled with Tailwind CSS. Served by nginx, which also proxies `/ws` WebSocket connections to the server container.
- **Server** -- Node.js with the `ws` library for WebSocket communication and `better-sqlite3` for persistent game storage.
- **Database** -- SQLite file (`games.db`) stored in a Docker volume so the game library survives container restarts.

## Quick Start

### Prerequisites

- Docker and Docker Compose

### Run

```bash
docker compose up --build
```

Open **http://localhost:8080** in your browser. On a LAN party, other players open `http://<your-ip>:8080`.

### Admin

The default admin name is **`Admin`**. Log in with that exact name to see admin controls in the header:

| Control              | When visible    | What it does                                      |
|----------------------|-----------------|---------------------------------------------------|
| Max Players filter   | Idle            | Filter the game list by max player count           |
| Start Vote           | Idle            | Begin a voting round                               |
| End Vote             | In progress     | Show results before everyone has voted             |
| Reset                | Ended           | Clear results and return to idle                   |
| Suggestions          | Always          | Review and approve/reject player game suggestions  |

Change the admin name by editing `ADMIN_NAME` in `compose.yaml`.

## Running Locally (Development)

### Server

```bash
cd server
npm install
ADMIN_NAME="Admin" node src/app.js
```

The server listens on port **7071** by default. Set `PORT` to change it.

### Client

```bash
cd client
npm install

# Development mode with hot reload (port 3000)
npm start

# Production build
npm run build
```

> **Note:** In development mode, the React dev server runs on port 3000 but the WebSocket still points to the server at `ws://localhost:7071`. Make sure the server is running before starting the client. The client derives the WebSocket URL from `window.location.host`, so if you're running the dev server on a different port, edit `src/components/App.tsx` and hardcode the server URL:
>
> ```ts
> const socketUrl = 'ws://localhost:7071/ws';
> ```

### Environment Variables (Server)

| Variable      | Default       | Description                              |
|---------------|---------------|------------------------------------------|
| `PORT`        | `7071`        | WebSocket server port                    |
| `ADMIN_NAME`  | `Admin`       | Username that receives admin privileges  |
| `DB_PATH`     | `/data/games.db` | Path to the SQLite database file       |

## Adding Games

Games are stored in SQLite, so they persist across restarts. Two ways to add games:

1. **At runtime** -- any player suggests a game, the admin approves it from the header panel.
2. **In code** -- edit the `SEED_GAMES` array in `server/src/app.js`. New entries are only inserted on first run (when the database is empty). To add to an existing database, use the suggestion system or insert directly:
   ```sql
   INSERT OR IGNORE INTO games (name, maxPlayers, genre) VALUES ('My Game', 4, 'Custom');
   ```

## Project Structure

```
vote-game/
├── compose.yaml              # Docker Compose services
├── client/                   # React frontend
│   ├── Dockerfile            # Multi-stage: build + nginx
│   ├── nginx.conf            # Serves SPA + proxies /ws to server
│   ├── package.json          # React 18, Tailwind, react-use-websocket
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.tsx           # Root component, WebSocket state
│   │   │   ├── Login.tsx         # Name entry screen
│   │   │   ├── VoteGame.tsx      # Game selection (up to 3 votes)
│   │   │   ├── VotingResult.tsx  # Ranked results with bars
│   │   │   ├── VotingState.tsx   # Status indicator banner
│   │   │   ├── AdminPanel.tsx    # Admin controls + suggestions
│   │   │   ├── GameSuggestion.tsx# Player suggestion form
│   │   │   ├── PlayersOnline.tsx # Connected player list
│   │   │   └── ConnectionStatus.tsx
│   │   ├── index.tsx
│   │   └── index.css             # Tailwind + custom theme
│   └── tailwind.config.js        # Neon purple/blue color palette
├── server/                   # Node.js backend
│   ├── Dockerfile
│   ├── package.json          # ws, better-sqlite3
│   └── src/
│       └── app.js            # WebSocket server, vote logic, DB
└── README.md
```

## WebSocket Protocol

All communication happens over a single WebSocket connection at `/ws`. Messages are JSON objects:

### Client → Server

| Type                       | Fields                          | Description                        |
|----------------------------|---------------------------------|------------------------------------|
| `name`                     | `{ name: string }`              | Set display name on join           |
| `vote`                     | `{ games: number[] }`           | Submit vote (array of game IDs)    |
| `suggest-game`             | `{ name: string }`              | Suggest a new game                 |
| `admin/setMaxPlayers`      | `{ maxPlayers: number }`        | Set player count filter            |
| `admin/startVoting`        | --                              | Begin a voting round               |
| `admin/endVoting`          | --                              | End round and show results         |
| `admin/reset`              | --                              | Clear results, return to idle      |
| `admin/approveSuggestion`  | `{ suggestionId, maxPlayers, genre }` | Add suggested game to library |
| `admin/rejectSuggestion`   | `{ suggestionId }`              | Dismiss a suggestion               |

### Server → Client

| Type               | Value                                      | Description                        |
|--------------------|--------------------------------------------|------------------------------------|
| `filtered-games`   | `Game[]`                                   | Current game list (after filter)   |
| `players`          | `{ id, name, hasVoted }[]`                 | Connected player list              |
| `voting-state`     | `'idle' \| 'in-progress' \| 'ended'`       | Current round state                |
| `voting-result`    | `{ winner, results, totalVoters }`          | Ranked results with vote counts    |
| `reset`            | --                                         | Clear displayed results            |
| `is-admin`         | `boolean`                                  | Whether this client is the admin   |
| `suggestions`      | `{ id, name, suggestedBy, timestamp }[]`   | Pending game suggestions           |
| `max-players-filter` | `number`                                 | Current player count filter        |

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, `react-use-websocket`
- **Backend:** Node.js, `ws` (WebSocket), `better-sqlite3` (SQLite)
- **Infrastructure:** Docker Compose, nginx (reverse proxy + WebSocket upgrade)
