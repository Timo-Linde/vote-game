export default function AdminPanel({sendJsonMessage}) {

    const startVoting = () => {
        sendJsonMessage({type: "admin/startVoting"})
    }

    const endVoting = () => {
        sendJsonMessage({type: "admin/endVoting"})
    }

    return (
        <div className={"mt-2"}>
            <button
                type="button"
                className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] disabled:opacity-70 active:bg-primary-700"
                onClick={startVoting}>
                Voting starten
            </button>
            <button
                type="button"
                className="ml-2 mr-2 inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] disabled:opacity-70 active:bg-primary-700"
                onClick={endVoting}>
                Voting beenden
            </button>
        </div>
    )
}