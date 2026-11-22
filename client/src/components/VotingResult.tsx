interface VotingResultData {
  winner: { id: number; name: string; maxPlayers: number; genre: string } | null;
  results: Array<{ game: { id: number; name: string; maxPlayers: number; genre: string }; count: number }>;
}

interface VotingResultProps {
  votingResult: VotingResultData;
}

export default function VotingResult({ votingResult }: VotingResultProps) {
  const { winner, results } = votingResult;

  // Find max count for bar scaling
  const maxCount = Math.max(...results.map((r) => r.count), 1);

  // Calculate percentages
  const totalVotes = results.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="card animate-fade-in">
      {/* Winner banner */}
      {winner && (
        <div className="text-center mb-8 p-6 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30">
          <div className="text-5xl mb-3">🏆</div>
          <p className="text-gray-400 text-sm mb-1">The crowd has spoken!</p>
          <h2 className="font-display text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            {winner.name}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {results.find((r) => r.game.id === winner.id)?.count} votes
          </p>
        </div>
      )}

      {/* Results list */}
      <h3 className="font-display font-semibold text-lg mb-4">Full Results</h3>
      <div className="space-y-3">
        {results.map(({ game, count }, index) => {
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const barWidth = Math.max((count / maxCount) * 100, 4);
          const isWinner = winner && game.id === winner.id;

          return (
            <div key={game.id} className="flex items-center gap-3">
              {/* Rank */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  index === 0
                    ? 'bg-neon-purple/30 text-neon-purple'
                    : index === 1
                      ? 'bg-gray-500/30 text-gray-400'
                      : index === 2
                        ? 'bg-amber-600/30 text-amber-500'
                        : 'bg-dark-600 text-gray-500'
                }`}
              >
                {index + 1}
              </div>

              {/* Game info + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium truncate ${
                      isWinner ? 'text-white' : 'text-gray-300'
                    }`}
                  >
                    {game.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {count} vote{count !== 1 ? 's' : ''} ({pct}%)
                  </span>
                </div>

                {/* Bar */}
                <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isWinner
                        ? 'bg-gradient-to-r from-neon-purple to-neon-blue'
                        : 'bg-dark-500'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
