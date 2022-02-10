import ManageSession from "../ManageSession"
import CoordinatesTranslator from "./CoordinatesTranslator"
import { listObjects, listImages, convertImage, getFullAccount, updateObject, getAccount } from "../../../api.js"
import HistoryTracker from "./HistoryTracker"
import ArtworkList from "./ArtworkList"
import R_UI from "./R_UI"


class Move {
  constructor() { }

  moveByCursor(scene) {
    if (
      scene.cursors.up.isDown ||
      scene.cursors.down.isDown ||
      scene.cursors.left.isDown ||
      scene.cursors.right.isDown
    ) {
      scene.cursorKeyIsDown = true
    } else {
      scene.cursorKeyIsDown = false
    }
  }

  movingAnimation(scene, animation) {
    if (animation == "moving") {
      scene.player.anims.play(scene.playerMovingKey, true)
      scene.playerShadow.anims.play(scene.playerMovingKey, true)
    }

    if (animation == "stop") {
      scene.player.anims.play(scene.playerStopKey, true)
      scene.playerShadow.anims.play(scene.playerStopKey, true)
    }
  }

  moveByKeyboard(scene) {
    const speed = 175
    const prevPlayerVelocity = scene.player.body.velocity.clone()

    // Stop any previous movement from the last frame, the avatar itself and the container that holds the pop-up buttons
    scene.player.body.setVelocity(0)

    // Horizontal movement
    if (scene.cursors.left.isDown) {
      scene.player.body.setVelocityX(-speed)

      // scene.cursorKeyIsDown = true;
      this.sendMovement(scene);
    } else if (scene.cursors.right.isDown) {
      scene.player.body.setVelocityX(speed)
      // scene.cursorKeyIsDown = true
      // sendPlayerMovement(scene)
    }

    // Vertical movement
    if (scene.cursors.up.isDown) {
      scene.player.body.setVelocityY(-speed)
      // scene.cursorKeyIsDown = true
      this.sendMovement(scene)
    } else if (scene.cursors.down.isDown) {
      scene.player.body.setVelocityY(speed)
      // scene.cursorKeyIsDown = true
      this.sendMovement(scene)
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal, the pop-up buttons are included
    scene.player.body.velocity.normalize().scale(speed)
  }

  moveObjectToTarget(scene, container, target, speed) {
    scene.physics.moveToObject(container, target, speed)
    //send over the network
    // we pass on Phaser2D coordinates to ManageSession.sendMoveMessage
    // target is a vector

    ManageSession.sendMoveMessage(scene, target.x, target.y, "moveTo")

    //play "move" animation
    this.movingAnimation(scene, "moving")
  }

  checkIfPlayerIsMoving(scene) {
    //  10 is our distance tolerance, i.e. how close the source can get to the target
    //  before it is considered as being there. The faster it moves, the more tolerance is required.
    if (scene.playerIsMovingByClicking) {

      // calculate distance only when playerIsMovingByClicking
      scene.distance = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, scene.target.x, scene.target.y)
      if (scene.distance < 10) {
        scene.player.body.reset(scene.target.x, scene.target.y)
        // send Stop command
        ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y, "stop")

        //play "stop" animation
        this.movingAnimation(scene, "stop")

        scene.playerIsMovingByClicking = false
      }
    }
  }

  moveBySwiping(scene) {
    if (scene.input.activePointer.isDown && scene.isClicking == false && scene.graffitiDrawing == false) {
      scene.isClicking = true
    }
    if (!scene.input.activePointer.isDown && scene.isClicking == true && scene.graffitiDrawing == false) {
      const playerX = scene.player.x
      const playerY = scene.player.y

      scene.swipeAmount.x = scene.input.activePointer.upX - scene.input.activePointer.downX
      scene.swipeAmount.y = scene.input.activePointer.upY - scene.input.activePointer.downY

      let moveSpeed = scene.swipeAmount.length()
      if (moveSpeed > 600) moveSpeed = 600 //! optimize

      scene.playerIsMovingByClicking = true // trigger moving animation

      scene.target.x = playerX + scene.swipeAmount.x
      scene.target.y = playerY + scene.swipeAmount.y

      // generalized moving method
      this.moveObjectToTarget(scene, scene.player, scene.target, moveSpeed * 2)
      scene.isClicking = false
    }
  }

  moveByTapping(scene) {
    if (scene.input.activePointer.isDown && scene.isClicking == false && scene.graffitiDrawing == false) {
      scene.isClicking = true
    }
    if (!scene.input.activePointer.isDown && scene.isClicking == true && scene.graffitiDrawing == false) {
      //doubletap: first time mouse up
      let lastTime = 0
      //doubletap: second time mouse down
      scene.input.on("pointerdown", () => {
        //doubletap: second time mouse down: count time
        let clickDelay = scene.time.now - lastTime

        lastTime = scene.time.now
        if (clickDelay < 350 && scene.graffitiDrawing == false) {
          //mouse point after doubletap is target
          scene.target.x = scene.input.activePointer.worldX
          scene.target.y = scene.input.activePointer.worldY

          scene.playerIsMovingByClicking = true // activate moving animation

          // generalized moving method
          this.moveObjectToTarget(scene, scene.player, scene.target, 450) // send moveTo over network, calculate speed as function of distance
        }
      })
      scene.isClicking = false
    }
  }

  sendMovement(scene) {
    if (scene.createdPlayer) {
      //send the player position as artworldCoordinates, because we store in artworldCoordinates on the server
      //moveTo or Stop
      ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y)
      //console.log(this.player.x)
      ManageSession.updateMovementTimer = 0
      // }
      // this.scrollablePanel.x = this.player.x
      // this.scrollablePanel.y = this.player.y + 150
    }
  }

  identifySurfaceOfPointerInteraction(scene) {
    // identifies if the pointer is down on a graffiti wall
    // if the condition is true, the avatar stops any movement
    scene.input.on("pointerdown", (pointer, object) => {
      if (
        (object[0] && object[0]?.name == "graffitiBrickWall") ||
        object[0]?.name == "graffitiDotWall" ||
        object[0]?.name == "currentPlayerScrollablePanel" ||
        object[0]?.name == "onlinePlayerScrollablePanel"
      ) {
        scene.graffitiDrawing = true;
      }
    });
    scene.input.on("pointerup", () => {
      scene.graffitiDrawing = false;
    });
  }

  moveScrollablePanel(scene) {
    scene.playerLikedPanel.x = scene.player.x + 200;
    scene.playerLikedPanel.y = scene.player.y;
  }

  movePlayerContainer(scene) {
    scene.playerItemsBar.x = scene.player.x
    scene.playerItemsBar.y = scene.player.y
  }


}
export default new Move()