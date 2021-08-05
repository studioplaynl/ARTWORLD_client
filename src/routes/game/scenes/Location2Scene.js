import CONFIG from "../config";
// import Nakama from "../nakama"
import Phaser from "phaser";

export default class Location2Scene extends Phaser.Scene {
  constructor() {
    super("Location2Scene");
    this.headerText;
    this.phaser = this;
  }

  preload() {
    this.load.image("paper", "assets/paper.jpg");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
  }

  create() {
    this.add
      .image(this.game.config.width / 2, this.game.config.height / 2, "paper")
      .setScale(3.2);

    this.headerText = this.add
      .text(CONFIG.WIDTH / 2, 40, "Location 2", {
        fontFamily: "Arial",
        fontSize: "36px",
      })
      .setOrigin(0.5);

    this.location1 = this.physics.add.staticGroup();
    this.location1
      .create(
        this.game.config.width - 100,
        this.game.config.height - 200,
        "star"
      )
      .setScale(2)
      .refreshBody();

    this.player = this.physics.add.image(
      this.game.config.width / 2,
      this.game.config.height / 2,
      "bomb"
    ).setScale(2)


    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(
      this.player,
      this.location1,
      this.enterInGameScene,
      null,
      this
    );

    this.cursors = this.input.keyboard.createCursorKeys();
    //console.log("keyboard started")
  }

  enterInGameScene(player) {
    this.physics.pause();
    player.setTint(0xff0000);
    this.scene.start("InGame");
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      //this.headerText.setText("setVelocityX(-160)");
      //player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);

      //player.anims.play('right', true);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);

      //player.anims.play('right', true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);

      //player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);

      //player.anims.play('turn');
    }
  } //update
} //class

// export default LocationSomething
