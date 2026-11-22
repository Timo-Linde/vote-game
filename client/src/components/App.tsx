import { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Login from './Login';
import PlayersOnline from './PlayersOnline';
import VoteGame from './VoteGame';
import VotingResult from './VotingResult';
import ConnectionStatus from './ConnectionStatus';
import AdminPanel from './AdminPanel';
import VotingState from './VotingState';
import GameSuggestion from './GameSuggestion';

// ─── Types ──────────────────────────────────────────────────────
interface Game {
  id: number;
  name: string;
  maxPlayers: number;
  genre: string;
}

interface Player {
  id: string;
  name: string;
  hasVoted: boolean;
}

interface VoteResult {
  game: Game;
  count: number;
}

interface VotingResultData {
  winner: Game | null;
  results: VoteResult[];
}

interface Suggestion {
  id: string;
  name: string;
  suggestedBy: string;
  timestamp: number;
}

interface ServerMessage {
  type: string;
  value: any;
}

// ─── App ────────────────────────────────────────────────────────
function App() {
  // Derive socket URL from current host so LAN works automatically
  const socketUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;

  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket<ServerMessage>(socketUrl, {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 2000,
    });

  const [_games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [votingState, setVotingState] = useState<string>('idle');
  const [votingResult, setVotingResult] = useState<VotingResultData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Handle incoming messages
  useEffect(() => {
    if (!lastJsonMessage) return;

    switch (lastJsonMessage.type) {
      case 'games':
        setGames(lastJsonMessage.value);
        break;
      case 'filtered-games':
        setFilteredGames(lastJsonMessage.value);
        break;
      case 'players':
        setPlayers(lastJsonMessage.value);
        break;
      case 'voting-state':
        setVotingState(lastJsonMessage.value);
        if (lastJsonMessage.value !== 'in-progress') {
          setHasVoted(false);
        }
        break;
      case 'voting-result':
        setVotingResult(lastJsonMessage.value);
        break;
      case 'is-admin':
        setIsAdmin(lastJsonMessage.value);
        break;
      case 'has-voted':
        setHasVoted(lastJsonMessage.value);
        break;
      case 'suggestions':
        setSuggestions(lastJsonMessage.value);
        break;
      case 'max-players-filter':
        break;
      default:
        console.warn('Unknown message type:', lastJsonMessage.type);
    }
  }, [lastJsonMessage]);

  // Connection status label
  const statusLabel: Record<number, string> = {
    [ReadyState.CONNECTING]: 'Connecting...',
    [ReadyState.OPEN]: 'Connected',
    [ReadyState.CLOSING]: 'Closing...',
    [ReadyState.CLOSED]: 'Disconnected',
    [ReadyState.UNINSTANTIATED]: 'Not started',
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-dark-600/50 bg-dark-800/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎮</span>
          <h1 className="font-display font-bold text-xl tracking-wide bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            LAN PARTY VOTE
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus readyState={readyState} statusLabel={statusLabel[readyState]} />
          {isAdmin && <AdminPanel sendJsonMessage={sendJsonMessage} votingState={votingState} suggestions={suggestions} />}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6">
        {/* Login screen (shown when socket is open) */}
        {readyState === ReadyState.OPEN && (
          <Login sendJsonMessage={sendJsonMessage} />
        )}

        {/* Players online */}
        {players.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <PlayersOnline players={players} />
          </div>
        )}

        {/* Voting state indicator */}
        {votingState !== 'idle' && (
          <div className="mt-4 animate-slide-up">
            <VotingState votingState={votingState} />
          </div>
        )}

        {/* Active voting */}
        {filteredGames.length > 0 && votingState === 'in-progress' && !hasVoted && (
          <div className="mt-6 animate-slide-up">
            <VoteGame
              games={filteredGames}
              sendJsonMessage={sendJsonMessage}
            />
          </div>
        )}

        {/* Already voted message */}
        {votingState === 'in-progress' && hasVoted && (
          <div className="mt-6 card text-center animate-fade-in">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="font-display text-xl font-bold mb-2">Vote Submitted!</h2>
            <p className="text-gray-400">
              Waiting for other players to vote...
            </p>
          </div>
        )}

        {/* Results */}
        {votingResult && votingState === 'ended' && (
          <div className="mt-6 animate-slide-up">
            <VotingResult votingResult={votingResult} />
          </div>
        )}

        {/* Idle state message */}
        {votingState === 'idle' && filteredGames.length === 0 && (
          <div className="mt-12 text-center text-gray-500">
            <div className="text-6xl mb-4 opacity-30">🕹️</div>
            <p className="font-display text-lg">Waiting for the admin to start a vote...</p>
          </div>
        )}

        {/* Game suggestion (non-admin only) */}
        {!isAdmin && votingState === 'idle' && (
          <div className="mt-6 animate-fade-in">
            <GameSuggestion sendJsonMessage={sendJsonMessage} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-600 text-xs">
        LAN Party Vote &middot; Built for gaming sessions
      </footer>
    </div>
  );
}

export default App;
