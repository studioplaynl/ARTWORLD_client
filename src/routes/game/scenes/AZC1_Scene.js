import CONFIG from "../config.js";
import manageSession from "../manageSession";

export default class InGame extends Phaser.Scene {
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
    this.cursors;
  }

  preload() {
    this.load.image("sky", "./assets/sky.png");
    this.load.image("star", "./assets/star.png");
    this.load.image("bomb", "./assets/bomb.png");
    this.load.image("NetworkPlayer", "./assets/pieceYellow_border05.png");

    ///////// TILEMAP //////////////////////////////////////////////////////////////////////////////////////////
    this.load.image(
      "tiles",
      "./assets/tilesets/tuxmon-sample-32px-extruded.png"
    );
    this.load.tilemapTiledJSON("map", "./assets/tilemaps/tuxemon-town.json");
    ///////// end TILEMAP //////////////////////////////////////////////////////////////////////////////////////////
  }

  create() {
    /////////  SOCKET //////////////////////////////////////////////////////////////////////////////////////////////
    this.playerIdText = manageSession.user_id;
    //manageSession.createSocket();
    manageSession.createSocket();
    ///////// end SOCKET //////////////////////////////////////////////////////////////////////////////////////////

    /////////  TEXT //////////////////////////////////////////////////////////////////////////////////////////////
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
    this.player = this.physics.add
      .image(spawnPoint.x, spawnPoint.y, "star")
      .setDepth(5);

    //this.player.setCollideWorldBounds(true); // if true the map does not work properly, needed to stay on the map
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
    this.physics.add.collider(this.player, worldLayer);
    //////// end PLAYER VS WORLD //////////////////////////////////////////////////////////////////////////////////////////////

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  createRemotePlayer() {
    //manageSession.connectedOpponents //list of the opponents
    //for each of the opponents, attach a png,
    console.log("make networkplayer...");
    for (let i = 0; i < manageSession.allConnectedUsers.length; i++) {
      if (manageSession.allConnectedUsers[i] != manageSession.user_id) {
        console.log("created network user:")

        console.log(manageSession.allConnectedUsers[i])
        
        this.NetworkPlayer[0] = this.add.image(
          this.player.x - 40,
          this.player.y - 40,
          "NetworkPlayer"
        );
      }
    }
  
    manageSession.createNetworkPlayers = false;
    console.log(
      "manageSession.createNetworkPlayers: " +
        manageSession.createNetworkPlayers
    );
  } //createRemotePlayer

  enterLocation2Scene(player) {
    this.physics.pause();
    player.setTint(0xff0000);
    this.scene.start("Location2_Scene");
  }

  update(time, delta) {
    //////// PLAYER SPEED CONTROL  //////////////////////////////////////////////////////////////////////////////////////////////
    const speed = 175;
    const prevVelocity = this.player.body.velocity.clone();

    // Stop any previous movement from the last frame
    this.player.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
      manageSession.sendChatMessage(this.player.x, this.player.y);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      manageSession.sendChatMessage(this.player.x, this.player.y);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
      manageSession.sendChatMessage(this.player.x, this.player.y);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
      manageSession.sendChatMessage(this.player.x, this.player.y);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.player.body.velocity.normalize().scale(speed);
    //////// end PLAYER SPEED CONTROL  //////////////////////////////////////////////////////////////////////////////////////////////

    // if (this.cursors.left.isDown) {
    //   this.player.setVelocityX(-160);
    //   manageSession.sendChatMessage(this.player.x, this.player.y);
    //   //manageSession.chat();
    //   //this.headerText.setText("setVelocityX(-160)");
    //   //manageSession.socket.sendMatchState(manageSession.matchID, 2, "", null);
    // } else if (this.cursors.right.isDown) {
    //   this.player.setVelocityX(160);
    //   //manageSession.makeMove(this.player.x, this.player.y);
    // } else if (this.cursors.up.isDown) {
    //   this.player.setVelocityY(-160);
    //   //manageSession.makeMove(this.player.x, this.player.y);
    // } else if (this.cursors.down.isDown) {
    //   this.player.setVelocityY(160);
    //   //manageSession.makeMove(this.player.x, this.player.y);
    // } else {
    //   this.player.setVelocityX(0);
    //   this.player.setVelocityY(0);
    // }

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
  } //update
} //class
