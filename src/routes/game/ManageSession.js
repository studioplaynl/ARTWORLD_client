/* eslint-disable class-methods-use-this */
import { get } from 'svelte/store';
import { client, SSL } from '../../nakama.svelte';
// translate from artworld coordinates to Phaser 2D screen coordinates
import CoordinatesTranslator from './class/CoordinatesTranslator';
import { Profile, Session, Notification } from '../../session';

const { Phaser } = window;

class ManageSession {
  constructor() {
    this.debug = true;

    this.gameEditMode = false;

    // TODO: Remove?
    // this.worldSizeCopy; // we copy the worldSize of the scene to make movement calculations
    this.currentScene = {}; // To give access to the scene outside of the game
    // default zoomlevel is set here
    this.currentZoom = 0.8; // passing camera zoom from ui to scene

    this.resolveErrorObjectArray = []; // handle load errors for images
    this.addressbook = {};

    this.client = null;
    this.socket = null;
    this.useSSL = SSL;
    this.verboseLogging = false;

    // for back button
    this.locationHistory = [];
    this.location = null; // scene key to start a scene
    this.locationID = null; // the user_id if the scene is a house => DefaultUserHome

    // TODO Remove createdPlayer?
    this.createPlayer = true;

    // Check if we can start sending player movement data over the network
    this.createdPlayer = false;
    this.playerMove = false;

    this.playerClicks = 0;
    this.playerClickTime = 0;
    this.playerPosX = 0; // store playerPosX, also parsed from URL, to create player
    this.playerPosY = 0; // store playerPosY, also parsed from URL, to create player
    this.selectedOnlinePlayer = {}; // pass on the clicked on OnlinePlayer

    this.avatarSize = 64;
    this.cameraShake = false;

    this.createOnlinePlayers = false;
    this.updateOnlinePlayers = false;
    this.allConnectedUsers = []; // players except self that are online in the same location
    this.removedConnectedUsers = []; // players that need to be removed
    this.createOnlinePlayerArray = []; // players that need to be added

    this.playerAvatarKey = '';
    this.playerAvatarKeyDefault = 'avatar1';
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.lastMoveCommand = {
      action: 'stop', posX: 0, posY: 0, location: this.location,
    };

    // .....................................................................
    // to select a home and save it's position as admin server side
    // (it doesn't save when it is not a home)
    // and to select and manipulate GameObjects in Edit Mode
    this.selectedGameObject = null;
    // being able to reset scale to original, within edit mode
    this.selectedGameObject_startScale = 1;
    // being able to reset position to original, within edit mode
    this.selectedGameObject_startPosition = new Phaser.Math.Vector2(0, 0);
    // .....................................................................

    this.gameStarted = false;
    this.currentScene = null;
    this.launchLocation = 'Location1'; // default

    // timers
    this.updateMovementTimer = 0;
    this.updateMovementInterval = 30; // 20 fps
  }

  async createSocket() {
    this.socket = await client.createSocket(this.useSSL, this.verboseLogging);
    console.log('socket created with client');

    this.userProfile = get(Profile);
    console.log('this.userProfile', this.userProfile);

    const createStatus = true;
    await this.socket.connect(get(Session), createStatus);
    console.log('session created with socket');

    console.log('Join:');
    console.log(this.location);
    await this.getStreamUsers('join', this.location); // have to join a location to get stream presence events

    // Streaming data containing movement data for the players in our allConnectedUsers array
    this.socket.onstreamdata = (streamdata) => {
      const data = JSON.parse(streamdata.data);

      // parse the movement data for the players in our allConnectedUsers array
      this.allConnectedUsers.forEach((onlinePlayer, index) => {
        console.log('Dit is de player', onlinePlayer.user_id);

        // eslint-disable-next-line prefer-const
        let updateOnlinePlayer = onlinePlayer;

        if (updateOnlinePlayer.scene) {
          if (updateOnlinePlayer.user_id === data.user_id) {
            /* data is in the form of:
                location: "ArtworldAmsterdam"
                posX: -236.42065
                posY: -35.09519
                user_id: "4ced8bff-d79c-4842-b2bd-39e9d9aa597e"
                action: "moveTo" "stop"
                get the scene context from the updateOnlinePlayer */

            const { scene } = updateOnlinePlayer;

            if (data.action === 'moveTo') {
              const movingKey = updateOnlinePlayer.getData('movingKey');
              updateOnlinePlayer.anims.play(movingKey, true);

              const moveToX = CoordinatesTranslator.artworldToPhaser2DX(
                scene.worldSize.x,
                data.posX,
              );

              const moveToY = CoordinatesTranslator.artworldToPhaser2DY(
                scene.worldSize.y,
                data.posY,
              );

              // scale duration to distance
              const target = new Phaser.Math.Vector2(moveToX, moveToY);
              const duration = target.length() / 8;

              // set a variable for the updateOnlinePlayer tween so it can be stopped when needed (by reference)
              this[updateOnlinePlayer] = scene.tweens.add({
                targets: updateOnlinePlayer,
                x: moveToX,
                y: moveToY,
                paused: false,
                duration,
              });
            }

            if (data.action === 'stop') {
              // position data from online player, is converted in Player.js class receiveOnlinePlayersMovement
              // because there the scene context is known

              // // if there is an unfinished tween, stop it and stop the online player
              if (typeof this[updateOnlinePlayer] !== 'undefined') {
                this[updateOnlinePlayer].stop();
              }

              let positionVector = new Phaser.Math.Vector2(
                data.posX,
                data.posY,
              );

              console.log('positionVector', positionVector);

              positionVector = CoordinatesTranslator.artworldVectorToPhaser2D(
                scene.worldSize,
                positionVector,
              );

              updateOnlinePlayer.posX = positionVector.x;
              updateOnlinePlayer.posY = positionVector.y;

              updateOnlinePlayer.x = positionVector.x;
              updateOnlinePlayer.y = positionVector.y;

              // get the key for the stop animation of the player, and play it
              updateOnlinePlayer.anims.play(updateOnlinePlayer.getData('stopKey'), true);
            }

            if (data.action === 'physicsStop') {
              // position data from online player, is converted in Player.js class receiveOnlinePlayersMovement
              // because there the scene context is known

              let positionVector = new Phaser.Math.Vector2(
                data.posX,
                data.posY,
              );

              console.log('positionVector', positionVector);

              positionVector = CoordinatesTranslator.artworldVectorToPhaser2D(
                scene.worldSize,
                positionVector,
              );

              // set the position on the player for the server side storing
              updateOnlinePlayer.posX = positionVector.x;
              updateOnlinePlayer.posY = positionVector.y;

              // if there is an unfinished tween, stop it and stop the online player
              if (typeof this[updateOnlinePlayer] !== 'undefined') {
                console.log('this[updateOnlinePlayer]', this[updateOnlinePlayer]);
                this[updateOnlinePlayer].stop();
                // console.log("duration", duration)

                const target = new Phaser.Math.Vector2(positionVector.x, positionVector.y);
                const duration = target.length() / 2;
                console.log('duration', duration);

                // set a variable for the updateOnlinePlayer tween so it can be stopped when needed (by reference)
                // this[updateOnlinePlayer] = scene.tweens.add({
                //   targets: updateOnlinePlayer,
                //   x: positionVector.x,
                //   y: positionVector.y,
                //   paused: false,
                //   duration: duration,
                // })
              }

              updateOnlinePlayer.x = positionVector.x;
              updateOnlinePlayer.y = positionVector.y;

              // get the key for the stop animation of the player, and play it
              updateOnlinePlayer.anims.play(updateOnlinePlayer.getData('stopKey'), true);
            }
          }
        }
        // Finally set the player back in the array
        this.allConnectedUsers[index] = updateOnlinePlayer;
      // }
      });
    };

    // Another user has joined or left the stream
    this.socket.onstreampresence = (streampresence) => {
      console.log('this.socket.onstreampresence');

      // streampresence is everybody that is present also SELF
      if (streampresence.leaves) {
        streampresence.leaves.forEach((leave) => {
          console.log('User left: %o', leave);
          this.getStreamUsers('get_users', this.location);
        });
      }

      if (streampresence.joins) {
        streampresence.joins.forEach((join) => {
          // filter out the player it self
          // console.log("this.userProfile.id", this.userProfile.id);

          console.log('this.userProfile = ', this.userProfile);
          if (join.user_id !== this.userProfile.id) {
            // console.log(this.userProfile)
            console.log('some one joined', join);
            // this.getStreamUsers("home")
            // console.log(join.username)
            // console.log("join", join);
            // const tempName = join.user_id
            this.getStreamUsers('get_users', this.location);
          } else {
            console.log('join', join);
          }
        });
        // this.getStreamUsers("home")
      }
    };

    this.socket.onnotification = (notif) => {
      Notification.set(notif);
      console.log('Received %o', notif);
      console.log('Notification content %s', notif);
    };
  } // end createSocket

  async getStreamUsers(rpc_command, location) {
    //* rpc_command:
    //* join" = join the stream, get the online users, except self
    //* get_users" = after joined, get the online users, except self
    console.log(
      `this.getStreamUsers("${rpc_command}, "${location}")`,
    );

    this.socket.rpc(rpc_command, location).then((rec) => {
      //! the server reports all users in location except self_user
      console.log(location);
      // get all online players = serverArray
      // create array for newUsers and create array for deleteUsers
      const serverArray = JSON.parse(rec.payload) || [];
      console.log('serverArray', serverArray);

      serverArray.forEach((newPlayer) => {
        const exists = this.allConnectedUsers.some(
          (element) => element.user_id == newPlayer.user_id,
        );
        if (!exists) {
          this.createOnlinePlayerArray.push(newPlayer);
          console.log('newPlayer', newPlayer);
        }
      });

      // allConnectedUsers had id, serverArray has user_id
      this.allConnectedUsers.forEach((onlinePlayer) => {
        const exists = serverArray.some(
          (element) => element.user_id == onlinePlayer.user_id,
        );
        if (!exists) {
          this.deleteOnlinePlayer(onlinePlayer);
          console.log('remove onlinePlayer', onlinePlayer);
        }
      });

      // send our current location in the world to all connected players
      console.log('send our current location in the world to all connected players');
      // console.log("this.lastMoveCommand", this.lastMoveCommand)
      // console.log("this.currentScene", this.currentScene)
      console.log('this.lastMoveCommand', this.lastMoveCommand);
      // if (typeof this.currentScene != "undefined") {
      setTimeout(() => {
        const { posX, posY, action } = this.lastMoveCommand;
        this.sendMoveMessage(this.currentScene, posX, posY, action);
        console.log('sending move message!');
      }, 1500);
      // }
    });
  }

  deleteOnlinePlayer(onlinePlayer) {
    // onlinePlayer has id

    // console.log("onlinePlayer", onlinePlayer)
    // console.log("this.allConnectedUsers", this.allConnectedUsers)

    // destroy the user if it exists in the array
    const removeUser = this.allConnectedUsers.filter(
      (obj) => obj.user_id == onlinePlayer.user_id,
    );
    console.log('removeUser', removeUser);

    removeUser.forEach((element) => {
      element.destroy();
    });

    // remove oldPlayer from allConnectedUsers
    this.allConnectedUsers = this.allConnectedUsers.filter(
      (obj) => obj.user_id != onlinePlayer.user_id,
    );

    console.log('this.allConnectedUsers', this.allConnectedUsers);
  }

  async leave(selected) {
    await socket.rpc('leave', selected);
  }

  sendMoveMessage(scene, posX, posY, action) {
    // transpose phaser coordinates to artworld coordinates
    // console.log(scene)

    //
    this.lastMoveCommand = {
      action, posX, posY, location: this.location,
    };

    // console.log(posX, posY)
    posX = CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, posX);
    posY = CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, posY);
    // console.log(posX, posY)

    const data = `{ "action": "${action}", "posX": ${posX}, "posY": ${posY}, "location": "${this.location}" }`;

    this.socket.rpc('move_position', data);
  } // end sendChatMessage

  testMoveMessage() {
    // works
    const opCode = 1;
    let data = `{ "posX": ${
      Math.floor(Math.random() * 100)
    }, "posY": ${
      Math.floor(Math.random() * 100)
    }, "location": "home" }`;

    this.socket.rpc('move_position', data).then((rec) => {
      // status;
      data = JSON.parse(rec.payload) || [];
      // console.log("sent pos:");
      // console.log(data);
    });
  }
} // end class

export default new ManageSession();
