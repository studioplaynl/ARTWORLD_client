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
    const session = await client.authenticateEmail(email, password, create);
    console.log(session)
    localStorage.nakamaAuthToken = session.token;
    Session.set(session);
    console.info("Authenticated successfully. User id:", session.user_id);
    let promise = getAccount(session);
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



export class storeSession {
  constructor(storeSession) {
    this.session;
    this.account;
    this.profile;
  }

  async  getAccount(session) {
    this.profile = {}
    this.account = await client.getAccount(session);

    profile.user = account.user.username
    profile.avatar_url = account.user.avatar_url
    profile.meta = JSON.parse(account.user.metadata)
 
    Profile.set(profile)
}

} //storeSession
