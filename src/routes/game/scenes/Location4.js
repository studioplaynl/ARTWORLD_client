import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Preloader from '../class/Preloader';
import SceneSwitcher from '../class/SceneSwitcher';
import Move from '../class/Move';
import Background from '../class/Background';
import { dlog } from '../helpers/DebugLog';
import { SCENE_INFO } from '../../../constants';

const { Phaser } = window;
export default class Location4 extends Phaser.Scene {
  constructor() {
    super('Location4');

    this.location = 'Location4';
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
    Preloader.Loading(this); // .... PRELOADER VISUALISER
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
    // get scene size from SCENE_INFO constants
    // copy worldSize over to ManageSession, so that positionTranslation can be done there
    let sceneInfo = SCENE_INFO.find(obj => obj.scene === this.scene.key);
    this.worldSize.x = sceneInfo.sizeX
    this.worldSize.y = sceneInfo.sizeY
    ManageSession.worldSize = this.worldSize;
    //!

    this.generateBackground();

    this.handleEditMode();

    this.handlePlayerMovement();
    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with Default -1185, 692 artworldCoordinates
    this.player = new PlayerDefault(this, -1185, 692, ManageSession.playerAvatarPlaceholder).setDepth(201);
    
    this.playerShadow = new PlayerDefaultShadow({
      scene: this,
      texture: ManageSession.playerAvatarPlaceholder,
    }).setDepth(200);
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

    Player.loadPlayerAvatar(this, -1185, 692);
  } // end create

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

  generateBackground() {
    // fill in textures
    this.add.rectangle(0, 0, 6000, 6000, 0xFFFFFF);

    const cross = [
      '.....',
      '..1..',
      '.111.',
      '..1..',
      '.....',

    ];

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

    this.gameCam.zoom = ManageSession.currentZoom;
    // .......................................................................

    // ........... PLAYER SHADOW .............................................................................
    // the shadow follows the player with an offset
    this.playerShadow.x = this.player.x + this.playerShadowOffset;
    this.playerShadow.y = this.player.y + this.playerShadowOffset;
    // ........... end PLAYER SHADOW .........................................................................
  } // update
} // class
