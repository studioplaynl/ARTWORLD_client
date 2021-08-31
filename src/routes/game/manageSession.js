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
      // console.info("Received stream data object:", streamdata);
      console.info("Streamdata.stream:", streamdata.stream);

      //console.info("Received stream data object.data:", streamdata.data);
      //const parsedData = JSON.parse(JSON.stringify(streamdata.data))

      //OFF
      const parsedData = JSON.parse(streamdata.data);

      // //console.info("Received stream data object.data.posX:", parsedData.posX);
      // if (this.allConnectedUsers != null) {
      //   for (let i = 0; i < this.allConnectedUsers.length; i++) {
      //     if (parsedData.user_id == this.allConnectedUsers[i].user_id) {
      //       console.log("streaming online data")
      //       this.allConnectedUsers[i].posX = parsedData.posX;
      //       this.allConnectedUsers[i].posY = parsedData.posY;
      //       this.updateOnlinePlayers = true;
      //     }
      //   }
      // }

      // console.info(
      //   "Received stream data object.data.user_id:",
      //   parsedData.user_id
      // ); //user_id
      //OFF
    };


    this.socket.onstreampresence = (streampresence) => {
      //this.getArrayOfOnlineUsers();
      //this.getStreamUsers("home");
      console.log('streampresence.joins');
      console.log(streampresence.joins);
      this.getStreamUsers("home")
      streampresence.joins.forEach((join) => {
        console.log("New user joined: %o", join.user_id);
      });
      // streampresence.leaves.forEach((leave) => {
      //   console.log("User left: %o", leave.user_id);
      // });
    }; //end onstreampresence

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
      this.allConnectedUsersPrev = JSON.parse(rec.payload);
      this.allConnectedUsers = this.allConnectedUsersPrev;
      // console.log(this.allConnectedUsers[0].user_id)

      console.log("get stream users:");
      if (this.allConnectedUsers != null) {
        this.createOnlinePlayers = true
        // for (let i = 0; i < this.allConnectedUsers.length; i++) {
        //   if (!this.allConnectedUsersPrev(this.allConnectedUsers[i].user_id)) {


        //     // if (this.allConnectedUsers.length > 0) {
        //     // if (this.allConnectedUsersPrev != this.allConnectedUsers) {
        //     // this.allConnectedUsers = this.allConnectedUsersPrev
        //     console.log("this.createOnlinePlayers = true")        // }
        //     this.createOnlinePlayers = true
        //   }
        // }
      }
    });
  }

  getArrayOfOnlineUsers() {
    this.socket.rpc("get_users", "home").then((rec) => {
      let payload = JSON.parse(rec.payload);
      //console.log(payload);
      if (payload != null) {
        payload.forEach((user, i) => {
          if (user.user_id != this.user_id) {
            this.allConnectedUsers[i] = user;
          }
          let newArr = this.allConnectedUsers.filter((a) => a); //filter out empty places in the array, making the array correct
          this.allConnectedUsers = newArr;
          // // filter out duplicates from server array
          // newArr = this.allConnectedUsers.reduce((acc, current) => {const x = acc.find(item => item.user_id === current.user_id);
          // if (!x){
          //   return acc.concat([current]);}
          //   else {
          //     return acc;
          //   }
          // }, []);

          // this.allConnectedUsers= newArr
          if (this.allConnectedUsers.length == 0) {
            this.createOnlinePlayers = false;
            console.log(this.createOnlinePlayers);
            return;
          } else {
            console.log("this.allConnectedUsers: ");
            console.log(this.allConnectedUsers);
            this.createOnlinePlayers = true;
            console.log(this.createOnlinePlayers);
          }
        });
      }
    });
  }

  testMoveMessage(){

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
    // //console.log("sendPositionMessage: ");
    // var opCode = 1;
    // // const data = '{"posX":' + posX + ', "posY":' + posY + '}'; // working
    // // const data = '{"dir": "left", "steps": 4 }'; //working example

    // // const data = `{"user_id" : "${this.user_id}", "posX": "${posX}", "posY" : "${posY}", "location": "home"}`;

    // const data = `{ "posX": "${posX}", "posY" : "${posY}", "location": "home"}`;

    // //console.log(data)
    // this.socket.rpc("move_position", data);



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
