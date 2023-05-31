/* eslint-disable no-param-reassign */
import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import Move from '../class/Move';
import { PlayerZoom } from '../playerState';
import Background from '../class/Background';
import { dlog } from '../../../helpers/debugLog';
import { ShowItemsBar } from '../../../session';

/**   needed for EDITMODE: dragging objects and getting info about them in console
 *    scene context is passed on
 */
export function handleEditMode(scene) {
  scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    if (ManageSession.gameEditMode) {
      gameObject.setPosition(dragX, dragY);

      const splitGameObjectName = gameObject.name.split('_');
      if (splitGameObjectName[0] === 'handle') {
        gameObject.data.get('vector').set(dragX, dragY); // get the vector data for curve handle objects
      }
    }
  }, scene);

  scene.input.on('dragend', (pointer, gameObject) => {
    if (ManageSession.gameEditMode) {
      const worldX = Math.round(CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, gameObject.x));
      const worldY = Math.round(CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, gameObject.y));
      // store the original scale when selecting the gameObject for the first time
      if (ManageSession.selectedGameObject !== gameObject) {
        ManageSession.selectedGameObject = gameObject;
        ManageSession.selectedGameObjectStartScale = gameObject.scale;
        ManageSession.selectedGameObjectStartPosition.x = gameObject.x;
        ManageSession.selectedGameObjectStartPosition.y = gameObject.y;
        dlog('editMode info startScale:', ManageSession.selectedGameObjectStartScale);
      }
      // ManageSession.selectedGameObject = gameObject

      dlog(
        'editMode info posX posY: ',
        worldX,
        worldY,
        'scale:',
        ManageSession.selectedGameObject.scale,
        'rotation:',
        ManageSession.selectedGameObject.rotation,
        'width*scale:',
        Math.round(ManageSession.selectedGameObject.width * ManageSession.selectedGameObject.scale),
        'height*scale:',
        Math.round(ManageSession.selectedGameObject.height * ManageSession.selectedGameObject.scale),
        'name:',
        ManageSession.selectedGameObject.name,
      );
    }
  }, scene);
}

/**   handles player movement; dragging and double tapping
 *      for dragging a background rectangle is created to detect appropiate mouse down states
 *      movement is handles in the Move class
 *      scene context is passed on
 *
 *    In GameEdit mode moving by dragging is disabled, double tap and keyboard arrow moving works
 */
export function handlePlayerMovement(scene) {
  // DETECT dragging and mouseDown on rectangle
  Background.bigRectangleScaled({
    scene,
    posX: 0,
    posY: 0,
    color: 0xffff00,
    alpha: 1,
    width: scene.worldSize.x,
    height: scene.worldSize.y,
    name: 'touchBackgroundCheck',
    setOrigin: 0,
  });

  scene.swipeInput = scene.rexGestures.add.rotate()
    .on('drag1start', () => {
      // ManageSession.playerIsAllowedToMove = true;
      scene.input.manager.canvas.style.cursor = 'grabbing';
    })
    .on('drag1', (drag) => {
      if (ManageSession.playerIsAllowedToMove && !ManageSession.gameEditMode) {
        const dragX = drag.drag1Vector.x / get(PlayerZoom);
        const dragY = drag.drag1Vector.y / get(PlayerZoom);

        const moveCommand = 'moving';
        const movementData = { dragX, dragY, moveCommand };
        Move.moveByDragging(movementData);
        ManageSession.movingByDragging = true;
      }
    })
    .on('drag1end', () => {
      // dlog("dragend")
      if (ManageSession.movingByDragging && !ManageSession.gameEditMode) {
        scene.input.manager.canvas.style.cursor = 'default';
        const moveCommand = 'stop';
        const dragX = 0;
        const dragY = 0;
        const movementData = { dragX, dragY, moveCommand };
        Move.moveByDragging(movementData);
        ManageSession.movingByDragging = false;
        ManageSession.playerIsAllowedToMove = false;
      }
    });
  // end DETECT dragging and mouseDown on rectangle

  // DoubleClick for moveByTapping
  scene.tapInput = scene.rexGestures.add.tap({
    enable: true,
    // bounds: undefined,
    time: 250,
    tapInterval: 350,
    // threshold: 9,
    // tapOffset: 10,
    // taps: undefined,
    // minTaps: undefined,
    // maxTaps: undefined,
  })
    .on('tap', () => {
      // dlog('tap');
      // clickOutside is not working on iOS
      ShowItemsBar.set(false);
    }, scene)
    .on('tappingstart', () => {
      // dlog('tapstart');
    })
    .on('tapping', (tap) => {
      // dlog('tapping', tap.tapsCount);
      if (tap.tapsCount === 2) {
        if (ManageSession.playerIsAllowedToMove) {
          Move.moveByTapping(scene);
        }
      }
    });
  // end doubleClick for moveByTapping

  // PINCH TO ZOOM
  const pinch = scene.rexGestures.add.pinch({
    // enable: true,
    // bounds: undefined,

    // threshold: 0,
    /* threshold : Fire pinch events after dragging distances
    of catched pointers are larger than this threshold. */

  });

  pinch.on('pinch', (dragScale) => {
    const { scaleFactor } = dragScale;
    PlayerZoom.pinch(scaleFactor);
  });
}

