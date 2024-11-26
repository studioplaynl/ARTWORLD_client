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

export const getScreenDimensions = () => {
  const pixelRatio = window.devicePixelRatio || 1;
  return {
    width: window.innerWidth * pixelRatio,
    height: window.innerHeight * pixelRatio,
    cssWidth: window.innerWidth,
    cssHeight: window.innerHeight,
    pixelRatio,
    isPortrait: window.innerHeight > window.innerWidth
  };
};

export const getScaledDimensions = (baseWidth, baseHeight) => {
  const { width, height, pixelRatio } = getScreenDimensions();
  const scale = Math.min(
    (width / pixelRatio) / baseWidth, 
    (height / pixelRatio) / baseHeight
  );
  
  return {
    width: Math.floor(baseWidth * scale),
    height: Math.floor(baseHeight * scale),
    physicalWidth: Math.floor(baseWidth * scale * pixelRatio),
    physicalHeight: Math.floor(baseHeight * scale * pixelRatio),
    scale
  };
};