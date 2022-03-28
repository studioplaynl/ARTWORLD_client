import ManageSession from "../ManageSession"
import CoordinatesTranslator from "./CoordinatesTranslator"
import HistoryTracker from "./HistoryTracker"

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
    // moving is done in Phaser coordinates, sending movement over the network is done in ArtworldCoordinates
    // we check if player stays in the world
    // keep the player in the world and send the moveTo commands
    if (target.x < 0) {
      target.x = 0 + ManageSession.avatarSize
      ManageSession.cameraShake = true
    }
    if (target.x > scene.worldSize.x) {
      target.x = scene.worldSize.x - ManageSession.avatarSize
      ManageSession.cameraShake = true
    }
    if (target.y < 0) {
      target.y = 0 + ManageSession.avatarSize
      ManageSession.cameraShake = true
    }
    if (target.y > scene.worldSize.y) {
      target.y = scene.worldSize.y - ManageSession.avatarSize
      ManageSession.cameraShake = true
    }

    scene.physics.moveToObject(container, target, speed)
    //send over the network
    // we pass on Phaser2D coordinates to ManageSession.sendMoveMessage
    // target is a vector

    this.updatePositionHistory(scene) // update the url and historyTracker

    //set movement over network
    ManageSession.sendMoveMessage(scene, target.x, target.y, "moveTo")
  }

  checkIfPlayerReachedMoveGoal(scene) {
// function to stop the player when it reached it goal

    //  10 is our distance tolerance, i.e. how close the source can get to the target
    //  before it is considered as being there. The faster it moves, the more tolerance is required.
    if (scene.isPlayerMoving) {
      // calculate distance only when playerIsMovingByClicking
      scene.distance = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, scene.target.x, scene.target.y)
      if (scene.distance < scene.distanceTolerance) {
        if (ManageSession.cameraShake) {
          // camera shake when player walks into bounds of world
          // (duration, intensity)
          let shakeIntensity = 0.005
          let shakeDuration = 200
          // increase the intensity when camera is zoomed out
          if (scene.gameCam.zoom < 1) {
            shakeDuration = (shakeDuration * 3)
            shakeIntensity = (shakeIntensity / scene.gameCam.zoom) * 2
          }
          scene.cameras.main.shake(shakeDuration, shakeIntensity)
        }

        ManageSession.cameraShake = false
        scene.player.body.reset(scene.target.x, scene.target.y)
        // send Stop command
        ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y, "stop")
        
        this.updatePositionHistory(scene) // update the url and historyTracker

        //update last player position in manageSession for when the player is reloaded inbetween scenes
        ManageSession.playerPosX = CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, scene.player.x)
        ManageSession.playerPosY = CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, scene.player.y)

        //play "stop" animation
        this.movingAnimation(scene, "stop")
        scene.isPlayerMoving = false
      }
    }
  }

  updatePositionHistory(scene){
    const passPosX = CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, scene.player.x)
    const passPosY = CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, scene.player.y)
    
    //update url 
    ManageSession.setUrl(scene.location, passPosX, passPosY)
    // put the new pos in the history tracker
    HistoryTracker.updatePositionCurrentScene(passPosX, passPosY)
  }

  moveBySwiping(scene) {
    if (scene.input.activePointer.isDown && scene.isClicking == false && ManageSession.playerMove) {
      scene.isClicking = true
    }
    if (!scene.input.activePointer.isDown && scene.isClicking == true) {
      // play "move" animation
      // play the animation as soon as possible so it is more visible
      this.movingAnimation(scene, "moving")

      const playerX = scene.player.x
      const playerY = scene.player.y

      let swipeX = scene.input.activePointer.upX - scene.input.activePointer.downX
      let swipeY = scene.input.activePointer.upY - scene.input.activePointer.downY

      scene.swipeAmount.x = swipeX
      scene.swipeAmount.y = swipeY

      //we scale the travel distance to the zoomlevel
      let zoomFactor = scene.gameCam.zoom
      swipeX = swipeX / zoomFactor
      swipeY = swipeY / zoomFactor

      // console.log("swipeX, swipeY", swipeX, swipeY)

      scene.swipeAmount.x = swipeX
      scene.swipeAmount.y = swipeY

      let moveSpeed = scene.swipeAmount.length() * 2

      // we scale the arrival check (distanceTolerance) to the speed of the player
      scene.distanceTolerance = moveSpeed / 30

      console.log("moveBySwiping moveSpeed", moveSpeed)

      scene.isPlayerMoving = true // to stop the player when it reached its destination

      scene.target.x = playerX + swipeX
      scene.target.y = playerY + swipeY

      // generalized moving method
      this.moveObjectToTarget(scene, scene.player, scene.target, moveSpeed)
      ManageSession.playerMove = false
      scene.isClicking = false
    }
  }

  moveByTapping(scene) {
    if (scene.input.activePointer.isDown && scene.isClicking == false && ManageSession.playerMove) {
      scene.isClicking = true
    }
    if (!scene.input.activePointer.isDown && scene.isClicking == true) {
      //doubletap: first time mouse up
      let lastTime = 0
      //doubletap: second time mouse down
      scene.input.on("pointerdown", () => {
        //doubletap: second time mouse down: count time
        let clickDelay = scene.time.now - lastTime

        lastTime = scene.time.now
        if (clickDelay < 350 && scene.graffitiDrawing == false) {

          // play "move" animation
          // play the animation as soon as possible so it is more visible
          this.movingAnimation(scene, "moving")

          const playerX = scene.player.x
          const playerY = scene.player.y

          //mouse point after doubletap is target
          scene.target.x = scene.input.activePointer.worldX
          scene.target.y = scene.input.activePointer.worldY

          scene.swipeAmount.x = playerX - scene.target.x
          scene.swipeAmount.y = playerY - scene.target.y

          let moveSpeed = scene.swipeAmount.length() * 2

          console.log("moveByTapping moveSpeed", moveSpeed)

          // we scale the arrival check (distanceTolerance) to the speed of the player
          scene.distanceTolerance = moveSpeed / 60

          scene.isPlayerMoving = true // activate moving animation

          // generalized moving method
          this.moveObjectToTarget(scene, scene.player, scene.target, moveSpeed) // send moveTo over network, calculate speed as function of distance
        }
      })
      scene.isClicking = false
      ManageSession.playerMove = false
    }
  }

  sendMovement(scene) {
    if (scene.createdPlayer) {
      //send the player position as artworldCoordinates, because we store in artworldCoordinates on the server
      //moveTo or Stop
      ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y)
      //console.log(this.player.x)
      ManageSession.updateMovementTimer = 0
    }
  }

  movePlayerLikedPanel(scene) {
    scene.playerLikedPanel.x = scene.player.x + 200;
    scene.playerLikedPanel.y = scene.player.y
  }


}
export default new Move()