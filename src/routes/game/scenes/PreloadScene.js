/* eslint-disable max-len */
import Preloader from '../class/Preloader';
import ManageSession from '../ManageSession';
import { ART_FRAME_BORDER } from '../../../constants';
import Background from '../class/Background';

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

    // artworld logo
    this.load.image('artworld', 'assets/artworld.png');

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
    this.load.image('drawn_cloud', './assets/drawn_cloud.png');

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

    this.load.svg('abstract1', './assets/svg/abstract1.svg');
    this.load.svg('pencil', './assets/svg/pencil.svg', { scale: 2 });

    // app icons; sound apps
    this.load.image('songmaker', './assets/apps/songmaker.png');
    this.load.image('melodymaker', './assets/apps/melodymaker.png');
    this.load.image('kandinsky', './assets/apps/kandinsky.png');

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
    this.load.spritesheet('testdier', './assets/test_dier.png', { frameWidth: 128, frameHeight: 128 });

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

    // artworld elements
    this.load.svg('sunglass_stripes', 'assets/svg/sunglass_stripes.svg');
    this.load.svg('photo_camera', 'assets/svg/photo_camera.svg', { scale: 2.4 });
    this.load.svg('tree_palm', './assets/svg/tree_palm.svg');
    this.load.svg('exhibit_outdoor_big', './assets/svg/exhibit_outdoor_big.svg');
    this.load.svg('exhibit_outdoor_small1', './assets/svg/exhibit_outdoor_small1.svg', { scale: 2 });
    this.load.svg('exhibit_outdoor_small2', './assets/svg/exhibit_outdoor_small2.svg', { scale: 1 });

    // this.load.svg('bitmap_heart', 'assets/svg/mario_heart.svg')
    // this.load.svg('mario_pipe', 'assets/svg/mario_pipe.svg')

    this.load.svg('mario_star', 'assets/svg/mario_star.svg');
    this.load.svg('music_quarter_note', 'assets/svg/music_note_quarter_note.svg');

    this.load.svg('metro_train_grey', 'assets/svg/metro_train_grey.svg');
    this.load.svg('yellow_diamond_location_image', 'assets/svg/geleRuit.svg');
    this.load.svg('blue_sail_location_image', 'assets/svg/blauwZeil.svg');
    // create a hitArea for locations, as an image with key 'enterButtonHitArea', 128x128pix
    this.createHitAreaLocations();

    // create a generic artFrame for later use wit image key eg "artFrame_512"
    this.createArtFrame('512');
    this.createArtFrame('128');
    this.createArtFrame('32');

    // debug test image square
    this.load.svg('test_image_square', 'https://upload.wikimedia.org/wikipedia/commons/d/de/TestScreen_square.svg');

    // back to ARTWORLD world portal
    this.load.image('artWorldPortal', './assets/world_robot_torquoise/portaal_robot_terug.png');

    // RobotWorld
    this.load.image('robotWorldPortal', './assets/world_robot_torquoise/portaal_robot_zonderAnimatie.png');

    this.load.image('robot_treeC_01', './assets/world_robot_torquoise/treeC_01.png');
    this.load.image('robot_treeC_02', './assets/world_robot_torquoise/treeC_02.png');
    this.load.image('robot_treeC_03', './assets/world_robot_torquoise/treeC_03.png');
    this.load.image('robot_treeC_04', './assets/world_robot_torquoise/treeC_04.png');
    this.load.image('robothuis3_ms', './assets/world_robot_torquoise/robothuis3_ms.png');
    this.load.image('robothuis1_ms', './assets/world_robot_torquoise/robohuis01metschadow.png');
    this.load.image('robothuis1_ms', './assets/world_robot_torquoise/robohuis01metschadow.png');
    this.load.image('Robot_Clap_NoAnimation', './assets/world_robot_torquoise/_Robot_Clap_NoAnimation.png');

    // FireWorld
    this.load.image('fireWorldPortal', './assets/world_fireworld/Portal_vuur_Naartoe_zonderAnimatie.png');
    this.load.image('artWorldPortalFire', './assets/world_fireworld/Portal_vuur_Terug.png');
    this.load.image('lavafall_boy', './assets/world_fireworld/lavafall_boy.png');
    this.load.image('tree1_vuur_licht', './assets/world_fireworld/tree1_vuur_licht.png');
    this.load.image('tree2_vuur_licht', './assets/world_fireworld/tree2_vuur_licht.png');
    this.load.image('tree3_vuur_licht', './assets/world_fireworld/tree3_vuur_licht.png');
    this.load.image('vulcano1_kleur_helder', './assets/world_fireworld/vulcano1_kleur_helder.png');
    this.load.image('vulkan2', './assets/world_fireworld/vulkan2.png');
    this.load.image('vuur_wereld_Lavameer01', './assets/world_fireworld/vuur_wereld_Lavameer01.png');
    // this.load.image('tree1_vuur__geenlicht', './assets/world_fireworld/tree1_vuur__geenlicht.png');

    // SlimeWorld
    // this.load.image('bubbleface1_frontlayer_slime', './assets/world_slime_world/bubbleface1_frontlayer_slime.png');
    // this.load.image('bubbleface1_LayerBackground_slime', './assets/world_slime_world/bubbleface1_LayerBackground_slime.png');
    this.load.image('bubbleface1_slime', './assets/world_slime_world/bubbleface1_slime.png');
    this.load.image('bubbleplant1_slime', './assets/world_slime_world/bubbleplant1_slime.png');
    this.load.image('bubbleplant2_slime', './assets/world_slime_world/bubbleplant2_slime.png');
    this.load.image('bubbleplant3_slime', './assets/world_slime_world/bubbleplant3_slime.png');
    this.load.image('bubbleplant4_slime', './assets/world_slime_world/bubbleplant4_slime.png');
    this.load.image('cantarella_tree_1_slime', './assets/world_slime_world/cantarella_tree_1_slime.png');
    this.load.image('cantarella_tree_2_slime', './assets/world_slime_world/cantarella_tree_2_slime.png');
    this.load.image('cantarella_tree_3_slime', './assets/world_slime_world/cantarella_tree_3_slime.png');
    this.load.image('cantarella_tree_4_slime', './assets/world_slime_world/cantarella_tree_4_slime.png');
    this.load.image('cantarella_tree_5_slime', './assets/world_slime_world/cantarella_tree_5_slime.png');
    this.load.image('cantarella_tree_6_slime', './assets/world_slime_world/cantarella_tree_6_slime.png');
    this.load.image('cantarella_tree_7_slime', './assets/world_slime_world/cantarella_tree_7_slime.png');
    this.load.image('rups_slime', './assets/world_slime_world/rups_slime.png');
    this.load.image('slimepool_1_slime', './assets/world_slime_world/slimepool_1_slime.png');

    this.load.image('slimeWorldPortal', './assets/world_slime_world/Portal_goHome_slime.png');
    this.load.image('artWorldPortalSlime', './assets/world_slime_world/Portal_goSlime_slime.png');
  }

  async create() {
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
    frame.fillRect(0, 0, this.artDisplaySize + (frameBorderSize * 2), this.artDisplaySize + (frameBorderSize * 2)).setVisible(false);
    frame.fillStyle(0xffffff);
    frame.fillRect(frameBorderSize, frameBorderSize, this.artDisplaySize, this.artDisplaySize).setVisible(false);

    // create renderTexture to place the dot on
    const artFrameRendertexture = this.add.renderTexture(0, 0, this.artDisplaySize + (frameBorderSize * 2), this.artDisplaySize + (frameBorderSize * 2)).setVisible(false);

    // draw the dot on the renderTexture
    artFrameRendertexture.draw(frame);

    // save the rendertexture with a key ('dot'), basically making an image out of it
    artFrameRendertexture.saveTexture(`artFrame_${postFix}`);
    // this.add.image(0, 0, 'artFrame_512').setVisible(false) // .setOrigin(0)

    frame.destroy();
    artFrameRendertexture.destroy();
  }

  update() {
    if (this.loadingDone) this.scene.start('GameOnboarding');
  } // end update
}
