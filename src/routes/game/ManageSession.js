import { client, SSL } from "../../nakama.svelte";
import CoordinatesTranslator from "./class/CoordinatesTranslator"; // translate from artworld coordinates to Phaser 2D screen coordinates

import { SCENES } from "./config.js"

class ManageSession {
  constructor() {
    this.debug = true

    this.sessionStored;
    this.freshSession
    this.userProfile
    this.user_id
    this.username;

    this.itemsBar
    this.addressbook
    this.favorites

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

    this.locationExists = false

    this.createOnlinePlayers = false;
    this.updateOnlinePlayers = false;
    this.allConnectedUsers = [];
    this.removedConnectedUsers = [];

    // this.createdPlayer = false;
    this.playerAvatarKey = ""
    // this.playerMovingKey = "moving";
    // this.playerStopKey = "stop";

    this.gameStarted = false;

    this.location = "Location1" //default
    this.launchLocation = "Location1" //default

    // for back button
    this.locationHistory = []

    //chat example
    this.channelId = "pineapple-pizza-lovers-room";
    this.persistence = false;
    this.hidden = false;

    //timers
    this.updateMovementTimer = 0;
    this.updateMovementInterval = 30; //20 fps
  }

  // getProfile(){
  //   this.userprofile = Profile
  // }

  async createSocket() {
    this.socket = await client.createSocket(this.useSSL, this.verboseLogging);
    console.log("socket created with client");

    const createStatus = true;

    await this.socket.connect(this.sessionStored, createStatus);
    console.log("session created with socket");

    console.log("Join:")
    console.log(this.location)
    await this.getStreamUsers("join", this.location)

    //stream
    this.socket.onstreamdata = (streamdata) => {
      //console.info("Received stream data:", streamdata);
      let data = JSON.parse(streamdata.data);
      //console.log(data)
      //update the position data of this.allConnectedUsers array
      for (const user of this.allConnectedUsers) {
        if (user.user_id == data.user_id) {

          //? position data from online player, is converted in Player.js class receiveOnlinePlayersMovement because there the scene context is known
          user.posX = data.posX
          user.posY = data.posY

          // printing also when receiving movement data
          // console.log("user")
          // console.log(user)

          // console.log("data.user_id")
          // console.log(data.user_id)

          //TODO this could be refined to update specific online player?
          this.updateOnlinePlayers = true
        }
      }
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

      // update array when someone joins
      // this.allConnectedUsers.push(leave.user_id)
      //   });
      // this.getStreamUsers("home")
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
    //* rpc_command:
    //* join" = join the stream, get the online users, except self
    //* get_users" = after joined, get the online users, except self

    console.log('this.getStreamUsers("' + rpc_command + ', "' + location + '")')

    this.socket.rpc(rpc_command, location).then((rec) => {
      //!the server reports all users in location except self_user

      //get all online players
      let tempConnectedUsers = JSON.parse(rec.payload) || []

      // empty the array first
      // this.allConnectedUsers = []
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
      // console.log("sent pos:");
      // console.log(data);
    });

  }

  sendMoveMessage(scene, posX, posY) {
    //transpose phaser coordinates to artworld coordinates
    //console.log(scene)

    //console.log(posX, posY)
    posX = CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, posX)
    posY = CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, posY)
    //console.log(posX, posY)

    var opCode = 1;
    var data =
      '{ "posX": ' + posX + ', "posY": ' + posY + ', "location": "' + this.location + '" }';
    //console.log(data)

    this.socket.rpc("move_position", data)
    // .then((rec) => {
    //   console.log(rec)
    // });
  } //end sendChatMessage

  checkSceneExistence() {
    //check if this.launchLocation exists in SCENES
    const locationExists = SCENES.includes(this.launchLocation)
    //reset existing to false
    this.locationExists = false
    //if location does not exists; launch default location
    if (!locationExists) {
      //set to fail-back scene
      this.location = "ArtworldAmsterdam"
      this.launchLocation = this.location
      //console.log(this.launchLocation)
    } else {
      this.location = this.userProfile.meta.location
      console.log(this.location)
    }
    this.locationExists = true
  }

  async chatExample() {
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
  } //end chatExample
} //end class

export default new ManageSession();