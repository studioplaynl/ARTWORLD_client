// import { Liked } from '../../../storage';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../helpers/DebugLog';
import CoordinatesTranslator from './CoordinatesTranslator';
import ManageSession from '../ManageSession';

// const { Phaser } = window;

class PlaceElement {
  // constructor() {
  // }

  image(config) {
    const {
      x, y, name, file, scale, rotation, alpha, tint, scene, flipX,
    } = config;

    // const { worldSize } = ManageSession;
    dlog('scene: ', scene);


    // scene[name] =
    scene[name] = scene.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(ManageSession.worldSize.x, x),
      CoordinatesTranslator.artworldToPhaser2DY(ManageSession.worldSize.y, y),
      file,
    );
    scene[name].name = name;
    scene[name].setScale(scale);

    if (rotation) {
      scene[name].rotation = rotation;
    }
    dlog('alpha: ', alpha);
    if (alpha) {
      dlog('alpha: ', alpha);

      scene[name].setAlpha(alpha);
      dlog('scene[name]', scene[name]);
    }
    if (tint) {
      scene[name].setTint(tint);
    }
    if (flipX) {
      scene[name].flipX = flipX;
    }

    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      scene[name].setInteractive({ draggable: true });
    }
  }
}

export default new PlaceElement();
