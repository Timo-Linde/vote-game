import { useState, useMemo } from 'react';
import { MAX_PLAYER_OPTIONS } from '../constants';

interface Game {
  id: number;
  name: string;
  maxPlayers: number;
  genre: string;
}

interface Suggestion {
  id: string;
  name: string;
  maxPlayers?: number;
  genre?: string;
  suggestedBy: string;
  timestamp: number;
}

interface GameListProps {
  games: Game[];
  suggestions: Suggestion[];
}

export default function GameList({ games, suggestions }: GameListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPlayersFilter, setMaxPlayersFilter] = useState<number>(0);
  const [genreFilter, setGenreFilter] = useState<string>('');

  // Derive genre options from the game list
  const genres = useMemo(() => {
    const set = new Set(games.map(g => g.genre));
    return Array.from(set).sort();
  }, [games]);

  // Filter games
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesName = game.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlayers = maxPlayersFilter === 0 || game.maxPlayers <= maxPlayersFilter;
      const matchesGenre = !genreFilter || game.genre === genreFilter;
      return matchesName && matchesPlayers && matchesGenre;
    });
  }, [games, searchTerm, maxPlayersFilter, genreFilter]);

  return (
    <div className="card animate-fade-in">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold mb-1">
          📋 Game Library
        </h2>
        <p className="text-gray-400 text-sm">
          Browse all {games.length} games in the library
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
            <label className="block text-xs text-gray-500 mb-1">Genre</label>
            <select
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/30 transition-all"
            >
              <option value="">All</option>
              {genres.map(g => (
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

      {/* Results count */}
      <div className="text-sm text-gray-400 mb-4">
        Showing {filteredGames.length} of {games.length} games
      </div>

      {/* Game list */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {filteredGames.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3 opacity-30">🔍</div>
            <p>No games match your filters</p>
          </div>
        ) : (
          filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-dark-900/50 border border-dark-600/50 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-dark-500/50 transition-colors"
            >
              {/* Game name with Steam link */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">
                  <a
                    href={`https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neon-blue hover:underline"
                  >
                    {game.name}
                  </a>
                </div>
                <div className="text-xs text-gray-500 flex gap-2 mt-1">
                  <span className="bg-dark-600 px-2 py-0.5 rounded">{game.genre}</span>
                  <span>👥 up to {game.maxPlayers}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pending suggestions section */}
      {suggestions.length > 0 && (
        <div className="mt-8 border-t border-dark-600 pt-6">
          <h3 className="font-display text-lg font-bold mb-1">
            💡 Pending Suggestions
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} waiting for admin review
          </p>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="bg-dark-900/50 border border-neon-blue/20 rounded-lg px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      <a
                        href={`https://store.steampowered.com/search/?term=${encodeURIComponent(s.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-blue hover:underline"
                      >
                        {s.name}
                      </a>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      by {s.suggestedBy} · {new Date(s.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex gap-2">
                      <span className="text-neon-blue">{s.maxPlayers ?? '?'} players</span>
                      <span className="text-neon-purple">{s.genre ?? 'Custom'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
