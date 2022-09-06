/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import ManageSession from '../ManageSession';
import CoordinatesTranslator from './CoordinatesTranslator';

const { Phaser } = window;

class Background {
  standardWithDots(scene) {
    this.repeatingDots({
      scene,
      gridOffset: 80,
      dotWidth: 2,
      dotColor: 0x7300ed,
      backgroundColor: 0xffffff,
    });

    // make a repeating set of rectangles around the artworld canvas
    const middleCoordinates = new Phaser.Math.Vector2(
      CoordinatesTranslator.artworldToPhaser2DX(scene.worldSize.x, 0),
      CoordinatesTranslator.artworldToPhaser2DY(scene.worldSize.y, 0),
    );

    scene.borderRectArray = [];

    for (let i = 0; i < 3; i++) {
      scene.borderRectArray[i] = scene.add.rectangle(0, 0, scene.worldSize.x + (80 * i), scene.worldSize.y + (80 * i));
      scene.borderRectArray[i].setStrokeStyle(6 + (i * 2), 0x7300ed);

      scene.borderRectArray[i].x = middleCoordinates.x;
      scene.borderRectArray[i].y = middleCoordinates.y;
    }
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
    const { posX } = config;
    const { posY } = config;
    const { name } = config;
    // const worldSize = scene.worldSize
    const { size } = config;
    const { gradient1 } = config;
    const { gradient2 } = config;

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
    rt2.erase(rt1, 0, 0);

    // the center of the renderTexture has offset of (size / 2)
    rt2.x = posX - (size / 2);
    rt2.y = posY - (size / 2);

    // save the rendertexture with a key
    // and as this.[name] on scene level
    // add name to the scene[name] gameObject

    rt2.saveTexture(name);
    scene[name] = scene.add.image(posX, posY, name).setOrigin(0.5).setScale(1);
    scene[name].name = name;
    // console.log(name)

    rt2.destroy();
    rt1.destroy();
    eraser.destroy();
    rectangle.destroy();
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

    // const { worldSize } = scene;
    const partWidth = width / 6;
    const partHeight = height / 6;
    // console.log("width, partWidth, height, partHeight", width, partWidth, height, partHeight)

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

  rectangle(config) {
    const { scene } = config;
    const { posX } = config;
    const { posY } = config;
    const { setOrigin } = config;
    const { color } = config;
    const { alpha } = config;
    const { name } = config;
    const { width } = config;
    const { height } = config;
    // const { worldSize } = scene;


    const rectangle = scene.add.graphics();
    rectangle.fillStyle(color, alpha);
    rectangle.fillRect(0, 0, width, height);

    // const rt1 = scene.add.renderTexture(0, 0, worldSize.x, worldSize.y);
    const rt1 = scene.add.renderTexture(0, 0, width, height);

    rt1.draw(rectangle);

    rt1.saveTexture(name);
    rt1.destroy();

    rectangle.destroy();

    scene[name] = scene.add.image(posX, posY, name).setOrigin(setOrigin).setScale(1);
    scene[name].name = name;
  }
}

export default new Background();
