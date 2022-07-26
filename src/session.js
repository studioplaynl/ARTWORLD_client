import { writable } from 'svelte/store';

// Load Session & Profile from localStorage
let storedSession = localStorage.getItem('Session');
const storedProfile = localStorage.getItem('Profile');

// If stored & expired, remove and forward to login..
storedSession = JSON.parse(storedSession);
if (storedSession) {
  if ((`${storedSession.expires_at}000`) <= Date.now()) {
    localStorage.removeItem('Profile'); // for logout
    window.location.replace('/#/login');
  }
}

// Session contains the user session from the Nakama server
export const Session = writable(storedSession || null);
Session.subscribe((value) => {
  if (value) {
    localStorage.setItem('Session', JSON.stringify(value));
  } else localStorage.removeItem('Session'); // for logout
});

// User Profile contains the user name, posX, posY et cetera
export const Profile = writable(storedProfile ? JSON.parse(storedProfile) : null);
Profile.subscribe((value) => {
  if (value) {
    localStorage.setItem('Profile', JSON.stringify(value));
  } else localStorage.removeItem('Profile'); // for logout
});

// Contains the Session Errors
// TODO: remove or extend to multiple messages array?
export const Error = writable();

// Contains the Session Notifications
// TODO: remove or extend to multiple messages array?
export const Notification = writable();

// Contains Success messages?
// TODO: remove or extend to multiple messages array?
export const Succes = writable();

// Contains current artApp that was loaded
export const CurrentApp = writable();

// Contains multiple steps of (the current) Tutorial
export const Tutorial = writable([]);

// Contains multiple steps of (the current) Tutorial
export const History = writable([]);
