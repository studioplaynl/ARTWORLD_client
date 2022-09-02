import ManageSession from '../ManageSession';
import { convertImage } from '../../../api';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Preloader from '../class/Preloader';
import Background from '../class/Background';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import SceneSwitcher from '../class/SceneSwitcher';
import ArtworkList from '../class/ArtworkList';
import { playerPos } from '../playerState';
import { SCENE_INFO } from '../../../constants';
import { handlePlayerMovement } from '../helpers/InputHelper';
import ServerCall from '../class/ServerCall';
import { dlog } from '../helpers/DebugLog';

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

    // UI scene
    this.currentZoom = 1;
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
    const sceneInfo = SCENE_INFO.find((obj) => obj.scene === this.scene.key);
    this.worldSize.x = sceneInfo.sizeX;
    this.worldSize.y = sceneInfo.sizeY;
    ManageSession.worldSize = this.worldSize;
    //!

    Background.standardWithDots(this);

    handlePlayerMovement(this);

    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with Default 0 ,0 artworldCoordinates
    this.player = new PlayerDefault(this, 0, 0, ManageSession.playerAvatarPlaceholder).setDepth(201);
    this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: ManageSession.playerAvatarPlaceholder })
      .setDepth(200);
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

    this.artworksListSpinner.destroy();
    //! this.artworksListSpinner.start();
    //

    Player.loadPlayerAvatar(this, 0, 0);

    // Set the player on the left side of the world (this also updates the URL automatically)
    playerPos.set({
      x: -(this.worldSize.x / 2) + (ManageSession.avatarSize * 2),
      y: 0,
    });

    let type = 'drawing';
    let serverItemsArray = this.userDrawingServerList;
    const { location } = this;
    dlog('this.location', location);
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
  }// end create

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
