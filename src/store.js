import { writable } from "svelte/store";
import {client} from "./nakama.svelte"

let storedSession = localStorage.getItem("Session")
export const Session = writable(storedSession ? JSON.parse(storedSession) : null);
Session.subscribe((value) => {
    if (value) localStorage.setItem('Session', JSON.stringify(value));
    else localStorage.removeItem('Session'); // for logout
  })


let profileStore = localStorage.getItem("profile")
export const Profile = writable(profileStore ? JSON.parse(profileStore) : null);
Profile.subscribe((value) => {
      if (value) localStorage.setItem('profile', JSON.stringify(value));
      else localStorage.removeItem('profile'); // for logout
    })



export async function login(email, password) {
    const create = false;
    client.authenticateEmail(email, password, create)
    .then((response)=> {
        const session = response
        console.log(session)
        Session.set(session);
        getAccount(session)
        window.location.href = "/#/"
    })
    .catch((err) => {return err})
    
    
}

export async function getAccount(session) {
    let profile = {}
    const account = await client.getAccount(session);

    profile.user = account.user.username
    profile.avatar_url = account.user.avatar_url
    profile.meta = JSON.parse(account.user.metadata)
 
    Profile.set(profile)
}


export const logout = () => { Session.set(null) ;Profile.set(null);}

export async function checkLogin(session) {
    if(session != null){
    client.getAccount(session)
    .then(() => console.log('user still loged in'))
    .catch((err) => {
            logout()
            window.location.href = "/#/login"
    })
    }
}

<<<<<<< HEAD



=======
>>>>>>> 76871a945856ee70261ac6ae0a584d3a8255a693
