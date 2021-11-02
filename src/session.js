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
    const create = false;
    client.authenticateEmail(email, password, create)
    .then((response)=> {
        console.log(response)
        const session = response
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
        console.log(err)
        
    })

    //throw "invalid username/password"
    
}

export const logout = () => { Session.set(null) ;Profile.set(null);}

export async function checkLogin(session) {
    if(session != null){
        if((session.expires_at + "000") > Date.now()){
            console.log('user still loged in')
        } else {    
            logout()
            window.location.href = "/#/login"
            history.go(0)
            Error.update(er => er = "Please  relogin")
        }

    // client.getAccount(session)
    // .then(() => console.log('user still loged in'))
    // .catch((err) => {
    //         Error = "User not loged in"    
    //         logout()
    //         window.location.href = "/#/login"
    //         history.go(0)
    // })
    }
}