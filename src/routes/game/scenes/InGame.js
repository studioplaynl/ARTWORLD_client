import CONFIG from "../config.js";
import Nakama from "../nakama.js";
import Chat from "./Chat.js";
import manageSession from "./manageSession.js";

export default class InGame extends Phaser.Scene {
  constructor() {
    super("InGame");
    this.headerText;
    this.matchIdText;
    this.playerIdText;
    this.opponentsIdText;

    this.gameStarted = false;
    // this.turn = false;
    this.phaser = this;
    // this.playerPos;
    this.NetworkPlayer = [];
  }

  preload() {
    this.load.image("sky", "./assets/sky.png");
    this.load.image("star", "./assets/star.png");
    this.load.image("bomb", "./assets/bomb.png");
    this.load.image("NetworkPlayer", "./assets/pieceYellow_border05.png");

    this.load.image("tiles", "./assets/tuxmon-sample-32px-extruded.png");
    this.load.tilemapTiledJSON("map", "./assets//test_map.json");
  }

  create() {
    /////////////////// INPUT ///////////////////////////////////////////////////////
    this.cursors = this.input.keyboard.createCursorKeys();
    ////////////////// INPUT END ///////////////////////////////////////////////////////

    //////////////// MAP /////////////////////////////////////////////////////////////
    this.map = this.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = this.map.addTilesetImage(
      "tuxmon-sample-32px-extruded",
      "tiles"
    );

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = this.map.createLayer(
      "Tile Layer 1",
      tileset,
      0,
      0
    );
    //const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    //const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

    this.camera = this.cameras.main;

    this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera: this.camera,
      left: this.cursors.left,
      right: this.cursors.right,
      up: this.cursors.up,
      down: this.cursors.down,
      speed: 0.5,
    });

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    ///////////////////// MAP END ////////////////////////////////////////////////////



    this.playerIdText = manageSession.user_id;
    Chat.createSocket();


    // this.add
    //   .image(this.game.config.width / 2, this.game.config.height / 2, "sky")
    //   .setScale(1.4);

    this.headerText = this.add
      .text(CONFIG.WIDTH / 2, 20, "Waiting for game to start", {
        fontFamily: "Arial",
        fontSize: "36px",
      })
      .setOrigin(0.5)
      .setInteractive(); //make clickable

    this.headerText.on("pointerup", () => {
      Chat.sendChatMessage();
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
      .setOrigin(0.5);

    this.playerIdText = this.add
      .text(this.headerText.x, this.matchIdText.y + 14, "playerID", {
        fontFamily: "Arial",
        fontSize: "11px",
      })
      .setOrigin(0.5)
      .setInteractive(); //make clickable

    this.playerIdText.on("pointerup", () => {
      Chat.createSocket();
    });

    this.opponentsIdText = this.add
      .text(this.headerText.x, this.playerIdText.y + 14, "opponentsID", {
        fontFamily: "Arial",
        fontSize: "11px",
      })
      .setOrigin(0.5);

    this.location2 = this.physics.add.staticGroup();
    this.location2
      .create(
        this.game.config.width - 100,
        this.game.config.height - 200,
        "bomb"
      )
      .setScale(3)
      .refreshBody();

    this.player = this.physics.add.image(
      this.game.config.width / 2,
      this.game.config.height / 2,
      "star"
    );

    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(
      this.player,
      this.location2,
      this.enterLocation2Scene,
      null,
      this
    );

    this.NetworkPlayer[0] = this.add.image(
      this.game.config.width / 3,
      this.game.config.height / 4,
      "NetworkPlayer"
    );
  }

  onstreamEvent() {
    console.log("test");
    if (Chat.parsedData.user_id == "3096ef11-cde3-4a6d-bb9f-7040c9b831c0") {
      this.NetworkPlayer[0] = this.add.image(
        this.game.config.width / 3,
        this.game.config.height / 4,
        "NetworkPlayer"
      );
    }
  }

  createRemotePlayer() {
    //Nakama.connectedOpponents //list of the opponents
    //for each of the opponents, attach a png,
    for (let i = 0; i < Nakama.connectedOpponents.length; i++) {
      this.NetworkPlayer[i] = this.add.image(
        this.game.config.width / 3,
        this.game.config.height / 4,
        "NetworkPlayer"
      );
    }
    console.log(
      "Nakama.connectedOpponents.length: " + Nakama.connectedOpponents.length
    );
    console.log("Nakama.connectedOpponents: " + Nakama.connectedOpponents[0]);

    console.log("make networkplayer...");

    Nakama.createNetworkPlayers = false;
    console.log("Nakama.createNetworkPlayers: " + Nakama.createNetworkPlayers);
  } //createRemotePlayer

  enterLocation2Scene(player) {
    this.physics.pause();
    player.setTint(0xff0000);
    this.scene.start("Location2Scene");
  }

  update(time, delta) {
    // if (this.cursors.left.isDown) {
    //   this.player.setVelocityX(-160);
    //   Chat.sendChatMessage(this.player.x, this.player.y);
    //   //Chat.chat();
    //   //this.headerText.setText("setVelocityX(-160)");
    //   //Nakama.socket.sendMatchState(Nakama.matchID, 2, "", null);
    // } else if (this.cursors.right.isDown) {
    //   this.player.setVelocityX(160);
    //   //Nakama.makeMove(this.player.x, this.player.y);
    // } else if (this.cursors.up.isDown) {
    //   this.player.setVelocityY(-160);
    //   //Nakama.makeMove(this.player.x, this.player.y);
    // } else if (this.cursors.down.isDown) {
    //   this.player.setVelocityY(160);
    //   //Nakama.makeMove(this.player.x, this.player.y);
    // } else {
    //   this.player.setVelocityX(0);
    //   this.player.setVelocityY(0);
    // }

    // this.playerIdText.setText(Nakama.userID);

    // if (Nakama.gameStarted) {
    //   this.headerText.setText("Game has started");
    //   this.matchIdText.setText("matchID: " + Nakama.matchID);
    //   this.playerIdText.setText("userID: " + Nakama.userID);

    //   this.opponentsIdText.setText("opponent: " + Nakama.connectedOpponents[0]);
    // }

    // if (Nakama.createNetworkPlayers) {
    //   this.createRemotePlayer();
    //   console.log("Go createNetworkPlayers");
    //   // Nakama.createNetworkPlayers = false
    //   // console.log(Nakama.createNetworkPlayers)
    // }

    // Apply the controls to the camera each update tick of the game
    this.controls.update(delta);
  } //update
} //class
