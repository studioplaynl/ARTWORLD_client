/* eslint-disable camelcase */
/* eslint-disable prefer-destructuring */
// Storage & communcatie tussen Server en App

import { get, writable } from 'svelte/store';
import { Session } from './session';
import {
  deleteObject,
  updateObject,
  listAllObjects,
  listObjects,
  convertImage,
  deleteObjectAdmin,
  deleteFile,
} from './api';
import {
  PERMISSION_READ_PUBLIC, PERMISSION_READ_PRIVATE,
} from './constants';

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

console.log('Now defining convertPromise OUTSIDE the store');

const convertPromise = new Promise((convertResolve) => {
  setTimeout(() => {
    console.log('This is the convertPromise kicking off OUTSIDE the store');
    convertResolve();
  }, 100);
  // const existingArtworks = get(artworksStore);

  // loadedArt.forEach(async (item, index) => {
  //   const existingArtwork = existingArtworks.find((artwork) => artwork.key === item.key);
  //   const outdatedArtwork = (!!existingArtwork && (existingArtwork?.update_time !== item?.update_time));
  //   const artwork = item;

  //   // console.log('updatePreviewUrls', artwork, !artwork.value.outdatedArtwork);

  //   // Only get a fresh URL if no previewUrl is available or when it has been updated
  //   if (!artwork.value.previewUrl || outdatedArtwork) {
  //     if (artwork.value.url) {
  //       artwork.url = artwork.value.url.split('.')[0];
  //     }
  //     convertImage(
  //       artwork.value.url,
  //       '150',
  //       '1000',
  //       'png',
  //     ).then((val) => {
  //       artwork.value.previewUrl = val;
  //       console.log('artwork.url', artwork.url, 'artwork.value.previewUrl', artwork.value.previewUrl);
  //       // console.log('artwork.value.previewUrl nu: ', artwork.value.previewUrl);
  //       loadedArt[index] = artwork;

  //       console.log('loadedArt:', loadedArt, 'artwork.url', artwork.url, 'artwork.value.previewUrl', artwork.value.previewUrl);

  //       if (index === loadedArt.length - 1) {
  //         console.log('resolving convertPromise');
  //         resolve();
  //       }
  //     });
  //   }
  // });
});

console.log('Now done defining convertPromise OUTSIDE the store');

// Stores Artworks of user
const artworksStore = writable([]);

export const ArtworksStore = {

  subscribe: artworksStore.subscribe,
  set: artworksStore.set,
  update: artworksStore.update,

  loadArtworks: async (id, limit) => {
    const types = ['drawing', 'video', 'audio', 'stopmotion', 'picture'];
    const typePromises = [];
    let loadedArt = [];




    types.forEach((type) => {
      // One promise per type..
      typePromises.push(new Promise((resolveType) => {
        // A promise to load objects from the server
        const loadPromise = new Promise((resolveLoad) => {
          if (limit !== undefined) {
            listAllObjects(type, id).then((loaded) => resolveLoad(loaded));
          } else {
            listObjects(type, id, limit).then((loaded) => resolveLoad(loaded));
          }
        });


        loadPromise.then((loaded) => {
          // Add to the loadedArt array
          console.log('Add to loadedArt', ...loaded);
          loadedArt = [...loadedArt, ...loaded];
        }).then(() => {
          // TODO: Maybe add some sorting?
          // Resolve promise for this type
          console.log('resolveType for ', type);
          resolveType();
        });
      }));
    });



    console.log({ typePromises });

    // After all typePromises fulfilled, set data into store
    Promise.all([...typePromises, convertPromise]).then((results) => {
      console.log('all type promises settled', results);

      // if (results.length) {
      //   convertPromise.then(() => {
      // console.log('convertPromise settled, setting loadedArt', loadedArt);
      artworksStore.set(loadedArt);
      // });
      // }
    });
  },

  getArtwork(key) {
    return artworksStore.find((artwork) => artwork.key === key);
  },

  // async updatePreviewUrls(artworks) {

  // },

  updateState: (row, state) => {
    const {
      collection, key, value, user_id,
    } = row;

    // Update on server
    value.status = state;
    const pub = false;
    updateObject(collection, key, value, pub, user_id);

    // Update store
    artworksStore.update((artworks) => {
      const artworksToUpdate = artworks;
      const artworkIndex = artworks.findIndex((i) => i.key === key);
      if (artworkIndex) {
        artworksToUpdate[artworkIndex].value.status = state;
      }
      return [...artworksToUpdate];
    });
  },

  updatePublicRead: async (row, publicRead) => {
    const {
      collection, key, value, user_id,
    } = row;

    // Update on server
    await updateObject(collection, key, value, publicRead, user_id);

    // Update on store
    artworksStore.update((artworks) => {
      const artworksToUpdate = artworks;
      const artworkIndex = artworks.findIndex((artwork) => artwork.key === key);
      if (artworkIndex > -1) {
        artworksToUpdate[artworkIndex].permission_read = publicRead ? PERMISSION_READ_PUBLIC : PERMISSION_READ_PRIVATE;
      }
      return [...artworksToUpdate];
    });
  },

  delete: (row, role) => {
    const {
      collection, key, user_id,
    } = row;

    // Remove from server
    if (role === 'admin' || role === 'moderator') {
      deleteObjectAdmin(user_id, collection, key);
    } else {
      deleteFile(collection, key, user_id);
    }

    // Remove from store
    artworksStore.update((artworks) => artworks.filter((artwork) => artwork.key !== key));
  },
};
