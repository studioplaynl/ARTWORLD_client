import ManageSession from "../ManageSession"

export default class GenerateLocation extends Phaser.GameObjects.Container {

    constructor(config) {

        super(config.scene, config.x, config.y)

        // this.scene = scene
        this.scene = config.scene
        this.x = config.x
        this.y = config.y
        this.locationImage = config.locationImage
        this.enterButtonImage = config.enterButtonImage
        this.locationText = config.locationText
        this.fontColor = config.fontColor
        this.locationDestination = config.locationDestination
        this.enterButton
        this.showing = false
        this.type = config.type
        this.color1 = config.color1
        this.color2 = config.color2
        this.color3 = config.color3
        this.draggable = config.draggable
        this.userHome = config.userHome
        this.location

        //TODO don't make a location in a container, the depth order seems to be shared across the contianer, so we can't make the enter button appear above the player, and the location below the player
        //TODO rewrite with out the container, just using sprite, containers are a bit more cpu intensive

        //display width of the location image/ triangle/ isoBox
        const width = 128

        // the content of the container is created at 0,0
        // then the container is set at a position

        // image for the location, physical body for collision with the player
        //setOrigin(0.5) in the middle
        if (this.type === "image") {
            //console.log("image!")
            this.scene.textures.exists(this.locationImage)
            this.location = this.scene.physics.add.image(0, 0, this.locationImage).setOrigin(0.5, 0.5).setDepth(50)

            //set the location to a fixed size, also scales the physics body
            this.location.displayWidth = width
            this.location.scaleY = this.location.scaleX
        }

        if (this.type === "isoTriangle") {
            //console.log("isoTriangle!")
            //this.location = this.scene.add.isotriangle(0, width / 4, width, width, false, 0x8dcb0e, 0x3f8403, 0x63a505)
            this.location = this.scene.add.isotriangle(0, width / 4, width, width, false, this.color1, this.color2, this.color3)
            this.scene.physics.add.existing(this.location)
            this.location.body.setSize(this.location.width, this.location.height)
            this.location.body.setOffset(0, -(this.location.height / 4))
        }

        if (this.type === "isoBox") {
            //console.log("isoBox!")
            // this.location = this.scene.add.isobox(0, 0, width, width / 1.4, 0xffe31f, 0xf2a022, 0xf8d80b)
            this.location = this.scene.add.isobox(0, 0, width, width / 1.4, this.color1, this.color2, this.color3)
            this.scene.physics.add.existing(this.location)
            this.location.body.setSize(this.location.width, this.location.height * 1.6)
            this.location.body.setOffset(0, -(this.location.height / 1.4))
        }

        this.location.setInteractive()

        this.location.on('pointerdown', () => {
            console.log("location clicked")
        })

        //place the description under the location image (for devving only)
        const locationDescription = this.scene.add.text(0, width / 2 - 30, this.locationText, { fill: this.fontColor }).setOrigin(0.5, 0.5).setDepth(51)

        //align the location image and description
        //Phaser.Display.Align.In.TopCenter(this.location, locationDescription)

        // back button that appears 
        this.enterButton = this.scene.add.image(0, -(width / 2) - 60,
            this.enterButtonImage).setInteractive().setVisible(false).setOrigin(0.5, 0.5).setDepth(200)

        this.scene.tweens.add({
            targets: this.enterButton,
            y: -90,
            alpha: 0.0,
            duration: 1000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true
        })

        //the container is created at the this.x and this.y
        //this.setSize(width, width)
        this.add(this.location)
        this.add(locationDescription)
        this.add(this.enterButton)

        this.setSize(width, width, false)

        if (this.draggable) {
            this.setInteractive()
                .on('drag', (p, x, y) => {
                    this.setX(p.worldX)
                    this.setY(p.worldY)
                })
                .on('pointerdown', (p, x, y) => {
                    // this._dragX = x
                    // this._dragY = y
                })
        }

        this.enterButton.on('pointerdown', () => {

        })

        this.enterButton.on('pointerup', () => {
            // on entering another location we want to keep a record for "back button"
            ManageSession.previousLocation = this.scene.key;

            this.scene.physics.pause()
            this.scene.player.setTint(0xff0000)

            //player has to explicitly leave the stream it was in!
            console.log("leave: ", this.scene.location)
            
            ManageSession.socket.rpc("leave", this.scene.location)

            this.scene.player.location = this.locationDestination
            console.log("this.player.location: ", this.locationDestination)

            this.scene.time.addEvent({ delay: 500, callback: this.switchScenes, callbackScope: this, loop: false })
        })

        this.scene.physics.add.overlap(this.scene.player, this.location, this.confirmEnterLocation, null, this)

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)

        if (this.draggable) {
            this.scene.input.setDraggable(this, true)
        }
    }



    confirmEnterLocation(player, location) {
        this.confirmConfirm()
        this.enterButton.setVisible(true)
    }

    hideEnterButton() {
        this.showing = false
        this.enterButton.setVisible(this.showing)
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
        //check if it is a userHome, pass data to the userHome (user_id)
        if (this.userHome) {
            this.scene.scene.start(this.locationDestination, { user_id: this.userHome })
            console.log("UserHome defined: ", this.userHome)
        } else {
            this.scene.scene.start(this.locationDestination)
        }
    }
}