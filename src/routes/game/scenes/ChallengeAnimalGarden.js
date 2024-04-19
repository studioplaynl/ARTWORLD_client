/* eslint-disable no-underscore-dangle */
import { get } from 'svelte/store';
import { push } from 'svelte-spa-router';
import ManageSession from '../ManageSession';

import Background from '../class/Background';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../../../helpers/debugLog';
import { PlayerHistory, PlayerPos, PlayerZoom } from '../playerState';
import { SCENE_INFO } from '../../../constants';
import { handlePlayerMovement } from '../helpers/InputHelper';
import ServerCall from '../class/ServerCall';

import * as Phaser from 'phaser';


export default class ChallengeAnimalGarden extends Phaser.Scene {
  constructor() {
    super('ChallengeAnimalGarden');

    this.worldSize = new Phaser.Math.Vector2(0, 0);

    this.debug = false;

    this.phaser = this;
    // this.PlayerPos

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

    // this.currentZoom = 1;

    // size for the artWorks
    this.artPreviewSize = 128;

    this.artUrl = [];
    this.userArtServerList = [];
    this.progress = [];

    this.animalArray = {};
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

    // End Background .........................................................................................

    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with artworldCoordinates
    this.player = new PlayerDefault(
      this,
      artworldToPhaser2DX(
        this.worldSize.x,
        get(PlayerPos).x,
      ),
      artworldToPhaser2DY(
        this.worldSize.y,
        get(PlayerPos).y,
      ),
    ).setDepth(201);
    
    this.playerShadow = new PlayerDefaultShadow(
      {
        scene: this,
        texture: ManageSession.playerAvatarPlaceholder,
      },
    ).setDepth(200);
    // for back button, has to be done after player is created for the history tracking!

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);

    PlayerZoom.subscribe((zoom) => {
      this.gameCam.zoom = zoom;
    });

    this.gameCam.startFollow(this.player);
    // this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
    // ......... end PLAYER VS WORLD .......................................................................

    //!
    Player.loadPlayerAvatar(this);
    //!

    // download all dier from all users
    this.getAnimals(this.animalArray);
    this.makeNewAnimalButton();
    this.reloadButton();
  } // end create


  getAnimals(serverObjectsHandler) {
    const type = 'dier';
    const userId = null; // to get all users' artworks
    const artSize = 256;
    const artMargin = artSize / 10;
    this.artMargin = artMargin;
    ServerCall.downloadAndPlaceArtByType({
      type, userId, serverObjectsHandler, artSize,
    });
  }


  reloadButton() {
    const reloadButton = this.add.image((this.worldSize.x / 2) - 300, -50, 'reloadSign').setDepth(200);
    reloadButton.setInteractive();
    reloadButton.on('pointerup', () => {
      // reload the animal garden to show new animals
      // setTimeout(() => { window.location.reload(); }, 300);
      this.scene.restart();
    });
  }

  makeNewAnimalButton() {
    // add the plussign button to the scene
    const plusSign = this.add.image(this.worldSize.x / 2, -50, 'plusSign').setDepth(200);
    plusSign.setInteractive();
    plusSign.on('pointerup', () => {
      /* Make a new artwork */
      // open the relevant app
      const value = '/animalchallenge';
      push(value);
      PlayerHistory.push(value);
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
