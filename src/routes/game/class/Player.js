import ManageSession from "../ManageSession";
import CoordinatesTranslator from "./CoordinatesTranslator";
import { listObjects, listImages, convertImage } from "../../../api.js";

class Player {
  constructor() {}

  loadOnlineAvatar(scene) {
    //check if account info is loaded
    if (ManageSession.userProfile.id != null) {
      //check for createPlayer flag
      if (ManageSession.createPlayer) {
        ManageSession.createPlayer = false;
        //console.log("ManageSession.createPlayer = false;")

        //set the location of the player to this location

        scene.createdPlayer = false;

        //console.log("loadAndCreatePlayerAvatar")

        // is playerAvaterKey already in loadedAvatars?
        //no -> load the avatar and add to loadedAvatars
        //yes -> dont load the avatar

        scene.playerAvatarKey =
          ManageSession.userProfile.id +
          "_" +
          ManageSession.userProfile.create_time;
        //console.log(scene.playerAvatarKey);

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
          if (ManageSession.userProfile.url === "") {
            console.log("avatar url is empty");
            ManageSession.createPlayer = false;
            console.log("ManageSession.createPlayer = false;");
            scene.createdPlayer = true;
            console.log("scene.createdPlayer = true;");
            return;
          } else {
            // console.log(" loading: ManageSession.userProfile.url: ")
            // console.log(ManageSession.userProfile.url)

            scene.load.spritesheet(
              scene.playerAvatarKey,
              ManageSession.userProfile.url,
              { frameWidth: 128, frameHeight: 128 }
            );

            scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
              console.log("loadAndCreatePlayerAvatar complete");
              //console.log(ManageSession.userProfile.url);

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
      } //if(ManageSession.playerCreated)
    }
  }

  attachAvatarToPlayer(scene) {
    const avatar = scene.textures.get(scene.playerAvatarKey);
    // console.log(avatar);
    const avatarWidth = avatar.frames.__BASE.width;
    //console.log("avatarWidth: " avatarWidth);

    const avatarHeight = avatar.frames.__BASE.height;
    //console.log("avatarHeight: " + avatarHeight);

    const avatarFrames = Math.round(avatarWidth / avatarHeight);
    //console.log("avatarFrames: " + avatarFrames);

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
    //console.log("scene.playerAvatarKey");
    //console.log(scene.playerAvatarKey);

    //

    // scene.player.texture = scene.playerAvatarKey
    scene.player.setTexture(scene.playerAvatarKey);
    scene.playerShadow.setTexture(scene.playerAvatarKey);

    //scale the player to 64px
    const width = 64;
    scene.player.displayWidth = width;
    scene.player.scaleY = scene.player.scaleX;

    scene.playerShadow.displayWidth = width;
    scene.playerShadow.scaleY = scene.playerShadow.scaleX;

    // console.log("scene.playerShadow");
    // console.log(scene.playerShadow);

    //* set the collision body
    //* setCircle(radius [, offsetX] [, offsetY])
    // scene.player.body.setCircle(width, width, width / 2)
    scene.player.body.setCircle(width / 1.1, width / 5, width / 5);

    // place the player in the last known position
    // this.player.x = this.player.posX
    // this.player.y = this.player.posY

    //*place the player in the last known position
    // scene.player.x = translateCoordinates.artworldToPhaser2DX(this.worldSize.x, this.player.posX)
    // scene.player.y = translateCoordinates.artworldToPhaser2DY(this.worldSize.y, this.player.posY)

    // console.log("player avatar has loaded ")
    // console.log("this.playerAvatarKey")
    // console.log(this.playerAvatarKey)

    scene.player.location = scene.location;

    // console.log("this.player: ");
    // console.log(scene.player);

    scene.createdPlayer = true;
    // console.log("this.createdPlayer = true;")

    //send the current player position over the network
    ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y);

    // scene.add.existing(this)
    // scene.physics.add.existing(this)

    this.createPopUpButtons(scene);
  } //attachAvatarToPlayer

  createPopUpButtons(scene) {
    // making the avatar interactive
    scene.player.setInteractive({ useHandCursor: true });

    // for toggling the pop-up buttons
    let displayPopUpButtons = false;

    // for toggling the artwork list

    // creating a container that holds all pop-up buttons, the coords are the same as the avatar's
    scene.playerContainer = scene.add.container(scene.player.x, scene.player.y);
    scene.physics.world.enable(scene.playerContainer);

    scene.scrollablePanel = scene.add.container(0, 0);

    // for entering the avatar's home
    scene.input.on("gameobjectdown", (pointer, object) => {
      if (object.anims) {
        // saving the clicked avatar's id (for entering its house, for displaying its artworks, etc.)
        scene.selectedPlayerID =
          object.anims.currentFrame.textureKey.split("_")[0];

        scene.scrollablePanel.setVisible(false);
      }
    });

    scene.player.on("pointerup", () => {
      // checking if the buttons are hidden, show - if hidden, hide - if displayed
      if (displayPopUpButtons == false) {
        scene.playerContainer.setVisible(true);

        const homeButtonCircle = scene.add
          .circle(0, -70, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(3, 0x0000);
        const homeButtonImage = scene.add.image(0, -70, "home");

        const heartButtonCircle = scene.add
          .circle(65, 0, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(3, 0x0000);
        const heartButtonImage = scene.add.image(65, 0, "heart");

        heartButtonCircle.on("pointerup", async () => {
          await listImages("drawing", scene.selectedPlayerID, 100).then(
            async (response) => {
              scene.userArtServerList = response;

              if (scene.userArtServerList.length > 0) {
                scene.scrollablePanel.setVisible(false);

                // downloading each artwork of the user
                const downloadedImages = {
                  artworks: await Promise.all(
                    scene.userArtServerList.map(async (element, index) => {
                      const imgUrl = element.value.url;
                      const imgSize = "128";
                      const fileFormat = "png";
                      const key = `${element.key}_${imgSize}`;

                      if (scene.textures.exists(key)) {
                        return { name: `${key}` };
                      } else {
                        const currentImage = await convertImage(
                          imgUrl,
                          "128",
                          fileFormat
                        );

                        scene.load.image(key, currentImage);

                        scene.load.start(); // load the image in memory

                        return { name: `${key}` };
                      }
                    })
                  ),
                };

                scene.scrollablePanel = scene.rexUI.add
                  .scrollablePanel({
                    x: scene.player.x + 200,
                    y: scene.player.y,
                    width: 200,
                    height: 200,

                    scrollMode: 1,

                    background: scene.rexUI.add.roundRectangle(
                      0,
                      0,
                      2,
                      2,
                      10,
                      0xffffff
                    ),

                    panel: {
                      child: this.createPanel(scene, downloadedImages),
                    },

                    slider: {
                      track: scene.rexUI.add.roundRectangle(
                        0,
                        0,
                        20,
                        10,
                        10,
                        0x000000
                      ),
                      thumb: scene.rexUI.add.roundRectangle(
                        0,
                        0,
                        0,
                        0,
                        13,
                        0xff9900
                      ),
                    },

                    space: {
                      left: 10,
                      right: 10,
                      top: 10,
                      bottom: 10,

                      panel: 10,
                    },
                  })
                  .layout()
                  .setName("scrollBar");

                scene.input.topOnly = false;
                var labels = [];
                labels.push(
                  ...scene.scrollablePanel.getElement("#artworks.items", true)
                );

                //  scene.physics.world.enable(scene.s)
              }
            }
          );
        });

        // adding all buttons to the container
        scene.playerContainer.add([
          homeButtonCircle,
          homeButtonImage,
          heartButtonCircle,
          heartButtonImage,
        ]);
        displayPopUpButtons = true;

        // entering the home of the avatar
        homeButtonCircle.on("pointerup", () => {
          scene.scene.scene.physics.pause();
          scene.scene.scene.player.setTint(0xff0000);

          ManageSession.socket.rpc("leave", scene.scene.scene.location);

          scene.scene.scene.player.location = "DefaultUserHome";

          scene.scene.scene.time.addEvent({
            delay: 500,
            callback: () => {
              ManageSession.location = "DefaultUserHome";
              ManageSession.createPlayer = true;
              ManageSession.getStreamUsers("join", "DefaultUserHome");
              scene.scene.scene.scene.stop(scene.scene.scene.scene.key);
              if (scene.scene.scene.selectedPlayerID) {
                scene.scene.scene.scene.start("DefaultUserHome", {
                  user_id: scene.scene.scene.selectedPlayerID,
                });
              } else {
                scene.scene.scene.scene.start("DefaultUserHome");
              }
            },
            callbackScope: scene,
            loop: false,
          });
        });
      } else {
        scene.playerContainer.setVisible(false);
        displayPopUpButtons = false;
      }
    });
  }

  createPanel(scene, data) {
    var sizer = scene.rexUI.add
      .sizer({
        orientation: "x",
        // space: { item: 10 }
      })
      .add(
        this.createTable(scene, data, "artworks", 1), // child
        { expand: true }
      );
    return sizer;
  }

  createTable(scene, data, key, rows) {
    var items = data[key];
    var columns = Math.ceil(items.length / rows);
    var table = scene.rexUI.add.gridSizer({
      column: columns,
      row: rows,

      rowProportions: 1,
      space: { column: 10, row: 10 },
      name: key, // Search this name to get table back
    });

    var item, r, c;
    var iconSize = rows === 1 ? 80 : 40;
    for (var i = 0, cnt = items.length; i < cnt; i++) {
      item = items[i];
      r = i % rows;
      c = (i - r) / rows;
      table.add(
        this.createIcon(scene, item, iconSize, iconSize),
        c,
        r,
        "top",
        5, // distance between artworks
        true
      );
    }

    return scene.rexUI.add
      .sizer({
        orientation: "x",
        space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 },
      })
      .addBackground(
        scene.rexUI.add
          .roundRectangle(0, 0, 0, 0, 0, undefined)
          .setStrokeStyle(3, 0x000000, 1)
      )
      .add(
        table, // child
        1, // proportion
        "center", // align
        0, // paddingConfig
        true // expand
      );
  }

  createIcon(scene, item, iconWidth, iconHeight) {
    var label = scene.rexUI.add.label({
      orientation: "x",
      // icon: scene.rexUI.add.roundRectangle(0, 0, iconWidth, iconHeight, 5, 0x7b5e57),
      icon: scene.add.image(0, 0, item.name),

      // space: { icon: 3 }
    });

    return label;
  }

  moveByCursor(scene) {
    if (
      scene.cursors.up.isDown ||
      scene.cursors.down.isDown ||
      scene.cursors.left.isDown ||
      scene.cursors.right.isDown
    ) {
      scene.cursorKeyIsDown = true;
    } else {
      scene.cursorKeyIsDown = false;
    }
  }

  movingAnimation(scene) {
    if (scene.cursorKeyIsDown || scene.playerIsMovingByClicking) {
      scene.player.anims.play(scene.playerMovingKey, true);
      scene.playerShadow.anims.play(scene.playerMovingKey, true);
    } else if (!scene.cursorKeyIsDown || !scene.playerIsMovingByClicking) {
      scene.player.anims.play(scene.playerStopKey, true);
      scene.playerShadow.anims.play(scene.playerStopKey, true);
    }
  }

  moveByKeyboard(scene) {
    const speed = 175;
    const prevPlayerVelocity = scene.player.body.velocity.clone();

    // Stop any previous movement from the last frame, the avatar itself and the container that holds the pop-up buttons
    scene.player.body.setVelocity(0);
    if (scene.playerContainer?.body) {
      scene.playerContainer.body.setVelocity(0);
    }

    // Horizontal movement
    if (scene.cursors.left.isDown) {
      scene.player.body.setVelocityX(-speed);
      scene.playerContainer.body.setVelocityX(-speed);

      // scene.cursorKeyIsDown = true;
      this.sendMovement(scene);
    } else if (scene.cursors.right.isDown) {
      scene.player.body.setVelocityX(speed);
      scene.playerContainer.body.setVelocityX(speed);
      // scene.cursorKeyIsDown = true
      // sendPlayerMovement(scene)
    }

    // Vertical movement
    if (scene.cursors.up.isDown) {
      scene.player.body.setVelocityY(-speed);
      scene.playerContainer.body.setVelocityY(-speed);
      // scene.cursorKeyIsDown = true
      this.sendMovement(scene);
    } else if (scene.cursors.down.isDown) {
      scene.player.body.setVelocityY(speed);
      scene.playerContainer.body.setVelocityY(speed);
      // scene.cursorKeyIsDown = true
      this.sendMovement(scene);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal, the pop-up buttons are included
    scene.player.body.velocity.normalize().scale(speed);
    if (scene.playerContainer?.body) {
      scene.playerContainer.body.velocity.normalize().scale(speed);
    }
  }

  moveObjectToTarget(scene, container, target, speed) {
    scene.physics.moveToObject(container, target, speed);
  }

  moveBySwiping(scene) {
    if (
      scene.input.activePointer.isDown &&
      scene.isClicking == false &&
      scene.graffitiDrawing == false
    ) {
      scene.isClicking = true;
    }
    if (
      !scene.input.activePointer.isDown &&
      scene.isClicking == true &&
      scene.graffitiDrawing == false
    ) {
      const playerX = scene.player.x;
      const playerY = scene.player.y;

      const swipeX =
        scene.input.activePointer.upX - scene.input.activePointer.downX;
      const swipeY =
        scene.input.activePointer.upY - scene.input.activePointer.downY;

      scene.swipeAmount.x = swipeX;
      scene.swipeAmount.y = swipeY;

      let moveSpeed = scene.swipeAmount.length();
      if (moveSpeed > 600) moveSpeed = 600;

      scene.playerIsMovingByClicking = true; // trigger moving animation

      scene.target.x = playerX + swipeX;
      scene.target.y = playerY + swipeY;

      // generalized moving method
      this.moveObjectToTarget(scene, scene.player, scene.target, moveSpeed * 2);
      this.moveObjectToTarget(
        scene,
        scene.playerContainer,
        scene.target,
        moveSpeed * 2
      );
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
        scene.playerContainer.body.reset(scene.player.x, scene.player.y);
        scene.playerIsMovingByClicking = false;
      } else {
        this.sendMovement(scene);
      }
    }
  }

  moveByTapping(scene) {
    if (
      scene.input.activePointer.isDown &&
      scene.isClicking == false &&
      scene.graffitiDrawing == false
    ) {
      scene.isClicking = true;
    }
    if (
      !scene.input.activePointer.isDown &&
      scene.isClicking == true &&
      scene.graffitiDrawing == false
    ) {
      let lastTime = 0;
      scene.input.on("pointerdown", () => {
        let clickDelay = scene.time.now - lastTime;

        lastTime = scene.time.now;
        if (clickDelay < 350 && scene.graffitiDrawing == false) {
          scene.target.x = scene.input.activePointer.worldX;
          scene.target.y = scene.input.activePointer.worldY;

          scene.playerIsMovingByClicking = true; // activate moving animation

          // generalized moving method
          this.moveObjectToTarget(scene, scene.player, scene.target, 450);
          this.moveObjectToTarget(
            scene,
            scene.playerContainer,
            scene.target,
            450
          );
        }
      });
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
        scene.playerContainer.body.reset(scene.target.x, scene.target.y);
        scene.playerIsMovingByClicking = false;
      } else {
        this.sendMovement(scene);
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

  sendMovement(scene) {
    if (scene.createdPlayer) {
      if (
        ManageSession.updateMovementTimer > ManageSession.updateMovementInterval
      ) {
        //send the player position as artworldCoordinates, because we store in artworldCoordinates on the server
        ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y);
        //console.log(this.player.x)
        ManageSession.updateMovementTimer = 0;
      }
      // this.scrollablePanel.x = this.player.x
      // this.scrollablePanel.y = this.player.y + 150
    }
  }

  loadOnlinePlayers(scene) {
    //ManageSession.connectedOpponents //list of the opponents
    //for each of the opponents, attach a png,

    //TODO loading is broken, so I'm checking if the player avater has already loaded, after that I load onlineUsers
    if (scene.createdPlayer) {
      //first check if onlineplayers need to be created
      if (ManageSession.createOnlinePlayers) {
        // console.log("creating onlineplayer")
        ManageSession.createOnlinePlayers = false;

        //ManageSession.allConnnectedUsers are all the users that are in the stream, we first have to load the new arrivals: scene.newOnlinePlayers
        scene.newOnlinePlayers = [];

        if (scene.debug) {
          console.log("");
          console.log("createOnlinePlayers...");
        }

        //all current onlinePlayers, or an empty []
        scene.onlinePlayers = scene.onlinePlayersGroup.getChildren() || [];

        // ..... DESTROY OFFLINE PLAYERS ........................................................................................................................................................................
        //check if there are players in scene.onlinePlayers that are not in .allConnectedUsers ->  they need to be destroyed
        scene.offlineOnlineUsers = [];

        console.log("!!!!!!!!!!!!!", scene.onlinePlayers);

        // scene?.onlinePlayers.forEach((sprite) => {
        //   // sprite.input.enable = true;
        //   // sprite.setInteractive({ useHandCursor: true });
        // });

        scene.onlinePlayers.forEach((player) => {
          const playerID = player.user_id;
          const found = ManageSession.allConnectedUsers.some(
            (user) => user.user_id === playerID
          );
          if (!found) scene.offlineOnlineUsers.push(player);
        });

        if (scene.debug) {
          console.log("scene.offlineOnlineUsers");
          console.log(scene.offlineOnlineUsers);
        }

        //players in scene.onlinePlayers that are not in .allConnectedUsers -> they need to be deactivated and hidden
        if (scene.offlineOnlineUsers.length > 0) {
          //hide users
          if (scene.debug) {
            console.log("");
            console.log("# Players that are not online anymore");
          }

          for (let i = 0; i < scene.offlineOnlineUsers.length; i++) {
            //check if the user_id is in scene.onlinePlayers
            console.log(scene.offlineOnlineUsers[i]);
            scene.offlineOnlineUsers[i].destroy();
          }
        }
        //......... end DESTROY OFFLINE PLAYERS ............................................................................................................................................................

        //...... LOAD NEW PLAYERS ........................................................................................
        //(new) players present in .allConnectedUsers but not in scene.onlinePlayers ->load their avatar and animation
        scene.newOnlinePlayers = [];
        ManageSession.allConnectedUsers.forEach((player) => {
          const playerID = player.user_id;
          const found = scene.onlinePlayers.some(
            (user) => user.user_id === playerID
          );
          if (!found) scene.newOnlinePlayers.push(player);
        });
        if (scene.debug) {
          console.log("  ");
          console.log("new Online Players");
          console.log(newOnlinePlayers);
          console.log("  ");
        }

        //load the spritesheet for the new online user //give the online player a placeholder avatar
        scene.newOnlinePlayers.forEach((element, i) => {
          let elementCopy = element;
          // console.log("elementCopy: ")
          // console.log(elementCopy)
          //a new user
          scene.tempAvatarName = element.user_id + "_" + element.avatar_time;

          //if the texture already exists attach it again to the player
          if (!scene.textures.exists(scene.tempAvatarName)) {
            //add it to loading queue
            scene.load.spritesheet(scene.tempAvatarName, element.avatar_url, {
              frameWidth: 128,
              frameHeight: 128,
            });

            if (scene.debug) {
              console.log("loading: ");
              console.log(scene.tempAvatarName);
            }
          }
          console.log("give the online player a placeholder avatar first");
          //give the online player a placeholder avatar first
          //? convert from ARTWORLDcoordinates to Phaser2Dcoordinates
          // element = scene.add.sprite(element.posX, element.posY, scene.playerAvatarPlaceholder)
          element = scene.add
            .sprite(
              CoordinatesTranslator.artworldToPhaser2DX(
                scene.worldSize.x,
                element.posX
              ),
              CoordinatesTranslator.artworldToPhaser2DY(
                scene.worldSize.y,
                element.posY
              ),
              scene.playerAvatarPlaceholder
            )
            //element = scene.add.sprite(CoordinatesTranslator.artworldToPhaser2D({scene: scene, x: element.posX}), CoordinatesTranslator.artworldToPhaser2D({scene: scene, y: element.posY}), scene.playerAvatarPlaceholder)
            .setDepth(90);

          element.setData("movingKey", "moving");
          element.setData("stopKey", "stop");

          //create animation for moving
          scene.anims.create({
            key: element.getData("movingKey"),
            frames: scene.anims.generateFrameNumbers(
              scene.playerAvatarPlaceholder,
              { start: 0, end: 8 }
            ),
            frameRate: 20,
            repeat: -1,
          });

          //create animation for stop
          scene.anims.create({
            key: element.getData("stopKey"),
            frames: scene.anims.generateFrameNumbers(
              scene.playerAvatarPlaceholder,
              { start: 4, end: 4 }
            ),
          });

          Object.assign(element, elementCopy); //add all data from elementCopy to element; like prev Position, Location, UserID
          element.x = element.posX; //* is already converted from ARTWORLDcoordinates to Phaser2Dcoordinates
          element.y = element.posY; //* is already converted from ARTWORLDcoordinates to Phaser2Dcoordinates

          // add new player to group
          scene.onlinePlayersGroup.add(element);
          //} else {
          //! if the avatar already existed; get the player from the onlinePlayers array !

          this.attachtAvatarToOnlinePlayer(scene, element);
          //}
        });

        //update scene.onlinePlayers, hidden or visible
        scene.onlinePlayers = scene.onlinePlayersGroup.getChildren();

        if (scene.debug) {
          console.log("all players in the group, hidden or visible ");
          console.log(scene.onlinePlayers);
        }

        //added new players
        scene.load.start(); // load the image in memory
        console.log("started loading new (online) avatars");
        //.... end load new Avatars ....................................................................................

        //when the images are loaded the new ones should be set to the players
        scene.load.on("filecomplete", () => {
          console.log("players added: ");
          console.log(scene.newOnlinePlayers);

          scene.onlinePlayers = scene.onlinePlayersGroup.getChildren();

          for (let i = 0; i < scene.onlinePlayers.length; i++) {
            this.attachtAvatarToOnlinePlayer(scene, scene.onlinePlayers[i]);
          } //for (let i = 0; i < scene.onlinePlayers.length; i++)
        }); //scene.load.on('filecomplete', () =>

        console.log("ManageSession.allConnectedUsers");
        console.log(ManageSession.allConnectedUsers);

        //scene.onlinePlayers = scene.onlinePlayersGroup.getChildren()

        //? not necessary
        // ManageSession.allConnectedUsers.forEach((player, i) => {

        //   var index = scene.onlinePlayers.findIndex(function (player) {
        //     return player.user_id == ManageSession.allConnectedUsers[i].user_id
        //   });

        //   scene.onlinePlayers[index].active = true
        //   scene.onlinePlayers[index].visible = true
        //   console.log("make all allConnectedUsers visible")
        //   console.log(scene.onlinePlayers[index])
        // })
        //send player position over the network for the online users to see
        ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y);
      } //if (ManageSession.createOnlinePlayers)
    } //if (ManageSession.createdPlayer)
  } //loader

  attachtAvatarToOnlinePlayer(scene, player, preExisting) {
    player.setInteractive({ useHandCursor: true });

    // for toggling the pop-up buttons
    let displayPopUpButtons = false;

    // for toggling the artwork list
    let displayArtworkList = false;

    scene.onlinePlayerContainer = scene.add.container(player.x, player.y);
    scene.physics.world.enable(scene.onlinePlayerContainer);

    scene.input.on("gameobjectdown", (pointer, object) => {
      if (object.anims) {
        scene.selectedPlayerID =
          object.anims.currentFrame.textureKey.split("_")[0];
        console.log(scene.selectedPlayerID);
      }
    });

    player.on("pointerup", () => {
      console.log("111");
      if (displayPopUpButtons == false) {
        console.log("222");
        scene.onlinePlayerContainer.setVisible(true);
        const homeButtonCircle2 = scene.add
          .circle(0, -70, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(3, 0x0000);
        const homeButtonImage2 = scene.add.image(0, -70, "home");

        const heartButtonCircle2 = scene.add
          .circle(65, 0, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(3, 0x0000);
        const heartButtonImage2 = scene.add.image(65, 0, "heart");

        scene.onlinePlayerContainer.add([
          homeButtonCircle2,
          homeButtonImage2,
          heartButtonCircle2,
          heartButtonImage2,
        ]);
        displayPopUpButtons = true;

        // entering the home of the avatar
        // homeButtonCircle.on("pointerup", () => {
        //   scene.scene.scene.physics.pause();
        //   scene.scene.scene.player.setTint(0xff0000);

        //   ManageSession.socket.rpc("leave", scene.scene.scene.location);

        //   scene.scene.scene.player.location = "DefaultUserHome";

        //   scene.scene.scene.time.addEvent({
        //     delay: 500,
        //     callback: () => {
        //       ManageSession.location = "DefaultUserHome";
        //       ManageSession.createPlayer = true;
        //       ManageSession.getStreamUsers("join", "DefaultUserHome");
        //       scene.scene.scene.scene.stop(scene.scene.scene.scene.key);
        //       if (scene.scene.scene.selectedPlayerID) {
        //         scene.scene.scene.scene.start("DefaultUserHome", {
        //           user_id: scene.scene.scene.selectedPlayerID,
        //         });
        //       } else {
        //         scene.scene.scene.scene.start("DefaultUserHome");
        //       }
        //     },
        //     callbackScope: scene,
        //     loop: false,
        //   });
        // });
      } else {
        console.log("333");
        scene.playerContainer.setVisible(false);
        displayPopUpButtons = false;
        displayArtworkList = false;
      }
    });

    scene.tempAvatarName = player.user_id + "_" + player.avatar_time;

    //scene.onlinePlayers[i] = scene.add.image(scene.onlinePlayers[i].posX, scene.onlinePlayers[i].posY, scene.tempAvatarName)

    console.log("player added: ");
    console.log(player);

    //sometimes the player is not visible because the postion is 0,0
    if (player.posX == 0 && player.posY == 0) {
      player.posX = 300;
      player.posY = 400;
    }

    player.x = player.posX;
    player.y = player.posY;

    console.log("avatar key: ");
    console.log(scene.tempAvatarName);
    if (!preExisting) {
      player.setTexture(scene.tempAvatarName);
    } else {
    }

    player.active = true;
    player.visible = true;

    const avatar = scene.textures.get(scene.tempAvatarName);
    const avatarWidth = avatar.frames.__BASE.width;
    const avatarHeight = avatar.frames.__BASE.height;

    const avatarFrames = Math.round(avatarWidth / avatarHeight);
    console.log(avatarFrames);

    if (avatarFrames > 1) {
      // set names for the moving and stop animations

      player.setData("movingKey", "moving" + "_" + scene.tempAvatarName);
      player.setData("stopKey", "stop" + "_" + scene.tempAvatarName);
      console.log('player.getData("movingKey")');
      console.log(player.getData("movingKey"));

      console.log('player.getData("movingKey")');
      console.log(player.getData("movingKey"));

      //create animation for moving
      scene.anims.create({
        key: player.getData("movingKey"),
        frames: scene.anims.generateFrameNumbers(scene.tempAvatarName, {
          start: 0,
          end: avatarFrames - 1,
        }),
        frameRate: (avatarFrames + 2) * 2,
        repeat: -1,
        yoyo: true,
      });

      //create animation for stop
      scene.anims.create({
        key: player.getData("stopKey"),
        frames: scene.anims.generateFrameNumbers(scene.tempAvatarName, {
          start: 0,
          end: 0,
        }),
      });
    } //if (avatarFrames > 1) {

    //scale the player to 64px
    const width = 64;
    player.displayWidth = width;
    player.scaleY = scene.player.scaleX;

    scene.updateOnlinePlayers = true;
  }

  receiveOnlinePlayersMovement(scene) {
    if (ManageSession.updateOnlinePlayers) {
      if (!ManageSession.createPlayer) {
        if (
          ManageSession.allConnectedUsers != null &&
          ManageSession.allConnectedUsers.length > 0
        ) {
          ManageSession.allConnectedUsers.forEach((player) => {
            // const playerID = player.user_id
            // const found = ManageSession.allConnectedUsers.some(user => user.user_id === playerID)
            // if (found) {console.log(player)}

            let tempPlayer = scene.onlinePlayers.find(
              (o) => o.user_id === player.user_id
            );
            if (typeof tempPlayer !== "undefined") {
              //translate the artworldCoordinates to Phaser coordinates
              //console.log(tempPlayer.x , tempPlayer.y)
              tempPlayer.x = CoordinatesTranslator.artworldToPhaser2DX(
                scene.worldSize.x,
                player.posX
              );
              tempPlayer.y = CoordinatesTranslator.artworldToPhaser2DY(
                scene.worldSize.y,
                player.posY
              );
              //console.log(tempPlayer.x , tempPlayer.y)

              // tempPlayer.x = player.posX
              // tempPlayer.y = player.posY

              const movingKey = tempPlayer.getData("movingKey");

              //get the key for the moving animation of the player, and play it
              tempPlayer.anims.play(movingKey, true);

              setTimeout(() => {
                tempPlayer.anims.play(tempPlayer.getData("stopKey"), true);
              }, 250);
            }
          });

          ManageSession.updateOnlinePlayers = false;
        }
      }
    }
  }

  identifySurfaceOfPointerInteraction(scene) {
    // identifies if the pointer is down on a graffiti wall
    // if the condition is true, the avatar stops any movement
    scene.input.on("pointerdown", (pointer, object) => {
      if (
        (object[0] && object[0]?.name == "graffitiBrickWall") ||
        object[0]?.name == "graffitiDotWall" ||
        object[0]?.name == "scrollingBarContainer" ||
        object[0]?.name == "scrollBar"
      ) {
        scene.graffitiDrawing = true;
      }
    });
    scene.input.on("pointerup", () => {
      scene.graffitiDrawing = false;
    });
  }
}

export default new Player();
