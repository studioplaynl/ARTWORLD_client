import manageSession from "./../manageSession";

class Player {
  constructor() {}

  loadOnlineAvatar(scene) {
    //check if account info is loaded
    if (manageSession.userProfile.id != null) {
      //check for createPlayer flag
      if (manageSession.createPlayer) {
        manageSession.createPlayer = false;
        //console.log("manageSession.createPlayer = false;")

        //set the location of the player to this location

        scene.createdPlayer = false; //? WORKING ?

        //console.log("loadAndCreatePlayerAvatar")

        // is playerAvaterKey already in loadedAvatars?
        //no -> load the avatar and add to loadedAvatars
        //yes -> dont load the avatar

        scene.playerAvatarKey =
          manageSession.userProfile.id +
          "_" +
          manageSession.userProfile.create_time;
        console.log(scene.playerAvatarKey);

        // console.log("this.textures.exists(this.playerAvatarKey): ")
        // console.log(this.textures.exists(this.playerAvatarKey))

        // console.log(this.cache.game.textures.list[this.playerAvatarKey])

        console.log(scene.textures.exists(scene.playerAvatarKey));

        //!
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //if the texture already exists attach it again to the player
        if (!scene.textures.exists(scene.playerAvatarKey)) {
          //check if url is not empty for some reason, returns so that previous image is kept
          if (manageSession.userProfile.url === "") {
            console.log("avatar url is empty");
            manageSession.createPlayer = false;
            console.log("manageSession.createPlayer = false;");
            scene.createdPlayer = true;
            console.log("scene.createdPlayer = true;");
            return;
          } else {
            // console.log(" loading: manageSession.userProfile.url: ")
            // console.log(manageSession.userProfile.url)

            scene.load.spritesheet(
              scene.playerAvatarKey,
              manageSession.userProfile.url,
              { frameWidth: 128, frameHeight: 128 }
            );

            scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
              console.log("loadAndCreatePlayerAvatar complete:");
              console.log(manageSession.userProfile.url);

              if (scene.textures.exists(scene.playerAvatarKey)) {
                this.attachAvatarToPlayer(scene);
              } // if (this.textures.exists(this.playerAvatarKey))
            });
          }

          scene.load.start(); // load the image in memory
          //console.log("this.load.start();");
        } else {
          this.attachAvatarToPlayer(scene);
        }
      } //if(manageSession.playerCreated)
    }
  }

  attachAvatarToPlayer(scene) {
    const avatar = scene.textures.get(scene.playerAvatarKey);
    console.log(avatar);
    const avatarWidth = avatar.frames.__BASE.width;
    console.log("avatarWidth");
    console.log(avatarWidth);
    const avatarHeight = avatar.frames.__BASE.height;
    console.log("avatarHeight");
    console.log(avatarHeight);

    const avatarFrames = Math.round(avatarWidth / avatarHeight);
    console.log("avatarFrames: " + avatarFrames);

    //make an animation if the image is wider than tall
    if (avatarFrames > 1) {
      //. animation for the player avatar ......................

      scene.playerMovingKey = "moving" + "_" + scene.playerAvatarKey;
      scene.playerStopKey = "stop" + "_" + scene.playerAvatarKey;

      scene.anims.create({
        key: scene.playerMovingKey,
        frames: scene.anims.generateFrameNumbers(scene.playerAvatarKey, {
          start: 0,
          end: avatarFrames - 1,
        }),
        frameRate: (avatarFrames + 2) * 2,
        repeat: -1,
        yoyo: true,
      });

      scene.anims.create({
        key: scene.playerStopKey,
        frames: scene.anims.generateFrameNumbers(scene.playerAvatarKey, {
          start: 0,
          end: 0,
        }),
      });

      //. end animation for the player avatar ......................
    }

    // texture loaded so use instead of the placeholder
    console.log("scene.playerAvatarKey");
    console.log(scene.playerAvatarKey);

    // scene.player.texture = scene.playerAvatarKey
    scene.player.setTexture(scene.playerAvatarKey);
    scene.playerShadow.setTexture(scene.playerAvatarKey);

    //scale the player to 64px
    const width = 64;
    scene.player.displayWidth = width;
    scene.player.scaleY = scene.player.scaleX;

    scene.playerShadow.displayWidth = width;
    scene.playerShadow.scaleY = scene.playerShadow.scaleX;

    console.log("scene.playerShadow");
    console.log(scene.playerShadow);

    //* set the collision body
    //* setCircle(radius [, offsetX] [, offsetY])
    // scene.player.body.setCircle(width, width, width / 2)
    scene.player.body.setCircle(width / 1.1, width / 5, width / 5);

    //place the player in the last known position
    // this.player.x = this.player.posX
    // this.player.y = this.player.posY

    // //*place the player in the center
    // scene.player.x = translateCoordinates.artworldToPhaser2D(scene, 0)
    // scene.player.y = translateCoordinates.artworldToPhaser2D(scene, 0)

    // console.log("player avatar has loaded ")
    // console.log("this.playerAvatarKey")
    // console.log(this.playerAvatarKey)

    scene.player.location = scene.location;

    console.log("this.player: ");
    console.log(scene.player);

    scene.createdPlayer = true;
    // console.log("this.createdPlayer = true;")

    //send the current player position over the network
    manageSession.sendMoveMessage(scene.player.x, scene.player.y);

    // scene.add.existing(this)
    // scene.physics.add.existing(this)
  } //attachAvatarToPlayer

  moveByCursor(scene) {
    if (
      scene.cursors.up.isDown ||
      scene.cursors.down.isDown ||
      scene.cursors.left.isDown ||
      scene.cursors.right.isDown
    ) {
      scene.arrowDown = true;
    } else {
      scene.arrowDown = false;
    }
  }

  movingAnimation(scene) {
    if (scene.arrowDown || scene.playerIsMovingByClicking) {
      scene.player.anims.play(scene.playerMovingKey, true);
      scene.playerShadow.anims.play(scene.playerMovingKey, true);
    } else if (!scene.arrowDown || !scene.playerIsMovingByClicking) {
      scene.player.anims.play(scene.playerStopKey, true);
      scene.playerShadow.anims.play(scene.playerStopKey, true);
    }
  }

  moveByKeyboard(scene) {
    const speed = 175;
    const prevVelocity = scene.player.body.velocity.clone();

    // Stop any previous movement from the last frame
    scene.player.body.setVelocity(0);

    // Horizontal movement
    if (scene.cursors.left.isDown) {
      scene.player.body.setVelocityX(-speed);

      // scene.arrowDown = true;
      this.sendMovement();
    } else if (scene.cursors.right.isDown) {
      scene.player.body.setVelocityX(speed);
      // scene.arrowDown = true
      // sendPlayerMovement(scene)
    }

    // Vertical movement
    if (scene.cursors.up.isDown) {
      scene.player.body.setVelocityY(-speed);
      // scene.arrowDown = true
      this.sendMovement();
    } else if (scene.cursors.down.isDown) {
      scene.player.body.setVelocityY(speed);
      // scene.arrowDown = true
      this.sendMovement();
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    scene.player.body.velocity.normalize().scale(speed);
  }

  moveBySwiping(scene) {
    if (
      scene.input.activePointer.isDown &&
      scene.isClicking == false &&
      scene.graffitiDrawing == false
    ) {
      console.log("One");
      scene.isClicking = true;
    }
    if (
      !scene.input.activePointer.isDown &&
      scene.isClicking == true &&
      scene.graffitiDrawing == false
    ) {
      console.log("Two");
      const playerX = scene.player.x;
      const playerY = scene.player.y;

      const swipeX =
        scene.input.activePointer.upX - scene.input.activePointer.downX;
      const swipeY =
        scene.input.activePointer.upY - scene.input.activePointer.downY;

      scene.swipeAmount.x = swipeX;
      scene.swipeAmount.y = swipeY;

      let moveSpeed = scene.swipeAmount.length();
      if (moveSpeed > 450) moveSpeed = 450;

      scene.playerIsMovingByClicking = true; // trigger moving animation

      scene.target.x = playerX + swipeX;
      scene.target.y = playerY + swipeY;
      scene.physics.moveToObject(scene.player, scene.target, moveSpeed * 2);
      scene.isClicking = false;
    }

    scene.distance = Phaser.Math.Distance.Between(
      scene.player.x,
      scene.player.y,
      scene.target.x,
      scene.target.y
    );
    //  4 is our distance tolerance, i.e. how close the source can get to the target
    //  before it is considered as being there. The faster it moves, the more tolerance is required.
    if (scene.playerIsMovingByClicking) {
      if (scene.distance < 10) {
        scene.player.body.reset(scene.target.x, scene.target.y);
        scene.playerIsMovingByClicking = false;
      } else {
        this.sendMovement();
      }
    }
  }

  moveByClicking(scene) {
    if (!scene.input.activePointer.isDown && scene.isClicking == true) {
      scene.target.x = scene.input.activePointer.worldX;
      scene.target.y = scene.input.activePointer.worldY;
      scene.physics.moveToObject(scene.player, scene.target, 200);
      scene.isClicking = false;
      scene.playerIsMovingByClicking = true;
    } else if (scene.input.activePointer.isDown && scene.isClicking == false) {
      scene.isClicking = true;
    }

    scene.distance = Phaser.Math.Distance.Between(
      scene.player.x,
      scene.player.y,
      scene.target.x,
      scene.target.y
    );
    //  4 is our distance tolerance, i.e. how close the source can get to the target
    //  before it is considered as being there. The faster it moves, the more tolerance is required.
    if (scene.playerIsMovingByClicking) {
      if (scene.distance < 10) {
        scene.player.body.reset(scene.target.x, scene.target.y);
        scene.playerIsMovingByClicking = false;
      } else {
        this.sendMovement();
      }
    }
  }

  sendMovement() {
    if (this.createdPlayer) {
      if (
        manageSession.updateMovementTimer > manageSession.updateMovementInterval
      ) {
        //send the player position as artworldCoordinates, because we store in artworldCoordinates on the server
        // manageSession.sendMoveMessage(translateCoordinates.Phaser2DToArtworld(scene, scene.player.x), translateCoordinates.Phaser2DToArtworld(scene, scene.player.y))
        manageSession.sendMoveMessage(this.player.x, this.player.y);
        //console.log(this.player.x)
        manageSession.updateMovementTimer = 0;
      }
      // this.scrollablePanel.x = this.player.x
      // this.scrollablePanel.y = this.player.y + 150
    }
  }
}

export default new Player();
