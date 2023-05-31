/* eslint-disable camelcase */
import ManageSession from '../ManageSession';
import {
  getAccount, updateObject, listObjects, updateObjectAdmin,
} from '../../../helpers/nakamaHelpers';
import CoordinatesTranslator from './CoordinatesTranslator';

import { dlog } from '../../../helpers/debugLog';

const { Phaser } = window;

class DebugFuntions {
  constructor() {
    this.shiftDown = false;
    this.fullScreenMode = false;
  }

  // DebugFuntions.keyboard
  keyboard(scene) {
    // combo ALT SHIT E F
    scene.input.keyboard.createCombo([16, 18, 69, 70], { resetOnMatch: true });

    scene.input.keyboard.on('keycombomatch', () => {
      if (ManageSession.gameEditMode) {
        ManageSession.gameEditMode = false;
        dlog('EDIT MODE off');
        scene.events.emit('gameEditMode', 'off');
      } else {
        ManageSession.gameEditMode = true;
        dlog('EDIT MODE on');
        scene.events.emit('gameEditMode', 'on');
      }
    });

    // check all key up events
    // only activate debug functions when in edit mode
    scene.input.keyboard.on('keyup', (event) => {
      if (ManageSession.gameEditMode) {
        // dlog(event)
        this.debugUpKeys(scene, event.code);
      }
    }, this);

    // only activate debug functions when in edit mode
    scene.input.keyboard.on('keydown', (event) => {
      // events for gameEdit mode, like scaling a selected object
      if (ManageSession.gameEditMode) {
        // dlog(event)
        this.debugDownKeys(scene, event.code);
      }
    }, this);
  }

  debugDownKeys(scene, code) {
    const {
      selectedGameObject,
      selectedGameObject_startScale,
      selectedGameObject_startPosition,
    } = ManageSession;
    let rotation;

    switch (code) {
      case 'ShiftLeft':
        this.shiftDown = true;
        break;

      case 'ShiftRight':
        this.shiftDown = true;
        break;

      case 'Equal':
        if (this.shiftDown) {
          let { scale } = selectedGameObject;
          scale += 0.01;

          selectedGameObject.setScale(scale);
          // dlog("scale", scale)
        } else {
          selectedGameObject.setScale(selectedGameObject_startScale);
        }

        break;

      case 'Minus':
        if (this.shiftDown) {
          let { scale } = selectedGameObject;
          scale -= 0.01;
          if (scale < 0.01) {
            scale = 0.01;
          }
          selectedGameObject.setScale(scale);
          // dlog("scale", scale)
        } else {
          selectedGameObject.setPosition(
            selectedGameObject_startPosition.x,
            selectedGameObject_startPosition.y,
          );
        }
        break;

      case 'KeyR':
        rotation = selectedGameObject.rotation;
        rotation += 0.05;
        selectedGameObject.setRotation(
          rotation,
        );

        break;

      case 'KeyT':
        rotation = selectedGameObject.rotation;
        rotation -= 0.05;
        selectedGameObject.setRotation(
          rotation,
        );

        break;

      default:
        // dlog(code)
        break;
    }
  }

  debugUpKeys(scene, code) {
    // avoid E F -> already used for edit mode

    // edit mode to activate debugKeyboard

    // code: AltLeft, KeyS, Digit1 -> always the same for alphabet and digits
    // key: Alt, s, Shift, 1 -> always small key, also with shift, except with CAPS
    // keyCode: 18, 83, 49
    //! keyU reserved for updating homes as ADMIN

    const {
      currentScene,
      userProfile,
      createOnlinePlayers,
      allConnectedUsers,
      selectedGameObject,
    } = ManageSession;

    const { Phaser2DToArtworldX, Phaser2DToArtworldY } = CoordinatesTranslator;

    switch (code) {
      case ('ArrowRight'):
        // reserverd for moving the camera in EditMode
        currentScene.player.x += 50;
        currentScene.playerShadow.x += 50;
        break;

      case ('ArrowLeft'):
        // reserverd for moving the camera in EditMode
        currentScene.player.x -= 50;
        currentScene.playerShadow.x -= 50;
        break;

      case ('ArrowUp'):
        // reserverd for moving the camera in EditMode
        currentScene.player.y -= 50;
        currentScene.playerShadow.y -= 50;
        break;

      case ('ArrowDown'):
        // reserverd for moving the camera in EditMode
        currentScene.player.y += 50;
        currentScene.playerShadow.y += 50;
        break;

      case 'KeyA':
        dlog(code);
        dlog('scene.tweens.getAllTweens(): ', currentScene.tweens.getAllTweens());
        break;

      case 'Digit1':
        dlog(code);

        Promise.all([
          listObjects('liked', userProfile.id, 10),
        ])
          .then((rec) => {
            dlog('liked query', rec.objects[0]);
          });
        // ManageSession.getStreamUsers("get_users", scene.location)
        // listObjects("addressbook", userProfile.id, 10)

        Promise.all([
          listObjects('addressbook', userProfile.id, 10),
        ])
          .then((rec) => {
            dlog('addressbook query', rec.objects[0]);
          });
        break;

      case 'Digit2':
        dlog(code);

        currentScene.player.anims.play(scene.playerMovingKey, true);
        currentScene.playerShadow.anims.play(scene.playerMovingKey, true);
        break;

      case 'Digit3':
        dlog(code);

        dlog('offending scene.userStopmotionServerList.array', currentScene.userStopmotionServerList.array);
        dlog('offending ManageSession.resolveErrorObjectArray', ManageSession.resolveErrorObjectArray);

        break;


      case 'KeyD':
        dlog(code);

        // list all images in the textureManager
        dlog(currentScene.textures.list);

        // Return an array listing the events for which the emitter has registered listeners.
        dlog('Return an array listing the events for which the emitter has registered listeners: ');
        dlog(currentScene.textures.eventNames());

        dlog(currentScene.children); // get the whole DisplayList

        break;

      case 'KeyG':
        dlog(code);
        dlog('scene.onlinePlayers: ', currentScene.onlinePlayers);
        dlog('ManageSession.allConnectedUsers: ', allConnectedUsers);
        dlog('onlinePlayerGroup Children: ', currentScene.onlinePlayersGroup.getChildren());
        dlog('scene.player: ', currentScene.player);

        break;

      case 'KeyT':
        dlog(code);
        dlog('userProfile: ', userProfile);
        dlog('ManageSession.createOnlinePlayers: ', createOnlinePlayers);

        break;

      case 'KeyY':
        dlog(code);
        getAccount();
        break;

      case 'KeyW':
        dlog(code);
        listObjects('addressbook', userProfile.id, 10);
        break;

      case 'KeyH':
        dlog(code);
        if (this.fullScreenMode) {
          this.fullScreenMode = !this.fullScreenMode;
          currentScene.scale.startFullscreen();
        } else {
          currentScene.scale.stopFullscreen();
          this.fullScreenMode = !this.fullScreenMode;
        }
        break;

      case 'KeyS':
        dlog(code);
        {
          const value = {
            user_id: 'b9ae6807-1ce1-4b71-a8a3-f5958be4d340',
            posX: '100',
            posY: '500',
          };
          const type = 'addressbook';
          const name = `${type}_${userProfile.id}`;
          const pub = 2;
          updateObject(type, name, JSON.stringify(value), pub);
        }

        break;

      case 'KeyU':
        //! reserved for updating homes as ADMIN
        dlog(code);


        dlog('a selected home will be saved server side');
        dlog('selectedGameObject container:', selectedGameObject);

        // we check if the selected gameObject is a Home by looking if it has .locationDestination = "DefaultUserHome"
        if (selectedGameObject.locationDestination === 'DefaultUserHome') {
          const updatedPosition = new Phaser.Math.Vector2(
            Phaser2DToArtworldX(currentScene.worldSize.x, selectedGameObject.x),
            Phaser2DToArtworldY(currentScene.worldSize.y, selectedGameObject.y),
          );

          dlog('updated position = ', updatedPosition);
          // dlog('scene.homes', currentScene.homes);
          const selectedHomeObject = currentScene.homes.find(
            (element) => element.user_id === selectedGameObject.userHome,
          );
          dlog('selectedHomeObject ', selectedHomeObject);

          // replace the posX and posY of the selectedHomeObject with updatedPosition
          dlog('selectedHomeObject.value', selectedHomeObject.value);
          selectedHomeObject.value.posX = updatedPosition.x;
          selectedHomeObject.value.posY = updatedPosition.y;
          dlog('selectedHomeObject.value replaced: ', selectedHomeObject.value);

          const idObject = selectedHomeObject.user_id;
          const typeObject = selectedHomeObject.collection;
          const nameObject = selectedHomeObject.key;
          const valueObject = selectedHomeObject.value;
          const pubObject = 2;

          updateObjectAdmin(idObject, typeObject, nameObject, valueObject, pubObject);
        } else {
          dlog('The selected gameObject is not a user Home');
        }

        break;

      case 'KeyP':
        dlog(code);

        break;

      case 'KeyI':
        dlog(code);
        dlog('Display Mouse coordinates');
        dlog(
          'World Coordinates: ',
          currentScene.input.mousePointer.worldX,
          currentScene.input.mousePointer.worldY,
        );
        dlog(
          'artworldCoordinates: ',
          Phaser2DToArtworldX(currentScene.worldSize.x, scene.input.activePointer.worldX),
          Phaser2DToArtworldX(currentScene.worldSize.y, scene.input.activePointer.worldY),
        );

        break;



      case 'Equal':
      case 'Minus':
        if (this.shiftDown) {
          dlog(
            `editMode info scale: ${selectedGameObject.scale}`,
            `width*scale: ${Math.round(selectedGameObject.width * selectedGameObject.scale)}`,
            `height*scale: ${Math.round(selectedGameObject.height * selectedGameObject.scale)}`,
            `name:${selectedGameObject.name}`,
          );
        }
        break;

      case 'ShiftLeft':
      case 'ShiftRight':
        this.shiftDown = false;
        break;

      default:
        // dlog(code)
        break;
    }
  }
}

export default new DebugFuntions();
