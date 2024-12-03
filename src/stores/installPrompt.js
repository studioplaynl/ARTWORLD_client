import { writable, get } from 'svelte/store';

export const installPromptStore = writable(null);
export const canInstall = writable(false);
export const installMethod = writable('default');

// Check if the device is Android
const isAndroid = /Android/i.test(navigator.userAgent);
const isChrome = /Chrome/i.test(navigator.userAgent);

// Store the deferredPrompt globally to ensure it's not lost
let deferredPrompt = null;

// Initialize event listener immediately
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installPromptStore.set(e);
    console.log('beforeinstallprompt event captured and stored');
    checkInstallability();
  });
}

async function isAppInstalled() {
  if ('getInstalledRelatedApps' in navigator) {
    const relatedApps = await navigator.getInstalledRelatedApps();
    return relatedApps.length > 0;
  }
  return false;
}

export async function checkInstallability() {
  const installed = await isAppInstalled();
  const displayMode = window.matchMedia('(display-mode: standalone)').matches;
  const isInstallable = !installed && !displayMode;
  
  console.log('Install checks:', {
    isAndroid,
    isChrome,
    installed,
    displayMode,
    isInstallable,
    hasPrompt: !!deferredPrompt,
    hasStorePrompt: !!get(installPromptStore)
  });
  
  canInstall.set(isInstallable);

  if (isInstallable) {
    if (deferredPrompt) {
      installMethod.set('default');
      installPromptStore.set(deferredPrompt);
    } else if (isAndroid && isChrome) {
      installMethod.set('browser_menu');
    } else {
      installMethod.set('not_available');
    }
  }

  return isInstallable;
}

export async function installApp() {
  if (!deferredPrompt) {
    console.log('No installation prompt available');
    return;
  }

  console.log('Showing install prompt...', { isAndroid });
  
  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      canInstall.set(false);
    }
    
    // Clear the prompt after use
    deferredPrompt = null;
    installPromptStore.set(null);
    
  } catch (error) {
    console.error('Error handling install prompt:', error);
  }
}

// Clean up function
export function cleanup() {
  deferredPrompt = null;
  installPromptStore.set(null);
  canInstall.set(false);
  installMethod.set('default');
} 