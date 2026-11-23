const WebSocket = require('ws');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// ─── Configuration ───────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 7071;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const DB_PATH = process.env.DB_PATH || '/data/games.db';

// ─── SQLite Setup ────────────────────────────────────────────────
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create games table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    maxPlayers INTEGER NOT NULL DEFAULT 4,
    genre TEXT NOT NULL DEFAULT 'Custom'
  )
`);

// ─── Seed Games ──────────────────────────────────────────────────
const SEED_GAMES = [
  { name: 'Left 4 Dead 2',               maxPlayers: 4,  genre: 'Co-op Shooter' },
  { name: 'Counter-Strike 2',            maxPlayers: 10, genre: 'FPS' },
  { name: 'Dota 2',                      maxPlayers: 10, genre: 'MOBA' },
  { name: 'Minecraft',                   maxPlayers: 16, genre: 'Sandbox' },
  { name: 'Among Us',                    maxPlayers: 15, genre: 'Party' },
  { name: 'Portal 2',                    maxPlayers: 4,  genre: 'Puzzle' },
  { name: 'Overwatch 2',                 maxPlayers: 12, genre: 'FPS' },
  { name: 'Valorant',                    maxPlayers: 10, genre: 'FPS' },
  { name: 'Rocket League',               maxPlayers: 8,  genre: 'Sports' },
  { name: 'Team Fortress 2',             maxPlayers: 12, genre: 'FPS' },
  { name: "Garry's Mod",                 maxPlayers: 32, genre: 'Sandbox' },
  { name: 'Rust',                        maxPlayers: 100, genre: 'Survival' },
  { name: 'Dead by Daylight',            maxPlayers: 8,  genre: 'Horror' },
  { name: 'Fall Guys',                   maxPlayers: 40, genre: 'Party' },
  { name: 'Brawlhalla',                  maxPlayers: 8,  genre: 'Fighting' },
  { name: 'Human: Fall Flat',            maxPlayers: 8,  genre: 'Puzzle' },
  { name: 'Keep Talking and Nobody Explodes', maxPlayers: 10, genre: 'Party' },
  { name: 'Jackbox Party Pack',          maxPlayers: 16, genre: 'Party' },
  { name: 'Mario Kart 8',               maxPlayers: 8,  genre: 'Racing' },
  { name: 'Super Smash Bros',            maxPlayers: 8,  genre: 'Fighting' },
  { name: 'Learn to Fish Together',      maxPlayers: 4,  genre: 'Party' },
  { name: 'Gamble with Your Friends',    maxPlayers: 4,  genre: 'Party' },
  { name: 'Goat Simulator 3',            maxPlayers: 4,  genre: 'Party' },
  { name: 'Pico Park',                   maxPlayers: 8,  genre: 'Co-op' },
  { name: 'Overcooked! 2',               maxPlayers: 4,  genre: 'Party' },
  { name: 'Lovers in a Dangerous Spacetime', maxPlayers: 4, genre: 'Co-op' },
  { name: 'Cuphead',                     maxPlayers: 2,  genre: 'Action' },
  { name: 'Castle Crashers',             maxPlayers: 4,  genre: 'Action' },
  { name: 'PlateUp!',                    maxPlayers: 4,  genre: 'Party' },
  { name: 'Moving Out 2',                maxPlayers: 4,  genre: 'Party' },
  { name: 'Gang Beasts',                 maxPlayers: 4,  genre: 'Party' },
  { name: 'Buckshot Roulette',           maxPlayers: 2,  genre: 'Party' },
  { name: 'Party Animals',               maxPlayers: 8,  genre: 'Party' },
  { name: 'Stumble Guys',                maxPlayers: 32, genre: 'Party' },
  { name: 'Lethal Company',              maxPlayers: 4,  genre: 'Co-op Horror' },
];

// Seed only if table is empty
const count = db.prepare('SELECT COUNT(*) as c FROM games').get();
if (count.c === 0) {
  const insert = db.prepare('INSERT OR IGNORE INTO games (name, maxPlayers, genre) VALUES (?, ?, ?)');
  const seed = db.transaction(() => {
    for (const g of SEED_GAMES) {
      insert.run(g.name, g.maxPlayers, g.genre);
    }
  });
  seed();
  console.log(`  [💾] Seeded ${SEED_GAMES.length} games`);
}

// ─── Game helpers ────────────────────────────────────────────────
function loadGames() {
  return db.prepare('SELECT * FROM games ORDER BY id').all();
}

let GAMES = loadGames();
let nextGameId = GAMES.length ? Math.max(...GAMES.map(g => g.id)) + 1 : 1;

function addGameToDb(name, maxPlayers, genre) {
  try {
    const stmt = db.prepare('INSERT INTO games (name, maxPlayers, genre) VALUES (?, ?, ?)');
    const info = stmt.run(name, maxPlayers, genre);
    nextGameId = info.lastInsertRowid + 1;
    GAMES = loadGames();
    return true;
  } catch (e) {
    // Duplicate name or other error
    console.log(`  [!] Failed to add game "${name}": ${e.message}`);
    return false;
  }
}

// ─── State ───────────────────────────────────────────────────────
const clients = new Map();
const votes = new Map();
let votingState = 'idle';
let maxPlayersFilter = 0; // 0 = no filter (show all games)

// Game suggestions queue (in-memory, not persisted)
const suggestions = [];

// ─── Helpers ─────────────────────────────────────────────────────
function getActiveClients() {
  const active = new Map();
  for (const [id, ws] of clients) {
    if (ws.readyState === WebSocket.OPEN) active.set(id, ws);
    else clients.delete(id);
  }
  return active;
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getPlayerNames() {
  return Array.from(clients.values()).map(ws => ({
    id: ws.metadata.id,
    name: ws.metadata.name || 'anonymous',
    hasVoted: votes.has(ws.metadata.id),
  }));
}

function sendEvent(ws, type, value) {
  ws.send(JSON.stringify({ type, value }));
}

function broadcastPlayers() {
  const players = getPlayerNames();
  const msg = JSON.stringify({ type: 'players', value: players });
  for (const ws of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function broadcastVotingState() {
  const msg = JSON.stringify({ type: 'voting-state', value: votingState });
  for (const ws of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function broadcastFilteredGames() {
  const filtered = maxPlayersFilter > 0
    ? GAMES.filter(g => g.maxPlayers >= maxPlayersFilter)
    : GAMES;
  const msg = JSON.stringify({ type: 'filtered-games', value: filtered });
  for (const ws of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function broadcastAllGames() {
  const msg = JSON.stringify({ type: 'all-games', value: GAMES });
  for (const ws of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function broadcastMaxPlayersFilter() {
  const msg = JSON.stringify({ type: 'max-players-filter', value: maxPlayersFilter });
  for (const ws of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function broadcastSuggestions() {
  const msg = JSON.stringify({ type: 'suggestions', value: suggestions });
  for (const ws of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function broadcastVotingResult() {
  // Aggregate votes
  const gameVoteCount = new Map();
  for (const gameIds of votes.values()) {
    for (const gameId of gameIds) {
      gameVoteCount.set(gameId, (gameVoteCount.get(gameId) || 0) + 1);
    }
  }

  // Build sorted results
  const results = GAMES
    .filter(g => gameVoteCount.has(g.id))
    .map(g => ({
      game: g,
      count: gameVoteCount.get(g.id),
    }))
    .sort((a, b) => b.count - a.count);

  const winner = results.length > 0 ? results[0].game : null;

  const msg = JSON.stringify({
    type: 'voting-result',
    value: { winner, results, totalVoters: votes.size },
  });
  for (const ws of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function broadcastReset() {
  const msg = JSON.stringify({ type: 'reset' });
  for (const ws of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

// ─── WebSocket Server ────────────────────────────────────────────
const wss = new WebSocket.Server({ port: PORT, host: '0.0.0.0' });

wss.on('connection', ws => {
  const id = uuidv4();
  ws.metadata = { id };

  clients.set(id, ws);

  // Send initial state
  broadcastFilteredGames();
  broadcastAllGames();
  broadcastPlayers();
  broadcastVotingState();
  broadcastMaxPlayersFilter();
  broadcastSuggestions();

  console.log(`  [+] Player connected (${clients.size} online)`);

  ws.on('message', data => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch {
      console.log('  [!] Invalid JSON');
      return;
    }

    switch (message.type) {
      // ── Set player name ──────────────────────────────────────
      case 'name':
        ws.metadata.name = message.name;
        broadcastPlayers();
        sendEvent(ws, 'is-admin', ws.metadata.name === ADMIN_NAME);
        break;

      // ── Vote ─────────────────────────────────────────────────
      case 'vote':
        if (votingState !== 'in-progress') {
          console.log(`  [!] Vote rejected — state is ${votingState}`);
          return;
        }
        votes.set(ws.metadata.id, message.games);
        broadcastPlayers();

        // Auto-end when all active clients have voted
        if (votes.size === getActiveClients().size) {
          votingState = 'ended';
          broadcastVotingState();
          broadcastVotingResult();
          console.log('  [✓] All players voted — results sent');
        }
        break;

      // ── Admin: set max player filter ─────────────────────────
      case 'admin/setMaxPlayers':
        if (ws.metadata.name !== ADMIN_NAME) return;
        maxPlayersFilter = message.maxPlayers;
        broadcastMaxPlayersFilter();
        broadcastFilteredGames();
        console.log(`  [⚙] Max players filter set to ${maxPlayersFilter}`);
        break;

      // ── Admin: start voting ──────────────────────────────────
      case 'admin/startVoting':
        if (ws.metadata.name !== ADMIN_NAME) return;
        votes.clear();
        votingState = 'in-progress';
        broadcastPlayers();
        broadcastVotingState();
        broadcastFilteredGames();
        console.log('  [▶] Voting started');
        break;

      // ── Admin: end voting ────────────────────────────────────
      case 'admin/endVoting':
        if (ws.metadata.name !== ADMIN_NAME) return;
        votingState = 'ended';
        broadcastVotingState();
        broadcastVotingResult();
        console.log('  [⏹] Voting ended by admin');
        break;

      // ── Admin: reset ─────────────────────────────────────────
      case 'admin/reset':
        if (ws.metadata.name !== ADMIN_NAME) return;
        votes.clear();
        votingState = 'idle';
        broadcastPlayers();
        broadcastVotingState();
        broadcastReset();
        console.log('  [↺] Voting reset by admin');
        break;

      // ── Player: suggest a game ───────────────────────────────
      case 'suggest-game':
        const playerName = ws.metadata.name || 'anonymous';
        const suggestion = {
          id: uuidv4(),
          name: message.name,
          maxPlayers: message.maxPlayers || 4,
          genre: message.genre || 'Custom',
          suggestedBy: playerName,
          timestamp: Date.now(),
        };
        suggestions.push(suggestion);
        broadcastSuggestions();
        console.log(`  [💡] ${playerName} suggested "${suggestion.name}" (${suggestion.maxPlayers} players, ${suggestion.genre})`);
        break;

      // ── Admin: approve suggestion ────────────────────────────
      case 'admin/approveSuggestion':
        if (ws.metadata.name !== ADMIN_NAME) return;
        const idx = suggestions.findIndex(s => s.id === message.suggestionId);
        if (idx === -1) return;
        const approved = suggestions[idx];

        // Use suggested values, allow admin override
        const finalMaxPlayers = message.maxPlayers ?? approved.maxPlayers ?? 4;
        const finalGenre = message.genre ?? approved.genre ?? 'Custom';

        // Add to database (persistent)
        if (addGameToDb(approved.name, finalMaxPlayers, finalGenre)) {
          suggestions.splice(idx, 1);
          broadcastSuggestions();
          broadcastFilteredGames();
          broadcastAllGames();
          console.log(`  [✓] Admin approved "${approved.name}" — added to games (${GAMES.length} total)`);
        } else {
          // Game already exists — still remove suggestion
          suggestions.splice(idx, 1);
          broadcastSuggestions();
          console.log(`  [⚠] "${approved.name}" already in library — removed from suggestions`);
        }
        break;

      // ── Admin: reject suggestion ─────────────────────────────
      case 'admin/rejectSuggestion':
        if (ws.metadata.name !== ADMIN_NAME) return;
        const ridx = suggestions.findIndex(s => s.id === message.suggestionId);
        if (ridx === -1) return;
        const rejected = suggestions[ridx];
        suggestions.splice(ridx, 1);

        broadcastSuggestions();
        console.log(`  [✗] Admin rejected "${rejected.name}"`);
        break;

      default:
        console.log(`  [?] Unknown event: ${message.type}`);
    }
  });

  ws.on('close', () => {
    votes.delete(ws.metadata.id);
    clients.delete(id);
    broadcastPlayers();
    console.log(`  [-] Player disconnected (${clients.size} online)`);
  });

  ws.on('error', err => {
    console.error(`  [!] WebSocket error: ${err.message}`);
  });
});

// ─── Startup ─────────────────────────────────────────────────────
console.log('\n  🎮  Vote Game Server');
console.log('  ──────────────────');
console.log(`  Port:       ${PORT}`);
console.log(`  Admin name: ${ADMIN_NAME}`);
console.log(`  Games:      ${GAMES.length} loaded`);
console.log(`  Database:   ${DB_PATH}\n`);
