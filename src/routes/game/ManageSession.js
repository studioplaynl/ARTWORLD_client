/* eslint-disable class-methods-use-this */
import { get } from 'svelte/store';
import { client, SSL } from '../../nakama.svelte';
// translate from artworld coordinates to Phaser 2D screen coordinates
import CoordinatesTranslator from './class/CoordinatesTranslator';
import { Profile, Session, Notification } from '../../session';
import { dlog } from './helpers/DebugLog';
import { logout } from '../../api';
import {
  playerLocation, playerStreamID,
} from './playerState';

const { Phaser } = window;

/** Main utility class to share Game State between Phaser & Svelte  */
class ManageSession {
  constructor() {
    this.debug = true;

    this.gameEditMode = false;

    /** @var {Phaser.Scene} currentScene */
    this.currentScene = null; // To give access to the scene outside of the game

    this.resolveErrorObjectArray = []; // handle load errors for images
    this.addressbook = {};
    this.currentZoom = 1;


    this.client = null;
    this.socket = null;
    this.useSSL = SSL;
    this.verboseLogging = false;

    // Check if we can start sending player movement data over the network
    this.playerIsAllowedToMove = false;
    this.createPlayer = true;

    // movement of the player variables .......
    this.graffitiDrawing = false;

    this.playerClicks = 0;
    this.playerClickTime = 0;
    this.isClicking = false;
    this.cursorKeyIsDown = false;
    this.swipeAmount = new Phaser.Math.Vector2(0, 0);
    this.target = new Phaser.Math.Vector2();
    this.distanceTolerance = 9;
    this.movingByDragging = false;
    // movement of the player variables .......


    this.playerAvatarPlaceholder = 'avatar1';
    this.avatarSize = 64;
    this.cameraShake = false;

    this.createOnlinePlayers = false;
    this.updateOnlinePlayers = false;

    /** @var {array} allConnectedUsers Players except self that are online in the same location */
    this.allConnectedUsers = [];

    /** @var {array} removedConnectedUsers Players that need to be removed */
    this.removedConnectedUsers = [];

    /** @var {array} createOnlinePlayerArray Players that need to be added */
    this.createOnlinePlayerArray = [];

    this.playerAvatarKey = '';
    this.playerAvatarKeyDefault = 'avatar1';
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.lastMoveCommand = {
      action: 'stop', posX: 0, posY: 0, location: get(playerStreamID),
    };

    // .....................................................................
    // to select a home and save it's position as admin server side
    // (it doesn't save when it is not a home)
    // and to select and manipulate GameObjects in Edit Mode
    this.selectedGameObject = null;
    // being able to reset scale to original, within edit mode
    this.selectedGameObjectStartScale = 1;
    // being able to reset position to original, within edit mode
    this.selectedGameObjectStartPosition = new Phaser.Math.Vector2(0, 0);
    // .....................................................................

    // this.gameStarted = false;
    this.launchLocation = 'Location1'; // default

    // timers
    this.updateMovementTimer = 0;
    this.updateMovementInterval = 30; // 20 fps


    this.socketIsConnected = false;
  }

  /** Create Socket connection and listen for incoming streaming data, presence and notifications */
  async createSocket() {
    const { artworldVectorToPhaser2D, artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;

    this.socket = await client.createSocket(this.useSSL, this.verboseLogging);
    dlog('socket created with client');

    this.userProfile = get(Profile);
    dlog('this.userProfile', this.userProfile);

    const createStatus = true;
    this.socket.connect(get(Session), createStatus).then(() => {
      this.socketIsConnected = true;
      this.getStreamUsers('join');
      dlog('Join:', get(playerLocation).scene);
    });


    // Streaming data containing movement data for the players in our allConnectedUsers array
    this.socket.onstreamdata = (streamdata) => {
      const data = JSON.parse(streamdata.data);

      // parse the movement data for the players in our allConnectedUsers array
      this.allConnectedUsers.forEach((onlinePlayer, index) => {
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

              const moveToX = artworldToPhaser2DX(
                scene.worldSize.x,
                data.posX,
              );

              const moveToY = artworldToPhaser2DY(
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
            } else if (data.action === 'stop') {
              // position data from online player, is converted in Player.js class receiveOnlinePlayersMovement
              // because there the scene context is known

              // if there is an unfinished tween, stop it and stop the online player
              // if (typeof this[updateOnlinePlayer] !== 'undefined') {
              //   this[updateOnlinePlayer].stop();
              // }

              let positionVector = new Phaser.Math.Vector2(
                data.posX,
                data.posY,
              );

              // dlog('positionVector', positionVector);

              positionVector = artworldVectorToPhaser2D(
                scene.worldSize,
                positionVector,
              );

              updateOnlinePlayer.posX = positionVector.x;
              updateOnlinePlayer.posY = positionVector.y;

              updateOnlinePlayer.x = positionVector.x;
              updateOnlinePlayer.y = positionVector.y;

              // get the key for the stop animation of the player, and play it
              updateOnlinePlayer.anims.play(updateOnlinePlayer.getData('stopKey'), true);
            } else if (data.action === 'physicsStop') {
              // position data from online player, is converted in Player.js class receiveOnlinePlayersMovement
              // because there the scene context is known

              let positionVector = new Phaser.Math.Vector2(
                data.posX,
                data.posY,
              );

              // dlog('positionVector', positionVector);

              positionVector = artworldVectorToPhaser2D(
                scene.worldSize,
                positionVector,
              );

              // set the position on the player for the server side storing
              updateOnlinePlayer.posX = positionVector.x;
              updateOnlinePlayer.posY = positionVector.y;

              // if there is an unfinished tween, stop it and stop the online player
              if (typeof this[updateOnlinePlayer] !== 'undefined') {
                // dlog('this[updateOnlinePlayer]', this[updateOnlinePlayer]);
                this[updateOnlinePlayer].stop();
                // dlog("duration", duration)

                // const target = new Phaser.Math.Vector2(positionVector.x, positionVector.y);
                // const duration = target.length() / 2;
                // dlog('duration', duration);

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
      // dlog('this.socket.onstreampresence');

      // streampresence is everybody that is present also SELF
      if (streampresence.leaves) {
        streampresence.leaves.forEach((leave) => {
          dlog('User left: %o', leave);
          this.getStreamUsers('get_users');
        });
      }

      if (streampresence.joins) {
        streampresence.joins.forEach((join) => {
          // filter out the player it self
          // dlog("this.userProfile.id", this.userProfile.id);

          // dlog('this.userProfile = ', this.userProfile);
          if (join.user_id !== this.userProfile.id) {
            // dlog(this.userProfile)
            dlog('someone joined', join);
            // this.getStreamUsers("home")
            // dlog(join.username)
            // dlog("join", join);
            // const tempName = join.user_id
            this.getStreamUsers('get_users');
          } else {
            // dlog('join', join);
          }
        });
        // this.getStreamUsers("home")
      }
    };

    this.socket.onnotification = (notif) => {
      Notification.set(notif);
      dlog('Received %o', notif);
      dlog('Notification content %s', notif);
    };

    // this.socket.onerror = (event) => {
    // console.log('socket error!', event);
    // };

    this.socket.ondisconnect = async () => {
      logout();
    };
  } // end createSocket

  /** Get ...
   * @todo Extend documentation
   */
  async getStreamUsers(rpcCommand) {
    //* rpcCommand:
    //* join" = join the stream, get the online users, except self
    //* get_users" = after joined, get the online users, except self
    const location = get(playerStreamID);

    dlog(
      `this.getStreamUsers("${rpcCommand}"), location = ${location}`,
    );


    const streamUsersPromise = new Promise((resolve) => {
      this.socket.rpc(rpcCommand, location).then((rec) => {
        //! the server reports all users in location except self_user
        dlog(location);
        // get all online players = serverArray
        // create array for newUsers and create array for deleteUsers
        const serverArray = JSON.parse(rec.payload) || [];
        // dlog('serverArray', serverArray, 'currentScene', this.currentScene);



        serverArray.forEach((newPlayer) => {
          const exists = this.allConnectedUsers.some(
            (element) => element.user_id === newPlayer.user_id,
          );
          if (!exists) {
            this.createOnlinePlayerArray.push(newPlayer);
            dlog('newPlayer', newPlayer);
          }
        });

        // allConnectedUsers had id, serverArray has user_id
        this.allConnectedUsers.forEach((onlinePlayer) => {
          const exists = serverArray.some(
            (element) => element.user_id === onlinePlayer.user_id,
          );
          if (!exists) {
            this.deleteOnlinePlayer(onlinePlayer);
            dlog('remove onlinePlayer', onlinePlayer);
          }
        });

        // send our current location in the world to all connected players
        // dlog('send our current location in the world to all connected players');
        // dlog("this.lastMoveCommand", this.lastMoveCommand)
        // dlog("this.currentScene", this.currentScene)
        // dlog('this.lastMoveCommand', this.lastMoveCommand);

        // resolve();
        if (this.currentScene !== null) {
          setTimeout(() => {
            const { posX, posY, action } = this.lastMoveCommand;

            // dlog('timeout!, currentScene = ', this.currentScene);
            this.sendMoveMessage(this.currentScene, posX, posY, action);
            // dlog('sending move message!');

            resolve(rpcCommand, location);
          }, 1500);
        } else {
          resolve(rpcCommand, location);
        }
      });
    });

    return streamUsersPromise;
  }

  /**
   * Delete an online player
   * @param {object} onlinePlayer The currently online player
   */
  deleteOnlinePlayer(onlinePlayer) {
    // onlinePlayer has id

    // dlog("onlinePlayer", onlinePlayer)
    // dlog("this.allConnectedUsers", this.allConnectedUsers)

    // destroy the user if it exists in the array
    const removeUser = this.allConnectedUsers.filter(
      (obj) => obj.user_id === onlinePlayer.user_id,
    );
    dlog('removeUser', removeUser);

    removeUser.forEach((element) => {
      element.destroy();
    });

    // remove oldPlayer from allConnectedUsers
    this.allConnectedUsers = this.allConnectedUsers.filter(
      (obj) => obj.user_id !== onlinePlayer.user_id,
    );

    dlog('this.allConnectedUsers', this.allConnectedUsers);
  }

  /** Transpose phaser coordinates to artworld coordinates and send move message */
  sendMoveMessage(scene, posX, posY, action) {
    const data = {
      action,
      posX: CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, posX),
      posY: CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, posY),
      location: get(playerStreamID),
    };

    this.lastMoveCommand = { ...data };
    this.socket.rpc('move_position', JSON.stringify(data));
  }
} // end class

export default new ManageSession();
