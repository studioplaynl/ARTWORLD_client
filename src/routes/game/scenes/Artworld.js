import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Preloader from '../class/Preloader';
import GraffitiWall from '../class/GraffitiWall';
import Background from '../class/Background';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
import SceneSwitcher from '../class/SceneSwitcher';
import ServerCall from '../class/ServerCall';
import Exhibition from '../class/Exhibition';
import Move from '../class/Move';
import { dlog } from '../helpers/DebugLog';
import { playerPos } from '../playerState';
import { SCENE_INFO } from '../../../constants';

const { Phaser } = window;

export default class Artworld extends Phaser.Scene {
  constructor() {
    super('Artworld');

    this.location = 'Artworld';
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

    this.currentZoom = 1;
  }

  async preload() {
    Preloader.Loading(this); // .... PRELOADER VISUALISER
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



    const {
      artworldToPhaser2DX, artworldToPhaser2DY,
    } = CoordinatesTranslator;

    this.handleEditMode();

    this.makeBackground();

    this.handlePlayerMovement();
    //!

    this.makeWorldElements();


    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with artworldCoordinates
    this.player = new PlayerDefault(
      this,
      artworldToPhaser2DX(this.worldSize.x, get(playerPos).x),
      artworldToPhaser2DY(this.worldSize.y, get(playerPos).y),
      ManageSession.playerAvatarPlaceholder,
    ).setDepth(201);

    this.playerShadow = new PlayerDefaultShadow({
      scene: this,
      texture: ManageSession.playerAvatarPlaceholder,
    }).setDepth(200);

    // for back button, has to be done after player is created for the history tracking!
    SceneSwitcher.pushLocation(this);

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);
    this.gameCam.zoom = 1;
    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
    // ......... end PLAYER VS WORLD .......................................................................


    // .......... locations ................................................................................
    ServerCall.getHomesFiltered('home', 'Amsterdam', 100, this);
    this.generateLocations();
    // .......... end locations ............................................................................

    Player.loadPlayerAvatar(this);

    // when a scene is reloaded, update the howManyArtWorksAreThereInAHouse
    this.events.on('updateArtBubbles', ServerCall.updateArtBubbles);
  } // end create

  makeBackground() {
    // the order of creation is the order of drawing: first = bottom ...............................
    this.bgImageWhite = this.add.rectangle(0, 0, this.worldSize.x, this.worldSize.y, 0xffffff).setOrigin(0);
    this.bgImageWhite.setName('bgImageWhite');

    // this.bgImage = this.add.image(0, 0, 'bgImageWhite').setOrigin(0);;

    Background.repeatingDots({
      scene: this,
      gridOffset: 80,
      dotWidth: 2,
      dotColor: 0x7300ed,
      backgroundColor: 0xffffff,
    });


    // make a repeating set of rectangles around the artworld canvas
    const middleCoordinates = new Phaser.Math.Vector2(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0),
    );
    this.borderRectArray = [];

    for (let i = 0; i < 3; i++) {
      this.borderRectArray[i] = this.add.rectangle(0, 0, this.worldSize.x + (80 * i), this.worldSize.y + (80 * i));
      this.borderRectArray[i].setStrokeStyle(6 + (i * 2), 0x7300ed);

      this.borderRectArray[i].x = middleCoordinates.x;
      this.borderRectArray[i].y = middleCoordinates.y;
    }
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
        this.input.manager.canvas.style.cursor = 'grabbing';
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
          this.input.manager.canvas.style.cursor = 'default';
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

  makeWorldElements() {
    const {
      artworldToPhaser2DX, artworldToPhaser2DY,
    } = CoordinatesTranslator;

    Background.circle({
      scene: this,
      name: 'gradientAmsterdam1',
      posX: artworldToPhaser2DX(this.worldSize.x, 1743),
      posY: artworldToPhaser2DY(this.worldSize.y, -634),
      size: 810,
      gradient1: 0x85feff,
      gradient2: 0xff01ff,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.gradientAmsterdam1.setInteractive({ draggable: true }); }

    Background.circle({
      scene: this,
      name: 'gradientAmsterdam2',
      posX: artworldToPhaser2DX(this.worldSize.x, -2093),
      posY: artworldToPhaser2DY(this.worldSize.y, 1011),
      size: 564,
      gradient1: 0xfbff00,
      gradient2: 0x85feff,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.gradientAmsterdam2.setInteractive({ draggable: true }); }

    Background.circle({
      scene: this,
      name: 'gradientAmsterdam3',
      posX: artworldToPhaser2DX(this.worldSize.x, -1990),
      posY: artworldToPhaser2DY(this.worldSize.y, -927),
      size: 914,
      gradient1: 0x3a4bba,
      gradient2: 0xbb00ff,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.gradientAmsterdam3.setInteractive({ draggable: true }); }

    // ............ homes area ............
    // grass background for houses
    Background.circle({
      scene: this,
      name: 'gradientGrass1',
      posX: artworldToPhaser2DX(this.worldSize.x, 0),
      posY: artworldToPhaser2DY(this.worldSize.y, 0),
      size: 2300,
      gradient1: 0x15d64a,
      gradient2: 0x2b8042,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.gradientGrass1.setInteractive({ draggable: true }); }

    // paths for the houses
    this.createCurveWithHandles();
    // ............  end homes area ............

    // sunglass_stripes
    this.sunglasses_stripes = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -893),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1129),
      'sunglass_stripes',
    );
    this.sunglasses_stripes.name = 'sunglass_stripes';

    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.sunglasses_stripes.setInteractive({ draggable: true }); }

    this.train = this.add.image(
      artworldToPhaser2DX(this.worldSize.x, 652),
      artworldToPhaser2DY(this.worldSize.y, 1357),
      'metro_train_grey',
    );
    this.train.name = 'train';

    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.train.setInteractive({ draggable: true });
    } else {
      // when not in edit mode add animation tween
      this.tweens.add({
        targets: this.train,
        duration: 3000,
        x: '+=1750',
        yoyo: false,
        repeat: -1,
        repeatDelay: 8000,
        // ease: 'Sine.easeInOut'
      });
    }

    // create(scene, x, y, width, height, name, color, imageFile = null) {
    GraffitiWall.create(
      this,
      artworldToPhaser2DX(this.worldSize.x, 2323),
      artworldToPhaser2DY(this.worldSize.y, 1306),
      800,
      400,
      'graffitiBrickWall',
      0,
      'brickWall',
    );
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.graffitiBrickWall.setInteractive({ draggable: true }); }

    // ...................................................................................................
    // DRAW A SUN

    Background.circle({
      scene: this,
      name: 'sunDrawingExample',
      posX: artworldToPhaser2DX(this.worldSize.x, 1269),
      posY: artworldToPhaser2DY(this.worldSize.y, 2200),
      size: 400,
      gradient1: 0xffdf87,
      gradient2: 0xf7f76f,
    });

    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.sunDrawingExample.setInteractive({ draggable: true });
    } else {
      // when we are not in edit mode
      this.tweens.add({
        targets: this.sunDrawingExample,
        duration: 3000,
        scaleX: 1.8,
        scaleY: 1.8,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.sunDrawingExample.setInteractive()
        .on('pointerup', () => {
          this.sunDraw.setVisible(true);
          this.sunDrawCloseButton.setVisible(true);
          this.sunDrawSaveButton.setVisible(true);
          this.physics.pause();
        });

      GraffitiWall.create(
        this,
        artworldToPhaser2DX(this.worldSize.x, 1383),
        artworldToPhaser2DY(this.worldSize.y, 1600),
        400,
        400,
        'sunDraw',
        180,
        'artFrame_512',
      );
      this.sunDraw.setVisible(false);

      // Create and add Close button
      this.sunDrawCloseButton = this.add.image(
        this.sunDraw.x + (this.sunDraw.width / 1.8),
        this.sunDraw.y - (this.sunDraw.width / 2),
        'close',
      );
      this.sunDrawCloseButton.setInteractive()
        .on('pointerup', () => {
          this.sunDraw.setVisible(false);
          this.sunDrawCloseButton.setVisible(false);
          this.sunDrawSaveButton.setVisible(false);
          this.physics.resume();
        });
      this.sunDrawCloseButton.setVisible(false);

      // Create and add Save button
      this.sunDrawSaveButton = this.add.image(
        this.sunDrawCloseButton.x,
        this.sunDrawCloseButton.y + (this.sunDrawCloseButton.width * 1.1),
        'save',
      );
      this.sunDrawSaveButton.setInteractive()
        .on('pointerup', () => {
          const RT = this.sunDraw.getByName('sunDraw');
          RT.saveTexture('DrawnSun');
          dlog('this.sunDrawingExample', this.sunDrawingExample);
          this.sunDrawingExample.setTexture('DrawnSun');
        });
      this.sunDrawSaveButton.setVisible(false);
    }
    // end DRAW A SUN
    // ...................................................................................................

    // ...................................................................................................
    // DRAW A CLOUD

    this.cloudDrawingExample = this.add.image(
      artworldToPhaser2DX(this.worldSize.x, 1200),
      artworldToPhaser2DY(this.worldSize.y, 2050),
      'drawn_cloud',
    );
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    this.cloudDrawingExample.name = 'cloudDrawingExample';
    if (ManageSession.gameEditMode) {
      this.cloudDrawingExample.setInteractive({ draggable: true });
    } else {
      this.tweens.add({
        targets: this.cloudDrawingExample,
        duration: 8000,
        x: '-=1600',
        // scaleY: 1.8,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.cloudDrawingExample.setInteractive()
        .on('pointerup', () => {
          this.cloudDraw.setVisible(true);
          this.cloudDrawCloseButton.setVisible(true);
          this.cloudDrawSaveButton.setVisible(true);
        });

      GraffitiWall.create(
        this,
        artworldToPhaser2DX(this.worldSize.x, 1200),
        artworldToPhaser2DY(this.worldSize.y, 1500),
        600,
        400,
        'cloudDraw',
        2,
        'artFrame_512',
      );
      this.cloudDraw.setVisible(false);

      this.cloudDrawCloseButton = this.add.image(
        this.cloudDraw.x + (this.cloudDraw.width / 1.8),
        this.cloudDraw.y - (this.cloudDraw.width / 1.8),
        'close',
      );
      this.cloudDrawCloseButton.setInteractive()
        .on('pointerup', () => {
          this.cloudDraw.setVisible(false);
          this.cloudDrawCloseButton.setVisible(false);
          this.cloudDrawSaveButton.setVisible(false);
        });
      this.cloudDrawCloseButton.setVisible(false);

      this.cloudDrawSaveButton = this.add.image(
        this.cloudDrawCloseButton.x,
        this.cloudDrawCloseButton.y + (this.cloudDrawCloseButton.width * 1.1),
        'save',
      );
      this.cloudDrawSaveButton.setInteractive()
        .on('pointerup', () => {
          const RT = this.cloudDraw.getByName('cloudDraw');
          RT.saveTexture('DrawnCloud');
          this.cloudDrawingExample.setTexture('DrawnCloud');
        });
      this.cloudDrawSaveButton.setVisible(false);
    }
    // end DRAW A CLOUD
    // ...................................................................................................

    // ...................................................................................................
    this.photo_camera = this.add.image(
      artworldToPhaser2DX(this.worldSize.x, 662),
      artworldToPhaser2DY(this.worldSize.y, 1377),
      'photo_camera',
    ).setFlip(true, false);
    this.photo_camera.name = 'photo_camera';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.photo_camera.setInteractive({ draggable: true }); }

    this.tree_palm = this.add.image(
      artworldToPhaser2DX(this.worldSize.x, 992),
      artworldToPhaser2DY(this.worldSize.y, 772),
      'tree_palm',
    );
    this.tree_palm.name = 'tree_palm';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.tree_palm.setInteractive({ draggable: true }); }

    Exhibition.AbriBig({
      scene: this,
      name: 'exhibit_outdoor_big1',
      posX: artworldToPhaser2DX(this.worldSize.x, -300),
      posY: artworldToPhaser2DY(this.worldSize.y, 1262),
      size: 564,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.exhibit_outdoor_big1.setInteractive({ draggable: true }); }

    Exhibition.AbriSmall2({
      scene: this,
      name: 'exhibit_outdoor_small2_1',
      posX: artworldToPhaser2DX(this.worldSize.x, 1659),
      posY: artworldToPhaser2DY(this.worldSize.y, 287),
      size: 564,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.exhibit_outdoor_small2_1.setInteractive({ draggable: true }); }

    // about drag an drop multiple  objects efficiently https://www.youtube.com/watch?v=t56DvozbZX4&ab_channel=WClarkson
  }

  /** Create a curve with handles in edit mode
 * @todo Work in progress, replace with CurveWithHandles class? */
  createCurveWithHandles() {
    const { artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;
    const { gameEditMode } = ManageSession;

    this.curve = new Phaser.Curves.Spline([
      artworldToPhaser2DX(this.worldSize.x, -977), artworldToPhaser2DY(this.worldSize.y, 598),
      artworldToPhaser2DX(this.worldSize.x, -604), artworldToPhaser2DY(this.worldSize.y, 526),
      artworldToPhaser2DX(this.worldSize.x, -608), artworldToPhaser2DY(this.worldSize.y, 92),
      artworldToPhaser2DX(this.worldSize.x, 339), artworldToPhaser2DY(this.worldSize.y, 202),
      artworldToPhaser2DX(this.worldSize.x, 616), artworldToPhaser2DY(this.worldSize.y, 972),
    ]);

    const { points } = this.curve;

    //  Create drag-handles for each point
    if (gameEditMode) {
      for (let i = 0; i < points.length; i += 1) {
        const point = points[i];

        this.handle = this.add.image(point.x, point.y, 'ball', 0).setScale(0.1).setInteractive().setDepth(40);
        this.handle.name = 'handle';

        this.handle.setData('vector', point);

        this.input.setDraggable(this.handle);
      }
    }
    this.curveGraphics = this.add.graphics();
    this.curveGraphics.lineStyle(60, 0xffff00, 1);
    this.curve.draw(this.curveGraphics, 64);
  }

  generateLocations() {
    const { artworldVectorToPhaser2D } = CoordinatesTranslator;
    const { gameEditMode } = ManageSession;

    let locationVector = new Phaser.Math.Vector2(-1215, -589);
    locationVector = artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    //  if ( this.location1 != null ) this.location1.destroy()

    this.location1 = new GenerateLocation({
      scene: this,
      type: 'isoBox',
      draggable: gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'Location1',
      locationImage: 'museum',
      enterButtonImage: 'enter_button',
      locationText: 'Location 1',
      referenceName: 'Location1',
      fontColor: 0x8dcb0e,
      color1: 0xffe31f,
      color2: 0xf2a022,
      color3: 0xf8d80b,
    });

    //* set the particle first on 0,0 so they are below the mario_star
    //* later move them relative to the mario_star
    const particles = this.add.particles('music_quarter_note').setDepth(139);

    const musicEmitter = particles.createEmitter({
      x: 0,
      y: 0,
      lifespan: { min: 2000, max: 8000 },
      speed: { min: 80, max: 120 },
      angle: { min: 270, max: 360 },
      gravityY: -50,
      gravityX: 50,
      scale: { start: 1, end: 0 },
      quantity: 1,
      frequency: 1600,
    });

    locationVector = new Phaser.Math.Vector2(-792, -1138);
    locationVector = artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.mario_star = new GenerateLocation({
      scene: this,
      type: 'image',
      size: 200,
      draggable: gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      internalUrl: 'mariosound',
      locationImage: 'mario_star',
      enterButtonImage: 'enter_button',
      locationText: 'Mario Sound',
      referenceName: 'MarioSound',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.mario_star.setDepth(140);

    musicEmitter.setPosition(this.mario_star.x + 15, this.mario_star.y - 20);

    locationVector = new Phaser.Math.Vector2(-2125, 1017);
    locationVector = artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    // this.pencil = this.add.image(locationVector.x, locationVector.y, "pencil")
    // this.pencil.rotation = 0.12
    // this.pencil.setInteractive()
    // this.pencil.on('pointerup', () => CurrentApp.set("drawing"))

    this.pencil = new GenerateLocation({
      scene: this,
      type: 'image',

      draggable: gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      appUrl: 'drawing',
      locationImage: 'pencil',
      enterButtonImage: 'enter_button',
      locationText: 'drawingApp',
      referenceName: 'drawingApp',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.pencil.rotation = 0.12;

    locationVector = new Phaser.Math.Vector2(-1555, 809);
    locationVector = artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.animalGardenChallenge = new GenerateLocation({
      scene: this,
      type: 'image',

      draggable: gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'ChallengeAnimalGarden',
      locationImage: 'dinoA',
      enterButtonImage: 'enter_button',
      locationText: 'animal Garden',
      referenceName: 'animalGardenChallenge',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });

    locationVector = new Phaser.Math.Vector2(1464, 989);
    locationVector = artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.flowerFieldChallenge = new GenerateLocation({
      scene: this,
      type: 'image',

      draggable: gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'ChallengeFlowerField',
      locationImage: 'flower',
      enterButtonImage: 'enter_button',
      locationText: 'bloemen Veld',
      referenceName: 'flowerFieldChallenge',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
  }

  update() {
    // zoom in and out of game
    this.gameCam.zoom = ManageSession.currentZoom;

    // don't move the player with clicking and swiping in edit mode
    if (!ManageSession.gameEditMode) {
      // ...... ONLINE PLAYERS ................................................
      Player.parseNewOnlinePlayerArray(this);
      // ........... PLAYER SHADOW .............................................................................
      // the shadow follows the player with an offset
      this.playerShadow.x = this.player.x + this.playerShadowOffset;
      this.playerShadow.y = this.player.y + this.playerShadowOffset;
      // ........... end PLAYER SHADOW .........................................................................
    } else {
      // when in edit mode
      this.updateCurveGraphics();
    }
  } // update

  updateCurveGraphics() {
    this.curveGraphics.clear();
    this.curveGraphics.lineStyle(60, 0xffff00, 1);
    this.curve.draw(this.curveGraphics, 64);
  }
} // class
