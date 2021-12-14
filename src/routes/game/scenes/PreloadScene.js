import Preloader from '../Preloader.js'


export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
        this.loadingDone = false
    }

    preload() {
        //.... PRELOADER VISUALISER ...............................................................................................
        Preloader.loading(this)
        //.... end PRELOADER VISUALISER ...............................................................................................

        //artworld logo
        this.load.image("artworld", "assets/artworld.png")
        //general UI assets
        this.load.image("ui_magnifier_minus", "assets/ui/circle_minus.png")
        this.load.image("ui_magnifier_plus", "assets/ui/circle_plus.png")
        this.load.image("ui_eye", "assets/ui/eye.png")
        this.load.image("onlinePlayer", "./assets/pieceYellow_border05.png")
        this.load.image("back_button", "./assets/ui/back_button.png")
        this.load.image("enter_button", "./assets/ui/enter_icon_round64x64.png")

        this.load.image('museum', 'assets/museum.png');
        this.load.image("ball", "./assets/ball_grey.png")
        
        this.load.spritesheet(
            "avatar1",
            "./assets/spritesheets/cloud_breathing.png",
            { frameWidth: 68, frameHeight: 68 }
        )

        //background for mainMenu
        this.load.image("background4", "./assets/art_styles/repetition/3fb6da9378545.560cd556c9413.jpg")

        // rex ui video player
        this.load.image('play', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/play.png');
        this.load.image('pause', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/pause.png');
        this.load.video('test', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/video/test.mp4', 'canplaythrough', true, true);
        //................ end rex ui video player
    }

    async create() {
        this.playerAvatarPlaceholder = "avatar1";

        this.playerMovingKey = "moving"
        this.playerStopKey = "stop"
        
        this.anims.create({
            key: this.playerMovingKey,
            frames: this.anims.generateFrameNumbers(this.playerAvatarPlaceholder, { start: 0, end: 8 }),
            frameRate: 20,
            repeat: -1,
          })
      
          this.anims.create({
            key: this.playerStopKey,
            frames: this.anims.generateFrameNumbers(this.playerAvatarPlaceholder, { start: 4, end: 4 }),
          })
    } //create


    update(time, delta) {
        if (this.loadingDone) this.scene.start("MainMenu");
    } // end update
}