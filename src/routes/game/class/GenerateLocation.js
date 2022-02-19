import ManageSession from "../ManageSession"
import CoordinatesTranslator from "./CoordinatesTranslator"
import HistoryTracker from "./HistoryTracker"

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
        this.internalUrl = config.internalUrl
        this.externalUrl = config.externalUrl
        this.enterButtonTween
        this.enterCircleTween
        this.size = config.size

        let width

        if (typeof this.size === "undefined") {
            width = 128
        } else {
            width = this.size
        }

        //if the location is not userHome we set the userHome to locationDestination, because that is used for HistoryTracker
        if (typeof this.userHome === "undefined") {
            this.userHome = this.locationDestination
        }

        //TODO rewrite without the container, just using sprite, containers are a bit more cpu intensive 

        //display width of the location image/ triangle/ isoBox

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

        // can't drag the location if there is another function for pointerdown
        // we set the location either clickable or dragable (because dragging is a edit function)
        if (!this.draggable) {
            this.location.setInteractive({ useHandCursor: true })
            console.log("this.location.width, this.location.height", this.location.width, this.location.height)
            // the width and height are not the same for isobox, 
            // we make the hitarea for 

            const hitAreaWidth = this.location.width
            const hitAreaheight = this.location.height
            if (hitAreaWidth != hitAreaheight) {
                //  Coordinates are relative from the top-left, so we want out hit area to be
                //  an extra 60 pixels around the texture, so -30 from the x/y and + 60 to the texture width and height

                //extend the isobox hitarea
                this.location.input.hitArea.setTo(-hitAreaWidth / 3, -hitAreaWidth / 1.3, hitAreaWidth * 1.4, hitAreaWidth * 1.5)
            } else {

            }



            console.log("this.location", this.location)
            // on home click, we let the player to see the entrance arrow above the home
            this.location.on('pointerdown', () => {
                if (!this.showing) {
                    this.initConfirm()
                    this.enterButton.setVisible(this.showing)
                    this.enterCircle.setVisible(this.showing)
                }
            })
        }

        // place the description under the location image (for devving only)
        const locationDescription = this.scene.add.text(0, width / 2 - 30, this.locationText, { fill: this.fontColor }).setOrigin(0.5, 0.5).setDepth(52)
        // location plate name
        const namePlate = this.scene.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(0 - (locationDescription.width + 14) / 2, width / 2 - 44, locationDescription.width + 14 /* text's width + 10 (to have space between border and text) */, 27, 10).setDepth(51)

        //align the location image and description
        //Phaser.Display.Align.In.TopCenter(this.location, locationDescription)

        // back button that appears 
        var enterButtonY = this.y - (width / 2) - 50
        var enterButtonTweenY = enterButtonY + 15

        // this.enterButtonHitArea = this.scene.add.image(this.x, enterButtonY, 'enterButtonHitArea').setDepth(201)
        // this.enterButtonHitArea.alpha = 0 // make the hitArea invisible

        // this.enterButtonHitArea.displayWidth = width / 1.05

        this.enterCircle = this.scene.add.circle(this.x, enterButtonY + 5, 30, 0x6666ff).setOrigin(0.5, 0.5).setVisible(false).setInteractive({ useHandCursor: true }).setDepth(500)
        // .setStrokeStyle(2, 0x000000)
        this.enterButton = this.scene.add.image(this.x, enterButtonY, this.enterButtonImage).setOrigin(0.5, 0.5).setDepth(200).setVisible(false).setDepth(500)


        this.enterButtonTween = this.scene.tweens.add({
            targets: this.enterButton,
            y: enterButtonTweenY,
            // alpha: 0.5,
            duration: 500,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true
        })

        //the container is created at the this.x and this.y
        //this.setSize(width, width)
        this.add(this.location)
        this.add(namePlate)
        this.add(locationDescription)
        //this.add(this.enterButtonHitArea)

        //changing the order in the container, changes the drawing order?
        // this.bringToTop(this.enterButtonHitArea)

        this.setSize(width, width, false)

        if (this.draggable) {
            this.setInteractive()
                .on('drag', (p, x, y) => {
                    this.setX(p.worldX)
                    this.setY(p.worldY)
                    // The enterButton is outside the container, so that it can appear above the player
                    // when dragging the container we have to move the enterButton aswell
                    this.enterButton.x = this.x
                    enterButtonY = this.y - (width / 2) - 60
                    enterButtonTweenY = enterButtonY + 90
                    this.enterButton.y = enterButtonY
                    //this.enterButtonTween.restart()
                    this.enterButtonTween.stop()
                    this.enterButtonTween.remove()
                    this.enterButtonTween = this.scene.tweens.add({
                        targets: this.enterButton,
                        y: enterButtonTweenY,
                        alpha: 0.0,
                        duration: 1000,
                        ease: 'Sine.easeInOut',
                        repeat: -1,
                        yoyo: true
                    })

                })
                .on('pointerdown', (p, x, y) => {
                    //console.log('dragging')
                    //console.log(p.worldX, p.worldY)

                })
                .on('pointerup', (p, x, y) => {
                    console.log(CoordinatesTranslator.Phaser2DToArtworldX(this.scene.worldSize.x, p.worldX), CoordinatesTranslator.Phaser2DToArtworldY(this.scene.worldSize.y, p.worldY))

                })
        }

        // this.enterButtonHitArea.on('pointerdown', () => {

        // })

        this.enterCircle.on('pointerup', () => {
            //check when entering the location if it is an URL or scene

            if (this.internalUrl) {
                this.scene.scene.pause();
                var url = window.location.href + this.internalUrl

                var s = window.open(url, '_parent');

                if (s && s.focus) {
                    s.focus();
                }
                else if (!s) {
                    window.location.href = url;
                }
            } else if (this.externalUrl) {
                this.scene.scene.pause();
                var url = this.externalUrl

                var s = window.open(url, '_parent');

                if (s && s.focus) {
                    s.focus();
                }
                else if (!s) {
                    window.location.href = url;
                }
            } else {
                console.log("GenerateLocation this.scene, this.locationDestination, this.userHome", this.scene, this.locationDestination, this.userHome)
                HistoryTracker.switchScene(this.scene, this.locationDestination, this.userHome)
            }
        })

        this.scene.physics.add.overlap(this.scene.player, this.location, this.confirmEnterLocation, null, this)

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)

        if (this.draggable) {
            this.scene.input.setDraggable(this, true)
        }
    }

    confirmEnterLocation() {
        this.initConfirm()
        this.enterButton.setVisible(true)
        this.enterCircle.setVisible(true)
        // this.enterButtonHitArea.setVisible(true)
        // this.enterButtonHitArea.setInteractive({ useHandCursor: true })
        // this.enterButtonHitArea.input.alwaysEnabled = true //this is needed for an image or sprite to be interactive also when alpha = 0 (invisible)

    }

    hideEnterButton() {
        this.showing = false
        this.enterButton.setVisible(this.showing)
        this.enterCircle.setVisible(this.showing)
        // this.enterButtonHitArea.disableInteractive() //turn off interactive off hitArea when it is not used
    }

    initConfirm() {
        if (this.showing) {

        } else {
            this.showing = true
            this.scene.time.addEvent({ delay: 2000, callback: this.hideEnterButton, callbackScope: this, loop: false })
        }
    }
}