Sending the movement over the network is now optimized: we send a moveTo command. With double tapping and swiping this is straight foreward: the player moves to a target. With keyboard moving this is not that obvious so keyboardmoving is not enabled at the moment.

Because we don't want to move when we are painting on a Graffitiwall, we added a graphic in the background that detects mousePresses, everything that should disable playerMovement is above that layer.

This layer sets ManageSession.playerMove to true

***

Methods in our Move.js class

**moveByCursor()**    
Sets .cursorKeyIsDown to true or false when either one of the **keyboard** moving keys is down    


**movingAnimation()**    
Plays the appropiate animation according to the movement flag that is set **maybe better with events!**    

**moveByKeyboard()**    
moves player with keyboard commands    

**MoveObjectToTarget()**    
General method to move the player to a goal and detect when it has arrived      
_this.updatePositionHistory(scene)_ // update the url and historyTracker    
_ManageSession.sendMoveMessage(scene, target.x, target.y, "moveTo")_ //set movement over network    

**checkIfPlayerReachedMoveGoal**    
stops the player when it reached the goal (with a tolerance that is speed dependent)   
stops the player animation when the player reached    
also shaked the camera when the player reaches the end of the world   

**updatePositionHistory**    
update the url when the player moved    
update the position in the history tracker aswell    

**moveBySwiping()**    
move by swiping with mouse or finger   

**moveByTapping()**    
move by double tapping with finger or mouse    
 

**sendMovement()**    
send movement over the network    


***


Links with information:

physics.moveto example: https://phaser.io/examples/v3/view/physics/arcade/move-to

scroll camera example: https://phaser.io/examples/v3/view/camera/scroll-view

World Camera example: https://labs.phaser.io/edit.html?src=src/camera/world%20camera.js&v=3.55.2

* config parameters for the camera (acceleration, drag, maxSpeed)

Get world point from camera:
http://labs.phaser.io/edit.html?src=src/camera/get%20world%20point.js

Move And Stop At Position:
https://phaser.io/examples/v3/view/physics/arcade/move-and-stop-at-position

Virtual Joystick
https://codepen.io/rexrainbow/pen/oyqvQY

Swipe discussion
https://www.html5gamedevs.com/topic/39661-creating-swiping-mechanism/

Swipe example
https://www.thepolyglotdeveloper.com/2020/09/include-touch-cursor-gesture-events-phaser-game/

---
## Swipe movement (works really well!)
```
playerMovingBySwiping() {
    if (!this.input.activePointer.isDown && this.isClicking == true) {
      const playerX = this.player.x
      const playerY = this.player.y

      const swipeX = this.input.activePointer.upX - this.input.activePointer.downX
      const swipeY = this.input.activePointer.upY - this.input.activePointer.downY
      // console.log("swipeX:")
      // console.log(swipeX)
      // console.log("swipeY:")
      // console.log(swipeY)
      this.swipeAmount.x = swipeX
      this.swipeAmount.y = swipeY

      const moveSpeed = this.swipeAmount.length()
      console.log("moveSpeed:")
      console.log(moveSpeed)

      // console.log("this.swipeAmount:")
      // console.log(this.swipeAmount.x)
      // console.log(this.swipeAmount.y)
      // console.log("")
      //if (Math.abs(swipeX > 10) || Math.abs(swipeY > 10)) {
      this.playerIsMovingByClicking = true; // trigger moving animation


      this.target.x = playerX + swipeX
      this.target.y = playerY + swipeY
      this.physics.moveToObject(this.player, this.target, moveSpeed * 1.5);
      this.isClicking = false;


      //     if (this.input.activePointer.upY < this.input.activePointer.downY) {
      //       this.swipeDirection = "up";
      //     } else if (this.input.activePointer.upY > this.input.activePointer.downY) {
      //       this.swipeDirection = "down";
      //     }

    } else if (this.input.activePointer.isDown && this.isClicking == false) {
      this.isClicking = true;
    }
    this.distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);
    //  4 is our distance tolerance, i.e. how close the source can get to the target
    //  before it is considered as being there. The faster it moves, the more tolerance is required.
    if (this.playerIsMovingByClicking) {
      if (this.distance < 10) {
        this.player.body.reset(this.target.x, this.target.y);
        this.playerIsMovingByClicking = false
      } else {
        this.sendPlayerMovement();
      }
    }
  }

```
