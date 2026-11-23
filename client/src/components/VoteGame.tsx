import { useState, useCallback } from 'react';

interface Game {
  id: number;
  name: string;
  maxPlayers: number;
  genre: string;
}

interface VoteGameProps {
  games: Game[];
  sendJsonMessage: (msg: { type: string; games: number[] }) => void;
}

const MAX_VOTES = 3;

export default function VoteGame({ games, sendJsonMessage }: VoteGameProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleGame = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_VOTES) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendJsonMessage({
      type: 'vote',
      games: Array.from(selected),
    });
  };

  return (
    <div className="card animate-fade-in">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold mb-1">
          Vote for Games
        </h2>
        <p className="text-gray-400 text-sm">
          Pick up to <span className="text-neon-purple font-semibold">{MAX_VOTES}</span> games you want to play
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Game list */}
        <div className="space-y-2 mb-6">
          {games.map((game) => {
            const isSelected = selected.has(game.id);
            const disabled = !isSelected && selected.size >= MAX_VOTES;

            return (
              <div
                key={game.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                className={`game-card ${isSelected ? 'game-card-selected' : ''} ${disabled ? 'opacity-40' : ''}`}
                onClick={() => !disabled && toggleGame(game.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    !disabled && toggleGame(game.id);
                  }
                }}
              >
                {/* Checkbox indicator */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-neon-purple border-neon-purple'
                      : 'border-dark-500'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Game info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    <a
                      href={`https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-blue hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      {game.name}
                    </a>
                  </div>
                  <div className="text-xs text-gray-500 flex gap-2">
                    <span className="bg-dark-600 px-2 py-0.5 rounded">{game.genre}</span>
                    <span>👥 up to {game.maxPlayers}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="btn-primary w-full text-lg py-4"
          disabled={selected.size === 0}
        >
          {selected.size === 0
            ? 'Select games to vote'
            : selected.size === MAX_VOTES
              ? `Submit ${MAX_VOTES} Votes!`
              : `Submit ${selected.size} Vote${selected.size > 1 ? 's' : ''}`}
        </button>

        <p className="text-center text-xs text-gray-500 mt-3">
          You don't need to pick all {MAX_VOTES} — vote for however many you like
        </p>
      </form>
    </div>
  );
}
