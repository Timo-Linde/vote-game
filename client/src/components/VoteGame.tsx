import { useState, useCallback, useMemo } from 'react';
import { MAX_PLAYER_OPTIONS, GENRE_OPTIONS } from '../constants';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPlayersFilter, setMaxPlayersFilter] = useState<number>(0);
  const [genreFilter, setGenreFilter] = useState<string>('');

  // Filter games for display
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesName = game.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlayers = maxPlayersFilter === 0 || game.maxPlayers <= maxPlayersFilter;
      const matchesGenre = !genreFilter || game.genre === genreFilter;
      return matchesName && matchesPlayers && matchesGenre;
    });
  }, [games, searchTerm, maxPlayersFilter, genreFilter]);

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

      {/* Filters */}
      <div className="bg-dark-900/50 rounded-xl p-4 mb-6 border border-dark-600/50">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Name search */}
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Search by name</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Type to filter..."
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/30 transition-all"
            />
          </div>

          {/* Max players filter */}
          <div className="sm:w-40">
            <label className="block text-xs text-gray-500 mb-1">Max Players</label>
            <select
              value={maxPlayersFilter}
              onChange={e => setMaxPlayersFilter(Number(e.target.value))}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/30 transition-all"
            >
              <option value={0}>All</option>
              {MAX_PLAYER_OPTIONS.map(n => (
                <option key={n} value={n}>Up to {n}</option>
              ))}
            </select>
          </div>

          {/* Genre filter */}
          <div className="sm:w-40">
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/30 transition-all"
            >
              <option value="">All</option>
              {GENRE_OPTIONS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters indicator */}
        {(searchTerm || maxPlayersFilter > 0 || genreFilter) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="bg-neon-blue/20 text-neon-blue px-2 py-0.5 rounded">
                name: "{searchTerm}"
              </span>
            )}
            {maxPlayersFilter > 0 && (
              <span className="bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded">
                ≤ {maxPlayersFilter} players
              </span>
            )}
            {genreFilter && (
              <span className="bg-neon-green/20 text-neon-green px-2 py-0.5 rounded">
                {genreFilter}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setMaxPlayersFilter(0);
                setGenreFilter('');
              }}
              className="text-gray-500 hover:text-gray-300 ml-2 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Results count */}
        <div className="text-sm text-gray-400 mb-4">
          Showing {filteredGames.length} of {games.length} games
        </div>

        {/* Game list */}
        <div className="space-y-2 mb-6">
          {filteredGames.map((game) => {
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
