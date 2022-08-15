import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import SceneSwitcher from '../class/SceneSwitcher';
import Move from '../class/Move';
import { playerPos } from '../playerState';

const { Phaser } = window;

export default class Location3 extends Phaser.Scene {
  constructor() {
    super('Location3');

    this.worldSize = new Phaser.Math.Vector2(1320, 1320);

    this.gameStarted = false;
    this.phaser = this;
    // this.playerPos;
    this.onlinePlayers = [];
    this.avatarName = [];
    this.tempAvatarName = '';
    this.loadedAvatars = [];

    this.location = 'Location3';

    this.playerAvatarKey = '';
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';

    this.isClicking = false;
    this.arrowDown = false;
    this.swipeDirection = 'down';
    this.swipeAmount = new Phaser.Math.Vector2(0, 0);

    // pointer location example
    // this.source // = player
    this.target = new Phaser.Math.Vector2();

    // shadow
    this.playerShadowOffset = -8;
    this.playerIsMovingByClicking = false;

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
    // copy worldSize over to ManageSession, so that positionTranslation can be done there
    ManageSession.worldSize = this.worldSize;

    this.generateTileMap();

    this.touchBackgroundCheck = this.add.rectangle(0, 0, this.worldSize.x, this.worldSize.y, 0xfff000)
      .setInteractive() // { useHandCursor: true }
      .on('pointerup', () => console.log('touched background'))
      .on('pointerdown', () => {
        ManageSession.playerIsAllowedToMove = true;
        return ManageSession.playerIsAllowedToMove;
      })
      .setDepth(219)
      .setOrigin(0)
      .setVisible(false);

    // this is needed for an image or sprite to be interactive also when alpha = 0 (invisible)
    this.touchBackgroundCheck.input.alwaysEnabled = true;

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
        get(playerPos).x,
      ),
      CoordinatesTranslator.artworldToPhaser2DY(
        this.worldSize.y,
        get(playerPos).y,
      ),
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
    // .......  end PLAYER .............................................................................

    // ....... PLAYER VS WORLD ..........................................................................
    // setBounds has to be set before follow, otherwise the camera doesn't follow!
    // 1 and 2
    //  this.gameCam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // end 1 and 2

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);
    this.gameCam.zoom = 1;
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
    this.gameCam.zoom = ManageSession.currentZoom;
    // .......................................................................

    // ........... PLAYER SHADOW .............................................................................
    this.playerShadow.x = this.player.x + this.playerShadowOffset;
    this.playerShadow.y = this.player.y + this.playerShadowOffset;
    // ........... end PLAYER SHADOW .........................................................................

    // to detect if the player is clicking/tapping on one place or swiping
    if (this.input.activePointer.downX !== this.input.activePointer.upX) {
      Move.moveBySwiping(this);
    } else {
      Move.moveByTapping(this);
    }
  } // update
} // class
