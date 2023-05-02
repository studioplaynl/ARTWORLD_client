import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Background from '../class/Background';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
import ServerCall from '../class/ServerCall';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../helpers/DebugLog';
import { PlayerPos, PlayerZoom } from '../playerState';
import { SCENE_INFO } from '../../../constants';
import { handleEditMode, handlePlayerMovement } from '../helpers/InputHelper';
import PlaceElement from '../class/PlaceElement';

const { Phaser } = window;

export default class MoonWorld extends Phaser.Scene {
  constructor() {
    super('MoonWorld');

    this.worldSize = new Phaser.Math.Vector2(0, 0);

    this.debug = false;

    this.phaser = this;

    this.player = {};
    this.playerShadow = {};
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.playerAvatarKey = '';

    // testing
    this.resolveLoadErrorCache = [];

    this.homes = [];
    this.homesRepreseneted = [];

    // shadow
    this.playerShadowOffset = -8;
  }

  async preload() {
    ManageSession.currentScene = this.scene; // getting a central scene context
    // Preloader.Loading(this); // .... PRELOADER VISUALISER
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

    handleEditMode(this);

    Background.gradientStretchedToFitWorld({
      scene: this,
      tileMapName: 'WorldBackgroundTileMap',
      gradientColor1: 0x9de0ff,
      gradientColor2: 0x1999c5,
      tileWidth: 512,
    });
    handlePlayerMovement(this);

    const {
      artworldToPhaser2DX, artworldToPhaser2DY,
    } = CoordinatesTranslator;

    // this.makeWorldElements();

    // .......  PLAYER ..........................................JA even ..........................................
    //* create default player and playerShadow
    //* create player in center with artworldCoordinates
    this.player = new PlayerDefault(
      this,
      artworldToPhaser2DX(this.worldSize.x, get(PlayerPos).x),
      artworldToPhaser2DY(this.worldSize.y, get(PlayerPos).y),
      ManageSession.playerAvatarPlaceholder,
    ).setDepth(201);

    this.playerShadow = new PlayerDefaultShadow({
      scene: this,
      texture: ManageSession.playerAvatarPlaceholder,
    }).setDepth(200);

    // for back button, has to be done after player is created for the history tracking!
    // SceneSwitcher.pushLocation(this);

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);


    PlayerZoom.subscribe((zoom) => {
      this.gameCam.zoom = zoom;
    });

    this.gameCam.startFollow(this.player);
    // ......... end PLAYER VS WORLD .......................................................................

    ServerCall.getHomesFiltered(this.scene.key, this);

    // create accessable locations
    this.makeWorldElements();
    this.generateLocations();
    // .......... end locations ............................................................................

    Player.loadPlayerAvatar(this);
  } // end create

  generateLocations() {
    // we set draggable on restart scene with a global flag

    let locationVector = new Phaser.Math.Vector2(945, -382);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.purpleCircleLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'Artworld',
      locationImage: 'artWorldPortalCloud',
      enterButtonImage: 'enter_button',
      locationText: 'Paarse Cirkel Wereld',
      referenceName: 'this.purpleCircleLocation',
      size: 500,
      fontColor: 0x8dcb0e,
    });
  }

  makeWorldElements() {
    // .........cloud_ballonpeople_1b............................................................
    PlaceElement.image({
      x: -366,
      y: 1597,
      file: 'cloud_ballonpeople_1b',
      scale: 1,
      scene: this,
    });

    // .........cloud_ballonpeople_2............................................................
    PlaceElement.image({
      x: 1160,
      y: 2183,
      file: 'cloud_ballonpeople_2',
      scale: 1,
      scene: this,
    });

    // .........cloud_ballonpeople_3............................................................
    PlaceElement.image({
      x: -1310,
      y: -220,
      file: 'cloud_ballonpeople_3',
      scale: 1,
      scene: this,
    });

    // .........cloud_ballonpeople_4............................................................
    PlaceElement.image({
      x: -2324,
      y: 2433,
      file: 'cloud_ballonpeople_4',
      scale: 1,
      scene: this,
    });

    // .........cloud_berg2_metCloud_achtergrond............................................................
    PlaceElement.image({
      x: 2170,
      y: -1600,
      file: 'cloud_berg2_metCloud_achtergrond',
      scale: 2.03,
      scene: this,
    });

    // .........cloud_berg3............................................................
    PlaceElement.image({
      x: -743,
      y: -2010,
      file: 'cloud_berg3',
      scale: 1.72,
      flipX: true,
      scene: this,
      tint: 0x9de0ff,
    });

    // .........cloud_berg3_mitWolken............................................................
    PlaceElement.image({

      x: -1791,
      y: -1633,
      file: 'cloud_berg3_mitWolken',
      scale: 3,
      scene: this,
    });

    // .........cloud_berg1_tweekeer............................................................
    PlaceElement.image({
      x: 767,
      y: -1707,
      file: 'cloud_berg1_tweekeer',
      scale: 2.82,
      scene: this,
    });

    // .........cloud_C3_2............................................................
    PlaceElement.image({
      x: 1386,
      y: 518,
      name: 'cloud_C3_2',
      file: 'cloud_C3',
      scale: 2.36,
      flipX: true,
      scene: this,
    });

    // .........cloud_C1............................................................
    PlaceElement.image({
      x: 1243,
      y: 1623,
      file: 'cloud_C1',
      scale: 3.34,
      scene: this,
    });

    // .........cloud_C3............................................................
    PlaceElement.image({
      x: -1130,
      y: 1033,
      file: 'cloud_C3',
      scale: 2.8,
      scene: this,
    });

    // .........cloud_C4............................................................
    PlaceElement.image({
      x: -1207,
      y: 2073,
      file: 'cloud_C4',
      scale: 2.7,
      scene: this,
    });

    // .........cloud_C5_achtergrond............................................................
    PlaceElement.image({
      x: 480,
      y: 2276,
      file: 'cloud_C5_achtergrond',
      scale: 1,
      scene: this,
    });

    // .........cloud_C5_achtergrond_2............................................................
    PlaceElement.image({
      x: 75,
      y: -1691,
      file: 'cloud_C5_achtergrond',
      scale: 1,
      scene: this,
    });

    // .........cloud_huis_1............................................................
    PlaceElement.image({
      x: 2158,
      y: 1665,
      file: 'cloud_huis_1',
      scale: 1,
      scene: this,
    });

    // .........cloud_huis_3............................................................
    PlaceElement.image({
      x: -575,
      y: -1231,
      file: 'cloud_huis_3',
      scale: 0.5,
      alpha: 0.8,
      scene: this,
    });

    // .........cloud_brug_1............................................................
    PlaceElement.image({
      x: -206,
      y: 1303,
      file: 'cloud_brug_1',
      scale: 0.28,
      alpha: 0.7,
      flipX: true,
      scene: this,
    });

    // .........cloud_brug_1_2............................................................
    PlaceElement.image({
      x: 130,
      y: 1523,
      name: 'cloud_brug_1_2',
      file: 'cloud_brug_1',
      scale: 0.156,
      alpha: 0.7,
      flipX: true,
      scene: this,
    });

    // .........cloud_brug_2............................................................
    PlaceElement.image({
      x: 310,
      y: 1779,
      file: 'cloud_brug_2',
      alpha: 0.5,
      scale: 0.4,
      scene: this,
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
    }
  } // update
} // class
