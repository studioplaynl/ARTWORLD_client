import CONFIG from "../config.js";
import manageSession from "../manageSession";
//import { getAvatar } from '../../profile.svelte';
import { getAvatar } from '../../../api.js';


export default class AZC1_Scene extends Phaser.Scene {
  constructor() {
    super("AZC1_Scene");
    this.headerText;
    this.matchIdText;
    this.playerIdText;
    this.opponentsIdText;

    this.gameStarted = false;
    // this.turn = false;
    this.phaser = this;
    // this.playerPos;
    this.onlinePlayers = [];
    this.avatarName = [];
    this.cursors;
    this.pointer;
    this.isClicking = false;
    this.arrowDown = false;
    this.gameCam

    //pointer location example
    // this.source // = player
    this.target = new Phaser.Math.Vector2();
    this.distance

    //shadow
    this.playerShadowOffset = 10;
  }

  preload() {
    //....... IMAGES ......................................................................
    this.load.image("sky", "./assets/sky.png");
    this.load.image("star", "./assets/star.png");
    this.load.spritesheet(
      "avatar1",
      "./assets/spritesheets/cloud_breathing.png",
      { frameWidth: 68, frameHeight: 68 }
    );
    this.load.image("bomb", "./assets/bomb.png");
    this.load.image("onlinePlayer", "./assets/pieceYellow_border05.png");
    //....... end IMAGES ......................................................................

    //....... TILEMAP .........................................................................
    this.load.image(
      "tiles",
      "./assets/tilesets/tuxmon-sample-32px-extruded.png"
    );
    this.load.tilemapTiledJSON("map", "./assets/tilemaps/tuxemon-town.json");
    //....... end TILEMAP ......................................................................
  }

  create() {
    //timers
    manageSession.updateMovementTimer = 0;
    manageSession.updateMovementInterval = 60; //1000 / frames =  millisec

    //.......  SOCKET ..........................................................................
    this.playerIdText = manageSession.user_id;
    //manageSession.createSocket();
    manageSession.createSocket();
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

    this.playerGroup = this.add.group();

    this.player = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, "avatar1")
      .setDepth(101);

    this.playerShadow = this.add.image(this.player.x + this.playerShadowOffset, this.player.y + this.playerShadowOffset, "avatar1").setDepth(100);

    // this.playerShadow.anchor.set(0.5);
    this.playerShadow.setTint(0x000000);
    this.playerShadow.alpha = 0.2;


    this.playerGroup.add(this.player)
    this.playerGroup.add(this.playerShadow)

    this.player.setData("isMovingByClicking", false) //check if player is moving from pointer input

    //this.player.setCollideWorldBounds(true); // if true the map does not work properly, needed to stay on the map

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
      key: "moving",
      frames: this.anims.generateFrameNumbers("avatar1", { start: 0, end: 8 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: "stop",
      frames: this.anims.generateFrameNumbers("avatar1", { start: 4, end: 4 }),
    });
    //.......  end PLAYER .............................................................................

    //....... PLAYER VS WORLD ..........................................................................
    this.onlinePlayersGroup = this.add.group(); //group onlinePlayers

    this.gameCam = this.cameras.main;
    this.gameCam.startFollow(this.player);
    this.gameCam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

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
  }

  debugFunctions() {

    this.input.keyboard.on('keyup-A', function (event) {
      //get online player group
      const displaylist = this.onlinePlayersGroup.getChildren()
      console.log(displaylist)
    }, this);

    this.input.keyboard.on('keyup-ONE', function (event) {

      console.log('1 key');

      manageSession.testMoveMessage()

    }, this);

    this.input.keyboard.on('keyup-S', function (event) {

      console.log('S key');

    }, this);
    //  Receives every single key down event, regardless of type

    this.input.keyboard.on('keydown', function (event) {

      console.dir(event);

    }, this);
  }


  createOnlinePlayers() {
    //manageSession.connectedOpponents //list of the opponents
    //for each of the opponents, attach a png,

    //first check if onlineplayers need to be created
    if (manageSession.createOnlinePlayers) {

      //try simple way to update onlineplayer: destroy all current ones, create from scratch 
      if (this.onlinePlayersGroup.getChildren() != null) {
        let tempOnlinePlayerGroup = this.onlinePlayersGroup.getChildren()
        tempOnlinePlayerGroup.forEach((element) => {
          element.destroy()
        });
      }

      this.onlinePlayers = []

      if (manageSession.allConnectedUsers != null) {
        

        //if user_id from allConnectedUsers 
        console.log("createOnlinePlayers...");

        console.log(manageSession.allConnectedUsers[0].posX);
        console.log(manageSession.allConnectedUsers[0].posY);
        for (let i = 0; i < manageSession.allConnectedUsers.length; i++) {

          //make an avatar name for the assignment of the image to the GameObject 
          this.avatarName[i] = "avatar_" + manageSession.allConnectedUsers[i].user_id;
          //console.log("this.avatarName[i]: " + this.avatarName[i])

          this.onlinePlayers[i] = manageSession.allConnectedUsers[i] // fill the array with an object

          console.log("manageSession.allConnectedUsers[i].posX and posY: ");
          console.log(manageSession.allConnectedUsers[i].posX);
          console.log(manageSession.allConnectedUsers[i].posY);

          console.log("created onlinePlayer: ");
          console.log(this.onlinePlayers[i]);

          //check if online user has avatar url, otherwise assing one
          if (manageSession.allConnectedUsers[i].avatar_url === "") {
            const avatar_url =
            "https://artworldstudioplay.s3.eu-central-1.amazonaws.com/avatar/0c7378cf-8d7f-4c7a-ab2c-161444ecfd70/blueship%20%281%29.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAR7FDNFNP252ENA7M%2F20210902%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20210902T133835Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=caf40cbf26671cffad0d46d6e79759e07c378754ea5e17b375db1a2d4fee7bfa"
            // }

            manageSession.allConnectedUsers[i].avatar_url = avatar_url

            this.load.image(
              this.avatarName[i],
              manageSession.allConnectedUsers[i].avatar_url
            );
            console.log("assigned avatar url")
          } else {

            // this.load.spritesheet(
            //   this.avatarName[i],
            //   manageSession.allConnectedUsers[i].avatar_url,
            //   { frameWidth: 68, frameHeight: 68 }
            // );

            
            this.load.image(
              this.avatarName[i],
              manageSession.allConnectedUsers[i].avatar_url
            );
          }

          this.load.start(); // load the image in memory
          console.log("this.load.start();")

          //check if image has downloaded from the server and is in memory
          this.load.on('filecomplete', function () {
            console.log(this.onlinePlayers[i] + " has loaded ")
            
            

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

            // onlinePlayers[i] will be overwritten as a gameobject
            this.onlinePlayers[i] = this.add
              .image(this.player.x - 40, this.player.y - 40, this.avatarName[i])
              .setDepth(90);



            //add the onlinePlayer to the onlinePlayerGroup, so they can be queried with .getChildren() if needed
            this.onlinePlayersGroup.add(this.onlinePlayers[i]);

            // console.log(" this.onlinePlayersGroup.add: ")
            // console.log(this.onlinePlayers[i] )

            Object.assign(this.onlinePlayers[i], manageSession.allConnectedUsers[i]); //add all data from manageSession.allConnectedUsers[i] to this.onlinePlayers[i]

            // console.log("Signed URL: ")
            // console.log(this.onlinePlayers[i].avatar_url)

            // console.log(" Object.assign(this.onlinePlayers[i], manageSession.allConnectedUsers[i]);")
            // console.log(this.onlinePlayers[i])

            manageSession.allConnectedUsers[i] = this.onlinePlayers[i];
            // console.log(" Object.assign(this.onlinePlayers[i], manageSession.allConnectedUsers[i]);")
            // console.log(manageSession.allConnectedUsers[i])

            //give the onlinePlayer the last known position
            this.onlinePlayers[i].x = manageSession.allConnectedUsers[i].posX;
            this.onlinePlayers[i].y = manageSession.allConnectedUsers[i].posY;
          }, this);
        }
      } else {
        return
      } // else
    } //if manageSession.createOnlinePlayers = true
    manageSession.createOnlinePlayers = false;
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

  sendPlayerMovement() {
    if (
      manageSession.updateMovementTimer > manageSession.updateMovementInterval
    ) {
      manageSession.sendMoveMessage(Math.round(this.player.x), Math.round(this.player.y));
      manageSession.updateMovementTimer = 0;
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
    //...... ONLINE PLAYERS ................................................
    this.createOnlinePlayers();
    this.updateMovementOnlinePlayers()

    if (manageSession.removeConnectedUser) {
    }
    //.......................................................................

    //........... PLAYER SHADOW .............................................................................
    this.playerShadow.x = this.player.x + this.playerShadowOffset
    this.playerShadow.y = this.player.y + this.playerShadowOffset
    //........... end PLAYER SHADOW .........................................................................


    //.......... UPDATE TIMER      ..........................................................................
    manageSession.updateMovementTimer += delta;
    // console.log(time) //running time in millisec
    // console.log(delta) //in principle 16.6 (60fps) but drop to 41.8ms sometimes
    //....... end UPDATE TIMER  ..............................................................................

    //........ PLAYER MOVE BY KEYBOARD  ......................................................................
    if (this.player.getData("isMovingByClicking") == false) {
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
    if (this.arrowDown || this.player.getData("isMovingByClicking")) {
      this.player.anims.play("moving", true);
    } else if (!this.arrowDown || !this.player.getData("isMovingByClicking")) {
      this.player.anims.play("stop", true);
    }
    //....... end moving ANIMATION .................................................................................

    //....... MOVE BY CLICKING ......................................................................................
    if (!this.input.activePointer.isDown && this.isClicking == true) {
      this.target.x = this.input.activePointer.worldX
      this.target.y = this.input.activePointer.worldY
      this.physics.moveToObject(this.player, this.target, 200);
      this.isClicking = false;
      this.player.setData("isMovingByClicking", true);
    } else if (this.input.activePointer.isDown && this.isClicking == false) {
      this.isClicking = true;
    }

    this.distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);


    //  4 is our distance tolerance, i.e. how close the source can get to the target
    //  before it is considered as being there. The faster it moves, the more tolerance is required.
    if (this.player.getData("isMovingByClicking") == true) {
      if (this.distance < 4) {
        this.player.body.reset(this.target.x, this.target.y);
        this.player.setData("isMovingByClicking", false)
      } else {
        this.sendPlayerMovement();
      }
    }
    //....... end MOVE BY CLICKING ..................................................................................



    this.playerIdText.setText(manageSession.userID);


    if (manageSession.gameStarted) {
      this.headerText.setText("Game has started");
      this.matchIdText.setText("matchID: " + manageSession.matchID);
      this.playerIdText.setText("userID: " + manageSession.userID);

      this.opponentsIdText.setText(
        "opponent: " + manageSession.connectedOpponents[0]
      );
    }



  } //update
} //class
