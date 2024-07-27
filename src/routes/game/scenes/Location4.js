import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import { PlayerPos } from '../playerState';
import CoordinatesTranslator from '../class/CoordinatesTranslator';

import { SCENE_INFO, ART_DISPLAY_SIZE, ART_OFFSET_BETWEEN } from '../../../constants';
import { handleEditMode, handlePlayerMovement } from '../helpers/InputHelper';
import { dlog } from '../../../helpers/debugLog';
import ServerCall from '../class/ServerCall';
import { getSceneInfo } from '../helpers/UrlHelpers';

import * as Phaser from 'phaser';

export default class Location4 extends Phaser.Scene {
  constructor() {
    super('Location4');

    this.worldSize = new Phaser.Math.Vector2(3000, 3000);

    this.debug = false;

    this.phaser = this;

    this.avatarName = [];
    this.tempAvatarName = '';
    this.loadedAvatars = [];

    this.player = null;
    this.playerShadow = null;

    this.playerAvatarKey = '';
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';

    // shadow
    this.playerShadowOffset = -8;

    this.currentZoom = 1;
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

    // ....... IMAGES ......................................................................
    // exhibition
    this.load.image('exhibit1', './assets/art_styles/drawing_painting/699f77a8e723a41f0cfbec5434e7ac5c.jpg');
    // this.load.image("exhibit1", "./assets/art_styles/people/04b49a9aa5f7ada5d8d96deba709c9d4.jpg")
    this.load.image('exhibit2', './assets/art_styles/repetition/4c15d943b5b4993b42917fbfb5996c1f.jpg');
    this.load.image('exhibit3', './assets/art_styles/repetition/dd5315e5a77ff9601259325341a0bca9.jpg');
    this.load.image('exhibit4', './assets/art_styles/people/28bc857da206c33c5f97bfbcf40e9970.jpg');

    this.load.image('ground', 'assets/platform.png');
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
    const sceneInfo = getSceneInfo(SCENE_INFO, this.scene.key);

    this.worldSize.x = sceneInfo.sizeX;
    this.worldSize.y = sceneInfo.sizeY;
    ManageSession.worldSize = this.worldSize;
    //!
    const { artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;

    this.generateBackground();

    handleEditMode(this);

    handlePlayerMovement(this);

    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with Default -1185, 692 artworldCoordinates
    this.player = new PlayerDefault(
      this,
      artworldToPhaser2DX(this.worldSize.x, get(PlayerPos).x),
      artworldToPhaser2DY(this.worldSize.y, get(PlayerPos).y)
    ).setDepth(201);

    this.playerShadow = new PlayerDefaultShadow({
      scene: this,
      texture: ManageSession.playerAvatarPlaceholder,
    }).setDepth(200);

    Player.loadPlayerAvatar(this, 0, 0);
    // .......  end PLAYER ................................................................................

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);

    // UI scene is subscribed to zoom changes and passes it on to the current scene via ManageSession.currentScene
    this.gameCam.zoom = ManageSession.currentZoom;

    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);

    // ......... end PLAYER VS WORLD .......................................................................

    // this.generateLocations()
    this.add.image(200, 200, 'exhibit1').setOrigin(0).setScale(0.53);
    this.add.image(600, 200, 'exhibit2').setOrigin(0).setScale(0.45);
    this.add.image(1000, 200, 'exhibit3').setOrigin(0).setScale(0.55);
    this.add.image(1400, 200, 'exhibit4').setOrigin(0).setScale(0.6);

    const platforms = this.physics.add.staticGroup();

    platforms.create(1300, 1300, 'ground').setScale(2).refreshBody();
    platforms.create(300, 1300, 'ground').setScale(2).refreshBody();

    this.physics.add.collider(this.player, platforms);
    // this.generateBouncingBird()

    this.loadAndPlaceLiked();
    this.likedBalloonAnimation();
    // .......... end likes ............................................................................

    Player.loadPlayerAvatar(this);
  } // end create

  likedBalloonAnimation() {
    this.balloonContainer = this.add.container(0, 0);

    this.likedBalloon = this.add.image(0, 0, 'likedBalloon');
    this.likedBalloon.name = 'likedBalloon';

    // CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 4000),
    //   CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 400),

    this.balloonContainer.add(this.likedBalloon);

    this.balloonContainer.setPosition(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, this.worldSize.x / 1.5),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1200)
    );
    this.balloonContainer.setDepth(602);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.likedBalloon.setInteractive({ draggable: true });
    } else {
      // when not in edit mode add animation tween
      this.likedTween = this.tweens.add({
        targets: this.balloonContainer,
        duration: 90000,
        x: '-=8000',
        yoyo: false,
        repeat: -1,
        repeatDelay: 300,
        // ease: 'Sine.easeInOut',
        onRepeat() {
          // Your callback logic here
          ServerCall.replaceLikedsInBalloonContainer();
        },
      });
    }
  }

  async loadAndPlaceLiked() {
    //are accessed in Servercall.repositionContainers
    this.artDisplaySize = ART_DISPLAY_SIZE;
    this.artMargin = ART_OFFSET_BETWEEN;

    const type = 'downloadLikedDrawing';
    const serverObjectsHandler = ManageSession.likedStore;
    const userId = '';
    // dlog('this.location', location);
    const artSize = 256;
    const artMargin = artSize / 10;
    this.artMargin = artMargin;

    ServerCall.downloadAndPlaceArtByType({
      type,
      userId,
      serverObjectsHandler,
      artSize,
      artMargin,
    });
  }

  generateBackground() {
    // fill in textures
    this.add.rectangle(0, 0, 6000, 6000, 0xffffff);

    const cross = ['.....', '..1..', '.111.', '..1..', '.....'];

    // generate the texture from the array
    this.textures.generate('cross', { data: cross, pixelWidth: 3 });

    // display the texture on an image
    const gridWidth = 4000;
    const offset = 50;

    for (let i = 0; i < gridWidth; i += offset) {
      for (let j = 0; j < gridWidth; j += offset) {
        this.add.image(i, j, 'cross').setOrigin(0, 1);
      }
    }
  }

  update() {
    // ...... ONLINE PLAYERS ................................................
    // Player.parseNewOnlinePlayerArray(this)
    // .......................................................................

    // ........... PLAYER SHADOW .............................................................................
    // the shadow follows the player with an offset
    this.playerShadow.x = this.player.x + this.playerShadowOffset;
    this.playerShadow.y = this.player.y + this.playerShadowOffset;
    // ........... end PLAYER SHADOW .........................................................................
  } // update
} // class
