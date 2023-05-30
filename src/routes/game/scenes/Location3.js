import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import { PlayerPos, PlayerZoom } from '../playerState';
import { SCENE_INFO } from '../../../constants';
import { handlePlayerMovement } from '../helpers/InputHelper';

const { Phaser } = window;

export default class Location3 extends Phaser.Scene {
  constructor() {
    super('Location3');
    this.location = 'Location3';

    this.worldSize = new Phaser.Math.Vector2(1320, 1320);

    this.phaser = this;
    // this.PlayerPos;
    this.onlinePlayers = [];
    this.avatarName = [];
    this.tempAvatarName = '';
    this.loadedAvatars = [];

    this.playerAvatarKey = '';
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';

    // shadow
    this.playerShadowOffset = -8;

    this.currentZoom = 1;
  }

  async preload() {
    // ....... TILEMAP .........................................................................
    // 1
    this.load.image(
      'tiles',
      './assets/tilesets/tuxmon-sample-32px-extruded.png',
    );

    this.load.tilemapTiledJSON('map', './assets/tilemaps/tuxemon-town.json');
    // end 1
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

    this.generateTileMap();

    handlePlayerMovement(this);
    // .......  PLAYER ..........................................................................

    // set playerAvatarKey to a placeholder,
    // so that the player loads even when the networks is slow, and the dependencies on player will funciton
    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with artworldCoordinates
    this.player = new PlayerDefault(
      this,
      CoordinatesTranslator.artworldToPhaser2DX(
        this.worldSize.x,
        get(PlayerPos).x,
      ),
      CoordinatesTranslator.artworldToPhaser2DY(
        this.worldSize.y,
        get(PlayerPos).y,
      ),
      ManageSession.playerAvatarPlaceholder,
    ).setDepth(201);
    this.playerShadow = new PlayerDefaultShadow(
      {
        scene: this,
        texture: ManageSession.playerAvatarPlaceholder,
      },
    ).setDepth(200);

    // .......  end PLAYER .............................................................................

    // ....... PLAYER VS WORLD ..........................................................................
    // setBounds has to be set before follow, otherwise the camera doesn't follow!
    // 1 and 2
    //  this.gameCam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // end 1 and 2

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);

    PlayerZoom.subscribe((zoom) => {
      this.gameCam.zoom = zoom;
    });

    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
    // ......... end PLAYER VS WORLD .......................................................................

    this.player.setCollideWorldBounds(true);

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    // -->off
    // this.physics.add.collider(this.player, worldLayer);
    // <--off
    // ......... end PLAYER VS WORLD ......................................................................

    Player.loadPlayerAvatar(this, 0, 0);
  } // end create

  generateTileMap() {
    // ....... TILEMAP .............................................................................
    // 2
    const map = this.make.tilemap({ key: 'map' });
    // end 2

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    // 1
    const tileset = map.addTilesetImage('tuxmon-sample-32px-extruded', 'tiles');

    // Create below layer
    map.createLayer('Below Player', tileset, 0, 0);

    // Create world Layer
    map.createLayer('World', tileset, 0, 0);

    // Create above Layer
    map.createLayer('Above Player', tileset, 0, 0);

    // worldLayer.setCollisionByProperty({ collides: true })

    // const spawnPoint = map.findObject(
    //   'Objects',
    //   (obj) => obj.name === 'Spawn Point',
    // );

    // ....... end TILEMAP ......................................................................
  }

  update() {
    // ...... ONLINE PLAYERS ................................................
    Player.parseNewOnlinePlayerArray(this);
    // .......................................................................

    // .......................................................................

    // ........... PLAYER SHADOW .............................................................................
    this.playerShadow.x = this.player.x + this.playerShadowOffset;
    this.playerShadow.y = this.player.y + this.playerShadowOffset;
    // ........... end PLAYER SHADOW .........................................................................
  } // update
} // class
