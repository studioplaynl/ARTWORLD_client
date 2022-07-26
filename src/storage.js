/* eslint-disable no-console */

// Storage & communcatie tussen Server en App

import { get, writable } from 'svelte/store';
import {
  Session, Profile, Error, Succes,
} from './session.js';
import { deleteObject, updateObject, listAllObjects } from './api';

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
    achievementsStore.update((value) => {
      const itemNum = value.findIndex((element) => element.key === key);
      if (itemNum === -1) return value;
      value.splice(itemNum, 1);
      deleteObject('achievements', key);
      return value;
    });
  },
};


function createLiked() {
  const { subscribe, set, update } = writable([]);
  return {

    subscribe,
    set,
    update,

    create: (key, value) => {
      const likedArray = get(Liked);
      console.log('likedArray storage', likedArray);

      if (likedArray.find((element) => element.key == key)) return;
      const obj = { key, value };
      updateObject('liked', key, value, true).then(() => {
        console.log('value', value);

        likedArray.push(obj);
        console.log('likedArray', likedArray);
        console.log('key', key);
        console.log('value', value);
        console.log('obj', obj);
        Liked.set(likedArray);
        return likedArray;
      });
    },
    get: () => {
      const likedArray = get(Liked);
      console.log('likedArray:1', likedArray);
      const Sess = get(Session);
      if (!!likedArray && likedArray.length > 0) {
        console.log('likedArray passed!');
        return likedArray;
      }

      if (Sess) {
        listAllObjects('liked', Sess.user_id).then((likedArray) => {
          console.log('likedArray 2', likedArray);
          Liked.set(likedArray);
          return likedArray;
        });
      }
    },
    find: (key) => {
      const likedArray = get(Liked);
      const i = likedArray.findIndex((element) => element.key == key);
      if (i != -1) return likedArray[i].value;
      return undefined;
    },
    // update: (Item) =>{
    //             updateObject("achievements", Item.name, Item.value, Item.pub).then( (value) =>{
    //                 let ach = get(achievements)
    //                 const itemNum = ach.findIndex((element) => element.name == Item.name)
    //                 ach[itemNum] = Item
    //                 Achievements.set(ach)
    //                 return ach
    //             })

    //         },

    delete: (key) => {
      Liked.update((value) => {
        const itemNum = value.findIndex((element) => element.key == key);
        if (itemNum == -1) return value;
        value.splice(itemNum, 1);
        deleteObject('liked', key);
        return value;
      });
    },

  };
}

export const Liked = createLiked();

function createAddressbook() {
  const { subscribe, set, update } = writable([]);
  return {

    subscribe,
    set,
    update,

    get: () => {
      const addressbookArray = get(Addressbook);

      const Sess = get(Session);
      if (!!addressbookArray && addressbookArray.length > 0) {
        return addressbookArray;
      }
      if (Sess) {
        listAllObjects('addressbook', Sess.user_id).then((addressbookArray) => {
          console.log('storage addressbookArray', addressbookArray);
          Addressbook.set(addressbookArray);
          return addressbookArray;
        });
      }
    },

    create: (key, value) => {
      const addressbookArray = get(Addressbook);
      console.log('storage addressbookArray', addressbookArray);
      if (addressbookArray.find((element) => element.key == key)) return;
      const obj = { key, value };
      updateObject('addressbook', key, value, true).then(() => {
        console.log('storage addressbook value', value);
        addressbookArray.push(obj);
        Addressbook.set(addressbookArray);
        return addressbookArray;
      });
    },

    delete: (key) => {
      Addressbook.update((value) => {
        console.log('key', key);
        console.log('value', value);
        const itemNum = value.findIndex((element) => element.value.user_id == key);
        console.log('itemNum', itemNum);
        if (itemNum == -1) return value;
        value.splice(itemNum, 1);
        deleteObject('addressbook', key);
        return value;
      });
    },
  };

  // const { subscribe, set, update } = writable([])

  // let Sess = get(Session)

  // return {

  //   subscribe,

  //   create: () => {
  //     let addressbookArray = get(Addressbook)

  //     let userId = Sess.user_id
  //     console.log("userId", userId)
  //     let userName = Sess.user_name

  //     console.log("Am I running?")

  //     // let obj = { userId, userName }

  //     updateObject("addressbook", "123", "345", true)
  //     // return addressbookArray
  //   },

  // get: () => {
  //   // at the initial run the value is an empty array since "writable" is []
  //   let addressbookArray = get(Addressbook) // does it refer to the same class?

  //   // holds token and user's details
  //   let Sess = get(Session)
  //   // console.log("Sess", Sess)

  //   // API call to get the list of friends
  //   listAllObjects("addressbook", Sess.user_id).then((addressbookArray) => {
  //     Addressbook.set(addressbookArray)
  //     // console.log("addressbookArray", addressbookArray)
  //     return addressbookArray
  //   })
  // }
  // }
}

export const Addressbook = createAddressbook();

// export const Addressbook = {

//   create: (key, value) => {
//     let ach = get(achievements)
//     if (!!ach.find(element => element.key == key)) return
//     updateObject("achievements", key, value, true).then((value) => {
//       let obj = { key, value }
//       achievements.update((v) => { v.push(obj); return v })
//       // return true
//     })

//   },

//   update: (Item) => {
//     updateObject("achievements", Item.name, Item.value, Item.pub).then((value) => {
//       let ach = get(achievements)
//       const itemNum = ach.findIndex((element) => element.name == Item.name)
//       ach[itemNum] = Item
//       achievements.set(ach)
//       return ach
//     })

//   },

//   delete: (key) => {
//     achievements.update((value) => {
//       const itemNum = value.findIndex((element) => element.key == key)
//       if (itemNum == -1) return value
//       value.splice(itemNum, 1);
//       deleteObject("achievements", key)
//       return value
//     })
//   },
//   find: (key) => {
//     let ach = get(achievements)
//     let i = ach.findIndex((element) => element.key == key)
//     if (i != -1) return ach[i].value
//     else return undefined
//   },

//   get: () => {
//     let ach = get(achievements)
//     if (!!ach && ach.length > 0) return ach
//     else {
//       listAllObjects("achievements", Sess.user_id).then((ach) => {
//         achievements.set(ach)
//         return ach
//       })
//     }
//   }

// }
