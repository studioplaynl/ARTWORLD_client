// import { Liked } from '../../../storage';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../../../helpers/debugLog';
import CoordinatesTranslator from './CoordinatesTranslator';
import ManageSession from '../ManageSession';

class PlaceElement {
  // eslint-disable-next-line class-methods-use-this
  image(config) {
    const {
      x, y, file, scale, rotation, alpha, tint, scene, flipX, draggable, depth,
    } = config;

    let { name } = config;

    if (!name) {
      name = file;
    }

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

    if (alpha) {
      scene[name].setAlpha(alpha);
    }
    if (tint) {
      scene[name].setTint(tint);
    }
    if (flipX) {
      scene[name].flipX = flipX;
    }
    if (depth) {
      scene[name].setDepth(depth);
    }

    /** if an element is editable, draggable,
     * when the element in screen filling it does not need to be draggable (is annoying even)
     * we set elements draggable for edit mode by restarting the scene and checking for a flag */
    if (ManageSession.gameEditMode && !!draggable) {
      scene[name].setInteractive({ draggable: true });
    }
  }
}

export default new PlaceElement();
