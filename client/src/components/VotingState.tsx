interface VotingStateProps {
  votingState: string;
}

export default function VotingState({ votingState }: VotingStateProps) {
  switch (votingState) {
    case 'in-progress':
      return (
        <div className="card text-center glow-border">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-purple animate-pulse" />
            <span className="font-display font-semibold text-neon-purple">
              VOTING IN PROGRESS
            </span>
            <div className="w-3 h-3 rounded-full bg-neon-purple animate-pulse" />
          </div>
        </div>
      );

    case 'ended':
      return (
        <div className="card text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="font-display font-semibold text-neon-green">
              VOTING ENDED
            </span>
          </div>
        </div>
      );

    default:
      return null;
  }
}
