import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import CoordinatesTranslator from './CoordinatesTranslator';
import { getAccount } from '../../../helpers/nakamaHelpers';
import { Profile, SelectedOnlinePlayer, ShowItemsBar } from '../../../session';
import { dlog } from '../../../helpers/debugLog';
import { PlayerPos } from '../playerState';
import { AVATAR_BASE_SIZE, AVATAR_SPRITESHEET_LOAD_SIZE } from '../../../constants';

class Player {
  subscribeToProfile() {
    Profile.subscribe((value) => {
      // when logging out, Profile is set to null
      if (value !== null) {
        dlog('Profile refreshed avatar');
        // dlog(value);

        this.subscribedToProfile = true;
        // update the Profile also in ManageSession
        ManageSession.userProfile = get(Profile);
        this.loadPlayerAvatar(ManageSession.currentScene, undefined, undefined, value);
      }
    });
  }

  /** Load users' avatar from server, after initially loading default avatar */
  loadPlayerAvatar(scene, placePlayerX, placePlayerY, userprofile) {
    const { artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;

    // set this.scene in ManageSession.currentScene
    ManageSession.currentScene = scene;

    if (!userprofile) userprofile = ManageSession.userProfile;
    // dlog('loadPlayerAvatar');

    // is playerAvaterKey already in loadedAvatars?
    // no -> load the avatar and add to loadedAvatars
    // yes -> dont load the avatar

    //* attatch to existing context and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // put the player in the last server known position
    // retreive position from ManageSession (there it is stored on boot)

    //* data model userAccount:
    // avatar_url: "avatar/stock/avatarRood.png"

    // url: "https://..."
    // username: "user11"
    // metadata:
    //        azc: "GreenSquare"
    //        location: "5264dc23-a339-40db-bb84-e0849ded4e68"
    //        posX: -2483
    //        posY: 0
    //        role: "speler"
    //        user_id: ""

    // check if account info is loaded
    if (userprofile.id == null) {
      dlog('(userprofile.id == null)');
      Player.reloadDefaultAvatar();
    }

    // TODO this should be kept in ManageSession or in this class is possible?
    scene.playerAvatarKey = `${userprofile.id}_${userprofile.update_time}`;

    // dlog('scene.playerAvatarKey avatar', scene.playerAvatarKey);
    let lastPosX;
    let lastPosY;
    if (typeof placePlayerY !== 'undefined') {
      // if there is an argument to place the player on a specific position in the scene
      lastPosX = placePlayerX;
      // dlog('placePlayerX', placePlayerX);
    } else {
      lastPosX = get(PlayerPos).x; // PlayerPos is in artworldCoordinates, will be converted later
      // dlog('lastPosX', lastPosX);
    }
    if (typeof placePlayerY !== 'undefined') {
      lastPosY = placePlayerY; // if there is an argument to place the player on a specific position in the scene
      // dlog('placePlayerY', placePlayerY);
    } else {
      lastPosY = get(PlayerPos).y; // PlayerPos is in artworldCoordinates, will be converted later
      // dlog('lastPosY', lastPosY);
    }
    // dlog("lastPosX, lastPosY, locationID", lastPosX, lastPosY, ManageSession.locationID)

    // positioning player

    // check if last position (artworldCoordinates) is outside the worldBounds for some reason
    // otherwise place it within worldBounds
    // a random number between -150 and 150
    if (lastPosX > scene.worldSize.x / 2 || lastPosX < -scene.worldSize.x / 2) {
      lastPosX = Math.floor(Math.random() * 300 - 150);
    }
    if (lastPosY > scene.worldSize.y / 2 || lastPosY < -scene.worldSize.y / 2) {
      lastPosY = Math.floor(Math.random() * 300 - 150);
    }
    // dlog('lastPosX, lastPosY', lastPosX, lastPosY);
    // dlog();

    // place player in Phaser2D coordinates
    scene.player.x = artworldToPhaser2DX(scene.worldSize.x, lastPosX);
    scene.player.y = artworldToPhaser2DY(scene.worldSize.y, lastPosY);

    // pass this position to network
    ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y);

    // dlog("scene.player.x, scene.player.y", scene.player.x, scene.player.y)
    // set url param's to player pos and scene key, url params are in artworldCoords lastPosX lastPosY is artworldCoords
    // setUrl(scene.location, lastPosX, lastPosY);
    // updateQueryString();

    // store the current position of player in ManageSession.lastMoveCommand
    // ManageSession.lastMoveCommand.posX = scene.player.x;
    // ManageSession.lastMoveCommand.posY = scene.player.y;
    // ManageSession.lastMoveCommand.action = 'stop';
    // ManageSession.lastMoveCommand.location = ManageSession.location;
    // dlog('ManageSession.lastMoveCommand', ManageSession.lastMoveCommand);

    // if for some reason the url of the player avatar is empty, load the default avatar
    if (userprofile.url === '') {
      dlog("avatar url is empty, set to default 'avatar1' ");
      Player.reloadDefaultAvatar();
    }

    // if the texture doesnot exists (if it is new) load it and attach it to the player
    if (!scene.textures.exists(scene.playerAvatarKey)) {
      // dlog("didn't exist yet: scene.textures.exists(scene.playerAvatarKey)", scene.playerAvatarKey);
      const fileNameCheck = scene.playerAvatarKey;

      // convert the avatar url to a converted png url
      // console.log('userprofile.url', userprofile.url);

      scene.load
        .spritesheet(fileNameCheck, userprofile.url, {
          frameWidth: AVATAR_SPRITESHEET_LOAD_SIZE,
          frameHeight: AVATAR_SPRITESHEET_LOAD_SIZE,
        })
        .on(
          `filecomplete-spritesheet-${fileNameCheck}`,
          () => {
            // dlog('filecomplete-spritesheet scene.playerAvatarKey', scene.playerAvatarKey);
            if (this.subscribedToProfile !== true) {
              this.subscribeToProfile();
            }
            Player.attachAvatarToPlayer(scene, fileNameCheck);
          },
          scene
        );
      scene.load.start(); // start loading the image in memory
    } else {
      // else reload the already in memory avatar
      // dlog('existed already: scene.textures.exists(scene.playerAvatarKey)');
      Player.attachAvatarToPlayer(scene);
    }
  }

  static async attachAvatarToPlayer(scene) {
    // dlog(' attachAvatarToPlayer(scene)');

    const avatar = scene.textures.get(scene.playerAvatarKey);
    const avatarWidth = avatar.frames.__BASE.width;
    // dlog('avatarWidth: ', avatarWidth);

    const avatarHeight = avatar.frames.__BASE.height;
    // dlog('avatarHeight: ', avatarHeight);

    const avatarFrames = Math.round(avatarWidth / avatarHeight);
    // dlog(`avatarFrames: ${avatarFrames}`);

    // make an animation if the image is wider than tall

    // if (avatarFrames < 1) {
    // . animation for the player avatar ......................
    // dlog('avatarFrames > 1');

    scene.playerMovingKey = `moving_${scene.playerAvatarKey}`;
    scene.playerStopKey = `stop_${scene.playerAvatarKey}`;

    // check if the animation already exists
    if (!scene.anims.exists(scene.playerMovingKey)) {
      scene.anims.create({
        key: scene.playerMovingKey,
        frames: scene.anims.generateFrameNumbers(scene.playerAvatarKey, {
          start: 0,
          end: avatarFrames - 1,
        }),
        frameRate: (avatarFrames + 2) * 2,
        repeat: -1,
        yoyo: true,
      });

      scene.anims.create({
        key: scene.playerStopKey,
        frames: scene.anims.generateFrameNumbers(scene.playerAvatarKey, {
          start: 0,
          end: 0,
        }),
      });
    }
    //    }

    // . end animation for the player avatar ......................

    scene.player.setTexture(scene.playerAvatarKey);
    scene.playerShadow.setTexture(scene.playerAvatarKey);

    // dlog('scene.player.setTexture(scene.playerAvatarKey) done ');
    // scale the player to AVATAR_BASE_SIZE
    const width = AVATAR_BASE_SIZE;
    scene.player.displayWidth = width;
    scene.player.scaleY = scene.player.scaleX;

    scene.playerShadow.displayWidth = width;
    scene.playerShadow.scaleY = scene.playerShadow.scaleX;

    //* set the collision body
    //* setCircle(radius [, offsetX] [, offsetY])
    // scene.player.body.setCircle(width, width, width / 2)
    scene.player.body.setCircle(width / 1.1, width / 5, width / 5);

    // send the current player position over the network
    ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y, 'stop');
  } // end attachAvatarToPlayer

  static reloadDefaultAvatar(scene) {
    scene = ManageSession.currentScene;
    scene.playerAvatarKey = 'avatar1';
    Player.attachAvatarToPlayer(scene, 'avatar1');
  }

  parseNewOnlinePlayerArray(scene) {
    if (ManageSession.createOnlinePlayerArray.length > 0) {
      // get more account info for each onlineplayer
      ManageSession.createOnlinePlayerArray.forEach((onlinePlayer) => {
        Promise.all([getAccount(onlinePlayer.user_id)]).then((rec) => {
          const newOnlinePlayer = rec[0];
          dlog('newOnlinePlayer: ', newOnlinePlayer);
          this.createOnlinePlayer(scene, newOnlinePlayer);
          // dlog("parseNewOnlinePlayerArray scene", scene)
        });

        // new onlineplayer is removed from the newOnlinePlayer array, once we call more data on it
        ManageSession.createOnlinePlayerArray = ManageSession.createOnlinePlayerArray.filter(
          (obj) => obj.user_id !== onlinePlayer.user_id
        );
      });
    }
  }

  createOnlinePlayer(scene, onlinePlayer) {
    // check if onlinePlayer exists already
    // dlog(onlinePlayer)
    const exists = ManageSession.allConnectedUsers.some((element) => element.user_id === onlinePlayer.user_id);
    // if player does not exists yet
    if (!exists) {
      // create new onlinePlayer with default avatar
      const onlinePlayerCopy = onlinePlayer;
      // dlog("createOnlinePlayer scene", scene)
      onlinePlayer = scene.add
        .sprite(
          CoordinatesTranslator.artworldToPhaser2DX(scene.worldSize.x, onlinePlayerCopy.meta.PosX),
          CoordinatesTranslator.artworldToPhaser2DY(scene.worldSize.y, onlinePlayerCopy.meta.PosY),
          ManageSession.playerAvatarPlaceholder
        )

        .setDepth(200);
      /** Make onlinePlayer interactive so that when we click on it
       * we see onlinePlayer itemsBar in the right bottom corner
       */
      onlinePlayer.setInteractive({ useHandCursor: true });
      // hit area of onlinePlayer
      onlinePlayer.input.hitArea.setTo(-10, -10, onlinePlayer.width + 50, onlinePlayer.height + 50);
      onlinePlayer.on('pointerup', () => {
        // pass on values to ItemsBar.svelte & selectedPlayerBar.svelte
        SelectedOnlinePlayer.set(onlinePlayer);
        ShowItemsBar.set(false);
      });

      onlinePlayer.setData('movingKey', 'moving');
      onlinePlayer.setData('stopKey', 'stop');

      // create default animation for moving
      scene.anims.create({
        key: onlinePlayer.getData('movingKey'),
        frames: scene.anims.generateFrameNumbers(ManageSession.playerAvatarPlaceholder, { start: 0, end: 8 }),
        frameRate: 20,
        repeat: -1,
      });

      // create default animation for stop
      scene.anims.create({
        key: onlinePlayer.getData('stopKey'),
        frames: scene.anims.generateFrameNumbers(ManageSession.playerAvatarPlaceholder, { start: 4, end: 4 }),
      });

      // add all data from elementCopy to element; like prev Position, Location, UserID
      Object.assign(onlinePlayer, onlinePlayerCopy);
      // we copy the id over as user_id to kep data consistent across our internal logic
      onlinePlayer.user_id = onlinePlayerCopy.id;
      // dlog('onlinePlayer', onlinePlayer);

      // we push the new online player to the allConnectedUsers array
      ManageSession.allConnectedUsers.push(onlinePlayer);

      // we load the onlineplayer avatar, make a key for it
      const avatarKey = `${onlinePlayer.user_id}_${onlinePlayer.update_time}`;
      // dlog("avatarKey", avatarKey)

      // if the texture already exists attach it again to the player
      // const preExisting = false
      if (!scene.textures.exists(avatarKey)) {
        // dlog('scene.textures.exists(avatarKey)', scene.textures.exists(avatarKey));
        // add it to loading queue
        scene.load
          .spritesheet(avatarKey, onlinePlayer.url, {
            frameWidth: AVATAR_SPRITESHEET_LOAD_SIZE,
            frameHeight: AVATAR_SPRITESHEET_LOAD_SIZE,
          })
          .on(
            `filecomplete-spritesheet-${avatarKey}`,
            () => {
              this.attachAvatarToOnlinePlayer(scene, onlinePlayer, avatarKey);
            },
            scene
          );
        // when file is finished loading the attachToAvatar function is called
        scene.load.start(); // start loading the image in memory
      } else {
        // dlog('scene.textures.exists(avatarKey)', scene.textures.exists(avatarKey));
        // attach the avatar to the onlinePlayer when it is already in memory
        this.attachAvatarToOnlinePlayer(scene, onlinePlayer, avatarKey);
      }
      // else {
      //   preExisting = true
      //   this.attachAvatarToOnlinePlayer(scene, onlinePlayer, tempAvatarName, preExisting)
      // }
    }
  }

  attachAvatarToOnlinePlayer(scene, onlinePlayer, tempAvatarName) {
    // dlog("player, tempAvatarName", onlinePlayer, tempAvatarName)

    onlinePlayer.active = true;
    onlinePlayer.visible = true;

    const avatar = scene.textures.get(tempAvatarName);
    const avatarWidth = avatar.frames.__BASE.width;
    const avatarHeight = avatar.frames.__BASE.height;

    const avatarFrames = Math.round(avatarWidth / avatarHeight);
    // dlog('onlinePlayer avatarFrames', avatarFrames);

    let setFrameRate = 0;
    if (avatarFrames > 1) {
      setFrameRate = (avatarFrames + 2) * 2;
    } else {
      setFrameRate = 0;
    }
    // if (avatarFrames > 1) {
    // set names for the moving and stop animations

    onlinePlayer.setData('movingKey', `moving_${tempAvatarName}`);
    onlinePlayer.setData('stopKey', `stop_${tempAvatarName}`);
    // dlog('onlinePlayer.getData("movingKey")');
    // dlog(onlinePlayer.getData('stopKey'));

    // create animation for moving
    if (!scene.anims.exists(onlinePlayer.getData('movingKey'))) {
      scene.anims.create({
        key: onlinePlayer.getData('movingKey'),
        frames: scene.anims.generateFrameNumbers(tempAvatarName, {
          start: 0,
          end: avatarFrames - 1,
        }),
        frameRate: setFrameRate,
        repeat: -1,
        yoyo: true,
      });

      // create animation for stop
      scene.anims.create({
        key: onlinePlayer.getData('stopKey'),
        frames: scene.anims.generateFrameNumbers(tempAvatarName, {
          start: 0,
          end: 0,
        }),
      });
    }
    // }// if (avatarFrames > 1) {

    onlinePlayer.setTexture(tempAvatarName);

    // scale the player to 64px
    const width = 62;
    onlinePlayer.displayWidth = width;
    onlinePlayer.scaleY = onlinePlayer.scaleX;
  }
}

export default new Player();
