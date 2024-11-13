export const CONFIG = {
  WIDTH: window.innerWidth * window.devicePixelRatio,
  HEIGHT: window.innerHeight * window.devicePixelRatio,
};

/** List of Scenes a user may navigate to */
export const SCENE_INFO = [
  {
    scene: 'DefaultUserHome',
    sizeX: 4000,
    sizeY: 3000,
  },
  {
    scene: 'Artworld',
    sizeX: 6000,
    sizeY: 6000,
    kind: 'landingScene',
    children: [
      {
        scene: 'ChallengeAnimalGarden',
        sizeX: 4000,
        sizeY: 1200,
        displayName: 'Dieren Tuin',
      },
      {
        scene: 'ChallengeFlowerField',
        sizeX: 3000,
        sizeY: 2000,
        displayName: 'Bloemen Tuin',
      },
      {
        scene: 'BlueSail',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Blauw Zeil Wereld',
      },
      {scene: 'GreenSquare',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Groen Vierkant Wereld',
      },
      {
        scene: 'RedStar',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Rode Ster Wereld',
      },
      {
        scene: 'TurquoiseTriangle',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Turquoise Driehoek Wereld',
      },
      {
        scene: 'YellowDiamond',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Gele Diamant Wereld',
      },
      {
        scene: 'FireWorld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Vuur Wereld',
        portalImage: './assets/world_fireworld/Portal_vuur_Naartoe_zonderAnimatie.png'
      },
      {
        scene: 'RobotWorld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Robot Wereld',
        portalImage: './assets/world_robot_torquoise/portaal_robot_zonderAnimatie.png'
      },
      {
        scene: 'SlimeWorld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Slime Wereld',
        portalImage: './assets/world_slime_world/Portal_goSlime_slime.png'
      },
      {
        scene: 'MarsWorld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Mars Wereld',
        portalImage: './assets/world_mars_red/portal_gotoMars_mars.png'
      },
      {
        scene: 'UnderwaterWorld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Water Wereld',
        portalImage: './assets/world_underwater_blue/Portaal_naarWater_water.png'
      },
      {
        scene: 'SeaWorld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Zee Wereld',
        portalImage: './assets/world_seaworld/zee_ship_Portaal_naarZEE.png'
      },
      {
        scene: 'CloudWorld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Wolken Wereld',
        portalImage: './assets/world_clouds/cloud_portal_naarCloud.png'
      },
      {
        scene: 'MoonWorld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Maan Wereld',
        portalImage: './assets/world_moon/maan_portalRaket_naarMaan.png'
      },
      {
        scene: 'PizzaWorld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Pizza Wereld',
        portalImage: './assets/world_pizza/Portal_naarPizza_pizza.png'
      },
      {
        scene: 'UndergroundWorld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Ondergrondse Wereld',
        portalImage: './assets/world_underground/Portal_naarOndergrond.png'
      },
      {
        scene: 'WoestijnWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Woestijn Wereld',
        portalImage: './assets/world_woestijn/Portal_woestijn_naarWoestijn-fs8.png'
      },
      {
        scene: 'IjscoWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Ijsco Wereld',
        portalImage: './assets/world_ijsco/Portaal_vanHOMEnaarICECREAM_corr-fs8.png'
      },
      {
        scene: 'IjsWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Ijs Wereld',
        portalImage: './assets/world_ice/Portaal_Naar_Ice-fs8.png'
      },
      {
        scene: 'BijenWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Bijen Wereld',
        portalImage: './assets/world_bees/02b_Portaal_home_naar_bee-fs8.png'
      },
      {
        scene: 'BergenWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Bergen Wereld',
        portalImage: './assets/world_bergen/Portaal2_NaarBergen_CROP-fs8.png'
      },
      {
        scene: 'PrismaWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Prisma Wereld',
        portalImage: './assets/world_prism/Portaal_Prisma_naar_PrismaCROP-fs8.png'
      },
      {
        scene: 'JungleWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Jungle Wereld',
        portalImage: './assets/world_jungle/portaal_naarJungle_crop-fs8.png'
      },
      {
        scene: 'FlamengoWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Flamingo Wereld',
        portalImage: './assets/world_flamengo/_Portaal_Flamingocity_naarMeteor_small-fs8.png'
      },
      {
        scene: 'RivierWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Rivier Wereld',
        portalImage: './assets/world_paarse_rivier/02b_portaal_River_naarRivier-fs8.png'
      },
      {
        scene: 'MoerasWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Moeras Wereld',
        portalImage: './assets/world_swamp/02a_portaal_swamp_naarSwamp400px-fs8.png'
      },
      {
        scene: 'SalamanderWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Salamander Wereld',
        portalImage: './assets/world_salamander/portaal_naarSalamanderWereld-fs8.png'
      },
      {
        scene: 'DennenbosWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Dennenbos Wereld',
        portalImage: './assets/world_dennenbos/22_dennenbos_portaal-fs8.png'
      },
      {
        scene: 'VliegendeEilandenWereld',
        sizeX: 5500,
        sizeY: 5500,
        kind: 'homeArea',
        displayName: 'Vliegende Eilanden Wereld',
      },
    ]
  },
];

export const STOCK_HOUSES = [
  'portalBlauw.png',
  'portalDonkerBlauw.png',
  'portalGeel.png',
  'portalGifGroen.png',
  'portalGroen.png',
  'portalRood.png',
  'portalRoze.png',
  'portalZwart.png',
];

export const STOCK_AVATARS = [
  'avatarBlauw.png',
  'avatarGeel.png',
  'avatarGroen.png',
  'avatarPaars.png',
  'avatarRood.png',
  'avatarRoze.png',
];

export const MAX_COUNT_HOME_ELEMENTS_DRAWING = 10;
export const MAX_COUNT_HOME_ELEMENTS_DRAWING_DUPLICATES = 10;
export const MAX_COUNT_HOME_ELEMENTS_STOPMOTION = 10;
export const MAX_COUNT_HOME_ELEMENTS_STOPMOTION_DUPLICATES = 10;
export const MAX_COUNT_HOME_ELEMENTS_ANIMAL_CHALLENGE = 2;
export const MAX_COUNT_HOME_ELEMENTS_ANIMAL_CHALLENGE_DUPLICATES = 4;
export const MAX_COUNT_HOME_ELEMENTS_FLOWER_CHALLENGE = 2;
export const MAX_COUNT_HOME_ELEMENTS_FLOWER_CHALLENGE_DUPLICATES = 4;

export const MINIMAP_SIZE = 100;
export const MINIMAP_MARGIN = 20;

export const ARTWORLD_IP = '193.187.129.8';
export const BETAWORLD_IP = '128.140.42.65';

// export const MODERATOR_LIKED_ID = '6a10eac1-35c9-4f47-acd7-2814e257574b'; /** test account! user4 */
export const MODERATOR_LIKED_ID = '5264dc23-a339-40db-bb84-e0849ded4e68'; // user1 for deployment
export const DEFAULT_SCENE = 'Artworld';
export const DEFAULT_HOME = 'DefaultUserHome';
export const DEFAULT_ZOOM = 0.8;
export const ZOOM_MIN = 0.3;
export const ZOOM_MAX = 3.0;
export const ZOOM_STEP = 0.1;

// art settings
export const ART_FRAME_BORDER = 10;

/** File is readable by user and admins only */
export const PERMISSION_READ_PRIVATE = 1;

/** File is public */
export const PERMISSION_READ_PUBLIC = 2;

/** Base size used for avatars: player and onlinePlayers */
export const AVATAR_BASE_SIZE = 64;
// TODO not sure why this has to be 150 to load player and onlinePlayer spriteSheets correctly
export const AVATAR_SPRITESHEET_LOAD_SIZE = 150;

/** Base size used for artworks */
export const IMAGE_BASE_SIZE = 2048;

export const DEFAULT_PREVIEW_HEIGHT = 80;
export const STOPMOTION_BASE_SIZE = 1024;
export const STOPMOTION_MAX_FRAMES = 12;
export const STOPMOTION_FPS = 5;

export const ART_ICON_SIZE = 64;
export const ART_PREVIEW_SIZE = 128;
export const ART_DISPLAY_SIZE = 256;
export const ART_DISPLAY_SIZE_LARGE = 512;

export const ART_OFFSET_BETWEEN = 10;

/*
0 Users are friends with each other.
1 User A has sent an invitation and pending acceptance from user B.
2 User A has received an invitation but has not accepted yet.
3 User A has banned user B.
*/

export const FRIENDSTATE_FRIENDS = 0;
export const FRIENDSTATE_INVITATION_SENT = 1;
export const FRIENDSTATE_INVITATION_RECEIVED = 2;
export const FRIENDSTATE_BANNED = 3;

/** Object has been deleted */
export const OBJECT_STATE_REGULAR = '';
export const OBJECT_STATE_UNDEFINED = undefined;
export const OBJECT_STATE_IN_TRASH = 'trash';

/** Notification codes */

export const NOTIFICATION_MESSAGE_RECEIVED_WHILE_OFFLINE_OR_NOT_IN_CHANNEL = -1;
export const NOTIFICATION_FRIENDSHIP_REQUEST_RECEIVED = -2;
export const NOTIFICATION_MY_FRIENDSHIP_REQUEST_ACCEPTED = -3;
export const NOTIFICATION_MY_GROUP_REQUEST_ACCEPTED = -4;
export const NOTIFICATION_GROUP_REQUEST_RECEIVED = -5;
export const NOTIFICATION_FRIEND_JOINED_GAME = -6;
export const NOTIFICATION_SOCKET_CLOSED = -7;
export const NOTIFICATION_ARTWORK_LIKE_RECEIVED = 1;
export const NOTIFICATION_ARTWORK_RECEIVED = 2;
export const NOTIFICATION_INVITE_RECEIVED = 3;

/** art apps */
export const ARTWORK_TYPES = ['stopmotion', 'drawing', 'animalchallenge', 'flowerchallenge'];

/** valid apps and some details about them
 *  used for send to
 */
export const APPS = [
  { app: 'game', artType: '', multiFrameDraw: null },
  { app: 'house', artType: 'draw', multiFrameDraw: false },
  { app: 'avatar', artType: 'draw', multiFrameDraw: true },
  { app: 'drawing', artType: 'draw', multiFrameDraw: false },
  { app: 'stopmotion', artType: 'draw', multiFrameDraw: true },
  { app: 'animalchallenge', artType: 'draw', multiFrameDraw: true },
  { app: 'flowerchallenge', artType: 'draw', multiFrameDraw: false },
  { app: 'mariosound', artType: 'sound', multiFrameDraw: null },
  { app: 'achievement', artType: '', multiFrameDraw: null },
  { app: 'likes', artType: '', multiFrameDraw: null },
  { app: 'liked', artType: '', multiFrameDraw: null },
  { app: 'addressbook', artType: '', multiFrameDraw: null },
];

const APP_ICONS = [
  {
    app: 'house',
    iconUrl: '/assets/svg/apps/house-square-app.svg',
    type: 'square',
  },
  { app: 'house', iconUrl: '/assets/SHB/svg/AW-icon-home.svg', type: 'round' },

  {
    app: 'avatar',
    iconUrl: '/assets/svg/apps/avatar2-square-app.svg',
    type: 'square',
  },

  {
    app: 'drawing',
    iconUrl: '/assets/SHB/svg/AW-icon-square-drawing.svg',
    type: 'square',
  },
  { app: 'drawing', iconUrl: 'path/to/house/round.jpg', type: 'round' },

  {
    app: 'stopmotion',
    iconUrl: '/assets/SHB/svg/AW-icon-square-animation.svg',
    type: 'square',
  },
  { app: 'stopmotion', iconUrl: 'path/to/house/round.jpg', type: 'round' },

  {
    app: 'animalchallenge',
    iconUrl: '/assets/svg/apps/animalChallenge-square-app.svg',
    type: 'square',
  },
  {
    app: 'animalchallenge',
    iconUrl: '/assets/svg/apps/animalChallenge-icon.svg',
    type: 'round',
  },

  {
    app: 'flowerchallenge',
    iconUrl: '/assets/svg/apps/flowerChallenge-icon.svg',
    type: 'round',
  },
  {
    app: 'flowerchallenge',
    iconUrl: '/assets/svg/apps/flowerChallenge-square-app.svg',
    type: 'square',
  },

  {
    app: 'musicgeneral',
    iconUrl: '/assets/SHB/svg/AW-icon-square-music.svg',
    type: 'square',
  },
  {
    app: 'musicgeneral',
    iconUrl: '/assets/SHB/svg/AW-icon-sound.svg',
    type: 'round',
  },

  {
    app: 'appgroup',
    iconUrl: '/assets/svg/apps/appsgroup-icon-round.svg',
    type: 'round',
  },
];

export function returnAppIconUrl(appName, type) {
  const icon = APP_ICONS.find((iconFind) => iconFind.app === appName && iconFind.type === type);
  return icon ? icon.iconUrl : '';
}

export function isValidApp(app) {
  return APPS.some((entry) => entry.app === app);
}

export function returnSameTypeApps(targetApp) {
  // Find the target app details
  const appDetails = APPS.find((app) => app.app === targetApp);

  // Check if the app exists
  if (!appDetails) {
    return [];
  }

  // Filter and return the similar apps
  return APPS.filter(
    (app) =>
      app.artType === appDetails.artType && app.multiFrameDraw === appDetails.multiFrameDraw && app.app !== targetApp
  ).map((app) => app.app); // returning only the app names
}

export const DEFAULT_APP = 'game';
