import ManageSession from '../ManageSession';
import { listObjects, convertImage } from '../../../api';

import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Preloader from '../class/Preloader';
import Background from '../class/Background';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import SceneSwitcher from '../class/SceneSwitcher';
import ArtworkList from '../class/ArtworkList';
import Move from '../class/Move';
import { playerPos } from '../playerState';
import { SCENE_INFO } from '../../../constants';

const { Phaser } = window;

export default class DefaultUserHome extends Phaser.Scene {
  constructor() {
    super('DefaultUserHome');

    this.worldSize = new Phaser.Math.Vector2(6000, 2000);

    this.debug = false;

    this.phaser = this;

    this.avatarName = [];
    this.tempAvatarName = '';
    this.loadedAvatars = [];

    this.player = {};
    this.playerShadow = {};
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.playerAvatarKey = '';

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

    this.location = '';

    // .......................REX UI ............
    this.COLOR_PRIMARY = 0xff5733;
    this.COLOR_LIGHT = 0xffffff;
    this.COLOR_DARK = 0x000000;
    this.data;
    // ....................... end REX UI ......

    // shadow
    this.playerShadowOffset = -8;

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
    //!
    // get scene size from SCENE_INFO constants
    // copy worldSize over to ManageSession, so that positionTranslation can be done there
    let sceneInfo = SCENE_INFO.find(obj => obj.scene === this.scene.key);
    this.worldSize.x = sceneInfo.sizeX
    this.worldSize.y = sceneInfo.sizeY
    ManageSession.worldSize = this.worldSize;
    //!

    this.handleEditMode();

    this.makeBackground();

    this.handlePlayerMovement();

    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with Default 0 ,0 artworldCoordinates
    this.player = new PlayerDefault(this, 0, 0, ManageSession.playerAvatarPlaceholder).setDepth(201);
    this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: ManageSession.playerAvatarPlaceholder }).setDepth(200);
    // .......  end PLAYER ................................................................................
    // for back button
    SceneSwitcher.pushLocation(this);

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

    //

    Player.loadPlayerAvatar(this, 0, 0);

    // Set the player on 0,0 position (this also updates the URL automatically)
    playerPos.set({
      x: 0,
      y: 0,
    });

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
      this.userArtServerList = rec.filter((obj) => obj.permission_read === 2);

      // console.log('this.userArtServerList', this.userArtServerList);
      if (this.userArtServerList.length > 0) {
        this.userArtServerList.forEach((element, index, array) => {
          this.loadDrawing(element, index, array);
        });
      } else {
        this.artworksListSpinner.destroy();
      }
    });

    await listObjects('stopmotion', this.location, 100).then((rec) => {
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
      this.userStopmotionServerList = rec.filter((obj) => obj.permission_read === 2);

      console.log('this.userStopmotionServerList', this.userStopmotionServerList);
      if (this.userStopmotionServerList.length > 0) {
        this.userStopmotionServerList.forEach((element, index, array) => {
          this.downloadStopmotion(element, index, array);
        });
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
    const getImageWidth = (this.artDisplaySize * 10000).toString();
    const fileFormat = 'png';
    // put the artworks 'around' the center, which means: take total artworks * space = total x space eg 3 * 550 = 1650
    // we start at middleWorld.x - totalArtWidth + (artIndex * artDisplaySize)

    const totalArtWidth = (this.artDisplaySize + 38) * totalArtWorks;

    // console.log('totalArtWidth', totalArtWidth);
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
      const convertedImage = await convertImage(imageKeyUrl, imgSize, getImageWidth, fileFormat);
      // const convertedImage = element.value.previewUrl

      // for tracking each file in progress
      this.progressStopmotion.push({ imageKeyUrl, coordX });
      // console.log('imageKeyUrl stopmotion', imageKeyUrl);

      this.load.spritesheet(imageKeyUrl, convertedImage, { frameWidth: this.artDisplaySize, frameHeight: this.artDisplaySize });
      // console.log('stopmotion', imageKeyUrl);
      this.load.start(); // start the load queue to get the image in memory
    }

    //ArtworkList.placeHeartButton(this, coordX, y, imageKeyUrl, element, this.stopmotionContainer);

    this.load.on('filecomplete', (key) => {
      // on completion of each specific artwork
      const currentImage = this.progressStopmotion.find((element) => element.imageKeyUrl === key);

      // console.log('currentImage', currentImage);
      // we don't want to trigger any other load completions
      if (currentImage) {
        // adds a frame to the container
        this.stopmotionContainer.add(this.add.image(
          currentImage.coordX - this.artDisplaySize / 2,
          y,

          'artFrame_512',
        ).setOrigin(0.5));

        const avatar = this.textures.get(currentImage.imageKeyUrl);
        const avatarWidth = avatar.frames.__BASE.width;
        // console.log('stopmotion width: ', avatarWidth);

        const avatarHeight = avatar.frames.__BASE.height;
        // console.log(`stopmotion Height: ${avatarHeight}`);

        const avatarFrames = Math.round(avatarWidth / avatarHeight);
        // console.log(`stopmotion Frames: ${avatarFrames}`);

        // . animation for the player avatar ......................

        this.stopmotionMovingKey = 'moving_stopmotion';
        this.stopmotionStopKey = 'stop_stopmotion';

        // check if the animation already exists
        if (!this.anims.exists(this.stopmotionMovingKey)) {
          this.anims.create({
            key: 'moving_' + key,
            frames: this.anims.generateFrameNumbers(currentImage.imageKeyUrl, {
              start: 0,
              end: avatarFrames - 1,
            }),
            frameRate: (avatarFrames + 2) * 2,
            repeat: -1,
            yoyo: false,
          });

          this.anims.create({
            key: 'stop_' + key,
            frames: this.anims.generateFrameNumbers(currentImage.imageKeyUrl, {
              start: 0,
              end: 0,
            }),
          });
        }
        // . end animation for the player avatar ......................
        
        // adds the image to the container
        const completedImage = this.add.sprite(currentImage.coordX - this.artDisplaySize / 2, y, currentImage.imageKeyUrl).setOrigin(0.5);
        this.stopmotionContainer.add(completedImage);

        completedImage.setData("moveAnim", "moving_" + key)
        completedImage.setData("stopAnim", "stop_" + key)
        if (avatarFrames > 1) {
          completedImage.play("moving_" + key);
        }

        ArtworkList.placePlayPauseButton(this, coordX, y, imageKeyUrl, element, this.stopmotionContainer);

      }
    });
  }// end downloadStopmotion

  async loadDrawing(element, index, array) {
    //! we are placing the artWorks 'around' (left and right of) the center of the world
    const totalArtWorks = array.length;
    const imageKeyUrl = element.value.url;
    const imgSize = this.artDisplaySize.toString();
    const fileFormat = 'png';
    // put the artworks 'around' the center, which means: take total artworks * space = total x space eg 3 * 550 = 1650
    // we start at middleWorld.x - totalArtWidth + (artIndex * artDisplaySize)

    const totalArtWidth = (this.artDisplaySize + 38) * totalArtWorks;

    // console.log('totalArtWidth', totalArtWidth);
    const middleWorldX = CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0);
    const startXArt = middleWorldX - (totalArtWidth / 2);

    const coordX = index === 0 ? startXArt : (startXArt) + (index * (this.artDisplaySize + 38));
    this.drawingContainer = this.add.container(0, 0).setDepth(100);

    const y = 500;

    if (this.textures.exists(imageKeyUrl)) { // if the image has already downloaded, then add image by using the key
      // adds a frame to the container
      this.drawingContainer.add(this.add.image(coordX - this.artDisplaySize / 2, y, 'artFrame_512').setOrigin(0.5));

      // adds the image to the container
      const setImage = this.add.image(coordX - this.artDisplaySize / 2, y, imageKeyUrl).setOrigin(0.5);
      this.drawingContainer.add(setImage);
      this.artworksListSpinner.destroy();
    } else { // otherwise download the image and add it
      const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);

      // for tracking each file in progress
      this.progress.push({ imageKeyUrl, coordX });

      this.load.image(imageKeyUrl, convertedImage);

      this.load.start(); // start the load queue to get the image in memory
    }

    ArtworkList.placeHeartButton(this, coordX, y, imageKeyUrl, element, this.drawingContainer);

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
      const progressedImage = this.progress.find((element) => element.imageKeyUrl === file.key);

      // we want to run the progress bar only for artworks,
      // and it should not be triggered for any other loading processes
      if (progressedImage) {
        progressBox.fillRect(progressedImage.coordX - progressWidth * 1.5, y, progressWidth, progressHeight);
        progressBar.fillRect(
          progressedImage.coordX - progressWidth * 1.5 + padding,
          y + padding,
          (progressWidth * value) - (padding * 2),
          progressHeight - padding * 2,
        );
      }
    });

    this.load.on('filecomplete', (key) => {
      // on completion of each specific artwork
      const currentImage = this.progress.find((element) => element.imageKeyUrl === key);

      // we don't want to trigger any other load completions
      if (currentImage) {
        // adds a frame to the container
        this.drawingContainer.add(this.add.image(
          currentImage.coordX - this.artDisplaySize / 2,
          y,
          'artFrame_512',
        )
          .setOrigin(0.5));

        // adds the image to the container
        const completedImage = this.add.image(
          currentImage.coordX - this.artDisplaySize / 2,
          y,
          currentImage.imageKeyUrl,
        )
          .setOrigin(0.5);
        this.drawingContainer.add(completedImage);
      }
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      this.progress = [];
      this.artworksListSpinner.destroy();
    });
  }// end downloadArt

  makeBackground() {
    // the order of creation is the order of drawing: first = bottom ...............................
    Background.rectangle({
      scene: this,
      name: 'bgImageWhite',
      posX: 0,
      posY: 0,
      setOrigin: 0,
      color: 0xffffff,
      alpha: 1,
      width: this.worldSize.x,
      height: this.worldSize.y,
    });

    // this.bgImage = this.add.image(0, 0, 'bgImageWhite').setOrigin(0);;

    Background.repeatingDots({
      scene: this,
      gridOffset: 80,
      dotWidth: 2,
      dotColor: 0x7300ed,
      backgroundColor: 0xffffff,
    });


    // make a repeating set of rectangles around the artworld canvas
    const middleCoordinates = new Phaser.Math.Vector2(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0),
    );
    this.borderRectArray = [];

    for (let i = 0; i < 3; i++) {
      this.borderRectArray[i] = this.add.rectangle(0, 0, this.worldSize.x + (80 * i), this.worldSize.y + (80 * i));
      this.borderRectArray[i].setStrokeStyle(6 + (i * 2), 0x7300ed);

      this.borderRectArray[i].x = middleCoordinates.x;
      this.borderRectArray[i].y = middleCoordinates.y;
    }
  }

  handleEditMode() {
    //! needed for EDITMODE: dragging objects and getting info about them in console
    // this is needed of each scene EDITMODE is used


    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (ManageSession.gameEditMode) {
        gameObject.setPosition(dragX, dragY);

        if (gameObject.name === 'handle') {
          gameObject.data.get('vector').set(dragX, dragY); // get the vector data for curve handle objects
        }
      }
    }, this);

    this.input.on('dragend', (pointer, gameObject) => {
      if (ManageSession.gameEditMode) {
        const worldX = Math.round(CoordinatesTranslator.Phaser2DToArtworldX(this.worldSize.x, gameObject.x));
        const worldY = Math.round(CoordinatesTranslator.Phaser2DToArtworldY(this.worldSize.y, gameObject.y));
        // store the original scale when selecting the gameObject for the first time
        if (ManageSession.selectedGameObject !== gameObject) {
          ManageSession.selectedGameObject = gameObject;
          ManageSession.selectedGameObjectStartScale = gameObject.scale;
          ManageSession.selectedGameObjectStartPosition.x = gameObject.x;
          ManageSession.selectedGameObjectStartPosition.y = gameObject.y;
          dlog('editMode info startScale:', ManageSession.selectedGameObjectStartScale);
        }
        // ManageSession.selectedGameObject = gameObject

        dlog(
          'editMode info posX posY: ',
          worldX,
          worldY,
          'scale:',
          ManageSession.selectedGameObject.scale,
          'width*scale:',
          Math.round(ManageSession.selectedGameObject.width * ManageSession.selectedGameObject.scale),
          'height*scale:',
          Math.round(ManageSession.selectedGameObject.height * ManageSession.selectedGameObject.scale),
          'name:',
          ManageSession.selectedGameObject.name,
        );
      }
    }, this);
  }

  handlePlayerMovement() {
    //! DETECT dragging and mouseDown on rectangle
    Background.rectangle({
      scene: this,
      posX: 0,
      posY: 0,
      color: 0xffff00,
      alpha: 1,
      width: this.worldSize.x,
      height: this.worldSize.y,
      name: 'touchBackgroundCheck',
      setOrigin: 0,
    });

    this.touchBackgroundCheck
    // draggable to detect player drag movement
      .setInteractive({ draggable: true }) // { useHandCursor: true } { draggable: true }
      .on('pointerup', () => {
      })
      .on('pointerdown', () => {
        ManageSession.playerIsAllowedToMove = true;
      })
      .on('drag', (pointer, dragX, dragY) => {
        this.input.manager.canvas.style.cursor = "grabbing";
        // dlog('dragX, dragY', dragX, dragY);
        // console.log('dragX, dragY', dragX, dragY);
        // if we drag the touchBackgroundCheck layer, we update the player
        // eslint-disable-next-line no-lonely-if

        const moveCommand = 'moving';
        const movementData = { dragX, dragY, moveCommand };
        Move.moveByDragging(movementData);
        ManageSession.movingByDragging = true;
      })
      .on('dragend', () => {
        // check if player was moving by dragging
        // otherwise movingByTapping would get a stop animation command
        if (ManageSession.movingByDragging) {
          this.input.manager.canvas.style.cursor = "default";
          const moveCommand = 'stop';
          const dragX = 0;
          const dragY = 0;
          const movementData = { dragX, dragY, moveCommand };
          Move.moveByDragging(movementData);
          ManageSession.movingByDragging = false;
          ManageSession.playerIsAllowedToMove = false;
        }
      });

    this.touchBackgroundCheck
      .setDepth(219)
      .setOrigin(0);
    this.touchBackgroundCheck.setVisible(false);

    // this is needed for an image or sprite to be interactive also when alpha = 0 (invisible)
    this.touchBackgroundCheck.input.alwaysEnabled = true;
    //! end DETECT dragging and mouseDown on rectangle

    //! DoubleClick for moveByTapping
    this.tapInput = this.rexGestures.add.tap({
      enable: true,
      // bounds: undefined,
      time: 250,
      tapInterval: 350,
      // threshold: 9,
      // tapOffset: 10,
      // taps: undefined,
      // minTaps: undefined,
      // maxTaps: undefined,
    })
      .on('tap', () => {
        // dlog('tap');
      }, this)
      .on('tappingstart', () => {
        // dlog('tapstart');
      })
      .on('tapping', (tap) => {
        // dlog('tapping', tap.tapsCount);
        if (tap.tapsCount === 2) {
          if (ManageSession.playerIsAllowedToMove) {
            Move.moveByTapping(this);
          }
        }
      });
    //! doubleClick for moveByTapping
  }

  update() {
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
  } // update
} // class
