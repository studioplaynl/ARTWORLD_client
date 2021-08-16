class manageSession {
  constructor() {
    this.sessionStored;
    this.user_id;
    this.username;

    this.client;
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
}

export default new manageSession();
