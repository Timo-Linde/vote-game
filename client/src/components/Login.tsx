import { useState, useRef, useEffect } from 'react';

interface LoginProps {
  sendJsonMessage: (msg: { type: string; name: string }) => void;
}

export default function Login({ sendJsonMessage }: LoginProps) {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    sendJsonMessage({ type: 'name', name: username.trim() });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card text-center animate-fade-in">
        <div className="text-4xl mb-2">👋</div>
        <p className="text-gray-300">
          Welcome, <span className="font-semibold text-neon-purple">{username}</span>!
        </p>
      </div>
    );
  }

  return (
    <div className="card text-center animate-fade-in">
      <h2 className="font-display text-xl font-bold mb-4">
        What's your name?
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
        <input
          ref={inputRef}
          type="text"
          className="input-field"
          placeholder="Enter your name..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          autoComplete="off"
        />
        <button type="submit" className="btn-primary whitespace-nowrap">
          Join
        </button>
      </form>
    </div>
  );
}
