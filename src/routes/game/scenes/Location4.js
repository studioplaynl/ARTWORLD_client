import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Preloader from '../class/Preloader';

import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
import HistoryTracker from '../class/HistoryTracker';
import Move from '../class/Move';

// import { getAvatar } from '../../profile.svelte'
import { getAccount, listObjects } from '../../../api';

const { Phaser } = window;

export default class Location4 extends Phaser.Scene {
  constructor() {
    super('Location4');

    this.worldSize = new Phaser.Math.Vector2(3000, 3000);

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
    this.playerContainer;
    this.playerAvatarPlaceholder = 'playerAvatar';
    this.playerAvatarKey = '';
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';

    this.offlineOnlineUsers;

    this.location = 'Location4';

    this.cursors;
    this.pointer;
    this.isClicking = false;
    this.arrowDown = false;
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
    // copy worldSize over to ManageSession, so that positionTranslation can be done there
    ManageSession.worldSize = this.worldSize;

    this.generateBackground();

    this.touchBackgroundCheck = this.add.rectangle(0, 0, this.worldSize.x, this.worldSize.y, 0xfff000)
      .setInteractive() // { useHandCursor: true }
      .on('pointerup', () => console.log('touched background'))
      .on('pointerdown', () => ManageSession.playerIsAllowedToMove = true)
      .setDepth(219)
      .setOrigin(0)
      .setVisible(false);

    this.touchBackgroundCheck.input.alwaysEnabled = true; // this is needed for an image or sprite to be interactive also when alpha = 0 (invisible)

    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with Default -1185, 692 artworldCoordinates
    this.player = new PlayerDefault(this, -1185, 692, this.playerAvatarPlaceholder).setDepth(201);
    this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder }).setDepth(200);
    // .......  end PLAYER ................................................................................
    // for back button
    HistoryTracker.pushLocation(this);

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

  generateBouncingBird() {
    const container = this.add.container();
    const leg1 = this.add.isobox(415, 340, 10, 50, 0xffe31f, 0xf2a022, 0xf8d80b);
    const leg2 = this.add.isobox(390, 350, 10, 50, 0xffe31f, 0xf2a022, 0xf8d80b);
    const body1 = this.add.isobox(360, 288, 50, 22, 0x00b9f2, 0x016fce, 0x028fdf);
    const body2 = this.add.isobox(400, 300, 80, 80, 0x00b9f2, 0x016fce, 0x028fdf);
    const beak = this.add.isobox(430, 270, 40, 10, 0xffe31f, 0xf2a022, 0xf8d80b);
    const eye = this.add.isobox(394, 255, 30, 15, 0xffffff, 0xffffff, 0xffffff).setFaces(false, true, false);
    const pupil = this.add.isobox(391, 255, 15, 10, 0x000000, 0x000000, 0x000000).setFaces(false, true, false);
    const wing = this.add.isobox(366, 300, 50, 10, 0x00b9f2, 0x016fce, 0x028fdf);
    container.add([leg1, leg2, body1, body2, beak, eye, pupil, wing]);
    container.x = 900;
    container.y = 400;
    container.setScale(1.5);

    this.tweens.add({
      targets: container,
      y: '-=160',
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  generateBackground() {
    // fill in textures
    const background = this.add.rectangle(0, 0, 6000, 6000, 0xFFFFFF);

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

    // this.add.image(0, 200, "background4").setOrigin(0,0).setScale(1.3)
    // this.add.image(0, -300, "background5").setOrigin(0, 0).setScale(1)

    // let graphics = this.add.graphics();

    // graphics.fillStyle(0x0000ff, 1);

    // graphics.fillCircle(800, 300, 200);

    // for (let i = 0; i < 250; i += 60) {
    //   graphics.lineStyle(5, 0xFF00FF, 1.0);
    //   graphics.beginPath();
    //   graphics.moveTo(800, 200 + i);
    //   graphics.lineTo(1200, 200 + i);
    //   graphics.closePath();
    //   graphics.strokePath();
    // }

    // for (let i = 0; i < 250; i += 60) {
    //   graphics.lineStyle(5, 0xFF00FF, 1.0);
    //   graphics.beginPath();
    //   graphics.moveTo(900 + i, 150);
    //   graphics.lineTo(900 + i, 550);
    //   graphics.closePath();
    //   graphics.strokePath();
    // }

    // let rectangle = this.add.graphics();
    // rectangle.setVisible(false);
    // rectangle.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
    // rectangle.fillRect(0, 0, 400, 400);

    // let rt = this.add.renderTexture(200, 100, 600, 600);
    // let rt2 = this.add.renderTexture(100, 600, 600, 600);

    // rt.draw(rectangle);
    // rt2.draw(rectangle);

    // let eraser = this.add.circle(0, 0, 190, 0x000000);
    // eraser.setVisible(false);

    // rt.erase(eraser, 200, 200);

    // rt2.erase(rt, 0, 0)
    // rt2.x = 400
    // rt2.y = 600

    // end fill in textures
  }

  update(time, delta) {
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

    // to detect if the player is clicking/tapping on one place or swiping
    if (this.input.activePointer.downX != this.input.activePointer.upX) {
      Move.moveBySwiping(this);
    } else {
      Move.moveByTapping(this);
    }
  } // update
} // class
