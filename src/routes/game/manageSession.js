import { parse } from "uuid";
import { client } from "../../nakama.svelte";

class manageSession {
  constructor() {
    this.sessionStored;
    this.user_id;
    this.username;

    this.session;
    this.client;
    this.socket;

    this.joined;
    this.useSSL = false;
    this.verboseLogging = false;

    this.match;
    this.matchID;
    this.deviceID;

    this.createNetworkPlayers = false;
    this.updateNetworkPlayers = false;
    this.allConnectedUsers = [];
    this.stillConnectedOpponent;
    this.ticket;
    this.gameStarted = false;

    //chat example
    this.channelId = "pineapple-pizza-lovers-room";
    this.persistence = false;
    this.hidden = false;
  }

  async createSocket() {
    this.socket = await client.createSocket(this.useSSL, this.verboseLogging);
    console.log("socket created with client");

    const createStatus = true;
    this.session = ""; // obtained by authentication.

    this.session = await this.socket.connect(this.sessionStored, createStatus);
    console.log("session created with socket");

    await this.socket.rpc("joingo", "home").then((rec) => {
      let payload = JSON.parse(rec.payload);
      console.log(payload);

      payload.forEach((user, i) => {
        //console.log(user.user_id);
        // this.allConnectedUsers[i] = user.user_id;
        this.allConnectedUsers[i] = user;
        console.log(this.allConnectedUsers[i]);
      });
      this.createNetworkPlayers = true;
    });

    //stream
    this.socket.onstreamdata = (streamdata) => {
      // console.info("Received stream data object:", streamdata);
      //console.info("Streamdata.stream:", streamdata.stream);

      //console.info("Received stream data object.data:", streamdata.data);
      //const parsedData = JSON.parse(JSON.stringify(streamdata.data))
      const parsedData = JSON.parse(streamdata.data);

      //console.info("Received stream data object.data.posX:", parsedData.posX);
      for (let i = 0; i < this.allConnectedUsers.length; i++) {
        if (parsedData.user_id == this.allConnectedUsers[i].user_id) {
          this.allConnectedUsers[i].posX = parsedData.posX;
          this.allConnectedUsers[i].posY = parsedData.posY;
          this.updateNetworkPlayers = true;
        }
      }

      // console.info(
      //   "Received stream data object.data.user_id:",
      //   parsedData.user_id
      // ); //user_id
    };

    this.socket.onstreampresence = (streampresence) => {
      console.log(
        "Received presence event for stream: %o",
        streampresence.joins
      );

      this.socket.rpc("joingo", "home").then((rec) => {
        let payload = JSON.parse(rec.payload);
        console.log(payload);
        payload.forEach((user, i) => {
          //console.log(user.user_id);
          this.allConnectedUsers[i] = user;
          console.log(this.allConnectedUsers[i]);
        });
        this.createNetworkPlayers = true;
      });

      streampresence.joins.forEach((join) => {
        console.log("New user joined: %o", join.user_id);
      });
      streampresence.leaves.forEach((leave) => {
        console.log("User left: %o", leave.user_id);
      });
    }; //end onstreampresence
  } //end createSocket

  sendMoveMessage(posX, posY) {
    //console.log("sendPositionMessage: ");
    var opCode = 1;
    // const data = '{"posX":' + posX + ', "posY":' + posY + '}'; // working
    // const data = '{"dir": "left", "steps": 4 }'; //working example

    const data = `{"user_id" : "${this.user_id}", "posX": "${posX}", "posY" : "${posY}", "location": "home"}`;

    //console.log(data)
    this.socket.rpc("move_position", data);
  } //end sendChatMessage

  async chatExample() {
    // var onlineUsers = [];
    // this.socket.onchannelpresence = (presences) => {
    //   // Remove all users who left.
    //   onlineUsers = onlineUsers.filter((user) => {
    //     return !presences.leave.includes(user);
    //   });
    //   // Add all users who joined.
    //   onlineUsers.concat(presences.join);
    // };

    const roomname = "PizzaFans";
    const persistence = true;
    const hidden = false;

    // 1 = Room, 2 = Direct Message, 3 = Group
    const response = await this.socket.joinChat(
      roomname,
      1,
      persistence,
      hidden
    );

    // // Setup initial online user list.
    // onlineUsers.concat(response.channel.presences);
    // // Remove your own user from list.
    // onlineUsers = onlineUsers.filter((user) => {
    //   return user != channel.self;
    // });
  } //end chatExample
} //end class

export default new manageSession();
