import { fix_position } from "svelte/internal";
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
  }

  preload() {
    ///////// IMAGES //////////////////////////////////////////////////////////////////////////////////////////////
    this.load.image("sky", "./assets/sky.png");
    this.load.image("star", "./assets/star.png");
    this.load.spritesheet(
      "avatar1",
      "./assets/spritesheets/cloud_breathing.png",
      { frameWidth: 68, frameHeight: 68 }
    );
    this.load.image("bomb", "./assets/bomb.png");
    this.load.image("NetworkPlayer", "./assets/pieceYellow_border05.png");
    ///////// end IMAGES //////////////////////////////////////////////////////////////////////////////////////////////

    ///////// TILEMAP //////////////////////////////////////////////////////////////////////////////////////////////
    this.load.image(
      "tiles",
      "./assets/tilesets/tuxmon-sample-32px-extruded.png"
    );
    this.load.tilemapTiledJSON("map", "./assets/tilemaps/tuxemon-town.json");
    ///////// end TILEMAP //////////////////////////////////////////////////////////////////////////////////////////
  }

  create() {
    //timers
    manageSession.updateMovementTimer = 0;
    manageSession.updateMovementInterval = 26; //1000 / frames =  millisec

    /////////  SOCKET //////////////////////////////////////////////////////////////////////////////////////////////
    this.playerIdText = manageSession.user_id;
    //manageSession.createSocket();
    manageSession.createSocket();
    ///////// end SOCKET ///////////////////////////////////////////////////////////////////////////////////////////

    /////////  TEXT ////////////////////////////////////////////////////////////////////////////////////////////////
    this.headerText = this.add
      .text(CONFIG.WIDTH / 2, 20, "Waiting for game to start", {
        fontFamily: "Arial",
        fontSize: "36px",
      })
      .setOrigin(0.5)
      .setInteractive() //make clickable
      .setScrollFactor(0) //fixed on screen
      .setDepth(30);

    this.headerText.on("pointerup", () => {
      manageSession.chat();
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
      .setDepth(30);

    this.playerIdText.on("pointerup", () => {
      manageSession.chatExample();
    });

    this.opponentsIdText = this.add
      .text(this.headerText.x, this.playerIdText.y + 14, "opponentsID", {
        fontFamily: "Arial",
        fontSize: "11px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setDepth(30);
    /////////  end TEXT //////////////////////////////////////////////////////////////////////////////////////////////

    /////////  LOCATIONS //////////////////////////////////////////////////////////////////////////////////////////////
    // this.location2 = this.physics.add.staticGroup();
    // this.location2
    //   .create(
    //     this.game.config.width - 100,
    //     this.game.config.height - 200,
    //     "bomb"
    //   )
    //   .setScale(3)
    //   .refreshBody();
    /////////  end LOCATIONS //////////////////////////////////////////////////////////////////////////////////////////////

    ///////// TILEMAP //////////////////////////////////////////////////////////////////////////////////////////
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
    ///////// end TILEMAP //////////////////////////////////////////////////////////////////////////////////////////

    /////////  PLAYER //////////////////////////////////////////////////////////////////////////////////////////////
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

    this.player = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, "avatar1")
      .setDepth(101);

    this.player.setData("clickMovingStopped", true)
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
    /////////  end PLAYER //////////////////////////////////////////////////////////////////////////////////////////////

    //////// PLAYER VS WORLD //////////////////////////////////////////////////////////////////////////////////////////////
    const camera = this.cameras.main;
    camera.startFollow(this.player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

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
    //////// end PLAYER VS WORLD //////////////////////////////////////////////////////////////////////////////////////////////

    //////// INPUT //////////////////////////////////////////////////////////////////////////////////////////////
    this.cursors = this.input.keyboard.createCursorKeys();
    //this.pointer = this.input.activePointer;
    //////// end INPUT //////////////////////////////////////////////////////////////////////////////////////////////
  }

  createRemotePlayer() {
    //manageSession.connectedOpponents //list of the opponents
    //for each of the opponents, attach a png,

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
  } //createRemotePlayer

  enterLocation2Scene(player) {
    this.physics.pause();
    player.setTint(0xff0000);
    this.scene.start("Location2_Scene");
  }

  update(time, delta) {
    //////// UPDATE TIMER      //////////////////////////////////////////////////////////////////////////////////////////////
    manageSession.updateMovementTimer += delta;
    // console.log(time) //running time in millisec
    // console.log(delta) //in principle 16.6 (60fps) but drop to 41.8ms sometimes
    //////// end UPDATE TIMER  //////////////////////////////////////////////////////////////////////////////////////////////

    //////// PLAYER SPEED CONTROL  //////////////////////////////////////////////////////////////////////////////////////////////
    const speed = 175;
    const prevVelocity = this.player.body.velocity.clone();

    // Stop any previous movement from the last frame
    this.player.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
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

    if (
      this.cursors.up.isDown ||
      this.cursors.down.isDown ||
      this.cursors.left.isDown ||
      this.cursors.right.isDown
    ) {
      this.player.anims.play("moving", true);
      this.arrowDown = true
    } else {
      this.player.anims.play("stop", true);
      this.arrowDown = false
    }

    if (!this.input.activePointer.isDown && this.isClicking == true) {
      // this.player.x = this.input.activePointer.position.x;
      // this.player.y = this.input.activePointer.position.y;
      this.player.setData("posX", this.input.activePointer.position.x)
      this.player.setData("posY", this.input.activePointer.position.y)
      this.player.setData("clickMovingStopped", false)
      this.isClicking = false;
      // this.player.setData("isMoving", true)
      // console.log("this.isClicking")
      // console.log(this.isClicking)
    } else if (this.input.activePointer.isDown && this.isClicking == false) {
      this.isClicking = true;
      // console.log("this.isClicking")
      // console.log(this.isClicking)
    }

    if (!this.arrowDown && this.player.getData("clickMovingStopped") == false) {
      
      if (Math.abs(this.player.x - this.player.getData("posX")) <= 4) {
        this.player.x = this.player.getData("posX")
        this.player.setData("clickMovingStopped", true)
      } else if (this.player.x < this.player.getData("posX")) {
        // this.player.x += 5;
        this.player.body.setVelocityX(speed);
      } else if (this.player.x > this.player.getData("posX")) {
        // this.player.x -= 5;
        this.player.body.setVelocityX(-speed);
      }
    }


    if (!this.arrowDown && this.player.getData("clickMovingStopped") == false) {
      if (Math.abs(this.player.y - this.player.getData("posY")) <= 4) {
        this.player.y = this.player.getData("posY")
        this.player.setData("clickMovingStopped", true)
        } else if (this.player.y < this.player.getData("posY")) {
          this.player.body.setVelocityY(speed);
        } else if (this.player.y > this.player.getData("posY")) {
          this.player.body.setVelocityY(-speed);
      }
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.player.body.velocity.normalize().scale(speed);
    //////// end PLAYER SPEED CONTROL  //////////////////////////////////////////////////////////////////////////////////////////////

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
