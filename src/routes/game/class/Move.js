/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import ManageSession from '../ManageSession';
import CoordinatesTranslator from './CoordinatesTranslator';
import { PlayerPos } from '../playerState';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../../../helpers/debugLog';
import { AVATAR_BASE_SIZE } from '../../../constants';

import * as Phaser from 'phaser';

class Move {
  constructor() {
    PlayerPos.subscribe((pos) => {
      // dlog('PlayerPos.subscribe this.moveByPositionStores(pos)');
      // dlog('PlayerHistory', get(PlayerHistory));
      this.moveByPositionStores(pos);
    });
  }

  /** Respond to changes in PlayerPos stores ( controlled through URLs or direct manipulation) */
  moveByPositionStores(pos) {
    const { artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;

    const scene = ManageSession.currentScene;
    if (!scene) return;
    if (pos.x !== null) {
      scene.player.x = artworldToPhaser2DX(scene.worldSize.x, pos.x);
    }
    if (pos.y !== null) {
      scene.player.y = artworldToPhaser2DY(scene.worldSize.y, pos.y);
    }
    //! is this why we didn't see first position of network player?
    // Not working yet 100%, server side last position is not stored? Or
    // that position is not parsed in onlinePlayers?
    this.sendMovement(scene);
  }

  // checks if we are moving with keyboard arrowKeys
  moveByCursor(scene) {
    if (
      scene.cursors.up.isDown ||
      scene.cursors.down.isDown ||
      scene.cursors.left.isDown ||
      scene.cursors.right.isDown
    ) {
      ManageSession.cursorKeyIsDown = true;
    } else {
      ManageSession.cursorKeyIsDown = false;
    }
  }

  // play moving animations
  movingAnimation(scene, animation) {
    // dlog('movingAnimation');
    if (animation === 'moving') {
      // dlog('movingAnimation moving');
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

      // ManageSession.cursorKeyIsDown = true;
      this.sendMovement(scene);
    } else if (scene.cursors.right.isDown) {
      scene.player.body.setVelocityX(speed);
      // ManageSession.cursorKeyIsDown = true
    }

    // Vertical movement
    if (scene.cursors.up.isDown) {
      scene.player.body.setVelocityY(-speed);
      // ManageSession.cursorKeyIsDown = true
      this.sendMovement(scene);
    } else if (scene.cursors.down.isDown) {
      scene.player.body.setVelocityY(speed);
      // ManageSession.cursorKeyIsDown = true
      this.sendMovement(scene);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal,
    // the pop-up buttons are included
    scene.player.body.velocity.normalize().scale(speed);
  }

  moveObjectToTarget(scene, container, target, distance) {
    this.movingAnimation(scene, 'moving');
    // dlog('this.moveObjectToTarget');
    // moving is done in Phaser coordinates, sending movement over the network is done in ArtworldCoordinates
    // we check if player stays in the world
    // keep the player in the world and send the moveTo commands
    if (target.x < 0) {
      target.x = 0 + AVATAR_BASE_SIZE;
      ManageSession.cameraShake = true;
    }
    if (target.x > scene.worldSize.x) {
      target.x = scene.worldSize.x - AVATAR_BASE_SIZE;
      ManageSession.cameraShake = true;
    }
    if (target.y < 0) {
      target.y = 0 + AVATAR_BASE_SIZE;
      ManageSession.cameraShake = true;
    }
    if (target.y > scene.worldSize.y) {
      target.y = scene.worldSize.y - AVATAR_BASE_SIZE;
      ManageSession.cameraShake = true;
    }

    // scene.physics.moveToObject(container, target, speed);
    const duration = distance * 0.5;

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

    // set movement over network
    ManageSession.sendMoveMessage(scene, target.x, target.y, 'moveTo');
  }

  playerMovementTweenEnd() {
    const scene = ManageSession.currentScene;
    const { phaser2DToArtworldX, phaser2DToArtworldY } = CoordinatesTranslator;
    // dlog('this.playerMovementTweenEnd');
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
    // we dont send the stop command, we stop the animation locally when the moveTo tween is finished
    // ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y, 'stop');
    // dlog('ManageSession.sendMoveMessage', scene.player.x, scene.player.y, 'stop');
    // update last player position in PlayerPos for when the player is reloaded inbetween scenes
    PlayerPos.set({
      x: Math.round(phaser2DToArtworldX(scene.worldSize.x, scene.player.x)),
      y: Math.round(phaser2DToArtworldY(scene.worldSize.y, scene.player.y)),
    });

    // play "stop" animation
    this.movingAnimation(scene, 'stop');
  }

  moveBySwiping(scene) {
    if (scene.input.activePointer.downX !== scene.input.activePointer.upX) {
      if (
        scene.input.activePointer.isDown &&
        !ManageSession.isClicking &&
        ManageSession.playerIsAllowedToMove
      ) {
        ManageSession.isClicking = true;
      }
      if (!scene.input.activePointer.isDown && ManageSession.isClicking) {
        // play "move" animation
        // play the animation as soon as possible so it is more visible
        this.movingAnimation(scene, 'moving');

        const playerX = scene.player.x;
        const playerY = scene.player.y;

        let swipeX =
          scene.input.activePointer.upX - scene.input.activePointer.downX;
        let swipeY =
          scene.input.activePointer.upY - scene.input.activePointer.downY;

        ManageSession.swipeAmount.x = swipeX;
        ManageSession.swipeAmount.y = swipeY;

        // we scale the travel distance to the zoomlevel
        const zoomFactor = scene.gameCam.zoom;
        swipeX /= zoomFactor;
        swipeY /= zoomFactor;

        // dlog("swipeX, swipeY", swipeX, swipeY)

        ManageSession.swipeAmount.x = swipeX;
        ManageSession.swipeAmount.y = swipeY;

        const moveSpeed = ManageSession.swipeAmount.length() * 2;

        // we scale the arrival check (distanceTolerance) to the speed of the player
        ManageSession.distanceTolerance = moveSpeed / 30;

        // dlog("moveBySwiping moveSpeed", moveSpeed)

        this.movingAnimation(scene, 'stop'); // to stop the player when it reached its destination

        ManageSession.target.x = playerX + swipeX;
        ManageSession.target.y = playerY + swipeY;

        // generalized moving method
        this.moveObjectToTarget(
          scene,
          scene.player,
          ManageSession.target,
          moveSpeed,
        );
        ManageSession.playerIsAllowedToMove = false;
        ManageSession.isClicking = false;
      }
    }
  }

  moveByDragging(movementData) {
    const scene = ManageSession.currentScene;
    const { dragX } = movementData;
    const { dragY } = movementData;
    const { moveCommand } = movementData;
    // dlog('dragX, dragY, moveCommand', dragX, dragY, moveCommand);

    if (moveCommand === 'stop') {
      this.movingAnimation(scene, 'stop');
      // send current position over the network

      // when we stop dragging, we send the final position over the network
      //
      ManageSession.target.x = scene.player.x;
      ManageSession.target.y = scene.player.y;

      const tempVec = new Phaser.Math.Vector2(0, 0);
      tempVec.x = ManageSession.lastMoveCommand.posX;
      tempVec.y = ManageSession.lastMoveCommand.posY;

      const moveDistance = 0;
      // dlog('moveDistance: ', moveDistance);

      // this creates a double movement animation: replace by sendMovement and timedEvent with Stop
      this.moveObjectToTarget(
        scene,
        tempVec,
        ManageSession.target,
        moveDistance,
      );
    }
    if (moveCommand === 'moving') {
      // drag player
      this.movingAnimation(scene, 'moving');
      scene.player.x -= dragX;
      scene.player.y -= dragY;

      // keep player within world bounds
      const halfAvatarSize = AVATAR_BASE_SIZE / 2;

      if (scene.player.x > scene.worldSize.x - halfAvatarSize)
        scene.player.x = scene.worldSize.x - halfAvatarSize;
      if (scene.player.x < 0 + halfAvatarSize) scene.player.x = halfAvatarSize;
      if (scene.player.y > scene.worldSize.y - halfAvatarSize)
        scene.player.y = scene.worldSize.y - halfAvatarSize;
      if (scene.player.y < 0 + halfAvatarSize) scene.player.y = halfAvatarSize;
    }
  }

  moveByTapping(scene) {
    this.movingAnimation(scene, 'moving');

    const playerX = scene.player.x;
    const playerY = scene.player.y;

    // mouse point after doubletap is target
    ManageSession.target.x = scene.input.activePointer.worldX;
    ManageSession.target.y = scene.input.activePointer.worldY;

    ManageSession.swipeAmount.x = playerX - ManageSession.target.x;
    ManageSession.swipeAmount.y = playerY - ManageSession.target.y;

    const moveSpeed = ManageSession.swipeAmount.length() * 2;

    // dlog("moveByTapping moveSpeed", moveSpeed)

    // generalized moving method
    // send moveTo over network, calculate speed as function of distance
    this.moveObjectToTarget(
      scene,
      scene.player,
      ManageSession.target,
      moveSpeed,
    );

    ManageSession.isClicking = false;
    ManageSession.playerIsAllowedToMove = false;
  }

  sendMovement(scene) {
    // send the player position as artworldCoordinates, because we store in artworldCoordinates on the server
    // moveTo or Stop
    ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y);
    // dlog(this.player.x)
    ManageSession.updateMovementTimer = 0;
  }
}
export default new Move();
