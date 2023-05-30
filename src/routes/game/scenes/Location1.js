import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import BouncingBird from '../class/BouncingBird';
import GraffitiWall from '../class/GraffitiWall';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
import SceneSwitcher from '../class/SceneSwitcher';
import Background from '../class/Background';
import { SCENE_INFO } from '../../../constants';
import { PlayerPos, PlayerZoom } from '../playerState';
import { handleEditMode, handlePlayerMovement } from '../helpers/InputHelper';


const { Phaser } = window;

export default class Location1 extends Phaser.Scene {
  constructor() {
    super('Location1');

    this.location = 'Location1';

    this.worldSize = new Phaser.Math.Vector2(3000, 3000);

    this.debug = false;

    this.phaser = this;

    this.player = {};
    this.playerShadow = {};
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.playerAvatarKey = '';

    // .......................REX UI ............
    this.COLOR_PRIMARY = 0xff5733;
    this.COLOR_LIGHT = 0xffffff;
    this.COLOR_DARK = 0x000000;
    this.data = null;
    // ....................... end REX UI ......

    // shadow
    this.playerShadowOffset = -8;

    this.currentZoom = 1;
  }

  async preload() {
    // .... PRELOADER VISUALISER ..........................
    this.load.image('art1', './assets/art_styles/drawing_painting/699f77a8e723a41f0cfbec5434e7ac5c.jpg');
    this.load.image('art2', './assets/art_styles/drawing_painting/f7f2e083a0c70b97e459f2966bc8c3ae.jpg');
    this.load.image('art3', './assets/art_styles/drawing_painting/doodle_dogman.png');
    this.load.image('art5', './assets/art_styles/drawing_painting/e13ad7758c0241352ffe203feffd6ff2.jpg');
    // .... end PRELOADER VISUALISER .......................
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


    handleEditMode(this);

    Background.standardWithDots(this);

    handlePlayerMovement(this);

    this.makeWoldElements();

    // graffiti walls
    GraffitiWall.create(this, 2200, 600, 800, 600, 'graffitiBrickWall', 0x000000, 'brickWall');
    // GraffitiWall.create(this, 600, 1200, 600, 1200, "graffitiDotWall", 0x000000)

    // .......  PLAYER ..........................................................................

    //* create default player and playerShadow
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

    // Player.loadPlayerAvatar(this);
    // .......  end PLAYER .............................................................................

    // ....... onlinePlayers ...........................................................................

    // ....... end onlinePlayers .......................................................................

    // ....... PLAYER VS WORLD ..........................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);

    PlayerZoom.subscribe((zoom) => {
      this.gameCam.zoom = zoom;
    });

    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
    // ......... end PLAYER VS WORLD .......................................................................

    //     // 1 and 2
    //     this.gameCam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // // end 1 and 2
    // grid

    // ......... end PLAYER VS WORLD ......................................................................

    this.generateLocations();

    // this.generateBouncingBird()
    BouncingBird.generate(this, 900, 400, 1.5);

    Player.loadPlayerAvatar(this);
    // this.exampleREXUI()
  } // end create

  makeWoldElements() {
    //* .......... scattered art works for the demo .....................................................
    // this.add.image(0, 200, "background4").setOrigin(0,0).setScale(1.3)
    // this.add.image(0, -300, "background5").setOrigin(0, 0).setScale(1)

    this.add.rexCircleMaskImage(1400, 600, 'art1').setOrigin(0, 0).setScale(1); // stamp painting
    // this.add.image(300, 1200, "art2").setOrigin(0, 0).setScale(1.3) //keith harring
    this.add.image(800, 1200, 'art3').setOrigin(0, 0).setScale(1.5); // dog doodle
    // this.add.image(2400, 200, "art4").setOrigin(0, 0).setScale(1) // 30ties style graphic
    this.add.image(300, 1200, 'art5').setOrigin(0, 0).setScale(1.6); // keith harring

    //* .......... end scattered art works for the demo .................................................

    //* ............. graphics as examples for the demo ..................................................
    const graphics = this.add.graphics();

    graphics.fillStyle(0x0000ff, 1);

    graphics.fillCircle(800, 300, 200);

    for (let i = 0; i < 250; i += 60) {
      graphics.lineStyle(5, 0xFF00FF, 1.0);
      graphics.beginPath();
      graphics.moveTo(800, 200 + i);
      graphics.lineTo(1200, 200 + i);
      graphics.closePath();
      graphics.strokePath();
    }

    for (let i = 0; i < 250; i += 60) {
      graphics.lineStyle(5, 0xFF00FF, 1.0);
      graphics.beginPath();
      graphics.moveTo(900 + i, 150);
      graphics.lineTo(900 + i, 550);
      graphics.closePath();
      graphics.strokePath();
    }

    const rectangle = this.add.graphics();
    rectangle.setVisible(false);
    rectangle.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
    rectangle.fillRect(0, 0, 400, 400);

    const rt = this.add.renderTexture(200, 100, 600, 600);
    const rt2 = this.add.renderTexture(100, 600, 600, 600);

    rt.draw(rectangle);
    rt2.draw(rectangle);

    const eraser = this.add.circle(0, 0, 190, 0x000000);
    eraser.setVisible(false);

    rt.erase(eraser, 200, 200);

    rt2.erase(rt, 0, 0);

    rt2.x = 400;
    rt2.y = 600;

    //* ............. end graphics as examples for the demo .............................................
  }

  generateLocations() {
    const { gameEditMode } = ManageSession;
    let locationVector = new Phaser.Math.Vector2(-200, -200);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);
    // eslint-disable-next-line no-unused-vars
    const location3 = new GenerateLocation({
      scene: this,
      type: 'image',
      x: locationVector.x,
      y: locationVector.y,
      draggable: gameEditMode,
      locationDestination: 'Location3',
      locationImage: 'museum',
      enterButtonImage: 'enter_button',
      locationText: 'Location 3',
      referenceName: 'Location3',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(200, 200);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);
    // eslint-disable-next-line no-unused-vars
    const location4 = new GenerateLocation({
      scene: this,
      type: 'isoTriangle',
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'Location4',
      locationImage: 'museum',
      enterButtonImage: 'enter_button',
      locationText: 'Location 4',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
  }

  update() {
    const { gameEditMode } = ManageSession;

    // don't move the player with clicking and swiping in edit mode
    if (!gameEditMode) {
      // ...... ONLINE PLAYERS ................................................
      Player.parseNewOnlinePlayerArray(this);
      // ........... PLAYER SHADOW .............................................................................
      // the shadow follows the player with an offset
      this.playerShadow.x = this.player.x + this.playerShadowOffset;
      this.playerShadow.y = this.player.y + this.playerShadowOffset;
      // ........... end PLAYER SHADOW .........................................................................
    } else {
      // when in edit mode
    }
  } // update
} // class
