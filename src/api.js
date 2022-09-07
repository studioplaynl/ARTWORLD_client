/* eslint-disable prefer-destructuring */
/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
import { get } from 'svelte/store';
import { push, querystring } from 'svelte-spa-router';
import { client } from './nakama.svelte';
import {
  Success, Session, Profile, Error,
} from './session';
import {
  PERMISSION_READ_PRIVATE,
  PERMISSION_READ_PUBLIC,
  STOPMOTION_MAX_FRAMES,
  DEFAULT_PREVIEW_HEIGHT,
} from './constants';
import { dlog } from './routes/game/helpers/DebugLog';
// import ManageSession from './routes/game/ManageSession';

export async function login(email, _password) {
  const loginPromise = new Promise((resolve, reject) => {
    setLoader(true);
    const create = false;
    client
      .authenticateEmail(email, _password, create)
      .then(async (response) => {
        const session = response;
        Session.set(session);
        await getAccount();
        push(`/game?${get(querystring)}`);
        setLoader(false);
        resolve(session);
      })
      .catch((err) => {
        if (
          parseInt(err.status, 10) === 404
          || parseInt(err.status, 10) === 401
        ) {
          Error.set('invalid username');
          push(`/login?${get(querystring)}`);
        } else {
          Error.set(`Unknown error, status ${err.status}`);
          push(`/login?${get(querystring)}`);
        }
        // dlog('error in login, returning null');
        setLoader(false);
        reject();
      });
  });
  return loginPromise;
}

export const logout = async () => {
  try {
    await client.sessionLogout(get(Session));
  } catch (err) {
    dlog('Failed logging out on server!', err);
  } finally {
    Profile.set(null);
    /** Setting Session to null automatically redirects you to login route */
    Session.set(null);
  }
};

export async function checkLoginExpired() {
  const session = get(Session);
  // dlog('login: check status', session, session.expires_at);
  if (session != null) {
    const expired = parseInt(`${session.expires_at}000`, 10) > Date.now();
    // dlog('login: expired: ', expired);
    return expired;
  }
  return null;
}

export async function restoreSession() {
  const session = get(Session);

  if (session) {
    await client
      .sessionRefresh(session)
      .then((newSession) => {
        Session.set(newSession);
      })
      .catch((...args) => {
        dlog('sessionRefresh failed', args);
        logout();
        // Session.set(null);
        // Profile.set(null);
      });
  }
}

export async function uploadImage(
  name,
  type,
  img,
  status,
  version,
  displayName,
) {
  const [jpegURL, jpegLocation] = await getUploadURL(
    type,
    name,
    'png',
    version,
  );
  const value = { url: jpegLocation, version, displayname: displayName };
  const pub = status || status === PERMISSION_READ_PUBLIC;

  // FIXME: Why are we converting between 2/1 pub status and booleans?
  // if (status || status === 2) {
  //   pub = true;
  // } else {
  //   pub = false;
  // }

  await fetch(jpegURL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: img,
  });

  await updateObject(type, name, value, pub);
  return value.url;
}

export async function sessionCheck() {
  const payload = {};
  const rpcid = 'SessionCheck';
  const session = get(Session);
  await client.rpc(session, rpcid, payload);
  // eslint-disable-next-line no-console
  // dlog('sessionCheck result', response);
}

export async function updateTitle(collection, key, name, userID) {
  const session = get(Session);
  const profile = get(Profile);
  const uid = userID || session.user_id;
  const Object = await getObject(collection, key, uid);
  Object.value.displayname = name;
  if (profile.meta.Role === 'admin' || profile.meta.Role === 'moderator') {
    await updateObject(
      collection,
      key,
      Object.value,
      Object.permission_read,
      userID,
    );
  } else {
    await updateObject(collection, key, Object.value, Object.permission_read);
  }
}

export async function uploadHouse(data) {
  const type = 'home';
  const profile = get(Profile);
  const name = profile.meta.Azc || 'Amsterdam';
  const object = await getObject(type, name);

  // eslint-disable-next-line prefer-const
  let value = !object ? {} : object.value;
  value.username = profile.username;
  if (!value.version) value.version = 0;
  else value.version += 1;
  if (value.version > value.LastVersion) {
    value.LastVersion = value.version;
  }

  const makePublic = true;

  const [jpegURL, jpegLocation] = await getUploadURL(
    'home',
    'current',
    'png',
    value.version,
  );

  await fetch(jpegURL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: data,
  });

  value.url = jpegLocation;
  // get object
  // dlog('value', value);
  await updateObject(type, name, value, makePublic);

  return value.url;
}

export async function getUploadURL(type, name, filetype, version) {
  const filename = `${version}_${name}.${filetype}`;
  const payload = { type, filename };
  const session = get(Session);
  const rpcid = 'upload_file';
  const fileurl = await client.rpc(session, rpcid, payload);

  return [fileurl.payload.url, fileurl.payload.location];
}

/** Update a user object on server
 * @param {string} type   Catagory of data (Nakama: collection)
 * @param {string} name   Unique ID of object (Nakama: key)
 * @param {any} value     Value (object or string)
 * @param {boolean} pub   Public read permission
 * @param {string} userID User ID
 */
export async function updateObject(type, name, value, pub, userID) {
  Success.set(null);

  const session = get(Session);
  const profile = get(Profile);

  // if user is admin/moderator and userID
  const uid = userID || session.user_id;

  // "2" refers to Public Read permission
  // "1" refers to Owner Write permission
  const permission = pub ? PERMISSION_READ_PUBLIC : PERMISSION_READ_PRIVATE;

  // Value to store
  const storeValue = typeof value === 'string' ? JSON.parse(value) : value;

  if (profile.meta.Role === 'admin' || profile.meta.Role === 'moderator') {
    await updateObjectAdmin(uid, type, name, storeValue, permission);
  } else {
    const object = {
      collection: type,
      key: name,
      value,
      permission_read: permission,
      // "version": "*"
    };
    // const objectIDs =
    client.writeStorageObjects(session, [object]);
    // console.info('Stored objects: %o', objectIDs);
    Success.set(true);

    return object;
  }
  return '';
}

export async function listObjects(type, userID, lim) {
  const session = get(Session);
  const limit = lim || 100;
  // TODO: Figure out why pagination does not work (cors issue?)
  // const offset = page * limit || null;
  const objects = await client.listStorageObjects(session, type, userID, limit); // , offset);
  // dlog('listObjects result: ', objects);
  return objects.objects;
}

export async function getObject(collection, key, userID) {
  const session = get(Session);
  const user_id = userID || session.user_id;

  const objects = await client.readStorageObjects(session, {
    object_ids: [
      {
        collection,
        key,
        user_id,
      },
    ],
  });
  return objects.objects[0];
}

export async function listAllObjects(type, id) {
  const payload = { type, id };
  const rpcid = 'list_all_storage_object';
  const session = get(Session);
  const objects = await client.rpc(session, rpcid, payload);
  // objects.payload.forEach(object => {
  //   object.value = JSON.parse(object.value)
  // });
  return objects.payload;
}

export async function getAccount(id) {
  const session = get(Session);
  let user;

  // dlog('getAccount called, id = ', id, 'Session = ', session);

  if (!id) {
    // No id given, gets own account
    const account = await client.getAccount(session);
    user = account.user;
    user.meta = JSON.parse(user.metadata);
    user.url = await convertImage(
      user.avatar_url,
      DEFAULT_PREVIEW_HEIGHT,
      DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
      'png',
    );
    Profile.set(user);
  } else {
    // With id: get account of other user

    const users = await client.getUsers(session, [id]);
    user = users.users[0];
    user.meta = typeof user.metadata === 'string'
      ? JSON.parse(user.metadata)
      : user.metadata;
    user.url = await convertImage(
      user.avatar_url,
      DEFAULT_PREVIEW_HEIGHT,
      DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
      'png',
    );
  }

  return user;
}

// TODO: hier verder
export async function getFullAccount(id) {
  const rpcid = 'get_full_account';
  const session = get(Session);

  let payload = {};
  if (id) {
    payload = { id };
  }

  const user = await client.rpc(session, rpcid, payload);
  // dlog(user);

  return user.payload;
}

export async function setFullAccount(id, username, password, email, metadata) {
  const session = get(Session);
  const payload = {
    id,
    username,
    password,
    email,
    metadata,
  };
  const rpcid = 'set_full_account';
  const user = await client.rpc(session, rpcid, payload);
  // dlog(user)
  Success.set(true);
  return user.payload;
}

// getAvatar only works reliably via the getAccount call
export async function getAvatar(avatar_url) {
  return getFile(avatar_url);
}

export async function setAvatar(avatar_url) {
  const session = get(Session);
  await client.updateAccount(session, {
    avatar_url,
  });
  const Image = await convertImage(
    avatar_url,
    DEFAULT_PREVIEW_HEIGHT,
    DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
    'png',
  );
  // Profile.update((n) => { n.url = Image; return n });
  getAccount();
  Success.set(true);
  setLoader(false);
  return Image;
}

export async function setHome(Home_url) {
  const type = 'home';
  const profile = get(Profile);
  const name = profile.meta.Azc || 'Amsterdam';
  const object = await getObject(type, name);
  const makePublic = true;

  // eslint-disable-next-line prefer-const
  let value = !object ? {} : object.value;

  value.url = Home_url;
  // get object
  // dlog('value', value);
  await updateObject(type, name, value, makePublic);

  return value.url;
}

export async function getFile(file_url) {
  const session = get(Session);
  const payload = { url: file_url };
  let url;
  const rpcid = 'download_file';
  await client
    .rpc(session, rpcid, payload)
    .then((fileurl) => {
      url = fileurl.payload.url;
      // dlog("url")
      // dlog(url)
      return url;
    })
    .catch(() => {
      dlog('fail');
      return '';
    });
  return url;
}

export async function uploadAvatar(data) {
  const profile = get(Profile);
  setLoader(true);
  let avatarVersion = Number(profile.avatar_url.split('/')[2].split('_')[0]) + 1;
  if (!avatarVersion) avatarVersion = 0;
  const [jpegURL, jpegLocation] = await getUploadURL(
    'avatar',
    'current',
    'png',
    avatarVersion,
  );
  // dlog(jpegURL);

  await fetch(jpegURL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: data,
  });

  // get meta

  // update avatar version
  const session = get(Session);
  await client.updateAccount(session, {
    avatar_url: jpegLocation,
  });
  // CurrentApp.set(''); <--- uitgezet, zou via URL moeten werken?
  await convertImage(
    jpegLocation,
    DEFAULT_PREVIEW_HEIGHT,
    DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
    'png',
  );
  // Profile.update((n) => { n.url = Image; return n });
  getAccount();
  Success.set(true);
  setLoader(false);
  return jpegLocation;
}

export async function deleteFile(type, file, user) {
  const payload = { type, name: file, user };
  const session = get(Session);
  const rpcid = 'delete_file';
  await client.rpc(session, rpcid, payload).catch((e) => {
    throw e;
  });
  Success.set(true);
}

export async function addFriend(id, usernames) {
  const session = get(Session);
  let friends = usernames;
  let user_id = id;
  if (typeof user_id === 'string') {
    if (user_id) {
      user_id = [user_id];
    } else {
      user_id = undefined;
    }
  }
  if (typeof friends === 'string') {
    if (friends) {
      friends = [friends];
    } else {
      friends = undefined;
    }
  }
  await client
    .addFriends(session, user_id, friends)
    .then(() => {
      Success.set(true);
    })
    .catch((err) => {
      throw err;
    });
}

export async function removeFriend(id, usernames) {
  let friends = usernames;
  let user_id = id;

  const session = get(Session);
  if (typeof user_id === 'string') {
    if (user_id) {
      user_id = [user_id];
    } else {
      user_id = undefined;
    }
  }
  if (typeof friends === 'string') {
    if (friends) {
      friends = [friends];
    } else {
      friends = undefined;
    }
  }
  await client
    .deleteFriends(session, user_id, friends)
    .then(() => {
      Success.set(true);
    })
    .catch((err) => {
      throw err;
    });
}

export async function ListFriends() {
  const session = get(Session);
  const friends = await client.listFriends(session);
  return friends;
}

export async function ListAllUsers() {
  const session = get(Session);
  const payload = {};
  const rpcid = 'get_all_users';
  const users = await client.rpc(session, rpcid, payload);
  return users.payload;
}

export async function ListAllArt(page, ammount) {
  const session = get(Session);
  const payload = { page, ammount };
  const rpcid = 'get_all_art';
  const users = await client.rpc(session, rpcid, payload);
  return users.payload;
}

export async function deleteObject(collection, key) {
  const session = get(Session);
  await client.deleteStorageObjects(session, {
    object_ids: [
      {
        collection,
        key,
      },
    ],
  });
  // console.info('Deleted objects.');
  Success.set(true);
  return true;
}

/** Update a Nakama object
 * @param {string} id     User ID
 * @param {string} type   Catagory of data (Nakama: collection)
 * @param {string} name   Unique ID of object (Nakama: key)
 * @param {any} value     Value (object or string)
 * @param {number} pub    Permissions (read/write)
 */
export async function updateObjectAdmin(id, type, name, value, pub) {
  const session = get(Session);
  const storeValue = typeof value === 'object' ? JSON.stringify(value) : value;
  const payload = {
    id,
    type,
    name,
    storeValue,
    pub,
  };

  const rpcid = 'create_object_admin';
  const result = await client.rpc(session, rpcid, payload);

  // dlog('Maybe a typo? ', result.payload.status, result.payload.status === 'success');
  if (result.payload.status === 'succes') {
    Success.set(true);
  } else {
    Error.set(result.payload.status);
  }
  return result.payload;
}

export async function deleteObjectAdmin(id, type, name) {
  const session = get(Session);
  const payload = { id, type, name };

  const rpcid = 'delete_object_admin';
  const user = await client.rpc(session, rpcid, payload);
  // dlog(user);
  // dlog('Maybe a typo? ', user.payload.status, user.payload.status === 'success');
  if (user.payload.status !== 'succes') throw user.payload.status;
  else Success.set(true);
  return user.payload;
}

// ..................... image converter ................................
// usage:
// path = "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/blauwslang.jpeg"
// width = "64"
// format = "png"

export async function convertImage(path, height, width, format) {
  const session = get(Session);

  const payloadHeight = typeof height === 'undefined' ? DEFAULT_PREVIEW_HEIGHT.toString() : width.toString();
  const payloadWidth = typeof width === 'undefined' ? payloadHeight : width.toString();
  const payloadFormat = typeof format === 'undefined' ? 'png' : format;
  const payload = {
    path,
    height: payloadHeight,
    width: payloadWidth,
    format: payloadFormat,
  };

  const rpcid = 'convert_image';
  const user = await client.rpc(session, rpcid, payload);
  if (!user.payload.url) Error.set("couldn't convert image");
  return user.payload.url;
}


export function setLoader(state) {
  dlog('setLoader to ... ', state);
  if (state) {
    document.getElementById('loader').classList.remove('hide');
  } else {
    document.getElementById('loader').classList.add('hide');
  }
  return state;
}

export async function getRandomName() {
  let value;
  await fetch('/assets/woordenlijst.json')
    .then((res) => res.json())
    .then((out) => {
      const dier = out.dier[Math.floor(Math.random() * out.dier.length)];
      const kleur = out.kleur[Math.floor(Math.random() * out.kleur.length)];
      value = kleur + dier;
    })
    .catch((err) => dlog(err));
  return value;
}

export async function sendMailToUser(userId, data) {
  const profile = get(Profile);
  const payload = { userId, ...data, username: profile.username };
  const rpcid = 'send_artpiece';
  const session = get(Session);
  await client.rpc(session, rpcid, payload);
  // eslint-disable-next-line no-console
  // dlog('sessionCheck result', response);
  Success.set(true);
}

export async function listAllNotifications() {
  const session = get(Session);
  const result = await client.listNotifications(session, 100);

  return result;
}

export async function getAllHouses(location, user_id) {
  const Sess = get(Session);
  const payload = { location, user_id };
  const rpcid = 'get_all_houses_object';
  const object = await client.rpc(Sess, rpcid, payload);
  return object.payload;
}
