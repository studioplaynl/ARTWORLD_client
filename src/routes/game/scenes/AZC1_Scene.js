import CONFIG from "../config.js";
import manageSession from "../manageSession";
//import { getAvatar } from '../../profile.svelte';
import { getAccount, compareArray } from '../../../api.js';
import { compute_slots } from "svelte/internal";


export default class AZC1_Scene extends Phaser.Scene {
  constructor() {
    super("AZC1_Scene");
    // this.headerText;
    // this.matchIdText;
    // this.playerIdText;
    // this.opponentsIdText;
    // this.oallConnectedUsersText2;

    this.gameStarted = false;
    // this.turn = false;
    this.phaser = this;
    // this.playerPos;
    this.onlinePlayers = [];
    this.currentOnlinePlayer;
    this.avatarName = [];
    this.tempAvatarName = ""
    this.loadedAvatars = [];

    this.playerAvatarPlaceholder = "playerAvatar";
    this.playerAvatarKey = ""
    this.createdPlayer = false;

    this.cursors;
    this.pointer;
    this.isClicking = false;
    this.arrowDown = false;
    this.gameCam;

    //pointer location example
    // this.source // = player
    this.target = new Phaser.Math.Vector2();
    this.distance;

    //shadow
    this.playerShadowOffset = 10;
    this.playerIsMovingByClicking = false;
  }

  async preload() {
    //....... IMAGES ......................................................................
    this.load.image("sky", "./assets/sky.png");
    this.load.image("star", "./assets/star.png");
    this.load.spritesheet(
      "avatar1",
      "./assets/spritesheets/cloud_breathing.png",
      { frameWidth: 68, frameHeight: 68 }
    );

    this.load.image("onlinePlayer", "./assets/pieceYellow_border05.png");
    //....... end IMAGES ......................................................................

    //....... TILEMAP .........................................................................
    this.load.image(
      "tiles",
      "./assets/tilesets/tuxmon-sample-32px-extruded.png"
    );
    this.load.tilemapTiledJSON("map", "./assets/tilemaps/tuxemon-town.json");
    //....... end TILEMAP ......................................................................

    // //load events
    // this.load.on('progress', function (value) {
    //   console.log(value);
    // });

    // this.load.on('fileprogress', function (file) {
    //   console.log(file.src);
    // });
    // this.load.on('complete', function () {
    //   console.log('complete');
    // });
    await manageSession.createSocket();
  }

  async create() {
    //timers
    manageSession.updateMovementTimer = 0;
    manageSession.updateMovementInterval = 60; //1000 / frames =  millisec

    //.......  SOCKET ..........................................................................
    this.playerIdText = manageSession.user_id;
    //manageSession.createSocket();

    //....... end SOCKET .......................................................................

    this.add.graphics()

    //.......  LOCATIONS ......................................................................
    // this.location2 = this.physics.add.staticGroup();
    // this.location2
    //   .create(
    //     this.game.config.width - 100,
    //     this.game.config.height - 200,
    //     "bomb"
    //   )
    //   .setScale(3)
    //   .refreshBody();
    //.......  end LOCATIONS ......................................................................

    //....... TILEMAP .............................................................................
    const map = this.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
    const worldLayer = map.createLayer("World", tileset, 0, 0);
    const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

    worldLayer.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(10);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = map.findObject(
      "Objects",
      (obj) => obj.name === "Spawn Point"
    );
    //....... end TILEMAP ......................................................................

    //.......  PLAYER ..........................................................................
    // const animationSetup = {
    //   key: "playerAnimation",
    //   frames: this.anims.generateFrameNumbers("move", {
    //     start: 0,
    //     end: 9,
    //     first: 0,
    //   }),
    //   frameRate: 15,
    //   repeat: -1,
    // };
    // this.anims.create(animationSetup);

    //create player group
    this.playerGroup = this.add.group();

    //set playerAvatarKey to a placeholder, so that the player loads even when the networks is slow, and the dependencies on player will funciton
    this.playerAvatarPlaceholder = "onlinePlayer";

    this.player = this.physics.add
      .image(spawnPoint.x, spawnPoint.y, this.playerAvatarPlaceholder)
      .setDepth(101);

    //await this.loadAndCreatePlayerAvatar()


    this.playerShadow = this.add.image(this.player.x + this.playerShadowOffset, this.player.y + this.playerShadowOffset, this.playerAvatarPlaceholder).setDepth(100);

    // this.playerShadow.anchor.set(0.5);
    this.playerShadow.setTint(0x000000);
    this.playerShadow.alpha = 0.2;


    this.playerGroup.add(this.player);
    this.playerGroup.add(this.playerShadow);

    //this.player.setCollideWorldBounds(true); // if true the map does not work properly, needed to stay on the map

    //  Our player animations, turning, walking left and walking right.
    // this.anims.create({
    //   key: "moving",
    //   frames: this.anims.generateFrameNumbers("avatar1", { start: 0, end: 8 }),
    //   frameRate: 20,
    //   repeat: -1,
    // });

    // this.anims.create({
    //   key: "stop",
    //   frames: this.anims.generateFrameNumbers("avatar1", { start: 4, end: 4 }),
    // });
    //.......  end PLAYER .............................................................................

    //....... onlinePlayers ...........................................................................
    // add onlineplayers group
    this.onlinePlayersGroup = this.add.group();

    //....... end onlinePlayers .......................................................................



    //....... PLAYER VS WORLD ..........................................................................
    this.onlinePlayersGroup = this.add.group(); //group onlinePlayers

    this.gameCam = this.cameras.main;

    //setBounds has to be set before follow, otherwise the camera doesn't follow!
    this.gameCam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.gameCam.startFollow(this.player);

    // this.player.setCollideWorldBounds(true);
    // this.physics.add.collider(
    //   this.player,
    //   this.location2,
    //   this.enterLocation2_Scene,
    //   null,
    //   this
    // );

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    //-->off
    //this.physics.add.collider(this.player, worldLayer);
    //<--off
    //......... end PLAYER VS WORLD ......................................................................

    //......... INPUT ....................................................................................
    this.cursors = this.input.keyboard.createCursorKeys();
    //this.pointer = this.input.activePointer;
    //.......... end INPUT ................................................................................

    //......... DEBUG FUNCTIONS ............................................................................
    this.debugFunctions();
    this.createDebugText();
    //......... end DEBUG FUNCTIONS .........................................................................
  } // end create

  loadAndCreatePlayerAvatar() {
    if (manageSession.createPlayer) {
      manageSession.createPlayer = false;
      console.log("manageSession.createPlayer = false;")
      this.createdPlayer = false;

      console.log("loadAndCreatePlayerAvatar")

      // is playerAvaterKey already in loadedAvatars?
      //no -> load the avatar and add to loadedAvatars
      //yes -> dont load the avatar

      this.playerAvatarKey = manageSession.playerObjectSelf.id + "_" + manageSession.playerObjectSelf.create_time
      console.log(this.playerAvatarKey)

      console.log("this.textures.exists(this.playerAvatarKey): ")
      console.log(this.textures.exists(this.playerAvatarKey))

      if (!this.textures.exists(this.playerAvatarKey)) {
        if (manageSession.playerObjectSelf.url === "") {
          console.log("avatar url is empty")
          manageSession.createPlayer = false;
          console.log("manageSession.createPlayer = false;")
          this.createdPlayer = true;
          console.log("this.createdPlayer = true;")
          return
        } else {
          console.log(" loading: manageSession.playerObjectSelf.url: ")
          console.log(manageSession.playerObjectSelf.url)

          this.load.image(
            this.playerAvatarKey,
            manageSession.playerObjectSelf.url
          );

          this.load.once(Phaser.Loader.Events.COMPLETE, () => {
            console.log("loadAndCreatePlayerAvatar complete")
            if (this.textures.exists(this.playerAvatarKey)) {
              // texture loaded so use instead of the placeholder
              this.player.setTexture(this.playerAvatarKey)
              // this.player = this.add.image(this.player.x, this.player.y, this.playerAvatarKey)
              console.log("player avatar has loaded ")
              console.log(this.playerAvatarKey)

              this.createdPlayer = true;
              console.log("this.createdPlayer = true;")
            }

          })
        }

        this.load.start(); // load the image in memory
        console.log("this.load.start();");

        // this.anims.create({
        //   key: "moving_" + manageSession.allConnectedUsers[i].user_id,
        //   frames: this.anims.generateFrameNumbers(this.avatarName[i], { start: 0, end: 8 }),
        //   frameRate: 20,
        //   repeat: -1,
        // });

        // this.anims.create({
        //   key: "stop_" + manageSession.allConnectedUsers[i].user_id,
        //   frames: this.anims.generateFrameNumbers(this.avatarName[i], { start: 4, end: 4 }),
        // });


      }

    }//if(manageSession.playerCreated)

  }

  createDebugText() {
    this.headerText = this.add
      .text(CONFIG.WIDTH / 2, 20, "", {
        fontFamily: "Arial",
        fontSize: "36px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(3, 3, '#000000', 0)
      .setDepth(30);

    this.matchIdText = this.add
      .text(
        this.headerText.x,
        this.headerText.y + 26,
        "user_id: " + this.playerIdText,
        {
          fontFamily: "Arial",
          fontSize: "16px",
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setInteractive() //make clickable
      .setShadow(1, 1, '#000000', 0)
      .setDepth(30);

    this.playerIdText = this.add
      .text(this.headerText.x, this.matchIdText.y + 14, "playerID", {
        fontFamily: "Arial",
        fontSize: "11px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setDepth(30)
      .setShadow(1, 1, '#000000', 0);

    this.matchIdText.on("pointerup", () => {
      this.onlinePlayers[0].setVisible(false); //works
      this.onlinePlayers[0].destroy();
    });

    this.opponentsIdText = this.add
      .text(this.headerText.x, this.playerIdText.y + 14, "", {
        fontFamily: "Arial",
        fontSize: "11px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setDepth(30);

    this.allConnectedUsersText = this.add.text(110, 20, "onlineUsers[ ]", { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(300);

    this.allConnectedUsersText2 = this.add.text(110, 40, "", { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(300);

    this.onlinePlayersText = this.add.text(110, 70, "onlinePlayers[ ]", { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(300);

    this.onlinePlayersText2 = this.add.text(110, 90, "", { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(300);


    this.onlinePlayersGroupText = this.add.text(110, 120, "playersGroup[ ]", { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(300);

    this.onlinePlayersGroupText2 = this.add.text(110, 140, "", { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(300);

  }

  debugFunctions() {
    this.input.keyboard.on('keyup-A', function (event) {
      //get online player group
      const displaylist = this.onlinePlayersGroup.getChildren()
      console.log(displaylist)
    }, this);

    this.input.keyboard.on('keyup-ONE', function (event) {

      console.log('1 key');

      manageSession.getStreamUsers("get_users", "home")

    }, this);

    this.input.keyboard.on('keyup-S', function (event) {

      console.log('S key');

      //list all images in the textureManager
      console.log(this.textures.list)

      //Return an array listing the events for which the emitter has registered listeners.
      console.log("Return an array listing the events for which the emitter has registered listeners: ")
      console.log(this.textures.eventNames())

    }, this);

    this.input.keyboard.on('keyup-D', function (event) {

      console.log('D key');

      console.log('this.onlinePlayers: ')
      console.log(this.onlinePlayers)

      console.log("manageSession.allConnectedUsers: ")
      console.log(manageSession.allConnectedUsers)

      console.log("onlinePlayerGroup Children: ")
      console.log(this.onlinePlayersGroup.getChildren())

      console.log("this.player: ")
      console.log(this.player)

    }, this);

    this.input.keyboard.on('keyup-F', function (event) {

      console.log('F key');

      console.log("manageSession.playerObjectSelf: ")
      console.log(manageSession.playerObjectSelf)

      console.log("this.createOnlinePlayers: ")
      console.log(manageSession.createOnlinePlayers)

      console.log("this.createdPlayer: ")
      console.log(this.createdPlayer)
    }, this);

    this.input.keyboard.on('keyup-Q', function (event) {

      console.log('Q key');
      getAccount();

    }, this);

    this.input.keyboard.on('keyup-W', function (event) {

      console.log('W key');


    }, this);

    // //  Receives every single key down event, regardless of type

    // this.input.keyboard.on('keydown', function (event) {

    //   console.dir(event);

    // }, this);
  }

  createOnlinePlayers() {
    //manageSession.connectedOpponents //list of the opponents
    //for each of the opponents, attach a png,

    //loading is broken, so I'm checking if the player avater has already loaded, after that I load onlineUsers
    if (this.createdPlayer) {
      //first check if onlineplayers need to be created
      if (manageSession.createOnlinePlayers) {
        manageSession.createOnlinePlayers = false

        console.log("createOnlinePlayers...");

        //all current onlinePlayers, or an empty []
        this.onlinePlayers = this.onlinePlayersGroup.getChildren() || []

        // ..... players in this.onlinePlayers that are not in .allConnectedUsers -> they need to be deactivated and hidden.....................

        //check if there are players in this.onlinePlayers that are not in .allConnectedUsers -> they need to be deactivated and hidden
        let onlyInOnlinePlayers = this.onlinePlayers.filter(compareArray(manageSession.allConnectedUsers));
        console.log("onlyInOnlinePlayers")
        console.log(onlyInOnlinePlayers)

        //players in this.onlinePlayers that are not in .allConnectedUsers -> they need to be deactivated and hidden
        if (onlyInOnlinePlayers.length > 0) {
          //hide users
          console.log("Hide user")
          for (let i = 0; i < onlyInOnlinePlayers.length; i++) {
            //check if the user_id is in this.onlinePlayers
            const deactiveUser = Phaser.Actions.GetFirst(this.onlinePlayers, onlyInOnlinePlayers[i].user_id)
            deactiveUser.active = false
            deactiveUser.visible = false
            console.log("deactiveUser: ")
            console.log(deactiveUser)
          }
        }
        // .....end  players in this.onlinePlayers that are not in .allConnectedUsers -> they need to be deactivated and hidden.....................

        //...... LOAD NEW AVATARS ........................................................................................
        //(new) players present in .allConnectedUsers but not in this.onlinePlayers ->add them to this.onlinePlayers
        let newOnlinePlayers = manageSession.allConnectedUsers.filter(compareArray(this.onlinePlayers));
        console.log("newOnlinePlayers")
        console.log(newOnlinePlayers)

        //a brand new user
        newOnlinePlayers.forEach((element, i) => {
          console.log("element: ")
          console.log(element)

          let elementCopy = element
          console.log("elementCopy: ")
          console.log(elementCopy)
          //a new user
          this.tempAvatarName = element.user_id + "_" + element.avatar_time;

          this.load.image(this.tempAvatarName, element.avatar_url)

          console.log("loading: ")
          console.log(this.tempAvatarName)

          //the avatar images should be added to the player names still
          //we should add a place holder first
          
          //debug postition next tot current player
          element.posX = this.player.x + 100
          element.posY = this.player.y - 100

          element = this.add.image(element.posX, element.posY, this.playerAvatarPlaceholder)
          .setDepth(90)

          Object.assign(element, elementCopy); //add all data from manageSession.allConnectedUsers[i] to this.onlinePlayers[i]
   
          // add new player to group
          this.onlinePlayersGroup.add(element)
        })

        this.onlinePlayers = this.onlinePlayersGroup.getChildren() 
        console.log("all players in the group: ")
        console.log(this.onlinePlayers)

        //added new players
        this.load.start(); // load the image in memory
        console.log("started loading new online avatars")
        //.... end load new Avatars ....................................................................................


        //when the images are loaded the new ones should be set to the players

        this.load.on('filecomplete', () => {
          for (let i = 0; i < this.onlinePlayers.length; i++) {
            this.tempAvatarName = this.onlinePlayers[i].user_id + "_" + this.onlinePlayers[i].avatar_time;
            //this.onlinePlayers[i] = this.add.image(this.onlinePlayers[i].posX, this.onlinePlayers[i].posY, this.tempAvatarName)
            
            console.log("player added: ")
            console.log(this.onlinePlayers[i])

            console.log("avatar key: ")
            console.log(this.tempAvatarName)
            this.onlinePlayers[i].setTexture(this.tempAvatarName)
          }
        })

      }//if (manageSession.createOnlinePlayers)
    }//if (manageSession.createdPlayer) 
  } //createRemotePlayer

  enterLocation2Scene(player) {
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.scene.start("Location2_Scene");
  }

  playerMovingByKeyBoard() {
    const speed = 175;
    const prevVelocity = this.player.body.velocity.clone();

    // Stop any previous movement from the last frame
    this.player.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);

      // this.arrowDown = true;
      this.sendPlayerMovement();
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      // this.arrowDown = true
      this.sendPlayerMovement();
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
      // this.arrowDown = true
      this.sendPlayerMovement();
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
      // this.arrowDown = true
      this.sendPlayerMovement();
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.player.body.velocity.normalize().scale(speed);

  }

  playerMovingByClicking() {

    if (!this.input.activePointer.isDown && this.isClicking == true) {
      this.target.x = this.input.activePointer.worldX
      this.target.y = this.input.activePointer.worldY
      this.physics.moveToObject(this.player, this.target, 200);
      this.isClicking = false;
      this.playerIsMovingByClicking = true;
    } else if (this.input.activePointer.isDown && this.isClicking == false) {
      this.isClicking = true;
    }

    this.distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);


    //  4 is our distance tolerance, i.e. how close the source can get to the target
    //  before it is considered as being there. The faster it moves, the more tolerance is required.
    if (this.playerIsMovingByClicking) {
      if (this.distance < 4) {
        this.player.body.reset(this.target.x, this.target.y);
        this.playerIsMovingByClicking = false
      } else {
        this.sendPlayerMovement();
      }
    }

  }

  sendPlayerMovement() {
    if (this.createdPlayer) {
      if (
        manageSession.updateMovementTimer > manageSession.updateMovementInterval
      ) {
        manageSession.sendMoveMessage(Math.round(this.player.x), Math.round(this.player.y));
        manageSession.updateMovementTimer = 0;
      }
    }
  }

  updateMovementOnlinePlayers() {
    if (manageSession.updateOnlinePlayers) {
      for (let i = 0; i < manageSession.allConnectedUsers.length; i++) {
        this.onlinePlayers[i].x = manageSession.allConnectedUsers[i].posX;
        this.onlinePlayers[i].y = manageSession.allConnectedUsers[i].posY;
        //console.log("updating online players")
      }
      manageSession.updateOnlinePlayers = false;
    }
  }

  update(time, delta) {
    // //...... ONLINE PLAYERS ................................................
    this.createOnlinePlayers();
    this.updateMovementOnlinePlayers()
    this.loadAndCreatePlayerAvatar();

    // if (manageSession.removeConnectedUser) {
    // }
    // //.......................................................................

    // //........... PLAYER SHADOW .............................................................................
    this.playerShadow.x = this.player.x + this.playerShadowOffset
    this.playerShadow.y = this.player.y + this.playerShadowOffset
    // //........... end PLAYER SHADOW .........................................................................


    //.......... UPDATE TIMER      ..........................................................................
    manageSession.updateMovementTimer += delta;
    // console.log(time) //running time in millisec
    // console.log(delta) //in principle 16.6 (60fps) but drop to 41.8ms sometimes
    //....... end UPDATE TIMER  ..............................................................................

    // //........ PLAYER MOVE BY KEYBOARD  ......................................................................
    if (!this.playerIsMovingByClicking) {
      this.playerMovingByKeyBoard();
    }

    if (
      this.cursors.up.isDown ||
      this.cursors.down.isDown ||
      this.cursors.left.isDown ||
      this.cursors.right.isDown
    ) {
      this.arrowDown = true
    } else {
      this.arrowDown = false
    }
    //....... end PLAYER MOVE BY KEYBOARD  ..........................................................................

    //....... moving ANIMATION ......................................................................................
    if (this.arrowDown || this.playerIsMovingByClicking) {
      // this.player.anims.play("moving", true);
    } else if (!this.arrowDown || !this.playerIsMovingByClicking) {
      // this.player.anims.play("stop", true);
    }
    //....... end moving ANIMATION .................................................................................

    this.playerMovingByClicking()

    //this.playerIdText.setText(manageSession.userID);
    this.allConnectedUsersText2.setText(manageSession.allConnectedUsers.length)
    this.onlinePlayersText2.setText(this.onlinePlayers.length)
    let onlinePlayerGroupLength = this.onlinePlayersGroup.getChildren()
    this.onlinePlayersGroupText2.setText(onlinePlayerGroupLength.length)


  } //update
} //class
