import { useState } from 'react';

interface Suggestion {
  id: string;
  name: string;
  suggestedBy: string;
  timestamp: number;
}

interface AdminPanelProps {
  sendJsonMessage: (msg: { type: string; maxPlayers?: number; suggestionId?: string; genre?: string }) => void;
  votingState: string;
  suggestions: Suggestion[];
}

export default function AdminPanel({ sendJsonMessage, votingState, suggestions }: AdminPanelProps) {
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const presets = [2, 4, 8, 10, 16, 30, 40, 99];

  const handleStart = () => {
    sendJsonMessage({ type: 'admin/startVoting', maxPlayers });
  };

  const handleEnd = () => {
    sendJsonMessage({ type: 'admin/endVoting' });
  };

  const handleReset = () => {
    sendJsonMessage({ type: 'admin/reset' });
  };

  const handleApprove = (suggestionId: string) => {
    sendJsonMessage({ type: 'admin/approveSuggestion', suggestionId, maxPlayers: 4, genre: 'Custom' });
  };

  const handleReject = (suggestionId: string) => {
    sendJsonMessage({ type: 'admin/rejectSuggestion', suggestionId });
  };

  const isIdle = votingState === 'idle';
  const isInProgress = votingState === 'in-progress';
  const isEnded = votingState === 'ended';

  return (
    <div className="flex items-center gap-3">
      {/* Badge */}
      <span className="px-2 py-1 rounded-lg bg-neon-purple/20 text-neon-purple text-xs font-semibold border border-neon-purple/30">
        ADMIN
      </span>

      {/* Suggestions badge & panel toggle */}
      <button
        type="button"
        onClick={() => setShowSuggestions(!showSuggestions)}
        className={`relative px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
          suggestions.length > 0
            ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/30 hover:bg-neon-blue/30'
            : 'bg-dark-700 text-gray-400 border-dark-600'
        }`}
      >
        💡 Suggestions
        {suggestions.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-blue text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {suggestions.length}
          </span>
        )}
      </button>

      {/* Max players selector (only visible when idle) */}
      {isIdle && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="btn-secondary text-sm"
          >
            Max Players: {maxPlayers === 99 ? '∞' : maxPlayers} ▾
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-dark-800 border border-dark-600 rounded-xl shadow-xl shadow-black/40 z-20 overflow-hidden w-40">
              <div className="p-2">
                <p className="text-xs text-gray-500 px-2 pb-1">Filter games by max players</p>
                {presets.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      maxPlayers === n
                        ? 'bg-neon-purple/20 text-neon-purple'
                        : 'text-gray-300 hover:bg-dark-600'
                    }`}
                    onClick={() => {
                      setMaxPlayers(n);
                      setShowDropdown(false);
                    }}
                  >
                    {n === 99 ? 'No limit (∞)' : `Up to ${n} players`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      {isIdle && (
        <button type="button" className="btn-primary" onClick={handleStart}>
          ▶ Start Vote
        </button>
      )}

      {isInProgress && (
        <button type="button" className="btn-danger" onClick={handleEnd}>
          ⏹ End Vote
        </button>
      )}

      {isEnded && (
        <button type="button" className="btn-secondary" onClick={handleReset}>
          ↻ Reset
        </button>
      )}

      {/* Suggestions dropdown panel */}
      {showSuggestions && (
        <div className="absolute right-4 top-12 w-80 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl shadow-black/60 z-30 overflow-hidden">
          <div className="p-4 border-b border-dark-600">
            <h3 className="font-display font-bold text-sm">💡 Game Suggestions</h3>
            <p className="text-xs text-gray-500 mt-1">Approve to add to the vote, reject to dismiss</p>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {suggestions.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-6">No pending suggestions</p>
            ) : (
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="bg-dark-900 border border-dark-600 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{s.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          by {s.suggestedBy} · {new Date(s.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApprove(s.id)}
                          className="px-2 py-1 text-xs bg-neon-purple/20 text-neon-purple rounded hover:bg-neon-purple/30 transition-colors"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(s.id)}
                          className="px-2 py-1 text-xs bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors"
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
