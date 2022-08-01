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
