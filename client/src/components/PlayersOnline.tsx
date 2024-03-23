
export default function PlayersOnline({players}) {
    return (
        <div className={"mt-2"}>
            <h2 className={"text-xl underline"}>Gerade Online:</h2>
            <ul className={"list-decimal ml-6"}>
                {players.map(player => {
                    return <li key={player.id}>{player.name ?? "anonymous"}</li>
                })}
            </ul>
        </div>
    )
}