import { writable } from "svelte/store";
import { client, SSL } from "./nakama.svelte"
import { getAccount, setLoader } from "./api.js"
import ManageSession from "./routes/game/ManageSession.js"; //push the profile to ManageSession

let storedSession = localStorage.getItem("Session")
storedSession = JSON.parse(storedSession)

if(!!storedSession){
    if((storedSession.expires_at + "000") <= Date.now()){
        localStorage.removeItem('profile'); // for logout
        window.location.replace("/#/login");  
        
    }
}

export const Session = writable(storedSession ? storedSession : null);
Session.subscribe((value) => {
    if (!!value) {
        console.log(value)
        ManageSession.sessionStored = value; //! push the Session with url to ManageSession
        localStorage.setItem('Session', JSON.stringify(value))
    }
    else localStorage.removeItem('Session'); // for logout
})

//  export const Profile = writable(null);

let profileStore = localStorage.getItem("profile")
export const Profile = writable(profileStore ? JSON.parse(profileStore) : null);
Profile.subscribe((value) => {
    if (!!value) {
        localStorage.setItem('profile', JSON.stringify(value));
        ManageSession.userProfile = value //! push the profile with url to ManageSession
        // console.log("Profile.subscribe((value)")
        // console.log(value)
    }
    else localStorage.removeItem('profile'); // for logout
})



export const Error = writable();
export const Notification = writable();


export const Succes = writable();

export const CurrentApp = writable();

export const tutorial = writable();

export const liked = writable([]);

export const adressbook = writable([]);

export const history = writable([])

export async function login(email, password) {
    setLoader(true)
    const create = false;
    client.authenticateEmail(email, password, create)
        .then(async (response) => {
            console.log(response)
            const session = response
            Session.set(session);
            await getAccount()
            window.location.href = "/#/"
            setLoader(false)
            return session
        })
        .catch((err) => {
            if (err.status == 404) {
                Error.update(er => er = "invalid username")
            }
            if (err.status == 401) {
                Error.update(er => er = "invalid password")
            }
            console.log(err)

        })

    //throw "invalid username/password"

}

export const logout = () => { Session.set(null); Profile.set(null); window.location.href = "/#/login";history.go(0) }

export async function checkLogin(session) {
    if (session != null) {
        if ((session.expires_at + "000") > Date.now()) {
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