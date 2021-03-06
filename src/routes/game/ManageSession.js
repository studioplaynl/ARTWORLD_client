import { get } from "svelte/store";
import { client, SSL, debugConsole } from "../../nakama.svelte";
import CoordinatesTranslator from "./class/CoordinatesTranslator"; // translate from artworld coordinates to Phaser 2D screen coordinates
import { location } from "svelte-spa-router"
import { Notification } from "../../session"

import { SCENES } from "./config.js";

class ManageSession {
  constructor() {
    this.debug = debugConsole;
    this.sessionStored;
    this.freshSession;
    this.userProfile;
    this.user_id;
    this.username;

    this.gameEditMode = false;

    this.worldSizeCopy; // we copy the worldSize of the scene to make movement calculations
    this.currentScene; // To give access to the scene outside of the game
    // default zoomlevel is set here 
    this.currentZoom = 0.8 //passing camera zoom from ui to scene

    this.resolveErrorObjectArray = []; //handle load errors for images

    this.selectedOnlinePlayer;
    this.addressbook;

    this.client;
    this.socket;

    this.joined;
    this.useSSL = SSL;
    this.verboseLogging = false;

    this.match;
    this.matchID;
    this.deviceID;

    // for back button
    this.locationHistory = [];
    this.location; // scene key to start a scene
    this.locationID; //the user_id if the scene is a house => DefaultUserHome

    this.AccountObject;
    this.playerObjectSelf;
    this.createPlayer = true;
    this.createdPlayer = false; //used for checking if we can start sending player movement data over the network
    this.playerMove;
    this.playerClicks = 0;
    this.playerClickTime = 0;
    this.playerPosX; // store playerPosX, also parsed from URL, to create player
    this.playerPosY; // store playerPosY, also parsed from URL, to create player
    this.selectedOnlinePlayer; // pass on the clicked on OnlinePlayer

    this.avatarSize = 64;
    this.cameraShake = false;

    this.createOnlinePlayers = false;
    this.updateOnlinePlayers = false;
    this.allConnectedUsers = []; //players except self that are online in the same location
    this.removedConnectedUsers = []; //players that need to be removed
    this.createOnlinePlayerArray = []; //players that need to be added

    this.playerAvatarKey = ""
    this.playerAvatarKeyDefault = "avatar1"
    this.playerMovingKey = "moving"
    this.playerStopKey = "stop"
    this.lastMoveCommand = { action: "stop", posX: 0, posY: 0, location: this.location }

    //.....................................................................
    // to select a home and save it's position as admin server side (it doesn't save when it is not a home)
    // and to select and manipulate GameObjects in Edit Mode
    this.selectedGameObject
    this.selectedGameObject_startScale = 1 //being able to reset scale to original, within edit mode
    this.selectedGameObject_startPosition = new Phaser.Math.Vector2(0, 0) //being able to reset position to original, within edit mode
    //.....................................................................

    this.gameStarted = false;
    this.currentScene;
    this.launchLocation = "Location1"; //default

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

  // .......................... URL PARSING ........................................
  getUrl() {
    let params = new URLSearchParams(window.location.search);
    let posX = params.get("posX");
    let posY = params.get("posY");
    let location = params.get("location");
    let object = { posX, posY, location };
    //console.log("object", object)
    return object;
  }

  setAndGoUrl(location, posX, posY) {
    let searchParams = new URLSearchParams(window.location.search);
    if (location) searchParams.set("location", location);
    if (posX) searchParams.set("posX", posX);
    if (posY) searchParams.set("posY", posY);
    window.location.search = searchParams.toString();
  }

  setUrl(local, posX, posY) {
    //console.log(" setUrl location, posX, posY", location, posX, posY)
    //console.log("window.location",get(location))
    window.history.pushState('', 'Artworld', '/?location=' + local + '&posX=' + Math.round(posX) + '&posY=' + Math.round(posY) + "#" + get(location))
  }
  // .......................... end URL PARSING .....................................

  async createSocket() {
    this.socket = await client.createSocket(this.useSSL, this.verboseLogging);
    console.log("socket created with client");

    const createStatus = true;

    await this.socket.connect(this.sessionStored, createStatus);
    console.log("session created with socket");

    console.log("Join:");
    console.log(this.location);
    await this.getStreamUsers("join", this.location); //have to join a location to get stream presence events

    //stream
    this.socket.onstreamdata = (streamdata) => {
      //console.info("Received stream data:", streamdata)
      let data = JSON.parse(streamdata.data);
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
            let scene = onlinePlayer.scene;
            //console.log("onlinePlayer", onlinePlayer)
            //console.log("scene", scene)

            if (data.action == "moveTo") {
              const movingKey = onlinePlayer.getData("movingKey");
              onlinePlayer.anims.play(movingKey, true);

              const moveToX = CoordinatesTranslator.artworldToPhaser2DX(
                scene.worldSize.x,
                data.posX
              )

              const moveToY = CoordinatesTranslator.artworldToPhaser2DY(
                scene.worldSize.y,
                data.posY
              )

              //scale duration to distance
              const target = new Phaser.Math.Vector2(moveToX, moveToY);
              const duration = target.length() / 8;
              // console.log("duration", duration)

              //set a variable for the onlinePlayer tween so it can be stopped when needed (by reference)
              this[onlinePlayer] = scene.tweens.add({
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

              // // if there is an unfinished tween, stop it and stop the online player
              if (typeof this[onlinePlayer] != "undefined") {
                this[onlinePlayer].stop()
              }

              let positionVector = new Phaser.Math.Vector2(
                data.posX,
                data.posY
              )

              if (this.debug) console.log("positionVector", positionVector) 

              positionVector = CoordinatesTranslator.artworldVectorToPhaser2D(
                scene.worldSize,
                positionVector
              )

              onlinePlayer.posX = positionVector.x
              onlinePlayer.posY = positionVector.y

              onlinePlayer.x = positionVector.x
              onlinePlayer.y = positionVector.y

              //get the key for the stop animation of the player, and play it
              onlinePlayer.anims.play(onlinePlayer.getData("stopKey"), true)
            }

            if (data.action == "physicsStop") {
              // position data from online player, is converted in Player.js class receiveOnlinePlayersMovement
              //because there the scene context is known

              let positionVector = new Phaser.Math.Vector2(
                data.posX,
                data.posY
              )

              if (this.debug) console.log("positionVector", positionVector)

              positionVector = CoordinatesTranslator.artworldVectorToPhaser2D(
                scene.worldSize,
                positionVector
              )

              //set the position on the player for the server side storing
              onlinePlayer.posX = positionVector.x
              onlinePlayer.posY = positionVector.y

              // if there is an unfinished tween, stop it and stop the online player
              if (typeof this[onlinePlayer] != "undefined") {

                if (this.debug) console.log("this[onlinePlayer]", this[onlinePlayer])
                this[onlinePlayer].stop()
                // console.log("duration", duration)

                const target = new Phaser.Math.Vector2(positionVector.x, positionVector.y);
                const duration = target.length() / 2
                if (this.debug) console.log("duration", duration)

                //set a variable for the onlinePlayer tween so it can be stopped when needed (by reference)
                // this[onlinePlayer] = scene.tweens.add({
                //   targets: onlinePlayer,
                //   x: positionVector.x,
                //   y: positionVector.y,
                //   paused: false,
                //   duration: duration,
                // })
              }

              onlinePlayer.x = positionVector.x
              onlinePlayer.y = positionVector.y

              //get the key for the stop animation of the player, and play it
              onlinePlayer.anims.play(onlinePlayer.getData("stopKey"), true)
            }

          }
        }
      }
    };

    this.socket.onstreampresence = (streampresence) => {
      //streampresence is everybody that is present also SELF
      if (!!streampresence.leaves) {
        streampresence.leaves.forEach((leave) => {
          if (this.debug) console.log("User left: %o", leave);
          this.getStreamUsers("get_users", this.location);
        });
      }

      if (!!streampresence.joins) {
        streampresence.joins.forEach((join) => {
          //filter out the player it self
          //console.log("this.userProfile.id", this.userProfile.id);
          if (join.user_id != this.userProfile.id) {
            //console.log(this.userProfile)
            if (this.debug) console.log("some one joined", join);
            // this.getStreamUsers("home")
            //console.log(join.username)
            //console.log("join", join);
            //const tempName = join.user_id
            this.getStreamUsers("get_users", this.location);
          } else {
            if (this.debug) console.log("join", join);
          }
        });
        // this.getStreamUsers("home")
      }
    }; //this.socket.onstreampresence


    this.socket.onnotification = (notif) => {
      Notification.set(notif)
      if (this.debug) console.log("Received %o", notif);
      if (this.debug) console.log("Notification content %s", notif);

    }
  } //end createSocket

  async getStreamUsers(rpc_command, location) {
    //* rpc_command:
    //* join" = join the stream, get the online users, except self
    //* get_users" = after joined, get the online users, except self
    if (this.debug)  console.log( 'this.getStreamUsers("' + rpc_command + ', "' + location + '")');

    this.socket.rpc(rpc_command, location).then((rec) => {
      //!the server reports all users in location except self_user
      if (this.debug) console.log(location);
      // get all online players = serverArray
      // create array for newUsers and create array for deleteUsers
      const serverArray = JSON.parse(rec.payload) || [];
      if (this.debug)  console.log("serverArray", serverArray);

      serverArray.forEach((newPlayer) => {
        const exists = this.allConnectedUsers.some(
          (element) => element.user_id == newPlayer.user_id
        );
        if (!exists) {
          this.createOnlinePlayerArray.push(newPlayer);
          if (this.debug)  console.log("newPlayer", newPlayer);
        }
      });

      // allConnectedUsers had id, serverArray has user_id
      this.allConnectedUsers.forEach((onlinePlayer) => {
        const exists = serverArray.some(
          (element) => element.user_id == onlinePlayer.user_id
        );
        if (!exists) {
          this.deleteOnlinePlayer(onlinePlayer);
          if (this.debug) console.log("remove onlinePlayer", onlinePlayer);
        }
      });

      //send our current location in the world to all connected players
      if (this.debug) console.log("send our current location in the world to all connected players")
      //console.log("this.lastMoveCommand", this.lastMoveCommand)
      //console.log("this.currentScene", this.currentScene)
      if (this.debug)  console.log("this.lastMoveCommand", this.lastMoveCommand)
      // if (typeof this.currentScene != "undefined") {
      setTimeout(() => { this.sendMoveMessage(this.currentScene, this.lastMoveCommand.posX, this.lastMoveCommand.posY, this.lastMoveCommand.action) }, 1500)
      // }
    });
  }

  deleteOnlinePlayer(onlinePlayer) {
    // onlinePlayer has id

    // console.log("onlinePlayer", onlinePlayer)
    // console.log("this.allConnectedUsers", this.allConnectedUsers)

    //destroy the user if it exists in the array
    let removeUser = this.allConnectedUsers.filter(
      (obj) => obj.user_id == onlinePlayer.user_id
    );
    if (this.debug)  console.log("removeUser", removeUser);

    removeUser.forEach((element) => {
      element.destroy();
    });

    // remove oldPlayer from allConnectedUsers
    this.allConnectedUsers = this.allConnectedUsers.filter(
      (obj) => obj.user_id != onlinePlayer.user_id
    );

    if (this.debug)  console.log("this.allConnectedUsers", this.allConnectedUsers);
  }

  async leave(selected) {
    await socket.rpc("leave", selected);
  }

  sendMoveMessage(scene, posX, posY, action) {
    //transpose phaser coordinates to artworld coordinates
    //console.log(scene)

    //
    this.lastMoveCommand = { action: action, posX: posX, posY: posY, location: this.location }
    //console.log("this.lastMoveCommand", this.lastMoveCommand)

    //console.log(posX, posY)
    posX = CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, posX);
    posY = CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, posY);
    //console.log(posX, posY)

    const data = `{ "action": "${action}", "posX": ${posX}, "posY": ${posY}, "location": "${this.location}" }`;

    this.socket.rpc("move_position", data);
  } //end sendChatMessage

  checkIfSceneExists(location) {

    //check if this.launchLocation exists in SCENES
    //const locationExists = SCENES.includes(location)

    const locationExists = SCENES.some((el) => el.name === location);
    // console.log("SCENES", SCENES)
    console.log("locationExists SCENES", locationExists, location, SCENES);

    return locationExists;
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

  testMoveMessage() {
    //works
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





} //end class

export default new ManageSession();
