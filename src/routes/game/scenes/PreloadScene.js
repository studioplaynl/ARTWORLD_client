/**
 * @file PreLoadScene.js
 * @author Maarten
 *
 *  What is this file for?
 *  ======================
 *  The file loads the assets for the game that are use anywhere.
 *  Per scene there are assets loaded that are only used in that scene.
 *
 *  We have a few functions to create assets, maybe move them to a separate file?
 */

/* eslint-disable max-len */
import Preloader from '../class/Preloader';
import ManageSession from '../ManageSession';
import { ART_FRAME_BORDER } from '../../../constants';
import Background from '../class/Background';
// import ServerCall from '../class/ServerCall';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../../../helpers/debugLog';

const { Phaser } = window;

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
    this.loadingDone = false;

    // sizes for the artWorks
    this.artIconSize = 64;
    this.artPreviewSize = 128;
    this.artDisplaySize = 512;
    this.artOffsetBetween = 20;
  }

  preload() {
    // .... PRELOADER VISUALISER ....................................................
    Preloader.Loading(this);
    // .... end PRELOADER VISUALISER ................................................

    // hitArea, namePlate, bubbles etc
    // grey circle for use as an image
    Background.circle({
      scene: this, name: 'greyCircle_64', size: 64, gradient1: 0xE8E8E8, gradient2: 0xE8E8E8, imageOnly: true,
    });
    // purple circle for use as UI image
    Background.circle({
      scene: this, name: 'purpleCircle_128', size: 128, gradient1: 0x7300ED, gradient2: 0x7300ED, imageOnly: true,
    });

    Background.rectangle({
      scene: this,
      name: 'greySquare_256',
      width: 256,
      height: 256,
      gradient1: 0xE8E8E8,
      gradient2: 0xE8E8E8,
      gradient3: 0xE8E8E8,
      gradient4: 0xE8E8E8,
      imageOnly: true,
    });
    Background.rectangle({
      scene: this,
      name: 'purpleSquare_256',
      size: 256,
      gradient1: 0x7300ED,
      gradient2: 0x7300ED,
      gradient3: 0x7300ED,
      gradient4: 0x7300ED,
      imageOnly: true,
      width: 256,
      height: 256,
      // posX: 0,
      // posY: 0,
    });

    // general UI assets
    this.load.svg('ui_magnifier_minus', './assets/SHB/svg/AW-icon-minus.svg', { scale: 3 });
    this.load.svg('ui_magnifier_plus', './assets/SHB/svg/AW-icon-plus.svg', { scale: 3 });
    this.load.svg('ui_eye', './assets/SHB/svg/AW-icon-reset.svg', { scale: 4 });

    this.load.svg('back_button', './assets/SHB/svg/AW-icon-previous.svg', { scale: 0.5 });
    this.load.svg('enter_button', './assets/SHB/svg/AW-icon-enter.svg');

    this.load.image('museum', './assets/museum.png');
    this.load.image('ball', './assets/ball_grey.png');

    // drawing on a wall
    this.load.image('brush', './assets/brush3.png');
    this.load.image('brickWall', './assets/brickwall_white.jpg');

    this.load.svg('home', './assets/SHB/svg/AW-icon-home.svg', { scale: 0.7 });
    this.load.svg('heart', './assets/SHB/svg/AW-icon-heart-full-red.svg', { scale: 0.7 });
    this.load.svg('heart_empty', './assets/SHB/svg/AW-icon-heart.svg', { scale: 0.7 });

    this.load.svg('enter_home', './assets/SHB/svg/AW-icon-enter-space.svg', { scale: 0.5 });
    this.load.svg('save_home', './assets/SHB/svg/AW-icon-save.svg', { scale: 0.5 });
    this.load.svg('addressbook', './assets/SHB/svg/AW-icon-addressbook.svg', { scale: 0.7 });
    this.load.svg('close', './assets/SHB/svg/AW-icon-cross.svg', { scale: 0.6 });
    this.load.svg('delete', './assets/SHB/svg/AW-icon-trash.svg', { scale: 0.6 });
    this.load.svg('save', './assets/SHB/svg/AW-icon-save.svg', { scale: 0.6 });

    // this.load.svg('abstract1', './assets/svg/abstract1.svg');
    this.load.svg('pencil', './assets/svg/pencil.svg', { scale: 2 });

    // animal for animalGarden Challenge
    this.load.image('dinoA', './assets/DinoA_01.png');
    // animation png sequence
    // this.load.image('animation_png_animal_henk_00001', './assets/animation_png_animal_henk/animation_png_animal_henk_00001.png');
    // this.load.image('animation_png_animal_henk_00002', './assets/animation_png_animal_henk/animation_png_animal_henk_00002.png');
    // this.load.image('animation_png_animal_henk_00003', './assets/animation_png_animal_henk/animation_png_animal_henk_00003.png');
    // this.load.image('animation_png_animal_henk_00004', './assets/animation_png_animal_henk/animation_png_animal_henk_00004.png');
    // this.load.image('animation_png_animal_henk_00005', './assets/animation_png_animal_henk/animation_png_animal_henk_00005.png');
    // this.load.image('animation_png_animal_henk_00006', './assets/animation_png_animal_henk/animation_png_animal_henk_00006.png');
    // this.load.image('animation_png_animal_henk_00007', './assets/animation_png_animal_henk/animation_png_animal_henk_00007.png');
    // flower for the flowerField Challenge
    this.load.image('flower', './assets/flower.png');
    // this.load.spritesheet('testdier', './assets/test_dier.png', { frameWidth: 128, frameHeight: 128 });

    // this.load.image('friend', './assets/popup/friend.png')
    // this.load.image('friend2', './assets/popup/friend2.png')
    // this.load.image('friend3', './assets/popup/friend3.png')

    this.load.spritesheet(
      'avatar1',
      './assets/spritesheets/cloud_breathing.png',
      { frameWidth: 68, frameHeight: 68 },
    );

    // background for mainMenu
    // this.load.image("background4", "./assets/art_styles/repetition/3fb6da9378545.560cd556c9413.jpg")

    // rex ui video player
    // this.load.image('play', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/play.png');
    // this.load.image('pause', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/pause.png');

    this.load.image('play', './assets/SHB/svg/AW-icon-play.svg');

    // this.load.video('test', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/video/test.mp4', 'canplaythrough', true, true);
    // ................ end rex ui video player

    this.load.svg('exhibit_outdoor_big', './assets/svg/exhibit_outdoor_big.svg');
    this.load.svg('exhibit_outdoor_small1', './assets/svg/exhibit_outdoor_small1.svg', { scale: 2 });
    this.load.svg('exhibit_outdoor_small2', './assets/svg/exhibit_outdoor_small2.svg', { scale: 1 });

    // this.load.svg('bitmap_heart', 'assets/svg/mario_heart.svg')
    // this.load.svg('mario_pipe', 'assets/svg/mario_pipe.svg')

    // create a hitArea for locations, as an image with key 'enterButtonHitArea', 128x128pix
    this.createHitAreaLocations();

    // create a generic artFrame for later use wit image key eg "artFrame_512"
    this.createArtFrame(512);
    this.createArtFrame(128);
    this.createArtFrame(32);

    // make a white square as a background for liked images that appear in the workd (image are transparent)
    this.createWhiteSquare(256);
    // debug test image square
    this.load.svg('test_image_square', 'https://upload.wikimedia.org/wikipedia/commons/d/de/TestScreen_square.svg');

    // balloon
    this.load.image('likedBalloon', './assets/likes_balloon.png');

    // plus sign for adding artworks inGame
    this.load.svg('plusSign', './assets/SHB/svg/AW-icon-plus.svg', { scale: 2 });
    // reloadSign for reloading challenge artworks inGame
    this.load.svg('reloadSign', './assets/SHB/svg/AW-icon-reset.svg', { scale: 2 });
    // arrow to the right without stem
    this.load.svg('enter', './assets/SHB/svg/AW-icon-enter.svg', { scale: 2 });
  }

  async create() {
    // this.load.on('loaderror', (offendingFile) => {
    //   dlog('loaderror', offendingFile);
    //   if (typeof offendingFile !== 'undefined') {
    //     ServerCall.resolveLoadError(offendingFile);
    //     // this.resolveLoadError(offendingFile);
    //   }
    // });
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';

    this.anims.create({
      key: this.playerMovingKey,
      frames: this.anims.generateFrameNumbers(ManageSession.playerAvatarPlaceholder, { start: 0, end: 8 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: this.playerStopKey,
      frames: this.anims.generateFrameNumbers(ManageSession.playerAvatarPlaceholder, { start: 4, end: 4 }),
    });
  } // create

  createHitAreaLocations() {
    // create a hitArea for locations, as an image with key 'enterButtonHitArea', 128x128pix
    const width = 128;
    const enterButtonHitArea = this.add.rectangle(width / 2, width / 2, width, width, 0x6666ff).setInteractive({ useHandCursor: true });
    // .setInteractive()

    const rt = this.add.renderTexture(0, 0, width, width);
    rt.draw(enterButtonHitArea);
    rt.saveTexture('enterButtonHitArea');
    enterButtonHitArea.destroy();
    rt.destroy();
  }

  createArtFrame(postFix) {
    const frameBorderSize = ART_FRAME_BORDER;
    const frame = this.add.graphics();
    // create a black square size of art + 20pix
    frame.fillStyle(0x000000);
    frame.fillRect(0, 0, postFix + (frameBorderSize * 2), postFix + (frameBorderSize * 2)).setVisible(false);
    frame.fillStyle(0xffffff);
    frame.fillRect(frameBorderSize, frameBorderSize, postFix, postFix).setVisible(false);

    // create renderTexture to place the dot on
    const artFrameRendertexture = this.add.renderTexture(0, 0, postFix + (frameBorderSize * 2), postFix + (frameBorderSize * 2)).setVisible(false);

    // draw the dot on the renderTexture
    artFrameRendertexture.draw(frame);

    // save the rendertexture with a key ('dot'), basically making an image out of it
    artFrameRendertexture.saveTexture(`artFrame_${postFix}`);
    // this.add.image(0, 0, 'artFrame_512').setVisible(false) // .setOrigin(0)

    frame.destroy();
    artFrameRendertexture.destroy();
  }

  createWhiteSquare(postFix) {
    const frame = this.add.graphics();
    // create a black square size of art + 20pix
    frame.fillStyle(0xffffff);
    frame.fillRect(0, 0, postFix, postFix).setVisible(false);

    // create renderTexture to place the dot on
    const artFrameRendertexture = this.add.renderTexture(0, 0, postFix, postFix).setVisible(false);

    // draw the dot on the renderTexture
    artFrameRendertexture.draw(frame);

    // save the rendertexture with a key ('dot'), basically making an image out of it
    artFrameRendertexture.saveTexture(`whiteSquare_${postFix}`);
    // dlog('whiteSqaure_postFix: ', `whiteSquare_${postFix}`);

    frame.destroy();
    artFrameRendertexture.destroy();
  }

  update() {
    if (this.loadingDone) {
      this.loadingDone = false;
      this.scene.launch('GameOnboarding');
    }
  } // end update
}
