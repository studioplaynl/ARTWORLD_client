import ManageSession from "../ManageSession";
import CoordinatesTranslator from "./CoordinatesTranslator";
import { listObjects, listImages, convertImage, getFullAccount } from "../../../api.js";

class Player {
  constructor() { }

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
    scene.isPopUpButtonsDisplayed = false;

    // creating a container that holds all pop-up buttons, the coords are the same as the avatar's
    scene.playerContainer = scene.add.container(scene.player.x, scene.player.y);

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

    scene.player.on("pointerup", async () => {

      await listImages("Liked", scene.selectedPlayerID, 100).then(
        async (response) => {
          scene.currentPlayerLiked = Object.keys(response[0].value)
          console.log(scene.currentPlayerLiked)
          // downloading each artwork of the user
          scene.downloadedImages = {
            artworks: await Promise.all(
              scene.currentPlayerLiked.map(async (element) => {
                const splitKey = await element.split("/")[2].split(".")[0]
                const key = `${splitKey}_128`;
                console.log(element, key)
                if (!scene.textures.exists(key)) {
                  const currentImage = await convertImage(
                    element,
                    "128",
                    "png"
                  );

                  scene.load.image(key, currentImage);

                  scene.load.start(); // load the image in memory
                }
                return { name: `${key}` };
              })
            ),
          };
        }

      );

      // checking if the buttons are hidden, show - if hidden, hide - if displayed
      if (scene.isPopUpButtonsDisplayed == false) {
        scene.playerContainer.setVisible(true);

        scene.homeButtonCircle = scene.add
          .circle(0, -70, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(3, 0x0000);
        scene.homeButtonImage = scene.add.image(0, -70, "home");

        scene.heartButtonCircle = scene.add
          .circle(65, 0, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(3, 0x0000);
        scene.heartButtonImage = scene.add.image(65, 0, "heart");

        scene.heartButtonCircle.on("pointerup", async () => {
          if (scene.currentPlayerLiked.length > 0) {
            scene.scrollablePanel.setVisible(false);

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
                  child: this.createPanel(scene, scene.downloadedImages),
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
        });

        // adding all buttons to the container
        scene.playerContainer.add([
          scene.homeButtonCircle,
          scene.homeButtonImage,
          scene.heartButtonCircle,
          scene.heartButtonImage,
        ]);
        scene.isPopUpButtonsDisplayed = true;

        // entering the home of the avatar
        scene.homeButtonCircle.on("pointerup", () => {
          scene.physics.pause();
          scene.player.setTint(0xff0000);

          ManageSession.socket.rpc("leave", scene.location);

          scene.player.location = "DefaultUserHome";

          scene.time.addEvent({
            delay: 500,
            callback: () => {
              ManageSession.location = "DefaultUserHome";
              ManageSession.createPlayer = true;
              ManageSession.getStreamUsers("join", "DefaultUserHome");
              scene.scene.stop(scene.scene.key);
              if (scene.selectedPlayerID) {
                scene.scene.start("DefaultUserHome", {
                  user_id: scene.selectedPlayerID,
                });
              } else {
                scene.scene.start("DefaultUserHome");
              }
            },
            callbackScope: scene,
            loop: false,
          });
        });
      } else {
        scene.playerContainer.setVisible(false);
        scene.isPopUpButtonsDisplayed = false;
      }
    });
  }

  createPanel(scene, data) {
    var sizer = scene.rexUI.add.sizer({
      orientation: 'x',
      // space: { item: 10 }
    })
      .add(
        this.createTable(scene, data, 'artworks', 1), // child
        { expand: true }
      )
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
      name: key  // Search this name to get table back
    });

    var item, r, c;
    var iconSize = (rows === 1) ? 80 : 40;
    for (var i = 0, cnt = items.length; i < cnt; i++) {
      item = items[i];
      r = i % rows;
      c = (i - r) / rows;
      table.add(
        this.createIcon(scene, item, iconSize, iconSize),
        c,
        r,
        'top',
        5, // distance between artworks
        true
      );
    }

    return scene.rexUI.add.sizer({
      orientation: 'x',
      space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 }
    })
      .addBackground(
        scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(4, 0x000000, 1)
      )
      .add(table, // child
        1, // proportion
        'center', // align
        0, // paddingConfig
        true // expand
      );
  }

  createIcon(scene, item) {
    var label = scene.rexUI.add.label({
      orientation: 'x',
      // icon: scene.rexUI.add.roundRectangle(0, 0, iconWidth, iconHeight, 5, COLOR_LIGHT),
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

    // Horizontal movement
    if (scene.cursors.left.isDown) {
      scene.player.body.setVelocityX(-speed);

      // scene.cursorKeyIsDown = true;
      this.sendMovement(scene);
    } else if (scene.cursors.right.isDown) {
      scene.player.body.setVelocityX(speed);
      // scene.cursorKeyIsDown = true
      // sendPlayerMovement(scene)
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

    // Normalize and scale the velocity so that player can't move faster along a diagonal, the pop-up buttons are included
    scene.player.body.velocity.normalize().scale(speed);
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
          const playerID = player.user_id

          // see if the player already exists
          const found = scene.onlinePlayers.some(
            (user) => user.user_id === playerID
          )

          //if player does not exist in onlinePlayers array, then it is a new player
          if (!found) scene.newOnlinePlayers.push(player)
        })
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
            .setDepth(90)
          element.setInteractive({ useHandCursor: true })
          element.on('pointerup', () => { this.itemsBarOnlinePlayer(scene, element) })

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
          scene.onlinePlayersGroup.add(element)
          //} else {
          //! if the avatar already existed; get the player from the onlinePlayers array !

          this.attachtAvatarToOnlinePlayer(scene, element)
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
          console.log(scene.newOnlinePlayers)

          scene.onlinePlayers = scene.onlinePlayersGroup.getChildren()

          for (let i = 0; i < scene.onlinePlayers.length; i++) {
            this.attachtAvatarToOnlinePlayer(scene, scene.onlinePlayers[i])

          } //for (let i = 0; i < scene.onlinePlayers.length; i++)
        }); //scene.load.on('filecomplete', () =>

        console.log("ManageSession.allConnectedUsers")
        console.log(ManageSession.allConnectedUsers)

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

  itemsBarOnlinePlayer(scene, onlinePlayer) {
    scene.avatarDetailsContainer.setVisible(true)
    scene.onlinePlayerID = onlinePlayer.anims.currentFrame.textureKey.split("_")[0];
  }

  createItemsBarOnlinePlayer(scene) {
    //display and populate the items bar
    //x, y
    //player.x is in the middle of the screen, we use that with an offset 
    //scene.sys.game.canvas.height = bottom of the screen, so we subtract height of the items bar to get y

    const itemsBarWidth = 100
    const itemsBarHeight = 250
    const zoomFactor = scene.UI_Scene.currentZoom

    const itemsBarX = scene.player.x + (itemsBarWidth * 1.4)
    const itemsBarY = (scene.player.y + ((scene.sys.game.canvas.height / 2) / zoomFactor)) - itemsBarHeight - 30

    scene.avatarDetailsContainer = scene.add.container(itemsBarX, itemsBarY)

    scene.avatarDetailsBox = scene.add.graphics()
    scene.avatarDetailsBox.fillStyle(0xffffff, 1).lineStyle(3, 0x000000, 1)
    scene.avatarDetailsBox.fillRoundedRect(0, 0, itemsBarWidth, itemsBarHeight, 24).strokeRoundedRect(0, 0, itemsBarWidth, itemsBarHeight, 24)

    scene.avatarDetailsCloseButton = scene.add
      .circle(-25, -25, 25, 0xffffff)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(3, 0x0000)
      .on("pointerup", () => {
        scene.avatarDetailsContainer.setVisible(false)
        if (scene.scrollContainerOnlinePlayer) {
          scene.scrollContainerOnlinePlayer.destroy()
        }
      })
    scene.avatarDetailsCloseImage = scene.add.image(-25, -25, "close")

    scene.avatarDetailsHouseButton = scene.add
      .circle(50, 50, 25, 0xffffff)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x0000)
      .on("pointerup", () => {
        console.log(scene.onlinePlayerID)
        if (scene.onlinePlayerID) {
          scene.physics.pause();
          scene.player.setTint(0xff0000);

          ManageSession.socket.rpc("leave", scene.location);

          scene.player.location = "DefaultUserHome";

          scene.time.addEvent({
            delay: 500,
            callback: () => {
              ManageSession.location = "DefaultUserHome";
              ManageSession.createPlayer = true;
              ManageSession.getStreamUsers("join", "DefaultUserHome");
              scene.scene.stop(scene.scene.key);
              if (scene.onlinePlayerID) {
                scene.scene.start("DefaultUserHome", {
                  user_id: scene.onlinePlayerID,
                });
              } else {
                scene.scene.start("DefaultUserHome");
              }
            },
            callbackScope: scene,
            loop: false,
          });
        }
      })

    scene.avatarDetailsHouseImage = scene.add.image(50, 50, "home")
    scene.avatarDetailsContainer.add([scene.avatarDetailsBox, scene.avatarDetailsCloseButton, scene.avatarDetailsCloseImage, scene.avatarDetailsHouseButton, scene.avatarDetailsHouseImage])

    // ---------------------------------
    // heart button and scroll container
    scene.avatarDetailsHeartButton = scene.add
      .circle(50, 110, 25, 0xffffff)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x0000)

    scene.avatarDetailsHeartImage = scene.add.image(50, 110, "heart")
    scene.avatarDetailsContainer.add([scene.avatarDetailsHeartButton, scene.avatarDetailsHeartImage])

    scene.avatarDetailsHeartButton.on("pointerup", async () => {
      if (!scene.scrollContainerOnlinePlayer) {
        console.log("111")
        if (scene.onlinePlayerID) {

          await listImages("drawing", scene.onlinePlayerID, 100).then(
            response => {
              scene.onlinePlayerArtworks = response

              console.log("???", scene.onlinePlayerArtworks)
              // if (scene.onlinePlayerArtworks > 0) {

              // coords of the scrolling bar container and the container that holds artworks are the same
              const scrollContainerX = itemsBarX + itemsBarWidth
              const scrollContainerY = itemsBarY

              const distanceBetweenArts = 130

              const scrollContainerWidth = scene.artPreviewSize + 12
              const scrollContainerHeight = itemsBarHeight

              scene.scrollContainerOnlinePlayer = scene.add.graphics()
                .setPosition(scrollContainerX, scrollContainerY)
                .fillStyle(0xffffff, 1).lineStyle(3, 0x000000, 1)
                .fillRoundedRect(0, 0, scrollContainerWidth, scrollContainerHeight, 24).strokeRoundedRect(0, 0, scrollContainerWidth, scrollContainerHeight, 24)
                .setInteractive(new Phaser.Geom.Rectangle(0, 0, scrollContainerWidth, scrollContainerHeight), Phaser.Geom.Rectangle.Contains)
                .setName("onlinePlayerScrollablePanel")

              // creating a container that holds all artworks of the user
              scene.artListOnlinePlayerContainer = scene.add.container(scrollContainerX, scrollContainerY + 20)

              // the height depends on the amount of the artworks, it is needed for scrolling
              const contentHeight = scene.onlinePlayerArtworks.length * distanceBetweenArts

              // overflow: auto (makes the objects outside of the scroll container to not overflow
              scene.artListOnlinePlayerContainer.setMask(scene.scrollContainerOnlinePlayer.createGeometryMask())

              // where the magic calculations happen :)
              const topBound = scrollContainerY
              let bottomBound
              if (contentHeight > scrollContainerHeight) {
                // over a page
                bottomBound = scrollContainerY - contentHeight + scrollContainerHeight;
              } else {
                bottomBound = scrollContainerY
              }
              scene.scroller = scene.plugins.get('rexScroller').add(scene.scrollContainerOnlinePlayer, {
                bounds: [
                  topBound,
                  bottomBound,
                ],
                value: topBound, // initial view (current camera)

                valuechangeCallback: function (value) {
                  scene.artListOnlinePlayerContainer.y = value; // draggable vertically
                },
              })

              console.log(scene.onlinePlayerArtworks)
              // if (scene.onlinePlayerArtworks > 0) {
              scene.onlinePlayerArtworks.forEach(async (element, index) => {

                console.log("333")
                const imgUrl = element.value.url
                const imgSize = "128"
                const fileFormat = "png"
                const key = `${element.key}_${imgSize}`

                const coordY = index == 0 ? 0 : index * distanceBetweenArts
                const coordX = 0


                // scene.artContainer = scene.add.container(0, 0);
                if (scene.textures.exists(key)) { // if the image has already downloaded, then add image by using the key


                  // adds the image to the container
                  const setImage = scene.add.image(coordX, coordY, key).setOrigin(0)
                  scene.artListOnlinePlayerContainer.add(setImage)
                } else { // otherwise download the image and add it

                  scene.artUrl[index] = await convertImage(imgUrl, imgSize, fileFormat)

                  // for tracking each file in progress
                  scene.progress.push({ key, coordX, coordY })

                  scene.load.image(key, scene.artUrl[index])

                  scene.load.start() // load the image in memory

                }

                const progressBox = scene.add.graphics()
                const progressBar = scene.add.graphics()
                const progressWidth = 300
                const progressHeight = 50
                const padding = 10

                scene.load.on("fileprogress", (file, value) => {

                  progressBox.clear();
                  progressBar.clear();
                  progressBox.fillStyle(0x000000, 1)
                  progressBar.fillStyle(0xFFFFFF, 1)

                  const progressedImage = scene.progress.find(element => element.key == file.key)

                  progressBox.fillRect(progressedImage.coordX - progressWidth / 2, progressedImage.coordY, progressWidth, progressHeight)
                  progressBar.fillRect(progressedImage.coordX - progressWidth / 2 + padding, progressedImage.coordY + padding, (progressWidth * value) - (padding * 2), progressHeight - padding * 2)

                })

                scene.load.on('filecomplete', (key) => {

                  const currentImage = scene.progress.find(element => element.key == key)

                  // adds the image to the container
                  const completedImage = scene.add.image(currentImage.coordX, currentImage.coordY, currentImage.key).setOrigin(0)
                  scene.artListOnlinePlayerContainer.add(completedImage)
                })

                scene.load.once("complete", () => {
                  progressBar.destroy()
                  progressBox.destroy()
                  scene.progress = []
                });


              })
            })
        }
      }


      // ends - heart button and scroll container


    })







  }

  attachtAvatarToOnlinePlayer(scene, player, preExisting) {
    scene.tempAvatarName = player.user_id + "_" + player.avatar_time

    //scene.onlinePlayers[i] = scene.add.image(scene.onlinePlayers[i].posX, scene.onlinePlayers[i].posY, scene.tempAvatarName)

    console.log("player added: ")
    console.log(player)

    //sometimes the player is not visible because the postion is 0,0
    if (player.posX == 0 && player.posY == 0) {
      player.posX = 300
      player.posY = 400
    }

    player.x = player.posX
    player.y = player.posY

    console.log("avatar key: ");
    console.log(scene.tempAvatarName);
    if (!preExisting) {
      player.setTexture(scene.tempAvatarName);
    } else {
    }

    player.active = true
    player.visible = true

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
    const width = 64
    player.displayWidth = width
    player.scaleY = scene.player.scaleX

    scene.updateOnlinePlayers = true
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
    scene.scrollablePanel.x = scene.player.x + 200;
    scene.scrollablePanel.y = scene.player.y;
  }

  movePlayerContainer(scene) {
    scene.playerContainer.x = scene.player.x
    scene.playerContainer.y = scene.player.y
  }

  async getAccountDetails(id) {
    await getFullAccount(id).then((rec) => {
      return rec
    })
  }

}

export default new Player();

