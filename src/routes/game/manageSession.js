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
        this.allConnectedUsers[i] = user.user_id;
        console.log(this.allConnectedUsers[i]);
      });
      this.createNetworkPlayers = true;
    });

    //stream
    this.socket.onstreamdata = (streamdata) => {
      // console.info("Received stream data object:", streamdata);
      console.info("Streamdata.stream:", streamdata.stream);

      console.info("Received stream data object.data:", streamdata.data);
      // let parsedData = JSON.parse(JSON.stringify(streamdata.data))
      let parsedData = JSON.parse(streamdata.data);

      console.info("Received stream data object.data.posX:", parsedData.posX);
      console.info(
        "Received stream data object.data.user_id:",
        parsedData.user_id
      ); //user_id
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
          this.allConnectedUsers[i] = user.user_id;
          console.log(this.allConnectedUsers[i]);
        });
        this.createNetworkPlayers = true;
      });

      // streampresence.joins.forEach((join) => {
      //   console.log("New user joined: %o", join.user_id);
      // });
      // streampresence.leaves.forEach((leave) => {
      //   console.log("User left: %o", leave.user_id);
      // });
    }; //end onstreampresence

    // const data = { dir: "left", steps: 4 };
    // this.socket.rpc("move_position", data);
  } //end test

  async chat(posX, posY) {
    const data =
    '{message: "user_id:"' +
    this.user_id +
    '", posX:' +
    posX +
    ', posY:' +
    posY +
    "', }";

    const data2 = {message: 'user_id:"b5b11afb-6e43-4977-bc97-dfe1fc6effe9", posX: 100, posY: 50 ', }

    this.socket.onchannelmessage = (channelMessage) => {
      console.info("Received chat message:", channelMessage.content.message);
    };

    this.socket.onstreamdata = (streamdata) => {
      // const parsedData = JSON.parse(streamdata)
      console.info("Received stream data:", streamdata);
    };

    const channelId = "movement";
    const persistence = false;
    const hidden = false;

    let response = await this.socket.joinChat(
      channelId,
      1,
      persistence,
      hidden
    );
    console.info("Successfully joined channel:", response.room_name);

    const messageAck = await this.socket.writeChatMessage(response.id, data);
    console.info("Successfully sent chat message:", messageAck);



    //stream
    this.socket.onstreamdata = (streamdata) => {
      console.info("Received stream data:", streamdata);
    };
    this.socket.onstreampresence = (streampresence) => {
      console.log(
        "Received presence event for stream: %o",
        streampresence.joins
      );
      // streampresence.joins.forEach((join) => {
      //   console.log("New user joined: %o", join.user_id);
      // });
      // streampresence.leaves.forEach((leave) => {
      //   console.log("User left: %o", leave.user_id);
      // });
    };

  } // chat

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
    const response = await this.socket.joinChat(roomname, 1, persistence, hidden);

    // // Setup initial online user list.
    // onlineUsers.concat(response.channel.presences);
    // // Remove your own user from list.
    // onlineUsers = onlineUsers.filter((user) => {
    //   return user != channel.self;
    // });
  }

  
  sendChatMessage(posX, posY) {
    console.log("sendChatMessage");
    var opCode = 1;
    // const data = '{"posX":' + posX + ', "posY":' + posY + '}'; // working
    // const data =
    //   '{"user_id":"' +
    //   this.user_id +
    //   '", "posX":' +
    //   posX +
    //   ', "posY":' +
    //   posY +
    //   " }";


    const data = `{"user_id" : "${this.user_id}", "posX": "${posX}", "posY" : "${posY}", "location": "home"}`

    // const data = '{"dir": "left", "steps": 4 }'; //working example
    console.log(data)
    this.socket.rpc("move_position", data);
  } //end sendChatMessage
} //end class

export default new manageSession();
