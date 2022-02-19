import { element } from "svelte/internal"
import { client, SSL } from "../../nakama.svelte"
import CoordinatesTranslator from "./class/CoordinatesTranslator" // translate from artworld coordinates to Phaser 2D screen coordinates

import { SCENES } from "./config.js"

class ManageSession {
  constructor() {
    this.debug = true
    this.sessionStored
    this.freshSession
    this.userProfile
    this.user_id
    this.username

    this.worldSizeCopy // we copy the worldSize of the scene to make movement calculations
    this.itemsBar
    this.itemsBarOnlinePlayer
    this.selectedOnlinePlayer
    this.addressbook
    this.favorites

    this.client
    this.socket

    this.joined
    this.useSSL = SSL
    this.verboseLogging = false

    this.match
    this.matchID
    this.deviceID

    this.AccountObject
    this.playerObjectSelf
    this.createPlayer = true
    this.playerMove

    this.locationExists = false

    this.createOnlinePlayers = false
    this.updateOnlinePlayers = false
    this.allConnectedUsers = [] //players except self that are online in the same location
    this.removedConnectedUsers = [] //players that need to be removed 
    this.createOnlinePlayerArray = [] //players that need to be added

    // this.createdPlayer = false
    this.playerAvatarKey = ""
    // this.playerMovingKey = "moving"
    // this.playerStopKey = "stop"

    this.gameStarted = false
    this.currentScene
    this.location = "Location1" //default
    this.launchLocation = "Location1" //default

    // for back button
    this.locationHistory = []

    //chat example
    this.channelId = "pineapple-pizza-lovers-room"
    this.persistence = false
    this.hidden = false

    //timers
    this.updateMovementTimer = 0
    this.updateMovementInterval = 30 //20 fps
  }

  // getProfile(){
  //   this.userprofile = Profile
  // }

  async createSocket() {
    this.socket = await client.createSocket(this.useSSL, this.verboseLogging);
    console.log("socket created with client");

    const createStatus = true;

    await this.socket.connect(this.sessionStored, createStatus)
    console.log("session created with socket")

    console.log("Join:")
    console.log(this.location)
    await this.getStreamUsers("join", this.location) //have to join a location to get stream presence events

    //stream
    this.socket.onstreamdata = (streamdata) => {
      //console.info("Received stream data:", streamdata)
      let data = JSON.parse(streamdata.data)
      //console.log(data)

      //parse the movement data for the players in our allConnectedUsers array
      for (const onlinePlayer of this.allConnectedUsers) {
        //console.log("onlinePlayer", onlinePlayer)
        if (onlinePlayer.scene) {
          if (onlinePlayer.user_id == data.user_id) {
            //console.log("data.user_id", data.user_id)
            // data is in the form of:
            // location: "ArtworldAmsterdam"
            // posX: -236.42065
            // posY: -35.09519
            // user_id: "4ced8bff-d79c-4842-b2bd-39e9d9aa597e"
            // action: "moveTo" "stop"
            //get the scene context from the onlinePlayer
            let scene = onlinePlayer.scene
            //console.log("onlinePlayer", onlinePlayer)
            //console.log("scene", scene)

            if (data.action == "moveTo") {

              const movingKey = onlinePlayer.getData("movingKey")
              onlinePlayer.anims.play(movingKey, true)

              const moveToX = CoordinatesTranslator.artworldToPhaser2DX(scene.worldSize.x, data.posX)
              const moveToY = CoordinatesTranslator.artworldToPhaser2DY(scene.worldSize.y, data.posY)

              //scale duration to distance
              const target = new Phaser.Math.Vector2(moveToX, moveToY)
              const duration = target.length() / 8
              // console.log("duration", duration)

              scene.tweens.add({
                targets: onlinePlayer,
                x: moveToX,
                y: moveToY,
                paused: false,
                duration: duration,
              })
              //console.log("target", target)
            }

            if (data.action == "stop") {
              // position data from online player, is converted in Player.js class receiveOnlinePlayersMovement 
              //because there the scene context is known
              let positionVector = new Phaser.Math.Vector2(data.posX, data.posY)
              positionVector = CoordinatesTranslator.artworldVectorToPhaser2D(scene.worldSize, positionVector)

              onlinePlayer.posX = positionVector.x
              onlinePlayer.posY = positionVector.y

              onlinePlayer.x = positionVector.x
              onlinePlayer.y = positionVector.y

              //get the key for the stop animation of the player, and play it
              onlinePlayer.anims.play(onlinePlayer.getData("stopKey"), true)
            }
          }
        }
      }
    }

    this.socket.onstreampresence = (streampresence) => {
      //streampresence is everybody that is present also SELF
      if (!!streampresence.leaves) {
        streampresence.leaves.forEach((leave) => {
          console.log("User left: %o", leave)
          this.getStreamUsers("get_users", this.location)
        })
      }

      if (!!streampresence.joins) {
        streampresence.joins.forEach((join) => {
          //filter out the player it self
          console.log("this.userProfile.id", this.userProfile.id)          
          if (join.user_id != this.userProfile.id) {
            //console.log(this.userProfile)
            console.log("some one joined")
            // this.getStreamUsers("home")
            //console.log(join.username)
            console.log("join", join)
            //const tempName = join.user_id
            this.getStreamUsers("get_users", this.location)
          }
        })
        // this.getStreamUsers("home")
      }
    } //this.socket.onstreampresence
  } //end createSocket

  async getStreamUsers(rpc_command, location) {
    //* rpc_command:
    //* join" = join the stream, get the online users, except self
    //* get_users" = after joined, get the online users, except self
    console.log('this.getStreamUsers("' + rpc_command + ', "' + location + '")')

    this.socket.rpc(rpc_command, location).then((rec) => {
      //!the server reports all users in location except self_user
      console.log(location)
      // get all online players = serverArray
      // create array for newUsers and create array for deleteUsers
      const serverArray = JSON.parse(rec.payload) || []
      console.log("serverArray", serverArray)

      serverArray.forEach((newPlayer) => {
        const exists = this.allConnectedUsers.some(element => element.user_id == newPlayer.user_id)
        if (!exists) {
          this.createOnlinePlayerArray.push(newPlayer)
          console.log("newPlayer", newPlayer)
        }
      })

      // allConnectedUsers had id, serverArray has user_id
      this.allConnectedUsers.forEach((onlinePlayer) => {
        const exists = serverArray.some(element => element.user_id == onlinePlayer.user_id)
        if (!exists) {
          this.deleteOnlinePlayer(onlinePlayer)
          console.log("remove onlinePlayer", onlinePlayer)
        }
      })
    })
  }

  deleteOnlinePlayer(onlinePlayer) {
    // onlinePlayer has id

    // console.log("onlinePlayer", onlinePlayer)
    // console.log("this.allConnectedUsers", this.allConnectedUsers)

    //destroy the user if it exists in the array
    let removeUser = this.allConnectedUsers.filter(obj => obj.user_id == onlinePlayer.user_id)
    console.log("removeUser", removeUser)

    removeUser.forEach((element) => { element.destroy() })

    // remove oldPlayer from allConnectedUsers
    this.allConnectedUsers = this.allConnectedUsers.filter(obj => obj.user_id != onlinePlayer.user_id)

    console.log("this.allConnectedUsers", this.allConnectedUsers)
  }

  async leave(selected) {
    await socket.rpc("leave", selected)
  }

  sendMoveMessage(scene, posX, posY, action) {
    //transpose phaser coordinates to artworld coordinates
    //console.log(scene)

    //console.log(posX, posY)
    posX = CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, posX)
    posY = CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, posY)
    //console.log(posX, posY)

    var opCode = 1
    var data = `{ "action": "${action}", "posX": ${posX}, "posY": ${posY}, "location": "${this.location}" }`

    //  '{ "action": ' + action +  '"posX": ' + posX + ', "posY": ' + posY + ', "location": "' + this.location + '" }'
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
    )
  } //end chatExample

  testMoveMessage() { //works
    var opCode = 1;
    var data =
      '{ "posX": ' +
      Math.floor(Math.random() * 100) +
      ', "posY": ' +
      Math.floor(Math.random() * 100) +
      ', "location": "home" }'

    this.socket.rpc("move_position", data).then((rec) => {
      //status;
      data = JSON.parse(rec.payload) || [];
      // console.log("sent pos:");
      // console.log(data);
    })
  }

} //end class

export default new ManageSession();