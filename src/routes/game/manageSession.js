import { client, SSL } from "../../nakama.svelte";
// import { user, url, getAccount } from '../../api.js';
// import { Color } from "fabric/fabric-impl";


class manageSession {
  constructor() {
    this.debug = true

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

    this.AccountObject;
    this.playerObjectSelf;
    this.createPlayer = true;

    this.createOnlinePlayers = false;
    this.updateOnlinePlayers = false;
    this.allConnectedUsers = [];
    this.removedConnectedUsers = [];

    // this.createdPlayer = false;
    this.playerAvatarKey = ""
    // this.playerMovingKey = "moving";
    // this.playerStopKey = "stop";

    this.gameStarted = false;

    this.location = "home"

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

    // //await this.getAccountDetails()
    // console.log("this.playerObjectSelf")
    // await this.getAccountDetails().then((blob) => {
    //   console.log(blob);
    //   this.createPlayer = true;
    // }).catch(e => console.log(e));

    //await this.getAvatarUrl()

    // console.log(this.createPlayer)
    // console.log(this.playerObjectSelf)

    // console.log("this.getAvatarUrl();")
    // await this.getAvatarUrl().then(this.createPlayer = true)
    // console.log(this.createPlayer)

    
    await this.getStreamUsers("join", this.location)

    //stream
    this.socket.onstreamdata = (streamdata) => {
      //console.info("Received stream data:", streamdata);
      let data = JSON.parse(streamdata.data);

      //update the position data of this.allConnectedUsers array
      for (const user of this.allConnectedUsers) {
        if (user.user_id == data.user_id) {
          //console.log("test");
          user.posX = data.posX;
          user.posY = data.posY;

          //this could be refined to update specific online player?
          this.updateOnlinePlayers = true
        }
      }
      // console.log(this.allConnectedUsers);
      // var newPos = this.allConnectedUsers;
      // this.allConnectedUsers = newPos;

    };



    this.socket.onstreampresence = (streampresence) => {
      //streampresence is everybody that is present also SELF

      console.log(
        "Received presence event for stream: %o",
        streampresence
      );
      this.getStreamUsers("get_users", this.location)
      if (!!streampresence.leaves) {
        streampresence.leaves.forEach((leave) => {
          console.log("User left: %o", leave.username);
          //remove leave.user_id from 

          // this.removedConnectedUsers.push(leave.user_id);

          //! instead of setTimeout I could also just remove user from allConnectedUsers and 
          //! set createOnlinePlayers = true
          setTimeout(() => {
            this.getStreamUsers("get_users", this.location)
          }, 400);

          setTimeout(() => {
            this.createOnlinePlayers = true
          }, 600);
          
          
          //allConnectedUsers is updated after someone leaves
          // this.allConnectedUsers = this.allConnectedUsers.filter(function (item) {
          //   return item.name !== leave.username;
          // });
        });

      }

      // if (!!streampresence.joins) {
      //   streampresence.joins.forEach((join) => {
      //     if (join.user_id != this.user_id) {
      //       console.log("some one joined")
      //       // this.getStreamUsers("home")
      //       console.log(join)

      //       console.log(this.allConnectedUsers)

      //       this.allConnectedUsers.push(join)
      //       this.createOnlinePlayers = true
      //     }

      //     // update array when someone joins
      //     // this.allConnectedUsers.push(leave.user_id)
      //   });
      //   // this.getStreamUsers("home")
      // }
    }; //this.socket.onstreampresence
  } //end createSocket

  // async join() {
  //   await this.socket.rpc("join", this.location).then((rec) => {
  //     AllUsers = JSON.parse(rec.payload) || [];
  //     console.log("joined " + this.location);
  //     console.log("join users:");
  //     console.log(AllUsers);
  //     status = "joined";
  //   });
  // }

  async getStreamUsers(rpc_command, location) {
    // if (!this.createOnlinePlayers) {
    //rpc_command:
    //"join" = join the stream, get the online users, except self
    //"get_users" = after joined, get the online users, except self

    console.log('this.getStreamUsers("' + rpc_command + ', "' + location + '")')

    this.socket.rpc(rpc_command, location).then((rec) => {

      //the server report all users in location except self
      // this.allConnectedUsers = JSON.parse(rec.payload) || [] //time16:52

      //get all online players
      let tempConnectedUsers = JSON.parse(rec.payload) || []
      // console.log("tempConnectedUsers")
      // console.log(tempConnectedUsers)
      //empty the array first
      this.allConnectedUsers = tempConnectedUsers

      //filter out the onlineplayers by location, put them in the this.allConnectedUsers [] 
      //this.allConnectedUsers = tempConnectedUsers.filter(i => this.location.includes(i.location));


      //if there are no users online, the array length == 0
      if (this.allConnectedUsers.length > 0) {
        console.log("filtered by location? this.allConnectedUsers")
        console.log("joined users:")
        console.log(this.allConnectedUsers)

        this.createOnlinePlayers = true
        console.log("this.createOnlinePlayers = true")
      } else {
        //this.createOnlinePlayers = false
        console.log("no online users")
      }
    })
  }

  async leave(selected) {
    await socket.rpc("leave", selected)
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