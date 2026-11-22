import { useState } from 'react';

interface GameSuggestionProps {
  sendJsonMessage: (msg: { type: string; name?: string }) => void;
}

export default function GameSuggestion({ sendJsonMessage }: GameSuggestionProps) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    sendJsonMessage({ type: 'suggest-game', name: name.trim() });
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
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Game name..."
            maxLength={60}
            className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/30 transition-all"
          />
          <button
            type="submit"
            className="btn-primary text-sm px-4"
            disabled={!name.trim() || submitted}
          >
            {submitted ? '✓ Sent!' : 'Suggest'}
          </button>
        </div>
      </form>
    </div>
  );
}
