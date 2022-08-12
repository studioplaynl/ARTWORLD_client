/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import ManageSession from '../ManageSession';
import CoordinatesTranslator from './CoordinatesTranslator';
import SceneSwitcher from './SceneSwitcher';
import { updateQueryString } from '../helpers/UrlHelpers';
import { playerPosX, playerPosY } from '../playerState';

const { Phaser } = window;

// TODO This should probably all be just static functions

class Move {
  // checks if we are moving with keyboard arrowKeys
  moveByCursor(scene) {
    if (
      scene.cursors.up.isDown
      || scene.cursors.down.isDown
      || scene.cursors.left.isDown
      || scene.cursors.right.isDown
    ) {
      scene.cursorKeyIsDown = true;
    } else {
      scene.cursorKeyIsDown = false;
    }
  }

  // play moving animations
  movingAnimation(scene, animation) {
    if (animation === 'moving') {
      scene.player.anims.play(scene.playerMovingKey, true);
      scene.playerShadow.anims.play(scene.playerMovingKey, true);
    }

    if (animation === 'stop') {
      scene.player.anims.play(scene.playerStopKey, true);
      scene.playerShadow.anims.play(scene.playerStopKey, true);
    }
  }

  moveByKeyboard(scene) {
    const speed = 175;
    // const prevPlayerVelocity = scene.player.body.velocity.clone();

    // Stop any previous movement from the last frame, the avatar itself and the container that holds the pop-up buttons
    scene.player.body.setVelocity(0);

    // Horizontal movement
    if (scene.cursors.left.isDown) {
      scene.player.body.setVelocityX(-speed);

      // scene.cursorKeyIsDown = true;
      this.sendMovement(scene);
    } else if (scene.cursors.right.isDown) {
      scene.player.body.setVelocityX(speed);
      // scene.cursorKeyIsDown = true
    }

    // Vertical movement
    if (scene.cursors.up.isDown) {
      scene.player.body.setVelocityY(-speed);
      // scene.cursorKeyIsDown = true
      this.sendMovement(scene);
    } else if (scene.cursors.down.isDown) {
      scene.player.body.setVelocityY(speed);
      // scene.cursorKeyIsDown = true
      this.sendMovement(scene);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal,
    // the pop-up buttons are included
    scene.player.body.velocity.normalize().scale(speed);
  }

  moveObjectToTarget(scene, container, target, speed) {
    this.movingAnimation(scene, 'moving');
    // moving is done in Phaser coordinates, sending movement over the network is done in ArtworldCoordinates
    // we check if player stays in the world
    // keep the player in the world and send the moveTo commands
    if (target.x < 0) {
      target.x = 0 + ManageSession.avatarSize;
      ManageSession.cameraShake = true;
    }
    if (target.x > scene.worldSize.x) {
      target.x = scene.worldSize.x - ManageSession.avatarSize;
      ManageSession.cameraShake = true;
    }
    if (target.y < 0) {
      target.y = 0 + ManageSession.avatarSize;
      ManageSession.cameraShake = true;
    }
    if (target.y > scene.worldSize.y) {
      target.y = scene.worldSize.y - ManageSession.avatarSize;
      ManageSession.cameraShake = true;
    }

    // scene.physics.moveToObject(container, target, speed);
    const duration = speed * 0.5;

    scene.tweens.add({
      targets: container,
      x: target.x,
      y: target.y,
      paused: false,
      duration,
      onComplete: this.playerMovementTweenEnd.bind(this),
    });

    // send over the network
    // we pass on Phaser2D coordinates to ManageSession.sendMoveMessage
    // target is a vector

    this.updatePositionHistory(scene); // update the url and historyTracker

    // set movement over network
    ManageSession.sendMoveMessage(scene, target.x, target.y, 'moveTo');
  }

  playerMovementTweenEnd() {
    const scene = ManageSession.currentScene;
    const { Phaser2DToArtworldX, Phaser2DToArtworldY } = CoordinatesTranslator;

    if (ManageSession.cameraShake) {
      // camera shake when player walks into bounds of world
      // (duration, intensity)
      let shakeIntensity = 0.005;
      let shakeDuration = 200;
      // increase the intensity when camera is zoomed out
      if (scene.gameCam.zoom < 1) {
        shakeDuration *= 3;
        shakeIntensity = (shakeIntensity / scene.gameCam.zoom) * 2;
      }
      scene.cameras.main.shake(shakeDuration, shakeIntensity);
    }
    ManageSession.cameraShake = false;

    // send Stop command
    ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y, 'stop');

    this.updatePositionHistory(scene); // update the url and historyTracker

    // update last player position in manageSession for when the player is reloaded inbetween scenes
    playerPosX.set(Math.round(Phaser2DToArtworldX(scene.worldSize.x, scene.player.x)));
    playerPosY.set(Math.round(Phaser2DToArtworldY(scene.worldSize.y, scene.player.y)));

    // play "stop" animation
    this.movingAnimation(scene, 'stop');
    scene.isPlayerMoving = false;
  }

  updatePositionHistory(scene) {
    // const { Phaser2DToArtworldX, Phaser2DToArtworldY } = CoordinatesTranslator;

    // const passPosX = Phaser2DToArtworldX(scene.worldSize.x, scene.player.x);
    // const passPosY = Phaser2DToArtworldY(scene.worldSize.y, scene.player.y);

    // update url
    // updateQueryString();
    // setUrl(scene.location, passPosX, passPosY);
    // put the new pos in the history tracker
    // SceneSwitcher.updatePositionCurrentScene(passPosX, passPosY);
  }

  moveBySwiping(scene) {
    if (scene.input.activePointer.isDown && !scene.isClicking && ManageSession.playerIsAllowedToMove) {
      scene.isClicking = true;
    }
    if (!scene.input.activePointer.isDown && scene.isClicking) {
      // play "move" animation
      // play the animation as soon as possible so it is more visible
      this.movingAnimation(scene, 'moving');

      const playerX = scene.player.x;
      const playerY = scene.player.y;

      let swipeX = scene.input.activePointer.upX - scene.input.activePointer.downX;
      let swipeY = scene.input.activePointer.upY - scene.input.activePointer.downY;

      scene.swipeAmount.x = swipeX;
      scene.swipeAmount.y = swipeY;

      // we scale the travel distance to the zoomlevel
      const zoomFactor = scene.gameCam.zoom;
      swipeX /= zoomFactor;
      swipeY /= zoomFactor;

      // console.log("swipeX, swipeY", swipeX, swipeY)

      scene.swipeAmount.x = swipeX;
      scene.swipeAmount.y = swipeY;

      const moveSpeed = scene.swipeAmount.length() * 2;

      // we scale the arrival check (distanceTolerance) to the speed of the player
      scene.distanceTolerance = moveSpeed / 30;

      // console.log("moveBySwiping moveSpeed", moveSpeed)

      scene.isPlayerMoving = true; // to stop the player when it reached its destination

      scene.target.x = playerX + swipeX;
      scene.target.y = playerY + swipeY;

      // generalized moving method
      this.moveObjectToTarget(scene, scene.player, scene.target, moveSpeed);
      ManageSession.playerIsAllowedToMove = false;
      scene.isClicking = false;
    }
  }

  moveByDragging(scene) {
    if (scene.input.activePointer.isDown && !ManageSession.graffitiDrawing) {
      ManageSession.playerIsAllowedToMove = true;
      const pointerCurrentPositionX = scene.input.activePointer.position.x;
      const pointerCurrentPositionY = scene.input.activePointer.position.y;
      const pointerPrevPositionX = scene.input.activePointer.prevPosition.x;
      const pointerPrevPositionY = scene.input.activePointer.prevPosition.y;

      const movementX = pointerCurrentPositionX - pointerPrevPositionX;
      const movementY = pointerCurrentPositionY - pointerPrevPositionY;
      // console.log('movementX, movementY', movementX, movementY);

      // drag world
      scene.player.x -= movementX;
      scene.player.y -= movementY;

      // // drag player
      // scene.player.x -= movementX;
      // scene.player.y -= movementY;
    }
    // play "move" animation
    // play the animation as soon as possible so it is more visible
    // this.movingAnimation(scene, 'moving');

    // const playerX = scene.player.x;
    // const playerY = scene.player.y;



    // let swipeY = scene.input.activePointer.upY - scene.input.activePointer.downY;

    // scene.swipeAmount.x = swipeX;
    // scene.swipeAmount.y = swipeY;

    // // we scale the travel distance to the zoomlevel
    // const zoomFactor = scene.gameCam.zoom;
    // swipeX /= zoomFactor;
    // swipeY /= zoomFactor;

    // // console.log("swipeX, swipeY", swipeX, swipeY)

    // scene.swipeAmount.x = swipeX;
    // scene.swipeAmount.y = swipeY;

    // const moveSpeed = scene.swipeAmount.length() * 2;


    // // console.log("moveBySwiping moveSpeed", moveSpeed)

    // scene.isPlayerMoving = true; // to stop the player when it reached its destination

    // scene.target.x = playerX + swipeX;
    // scene.target.y = playerY + swipeY;

    // // generalized moving method
    // this.moveObjectToTarget(scene, scene.player, scene.target, moveSpeed);
    // ManageSession.playerIsAllowedToMove = false;
    // scene.isClicking = false;
  }


  moveByTapping(scene) {
    if (!scene.input.activePointer.isDown && ManageSession.playerIsAllowedToMove) {
      // doubletap: first time mouse up
      ManageSession.playerClicks = 1;

      ManageSession.playerClickTime = scene.time.now;
      // doubletap: second time mouse up
      scene.input.on('pointerup', () => {
        // doubletap: second time mouse up: count time in between clicks
        const clickDelay = scene.time.now - ManageSession.playerClickTime;

        // block too many clicks
        if (clickDelay < 350 && ManageSession.playerClicks === 1) {
          // block too many clicks
          ManageSession.playerClicks = 0;

          // play "move" animation
          // play the animation as soon as possible so it is more visible
          scene.isPlayerMoving = true; // activate moving animation

          const playerX = scene.player.x;
          const playerY = scene.player.y;

          // mouse point after doubletap is target
          scene.target.x = scene.input.activePointer.worldX;
          scene.target.y = scene.input.activePointer.worldY;

          scene.swipeAmount.x = playerX - scene.target.x;
          scene.swipeAmount.y = playerY - scene.target.y;

          const moveSpeed = scene.swipeAmount.length() * 2;

          // generalized moving method
          // send moveTo over network, calculate speed as function of distance
          this.moveObjectToTarget(
            scene,
            scene.player,
            scene.target,
            moveSpeed,
          );
        }
      });
      scene.isClicking = false;
      ManageSession.playerIsAllowedToMove = false;
    }
  }

  sendMovement(scene) {
    // send the player position as artworldCoordinates, because we store in artworldCoordinates on the server
    // moveTo or Stop
    ManageSession.sendMoveMessage(
      scene,
      scene.player.x,
      scene.player.y,
    );
    // console.log(this.player.x)
    ManageSession.updateMovementTimer = 0;
  }
}
export default new Move();
