import ManageSession from '../ManageSession';
import { listObjects, convertImage } from '../../../api';

import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Preloader from '../class/Preloader';
import Background from '../class/Background';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
// import GenerateLocation from "../class/GenerateLocation.js"
import HistoryTracker from '../class/HistoryTracker';
import ArtworkList from '../class/ArtworkList';
import Move from '../class/Move';

const { Phaser } = window;

export default class DefaultUserHome extends Phaser.Scene {
  constructor() {
    super('DefaultUserHome');

    this.worldSize = new Phaser.Math.Vector2(6000, 2000);

    this.debug = false;

    this.gameStarted = false;
    this.phaser = this;

    this.onlinePlayers = [];
    this.newOnlinePlayers = [];

    this.currentOnlinePlayer;
    this.avatarName = [];
    this.tempAvatarName = '';
    this.loadedAvatars = [];

    this.player;
    this.playerShadow;
    this.playerContainer;
    this.playerAvatarPlaceholder = 'avatar1';
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.playerAvatarKey = '';
    this.createdPlayer = false;

    this.homes = [];
    this.homesRepreseneted = [];
    this.homesGenerate = false;

    this.allUserArt = [];
    this.userArtServerList = [];
    this.userArtDisplayList = [];
    this.artUrl = [];

    // track for progress and completion of artworks
    this.progress = [];
    this.progressStopmotion = [];

    // sizes for the artWorks
    this.artIconSize = 64;
    this.artPreviewSize = 128;
    this.artDisplaySize = 512;

    this.artOffsetBetween = 20;

    this.offlineOnlineUsers;

    this.location = '';

    // .......................REX UI ............
    this.COLOR_PRIMARY = 0xff5733;
    this.COLOR_LIGHT = 0xffffff;
    this.COLOR_DARK = 0x000000;
    this.data;
    // ....................... end REX UI ......

    this.cursors;
    this.pointer;
    this.isClicking = false;
    this.cursorKeyIsDown = false;
    this.swipeDirection = 'down';
    this.swipeAmount = new Phaser.Math.Vector2(0, 0);
    this.graffitiDrawing = false;

    // pointer location example
    // this.source // = player
    this.target = new Phaser.Math.Vector2();
    this.distance;

    // shadow
    this.playerShadowOffset = -8;
    this.playerIsMovingByClicking = false;

    // UI scene
    this.currentZoom;
  }

  init(data) {
    this.location = data.user_id;
    // console.log('init', data)
  }

  async preload() {
    Preloader.Loading(this); // .... PRELOADER VISUALISER
  }// end preload

  async create() {
    // copy worldSize over to ManageSession, so that positionTranslation can be done there
    ManageSession.worldSize = this.worldSize;

    // .......  LOAD PLAYER AVATAR ..........................................................................
    ManageSession.createPlayer = true;
    // ....... end LOAD PLAYER AVATAR .......................................................................
    Background.repeatingDots({
      scene: this, gridOffset: 50, dotWidth: 2, dotColor: 0x909090, backgroundColor: 0xFFFFFF,
    });

    this.touchBackgroundCheck = this.add.rectangle(0, 0, this.worldSize.x, this.worldSize.y, 0xfff000)
      .setInteractive() // { useHandCursor: true }
      .on('pointerup', () => console.log('touched background'))
      .on('pointerdown', () => ManageSession.playerMove = true)
      .setDepth(219)
      .setOrigin(0)
      .setVisible(false);

    this.touchBackgroundCheck.input.alwaysEnabled = true; // this is needed for an image or sprite to be interactive also when alpha = 0 (invisible)

    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with Default 0 ,0 artworldCoordinates
    this.player = new PlayerDefault(this, 0, 0, this.playerAvatarPlaceholder).setDepth(201);
    this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder }).setDepth(200);
    // .......  end PLAYER ................................................................................
    // for back button
    HistoryTracker.pushLocation(this);

    // ....... onlinePlayers ..............................................................................
    // add onlineplayers group
    // this.onlinePlayersGroup = this.add.group()
    // ....... end onlinePlayers ..........................................................................
    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);
    //! setBounds has to be set before follow, otherwise the camera doesn't follow!
    this.gameCam.zoom = 1;
    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // ......... end PLAYER VS WORLD .......................................................................

    this.artworksListSpinner = this.rexSpinner.add.pie({
      x: this.worldSize.x / 2,
      y: this.worldSize.y / 2,
      width: 400,
      height: 400,
      duration: 850,
      color: 0xffff00,
    }).setDepth(199);

    this.artworksListSpinner.start();

    Player.loadPlayerAvatar(this, 0, 0);

    await listObjects('drawing', this.location, 100).then((rec) => {
      // this.userArtServerList is an array with objects, in the form of:

      // collection: "drawing"
      // create_time: "2022-01-27T16:46:00Z"
      // key: "1643301959176_cyaanConejo"
      // permission_read: 1
      // permission_write: 1
      // update_time: "2022-02-09T13:47:01Z"
      // user_id: "5264dc23-a339-40db-bb84-e0849ded4e68"
      // value:
      //  displayname: "cyaanConejo"
      //  json: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.json"
      //  previewUrl: "https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png?signature=6339bb9aa7f10a73387337ce0ab59ab5d657e3ce95b70a942b339cbbd6f15355"
      //  status: ""
      //  url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png"
      //  version: 0

      // permission_read: 1 indicates hidden
      // permission_read: 2 indicates visible

      // we filter out the visible artworks
      // filter only the visible art = "permission_read": 2
      this.userArtServerList = rec.filter((obj) => obj.permission_read == 2);

      console.log('this.userArtServerList', this.userArtServerList);
      if (this.userArtServerList.length > 0) {
        this.userArtServerList.forEach((element, index, array) => {
          this.downloadArt(element, index, array);
        });
      } else {
        this.artworksListSpinner.destroy();
      }
    });

    // await listObjects("stopmotion", this.location, 100).then((rec) => {
    // this.userArtServerList is an array with objects, in the form of:

    // collection: "stopmotion"
    // create_time: "2022-01-27T16:46:00Z"
    // key: "1643301959176_cyaanConejo"
    // permission_read: 1
    // permission_write: 1
    // update_time: "2022-02-09T13:47:01Z"
    // user_id: "5264dc23-a339-40db-bb84-e0849ded4e68"
    // value:
    //  displayname: "cyaanConejo"
    //  json: "stopmotion//5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.json"
    //  previewUrl: "https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png?signature=6339bb9aa7f10a73387337ce0ab59ab5d657e3ce95b70a942b339cbbd6f15355"
    //  status: ""
    //  url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png"
    //  version: 0

    // permission_read: 1 indicates hidden
    // permission_read: 2 indicates visible

    // we filter out the visible artworks
    // filter only the visible art = "permission_read": 2
    //     this.userStopmotionServerList = rec.filter(obj => obj.permission_read == 2)

    //     console.log("this.userStopmotionServerList", this.userStopmotionServerList)
    //     if (this.userStopmotionServerList.length > 0) {
    //         this.userStopmotionServerList.forEach((element, index, array) => {
    //             this.downloadStopmotion(element, index, array)
    //         })
    //     }
    // })
  }// end create

  async downloadStopmotion(element, index, array) {
    //! we are placing the artWorks 'around' (left and right of) the center of the world
    const totalArtWorks = array.length;
    const imageKeyUrl = element.value.url;
    const imgSize = this.artDisplaySize.toString();
    const fileFormat = 'png';
    // put the artworks 'around' the center, which means: take total artworks * space = total x space eg 3 * 550 = 1650
    // we start at middleWorld.x - totalArtWidth + (artIndex * artDisplaySize)

    const totalArtWidth = (this.artDisplaySize + 38) * totalArtWorks;

    console.log('totalArtWidth', totalArtWidth);
    const middleWorldX = CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0);
    const startXArt = middleWorldX - (totalArtWidth / 2);

    const coordX = index == 0 ? startXArt : (startXArt) + (index * (this.artDisplaySize + 38));
    this.stopmotionContainer = this.add.container(0, 0).setDepth(100);

    const y = 500 + this.artDisplaySize + (38 * 4);

    if (this.textures.exists(imageKeyUrl)) { // if the image has already downloaded, then add image by using the key
      // adds a frame to the container
      this.stopmotionContainer.add(this.add.image(coordX - this.artDisplaySize / 2, y, 'artFrame_512').setOrigin(0.5));

      // adds the image to the container
      const setImage = this.add.sprite(coordX - this.artDisplaySize / 2, y, imageKeyUrl).setOrigin(0.5);
      this.stopmotionContainer.add(setImage);
      this.artworksListSpinner.destroy();
    } else { // otherwise download the image and add it
      const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);

      // for tracking each file in progress
      this.progressStopmotion.push({ imageKeyUrl, coordX });
      console.log('imageKeyUrl stopmotion', imageKeyUrl);

      this.load.spritesheet(imageKeyUrl, convertedImage, { frameWidth: this.artDisplaySize, frameHeight: this.artDisplaySize });
      console.log('stopmotion', imageKeyUrl);
      this.load.start(); // start the load queue to get the image in memory
    }

    this.load.on('filecomplete', (key) => {
      // on completion of each specific artwork
      const currentImage = this.progressStopmotion.find((element) => element.imageKeyUrl == key);

      console.log('currentImage', currentImage);
      // we don't want to trigger any other load completions
      if (currentImage) {
        // adds a frame to the container
        this.stopmotionContainer.add(this.add.image(currentImage.coordX - this.artDisplaySize / 2, y, 'artFrame_512').setOrigin(0.5));

        const avatar = this.textures.get(currentImage.imageKeyUrl);
        const avatarWidth = avatar.frames.__BASE.width;
        console.log('stopmotion width: ', avatarWidth);

        const avatarHeight = avatar.frames.__BASE.height;
        console.log(`stopmotion Height: ${avatarHeight}`);

        const avatarFrames = Math.round(avatarWidth / avatarHeight);
        console.log(`stopmotion Frames: ${avatarFrames}`);

        // make an animation if the image is wider than tall

        if (avatarFrames > 1) {
          // . animation for the player avatar ......................

          this.stopmotionMovingKey = 'moving_stopmotion';
          this.stopmotionStopKey = 'stop_stopmotion';

          // check if the animation already exists
          if (!this.anims.exists(this.stopmotionMovingKey)) {
            this.anims.create({
              key: this.stopmotionMovingKey,
              frames: this.anims.generateFrameNumbers(currentImage.imageKeyUrl, {
                start: 0,
                end: avatarFrames - 1,
              }),
              frameRate: (avatarFrames + 2) * 2,
              repeat: -1,
              yoyo: false,
            });

            this.anims.create({
              key: this.stopmotionStopKey,
              frames: this.anims.generateFrameNumbers(currentImage.imageKeyUrl, {
                start: 0,
                end: 0,
              }),
            });
          }
        }
        // . end animation for the player avatar ......................

        // scene.player.setTexture(scene.playerAvatarKey)

        // adds the image to the container
        const completedImage = this.add.sprite(currentImage.coordX - this.artDisplaySize / 2, y, currentImage.imageKeyUrl).setOrigin(0.5);
        this.stopmotionContainer.add(completedImage);

        if (avatarFrames > 1) {
          completedImage.play(this.stopmotionMovingKey);
        }
      }
    });
  }// end downloadStopmotion

  async downloadArt(element, index, array) {
    //! we are placing the artWorks 'around' (left and right of) the center of the world
    const totalArtWorks = array.length;
    const imageKeyUrl = element.value.url;
    console.log('imageKeyUrl stopmotion', imageKeyUrl);
    const imgSize = this.artDisplaySize.toString();
    const fileFormat = 'png';
    // put the artworks 'around' the center, which means: take total artworks * space = total x space eg 3 * 550 = 1650
    // we start at middleWorld.x - totalArtWidth + (artIndex * artDisplaySize)

    const totalArtWidth = (this.artDisplaySize + 38) * totalArtWorks;

    console.log('totalArtWidth', totalArtWidth);
    const middleWorldX = CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0);
    const startXArt = middleWorldX - (totalArtWidth / 2);

    const coordX = index == 0 ? startXArt : (startXArt) + (index * (this.artDisplaySize + 38));
    this.artContainer = this.add.container(0, 0).setDepth(100);

    const y = 500;

    if (this.textures.exists(imageKeyUrl)) { // if the image has already downloaded, then add image by using the key
      // adds a frame to the container
      this.artContainer.add(this.add.image(coordX - this.artDisplaySize / 2, y, 'artFrame_512').setOrigin(0.5));

      // adds the image to the container
      const setImage = this.add.image(coordX - this.artDisplaySize / 2, y, imageKeyUrl).setOrigin(0.5);
      this.artContainer.add(setImage);
      this.artworksListSpinner.destroy();
    } else { // otherwise download the image and add it
      const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);

      // for tracking each file in progress
      this.progress.push({ imageKeyUrl, coordX });

      this.load.image(imageKeyUrl, convertedImage);

      this.load.start(); // start the load queue to get the image in memory
    }

    ArtworkList.placeHeartButton(this, coordX, y, imageKeyUrl, element);

    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    const progressWidth = 256;
    const progressHeight = 50;
    const padding = 10;

    this.load.on('fileprogress', (file, value) => {
      progressBox.clear();
      progressBar.clear();
      progressBox.fillStyle(0x000000, 1);
      progressBar.fillStyle(0xFFFFFF, 1);

      // the progress bar is displayed for each artworks loading process
      const progressedImage = this.progress.find((element) => element.imageKeyUrl == file.key);

      // we want to run the progress bar only for artworks,
      // and it should not be triggered for any other loading processes
      if (progressedImage) {
        progressBox.fillRect(progressedImage.coordX - progressWidth * 1.5, y, progressWidth, progressHeight);
        progressBar.fillRect(progressedImage.coordX - progressWidth * 1.5 + padding, y + padding, (progressWidth * value) - (padding * 2), progressHeight - padding * 2);
      }
    });

    this.load.on('filecomplete', (key) => {
      // on completion of each specific artwork
      const currentImage = this.progress.find((element) => element.imageKeyUrl == key);

      // we don't want to trigger any other load completions
      if (currentImage) {
        // adds a frame to the container
        this.artContainer.add(this.add.image(currentImage.coordX - this.artDisplaySize / 2, y, 'artFrame_512').setOrigin(0.5));

        // adds the image to the container
        const completedImage = this.add.image(currentImage.coordX - this.artDisplaySize / 2, y, currentImage.imageKeyUrl).setOrigin(0.5);
        this.artContainer.add(completedImage);
      }
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      this.progress = [];
      this.artworksListSpinner.destroy();
    });
  }// end downloadArt

  update(time, delta) {
    // ...... ONLINE PLAYERS ................................................
    // Player.parseNewOnlinePlayerArray(this)
    // .......................................................................

    this.gameCam.zoom = ManageSession.currentZoom;
    // .......................................................................

    // ........... PLAYER SHADOW .............................................................................
    // the shadow follows the player with an offset
    this.playerShadow.x = this.player.x + this.playerShadowOffset;
    this.playerShadow.y = this.player.y + this.playerShadowOffset;
    // ........... end PLAYER SHADOW .........................................................................

    // ....... moving ANIMATION ......................................................................................
    Move.checkIfPlayerReachedMoveGoal(this);
    // ....... end moving ANIMATION .................................................................................

    // to detect if the player is clicking/tapping on one place or swiping
    if (this.input.activePointer.downX != this.input.activePointer.upX) {
      Move.moveBySwiping(this);
    } else {
      Move.moveByTapping(this);
    }
  } // update
} // class
