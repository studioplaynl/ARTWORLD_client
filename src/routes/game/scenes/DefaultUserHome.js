/**
 * @file DefaultUserHome
 * @author Maarten
 *
 *  What is this file for?
 *  ======================
 *  This is a scene that acts as a template for a players home
 *  The differentiater is the user ID, this is parced in init(data) and passed on by SceneSwitcher
 *
 *  In general it works like this:
 *  - We start a loading animation that ends when all art works have been loaded
 *      (phaser fires a this.scene.load.on('complete') when the loading queue finished)
 *  - We get the scene (house) size from the SCENE_INFO
 *  - We create:
 *      - a background
 *      - player movement handler
 *      - a player with a default avatar
 *      - game camera
 *      - player zoom level
 *      - physics bounds
 *      - load players personal Avatar
 *      - set a special position of the player
 *      - load and place artworks of the home owner
 */

// import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Background from '../class/Background';
// import { PlayerPos, PlayerZoom } from '../playerState';
import { PlayerZoom } from '../playerState';

import { SCENE_INFO } from '../../../constants';
import { handlePlayerMovement } from '../helpers/InputHelper';
import ServerCall from '../class/ServerCall';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../../../helpers/debugLog';
import Preloader from '../class/Preloader';
// import CoordinatesTranslator from '../class/CoordinatesTranslator';

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

    this.userStopmotionServerList = {};
    this.userDrawingServerList = {};
    this.drawingGroup = null;
    this.stopmotionGroup = null;

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
    this.artMargin = 10;

    this.artOffsetBetween = 20;

    this.location = '';

    // shadow
    this.playerShadowOffset = -8;
  }

  init(data) {
    this.location = data.user_id;
  }

  async preload() {
    Preloader.Loading(this); // .... PRELOADER VISUALISER
  }// end preload

  // async preload() {
  // }// end preload

  async create() {
    //!
    // get scene size from SCENE_INFO constants
    // copy worldSize over to ManageSession, so that positionTranslation can be done there
    const sceneInfo = SCENE_INFO.find((obj) => obj.scene === this.scene.key);
    this.worldSize.x = sceneInfo.sizeX;
    this.worldSize.y = sceneInfo.sizeY;
    ManageSession.worldSize = this.worldSize;
    //!

    Background.standardWithDots(this);

    handlePlayerMovement(this);

    // const {
    //   artworldToPhaser2DX, artworldToPhaser2DY,
    // } = CoordinatesTranslator;

    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with Default 0 ,0 artworldCoordinates
    // this.player = new PlayerDefault(
    //   this,
    //   artworldToPhaser2DX(this.worldSize.x, get(PlayerPos).x),
    //   artworldToPhaser2DY(this.worldSize.y, get(PlayerPos).y),
    //   ManageSession.playerAvatarPlaceholder,
    // ).setDepth(201);
    this.player = new PlayerDefault(
      this,
      null,
      null,
    ).setDepth(201);

    this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: ManageSession.playerAvatarPlaceholder })
      .setDepth(200);
    // .......  end PLAYER ................................................................................

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);

    PlayerZoom.subscribe((zoom) => {
      this.gameCam.zoom = zoom;
    });

    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // ......... end PLAYER VS WORLD .......................................................................

    // // Place the player on the left size in the y-middle, by passing on arguments in the Player class
    // const PosX = -(this.worldSize.x / 2) + (ManageSession.avatarSize * 2);
    // dlog('PosX: ', PosX);
    // const PosY = -(this.worldSize.y / 4);
    // Player.loadPlayerAvatar(this, PosX, PosY);

    // Player.loadPlayerAvatar(this, -(this.worldSize.x / 2) + (ManageSession.avatarSize * 2), -(this.worldSize.y / 4));
    Player.loadPlayerAvatar(this);

    await this.loadAndPlaceArtworks();

    // // Set the player on the left side of the world (this also updates the URL automatically), in artworldCoordinates
    // PlayerUpdate.set({ reactive: false });
    // PlayerPos.set({
    //   x: -(this.worldSize.x / 2) + (ManageSession.avatarSize * 2),
    //   y: -(this.worldSize.y / 4),
    // });
  }// end create

  async loadAndPlaceArtworks() {
    let type = 'drawing';
    let serverItemsArray = this.userDrawingServerList;
    const { location } = this;
    // dlog('this.location', location);
    const artSize = this.artDisplaySize;
    const artMargin = artSize / 10;
    this.artMargin = artMargin;
    this.drawingGroup = this.add.group();
    ServerCall.downloadAndPlaceArtworksByType(type, location, serverItemsArray, artSize, artMargin);

    type = 'stopmotion';
    // this.userStopmotionServerList = [];
    serverItemsArray = this.userStopmotionServerList;
    this.stopmotionGroup = this.add.group();
    ServerCall.downloadAndPlaceArtworksByType(type, location, serverItemsArray, artSize, artMargin);
  }

  update() {
    // ........... PLAYER SHADOW .............................................................................
    // the shadow follows the player with an offset
    this.playerShadow.x = this.player.x + this.playerShadowOffset;
    this.playerShadow.y = this.player.y + this.playerShadowOffset;
    // ........... end PLAYER SHADOW .........................................................................
  } // update
} // class
