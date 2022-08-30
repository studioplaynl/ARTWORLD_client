import { CONFIG } from '../config';
import ManageSession from '../ManageSession';
import { getAccount } from '../../../api';

import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Preloader from '../class/Preloader';
import BouncingBird from '../class/BouncingBird';
import Background from '../class/Background';
import DebugFuntions from '../class/DebugFuntions';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';

const { Phaser } = window;

export default class TestCoordinates extends Phaser.Scene {
  constructor() {
    super('TestCoordinates');

    this.location = 'TestCoordinates';

    this.worldSize = new Phaser.Math.Vector2(600, 600);

    this.debug = false;

    this.gameStarted = false;
    this.phaser = this;
    // this.playerPos;
    this.onlinePlayers = [];

    this.newOnlinePlayers = [];

    this.currentOnlinePlayer;
    this.avatarName = [];
    this.tempAvatarName = '';
    this.loadedAvatars = [];

    this.player;
    this.playerShadow;
    this.playerAvatarPlaceholder = 'avatar1';
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.playerAvatarKey = '';

    this.offlineOnlineUsers;

    // .......................REX UI ............
    this.COLOR_PRIMARY = 0xff5733;
    this.COLOR_LIGHT = 0xffffff;
    this.COLOR_DARK = 0x000000;
    this.data;
    // ....................... end REX UI ......

    this.cursors;
    this.pointer;
    this.isClicking = false;
    this.cursorKeyIsDown = false;
    this.swipeDirection = 'down';
    this.swipeAmount = new Phaser.Math.Vector2(0, 0);

    // pointer location example
    // this.source // = player
    this.target = new Phaser.Math.Vector2();
    this.distance;

    // shadow
    this.playerShadowOffset = -8;
    this.playerIsMovingByClicking = false;

    this.currentZoom;
    this.UIScene;

    this.text1;
  }

  async preload() {
    Preloader.Loading(this); // .... PRELOADER VISUALISER
  }

  async create() {
    // timers
    ManageSession.updateMovementTimer = 0;
    ManageSession.updateMovementInterval = 60; // 1000 / frames =  millisec

    Background.repeatingDots({
      scene: this, gridOffset: 50, dotWidth: 2, dotColor: 0x909090, backgroundColor: 0xFFFFFF,
    });

    // .......  PLAYER ....................................................................................
    //* create deafult player and playerShadow
    // create player in center with artworldCoordinates
    // this.player = new PlayerDefault(this, CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0), this.playerAvatarPlaceholder)
    // create draggable player
    this.player = this.add.image(CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0), 'ui_eye').setScale(0.6).setDepth(101).setInteractive();

    this.input.setDraggable(this.player);
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    // this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder })
    // .......  end PLAYER ................................................................................

    // ....... onlinePlayers ..............................................................................
    // add onlineplayers group
    this.onlinePlayersGroup = this.add.group();
    // ....... end onlinePlayers ..........................................................................

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);
    //! setBounds has to be set before follow, otherwise the camera doesn't follow!
    this.gameCam.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    this.gameCam.zoom = 1;
    // this.gameCam.startFollow(this.player)
    // ......... end PLAYER VS WORLD .......................................................................

    // ......... INPUT .....................................................................................
    this.cursors = this.input.keyboard.createCursorKeys();
    // .......... end INPUT ................................................................................

    // .......... locations ................................................................................
    // this.generateLocations()
    let location1Vector = new Phaser.Math.Vector2(-100, -100);
    // console.log(location1Vector)

    location1Vector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, location1Vector);
    // console.log(location1Vector)

    const location1 = new GenerateLocation({
      scene: this, type: 'image', x: location1Vector.x, y: location1Vector.y, key1: 'avatar1', text: 'Hello!', fontColor: 0x8dcb0e,
    });
    // .......... end locations ............................................................................

    // BouncingBird.generate({ scene: this, birdX: 200, birdY: 200, birdScale: 1.2 })

    // ......... DEBUG FUNCTIONS ...........................................................................
    DebugFuntions.keyboard(this);
    // this.createDebugText();
    // ......... end DEBUG FUNCTIONS .......................................................................

    // ......... UI Scene  .................................................................................
    this.UIScene = this.scene.get('UIScene');
    this.scene.launch('UIScene');
    this.currentZoom = this.UIScene.currentZoom;
    this.UIScene.location = this.location;
    this.gameCam.zoom = this.currentZoom;
    // ......... end UI Scene ..............................................................................
    this.text1 = this.add.text(10, 10, '', { fill: '#00ff00' });
  }

  update(time, delta) {
    // ...... ONLINE PLAYERS ................................................
    // Player.loadOnlinePlayers(this)
    // Player.receiveOnlinePlayersMovement(this)
    // Player.loadOnlineAvatar(this)

    this.gameCam.zoom = this.UIScene.currentZoom;

    const pointer = this.input.activePointer;

    const toARTWORLDx = CoordinatesTranslator.Phaser2DToArtworldX(this.worldSize.x, pointer.worldX);
    const toARTWORLDy = CoordinatesTranslator.Phaser2DToArtworldY(this.worldSize.y, pointer.worldY);

    this.text1.setText([
      `x: ${pointer.worldX}`,
      `y: ${pointer.worldY}`,
      `isDown: ${pointer.isDown}`,
      `toARTWORLDx: ${toARTWORLDx}`,
      `toARTWORLDy: ${toARTWORLDy}`,
      'convert back to screen: ',
      `x: ${CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, toARTWORLDx)}`,
      `y: ${CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, toARTWORLDy)}`,
    ]);

    // .......................................................................

    // ........... PLAYER SHADOW .............................................................................
    // the shadow follows the player with an offset
    // this.playerShadow.x = this.player.x + this.playerShadowOffset
    // this.playerShadow.y = this.player.y + this.playerShadowOffset
    // ........... end PLAYER SHADOW .........................................................................

    // .......... UPDATE TIMER      ..........................................................................
    // ManageSession.updateMovementTimer += delta
    // console.log(time) //running time in millisec
    // console.log(delta) //in principle 16.6 (60fps) but drop to 41.8ms sometimes
    // ....... end UPDATE TIMER  ..............................................................................

    // ........ PLAYER MOVE BY KEYBOARD  ......................................................................
    // if (!this.playerIsMovingByClicking) {
    //     Player.moveByKeyboard(this) //player moving with keyboard with playerMoving Class
    // }

    // Player.moveByCursor(this)
    // //....... end PLAYER MOVE BY KEYBOARD  ..........................................................................

    // //....... moving ANIMATION ......................................................................................
    // Player.movingAnimation(this)
    // //....... end moving ANIMATION .................................................................................

    // //this.playerMovingByClicking()

    // // to detect if the player is clicking/tapping on one place or swiping
    // if (this.input.activePointer.downX != this.input.activePointer.upX) {
    //     Player.moveBySwiping(this)
    // } else {
    //     Player.moveByTapping(this)
    // }
  } // update
} // class
