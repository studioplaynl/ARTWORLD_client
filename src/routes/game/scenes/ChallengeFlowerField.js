import { get } from 'svelte/store';
import { push } from 'svelte-spa-router';
import ManageSession from '../ManageSession';

import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Background from '../class/Background';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import { PlayerHistory, PlayerPos, PlayerZoom } from '../playerState';
import { SCENE_INFO } from '../../../constants';
import { handlePlayerMovement } from '../helpers/InputHelper';
import ServerCall from '../class/ServerCall';
import { dlog } from '../../../helpers/debugLog';

import * as Phaser from 'phaser';


export default class ChallengeFlowerField extends Phaser.Scene {
  constructor() {
    super('ChallengeFlowerField');

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
  }

  async preload() {
    /** subscription to the loaderror event
    * strangely: if the more times the subscription is called, the more times the event is fired
    * so we subscribe here only once in the scene
    * so we don't have to remember to subribe to it when we download something that needs error handling
    */
    this.load.on('loaderror', (offendingFile) => {
      dlog('loaderror', offendingFile);
      if (typeof offendingFile !== 'undefined') {
        ServerCall.resolveLoadError(offendingFile);
      }
    });
  }

  async create() {
    //!
    // show physics debug boundaries in gameEditMode
    if (ManageSession.gameEditMode) {
      this.physics.world.drawDebug = true;
    } else {
      this.physics.world.drawDebug = false;
      this.physics.world.debugGraphic.clear();
    }

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

    Background.standardWithDots(this);

    handlePlayerMovement(this);

    this.everythingFlowerFlied();
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
    this.makeNewFlowerButton();
    this.reloadButton();
  }// end create

  makeNewFlowerButton() {
    // add the plussign button to the scene
    const plusSign = this.add.image(this.worldSize.x / 2, 250, 'plusSign').setDepth(200);
    plusSign.setInteractive();
    plusSign.on('pointerup', () => {
      console.log('plusSign clicked');
      /* Make a new artwork */
      // open the relevant app
      const value = '/flowerchallenge';
      push(value);
      PlayerHistory.push(value);
    });
  }

  reloadButton() {
    const reloadButton = this.add.image((this.worldSize.x / 2) - 300, 250, 'reloadSign').setDepth(200);
    reloadButton.setInteractive();
    reloadButton.on('pointerup', () => {
      console.log('reloadButton clicked');
      // reload the flower field to show new flowers
      this.scene.restart();
    });
  }

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

    this.flowerKeyArray = ['flower'];
    this.flowerArray = [];
    this.flowerTweenArray = [];
    this.flowerObject = null;
    this.flowerTween = null;
    this.flowerScale = null;
    this.flowerRotateAmount = null;
    this.flowerTweenTime = null;
    this.flowerFliedStartMaking = true;

    this.makeFlowerFlied();

    this.load.on('complete', () => {
      dlog('complete');
      this.flowerFliedStartMaking = true;
    });
    this.flowerKeyArray = ['flower'];
    // download all drawings "bloem" from allUsersChallenge

    // this.getListOfBloem();
    const type = 'bloem';
    const userId = '';
    const serverObjectsHandler = this.flowerKeyArray;
    const artSize = 512;

    ServerCall.downloadAndPlaceArtByType({
      type, userId, serverObjectsHandler, artSize,
    });
  }

  makeFlowerRow(flowerRowY) {
    // get a new flower key from the array, randomly
    let flowerKey = this.flowerKeyArray[Phaser.Math.Between(0, this.flowerKeyArray.length - 1)];

    // dlog("flowerRowY", flowerRowY)
    for (let i = 0; i < this.amountOfFlowers; i++) {
      this.flowerScale = Phaser.Math.FloatBetween(
        this.flowerScaleFactor - (this.flowerScaleFactor / 12),
        this.flowerScaleFactor + (this.flowerScaleFactor / 12),
      );
      // scale around 0.5 (0.4 - 0.6)
      // get a new flower key from the array, randomly
      flowerKey = this.flowerKeyArray[Phaser.Math.Between(0, this.flowerKeyArray.length - 1)];
      // dlog("flowerKey", flowerKey)
      const flowerY = Phaser.Math.Between(flowerRowY - 35, flowerRowY + 35);
      // dlog("flowerY", flowerY)
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
    if (!this.flowerFliedStartMaking) {
      return;
    }
    this.flowerFliedMaking++;
    this.flowerFliedStartMaking = false;
    dlog('makeFlowerFlied this.flowerKeyArray');

    // first remove the tween, after destoy the old flower gameobjects
    this.flowerTweenArray.forEach((element) => {
      element.stop();
      element.remove();
    });
    this.flowerTweenArray.length = 0;

    this.flowerArray.forEach((element) => {
      element.destroy();
    });
    this.flowerArray.length = 0;

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
      this.makeFlowerFlied();
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
