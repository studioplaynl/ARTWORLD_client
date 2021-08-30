import CONFIG from "../config.js";
import manageSession from "../manageSession";

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
    this.NetworkPlayer = [];
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
    this.load.image("NetworkPlayer", "./assets/pieceYellow_border05.png");
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
    manageSession.updateMovementInterval = 26; //1000 / frames =  millisec

    //.......  SOCKET ..........................................................................
    this.playerIdText = manageSession.user_id;
    //manageSession.createSocket();
    manageSession.createSocket();
    //....... end SOCKET .......................................................................

    //.......  TEXT ............................................................................
    this.headerText = this.add
      .text(CONFIG.WIDTH / 2, 20, "SHOW DISPLAY LIST", {
        fontFamily: "Arial",
        fontSize: "36px",
      })
      .setOrigin(0.5)
      .setInteractive() //make clickable
      .setScrollFactor(0) //fixed on screen
      .setDepth(30);

    this.headerText.on("pointerup", () => {
      const displaylist = this.playerGroup.getChildren()
      console.log(displaylist)
    }); //on mouseup of clickable text

    this.matchIdText = this.add
      .text(
        this.headerText.x,
        this.headerText.y + 26,
        "userID: " + this.playerIdText,
        {
          fontFamily: "Arial",
          fontSize: "11px",
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setDepth(30);

    this.playerIdText = this.add
      .text(this.headerText.x, this.matchIdText.y + 14, "playerID", {
        fontFamily: "Arial",
        fontSize: "11px",
      })
      .setOrigin(0.5)
      .setInteractive() //make clickable
      .setScrollFactor(0) //fixed on screen
      .setDepth(30)
      .setShadow(1, 1, '#000000', 2);

    this.playerIdText.on("pointerup", () => {
      manageSession.chatExample();
    });

    this.opponentsIdText = this.add
      .text(this.headerText.x, this.playerIdText.y + 14, "", {
        fontFamily: "Arial",
        fontSize: "11px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setDepth(30);
    //.......  end TEXT .......................................................................

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

    this.playerShadow = this.game.add.sprite(this.player.x + this.playerShadowOffset, this.player.y + this.playerShadowOffset, "avatar1").setDepth(100);

    // this.playerShadow.anchor.set(0.5);
    this.playerShadow.setTint(0x000000);
    this.playerShadow.alpha = 0.2;


    this.playerGroup.add(this.player)

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
  }

  createRemotePlayer() {
    //manageSession.connectedOpponents //list of the opponents
    //for each of the opponents, attach a png,

    if (manageSession.allConnectedUsers != null && manageSession.allConnectedUsers.length != this.NetworkPlayer.length) {
      //if user_id from allConnectedUsers 
      console.log("make networkplayer...");

      for (let i = 0; i < manageSession.allConnectedUsers.length; i++) {
        console.log("created network user:");

        console.log(manageSession.allConnectedUsers[i]);

        this.NetworkPlayer[i] = this.add
          .image(this.player.x - 40, this.player.y - 40, "NetworkPlayer")
          .setDepth(100);
        console.log(this.NetworkPlayer.length);
        console.log(this.NetworkPlayer);

        //https://artworldstudioplay.s3.eu-central-1.amazonaws.com/avatar/

        // console.log("make networkplayer");
        // for (let i = 0; i < manageSession.allConnectedUsers.length; i++) {
        //   console.log("created network user:");

        //   console.log(manageSession.allConnectedUsers[i]);
        //   console.log(manageSession.allConnectedUsers[i].avatar_url);

        //   // this.avatarName[i] = "NetworkPlayer" + i;
        //   this.avatarName[i] = "NetworkPlayer" + i;

        //   console.log(this.avatarName[i]);

        //   // if (manageSession.allConnectedUsers[i].avatar_url === "") {
        //   const avatar_url =
        //     'https://artworldstudioplay.s3.eu-central-1.amazonaws.com/avatar/b9ae6807-1ce1-4b71-a8a3-f5958be4d340/orangeship.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAR7FDNFNP252ENA7M%2F20210819%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20210819T124015Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=bb38a60a2603cf269cfdf86c2f5b82f43ac55afe27f21e48bdd1dd90e4a98947';
        //   // }

        //   this.load.image(
        //     this.avatarName[i],
        //     avatar_url
        //   );
        // }

        // this.load.start(); // THIS!

        // if (this.load.hasLoaded) {
        //   for (let i = 0; i < manageSession.allConnectedUsers.length; i++) {
        //     this.NetworkPlayer[i] = this.add
        //       .image(this.player.x - 40, this.player.y - 40, this.avatarName[i])
        //       .setDepth(100);

        //     console.log(this.NetworkPlayer.length);
        //     console.log(this.NetworkPlayer);
        //   }

        //   manageSession.createNetworkPlayers = false;
        //   console.log(
        //     "manageSession.createNetworkPlayers: " +
        //       manageSession.createNetworkPlayers
        //   );
      }
    } else {
      return
    }
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
      this.playerShadow.x + this.playerShadowOffset
      this.playerShadow.y + this.playerShadowOffset 
      // this.arrowDown = true;
      if (
        manageSession.updateMovementTimer > manageSession.updateMovementInterval
      ) {
        manageSession.sendMoveMessage(this.player.x, this.player.y);
        manageSession.updateMovementTimer = 0;
      }
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      // this.arrowDown = true
      if (
        manageSession.updateMovementTimer > manageSession.updateMovementInterval
      ) {
        manageSession.sendMoveMessage(this.player.x, this.player.y);
        manageSession.updateMovementTimer = 0;
      }
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
      // this.arrowDown = true
      if (
        manageSession.updateMovementTimer > manageSession.updateMovementInterval
      ) {
        manageSession.sendMoveMessage(this.player.x, this.player.y);
        manageSession.updateMovementTimer = 0;
      }
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
      // this.arrowDown = true
      if (
        manageSession.updateMovementTimer > manageSession.updateMovementInterval
      ) {
        manageSession.sendMoveMessage(this.player.x, this.player.y);
        manageSession.updateMovementTimer = 0;
      }
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.player.body.velocity.normalize().scale(speed);
  }

  update(time, delta) {
    //.......... UPDATE TIMER      ..........................................................................
    manageSession.updateMovementTimer += delta;
    // console.log(time) //running time in millisec
    // console.log(delta) //in principle 16.6 (60fps) but drop to 41.8ms sometimes
    //....... end UPDATE TIMER  ..............................................................................

    //........ PLAYER MOVE BY KEYBOARD  .........................................................................
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

    if (this.arrowDown || this.player.getData("isMovingByClicking")) {
      this.player.anims.play("moving", true);
    } else if (!this.arrowDown || !this.player.getData("isMovingByClicking")) {
      this.player.anims.play("stop", true);
    }

    //....... MOVE BY CLICKING ......................................................................................
    if (!this.input.activePointer.isDown && this.isClicking == true) {
      this.target.x = this.input.activePointer.worldX
      this.target.y = this.input.activePointer.worldY
      this.physics.moveToObject(this.playerGroup, this.target, 200);
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
        this.playerGroup.body.reset(this.target.x, this.target.y);
        this.player.setData("isMovingByClicking", false)
      } else {
        if (
          manageSession.updateMovementTimer > manageSession.updateMovementInterval
        ) {
          manageSession.sendMoveMessage(this.player.x, this.player.y);
          manageSession.updateMovementTimer = 0;
        }
      }
    }
    //....... end MOVE BY CLICKING ......................................................................................



    this.playerIdText.setText(manageSession.userID);

    if (manageSession.gameStarted) {
      this.headerText.setText("Game has started");
      this.matchIdText.setText("matchID: " + manageSession.matchID);
      this.playerIdText.setText("userID: " + manageSession.userID);

      this.opponentsIdText.setText(
        "opponent: " + manageSession.connectedOpponents[0]
      );
    }

    if (manageSession.createNetworkPlayers) {
      this.createRemotePlayer();
      // manageSession.createNetworkPlayers = false
      // console.log(manageSession.createNetworkPlayers)
    }

    if (manageSession.updateNetworkPlayers) {
      for (let i = 0; i < manageSession.allConnectedUsers.length; i++) {
        this.NetworkPlayer[i].x = manageSession.allConnectedUsers[i].posX;
        this.NetworkPlayer[i].y = manageSession.allConnectedUsers[i].posY;
      }
      manageSession.updateNetworkPlayers = false;
    }
  } //update

} //class
