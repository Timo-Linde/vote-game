const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 7071 });
const clients = new Map();
let votes = new Map();
const VotingEndedState = "ended";
const VotingInProgressState = "in-progress";
let votingState = VotingEndedState;
const adminName = "CoKe";

const gameNames = ["Left 4 Dead", "DooM", "Counter-Strike 2", "League of Legends", "Call of Duty 4"]
const games = gameNames.map((gameName, index) => {return {id: index, name: gameName}});

function getActiveClients(clients) {
    const activeClients = new Map();
    clients.forEach((client, ws) => {
      if(ws.readyState === WebSocket.WebSocket.OPEN) {
          activeClients.set(ws, client);
      }
    })
    return activeClients;
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getPlayerNames(clients) {
    return clients.forEach(client => {
        return client.name || "anonymous"
    })
}

function getPlayers(clients) {
    return Array.from(clients.values())
}

function sendEvent(ws, type, value) {
    ws.send(JSON.stringify({type: type, value: value}));
}

function broadcastPlayers(clients) {
    console.log("broadcastPlayers to '", clients.size, "' clients");
    clients.forEach((client, ws) => {
        sendEvent(ws, "players", getPlayers(clients));
    })
}

function broadcastVotingState(clients, votingState) {
    clients.forEach((client, ws) => {
        sendEvent(ws, "voting-state", votingState);
    })
}

function broadcastVotingResult(clients, votes) {
    clients.forEach((client, ws) => {
        sendEvent(ws, "voting-result", Array.from(votes));
    })
}

wss.on('connection', (ws) => {
    console.log("on connection");
    const id = uuidv4();
    const metadata = { id };
    clients.set(ws, metadata);

    sendEvent(ws, "games", games);
    sendEvent(ws, "players", getPlayers(getActiveClients(clients)));
    sendEvent(ws, "voting-state", votingState);

    ws.on('message', (messageAsString) => {
      const message = JSON.parse(messageAsString);
      const metadata = clients.get(ws);
      console.log("message received:", message);

      switch(message.type) {
        case "name":
            metadata.name = message.name;
            broadcastPlayers(getActiveClients(clients));
            sendEvent(ws, "is-admin", adminName === message.name)
            break;

        case "vote":
            if(votingState === VotingInProgressState) {
                votes.set(id, message.games)
            }

            //if everyone voted: Broadcast votes and state to everyone.
            if(getActiveClients(clients).size === votes.size) {
                votingState = VotingEndedState;
                broadcastVotingState(getActiveClients(clients), votingState);
                broadcastVotingResult(getActiveClients(clients), votes);
            }
            break;

        case "admin/startVoting":
            if(adminName === metadata.name) {
                votes = new Map();
                votingState = VotingInProgressState;
            }
            broadcastVotingState(getActiveClients(clients), votingState);
            break;

        case "admin/endVoting":
            if(adminName === metadata.name) {
                votingState = VotingEndedState;
            }
            broadcastVotingState(getActiveClients(clients), votingState);
            broadcastVotingResult(getActiveClients(clients), votes);
        break;

        default:
            console.error("unknown event", message);
            break;
     }
  });
});


