interface ConnectionStatusProps {
  readyState: number;
  statusLabel: string;
}

export default function ConnectionStatus({ readyState, statusLabel }: ConnectionStatusProps) {
  const isConnected = readyState === 1; // ReadyState.OPEN

  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          isConnected
            ? 'bg-neon-green shadow-[0_0_8px_rgba(34,197,94,0.6)]'
            : 'bg-neon-red shadow-[0_0_8px_rgba(239,68,68,0.6)]'
        }`}
      />
      <span className={isConnected ? 'text-gray-400' : 'text-neon-red'}>
        {statusLabel}
      </span>
    </div>
  );
}
