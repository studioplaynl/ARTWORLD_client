import Preloader from '../class/Preloader.js'


export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
        this.loadingDone = false

        //sizes for the artWorks
        this.artIconSize = 64
        this.artPreviewSize = 128
        this.artDisplaySize = 512
        this.artFullSize
        this.artOffsetBetween = 20
    }

    preload() {
        //.... PRELOADER VISUALISER ...............................................................................................
        Preloader.Loading(this)
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
        this.load.image("arrow_down_32px", "./assets/ui/arrow-down-32px.png")

        this.load.image('museum', './assets/museum.png');
        this.load.image("ball", './assets/ball_grey.png')
        this.load.image('home', './assets/popup/home.png')
        this.load.image('heart', './assets/popup/heart.png')
        this.load.image('enter_home', './assets/popup/enter_home.png')
        this.load.image('save_home', './assets/popup/save_home.png')
        this.load.image('address_book', './assets/popup/address_book.png')
        this.load.image('friend', './assets/popup/friend.png')

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

        //artworld elements
        this.load.svg('sunglass_stripes', 'assets/svg/sunglass_stripes.svg')
        this.load.svg('photo_camera', 'assets/svg/photo_camera.svg', { scale: 2.4 })

        this.load.svg('bitmap_heart', 'assets/svg/mario_heart.svg')
        // this.load.svg('mario_pipe', 'assets/svg/mario_pipe.svg')
        this.load.svg('mario_star', 'assets/svg/mario_star.svg')

        this.load.svg('music_quarter_note', 'assets/svg/music_note_quarter_note.svg')

        //create a hitArea for locations, as an image with key 'enterButtonHitArea', 128x128pix
        this.createHitAreaLocations()

        //create a generic artFrame for later use wit iage key "artFrame_512"
        this.createArtFrame('512')
        this.createArtFrame('128')
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

    createHitAreaLocations() {
        //create a hitArea for locations, as an image with key 'enterButtonHitArea', 128x128pix
        const width = 128
        let enterButtonHitArea = this.add.rectangle(width / 2, width / 2, width, width, 0x6666ff).setInteractive({ useHandCursor: true })
        // .setInteractive()

        let rt = this.add.renderTexture(0, 0, width, width);
        rt.draw(enterButtonHitArea)
        rt.saveTexture('enterButtonHitArea')
        enterButtonHitArea.destroy()
        rt.destroy()
    }

    createArtFrame(postFix) {
        const frameBorderSize = 10
        const frame = this.add.graphics()
        // create a black square size of art + 20pix
        frame.fillStyle(0x000000)
        frame.fillRect(0, 0, this.artDisplaySize + (frameBorderSize * 2), this.artDisplaySize + (frameBorderSize * 2)).setVisible(false)
        frame.fillStyle(0xffffff)
        frame.fillRect(frameBorderSize, frameBorderSize, this.artDisplaySize, this.artDisplaySize).setVisible(false)

        //create renderTexture to place the dot on
        let artFrameRendertexture = this.add.renderTexture(0, 0, this.artDisplaySize + (frameBorderSize * 2), this.artDisplaySize + (frameBorderSize * 2)).setVisible(false)

        //draw the dot on the renderTexture
        artFrameRendertexture.draw(frame)

        //save the rendertexture with a key ('dot'), basically making an image out of it
        artFrameRendertexture.saveTexture('artFrame_' + postFix)
        // this.add.image(0, 0, 'artFrame_512').setVisible(false) // .setOrigin(0)

        frame.destroy()
        artFrameRendertexture.destroy()
    }

    update(time, delta) {
        if (this.loadingDone) this.scene.start("MainMenu");
    } // end update
}