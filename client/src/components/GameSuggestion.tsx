import { useState } from 'react';

interface GameSuggestionProps {
  sendJsonMessage: (msg: { type: string; name?: string; maxPlayers?: number; genre?: string }) => void;
}

const GENRE_OPTIONS = [
  'Party', 'FPS', 'Co-op', 'MOBA', 'Sandbox', 'Puzzle',
  'Survival', 'Horror', 'Fighting', 'Sports', 'Racing',
  'Action', 'RPG', 'Strategy', 'Simulation', 'Custom',
];

export default function GameSuggestion({ sendJsonMessage }: GameSuggestionProps) {
  const [name, setName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [genre, setGenre] = useState('Party');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    sendJsonMessage({ type: 'suggest-game', name: name.trim(), maxPlayers, genre });
    setName('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="card mt-4">
      <h3 className="font-display text-lg font-bold mb-2">
        💡 Suggest a Game
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        Don't see your favorite? Suggest it to the admin!
      </p>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Game name..."
            maxLength={60}
            className="bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/30 transition-all"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Max Players</label>
              <select
                value={maxPlayers}
                onChange={e => setMaxPlayers(Number(e.target.value))}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/30 transition-all"
              >
                {[2, 4, 5, 8, 10, 16, 32, 64, 100].map(n => (
                  <option key={n} value={n}>{n} players</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/30 transition-all"
              >
                {GENRE_OPTIONS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary text-sm px-6"
              disabled={!name.trim() || submitted}
            >
              {submitted ? '✓ Sent!' : 'Suggest'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
