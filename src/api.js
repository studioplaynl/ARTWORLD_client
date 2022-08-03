/* eslint-disable prefer-destructuring */
/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
import { get } from 'svelte/store';
import { client } from './nakama.svelte';
import {
  Session, Profile, Error, Succes, CurrentApp,
} from './session';

export let url; // TODO @linjoe Is this required? Maybe should be a store?
export let user; // What?
export async function login(email, _password) {
  setLoader(true);
  const create = false;
  client.authenticateEmail(email, _password, create)
    .then(async (response) => {
      const session = response;
      // console.log("login, after authenticateEmail, session= ",session)
      Session.set(session);
      await getAccount();
      window.location.href = '/#/';
      setLoader(false);
      return session;
    })
    .catch((err) => {
      if (err.status === 404) {
        Error.set('invalid username');
      }
      if (err.status === 401) {
        Error.set('invalid password');
      } else Error.set(`Unknown error, status ${err.status}`);
    });
}

export const logout = () => {
  Session.set(null);
  Profile.set(null);
  window.location.href = '/#/login';
  window.history.go(0);
};

export async function checkLogin(session) {
  if (session != null) {
    if ((`${session.expires_at}000`) <= Date.now()) {
      logout();
      window.location.href = '/#/login';
      window.history.go(0);
      Error.set('Please relogin');
    }
  }
}

export async function uploadImage(name, type, img, status, version, displayName) {
  const [jpegURL, jpegLocation] = await getUploadURL(type, name, 'png', version);
  const value = { url: jpegLocation, version, displayname: displayName };
  const pub = (status || status === 2);

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
  const response = await client.rpc(session, rpcid, payload);
  // eslint-disable-next-line no-console
  console.log(response);
}

export async function updateTitle(collection, key, name, userID) {
  const session = get(Session);
  const profile = get(Profile);
  const uid = userID || session.user_id;
  const Object = await getObject(collection, key, uid);
  Object.value.displayname = name;
  if (profile.meta.Role === 'admin' || profile.meta.Role === 'moderator') {
    await updateObject(collection, key, Object.value, Object.permission_read, userID);
  } else {
    await updateObject(collection, key, Object.value, Object.permission_read);
  }
}

export async function uploadHouse(data) {
  const type = 'home';
  const profile = get(Profile);
  const name = profile.meta.Azc;
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

  const [jpegURL, jpegLocation] = await getUploadURL('home', 'current', 'png', value.version);

  await fetch(jpegURL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: data,
  });

  value.url = jpegLocation;
  // get object
  // console.log('value', value);
  await updateObject(type, name, JSON.stringify(value), makePublic);

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
  Succes.set(null);

  const session = get(Session);
  const profile = get(Profile);

  // if user is admin/moderator and userID
  const uid = userID || session.user_id;

  // "2" refers to Public Read permission
  // "1" refers to Owner Write permission
  const permission = pub ? 2 : 1;

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
    const objectIDs = await client.writeStorageObjects(session, [
      object,
    ]);
    console.info('Stored objects: %o', objectIDs);
    Succes.set(true);
  }
}

export async function listObjects(type, userID, lim) {
  const session = get(Session);
  const limit = lim || 100;
  // TODO: Figure out why pagination does not work (cors issue?)
  // const offset = page * limit || null;
  const objects = await client.listStorageObjects(session, type, userID, limit);// , offset);
  // console.log('listObjects result: ', objects);
  return objects.objects;
}

export async function getObject(collection, key, userID) {
  const session = get(Session);
  const user_id = userID || session.user_id;

  const objects = await client.readStorageObjects(session, {
    object_ids: [{
      collection,
      key,
      user_id,
    }],
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

  if (!id) {
    // No id given, gets own account
    const account = await client.getAccount(session);
    user = account.user;
    user.meta = JSON.parse(user.metadata);
    user.url = await convertImage(user.avatar_url, '128', '1000', 'png');
    Profile.set(user);
  } else {
    // With id: get account of other user

    const users = await client.getUsers(session, [id]);
    user = users.users[0];
    user.meta = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
    user.url = await convertImage(user.avatar_url, '128', '1000', 'png');
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
  // console.log(user);

  return user.payload;
}

export async function setFullAccount(id, username, password, email, metadata) {
  const session = get(Session);
  const payload = {
    id, username, password, email, metadata,
  };
  const rpcid = 'set_full_account';
  const user = await client.rpc(session, rpcid, payload);
  // console.log(user)
  Succes.set(true);
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
  const Image = await convertImage(avatar_url, '128', '1000', 'png');
  // Profile.update((n) => { n.url = Image; return n });
  getAccount();
  Succes.set(true);
  setLoader(false);
  return Image;
}

export async function getFile(file_url) {
  const session = get(Session);
  const payload = { url: file_url };
  let url;
  const rpcid = 'download_file';
  await client.rpc(session, rpcid, payload)
    .then((fileurl) => {
      url = fileurl.payload.url;
      // console.log("url")
      // console.log(url)
      return url;
    })
    .catch(() => {
      console.log('fail');
      return '';
    });
  return url;
}

export async function uploadAvatar(data, json) {
  const profile = get(Profile);
  setLoader(true);
  let avatarVersion = Number(profile.avatar_url.split('/')[2].split('_')[0]) + 1;
  if (!avatarVersion) avatarVersion = 0;
  const [jpegURL, jpegLocation] = await getUploadURL('avatar', 'current', 'png', avatarVersion);
  console.log(jpegURL);

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
  CurrentApp.set('');
  const Image = await convertImage(jpegLocation, '128', '1000', 'png');
  // Profile.update((n) => { n.url = Image; return n });
  getAccount();
  Succes.set(true);
  setLoader(false);
  return jpegLocation;
}

export async function deleteFile(type, file, user) {
  const payload = { type, name: file, user };
  const session = get(Session);
  const rpcid = 'delete_file';
  const fileurl = await client.rpc(session, rpcid, payload)
    .catch((e) => { throw e; });
  Succes.set(true);
}

export async function addFriend(id, usernames) {
  const session = get(Session);
  if (typeof id === 'string') {
    if (id) {
      id = [id];
    } else {
      id = undefined;
    }
  }
  if (typeof usernames === 'string') {
    if (usernames) {
      usernames = [usernames];
    } else {
      usernames = undefined;
    }
  }
  await client.addFriends(session, id, usernames)
    .then((status) => {
      Succes.set(true);
    })
    .catch((err) => {
      throw err;
    });
}

export async function removeFriend(id, usernames) {
  const session = get(Session);
  if (typeof id === 'string') {
    if (id) {
      id = [id];
    } else {
      id = undefined;
    }
  }
  if (typeof usernames === 'string') {
    if (username) {
      usernames = [usernames];
    } else {
      usernames = undefined;
    }
  }
  await client.deleteFriends(session, id, usernames)
    .then((status) => {
      Succes.set(true);
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
    object_ids: [{
      collection,
      key,
    }],
  });
  console.info('Deleted objects.');
  Succes.set(true);
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
    id, type, name, storeValue, pub,
  };

  const rpcid = 'create_object_admin';
  const result = await client.rpc(session, rpcid, payload);

  if (result.payload.status === 'succes') {
    Succes.set(true);
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
  // console.log(user);
  if (user.payload.status !== 'succes') throw user.payload.status;
  else Succes.set(true);
  return user.payload;
}

// ..................... image converter ................................
// usage:

// path = "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/blauwslang.jpeg"
// size = "64"
// format = "png"

export async function convertImage(path, height, width, format) {
  const session = get(Session);
  const payload = {
    path, height, width, format,
  };
  const rpcid = 'convert_image';
  const user = await client.rpc(session, rpcid, payload);
  if (!user.payload.url) Error.set("couldn't convert image");
  return user.payload.url;
}

// export async function validate(string, type) {
//   // Regex for Valid Characters i.e. Alphabets, Numbers and Space.
//   let regex = new RegExp(/[^A-Za-z -@0-9]/g);
//   if (type == 'special') regex = /^[^\W|_]+$/g;
//   if (type == 'phone') regex = '';
//   if (type == 'email') regex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

//   if (type == 'password') {
//     regex = /^[^]{8,15}$/g;
//     password = string;
//     console.log(`pass${password}`);
//   }

//   console.log(regex);
//   console.log(string);
//   let valid = regex.test(string);
//   console.log(valid);

//   if (type == 'repeatpassword') {
//     repeatpassword = string;
//     console.log(password);
//     console.log(repeatpassword);
//     if (repeatpassword == password) valid = true;
//     else valid = false;
//   }
//   console.log(input);
//   if (input) {
//     if (valid) {
//       input.path[0].style.border = '0px';
//     } else {
//       input.path[0].style.border = '1px solid red';
//     }
//   }
//   return valid;
// }

export function setLoader(state) {
  if (state) {
    document.getElementById('loader').classList.remove('hide');
  } else {
    document.getElementById('loader').classList.add('hide');
  }
}
