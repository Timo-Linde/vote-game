export default function VotingResult({games, votingResult}) {
    const gameVote = new Map()
    games.forEach(game => {
        gameVote.set(game.id, 0);
    })

    votingResult.forEach(([userId, games]) => {
        games.forEach(game => {
            gameVote.set(game, gameVote.get(game) + 1)
        })
    })

    return (
        <div className={"mt-2"}>
            <h2 className={"text-xl underline"}>Voting Ergebnis:</h2>
            <ul className={"list-disc ml-6"}>
                {Array.from(gameVote.entries())
                      .sort(([gameIdA, countA], [gameIdB, countB]) => countB - countA)
                      .map(([gameId, count]) => {
                    const gameName = games.find(game => game.id == gameId)?.name
                    return <li className={"first:text-red-500"} key={gameId}>
                        {gameName}: {count}
                    </li>
                })}
            </ul>
        </div>
    )
}