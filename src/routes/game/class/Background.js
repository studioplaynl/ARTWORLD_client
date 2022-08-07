class Background {
    constructor(config) {
    }
    repeatingDots(config) {
    // fill in textures
    // get world size
    const { scene } = config;

    const { worldSize } = config.scene;

    /// *........... white background of worldSize width .............................................................
    // scene.add.rectangle(0, 0, worldSize.x, worldSize.y, config.backgroundColor).setOrigin(0);

    //* ........... repeating pattern on the white background ..........................................................
    const gridWidth = worldSize.x;
    const gridHeight = worldSize.y;
    const offset = config.gridOffset;
    const offsetY = offset / 2;

    // ......... repeating dots as pattern on white background .........................................................
    // background dot size
    const { dotWidth } = config;

    // create the dot: graphics
    const bgDot = scene.add.graphics();
    bgDot.fillStyle(config.dotColor);
    bgDot.fillCircle(dotWidth, dotWidth, dotWidth).setVisible(false);

    // create renderTexture to place the dot on
    const bgDotRendertexture = scene.add.renderTexture(0, 0, dotWidth * 2, dotWidth * 2);

    // draw the dot on the renderTexture
    bgDotRendertexture.draw(bgDot);

    // save the rendertexture with a key ('dot')
    bgDotRendertexture.saveTexture('dot');

    // destroy the bgDot graphic and renderTexture, because we can reference the dot as 'dot' (prev step)
    bgDot.destroy();
    bgDotRendertexture.destroy();

    // repeat this saved texture over the background
    // console.log("gridWidth/offset", gridWidth / offset)
    for (let i = 0; i < gridWidth / offset; i += 1) {
      for (let j = 0; j < gridHeight / offsetY; j += 1) {
        // offset the odd rows by half offset
        if (j % 2 === 0) {
          scene.add.image(i * offset, j * offsetY, 'dot').setOrigin(0);
        } else {
          scene.add.image((i * offset) + (offset / 2), j * offsetY, 'dot').setOrigin(0);
        }
      }
    }
  }

  circle(config) {
    //! create renderTexture images on network boot,
    //! use the image KEYS in the SCENES, that way they don't need to be created each time when entering a scene

    const { scene } = config;
    const { name } = config;
    const { size } = config;
    const { gradient1 } = config;
    const { gradient2 } = config;
    const { imageOnly } = config; // used only for the creation of the image and image key
    let { posX } = config;
    let { posY } = config;

    // create graphic: a large rectangle
    // out of this rectangle we cut out a circle and with that frame we cut out a circle out of an other rectangle
    let rectangle = scene.add.graphics();
    // rectangle.setVisible(false);
    rectangle.fillGradientStyle(gradient1, gradient1, gradient2, gradient2, 1);
    rectangle.fillRect(0, 0, size, size);

    let rt1 = scene.add.renderTexture(0, 0, size, size);
    let rt2 = scene.add.renderTexture(0, 0, size, size);

    rt1.draw(rectangle);
    rt2.draw(rectangle);

    let eraser = scene.add.circle(0, 0, size / 2, 0x000000);
    // eraser.setVisible(false);

    // erase the circle from the first rect
    rt1.erase(eraser, size / 2, size / 2);

    // erase the rect with the cutout from the second rect, creating the circle with gradient
    rt2.erase(rt1, 0, 0);

    // the center of the renderTexture has offset of (size / 2)
    if (imageOnly === true) {
        posX = 0 ;
        posY = 0 ;
    }
    rt2.x = posX - (size / 2);
    rt2.y = posY - (size / 2);


    // save the rendertexture with a key
    // and as this.[name] on scene level
    // add name to the scene[name] gameObject

    rt2.saveTexture(name);

    // with imageOnly we don't place it into the scene with a name and reference
    if (typeof imageOnly === "undefined" || imageOnly === false) {
    scene[name] = scene.add.image(posX, posY, name).setOrigin(0.5).setScale(1);
    scene[name].name = name;
    }

    rt2.destroy();
    rt1.destroy();
    eraser.destroy();
    rectangle.destroy();
  }

  rectangle(config) {
    const { scene } = config;
    const { gradient1 } = config;
    const { gradient2 } = config;
    const { gradient3 } = config;
    const { gradient4 } = config;
    const { alpha } = config;
    const { name } = config;
    const { width } = config;
    const { height } = config;
    let { posX } = config;
    let { posY } = config;
    const { setOrigin } = config;
    const { imageOnly } = config;
   
    // const { worldSize } = scene;


    const rectangle = scene.add.graphics();
    rectangle.fillGradientStyle(gradient1, gradient2, gradient3, gradient4, alpha);
    rectangle.fillRect(0, 0, width, height);

    // const rt1 = scene.add.renderTexture(0, 0, worldSize.x, worldSize.y);
    const rt1 = scene.add.renderTexture(0, 0, width, height);

    rt1.draw(rectangle);

    rt1.saveTexture(name);
    rt1.destroy();

    rectangle.destroy();

    // with imageOnly we don't place it into the scene with a name and reference
    if (typeof imageOnly === "undefined" || imageOnly === false) {
    scene[name] = scene.add.image(posX, posY, name).setOrigin(setOrigin).setScale(1);
    scene[name].name = name;
    }

  }

  triangle(config){
    const { scene } = config;
    const { name } = config;
    // const worldSize = scene.worldSize
    const { size } = config;
    const { gradient1 } = config;
    const { gradient2 } = config;
    const { gradient3 } = config;
    const { gradient4 } = config;
    const { alpha } = config;
    const { imageOnly} = config;

    //default pos 
    const { posX } = 0;
    const { posY } = 0;

    const graphics = scene.add.graphics();

    graphics.fillGradientStyle(gradient1, gradient2, gradient3, gradient4, alpha);
    // 0 0 is upper left corner
    // p1 = left down = + size / 0
    // p2 = middle up = 0 / + 1/2size
    // p3 = right down = +size / +size

    graphics.fillTriangle(0, size, size*0.5, 0, size, size);

    const rt1 = scene.add.renderTexture(0, 0, size, size);
    rt1.draw(graphics);
    rt1.saveTexture(name);

     // with imageOnly we don't place it into the scene with a name and reference
    if (typeof imageOnly === "undefined" || imageOnly === false) {
    scene[name] = scene.add.image(posX, posY, name).setOrigin(setOrigin).setScale(1);
    scene[name].name = name;
    }

    rt1.destroy();
    graphics.destroy();

  }
  star(config){
    const { scene } = config;
    const { name } = config;
    // const worldSize = scene.worldSize
    const {size} = config;
    const {gradient1} = config;
    const {gradient2} = config;

    const {spikes} = config; 
    

    //default pos 
    const { posX } = 0;
    const { posY } = 0;

    //console.log("config, gradient1, gradient2, spikes", config, gradient1, gradient2, spikes)
    const graphics = scene.add.graphics();

    const rt1 = scene.add.renderTexture(0, 0, size*2, size*2);
    const rectangle = scene.add.graphics();
    const rt2 = scene.add.renderTexture(0, 0, size*2, size*2);

    this.drawStar(graphics, rt1, rt2, rectangle, name, spikes, size, gradient1, gradient2);
    
  }
  drawStar (graphics, rt1, rt2, rectangle, name, spikes, outerRadius, color, lineColor){
    const innerRadius = outerRadius/2;
    const cx = outerRadius;
    const cy = outerRadius;

    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    graphics.lineStyle(4, 0x000000, 1);
    graphics.fillStyle(0x000000, 1);
    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++)
    {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        graphics.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        graphics.lineTo(x, y);
        rot += step;
    }

    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();


    
    // rectangle.setVisible(false);
    const size = outerRadius*2; 
    rectangle.fillGradientStyle(color, color, lineColor, lineColor, 1);
    rectangle.fillRect(0, 0, size, size);

    rt1.draw(graphics); //star
    rt2.draw(rectangle); //rect

    // erase the circle from the first rect
    rt2.erase(rt1, 0, 0);
    rt1.draw(rectangle);
    rt1.erase(rt2, 0, 0);

    // erase the rect with the cutout from the second rect, creating the circle with gradient
    //rt2.erase(rt1, 0, 0);

    //rt1.draw(graphics);
    rt1.saveTexture(name);

    rt1.destroy();
    rt2.destroy();
    graphics.destroy();
    rectangle.destroy();

}
}

export default new Background()