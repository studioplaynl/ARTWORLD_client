/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
// eslint-disable-next-line no-unused-vars
import { dlog } from '../../../helpers/debugLog';
import ManageSession from '../ManageSession';
// import CoordinatesTranslator from './CoordinatesTranslator';

// eslint-disable-next-line no-unused-vars
import * as Phaser from 'phaser';


class Background {
  // constructor(config) {
  // }
  standardWithDots(scene) {
    const tileSize = 80;
    const dotWidth = 2;    
    if (scene.textures.exists('dotWithBg')) {
      scene.textures.remove('dotWithBg')
    }

    const mapWidth = scene.worldSize.x / tileSize;
    const mapHeight = scene.worldSize.y / tileSize;
    this.dotTile(scene, tileSize, dotWidth);

    const map = scene.make.tilemap({
      tileWidth: 80, tileHeight: 80, width: mapWidth, height: mapHeight,
    });
    const tiles = map.addTilesetImage('dotWithBg');

    const layer = map.createBlankLayer('layer1', tiles);

    // Add a simple scene with some random element
    layer.fill(0, 0, 0, mapWidth, mapHeight);
  }

  diamondAlternatedDots(scene) {
    const tileSize = 80;
    const dotWidth = 2;
    
    if (scene.textures.exists('dotWithBg')) {
      scene.textures.remove('dotWithBg')
    }

    // dlog('scene, worldSize', scene, scene.worldSize);
    const mapWidth = scene.worldSize.x / tileSize;
    const mapHeight = scene.worldSize.y / tileSize;
    this.dotTile(scene, tileSize, dotWidth);
    const map = scene.make.tilemap({ width: mapWidth, height: mapHeight, tileWidth: tileSize, tileHeight: tileSize, key: 'map' });

    const tileset1 = map.addTilesetImage('dotWithBg');
    const tileset2 = map.addTilesetImage('dotWithBg2');

    const layer1 = map.createBlankLayer('Layer1', tileset1);
    const layer2 = map.createBlankLayer('Layer2', tileset2);

    // Fill the map with alternating tiles
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tileIndex = (x + y) % 2; // Alternate between 0 and 1
        if (tileIndex === 0) {
          layer1.putTileAt(0, x, y); // Use tile index 0 from the first tileset
        } else {
          layer2.putTileAt(0, x, y); // Use tile index 0 from the second tileset
        }
      }
    }

  }

  dotTile(scene, tileWidth, dotWidth) {
    const fillColor = 0xffffff;
    const dotColor = 0x7300ed;

    // create the dot: graphics
    const dot = scene.add.graphics();
    dot.fillStyle(dotColor);
    dot.fillCircle(dotWidth, dotWidth, dotWidth).setVisible(false);

    const bgDot = scene.add.rectangle(tileWidth/2, tileWidth/2, tileWidth, tileWidth, fillColor).setVisible(false);
    const bgDot2 = scene.add.rectangle(tileWidth/2, tileWidth/2, tileWidth, tileWidth, fillColor).setVisible(false);
    // create renderTexture to place the dot on
    const dotRendertexture = scene.add.renderTexture(0, 0, tileWidth, tileWidth);
    const dotRendertexture2 = scene.add.renderTexture(0, 0, tileWidth, tileWidth);

    // draw the dot on the renderTexture
    dotRendertexture.draw(bgDot);
    dotRendertexture.draw(dot);

    dotRendertexture2.draw(bgDot2);

    // save the rendertexture with a key ('dot')
    dotRendertexture.saveTexture('dotWithBg');
    dotRendertexture2.saveTexture('dotWithBg2');

    // destroy the bgDot graphic and renderTexture, because we can reference the dot as 'dot' (prev step)
    bgDot.destroy();
    dot.destroy();
    dotRendertexture.destroy();

    bgDot2.destroy();
    // dot.destroy();
    dotRendertexture2.destroy();
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
    // dlog("gridWidth/offset", gridWidth / offset)
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

  gradientTileMap(config) {
    //! this does not perform on android phones: and image bigger then 1024 to set the gradient causes a crash
    const { tileWidth } = config;
    const { scene } = config;
    const sceneHeight = scene.worldSize.y;
    const { gradientColor1 } = config;
    const { gradientColor2 } = config;
    const { tileMapName } = config;
    const alpha = 1;
    const maxSize = 1024;

        // check if the name already exists in the TextureManager
    // if so, return
    if (scene.textures.exists(tileMapName)) {
      return;
    }
    // create the square gradient: graphics
    const gradientTile = scene.add.graphics();
    gradientTile.fillGradientStyle(gradientColor2, gradientColor2, gradientColor1, gradientColor1, alpha);
    // gradientTile.fillRect(0, 0, tileWidth, sceneHeight / 4);
    gradientTile.fillRect(0, 0, tileWidth, sceneHeight / 4);

    // const rt1 = scene.add.renderTexture(0, 0, worldSize.x, worldSize.y);
    const rt1 = scene.add.renderTexture(0, 0, maxSize, maxSize);

    rt1.draw(gradientTile);

    rt1.saveTexture(tileMapName);
    rt1.destroy();

    gradientTile.destroy();

    // const mapWidth = scene.worldSize.x / tileWidth;
    // const mapHeight = scene.worldSize.y / tileWidth / 4;
    const mapWidth = maxSize / tileWidth;
    const mapHeight = maxSize;

    // const map = scene.make.tilemap({
    //   tileWidth, tileHeight: tileWidth, width: mapWidth, height: mapHeight,
    // });
    const map = scene.make.tilemap({
      tileWidth, tileHeight: tileWidth, width: maxSize, height: maxSize,
    });

    const tiles = map.addTilesetImage(tileMapName);

    const layer = map.createBlankLayer('layer1', tiles);
    const scaleMap = scene.worldSize.x / maxSize;
    layer.setScale(scaleMap);

    for (let i = 0; i < mapHeight; i += 1) {
      layer.fill(i, 0, i, mapWidth, 1);
    }
    // layer.fill(1, 0, 0, mapWidth, 1);
  }

  gradientStretchedToFitWorld(config) {
    const { tileWidth } = config;
    const { scene } = config;
    const { gradientColor1 } = config;
    const { gradientColor2 } = config;
    const { tileMapName } = config;
    const alpha = 1;

    // check if the name already exists in the TextureManager
    // if so, return
    if (scene.textures.exists(tileMapName)) {const bgGradient = scene.add.image(0, 0, tileMapName)
      .setOrigin(0);

    // strech the gradient image to the word size
    bgGradient.displayWidth = scene.worldSize.x;
    bgGradient.displayHeight = scene.worldSize.y;
      return;
    }
    // create the dot: graphics
    const gradientTile = scene.add.graphics();
    gradientTile.fillGradientStyle(gradientColor1, gradientColor1, gradientColor2, gradientColor2, alpha);
    gradientTile.fillRect(0, 0, tileWidth, tileWidth);

    // const rt1 = scene.add.renderTexture(0, 0, worldSize.x, worldSize.y);
    const rt1 = scene.add.renderTexture(0, 0, tileWidth, tileWidth);

    rt1.draw(gradientTile);

    rt1.saveTexture(tileMapName);
    rt1.destroy();

    gradientTile.destroy();

    const bgGradient = scene.add.image(0, 0, tileMapName)
      .setOrigin(0);

    // strech the gradient image to the word size
    bgGradient.displayWidth = scene.worldSize.x;
    bgGradient.displayHeight = scene.worldSize.y;
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

    // check if the name already exists in the TextureManager
    // if so, return
    if (scene.textures.exists(name)) {
      scene[name] = scene.add.image(posX, posY, name).setOrigin(0.5).setScale(1);
      scene[name].name = name;
      return;
    }
    // create graphic: a large rectangle
    // out of this rectangle we cut out a circle and with that frame we cut out a circle out of an other rectangle
    const rectangle = scene.add.graphics();
    // rectangle.setVisible(false);
    rectangle.fillGradientStyle(gradient1, gradient1, gradient2, gradient2, 1);
    rectangle.fillRect(0, 0, size, size);

    const rt1 = scene.add.renderTexture(0, 0, size, size);
    const rt2 = scene.add.renderTexture(0, 0, size, size);

    rt1.draw(rectangle);
    rt2.draw(rectangle);

    const eraser = scene.add.circle(0, 0, size / 2, 0x000000);
    // eraser.setVisible(false);

    // erase the circle from the first rect
    rt1.erase(eraser, size / 2, size / 2);

    // erase the rect with the cutout from the second rect, creating the circle with gradient
    rt2.erase(rt1, size/2, size/2);

    // the center of the renderTexture has offset of (size / 2)
    if (imageOnly === true) {
      posX = 0;
      posY = 0;
    }
    rt2.x = posX - (size / 2);
    rt2.y = posY - (size / 2);


    // save the rendertexture with a key
    // and as this.[name] on scene level
    // add name to the scene[name] gameObject

    rt2.saveTexture(name);

    // with imageOnly we don't place it into the scene with a name and reference
    if (typeof imageOnly === 'undefined' || imageOnly === false) {
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
    let { alpha } = config;
    const { name } = config;
    const { width } = config;
    const { height } = config;
    const { posX } = config;
    const { posY } = config;
    const { setOrigin } = config;
    const { imageOnly } = config;

    // check if the name already exists in the TextureManager
    // if so, return
    if (scene.textures.exists(name)) {
      return;
    }
    // const { worldSize } = scene;
    if (typeof alpha === 'undefined') {
      alpha = 1;
    }
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
    if (typeof imageOnly === 'undefined' || imageOnly === false) {
      scene[name] = scene.add.image(posX, posY, name).setOrigin(setOrigin).setScale(1);
      scene[name].name = name;
    }
  }

  bigRectangleScaled(config) {
    const { scene } = config;
    const { color } = config;
    const { alpha } = config;
    const { name } = config;
    const { width } = config;
    const { height } = config;
    const { posX } = config;
    const { posY } = config;
    const { setOrigin } = config;
    const { imageOnly } = config;


    // check if the name already exists in the TextureManager
    // if so, return
    if (scene.textures.exists(name)) {
      return;
    }

    // const { worldSize } = scene;
    const partWidth = width / 6;
    const partHeight = height / 6;
    // dlog("width, partWidth, height, partHeight", width, partWidth, height, partHeight)

    const rectangle = scene.add.rectangle(0, 0, partWidth, partHeight, color, alpha);

    const rt1 = scene.add.renderTexture(0, 0, partWidth, partWidth);

    rt1.draw(rectangle);

    rt1.saveTexture(name);
    rt1.destroy();

    rectangle.destroy();

    // with imageOnly we don't place it into the scene with a name and reference
    if (typeof imageOnly === 'undefined' || imageOnly === false) {
      const square1 = scene.add.image(posX, posY, name).setOrigin(setOrigin).setScale(12).setInteractive()
        .on('pointerdown', () => {
          ManageSession.playerIsAllowedToMove = true;
        })
        .on('pointerup', () => {
          // ManageSession.playerIsAllowedToMove = false
        })
        .setVisible(false);
      square1.input.alwaysEnabled = true;
    }
  }

  triangle(config) {
    const { scene } = config;
    const { name } = config;
    // const worldSize = scene.worldSize
    const { size } = config;
    const { gradient1 } = config;
    const { gradient2 } = config;
    const { gradient3 } = config;
    const { gradient4 } = config;
    const { alpha } = config;
    const { imageOnly } = config;
    const { setOrigin } = config;

    // check if the name already exists in the TextureManager
    // if so, return
    if (scene.textures.exists(name)) {
      return;
    }
    // default pos
    const { posX } = 0;
    const { posY } = 0;

    const graphics = scene.add.graphics();

    graphics.fillGradientStyle(gradient1, gradient2, gradient3, gradient4, alpha);
    // 0 0 is upper left corner
    // p1 = left down = + size / 0
    // p2 = middle up = 0 / + 1/2size
    // p3 = right down = +size / +size

    graphics.fillTriangle(0, size, size * 0.5, 0, size, size);

    const rt1 = scene.add.renderTexture(0, 0, size, size);
    rt1.draw(graphics);
    rt1.saveTexture(name);

    // with imageOnly we don't place it into the scene with a name and reference
    if (typeof imageOnly === 'undefined' || imageOnly === false) {
      scene[name] = scene.add.image(posX, posY, name).setOrigin(setOrigin).setScale(1);
      scene[name].name = name;
    }

    rt1.destroy();
    graphics.destroy();
  }

  star(config) {
    const { scene } = config;
    const { name } = config;
    // const worldSize = scene.worldSize
    const { size } = config;
    const { gradient1 } = config;
    const { gradient2 } = config;

    const { spikes } = config;


    // check if the name already exists in the TextureManager
    // if so, return
    if (scene.textures.exists(name)) {
      return;
    }
    // default pos
    // const { posX } = 0;
    // const { posY } = 0;

    // dlog("config, gradient1, gradient2, spikes", config, gradient1, gradient2, spikes)
    const graphics = scene.add.graphics();

    const rt1 = scene.add.renderTexture(0, 0, size * 2, size * 2);
    const rectangle = scene.add.graphics();
    const rt2 = scene.add.renderTexture(0, 0, size * 2, size * 2);

    this.drawStar(graphics, rt1, rt2, rectangle, name, spikes, size, gradient1, gradient2);
  }

  drawStar(graphics, rt1, rt2, rectangle, name, spikes, outerRadius, color, lineColor) {
    const innerRadius = outerRadius / 2;
    const cx = outerRadius;
    const cy = outerRadius;

    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    graphics.lineStyle(4, 0x000000, 1);
    graphics.fillStyle(0x000000, 1);
    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
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
    const size = outerRadius * 2;
    rectangle.fillGradientStyle(color, color, lineColor, lineColor, 1);
    rectangle.fillRect(0, 0, size, size);

    rt1.draw(graphics); // star
    rt2.draw(rectangle); // rect

    // erase the star from the first rect
    rt2.erase(rt1, size/2, size/2);
    rt1.draw(rectangle);
    rt1.erase(rt2, size/2, size/2);


    // rt1.draw(graphics);
    rt1.saveTexture(name);

    rt1.destroy();
    rt2.destroy();
    graphics.destroy();
    rectangle.destroy();
  }
}

export default new Background();
