export const PERMISSION_READ_PRIVATE = 1;
export const PERMISSION_READ_PUBLIC = 2;


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
