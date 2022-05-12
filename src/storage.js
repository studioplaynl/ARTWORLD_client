import { Session, Profile, Error, Succes } from "./session.js"
import { deleteObject, updateObject, listAllObjects } from "./api"
import { get } from 'svelte/store'
import { writable } from 'svelte/store';

function createAchievement() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    set,
    update,
    create: (key, value) => {
      let ach = get(Achievements)
      if (!!ach.find(element => element.key == key)) return
      let obj = { key, value }
      updateObject("achievements", key, value, true).then(() => {

        console.log("value", value)
        ach.push(obj)
        console.log("ach", ach)
        console.log("key", key)
        Achievements.set(ach)
        return ach
      })
    },
    get: () => {
      let ach = get(Achievements)
      let Sess = get(Session)
      if (!!ach && ach.length > 0) return ach
      else {
        if (!!Sess) listAllObjects("achievements", Sess.user_id).then((ach) => {
          Achievements.set(ach)
          return ach
        })
      }
    },
    find: (key) => {
      let ach = get(Achievements)
      let i = ach.findIndex((element) => element.key == key)
      if (i != -1) return ach[i].value
      else return undefined
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
      Achievements.update((value) => {
        const itemNum = value.findIndex((element) => element.key == key)
        if (itemNum == -1) return value
        value.splice(itemNum, 1);
        deleteObject("achievements", key)
        return value
      })
    },

  };
}

function createServerObject(objectName) {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    set,
    update,
    create: (objectName, key, value) => {
      let ach = get(objectName)
      if (!!ach.find(element => element.key == key)) return
      updateObject(objectName, key, value, true).then((value) => {
        let obj = { key, value }
        ach.push(obj)
        console.log("ach")
        console.log(ach)
        console.log(key)
        [objectName].set(ach)
        return ach
      })
    },
    get: () => {
      let ach = get(objectName)
      let Sess = get(Session)
      if (!!ach && ach.length > 0) return ach
      else {
        if (!!Sess) listAllObjects(objectName, Sess.user_id).then((ach) => {
          [objectName].set(ach)
          return ach
        })
      }
    },
    find: (key) => {
      let ach = get(objectName)
      let i = ach.findIndex((element) => element.key == key)
      if (i != -1) return ach[i].value
      else return undefined
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
      [objectName].update((value) => {
        const itemNum = value.findIndex((element) => element.key == key)
        if (itemNum == -1) return value
        value.splice(itemNum, 1);
        deleteObject(objectName, key)
        return value
      })
    },

  };
}

export const Achievements = createAchievement()

// export const Achievements = createServerObject("Achievements")

// {

//     create: (key, value) =>{
//       let ach = get(achievements)
//       if( !!ach.find(element => element.key == key)) return
//         updateObject("achievements", key, value, true).then( (value) =>{
//           let obj = {key, value}
//          achievements.update((v) => {v.push(obj); return v} )
//          // return true
//       })

//     },

//     update: (Item) =>{
//         updateObject("achievements", Item.name, Item.value, Item.pub).then( (value) =>{
//             let ach = get(achievements)
//             const itemNum = ach.findIndex((element) => element.name == Item.name)
//             ach[itemNum] = Item
//             achievements.set(ach)
//             return ach
//         })

//     },

//     delete: (key) =>{
//         achievements.update((value)=>{
//           const itemNum = value.findIndex((element) => element.key == key)
//           if(itemNum == -1) return value
//           value.splice(itemNum, 1);
//           deleteObject("achievements", key)
//           return value
//         })
//     },
//     find: (key) => {
//       let ach = get(achievements)
//       let i = ach.findIndex((element) => element.key == key)
//       if(i != -1) return ach[i].value
//       else return undefined
//     },

//     get: () =>{
//         let ach = get(achievements)
//         let Sess = get(Session)
//         if(!!ach && ach.length > 0) return ach
//         else {
//           if(!!Sess)listAllObjects("achievements", Sess.user_id).then((ach)=>{
//             achievements.set(ach)
//             return ach
//           })
//         }
//     }

// }

function createLiked() {
  const { subscribe, set, update } = writable([])
  return {

    subscribe,
    set,
    update,

    create: (key, value) => {
      let likedArray = get(Liked)
      console.log("likedArray storage", likedArray)

      if (!!likedArray.find(element => element.key == key)) return
      let obj = { key, value }
      updateObject("liked", key, value, true).then(() => {
        console.log("value", value)

        likedArray.push(obj)
        console.log("likedArray", likedArray)
        console.log("key", key)
        console.log("value", value)
        console.log("obj", obj)
        Liked.set(likedArray)
        return likedArray
      })
    },
    get: () => {
      let likedArray = get(Liked)
      console.log("likedArray:1", likedArray)
      let Sess = get(Session)
      if (!!likedArray && likedArray.length > 0) {
        console.log("likedArray passed!")
        return likedArray
      }
      else {
        if (!!Sess) listAllObjects("liked", Sess.user_id).then((likedArray) => {
          console.log("likedArray 2", likedArray)
          Liked.set(likedArray)
          return likedArray
        })
      }
    },
    find: (key) => {
      let likedArray = get(Liked)
      let i = likedArray.findIndex((element) => element.key == key)
      if (i != -1) return likedArray[i].value
      else return undefined
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
        const itemNum = value.findIndex((element) => element.key == key)
        if (itemNum == -1) return value
        value.splice(itemNum, 1)
        deleteObject("liked", key)
        return value
      })
    },

  }
}

export const Liked = createLiked()


function createAddressbook() {
  const { subscribe, set, update } = writable([])
  return {

    subscribe,
    set,
    update,

    get: () => {
      let addressbookArray = get(Addressbook)

      const Sess = get(Session)
      if (!!addressbookArray && addressbookArray.length > 0) {
        return addressbookArray
      } else {
        if (!!Sess) listAllObjects("addressbook", Sess.user_id).then((addressbookArray) => {
          console.log("storage addressbookArray", addressbookArray)
          Addressbook.set(addressbookArray)
          return addressbookArray
        })
      }
    },

    create: (key, value) => {
      let addressbookArray = get(Addressbook)
      const Sess = get(Session)

      // making API call to check whether that online player is already in the addressbook or not
      listAllObjects("addressbook", Sess.user_id).then((response) => {
        addressbookArray = response.map(element => element.value) // assigning array of objects to addressbookArray
        if (response.find(element => element.key == key)) { // if the address is already added (the key exists), ...
          Addressbook.set(addressbookArray) //... set the addressbook array that is received from server
        } else { // otherwise
          updateObject("addressbook", key, value, true).then(() => { // update the server list of addressbook with a new address...
            addressbookArray = [...addressbookArray, value] // ... and combine the list from the server with the address that is being added
            Addressbook.set(addressbookArray)
            return addressbookArray
          })
        }
      })
    }
  }

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

export const Addressbook = createAddressbook()

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
