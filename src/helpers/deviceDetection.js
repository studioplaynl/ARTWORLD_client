export const getDeviceType = () => {
    const ua = navigator.userAgent;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    console.log('Screen dimensions:', {
      innerWidth: width,
      innerHeight: height,
      devicePixelRatio: window.devicePixelRatio,
      userAgent: ua
    });
  
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/
        .test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  };