import { writable } from "svelte/store";
import {client, SSL} from "./nakama.svelte"
import {getAccount} from "./api.js"

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


export const Error = writable();


export async function login(email, password) {

    console.log("ssl="+SSL)
    const create = false;
    client.authenticateEmail(email, password, create)
    .then((response)=> {
        const session = response
        console.log(session)
        Session.set(session);
        getAccount()
        window.location.href = "/#/"
        return session
    })
    .catch((err)=> {
        if(err.status == 404){
            Error.update(er => er = "invalid username")
        }
        if(err.status == 401){
            Error.update(er => er = "invalid password")
        }
        
    })

    //throw "invalid username/password"
    
}

// export async function getAccount(session) {
//     let profile = {}
//     const account = await client.getAccount(session);

//     profile.user = account.user.username
//     profile.avatar_url = account.user.avatar_url
//     profile.meta = JSON.parse(account.user.metadata)
 
//     Profile.set(profile)
// }


export const logout = () => { Session.set(null) ;Profile.set(null);}

export async function checkLogin(session) {
    if(session != null){
    client.getAccount(session)
    .then(() => console.log('user still loged in'))
    .catch((err) => {
            Error = "User not loged in"    
            logout()
            window.location.href = "/#/login"
            history.go(0)
    })
    }
}