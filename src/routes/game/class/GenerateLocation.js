import ManageSession from "../ManageSession"

export default class GenerateLocation extends Phaser.GameObjects.Container {

    constructor(config) {

        super(config.scene)

        // this.scene = scene
        this.scene = config.scene
        this.x = config.x
        this.y = config.y
        this.locationImage = config.locationImage
        this.backButtonImage = config.backButtonImage
        this.locationText = config.locationText
        this.fontColor = config.fontColor
        this.locationDestination = config.locationDestination
        this.backButton
        this.showing = false
        this.type = config.type
        this.color1 = config.color1
        this.color2 = config.color2
        this.color3 = config.color3
        this.location

        //display width of the location image/ triangle/ isoBox
        const width = 128

        // the content of the container is created at 0,0
        // then the container is set at a position

        // image for the location, physical body for collision with the player
        //setOrigin(0.5) in the middle
        if (this.type === "image") {
            console.log("image!")
            this.scene.textures.exists(this.locationImage)
            this.location = this.scene.physics.add.image(0, 0, this.locationImage).setOrigin(0.5, 0.5).setDepth(50)

            //set the location to a fixed size, also scales the physics body
            this.location.displayWidth = width
            this.location.scaleY = this.location.scaleX
        }

        if (this.type === "isoTriangle") {
            console.log("isoTriangle!")
            //this.location = this.scene.add.isotriangle(0, width / 4, width, width, false, 0x8dcb0e, 0x3f8403, 0x63a505)
            this.location = this.scene.add.isotriangle(0, width / 4, width, width, false, this.color1, this.color2, this.color3)
            this.scene.physics.add.existing(this.location)
            this.location.body.setSize(this.location.width, this.location.height)
            this.location.body.setOffset(0, -(this.location.height / 4))
        }

        if (this.type === "isoBox") {
            console.log("isoBox!")
            // this.location = this.scene.add.isobox(0, 0, width, width / 1.4, 0xffe31f, 0xf2a022, 0xf8d80b)
            this.location = this.scene.add.isobox(0, 0, width, width / 1.4, this.color1, this.color2, this.color3)
            this.scene.physics.add.existing(this.location)
            this.location.body.setSize(this.location.width, this.location.height * 1.6)
            this.location.body.setOffset(0, -(this.location.height / 1.4))
        }

        //place the description under the location image (for devving only)
        const locationDescription = this.scene.add.text(0, width / 2 + 10, this.locationText, { fill: this.fontColor }).setOrigin(0.5, 0.5).setDepth(51)

        //align the location image and description
        //Phaser.Display.Align.In.TopCenter(this.location, locationDescription)

        // back button that appears 
        this.backButton = this.scene.add.image(0, -(width / 2) - 20,
            this.backButtonImage).setInteractive().setVisible(false).setOrigin(0.5, 0.5).setDepth(200)



        //the container is created at the this.x and this.y
        this.add(this.location)
        this.add(locationDescription)
        this.add(this.backButton)

        this.backButton.on('pointerdown', () => {

        })

        this.backButton.on('pointerup', () => {
            // on entering another location we want to keep a record for "back button"
            ManageSession.previousLocation = this.scene.key;

            this.scene.physics.pause()
            this.scene.player.setTint(0xff0000)

            //player has to explicitly leave the stream it was in!
            console.log("leave, this.location")
            console.log(this.scene.location)
            ManageSession.socket.rpc("leave", this.scene.location)

            this.scene.player.location = this.locationDestination
            console.log("this.player.location:")
            console.log(this.locationDestination)

            this.scene.time.addEvent({ delay: 500, callback: this.switchScenes, callbackScope: this, loop: false })
        })

        this.scene.physics.add.overlap(this.scene.player, this.location, this.confirmEnterLocation, null, this)

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
    }

    confirmEnterLocation(player, location) {
        this.confirmConfirm()
        this.backButton.setVisible(true)
    }

    hideEnterButton() {
        this.showing = false
        this.backButton.setVisible(this.showing)
    }

    confirmConfirm() {
        if (this.showing) {

        } else {
            this.showing = true
            this.scene.time.addEvent({ delay: 2000, callback: this.hideEnterButton, callbackScope: this, loop: false })
        }
    }

    switchScenes() {
        ManageSession.location = this.locationDestination
        ManageSession.createPlayer = true
        ManageSession.getStreamUsers("join", this.locationDestination)
        this.scene.scene.stop(this.scene.scene.key)
        this.scene.scene.start(this.locationDestination)
    }
}