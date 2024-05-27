// eslint-disable-next-line no-unused-vars
import { dlog } from '../../../helpers/debugLog';
import ManageSession from '../ManageSession';

import * as Phaser from 'phaser';

class GraffitiWall {
  create(scene, x, y, width, height, name, color, imageFile = null) {
    // we name the container as this.[name] so we can reference it later
    scene[name] = scene.add.container();
    scene[name].name = name;
    // add a border around the graffiti wall to be able to drag it when in gameEdit Mode
    const draggableBorder = 10;

    // add a tool palette to the right
    // const toolPaletteSpace = 80;

    scene[name].setSize(width + draggableBorder, height + draggableBorder);

    // checking if a drawing wall has a front image
    if (imageFile) {
      const graffitiWall = scene.add.image(0, 0, imageFile).setOrigin(0.5).setDepth(198);
      graffitiWall.displayWidth = width;
      graffitiWall.displayHeight = height;
      scene[name].add(graffitiWall);
    }

    const rt = scene.add.renderTexture(0, 0, width, height).setInteractive().setDepth(199).setName(name);

    scene[name].add(rt);
    scene[name].setSize(width + 40, height + 40);

    scene.input.keyboard.on('keydown-SPACE', () => {
      rt.clear();
    });

    rt.on('pointerdown', (pointer) => {
      // dlog('graffiti wall');

      ManageSession.graffitiDrawing = true;
      this.isClicking = true;
      ManageSession.playerIsAllowedToMove = false;

      const hexColor = Phaser.Display.Color.HexStringToColor(color);

      rt.draw(
        'brush',
        pointer.worldX - scene[name].x + width / 2,
        pointer.worldY - scene[name].y + height / 2,
        1,
        hexColor.color
      );
    });

    // make an array with current and previous mouse point, to interpolate between them
    let previousPointer = []; // an array of Vec2 for worldX and worldY
    let points = [];

    rt.on('pointermove', (pointer) => {
      if (pointer.isDown) {
        // const line1 = new Phaser.Curves.Line([0, 0, 0, 0]);
        // var points = pointer.getInterpolatedPosition(30)
        ManageSession.graffitiDrawing = true;
        this.isClicking = true;
        ManageSession.playerIsAllowedToMove = false;
        const hexColor = Phaser.Display.Color.HexStringToColor(color);

        previousPointer.push(
          new Phaser.Math.Vector2(pointer.worldX, pointer.worldY) // an array of Vec2 for worldX and worldY
        );

        if (previousPointer.length > 1) {
          // create an array of interpolated points between the first and second entry of the previousPointer array
          // deleting the first and second entries

          // create a line of previousPointer[0] and previousPointer[1]
          const line1 = new Phaser.Curves.Line([
            previousPointer[0].x,
            previousPointer[0].y,
            previousPointer[1].x,
            previousPointer[1].y,
          ]);
          previousPointer.splice(0, 1);

          // get the interpolated points on the line, with interpolation factor
          points = line1.getPoints(16);
        }

        points.forEach((p) => {
          // dlog("p", p)
          rt.draw('brush', p.x - scene[name].x + width / 2, p.y - scene[name].y + height / 2, 1, hexColor.color);
        });

        // // old drawing - without interpolation
        // this.draw(
        //   'brush',
        //   pointer.worldX - scene[name].x + (width / 2),
        //   pointer.worldY - scene[name].y + (height / 2),
        //   1,
        //   hexColor.color,
        // );
      }
    });

    rt.on(
      'pointerup',
      () => {
        ManageSession.graffitiDrawing = false;

        // empty the array of previous point when lifting the pointer
        previousPointer = [];
        points = [];
        // rt.snapshot(async (image) => {

        //   const displayName = "testRenderTexture"
        //   const name = displayName
        //   const type = "drawing"
        //   const json = ""
        //   const status = true
        //   const version = 1
        //   dlog("image", image.src)

        //   var blobData = await dataURItoBlob(image.src)
        //   uploadImage(name, type, json, blobData, status, version, displayName)
        // })
      },
      this
    );

    scene[name].x = x;
    scene[name].y = y;
  }
}

// TODO store a drawing server side
// function dataURItoBlob(dataURI) {
//   const binary = atob(dataURI.split(',')[1]);
//   const array = [];
//   for (let i = 0; i < binary.length; i++) {
//     array.push(binary.charCodeAt(i));
//   }
//   return new Blob([new Uint8Array(array)], { type: 'image/png' });
// }

export default new GraffitiWall();
