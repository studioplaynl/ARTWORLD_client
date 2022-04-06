import { Session,Profile, Error,Succes} from "./session.js"
import { deleteObject, updateObject, listAllObjects} from "./api"
import ManageSession from "./routes/game/ManageSession.js"; //push awards to ManageSession
import { get } from 'svelte/store'
import { writable } from 'svelte/store';




function createAchievement(){
    const { subscribe, set, update } = writable([]);

    return {
		subscribe,
        set,
        update,
		create: (key, value) => {
                let ach = get(Achievements)   
                if( !!ach.find(element => element.key == key)) return
                updateObject("achievements", key, value, true).then( (value) =>{
                let obj = {key, value}
                ach.push(obj)
                console.log("ach")
                console.log(ach)
                console.log(key)
                Achievements.set(ach)
                return ach
                })
            },
        get: () => {
            let ach = get(Achievements)
            let Sess = get(Session)
            if(!!ach && ach.length > 0) return ach
            else {
            if(!!Sess)listAllObjects("achievements", Sess.user_id).then((ach)=>{
                Achievements.set(ach)
                return ach
            })
            }
        },
        find: (key) => {
                  let ach = get(Achievements)
                  let i = ach.findIndex((element) => element.key == key)
                  if(i != -1) return ach[i].value
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
            
        delete: (key) =>{
            Achievements.update((value)=>{
                const itemNum = value.findIndex((element) => element.key == key)
                if(itemNum == -1) return value
                value.splice(itemNum, 1);
                deleteObject("achievements", key)
                return value
            })
        },

	};
}



export const Achievements = createAchievement()

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


export const Likes = {

  create: (key, value) =>{
    let ach = get(achievements)
    if( !!ach.find(element => element.key == key)) return
      updateObject("achievements", key, value, true).then( (value) =>{
        let obj = {key, value}
       achievements.update((v) => {v.push(obj); return v} )
       // return true
    })

  },

  update: (Item) =>{
      updateObject("achievements", Item.name, Item.value, Item.pub).then( (value) =>{
          let ach = get(achievements)
          const itemNum = ach.findIndex((element) => element.name == Item.name)
          ach[itemNum] = Item
          achievements.set(ach)
          return ach
      })
      
  },

  delete: (key) =>{
      achievements.update((value)=>{
        const itemNum = value.findIndex((element) => element.key == key)
        if(itemNum == -1) return value
        value.splice(itemNum, 1);
        deleteObject("achievements", key)
        return value
      })
  },
  find: (key) => {
    let ach = get(achievements)
    let i = ach.findIndex((element) => element.key == key)
    if(i != -1) return ach[i].value
    else return undefined
  },

  get: () =>{
      let ach = get(achievements)
      if(!!ach && ach.length > 0) return ach
      else {
        listAllObjects("achievements", Sess.user_id).then((ach)=>{
          achievements.set(ach)
          return ach
        })
      }
  }

}

export const addressbook = {

    create: (key, value) =>{
      let ach = get(achievements)
      if( !!ach.find(element => element.key == key)) return
        updateObject("achievements", key, value, true).then( (value) =>{
          let obj = {key, value}
         achievements.update((v) => {v.push(obj); return v} )
         // return true
      })

    },

    update: (Item) =>{
        updateObject("achievements", Item.name, Item.value, Item.pub).then( (value) =>{
            let ach = get(achievements)
            const itemNum = ach.findIndex((element) => element.name == Item.name)
            ach[itemNum] = Item
            achievements.set(ach)
            return ach
        })
        
    },

    delete: (key) =>{
        achievements.update((value)=>{
          const itemNum = value.findIndex((element) => element.key == key)
          if(itemNum == -1) return value
          value.splice(itemNum, 1);
          deleteObject("achievements", key)
          return value
        })
    },
    find: (key) => {
      let ach = get(achievements)
      let i = ach.findIndex((element) => element.key == key)
      if(i != -1) return ach[i].value
      else return undefined
    },

    get: () =>{
        let ach = get(achievements)
        if(!!ach && ach.length > 0) return ach
        else {
          listAllObjects("achievements", Sess.user_id).then((ach)=>{
            achievements.set(ach)
            return ach
          })
        }
    }

}
