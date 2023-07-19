/* eslint-disable max-len */
import Preloader from '../class/Preloader';
import ManageSession from '../ManageSession';
import { ART_FRAME_BORDER } from '../../../constants';
import Background from '../class/Background';
import ServerCall from '../class/ServerCall';

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
    // this.load.image('bubbleplant3_slime', './assets/world_slime_world/bubbleplant3_slime.png');
    // this.load.image('bubbleplant4_slime', './assets/world_slime_world/bubbleplant4_slime.png');
    this.load.image('cantarella_tree_1_slime', './assets/world_slime_world/cantarella_tree_1_slime.png');
    this.load.image('cantarella_tree_2_slime', './assets/world_slime_world/cantarella_tree_2_slime.png');
    this.load.image('cantarella_tree_3_slime', './assets/world_slime_world/cantarella_tree_3_slime.png');
    this.load.image('cantarella_tree_4_slime', './assets/world_slime_world/cantarella_tree_4_slime.png');
    //  this.load.image('cantarella_tree_5_slime', './assets/world_slime_world/cantarella_tree_5_slime.png');
    this.load.image('cantarella_tree_6_slime', './assets/world_slime_world/cantarella_tree_6_slime.png');
    this.load.image('cantarella_tree_7_slime', './assets/world_slime_world/cantarella_tree_7_slime.png');
    this.load.image('rups_slime', './assets/world_slime_world/rups_slime.png');
    this.load.image('slimepool_1_slime', './assets/world_slime_world/slimepool_1_slime.png');

    this.load.image('artWorldPortalSlime', './assets/world_slime_world/Portal_goHome_slime.png');
    this.load.image('slimeWorldPortal', './assets/world_slime_world/Portal_goSlime_slime.png');

    // MarsWorld
    this.load.image('marsWorldPortal', './assets/world_mars_red/portal_gotoMars_mars.png');
    this.load.image('artWorldPortalMars', './assets/world_mars_red/portal_goHome_mars.png');
    this.load.image('krater_mars', './assets/world_mars_red/krater_mars.png');
    this.load.image('rots1_mars', './assets/world_mars_red/rots1_mars.png');
    this.load.image('rots2_mars', './assets/world_mars_red/rots2_mars.png');
    this.load.image('rots3_mars', './assets/world_mars_red/rots3_mars.png');
    this.load.image('rots4_mars', './assets/world_mars_red/rots4_mars.png');
    this.load.image('rots5_mars', './assets/world_mars_red/rots5_mars.png');
    this.load.image('rots6_mars', './assets/world_mars_red/rots6_mars.png');
    this.load.image('rover_all_one_layer_mars', './assets/world_mars_red/rover_all_one_layer_mars.png');
    this.load.image('ufo_atwork1_mars', './assets/world_mars_red/ufo_atwork1_mars.png');
    this.load.image('ufo_slapend_vloer_mars', './assets/world_mars_red/ufo_slapend_vloer_mars.png');

    // underwaterworld
    this.load.image('artWorldPortalUnderwater', './assets/world_underwater_blue/Portaal_naarhuis_water.png');
    this.load.image('underwaterWorldPortal', './assets/world_underwater_blue/Portaal_naarWater_water.png');

    this.load.image('bubbles_1_water', './assets/world_underwater_blue/bubbles_1_water.png');
    this.load.image('cloud01_water', './assets/world_underwater_blue/cloud01_water.png');
    this.load.image('Inkvis_water', './assets/world_underwater_blue/Inkvis_water.png');
    this.load.image('jellyvis1_water', './assets/world_underwater_blue/jellyvis1_water.png');
    this.load.image('koral_water_01', './assets/world_underwater_blue/koral_water_01.png');
    this.load.image('koral_water_02', './assets/world_underwater_blue/koral_water_02.png');
    this.load.image('koral_water_03', './assets/world_underwater_blue/koral_water_03.png');
    this.load.image('koral_water_04', './assets/world_underwater_blue/koral_water_04.png');
    this.load.image('light1_water', './assets/world_underwater_blue/light1_water.png');
    this.load.image('light_2_water', './assets/world_underwater_blue/light_2_water.png');
    this.load.image('Rif_1_a', './assets/world_underwater_blue/Rif_1_a.png');
    this.load.image('Rif_1_b', './assets/world_underwater_blue/Rif_1_b.png');
    this.load.image('Rif_1_c', './assets/world_underwater_blue/Rif_1_c.png');
    this.load.image('Rif_2_a', './assets/world_underwater_blue/Rif_2_a.png');
    this.load.image('Rif_2_b', './assets/world_underwater_blue/Rif_2_b.png');

    // seaWorld
    this.load.image('artWorldPortalSea', './assets/world_seaworld/zee_ship_Portaal_naarhuis.png');
    this.load.image('seaWorldPortal', './assets/world_seaworld/zee_ship_Portaal_naarZEE.png');

    this.load.image('floating_egg', './assets/world_seaworld/Ei_land_a.png');
    this.load.image('Zeeslang_head', './assets/world_seaworld/Z1_Zeeslang_head.png');
    this.load.image('Zeeslang_tail_B', './assets/world_seaworld/Z2_Zeeslang_midden_B1.png');
    this.load.image('Zeeslang_tail_A', './assets/world_seaworld/Z3_Zeeslang_midden_A2.png');

    this.load.image('Zeeslang_tail_curveB', './assets/world_seaworld/Z4_zeeslang_curve_richtingB.png');
    this.load.image('Zeeslang_tail_curveA', './assets/world_seaworld/Z8_zeeslang_curve_richtingA.png');

    this.load.image('Zeeslang_tail', './assets/world_seaworld/Z10_Zeeslang_start.png');

    this.load.image('zeeRif_1', './assets/world_seaworld/zeeRif_1.png');
    this.load.image('zeeRif_2', './assets/world_seaworld/zeeRif_2.png');
    this.load.image('zeeRif_3', './assets/world_seaworld/zeeRif_3.png');

    // cloudworld
    this.localAssetsCheck = {};
    this.load.image('cloudWorldPortal', './assets/world_clouds/cloud_portal_naarCloud.png');
    let folderPath = './assets/world_clouds/';

    let loadArray = [
      { key: 'artWorldPortalCloud', path: `${folderPath}cloud_portal_naarHome.png` },

      { key: 'cloud_ballonpeople_1b', path: `${folderPath}cloud_ballonpeople_1b.png` },
      { key: 'cloud_ballonpeople_2', path: `${folderPath}cloud_ballonpeople_2.png` },
      { key: 'cloud_ballonpeople_3', path: `${folderPath}cloud_ballonpeople_3.png` },
      { key: 'cloud_ballonpeople_4', path: `${folderPath}cloud_ballonpeople_4.png` },
      { key: 'cloud_berg1', path: `${folderPath}cloud_berg1.png` },
      { key: 'cloud_berg1_tweekeer', path: `${folderPath}cloud_berg1_tweekeer.png` },
      { key: 'cloud_berg2_metCloud_achtergrond', path: `${folderPath}cloud_berg2_metCloud_achtergrond.png` },
      { key: 'cloud_berg3', path: `${folderPath}cloud_berg3.png` },
      { key: 'cloud_berg3_mitWolken', path: `${folderPath}cloud_berg3_mitWolken.png` },
      { key: 'cloud_brug_1', path: `${folderPath}cloud_brug_1.png` },
      { key: 'cloud_brug_2', path: `${folderPath}cloud_brug_2.png` },
      { key: 'cloud_C1', path: `${folderPath}cloud_C1.png` },
      { key: 'cloud_C2_withface', path: `${folderPath}cloud_C2_withface.png` },
      { key: 'cloud_C3', path: `${folderPath}cloud_C3.png` },
      { key: 'cloud_C4', path: `${folderPath}cloud_C4.png` },
      { key: 'cloud_C5', path: `${folderPath}cloud_C5.png` },
      { key: 'cloud_C5_achtergrond', path: `${folderPath}cloud_C5_achtergrond.png` },
      { key: 'cloud_huis_1', path: `${folderPath}cloud_huis_1.png` },
      { key: 'cloud_huis_2', path: `${folderPath}cloud_huis_2.png` },
      { key: 'cloud_huis_3', path: `${folderPath}cloud_huis_3.png` },
      { key: 'cloud_portal_naarCloud', path: `${folderPath}cloud_portal_naarCloud.png` },
    ];

    ServerCall.loadAssetArray(this, loadArray, 'localImage');

    // Moonworld
    this.load.image('artWorldPortalMoon', './assets/world_moon/maan_portalRaket_naarMaan.png');
    // this.localAssetsCheck = {};
    folderPath = './assets/world_moon/';

    loadArray = [
      {
        key: 'maan_KORR_portalRaket_naarHUIS_alleDelen',
        path: `${folderPath}maan_KORR_portalRaket_naarHUIS_alleDelen.png`,
      },
      { key: 'maan_MAAN_a', path: `${folderPath}maan_MAAN_a.png` },
      { key: 'maan_meteoor_metStaart', path: `${folderPath}maan_meteoor_metStaart.png` },
      { key: 'maan_portalRaket_naarHUIS_A', path: `${folderPath}maan_portalRaket_naarHUIS_A.png` },
      { key: 'maan_spaceBubble', path: `${folderPath}maan_spaceBubble.png` },
      { key: 'maan_sputnik_metStaart', path: `${folderPath}maan_sputnik_metStaart.png` },
      { key: 'maan_steren', path: `${folderPath}maan_steren.png` },
    ];

    ServerCall.loadAssetArray(this, loadArray, 'localImage');

    // Pizzaworld
    this.load.image('artWorldPortalPizza', './assets/world_pizza/Portal_naarPizza_pizza.png');

    folderPath = './assets/world_pizza/';
    loadArray = [
      { key: 'Portal_naarHuis_pizza', path: `${folderPath}Portal_naarHuis_pizza.png` },

      { key: 'kaasbrugg_01_pizza', path: `${folderPath}03c_bruggcorrectie_6_6_23.png` },
      { key: 'kaasbrugg_02_pizza', path: `${folderPath}03b_bruggcorrectie_6_6_23.png` },
      { key: 'kaasbrugg_03_pizza', path: `${folderPath}03a_bruggcorrectie_6_6_23.png` },


      { key: 'Slice_Caprese_metTomaatpeople', path: `${folderPath}Slice_Caprese_metTomaatpeople.png` },

      { key: 'pizza_margarita', path: `${folderPath}margarita_00_corr_6_6_23.png` },
      { key: 'pizza_margarita2', path: `${folderPath}margarita_02_correctie_6_6_23.png` },
      { key: 'pizza_margarita3', path: `${folderPath}margarita_01_correctie_6_6_23.png` },

      { key: 'ananasguy', path: `${folderPath}ananasGuy_04_correctie_6_6_23.png` },
      { key: 'basil_2a', path: `${folderPath}basil_2a.png` },
      { key: 'paprika_g1', path: `${folderPath}paprika_g1.png` },
      { key: 'paprika_y1', path: `${folderPath}paprika_y1.png` },
      { key: 'korr_tomaat03_b', path: `${folderPath}korr_tomaat03_b.png` },
    ];

    ServerCall.loadAssetArray(this, loadArray, 'localImage');

    // Underground
    folderPath = './assets/world_underground/';

    this.load.image('artWorldPortalUnderground', `${folderPath}Portal_naarOndergrond.png`);

    loadArray = [
      { key: 'Portal_naarHuis_underground', path: `${folderPath}Portal_naarHuis.png` },

      { key: 'gras_metmieren', path: `${folderPath}gras_metAppel2.png` },
      { key: 'geheel', path: `${folderPath}geheel_noPalettes-fs8.png` },
      { key: 'mier02', path: `${folderPath}mier02.png` },

    ];

    ServerCall.loadAssetArray(this, loadArray, 'localImage');

    // Woestijn
    folderPath = './assets/world_woestijn/';

    this.load.image('artWorldPortalWoestijn', `${folderPath}Portal_woestijn_naarWoestijn-fs8.png`);

    loadArray = [
      { key: 'Portal_naarHuis_woestijn', path: `${folderPath}Portal_woestijn_naarHuis-fs8.png` },

      { key: 'oasis_blauw_01_ring', path: `${folderPath}oasis_blauw 01_ring-fs8.png` },
      { key: 'oasis_blauw_01', path: `${folderPath}oasis_blauw 01-fs8.png` },
      { key: 'oasis_blauw_02', path: `${folderPath}oasis_blauw_02-fs8.png` },

      { key: 'oasis_blauw_03', path: `${folderPath}oasis_blauw_03-fs8.png` },
      { key: 'oasis_blauw_04', path: `${folderPath}oasis_blauw_04-fs8.png` },
      { key: 'pyradmide_01', path: `${folderPath}pyradmide_01-fs8.png` },
      { key: 'pyradmide_02', path: `${folderPath}pyradmide_02-fs8.png` },
      { key: 'pyradmide_03', path: `${folderPath}pyradmide_03-fs8.png` },
      { key: 'pyradmide_GodofWater', path: `${folderPath}pyradmide_GodofWater-fs8.png` },
    ];

    ServerCall.loadAssetArray(this, loadArray, 'localImage');
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
