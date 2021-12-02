import sendPlayerMovement from "./sendPlayerMovement";

class playerMoving {

    constructor() {
    }

    byKeyboard(scene) {
        const speed = 175;
        const prevVelocity = scene.player.body.velocity.clone();

        // Stop any previous movement from the last frame
        scene.player.body.setVelocity(0);

        // Horizontal movement
        if (scene.cursors.left.isDown) {
            scene.player.body.setVelocityX(-speed);

            // scene.arrowDown = true;
            //!sendPlayerMovement.network(scene)
        } else if (scene.cursors.right.isDown) {
            scene.player.body.setVelocityX(speed);
            // scene.arrowDown = true
            //!sendPlayerMovement.network(scene)
        }

        // Vertical movement
        if (scene.cursors.up.isDown) {
            scene.player.body.setVelocityY(-speed);
            // scene.arrowDown = true
            //!sendPlayerMovement.network(scene)
        } else if (scene.cursors.down.isDown) {
            scene.player.body.setVelocityY(speed);
            // scene.arrowDown = true
            //!sendPlayerMovement.network(scene)
        }

        // Normalize and scale the velocity so that player can't move faster along a diagonal
        scene.player.body.velocity.normalize().scale(speed);
    }

    bySwiping(scene) {
        if (scene.input.activePointer.isDown
            && scene.isClicking == false &&
            scene.graffitiDrawing == false) {
            console.log("One")
            scene.isClicking = true
          }
          if (
            !scene.input.activePointer.isDown &&
            scene.isClicking == true &&
            scene.graffitiDrawing == false
          ) {
            console.log("Two")
            const playerX = scene.player.x
            const playerY = scene.player.y
      
            const swipeX = scene.input.activePointer.upX - scene.input.activePointer.downX
            const swipeY = scene.input.activePointer.upY - scene.input.activePointer.downY
      
            scene.swipeAmount.x = swipeX
            scene.swipeAmount.y = swipeY
      
            let moveSpeed = scene.swipeAmount.length()
            if (moveSpeed > 450) moveSpeed = 450
      
            scene.playerIsMovingByClicking = true; // trigger moving animation
      
      
            scene.target.x = playerX + swipeX
            scene.target.y = playerY + swipeY
            scene.physics.moveToObject(scene.player, scene.target, moveSpeed * 2);
            scene.isClicking = false;
      
          }
      
          scene.distance = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, scene.target.x, scene.target.y);
          //  4 is our distance tolerance, i.e. how close the source can get to the target
          //  before it is considered as being there. The faster it moves, the more tolerance is required.
          if (scene.playerIsMovingByClicking) {
            if (scene.distance < 10) {
              scene.player.body.reset(scene.target.x, scene.target.y);
              scene.playerIsMovingByClicking = false
            } else {
              //!sendPlayerMovement.network(scene)
            }
          }
    }

    byClicking(scene) {
        if (!scene.input.activePointer.isDown && scene.isClicking == true) {
          scene.target.x = scene.input.activePointer.worldX
          scene.target.y = scene.input.activePointer.worldY
          scene.physics.moveToObject(scene.player, scene.target, 200);
          scene.isClicking = false;
          scene.playerIsMovingByClicking = true;
        } else if (scene.input.activePointer.isDown && scene.isClicking == false) {
          scene.isClicking = true;
        }
    
        scene.distance = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, scene.target.x, scene.target.y);
        //  4 is our distance tolerance, i.e. how close the source can get to the target
        //  before it is considered as being there. The faster it moves, the more tolerance is required.
        if (scene.playerIsMovingByClicking) {
          if (scene.distance < 10) {
            scene.player.body.reset(scene.target.x, scene.target.y);
            scene.playerIsMovingByClicking = false
          } else {
            //!sendPlayerMovement.network(scene)
          }
        }
      }
}

export default new playerMoving();