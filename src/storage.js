// Storage & communcatie tussen Server en App

import { get, writable } from 'svelte/store';
import {
  Session, Profile, Error, Succes,
} from './session.js';
import { deleteObject, updateObject, listAllObjects } from './api';

//  Achievements of a user
const achievementsStore = writable([]);

export const Achievements = {

  subscribe: achievementsStore.subscribe,
  set: achievementsStore.set,
  update: achievementsStore.update,

  create: (key, value) => {
    const localAchievements = get(achievementsStore);
    if (localAchievements.find((element) => element.key === key)) return;
    const obj = { key, value };
    updateObject('achievements', key, value, true).then(() => {
      localAchievements.push(obj);
      achievementsStore.set(localAchievements);
      return localAchievements;
    });
  },

  get: () => {
    const localAchievements = get(achievementsStore);
    const Sess = get(Session);
    if (!!localAchievements && localAchievements.length > 0) return localAchievements;

    if (Sess) {
      listAllObjects('achievements', Sess.user_id).then((serverAchievements) => {
        achievementsStore.set(serverAchievements);
        return serverAchievements;
      });
    } return null;
  },

  find: (key) => {
    const localAchievements = get(achievementsStore);
    const i = localAchievements.findIndex((element) => element.key === key);
    if (i > -1) return localAchievements[i].value;
    return undefined;
  },

  delete: (key) => {
    achievementsStore.update((localAchievements) => {
      const itemNum = localAchievements.findIndex((element) => element.key === key);
      if (itemNum === -1) return localAchievements;

      deleteObject('achievements', key);

      const updatedAchievements = localAchievements.filter((element) => element.key !== key);
      return updatedAchievements;
    });
  },
};

// Stores whatever a user has liked
const likedStore = writable([]);

export const Liked = {

  subscribe: likedStore.subscribe,
  set: likedStore.set,
  update: likedStore.update,

  create: (key, value) => {
    const likedArray = get(likedStore);

    // If a user already liked something, don't like it again
    if (likedArray.find((element) => element.key === key)) return;

    const obj = { key, value };
    updateObject('liked', key, value, true).then(() => {
      likedArray.push(obj);
      Liked.set(likedArray);
      return likedArray;
    });
  },

  get: () => {
    const localLikedArray = get(likedStore);
    const Sess = get(Session);
    if (!!localLikedArray && localLikedArray.length > 0) {
      return localLikedArray;
    }

    if (Sess) {
      listAllObjects('liked', Sess.user_id).then((serverLikedArray) => {
        Liked.set(serverLikedArray);
        return serverLikedArray;
      });
    }
    return null;
  },

  find: (key) => {
    const likedArray = get(likedStore);
    const i = likedArray.findIndex((element) => element.key === key);
    if (i > -1) return likedArray[i].value;
    return undefined;
  },

  delete: (key) => {
    likedStore.update((likedItems) => {
      const itemNum = likedItems.findIndex((element) => element.key === key);
      if (itemNum === -1) return likedItems;

      deleteObject('liked', key);

      return likedItems.filter((element) => element.key !== key);
    });
  },
};

// Stores contacts of user
const addressBookStore = writable([]);

export const Addressbook = {

  subscribe: addressBookStore.subscribe,
  set: addressBookStore.set,
  update: addressBookStore.update,

  get: () => {
    const localAddressbookArray = get(Addressbook);

    const Sess = get(Session);
    if (!!localAddressbookArray && localAddressbookArray.length > 0) {
      return localAddressbookArray;
    }
    if (Sess) {
      listAllObjects('addressbook', Sess.user_id).then((serverAddressbookArray) => {
        Addressbook.set(serverAddressbookArray);
        return serverAddressbookArray;
      });
    }
    return null;
  },

  create: (key, value) => {
    const addressbookArray = get(Addressbook);
    if (addressbookArray.find((element) => element.key === key)) return;
    const obj = { key, value };
    updateObject('addressbook', key, value, true).then(() => {
      addressbookArray.push(obj);
      Addressbook.set(addressbookArray);
      return addressbookArray;
    });
  },

  delete: (key) => {
    Addressbook.update((addresses) => {
      const itemNum = addresses.findIndex((element) => element.value.user_id === key);
      if (itemNum === -1) return addresses;
      deleteObject('addressbook', key);
      return addresses.filter((element) => element.key !== key);
    });
  },
};
