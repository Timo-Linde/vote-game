export default function VotingState({votingState}) {
    switch(votingState) {
        case "in-progress":
            return <span>Voting läuft derzeit...</span>;

        case "ended":
            return <span>Das Voting ist beendet!</span>;
    }
}