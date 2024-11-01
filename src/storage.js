// Storage & communcatie tussen Server en App

import { get, writable, derived } from 'svelte/store';
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
  OBJECT_STATE_REGULAR,
  OBJECT_STATE_UNDEFINED,
  OBJECT_STATE_IN_TRASH,
} from './constants';

import { dlog } from './helpers/debugLog';

export const miniMapDimensions = writable({ x: 0, y: 0 });

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

  // returns a promise that can be resolved with .then(result => { ... })
  get: () =>
    new Promise((resolve, reject) => {
      const localAchievements = get(achievementsStore);
      const Sess = get(Session);

      if (localAchievements && localAchievements.length > 0) {
        resolve(localAchievements);
        return;
      }

      if (Sess) {
        listAllObjects('achievements', Sess.user_id)
          .then((serverAchievements) => {
            achievementsStore.set(serverAchievements);
            resolve(serverAchievements);
          })
          .catch((err) => reject(err));
      } else {
        reject(new Error('No session data available.'));
      }
    }),

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
    dlog('create like: ', key);
    const likedArray = get(likedStore);

    // If a user already liked something, don't like it again
    dlog('key already exists: ', key, value);
    if (likedArray.find((element) => element.key === key)) return;

    const obj = { key, value };
    updateObject('liked', key, value, true).then(() => {
      likedArray.push(obj);
      Liked.set(likedArray);
      return likedArray;
    });
  },

  get: async () => {
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
    dlog('delete: ', key);
    likedStore.update((likedItems) => {
      const itemNum = likedItems.findIndex((element) => element.key === key);
      if (itemNum === -1) return likedItems;

      deleteObject('liked', key);

      return likedItems.filter((element) => element.key !== key);
    });
  },
};

// All HomeElements of a Home
export const homeElements_Store = writable({
  drawing: {
    byKey: {}, // e.g., { "key1": [element1, element2, element3], "key2": [element4, element5] }
  },
  stopmotion: {
    byKey: {},
  },
});

// The selected homeElement in Home of Self
export const homeElement_Selected = writable({});

export const HomeElements = {
  subscribe: homeElements_Store.subscribe,
  set: homeElements_Store.set,
  organize: (elements, updateStore = true) => {
    const organized = elements.reduce(
      (acc, element) => {
        const collection = element.value.collection;
        const key = element.value.key;

        // Initialize collection if it doesn't exist
        if (!acc[collection]) {
          acc[collection] = { byKey: {} };
        }

        // Initialize key array if it doesn't exist
        if (!acc[collection].byKey[key]) {
          acc[collection].byKey[key] = [];
        }

        // Add element to its key group
        acc[collection].byKey[key].push(element);

        return acc;
      },
      {
        drawing: { byKey: {} },
        stopmotion: { byKey: {} },
      }
    );

    // Sort elements within each collection's key groups by update_time
    Object.keys(organized).forEach((collection) => {
      Object.keys(organized[collection].byKey).forEach((key) => {
        organized[collection].byKey[key].sort((a, b) => new Date(b.update_time) - new Date(a.update_time));
      });
    });

    if (updateStore) {
      homeElements_Store.set(organized);
    }

    return organized;
  },

  create: (key, value) => {
    const newKey = key + '_' + new Date().getTime();
    const obj = { key: newKey, collection: 'homeElement', value };

    // Add to store
    const currentElements = HomeElements.getAllFlat();
    currentElements.push(obj);
    HomeElements.organize(currentElements);

    // Update server
    updateObject('homeElement', newKey, value, true).then(() => {
      dlog('HomeElements.create server side done ');
      homeElement_Selected.set(obj);
    });

    return obj;
  },

  updateStoreSilently: (key, newValue) => {
    const currentElements = HomeElements.getAllFlat();
    currentElements.forEach((element) => {
      if (element.key === key) {
        element.value = newValue;
      }
    });
    // Call organize with updateStore = false
    HomeElements.organize(currentElements, false);
    // Update store directly without triggering subscribers
    // homeElements_Store.set(organized, false);
  },

  getFromServer: async (key) => {
    const serverHomeElementsArray = await listAllObjects('homeElement', key);
    HomeElements.organize(serverHomeElementsArray);
    return serverHomeElementsArray;
  },

  showContent: () => {
    return get(homeElements_Store);
  },

  find: (key) => {
    const store = get(homeElements_Store);
    for (const collection of ['drawing', 'stopmotion']) {
      const keyGroup = store[collection]?.byKey[key];
      if (keyGroup?.[0]) {
        return keyGroup[0].value;
      }
    }
    return undefined;
  },

  delete: (key) => {
    dlog('delete: ', key);
    const currentElements = HomeElements.getAllFlat();
    const filteredElements = currentElements.filter((element) => element.key !== key);

    if (currentElements.length !== filteredElements.length) {
      deleteObject('homeElement', key);
      HomeElements.organize(filteredElements);
    }
  },

  // Helper methods for accessing organized data
  getUnique: (collection) => {
    const store = get(homeElements_Store);
    return Object.values(store[collection]?.byKey || {}).map((group) => group[0]);
  },

  getDuplicates: (collection) => {
    const store = get(homeElements_Store);
    return Object.values(store[collection]?.byKey || {}).flatMap((group) => group.slice(1));
  },

  getDuplicatesByKey: (collection, key) => {
    const store = get(homeElements_Store);
    const keyGroup = store[collection]?.byKey[key];
    return keyGroup ? keyGroup.slice(1) : [];
  },

  getUniqueByKey: (collection, key) => {
    const store = get(homeElements_Store);
    const keyGroup = store[collection]?.byKey[key];
    return keyGroup ? keyGroup[0] : null;
  },

  getGroupByKey: (collection, key) => {
    const store = get(homeElements_Store);
    return store[collection]?.byKey[key] || [];
  },

  // Helper to get all elements as flat array if needed
  getAllFlat: () => {
    const store = get(homeElements_Store);
    return Object.values(store).flatMap((collection) => Object.values(collection.byKey).flat());
  },
};

// Stores What a moderator has liked, shows up in the game eg behind the balloon
const moderatorLikedStore = writable([]);

export const ModeratorLiked = {
  subscribe: likedStore.subscribe,
  set: moderatorLikedStore.set,
  get: async () => {
    const localLikedArray = get(moderatorLikedStore);

    if (!!localLikedArray && localLikedArray.length > 0) {
      return localLikedArray;
    }

    // Use await to handle the asynchronous server call
    const serverLikedArray = await listAllObjects('liked', MODERATOR_LIKED_ID);
    // console.log('serverLikedArray: ', serverLikedArray);
    // Now that we have the result from the server, set it to the store
    ModeratorLiked.set(serverLikedArray);

    // If the serverLikedArray is empty, then you can decide to either return it or return null
    return serverLikedArray.length > 0 ? serverLikedArray : null;
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

// all the stores, can be referenced as object, so there no data duplication
const stores = {};

/* check if a store exists, give the reference to it otherwise create it
    this is a factory function
    there is no data duplication, because the store is created only once 
*/
export function useArtworksStore(type) {
  if (!stores[type]) {
    stores[type] = createArtworksStore(type);
  }
  return stores[type];
}

/* reactive derived art stores 
it is a derived store from useArtworksStore

that filters the artworks if it is in the trash 
    in a svelte component the store can be used like this:

    const { 
      store: drawingStore, 
      usableArt: usableDrawings, 
      deletedArt: deletedDrawings,
      visibleArt: visibleDrawings
    } = useFilteredArtworksStore('drawing');

    To use the stores
    $: totalDrawings = $drawingStore.length;
    $: activeDrawings = $usableDrawings.length;
    $: trashDrawings = $deletedDrawings.length;

    or directly in the HTML with:
    {#each $usableDrawings as drawing}
    {#each $deletedDrawings as drawing}

    ==== OR IN A ABSTRACT WAY: ================
    const { 
        store, 
        filteredArt, 
        deletedArt,
        visibleArt
    } = useFilteredArtworksStore(dataType);

    ---- then get the content of the store ---
    await store.loadArtworks();
    ==========================================
*/
export function useFilteredArtworksStore(type) {
  const store = useArtworksStore(type);

  // This derived store filters artworks based on their status
  // OBJECT_STATE_REGULAR: Represents a normal, active artwork
  // OBJECT_STATE_UNDEFINED: Represents an artwork with an unspecified status
  // Both of these statuses indicate that the artwork should be included in the filtered list
  const filteredArt = derived(store, ($store) =>
    $store.filter((el) => el.value.status === OBJECT_STATE_REGULAR || el.value.status === OBJECT_STATE_UNDEFINED)
  );

  const deletedArt = derived(store, ($store) => $store.filter((el) => el.value.status === OBJECT_STATE_IN_TRASH));

  const visibleArt = derived(store, ($store) =>
    $store.filter((el) => el.permission_read === 2 || el.permission_read === true)
  );

  const filteredAndVisibleArt = derived(store, ($store) =>
    $store.filter(
      (el) =>
        (el.value.status === OBJECT_STATE_REGULAR || el.value.status === OBJECT_STATE_UNDEFINED) &&
        (el.permission_read === 2 || el.permission_read === true)
    )
  );

  return { type, store, filteredArt, deletedArt, visibleArt, filteredAndVisibleArt };
}

// Stores one type of Artwork
export function createArtworksStore(type) {
  const store = writable([]);
  return {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,

    async loadArtworks(id, limit) {
      // if no id is given, the id of player is used
      if (!id) {
        id = get(Profile).id;
      }

      let loadedArt = [];

      try {
        // Load objects from the server
        const loaded = await this.fetchObjects(type, id, limit);

        // we sort the objects coming back from the server by update_time, so the most recent ones are on top
        loaded.sort((a, b) => new Date(b.update_time) - new Date(a.update_time));

        // Update preview URLs
        const updatedLoaded = await this.updatePreviewUrls(loaded);
        loadedArt = [...updatedLoaded];

        // Set data into store
        store.set(loadedArt);

        return loadedArt;
      } catch (error) {
        console.error('Error loading artworks:', error);
        return [];
      }
    },

    // Helper method to fetch objects
    async fetchObjects(type, id, limit) {
      if (limit !== undefined) {
        return listAllObjects(type, id);
      } else {
        const result = await listObjects(type, id, limit);
        return result.objects;
      }
    },

    /** Get a single Artwork by Key */
    getArtwork: (key) => store.find((artwork) => artwork.key === key),

    restoreFromTrash: (row, state) => {
      const { collection, key, value, user_id } = row;

      // Update on server
      value.status = state;
      const pub = true;
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
      const { collection, key, value, user_id } = row;

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
    updatePreviewUrls: (artworks) =>
      new Promise((resolvePreviewUrls) => {
        const artworksToUpdate = artworks;
        const existingArtworks = get(store);
        const updatePromises = [];

        artworksToUpdate.forEach(async (item, index) => {
          // Check if artwork already existed, and if so, is it was outdated
          const existingArtwork = existingArtworks.find((artwork) => artwork.key === item.key);
          const outdatedArtwork = !!existingArtwork && existingArtwork?.update_time !== item?.update_time;
          const artwork = item;
          artwork.permission_read = artwork.permission_read === PERMISSION_READ_PUBLIC;

          // Only get a fresh URL if no previewUrl is available or when it has been updated
          if (!artwork.value.previewUrl || outdatedArtwork) {
            if (artwork.value.url) {
              artwork.url = artwork.value.url.split('.')[0];
            }

            // Prepare a promise per update that resolves after setting the
            updatePromises.push(
              new Promise((resolveUpdatePromise) => {
                convertImage(
                  artwork.value.url,
                  DEFAULT_PREVIEW_HEIGHT,
                  DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
                  'png'
                ).then((val) => {
                  // Set the previewUrl value, update the array
                  artwork.value.previewUrl = val;
                  artworksToUpdate[index] = artwork;

                  // Then resolve this updatePromise
                  resolveUpdatePromise(val);
                });
              })
            );
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
      const { collection, key, user_id } = row;

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

// from ART store a derived store that show paginated art
// for use in a gallery
export function homeGalleryStore(type, isSelfHome = false) {
  console.log('changed homeGalleryStore: ', type, isSelfHome);
  let store;
  if (isSelfHome) {
    const { filteredAndVisibleArt } = useFilteredArtworksStore(type);
    store = filteredAndVisibleArt;
  } else {
    store = writable([]);
  }

  const defaultPageSize = 3;
  const homeGalleryPageSize = writable(defaultPageSize);
  const homeGalleryCurrentPage = writable(1);

  const homeGalleryVisibleArt = derived(store, ($store) =>
    $store.filter((el) => el.permission_read === 2 || el.permission_read === true)
  );

  const homeGalleryPaginatedArt = derived(
    [homeGalleryVisibleArt, homeGalleryPageSize, homeGalleryCurrentPage],
    ([$visibleArt, $homeGalleryPageSize, $homeGalleryCurrentPage]) => {
      const startIndex = ($homeGalleryCurrentPage - 1) * $homeGalleryPageSize;
      const endIndex = startIndex + $homeGalleryPageSize;
      return $visibleArt.slice(startIndex, endIndex);
    }
  );

  const homeGalleryTotalPages = derived(
    [homeGalleryVisibleArt, homeGalleryPageSize],
    ([$visibleArt, $homeGalleryPageSize]) => Math.ceil($visibleArt.length / $homeGalleryPageSize)
  );

  return {
    subscribe: store.subscribe,

    async loadArtworks(userId, limit) {
      if (isSelfHome) {
        // If it's the user's own home, load artworks from the 'drawing' store
        const { store } = useFilteredArtworksStore(type);
        const storeContent = await store.loadArtworks();
        // const store = useFilteredArtworksStore(type);
        // return get(store);
        return storeContent;
      }

      let loadedArt = [];
      try {
        // Load objects from the server
        const loaded = await this.fetchObjects(type, userId, limit);

        // sort the objects coming from the server new
        loaded.sort((a, b) => new Date(b.update_time) - new Date(a.update_time));

        // Update preview URLs
        const updatedLoaded = await this.updatePreviewUrls(loaded);
        loadedArt = [...updatedLoaded];

        // Set data into store
        store.set(loadedArt);

        return loadedArt;
      } catch (error) {
        console.error('Error loading artworks:', error);
        return [];
      }
    },

    // Helper method to fetch objects
    async fetchObjects(type, userId, limit) {
      if (limit !== undefined) {
        // console.log('type:', type, 'limit:', limit);
        return listAllObjects(type, userId);
      } else {
        // console.log('type:', type, 'limit:', limit);
        const result = await listObjects(type, userId, limit);
        // console.log('result: ', result);
        return result.objects;
      }
    },

    /** Get a single Artwork by Key */
    getArtwork: (key) => get(store).find((artwork) => artwork.key === key),

    updatePreviewUrls: (artworks) =>
      new Promise((resolvePreviewUrls) => {
        const artworksToUpdate = artworks;
        const existingArtworks = get(store);
        const updatePromises = [];

        artworksToUpdate.forEach(async (item, index) => {
          // Check if artwork already existed, and if so, is it was outdated
          const existingArtwork = existingArtworks.find((artwork) => artwork.key === item.key);
          const outdatedArtwork = !!existingArtwork && existingArtwork?.update_time !== item?.update_time;
          const artwork = item;
          artwork.permission_read = artwork.permission_read === PERMISSION_READ_PUBLIC;

          // Only get a fresh URL if no previewUrl is available or when it has been updated
          if (!artwork.value.previewUrl || outdatedArtwork) {
            if (artwork.value.url) {
              artwork.url = artwork.value.url.split('.')[0];
            }

            // Prepare a promise per update that resolves after setting the
            updatePromises.push(
              new Promise((resolveUpdatePromise) => {
                convertImage(
                  artwork.value.url,
                  DEFAULT_PREVIEW_HEIGHT,
                  DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
                  'png'
                ).then((val) => {
                  // Set the previewUrl value, update the array
                  artwork.value.previewUrl = val;
                  artworksToUpdate[index] = artwork;

                  // Then resolve this updatePromise
                  resolveUpdatePromise(val);
                });
              })
            );
          }
        });

        // Resolve all updatePromises and resolve the main Promise
        // Note: updatePromises may be an empty array too, in that case the Promise gets resolved immediately
        Promise.all(updatePromises).then(() => {
          resolvePreviewUrls(artworksToUpdate);
        });
      }),

    homeGalleryVisibleArt,
    homeGalleryPaginatedArt,
    homeGalleryPageSize,
    homeGalleryCurrentPage,
    homeGalleryTotalPages,
    setHomeGalleryPageSize: (size) => homeGalleryPageSize.set(size),
    setHomeGalleryCurrentPage: (page) => homeGalleryCurrentPage.set(page),
    nextHomeGalleryPage: () => homeGalleryCurrentPage.update((n) => Math.min(n + 1, get(homeGalleryTotalPages))),
    prevHomeGalleryPage: () => homeGalleryCurrentPage.update((n) => Math.max(n - 1, 1)),
  };
}

// export concrete instances of Gallery stores, used when visiting a home
// we make one for our own home, and one for other homes
// we make here a central store for reference
// we use it in DefaultUserHome.js and from there in ServerCall.js

export const My_drawing_GalleryStore = homeGalleryStore('drawing', true);
export const Other_drawing_GalleryStore = homeGalleryStore('drawing', false);

export const My_stopmotion_GalleryStore = homeGalleryStore('stopmotion', true);
export const Other_stopmotion_GalleryStore = homeGalleryStore('stopmotion', false);

export const My_bloem_GalleryStore = homeGalleryStore('bloem', true);
export const Other_bloem_GalleryStore = homeGalleryStore('bloem', false);

export const My_dier_GalleryStore = homeGalleryStore('dier', true);
export const Other_dier_GalleryStore = homeGalleryStore('dier', false);

// Usage example for creating different type-specific stores
// export const DrawingArtworksStore = createArtworksStore('drawing');
// export const StopmotionArtworksStore = createArtworksStore('stopmotion');

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
      typePromises.push(
        new Promise((resolveType) => {
          // A promise to load objects from the server
          const loadPromise = new Promise((resolve) => {
            if (limit !== undefined) {
              listAllObjects(type, id).then((loaded) => resolve(loaded));
            } else {
              listObjects(type, id, limit).then((loaded) => resolve(loaded.objects));
            }
          });

          // Objects were loaded, so update the preview URLs
          loadPromise.then(async (loaded) => {
            // Execute a Promise in order to update preview URLS
            ArtworksStore.updatePreviewUrls(loaded).then((updatedLoaded) => {
              // Add the updated artworks to the loadedArt array
              loadedArt = [...loadedArt, ...updatedLoaded];
              // Resolve the Promise for this type
              resolveType();
            });
          });
        })
      );
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
  updatePreviewUrls: (artworks) =>
    new Promise((resolvePreviewUrls) => {
      console.log('updatePreviewUrls');
      const artworksToUpdate = artworks;
      const existingArtworks = get(artworksStore);
      const updatePromises = [];

      artworksToUpdate.forEach(async (item, index) => {
        // Check if artwork already existed, and if so, is it was outdated
        const existingArtwork = existingArtworks.find((artwork) => artwork.key === item.key);
        const outdatedArtwork = !!existingArtwork && existingArtwork?.update_time !== item?.update_time;
        const artwork = item;
        artwork.permission_read = artwork.permission_read === PERMISSION_READ_PUBLIC;

        // Only get a fresh URL if no previewUrl is available or when it has been updated
        if (!artwork.value.previewUrl || outdatedArtwork) {
          if (artwork.value.url) {
            artwork.url = artwork.value.url.split('.')[0];
          }

          // Prepare a promise per update that resolves after setting the
          updatePromises.push(
            new Promise((resolveUpdatePromise) => {
              convertImage(
                artwork.value.url,
                DEFAULT_PREVIEW_HEIGHT,
                DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
                'png'
              ).then((val) => {
                console.log('updatePreviewUrls val: ', val);
                // Set the previewUrl value, update the array
                artwork.value.previewUrl = val;
                artworksToUpdate[index] = artwork;

                // Then resolve this updatePromise
                resolveUpdatePromise(val);
              });
            })
          );
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
  restoreFromTrash: (row, state) => {
    const { collection, key, value, user_id } = row;

    // Update on server
    value.status = state;
    const pub = true;
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
    const { collection, key, value, user_id } = row;

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
    const { collection, key, user_id } = row;

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
    loadPromise.then(async (loaded) => {
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
  updatePreviewUrls: (avatars) =>
    new Promise((resolvePreviewUrls) => {
      const avatarsToUpdate = avatars;
      const existingAvatars = get(avatarsStore);
      const updatePromises = [];

      avatarsToUpdate.forEach(async (item, index) => {
        // Check if avatar already existed, and if so, is it was outdated
        const existingAvatar = existingAvatars.find((avatar) => avatar.key === item.key);
        const outdatedAvatar = !!existingAvatar && existingAvatar?.update_time !== item?.update_time;
        const avatar = item;

        // Only get a fresh URL if no previewUrl is available or when it has been updated
        if (!avatar.value.previewUrl || outdatedAvatar) {
          if (avatar.value.url) {
            avatar.url = avatar.value.url.split('.')[0];
          }

          // Prepare a promise per update that resolves after setting the
          updatePromises.push(
            new Promise((resolveUpdatePromise) => {
              convertImage(
                avatar.value.url,
                DEFAULT_PREVIEW_HEIGHT,
                DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
                'png'
              ).then((val) => {
                // Set the previewUrl value, update the array
                avatar.value.previewUrl = val;
                avatarsToUpdate[index] = avatar;

                // Then resolve this updatePromise
                resolveUpdatePromise(val);
              });
            })
          );
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
    const { collection, key, user_id } = row;

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
    // dlog('profile: ', profile);
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

        localHome = await getObject('home', profileAzc, Sess.user_id);
      } catch (err) {
        dlog('cannot get home: ', err); // TypeError: failed to fetch
      }
      // dlog('getting the localHome.url', localHome);
      localHome.url = await convertImage(localHome.value.url, DEFAULT_PREVIEW_HEIGHT, DEFAULT_PREVIEW_HEIGHT);
      // dlog('localHome', localHome);

      myHome.set(localHome);
    }
    return localHome;
  },
};
