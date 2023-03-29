export const CONFIG = {
  WIDTH: window.innerWidth * window.devicePixelRatio,
  HEIGHT: window.innerHeight * window.devicePixelRatio,
};

/** version info: date time of push and branch name */
export const APP_VERSION_INFO = '#2023-MRT-28 18:41 DEVELOP#';
/** List of Scenes a user may navigate to */
export const SCENE_INFO = [
  {
    scene: 'DefaultUserHome',
    sizeX: 6000,
    sizeY: 2000,
  },
  {
    scene: 'Location1',
    sizeX: 3000,
    sizeY: 3000,
  },
  {
    scene: 'Location3',
    sizeX: 1320,
    sizeY: 1320,
  },
  {
    scene: 'Location4',
    sizeX: 3000,
    sizeY: 3000,
  },
  {
    scene: 'Artworld',
    sizeX: 6000,
    sizeY: 6000,
  },
  {
    scene: 'ChallengeAnimalGarden',
    sizeX: 4000,
    sizeY: 1200,
  },
  {
    scene: 'ChallengeFlowerField',
    sizeX: 3000,
    sizeY: 2000,
  },
  {
    scene: 'BlueSail',
    sizeX: 5500,
    sizeY: 5500,
  },
  {
    scene: 'GreenSquare',
    sizeX: 5500,
    sizeY: 5500,
  },
  {
    scene: 'RedStar',
    sizeX: 5500,
    sizeY: 5500,
  },

  {
    scene: 'TurquoiseTriangle',
    sizeX: 5500,
    sizeY: 5500,
  },
  {
    scene: 'YellowDiamond',
    sizeX: 5500,
    sizeY: 5500,
  },
  {
    scene: 'FireWorld',
    sizeX: 5500,
    sizeY: 5500,
  },
  {
    scene: 'RobotWorld',
    sizeX: 5500,
    sizeY: 5500,
  },
  {
    scene: 'SlimeWorld',
    sizeX: 5500,
    sizeY: 5500,
  },
  {
    scene: 'MarsWorld',
    sizeX: 5500,
    sizeY: 5500,
  },
  {
    scene: 'UnderwaterWorld',
    sizeX: 5500,
    sizeY: 5500,
  },
  {
    scene: 'SeaWorld',
    sizeX: 5500,
    sizeY: 5500,
  },
  {
    scene: 'CloudWorld',
    sizeX: 5500,
    sizeY: 5500,
  },
  {
    scene: 'FruitWorld',
    sizeX: 5500,
    sizeY: 5500,
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

export const DEFAULT_SCENE = 'Artworld';
export const DEFAULT_HOME = 'DefaultUserHome';
export const DEFAULT_ZOOM = 0.8;
export const ZOOM_MIN = 0.2;
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

export const DEFAULT_PREVIEW_HEIGHT = 150;
export const STOPMOTION_BASE_SIZE = 1024;
export const STOPMOTION_MAX_FRAMES = 12;
export const STOPMOTION_FPS = 5;


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

export const ARTWORK_TYPES = ['stopmotion', 'drawing'];
