import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import SceneSwitcher from '../class/SceneSwitcher';
import Move from '../class/Move';
import Background from '../class/Background';
import { playerPos } from '../playerState';
import { SCENE_INFO } from '../../../constants';

const { Phaser } = window;

export default class Location3 extends Phaser.Scene {
  constructor() {
    super('Location3');
    this.location = 'Location3';

    this.worldSize = new Phaser.Math.Vector2(1320, 1320);

    this.phaser = this;
    // this.playerPos;
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
    let sceneInfo = SCENE_INFO.find(obj => obj.scene === this.scene.key);
    this.worldSize.x = sceneInfo.sizeX
    this.worldSize.y = sceneInfo.sizeY
    ManageSession.worldSize = this.worldSize;
    //!

    this.generateTileMap();

    this.handleEditMode();

    this.handlePlayerMovement();
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
    Player.parseNewOnlinePlayerArray(this);
    // .......................................................................
    this.gameCam.zoom = ManageSession.currentZoom;
    // .......................................................................

    // ........... PLAYER SHADOW .............................................................................
    this.playerShadow.x = this.player.x + this.playerShadowOffset;
    this.playerShadow.y = this.player.y + this.playerShadowOffset;
    // ........... end PLAYER SHADOW .........................................................................
  } // update
} // class
