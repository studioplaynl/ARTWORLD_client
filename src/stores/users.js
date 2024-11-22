import { writable, get } from 'svelte/store';
import { getAccount } from '../helpers/nakamaHelpers';

export const AllUsers = writable([]);

export const isValidUser = async (userId) => {
  try {
    const userInfo = await getAccount(userId);
    return !!userInfo; // Returns true if we got user info back
  } catch (error) {
    console.warn('User does not exist:', userId);
    return false;
  }
}; 