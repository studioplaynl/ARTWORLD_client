import { Client } from "@heroiclabs/nakama-js";
import { v4 as uuidv4 } from "uuid";

// here are the calls to the nakama server

class Nakama {
  constructor() {
    this.client;
    this.session;
    this.socket;
    this.match;
    this.matchID;
    this.deviceID;
    this.userID;
    this.connectedOpponents = [];
    this.connectedOpponent;

    this.createNetworkPlayers = false;

    this.allConnectedUsers = [];
    this.stillConnectedOpponent;
    this.ticket;
    this.gameStarted = false;

    //chat example
    this.channelId = "pineapple-pizza-lovers-room";
    this.persistence = false;
    this.hidden = false;
  }

  async authenticate() {
    this.client = new Client("defaultkey", "192.168.0.133", "7350");
    this.client.ssl = false;

    let deviceId = localStorage.getItem("deviceId");
    console.log("deviceId: " + deviceId);
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("deviceId", deviceId);
    }

    this.session = await this.client.authenticateDevice(deviceId, true);
    localStorage.setItem("user_id", this.session.user_id);
    console.log("user_id: " + this.session.user_id);
    this.userID = this.session.user_id;

    // ep4
    const trace = false;
    this.socket = this.client.createSocket(this.useSSL, trace);
    await this.socket.connect(this.session);
    //console.log("this.socket: " + this.socket);
  }

  async findMatchRPC() {
    // ep4
    const rpcid = "find_match";
    const matches = await this.client.rpc(this.session, rpcid, {});

    this.matchID = matches.payload.matchIds[0];
    this.match = await this.socket.joinMatch(this.matchID);
    console.log("Matched joined!");
    //const matchSplit = this.matchID.split(".");
    //this.matchID = matchSplit[0]
    //console.log(matchSplit[0]);
    this.socket.onmatchmakermatched = (matched) => {
      console.log("findRPC onmatched");
      //this.match = matched;
      this.gameStarted = true;
      //this.matchID = matched.users[0].presence.session_id
      this.allConnectedUsers = this.match.users;
      this.makeOpponentsArray();
    };
  }

  async findMatch() {
    // "ticket" is returned by the matchmaker.
    const query = "*";
    const minCount = 2;
    const maxCount = 4;
    this.socket.sendMatchState;
    // console.log(this.socket.sendMatchState)
    //function sendMatchState(matchId, opCode, data, presences)

    this.ticket = await this.socket.addMatchmaker(query, minCount, maxCount);
    //console.log(this.ticket) //ticket is made, but match is made on server, and will result in matchID

    // this.socket.onmatchmakermatched = (matched) => {
    //   this.match = matched;
    //   // MatchmakerMatched {
    //   //ticket: string;
    //   //match_id: string; //undefined!!
    //   //token: string;
    //   //users: MatchmakerUser[];
    //   //self: MatchmakerUser;}
    //   //
    //   this.gameStarted = true;
    //   console.log("gameStarted: " + this.gameStarted);
    //   this.matchID = matched.users[0].presence.session_id;

    //   console.log("matched.users[0].presence.session_id: ")
    //   console.log(matched.users[0].presence.session_id)

    //   this.allConnectedUsers = matched.users;
    //   this.makeOpponentsArray();
    // }
  }

  // Ping() {
  //   this.socket.sendMatchState(this.matchID, opCode, data, presence);
  // }

  async nakamaListener(){
    this.socket.onmatchdata = (result) => {
      console.info("Received match data: %o", result);
    
    }//onmatchdata

    this.socket.onmatchmakermatched = (matched) => {
      this.match = matched;
      // MatchmakerMatched {
      //ticket: string;
      //match_id: string; //undefined!!
      //token: string;
      //users: MatchmakerUser[];
      //self: MatchmakerUser;}
      //
      this.gameStarted = true;
      console.log("gameStarted: " + this.gameStarted);
      this.matchID = matched.users[0].presence.session_id;

      console.log("matched.users[0].presence.session_id: ")
      console.log(matched.users[0].presence.session_id)

      this.allConnectedUsers = matched.users;
      this.makeOpponentsArray();
    }


    this.socket.onstreamdata = (result) => {
      console.log("receive opponent")
      console.log(result.data);
    }//onstreamdata

    this.socket.onchannelmessage = (channelMessage) => {
      console.info("Received chat message:", channelMessage);
    }//Nakama.socket.onchannelmessage
    //await Nakama.socket.joinChat(Nakama.channelId, 1, Nakama.persistence, Nakama.hidden)
    console.log("succesfully joined channel: ")


  }//nakamaListener


  makeOpponentsArray() {
    for (let i = 0; i < this.allConnectedUsers.length; i++) {
      if (this.allConnectedUsers[i].presence.user_id != this.userID) {
        console.log(
          "index: " +
            i +
            " userID: " +
            this.allConnectedUsers[i].presence.user_id
        );
        this.connectedOpponents = [];
        this.connectedOpponents.push(
          this.allConnectedUsers[i].presence.user_id
        );
        this.connectedOpponent = this.allConnectedUsers[i].presence.user_id;

        console.log("this.connectedOpponent: " + this.connectedOpponent);

        this.createNetworkPlayers = true;
        console.log("createNetworkPlayers: true");
      }
    }
  }

  async makeMove(PosX, PosY) {
    //var data = { position: index };
    var data = { posX: PosX, posY: PosY }; // new code
    await this.socket.sendMatchState(this.matchID, 2, data, null);
    console.log("Match data sent");
    console.log(data);
  }
}

export default new Nakama();
