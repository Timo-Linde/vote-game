export default function ConnectionStatus({connectionStatus}) {
    const colorClass = connectionStatus == "Open" ? "text-green-500": "text-red-500";
    return <div className="mt-2 ml-2">
        Websocket Status: <span className={`${colorClass}`}>{connectionStatus}</span>
    </div>
}