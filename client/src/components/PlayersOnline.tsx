interface PlayersOnlineProps {
  players: Array<{ id: string; name: string; hasVoted: boolean }>;
}

export default function PlayersOnline({ players }: PlayersOnlineProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-base">
          Players Online
        </h2>
        <span className="text-xs px-2 py-1 rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30">
          {players.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700/80 border border-dark-600/50 text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse-slow" />
            <span className="text-gray-300">{player.name}</span>
            {player.hasVoted && (
              <span className="text-xs text-neon-green" title="Has voted">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
