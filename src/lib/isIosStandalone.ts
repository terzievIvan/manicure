export const isIosStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(userAgent);
  
  // Checking both Apple's proprietary standalone property and standard display-mode
  const isStandalone = 
    ('standalone' in window.navigator && (window.navigator as any).standalone === true) || 
    window.matchMedia('(display-mode: standalone)').matches;

  return isIos && isStandalone;
};
