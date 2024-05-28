import { writable } from 'svelte/store';
import { push } from 'svelte-spa-router';
import { Session as NakamaSession } from '@heroiclabs/nakama-js';
import { dwarn } from './helpers/debugLog';

/** Session from localStorage */
let storedSession = localStorage.getItem('Session');
let storedSessionObject;

/** User Profile from localStorage */
const storedProfile = localStorage.getItem('Profile');

// If stored & expired, remove and forward to login..
if (storedSession) {
  storedSession = JSON.parse(storedSession);
  storedSessionObject = new NakamaSession(storedSession.token, storedSession.refresh_token, storedSession.created);
  // dlog('restoring session from localstorage:', storedSessionObject);
}

/** Session contains the user session from the Nakama server
 * @todo Create custom store with checks on the getter function (is expired? is valid? etc)
 */
export const Session = writable(storedSessionObject || null);
Session.subscribe((value) => {
  if (value) {
    localStorage.setItem('Session', JSON.stringify(value));
  } else {
    localStorage.removeItem('Session'); // for logout

    dwarn('Session received NO value, redirect to login route');
    push('/login');
  }
});

/** User Profile contains the user name, posX, posY et cetera
 *
 * @alias $Profile
 */
export const Profile = writable(storedProfile ? JSON.parse(storedProfile) : null);
Profile.subscribe((value) => {
  if (value) {
    localStorage.setItem('Profile', JSON.stringify(value));
  } else localStorage.removeItem('Profile'); // for logout
});

/** Contains the Session Errors
 * @todo Remove or extend to multiple messages array? */
export const Error = writable();
Error.subscribe((err) => {
  if (err) {
    dwarn.error('Error Store received following error:', err);
  }
});

/** Contains the Session Notifications
 * @todo Remove or extend to multiple messages ar
 * ray? */
export const Notification = writable();

/** Contains Success messages
 * @todo Remove or extend to multiple messages array? */
export const Success = writable();

/** Contains current artApp that was loaded in the url*/
export const CurrentApp = writable(null);

/** Contains multiple steps of (the current) Tutorial
 * @todo Remove or extend to multiple messages array? */
export const Tutorial = writable([]);

/** Contains user History */
export const History = writable([]);

/** The currently selected onlinePlayer
 * @alias $SelectedOnlinePlayer
 */
export const SelectedOnlinePlayer = writable(null);

//which page is open in the itemsbar
export const ItemsBarCurrentView = writable(null);

/** The visibility state of the Itemsbar */
export const ShowItemsBar = writable(false);

/** The Visibility of the ShowHomeEditBar */
export const ShowHomeEditBar = writable(false);
export const HomeEditBarExpanded = writable(false);
