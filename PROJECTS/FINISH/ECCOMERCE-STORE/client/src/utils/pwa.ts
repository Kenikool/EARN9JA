interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
};

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const canInstallPWA = () => {
  return !isPWA() && 'serviceWorker' in navigator;
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      return registration;
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};

export const requestInstall = (): Promise<BeforeInstallPromptEvent | null> => {
  return new Promise((resolve) => {
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      resolve(deferredPrompt);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If not triggered within 5 seconds, resolve with null
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handler);
      resolve(null);
    }, 5000);
  });
};

export const installPWA = async () => {
  const prompt = await requestInstall();
  if (prompt) {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    console.log(`User ${outcome} the install prompt`);
    return outcome;
  }
  return null;
};

export const addToHomeScreen = () => {
  if (isIOS()) {
    // iOS Safari instructions
    const message = `
      To install this app on your iOS device:
      1. Tap the Share button
      2. Scroll down and tap "Add to Home Screen"
      3. Tap "Add" to confirm
    `;
    alert(message);
  } else if (canInstallPWA()) {
    installPWA();
  }
};

export const getUpdateAvailable = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration?.waiting;
  }
  return null;
};

export const updateApp = async () => {
  const waiting = await getUpdateAvailable();
  if (waiting) {
    waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
};