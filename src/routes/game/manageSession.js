import { client, SSL } from "../../nakama.svelte";

class manageSession {
  constructor() {
    this.sessionStored;
    this.user_id;
    this.username;

    this.session;
    this.client;
    this.socket;

    this.joined;
    this.useSSL = SSL;
    this.verboseLogging = false;

    this.match;
    this.matchID;
    this.deviceID;

    this.createOnlinePlayers = false;
    this.updateOnlinePlayers = false;
    this.allConnectedUsers = [];
    this.allConnectedUsersPrev = [];
    this.stillConnectedOpponent;
    this.ticket;
    this.gameStarted = false;

    //chat example
    this.channelId = "pineapple-pizza-lovers-room";
    this.persistence = false;
    this.hidden = false;

    //timers
    this.updateMovementTimer = 0;
    this.updateMovementInterval = 30; //20 fps
  }

  async createSocket() {
    this.socket = await client.createSocket(this.useSSL, this.verboseLogging);
    console.log("socket created with client");

    const createStatus = true;
    this.session = ""; // obtained by authentication.

    this.session = await this.socket.connect(this.sessionStored, createStatus);
    console.log("session created with socket");

    await this.joinStream("home");

    await this.getStreamUsers("home");


    //stream
    this.socket.onstreamdata = (streamdata) => {
      console.info("Received stream data:", streamdata);
      let data = JSON.parse(streamdata.data);
      for (const user of this.allConnectedUsers) {
        if (user.user_id == data.user_id) {
          console.log("test");
          user.posX = data.posX;
          user.posY = data.posY;
        }
      }
      // console.log(this.allConnectedUsers);
      // var newPos = this.allConnectedUsers;
      // this.allConnectedUsers = newPos;
      this.updateOnlinePlayers = true
    };

    // this.getStreamUsers("home")

    this.socket.onstreampresence = (streampresence) => {
      console.log(
          "Received presence event for stream: %o",
          streampresence
      );

      console.log("leaves:" + streampresence.leaves);
      if (!!streampresence.leaves) {
          streampresence.leaves.forEach((leave) => {
              console.log("User left: %o", leave.username);
              this.allConnectedUsers = this.allConnectedUsers.filter(function (item) {
                  return item.name !== leave.username;
              });
          });
      }
      if (!!streampresence.joins) {
          streampresence.joins.forEach((join) => {
            this.getStreamUsers("home")
          });
      }
      console.log("all user:");
      console.log(this.allConnectedUsers);
  };

  } //end createSocket

  joinStream(location) {
    this.socket.rpc("join", location).then((rec) => {
      this.allConnectedUsers = JSON.parse(rec.payload);
      console.log("join users:");
      console.log(this.allConnectedUsers);
      if (this.allConnectedUsers != null) {
        // if (this.allConnectedUsersPrev != this.allConnectedUsers) {
        // this.allConnectedUsers = this.allConnectedUsersPrev
        console.log("this.createOnlinePlayers = true")
        this.createOnlinePlayers = true
        // }
      }
    });
  }

  getStreamUsers(location) {
    this.socket.rpc("get_users", location).then((rec) => {
      this.allConnectedUsers = JSON.parse(rec.payload) || []
                console.log("all current users in home:")
                console.log(this.allConnectedUsers)
      if (this.allConnectedUsers != null) {
        console.log("get stream users:");
        this.createOnlinePlayers = true
      }
    });
  }

  testMoveMessage() { //works
    var opCode = 1;
    var data =
      '{ "posX": ' +
      Math.floor(Math.random() * 100) +
      ', "posY": ' +
      Math.floor(Math.random() * 100) +
      ', "location": "home" }';
    this.socket.rpc("move_position", data).then((rec) => {
      //status;
      data = JSON.parse(rec.payload) || [];
      console.log("sent pos:");
      console.log(data);
    });

  }

  sendMoveMessage(posX, posY) {
    var opCode = 1;
    var data =
      '{ "posX": ' +
      posX +
      ', "posY": ' +
      posY +
      ', "location": "home" }';

    this.socket.rpc("move_position", data).then((rec) => {
      //status;
      // data = JSON.parse(rec.payload) || [];
      // console.log("sent pos:");
      // console.log(data);
    });
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
