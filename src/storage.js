/* eslint-disable camelcase */
/* eslint-disable prefer-destructuring */
// Storage & communcatie tussen Server en App

import { get, writable } from 'svelte/store';
import { Session, Profile } from './session';
import {
  deleteObject,
  updateObject,
  listAllObjects,
  listObjects,
  convertImage,
  deleteObjectAdmin,
  deleteFile,
  getObject,
} from './helpers/nakamaHelpers';
import {
  PERMISSION_READ_PUBLIC,
  MODERATOR_LIKED_ID,
  STOPMOTION_MAX_FRAMES,
  DEFAULT_PREVIEW_HEIGHT,
} from './constants';
import { dlog } from './helpers/debugLog';

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
        console.log('liked user', serverLikedArray);
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
    dlog('delete: ', key);
    likedStore.update((likedItems) => {
      const itemNum = likedItems.findIndex((element) => element.key === key);
      if (itemNum === -1) return likedItems;

      deleteObject('liked', key);

      return likedItems.filter((element) => element.key !== key);
    });
  },
};

// Stores whatever a user has liked
const moderatorLikedStore = writable([]);

export const ModeratorLiked = {

  subscribe: likedStore.subscribe,
  set: moderatorLikedStore.set,
  get: () => {
    const localLikedArray = get(moderatorLikedStore);

    if (!!localLikedArray && localLikedArray.length > 0) {
      return localLikedArray;
    }


    listAllObjects('liked', MODERATOR_LIKED_ID).then((serverLikedArray) => {
      ModeratorLiked.set(serverLikedArray);
      console.log('liked mod', serverLikedArray);
      return serverLikedArray;
    });

    return null;
  },

  find: (key) => {
    const likedArray = get(moderatorLikedStore);
    const i = likedArray.findIndex((element) => element.key === key);
    if (i > -1) return likedArray[i].value;
    return undefined;
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

// Stores one type of Artwork
export function createArtworksStore(type) {
  const store = writable([]);
  return {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,

    async loadArtworks(id, limit) {
      const typePromises = [];
      let loadedArt = [];

      // One promise per type..
      typePromises.push(new Promise((resolveType) => {
        // A promise to load objects from the server
        const loadPromise = new Promise((resolve) => {
          if (limit !== undefined) {
            listAllObjects(type, id).then((loaded) => resolve(loaded));
          } else {
            listObjects(type, id, limit).then((loaded) => resolve(loaded.objects));
          }
        });

        // Objects were loaded, so update the preview URLs
        loadPromise
          .then(async (loaded) => {
            // Execute a Promise in order to update preview URLS
            this.updatePreviewUrls(loaded).then((updatedLoaded) => {
              // Add the updated artworks to the loadedArt array
              loadedArt = [...loadedArt, ...updatedLoaded];
              // Resolve the Promise for this type
              resolveType();
            });
          });
      }));

      // After all typePromises fulfilled, set data into store
      Promise.all(typePromises).then(() => {
        store.set(loadedArt);
      });
    },

    /** Get a single Artwork by Key */
    getArtwork: (key) => store.find((artwork) => artwork.key === key),

    updateState: (row, state) => {
      const {
        collection, key, value, user_id,
      } = row;

      // Update on server
      value.status = state;
      const pub = false;
      updateObject(collection, key, value, pub, user_id);

      // Update store
      store.update((artworks) => {
        const artworksToUpdate = artworks;
        const artworkIndex = artworks.findIndex((i) => i.key === key);
        if (artworkIndex) {
          artworksToUpdate[artworkIndex].value.status = state;
        }
        return [...artworksToUpdate];
      });
    },

    /** Update the public read status of an Artwork
     * @param row SvelteTable row
     * @param publicRead New read status
    */
    updatePublicRead: async (row, publicRead) => {
      const {
        collection, key, value, user_id,
      } = row;

      // Update on server
      await updateObject(collection, key, value, publicRead, user_id);

      // Update on store
      store.update((artworks) => {
        const artworksToUpdate = artworks;
        const artworkIndex = artworks.findIndex((artwork) => artwork.key === key);
        if (artworkIndex > -1) {
          artworksToUpdate[artworkIndex].permission_read = publicRead;
        }
        return [...artworksToUpdate];
      });
    },

    /** Update the Preview URLs for images that are new, or have been updated
   * @param artworks Array of artworks (plain JS)
   * @return {Promise} A Promise that resolves an updated array of artworks that includes the
  */
    updatePreviewUrls: (artworks) => new Promise((resolvePreviewUrls) => {
      const artworksToUpdate = artworks;
      const existingArtworks = get(store);
      const updatePromises = [];

      artworksToUpdate.forEach(async (item, index) => {
      // Check if artwork already existed, and if so, is it was outdated
        const existingArtwork = existingArtworks.find((artwork) => artwork.key === item.key);
        const outdatedArtwork = (!!existingArtwork && (existingArtwork?.update_time !== item?.update_time));
        const artwork = item;
        artwork.permission_read = artwork.permission_read === PERMISSION_READ_PUBLIC;

        // Only get a fresh URL if no previewUrl is available or when it has been updated
        if (!artwork.value.previewUrl || outdatedArtwork) {
          if (artwork.value.url) {
            artwork.url = artwork.value.url.split('.')[0];
          }

          // Prepare a promise per update that resolves after setting the
          updatePromises.push(new Promise((resolveUpdatePromise) => {
            convertImage(
              artwork.value.url,
              DEFAULT_PREVIEW_HEIGHT,
              DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
              'png',
            ).then((val) => {
            // Set the previewUrl value, update the array
              artwork.value.previewUrl = val;
              artworksToUpdate[index] = artwork;

              // Then resolve this updatePromise
              resolveUpdatePromise(val);
            });
          }));
        }
      });

      // Resolve all updatePromises and resolve the main Promise
      // Note: updatePromises may be an empty array too, in that case the Promise gets resolved immediately
      Promise.all(updatePromises).then(() => {
        resolvePreviewUrls(artworksToUpdate);
      });
    }),
    /** Delete an Artwork
     * @param row SvelteTable row
     * @param {string} role User role
    */
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
      store.update((artworks) => artworks.filter((artwork) => artwork.key !== key));
    },
  };
}

// Usage example for creating different type-specific stores
export const DrawingArtworksStore = createArtworksStore('drawing');
export const VideoArtworksStore = createArtworksStore('video');
export const AudioArtworksStore = createArtworksStore('audio');

// Stores Artworks of user
const artworksStore = writable([]);

export const ArtworksStore = {

  subscribe: artworksStore.subscribe,
  set: artworksStore.set,
  update: artworksStore.update,

  /** Load artworks of a specific user
 * @param id User ID
 * @param limit Limit the results from the server
 */
  loadArtworks: async (id, limit) => {
    const typePromises = [];
    let loadedArt = [];

    const types = ['drawing', 'video', 'audio', 'stopmotion', 'picture', 'animalchallenge', 'flowerchallenge'];

    types.forEach(async (type) => {
      // One promise per type..
      typePromises.push(new Promise((resolveType) => {
        // A promise to load objects from the server
        const loadPromise = new Promise((resolve) => {
          if (limit !== undefined) {
            listAllObjects(type, id).then((loaded) => resolve(loaded));
          } else {
            listObjects(type, id, limit).then((loaded) => resolve(loaded.objects));
          }
        });


        // Objects were loaded, so update the preview URLs
        loadPromise
          .then(async (loaded) => {
            // Execute a Promise in order to update preview URLS
            ArtworksStore.updatePreviewUrls(loaded).then((updatedLoaded) => {
              // Add the updated artworks to the loadedArt array
              loadedArt = [...loadedArt, ...updatedLoaded];
              // Resolve the Promise for this type
              resolveType();
            });
          });
      }));
    });

    // After all typePromises fulfilled, set data into store
    Promise.all(typePromises).then(() => {
      artworksStore.set(loadedArt);
    });
  },

  /** Get a single Artwork by Key */
  getArtwork: (key) => artworksStore.find((artwork) => artwork.key === key),

  /** Update the Preview URLs for images that are new, or have been updated
   * @param artworks Array of artworks (plain JS)
   * @return {Promise} A Promise that resolves an updated array of artworks that includes the
  */
  updatePreviewUrls: (artworks) => new Promise((resolvePreviewUrls) => {
    const artworksToUpdate = artworks;
    const existingArtworks = get(artworksStore);
    const updatePromises = [];

    artworksToUpdate.forEach(async (item, index) => {
      // Check if artwork already existed, and if so, is it was outdated
      const existingArtwork = existingArtworks.find((artwork) => artwork.key === item.key);
      const outdatedArtwork = (!!existingArtwork && (existingArtwork?.update_time !== item?.update_time));
      const artwork = item;
      artwork.permission_read = artwork.permission_read === PERMISSION_READ_PUBLIC;

      // Only get a fresh URL if no previewUrl is available or when it has been updated
      if (!artwork.value.previewUrl || outdatedArtwork) {
        if (artwork.value.url) {
          artwork.url = artwork.value.url.split('.')[0];
        }

        // Prepare a promise per update that resolves after setting the
        updatePromises.push(new Promise((resolveUpdatePromise) => {
          convertImage(
            artwork.value.url,
            DEFAULT_PREVIEW_HEIGHT,
            DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
            'png',
          ).then((val) => {
            // Set the previewUrl value, update the array
            artwork.value.previewUrl = val;
            artworksToUpdate[index] = artwork;

            // Then resolve this updatePromise
            resolveUpdatePromise(val);
          });
        }));
      }
    });

    // Resolve all updatePromises and resolve the main Promise
    // Note: updatePromises may be an empty array too, in that case the Promise gets resolved immediately
    Promise.all(updatePromises).then(() => {
      resolvePreviewUrls(artworksToUpdate);
    });
  }),

  /** Update the state (trashed/regular) of an Artwork
   * @param row SvelteTable row
   * @param state
  */
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

  /** Update the public read status of an Artwork
   * @param row SvelteTable row
   * @param publicRead New read status
  */
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
        artworksToUpdate[artworkIndex].permission_read = publicRead;
      }
      return [...artworksToUpdate];
    });
  },

  /** Delete an Artwork
   * @param row SvelteTable row
   * @param {string} role User role
  */
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



const avatarsStore = writable([]);
export const AvatarsStore = {

  subscribe: avatarsStore.subscribe,
  set: avatarsStore.set,
  update: avatarsStore.update,

  list: () => get(avatarsStore),

  getCurrent: () => {
    const allAvatars = get(avatarsStore);
    const currentAvatar = get(Profile).avatar_url;
    const current = allAvatars.find((avatar) => avatar.value.url === currentAvatar);
    // dlog('current avatar: ', current);
    return current;
  },

  loadAvatars: async (id, limit) => {
    // A promise to load objects from the server
    const loadPromise = new Promise((resolve) => {
      if (limit !== undefined) {
        listAllObjects('avatar', id).then((loaded) => {
          resolve(loaded);
        });
      } else {
        listObjects('avatar', id, limit).then((loaded) => {
          resolve(loaded.objects);
        });
      }
    });


    // Objects were loaded, so update the preview URLs
    loadPromise
      .then(async (loaded) => {
        // Execute a Promise in order to update preview URLS
        AvatarsStore.updatePreviewUrls(loaded).then((updatedLoaded) => {
          // Add the updated artworks to the loadedArt array
          avatarsStore.set(updatedLoaded);
        });
      });
  },

  /** Update the Preview URLs for images that are new, or have been updated
   * @param artworks Array of artworks (plain JS)
   * @return {Promise} A Promise that resolves an updated array of artworks that includes the
  */
  updatePreviewUrls: (avatars) => new Promise((resolvePreviewUrls) => {
    const avatarsToUpdate = avatars;
    const existingAvatars = get(avatarsStore);
    const updatePromises = [];

    avatarsToUpdate.forEach(async (item, index) => {
      // Check if avatar already existed, and if so, is it was outdated
      const existingAvatar = existingAvatars.find((avatar) => avatar.key === item.key);
      const outdatedAvatar = (!!existingAvatar && (existingAvatar?.update_time !== item?.update_time));
      const avatar = item;

      // Only get a fresh URL if no previewUrl is available or when it has been updated
      if (!avatar.value.previewUrl || outdatedAvatar) {
        if (avatar.value.url) {
          avatar.url = avatar.value.url.split('.')[0];
        }

        // Prepare a promise per update that resolves after setting the
        updatePromises.push(new Promise((resolveUpdatePromise) => {
          convertImage(
            avatar.value.url,
            DEFAULT_PREVIEW_HEIGHT,
            DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
            'png',
          ).then((val) => {
            // Set the previewUrl value, update the array
            avatar.value.previewUrl = val;
            avatarsToUpdate[index] = avatar;

            // Then resolve this updatePromise
            resolveUpdatePromise(val);
          });
        }));
      }
    });

    // Resolve all updatePromises and resolve the main Promise
    // Note: updatePromises may be an empty array too, in that case the Promise gets resolved immediately
    Promise.all(updatePromises).then(() => {
      resolvePreviewUrls(avatarsToUpdate);
    });
  }),


  /** Delete an Avatar
   * @param row SvelteTable row
   * @param {string} role User role
  */
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
    avatarsStore.update((avatars) => avatars.filter((avatar) => avatar.key !== key));
  },
};



/** Contains the house object of current player */
export const myHomeStore = writable({ url: '' });


export const myHome = {

  subscribe: myHomeStore.subscribe,
  set: myHomeStore.set,
  update: myHomeStore.update,

  create: async (Home_url) => {
    const type = 'home';
    const profile = get(Profile);
    const name = profile.meta.Azc;
    const object = await getObject(type, name);
    const makePublic = true;

    // eslint-disable-next-line prefer-const
    let value = !object ? {} : object.value;

    value.url = Home_url;
    // get object
    // dlog('value', value);
    const returnedObject = await updateObject(type, name, value, makePublic);
    returnedObject.url = await convertImage(returnedObject.value.url, DEFAULT_PREVIEW_HEIGHT, DEFAULT_PREVIEW_HEIGHT);

    myHome.set(returnedObject);
    return value.url;
  },

  get: async () => {
    let localHome = get(myHomeStore);
    const profile = get(Profile);
    dlog('profile: ', profile);
    const Sess = get(Session);
    if (!!localHome && localHome.length > 0) return localHome;

    if (Sess) {
      try {
        // check for meta.azc because for a while there was a server bug that
        // would return azc and role instead of Azc and Role
        let profileAzc = '';
        if (profile.meta.Azc) {
          profileAzc = profile.meta.Azc;
        } else if (profile.meta.azc) {
          profileAzc = profile.meta.azc;
        } else {
          profileAzc = 'GreenSquare';
        }
        // dlog('profileAzc: ', profileAzc);

        localHome = await getObject(
          'home',
          profileAzc,
          Sess.user_id,
        );
      } catch (err) {
        dlog('cannot get home: ', err); // TypeError: failed to fetch
      }
      // dlog('getting the localHome.url', localHome);
      localHome.url = await convertImage(localHome.value.url, DEFAULT_PREVIEW_HEIGHT, DEFAULT_PREVIEW_HEIGHT);
      // dlog('localHome', localHome);

      myHome.set(localHome);
    } return localHome;
  },
};
