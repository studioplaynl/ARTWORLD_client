import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import {
  convertImage, listAllObjects,
} from '../../../api';

import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Preloader from '../class/Preloader';
import Background from '../class/Background';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
import SceneSwitcher from '../class/SceneSwitcher';
import { PlayerPos, PlayerZoom } from '../playerState';
import { SCENE_INFO } from '../../../constants';
import { handlePlayerMovement } from '../helpers/InputHelper';

const { Phaser } = window;

export default class ChallengeFlowerField extends Phaser.Scene {
  constructor() {
    super('ChallengeFlowerField');

    this.location = 'ChallengeFlowerField';
    this.worldSize = new Phaser.Math.Vector2(0, 0);

    this.debug = false;

    this.phaser = this;

    this.newOnlinePlayers = [];

    this.avatarName = [];
    this.tempAvatarName = '';
    this.loadedAvatars = [];

    this.player = {};
    this.playerShadow = {};
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.playerAvatarKey = '';

    this.artDisplaySize = 64;
    this.artArray = [];

    // testing
    this.resolveLoadErrorCache = [];

    // shadow
    this.playerShadowOffset = -8;

    // size for the artWorks
    this.artPreviewSize = 128;

    this.artUrl = [];
    this.userArtServerList = [];
    this.progress = [];
  }

  async preload() {
    Preloader.Loading(this); // .... PRELOADER VISUALISER
  }

  async create() {
    //!
    // get scene size from SCENE_INFO constants
    // copy worldSize over to ManageSession, so that positionTranslation can be done there
    const sceneInfo = SCENE_INFO.find((obj) => obj.scene === this.scene.key);
    this.worldSize.x = sceneInfo.sizeX;
    this.worldSize.y = sceneInfo.sizeY;
    ManageSession.worldSize = this.worldSize;
    //!

    const {
      artworldToPhaser2DX, artworldToPhaser2DY,
    } = CoordinatesTranslator;

    // collection: "home"
    // create_time: "2022-01-19T16:31:43Z"
    // key: "Amsterdam"
    // permission_read: 2
    // permission_write: 1
    // update_time: "2022-01-19T16:32:27Z"
    // user_id: "4c0003f0-3e3f-4b49-8aad-10db98f2d3dc"
    // value:
    // url: "home/4c0003f0-3e3f-4b49-8aad-10db98f2d3dc/3_current.png"
    // username: "user88"
    // version: "0579e989a16f3e228a10d49d13dc3da6"

    // the order of creation is the order of drawing: first = bottom ...............................

    Background.standardWithDots(this);

    handlePlayerMovement(this);

    this.everythingFlowerFlied();

    // about drag an drop multiple  objects efficiently https://www.youtube.com/watch?v=t56DvozbZX4&ab_channel=WClarkson
    // End Background .........................................................................................

    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with artworldCoordinates
    this.player = new PlayerDefault(
      this,
      artworldToPhaser2DX(this.worldSize.x, get(PlayerPos).x),
      artworldToPhaser2DY(this.worldSize.y, get(PlayerPos).y),
      ManageSession.playerAvatarPlaceholder,
    ).setDepth(201);

    this.playerShadow = new PlayerDefaultShadow(
      {
        scene: this,
        texture: ManageSession.playerAvatarPlaceholder,
      },
    ).setDepth(200);
    // for back button, has to be done after player is created for the history tracking!
    SceneSwitcher.pushLocation(this);

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);

    PlayerZoom.subscribe((zoom) => {
      this.gameCam.zoom = zoom;
    });

    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
    // ......... end PLAYER VS WORLD .......................................................................

    //!
    Player.loadPlayerAvatar(this);
    //!
  }// end create

  everythingFlowerFlied() {
  // make background for flowers
    this.backgroundFlowerFieldFloor = this.add.graphics();
    this.backgroundFlowerFieldFloor.name = 'this.backgroundFlowerFieldFloor';
    // this.backgroundFlowerFieldFloor.fillGradientStyle(0xffff00, 0xffff00, 0x704d15, 0x704d15, 1)
    this.backgroundFlowerFieldFloor.fillGradientStyle(
      0x704d15,
      0x704d15,
      0x5c370c,
      0x5c370c,
      1,
    ).fillRect(
      0,
      this.worldSize.y / 3,
      this.worldSize.x,
      this.worldSize.y - (this.worldSize.y / 3),
    ).setVisible(false);

    // make sky for flowers
    this.backgroundFlowerFieldSky = this.add.graphics();
    // this.backgroundFlowerFieldSky.fillGradientStyle(0x3c93b5, 0x488fab, 0xd7f9fc, 0xa4eef5, 1)
    this.backgroundFlowerFieldSky.fillGradientStyle(0x083457, 0x083457, 0x0e4e80, 0x0e4e80, 1);
    this.backgroundFlowerFieldSky.fillRect(0, 0, this.worldSize.x, this.worldSize.y / 3);
    this.backgroundFlowerFieldSky.setVisible(false);

    this.fliedFloorSky = this.add.circle(
      40,
      40,
      20,
      0xff0000,
    )
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(500);
    this.fliedFloorSky.on('pointerup', () => {
      // toggle the visibility of this.backgroundFlowerFieldFloor
      this.backgroundFlowerFieldSky.setVisible(!this.backgroundFlowerFieldSky.visible);
    });

    this.fliefFloorButton = this.add.circle(
      40,
      40 + 20 + 20 + 5,
      20,
      0xff0000,
    )
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(500);
    this.fliefFloorButton.on('pointerup', () => {
      // toggle the visibility of this.backgroundFlowerFieldFloor
      this.backgroundFlowerFieldFloor.setVisible(!this.backgroundFlowerFieldFloor.visible);
    });

    this.flowerScaleFactor = 0.4;
    this.flowerSize = 512;
    // draw 10 layers, biggest 512 pix ,smallest 52pix
    // we begin at the bottom so worldY
    this.flowerAmountOfOverlapX = 0.5;
    this.flowerAmountOfOverlapY = 0.8;
    this.amountOfFlowers = Math.ceil(this.worldSize.x / (this.flowerSize * this.flowerAmountOfOverlapX));
    this.flowerKeyArray = ['flower'];
    this.flowerArray = [];
    this.flowerTweenArray = [];
    this.flowerObject = null;
    this.flowerTween = null;
    this.flowerScale = null;
    this.flowerRotateAmount = null;
    this.flowerTweenTime = null;
    this.flowerFliedStartedMaking = false;

    this.makeFlowerFlied();

    this.flowerKeyArray = ['flower'];
    // download all drawings "bloem" from allUsersChallenge

    this.getListOfBloem();
  }

  async getListOfBloem() {
    await listAllObjects('drawing', null).then((rec) => {
      // download all the drawings and then filter for "bloem"
      this.userArtServerList = rec.filter((obj) => obj.permission_read === 2);
      // console.log("this.userArtServerList", this.userArtServerList)
      this.userArtServerList = this.userArtServerList.filter((obj) => obj.value.displayname === 'bloem');

      if (this.userArtServerList.length > 0) {
        this.userArtServerList.forEach((element, index, array) => {
          this.downloadFlowers(element, index, array);
        });
      }
    });
  }

  makeFlowerRow(flowerRowY) {
    let flowerKey = this.flowerKeyArray[Phaser.Math.Between(0, this.flowerKeyArray.length - 1)];

    // console.log("flowerRowY", flowerRowY)
    for (let i = 0; i < this.amountOfFlowers; i++) {
      this.flowerScale = Phaser.Math.FloatBetween(
        this.flowerScaleFactor - (this.flowerScaleFactor / 12),
        this.flowerScaleFactor + (this.flowerScaleFactor / 12),
      );
      // scale around 0.5 (0.4 - 0.6)
      // get a new flower key from the array, randomly
      flowerKey = this.flowerKeyArray[Phaser.Math.Between(0, this.flowerKeyArray.length - 1)];
      // console.log("flowerKey", flowerKey)
      const flowerY = Phaser.Math.Between(flowerRowY - 35, flowerRowY + 35);
      // console.log("flowerY", flowerY)
      this.flowerObject = this.add.image(
        i * (this.flowerSize * this.flowerAmountOfOverlapX),
        flowerY,

        flowerKey,
      ).setScale(this.flowerScale).setOrigin(0.5, 1);
      this.flowerRotateAmount = Phaser.Math.Between(8, 18);
      this.flowerTweenTime = Phaser.Math.Between(1000, 1100);
      this.flowerTween = this.tweens.add({
        targets: this.flowerObject,
        angle: this.flowerRotateAmount,
        duration: this.flowerTweenTime,
        ease: 'Sine.easeOut',
        paused: false,
        yoyo: true,
        repeat: -1,
      });
      this.flowerArray.push(this.flowerObject);
      this.flowerTweenArray.push(this.flowerTween);
    }
  }

  makeFlowerFlied() {
    // console.log("this.flowerFliedStartedMaking", this.flowerFliedStartedMaking)

    if (this.flowerFliedStartedMaking) {
      return;
    }

    if (!this.flowerFliedStartedMaking) {
      this.flowerFliedStartedMaking = true;
      // empty the array; start with empty field
      // if (this.flowerArray.length > 0) {
      // first remove the tween, after destoy the old flower gameobject
      this.flowerTweenArray.forEach((element) => {
        element.stop();
        element.remove();
      });
      this.flowerTweenArray.length = 0;

      this.flowerArray.forEach((element) => {
        element.destroy();
      });
      this.flowerArray.length = 0;

      // console.log("this.flowerArray.length", this.flowerArray.length)
      // console.log("this.flowerTweenArray.length", this.flowerTweenArray.length)

      // console.log("makeFlowerFlied this.flowerArray, this.flowerTweenArray", this.flowerArray, this.flowerTweenArray)

      this.flowerAmountOfOverlapX = 0.2;
      this.flowerAmountOfOverlapY = 0.6;
      let flowerRowY = this.worldSize.y / 3;

      this.flowerScaleFactor = 0.1;
      this.flowerSize = 512 * this.flowerScaleFactor;

      this.amountOfFlowers = Math.ceil(this.worldSize.x / (this.flowerSize * this.flowerAmountOfOverlapX));
      this.makeFlowerRow(flowerRowY);

      this.flowerScaleFactor = 0.2;
      this.flowerSize = 512 * this.flowerScaleFactor;
      flowerRowY += this.flowerSize;
      this.amountOfFlowers = Math.ceil(this.worldSize.x / (this.flowerSize * this.flowerAmountOfOverlapX));
      this.makeFlowerRow(flowerRowY);

      this.flowerScaleFactor = 0.3;
      this.flowerSize = 512 * this.flowerScaleFactor;
      flowerRowY += this.flowerSize;
      this.amountOfFlowers = Math.ceil(this.worldSize.x / (this.flowerSize * this.flowerAmountOfOverlapX));
      this.makeFlowerRow(flowerRowY);

      this.flowerScaleFactor = 0.5;
      this.flowerSize = 512 * this.flowerScaleFactor;
      flowerRowY += this.flowerSize;
      this.amountOfFlowers = Math.ceil(this.worldSize.x / (this.flowerSize * this.flowerAmountOfOverlapX));
      this.makeFlowerRow(flowerRowY);

      this.flowerScaleFactor = 0.7;
      this.flowerSize = 512 * this.flowerScaleFactor;
      flowerRowY += this.flowerSize;
      this.amountOfFlowers = Math.ceil(this.worldSize.x / (this.flowerSize * this.flowerAmountOfOverlapX));
      this.makeFlowerRow(flowerRowY);

      this.flowerScaleFactor = 1;
      this.flowerSize = 512 * this.flowerScaleFactor;
      flowerRowY += this.flowerSize;
      this.amountOfFlowers = Math.ceil(this.worldSize.x / (this.flowerSize * this.flowerAmountOfOverlapX));
      this.makeFlowerRow(flowerRowY);

      this.flowerFliedStartedMaking = false;
      // console.log("this.flowerArray.length", this.flowerArray.length)
      // console.log("this.flowerTweenArray.length", this.flowerTweenArray.length)
    }
  }

  async downloadFlowers(element) {
    const imageKeyUrl = element.value.url;
    const imgSize = '512'; // download as 512pixels
    const fileFormat = 'png';

    if (this.textures.exists(imageKeyUrl)) { // if the image has already downloaded, then add image by using the key
      // adds the image to the container if it is not yet in the list
      const exists = this.flowerKeyArray.some((element2) => element2 === imageKeyUrl);
      if (!exists) {
        this.flowerKeyArray.push(imageKeyUrl);
      }
    } else { // otherwise download the image and add it
      const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);

      // for tracking each file in progress
      this.progress.push({ imageKeyUrl });
      // console.log("convertedImage", convertedImage)
      this.load.image(imageKeyUrl, convertedImage);

      this.load.start(); // start the load queue to get the image in memory
    }

    this.load.on('filecomplete', (key) => {
      // on completion of each speci512fic artwork
      const currentImage = this.progress.find((element3) => element3.imageKeyUrl === key);

      // we don't want to trigger any other load completions
      if (currentImage) {
        // adds the image to the container if it is not yet in the list
        const exists = this.flowerKeyArray.some((element4) => element4 === imageKeyUrl);
        if (!exists) {
          this.flowerKeyArray.push(imageKeyUrl);
        }
      }
    });

    this.load.on('complete', () => {
      // finished downloading
      // replace flowers in the field
      // console.log("this.flowerKeyArray", this.flowerKeyArray)
      //
      this.makeFlowerFlied();
    });
  }// end downloadArt

  generateLocations() {
    // we set draggable on restart scene with a global flag

    let locationVector = new Phaser.Math.Vector2(-1215, -589);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    //  if ( this.location1 != null ) this.location1.destroy()

    this.location1 = new GenerateLocation({
      scene: this,
      type: 'isoBox',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'Location1',
      locationImage: 'museum',
      enterButtonImage: 'enter_button',
      locationText: 'Location 1',
      referenceName: 'Location1',
      fontColor: 0x8dcb0e,
      color1: 0xffe31f,
      color2: 0xf2a022,
      color3: 0xf8d80b,
    });

    //* set the particle first on 0,0 so they are below the mario_star
    //* later move them relative to the mario_star
    const particles = this.add.particles('music_quarter_note').setDepth(139);

    const musicEmitter = particles.createEmitter({
      x: 0,
      y: 0,
      lifespan: { min: 2000, max: 8000 },
      speed: { min: 80, max: 120 },
      angle: { min: 270, max: 360 },
      gravityY: -50,
      gravityX: 50,
      scale: { start: 1, end: 0 },
      quantity: 1,
      frequency: 1600,
    });

    locationVector = new Phaser.Math.Vector2(-792, -1138);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.mario_star = new GenerateLocation({
      scene: this,
      type: 'image',
      size: 200,
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      internalUrl: 'mariosound',
      locationImage: 'mario_star',
      enterButtonImage: 'enter_button',
      locationText: 'Mario Sound',
      referenceName: 'MarioSound',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.mario_star.setDepth(140);

    musicEmitter.setPosition(this.mario_star.x + 15, this.mario_star.y - 20);

    locationVector = new Phaser.Math.Vector2(-2125, 1017);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    // this.pencil = this.add.image(locationVector.x, locationVector.y, "pencil")
    // this.pencil.rotation = 0.12
    // this.pencil.setInteractive()
    // this.pencil.on('pointerup', () => CurrentApp.set("drawing"))

    this.pencil = new GenerateLocation({
      scene: this,
      type: 'image',

      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      appUrl: 'drawing',
      locationImage: 'pencil',
      enterButtonImage: 'enter_button',
      locationText: 'drawingApp',
      referenceName: 'drawingApp',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.pencil.rotation = 0.12;

    locationVector = new Phaser.Math.Vector2(-1555, 809);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.animalGardenChallenge = new GenerateLocation({
      scene: this,
      type: 'image',

      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'AnimalGardenChallenge',
      locationImage: 'dinoA',
      enterButtonImage: 'enter_button',
      locationText: 'animal Garden',
      referenceName: 'animalGardenChallenge',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
  }

  update() {
    // don't move the player with clicking and swiping in edit mode
    if (!ManageSession.gameEditMode) {
      // ...... ONLINE PLAYERS ................................................
      Player.parseNewOnlinePlayerArray(this);
      // ........... PLAYER SHADOW .............................................................................
      // the shadow follows the player with an offset
      this.playerShadow.x = this.player.x + this.playerShadowOffset;
      this.playerShadow.y = this.player.y + this.playerShadowOffset;
      // ........... end PLAYER SHADOW .........................................................................
    } else {
      // when in edit mode
      // this.updateCurveGraphics()
    }
  } // update

  updateCurveGraphics() {
    this.curveGraphics.clear();
    this.curveGraphics.lineStyle(60, 0xffff00, 1);
    this.curve.draw(this.curveGraphics, 64);
  }
} // class
