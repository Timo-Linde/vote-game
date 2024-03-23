import {useEffect, useState} from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Login from "./Login";
import PlayersOnline from "./PlayersOnline";
import VoteGame from "./VoteGame";
import VotingState from "./VotingState";
import ConnectionStatus from "./ConnectionStatus";
import VotingResult from "./VotingResult";
import AdminPanel from "./AdminPanel";

type MessageFromBackend = {
  type: string;
  value: any;
}

function App() {
  const socketUrl = "ws://coke-pc:7071/ws"
  const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState } = useWebSocket<MessageFromBackend>(socketUrl);
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  const [games, setGames] = useState();
  const [players, setPlayers] = useState();
  const [votingState, setVotingState] = useState("ended");
  const [votingResult, setVotingResult] = useState();
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    if(!lastJsonMessage) {
      return;
    }

    console.log("received Message From server:", lastJsonMessage);

    switch((lastJsonMessage as MessageFromBackend).type) {
      case "games":
        setGames(lastJsonMessage.value);
        break;
      case "players":
        setPlayers(lastJsonMessage.value);
        break;
      case "voting-state":
        setVotingState(lastJsonMessage.value);
        break;
      case "voting-result":
        setVotingResult(lastJsonMessage.value)
        break;
      case "is-admin":
        setIsAdmin(lastJsonMessage.value);
        break
      default:
        console.error("unknown event", lastJsonMessage);
        break;
    }

  }, [lastJsonMessage]);

  return (
    <div>
      <div className={"flex justify-between"}>
        <ConnectionStatus connectionStatus={connectionStatus}/>
        {isAdmin &&
          <AdminPanel sendJsonMessage={sendJsonMessage}/>}
      </div>

      <section className="mt-5 ml-20 mr-20">

        {ReadyState.OPEN &&
          <Login sendJsonMessage={sendJsonMessage}/>}

        {players &&
          <PlayersOnline players={players}/>}

        { false &&
          <div className={"mt-2"}>
            <VotingState votingState={votingState}/>
          </div>}

        {games && votingState == "in-progress" &&
          <VoteGame games={games} sendJsonMessage={sendJsonMessage}/>}

        {votingResult && votingState == "ended" &&
          <VotingResult games={games} votingResult={votingResult}/>}

      </section>
    </div>
  );
}

export default App;
