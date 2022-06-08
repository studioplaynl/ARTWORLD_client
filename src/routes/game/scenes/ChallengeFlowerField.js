import ManageSession from "../ManageSession"
import { listObjects, convertImage, getAccount } from "../../../api.js"

import PlayerDefault from "../class/PlayerDefault"
import PlayerDefaultShadow from "../class/PlayerDefaultShadow"
import Player from "../class/Player.js"
import Preloader from "../class/Preloader.js"
import BouncingBird from "../class/BouncingBird.js"
import GraffitiWall from "../class/GraffitiWall"
import Background from "../class/Background.js"
import CoordinatesTranslator from "../class/CoordinatesTranslator.js"
import GenerateLocation from "../class/GenerateLocation.js"
import HistoryTracker from "../class/HistoryTracker.js"
import Move from "../class/Move.js"
import ServerCall from "../class/ServerCall"
import Exhibition from "../class/Exhibition"
import { CurrentApp } from "../../../session"

export default class ChallengeFlowerField extends Phaser.Scene {

    constructor() {
        super("ChallengeFlowerField");

        this.worldSize = new Phaser.Math.Vector2(3000, 2000)

        this.debug = false

        this.gameStarted = false
        this.phaser = this
        // this.playerPos
        this.onlinePlayers = []

        this.newOnlinePlayers = []

        this.currentOnlinePlayer
        this.avatarName = []
        this.tempAvatarName = ""
        this.loadedAvatars = []

        this.player
        this.playerShadow
        this.playerAvatarPlaceholder = "avatar1"
        this.playerMovingKey = "moving"
        this.playerStopKey = "stop"
        this.playerAvatarKey = ""
        this.createdPlayer = false

        this.artDisplaySize = 64
        this.artArray = []

        //testing
        this.resolveLoadErrorCache = []

        this.playerContainer

        this.homes = []
        this.homesRepreseneted = []

        this.offlineOnlineUsers

        this.location = "ChallengeFlowerField"

        //.......................REX UI ............
        this.COLOR_PRIMARY = 0xff5733
        this.COLOR_LIGHT = 0xffffff
        this.COLOR_DARK = 0x000000
        this.data
        //....................... end REX UI ......

        this.cursors
        this.pointer
        this.isClicking = false
        this.cursorKeyIsDown = false
        this.swipeDirection = "down"
        this.swipeAmount = new Phaser.Math.Vector2(0, 0)
        this.graffitiDrawing = false

        //pointer location example
        // this.source // = player
        this.target = new Phaser.Math.Vector2()
        this.distance
        this.distanceTolerance = 9

        //shadow
        this.playerShadowOffset = -8
        this.playerIsMovingByClicking = false

        this.currentZoom

        //itemsbar

        // size for the artWorks
        this.artPreviewSize = 128

        this.artUrl = []
        this.userArtServerList = []
        this.progress = []

        // pop-up buttons of the user's avatar
        this.isPopUpButtonsDisplayed
        this.playerContainer
        this.selectedPlayerID

        this.homeButtonCircle
        this.homeButtonImage
        this.heartButtonCircle
        this.heartButtonImage

        this.scrollablePanel

        this.progress = []
    }

    async preload() {
        Preloader.Loading(this) //.... PRELOADER VISUALISER
    }

    async create() {
        //!
        //copy worldSize over to ManageSession, so that positionTranslation can be done there
        ManageSession.worldSize = this.worldSize
        //!

        // collection: "home"
        // create_time: "2022-01-19T16:31:43Z"
        // key: "Amsterdam"
        // permission_read: 2
        // permission_write: 1
        // update_time: "2022-01-19T16:32:27Z"
        // user_id: "4c0003f0-3e3f-4b49-8aad-10db98f2d3dc"
        // value:
        // url: "home/4c0003f0-3e3f-4b49-8aad-10db98f2d3dc/3_current.png"
        // username: "user88"
        // version: "0579e989a16f3e228a10d49d13dc3da6"
        //!
        //.......  LOAD PLAYER AVATAR ..........................................................................
        ManageSession.createPlayer = true
        //....... end LOAD PLAYER AVATAR .......................................................................

        // the order of creation is the order of drawing: first = bottom ...............................

        Background.repeatingDots({
            scene: this,
            gridOffset: 80,
            dotWidth: 2,
            dotColor: 0x7300ed,
            backgroundColor: 0xffffff,
        })

        // make a repeating set of rectangles around the artworld canvas
        const middleCoordinates = new Phaser.Math.Vector2(CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0))
        this.borderRectArray = []

        for (let i = 0; i < 3; i++) {

            this.borderRectArray[i] = this.add.rectangle(0, 0, this.worldSize.x + (80 * i), this.worldSize.y + (80 * i))
            this.borderRectArray[i].setStrokeStyle(4 + i, 0x7300ed)

            this.borderRectArray[i].x = middleCoordinates.x
            this.borderRectArray[i].y = middleCoordinates.y
        }

        this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);

        //create border rects
        // alpha set to 0, to hide them
        // const borderBoxWidth = 40
        // this.borderBoxNorth = this.add.rectangle(this.worldSize.x / 2, - (borderBoxWidth / 2), this.worldSize.x, borderBoxWidth, 0xff0000, 0)
        // this.physics.add.existing(this.borderBoxNorth)

        // this.borderBoxSouth = this.add.rectangle(this.worldSize.x / 2, (this.worldSize.y) + (borderBoxWidth / 2), this.worldSize.x, borderBoxWidth, 0xff0000, 0)
        // this.physics.add.existing(this.borderBoxSouth)

        // this.borderBoxEast = this.add.rectangle(this.worldSize.x + (borderBoxWidth / 2), this.worldSize.y / 2, borderBoxWidth, this.worldSize.x, 0xffff00, 0)
        // this.physics.add.existing(this.borderBoxEast)

        // this.borderBoxWest = this.add.rectangle(0 - (borderBoxWidth / 2), this.worldSize.y / 2, borderBoxWidth, this.worldSize.x, 0xff00ff, 0)
        // this.physics.add.existing(this.borderBoxWest)

        //!

        let flowerScaleFactor = 0.4
        let artworkSize = 512
        // draw 10 layers, biggest 512 pix ,smallest 52pix
        // we begin at the bottom so worldY
        let amountOfOverlapX = 0.5
        let amountOfOverlapY = 0.8
        let amountOfFlowers = Math.ceil(this.worldSize.x / (artworkSize * amountOfOverlapX))
        console.log("amountOfFlowers", amountOfFlowers)
        let flowerArray = []
        let flowerTweenArray = []
        let flowerObject
        let flowerTween
        let flowerScale
        let flowerRotateAmount
        let flowerTweenTime


        flowerScaleFactor = 0.2
        artworkSize = 512 * flowerScaleFactor
        amountOfOverlapX = flowerScaleFactor * 2
        amountOfOverlapY = 0.8
        amountOfFlowers = Math.ceil(this.worldSize.x / (artworkSize * amountOfOverlapX))
        for (let i = 0; i < amountOfFlowers; i++) {
            flowerScale = Phaser.Math.FloatBetween(flowerScaleFactor - (flowerScaleFactor / 12), flowerScaleFactor + (flowerScaleFactor / 12))
            //scale around 0.5 (0.4 - 0.6)
            flowerObject = this.add.image(i * (artworkSize * amountOfOverlapX), this.worldSize.y - (artworkSize * amountOfOverlapY) - (((artworkSize * 1.3) / flowerScaleFactor)), "flower").setScale(flowerScale).setOrigin(0.5, 1)
            flowerRotateAmount = Phaser.Math.Between(8, 18)
            flowerTweenTime = Phaser.Math.Between(1000, 1100)
            flowerTween = this.tweens.add({
                targets: flowerObject,
                angle: flowerRotateAmount,
                duration: flowerTweenTime,
                paused: false,
                yoyo: true,
                repeat: -1
            })
            flowerArray.push(flowerObject)
            flowerTweenArray.push(flowerTween)
        }
        console.log("flowerArray.length", flowerArray.length)


        flowerScaleFactor = 0.3
        artworkSize = 512 * flowerScaleFactor
        amountOfOverlapX = flowerScaleFactor * 2
        amountOfOverlapY = 0.8
        amountOfFlowers = Math.ceil(this.worldSize.x / (artworkSize * amountOfOverlapX))
        for (let i = 0; i < amountOfFlowers; i++) {
            flowerScale = Phaser.Math.FloatBetween(flowerScaleFactor - (flowerScaleFactor / 12), flowerScaleFactor + (flowerScaleFactor / 12))
            //scale around 0.5 (0.4 - 0.6)
            flowerObject = this.add.image(i * (artworkSize * amountOfOverlapX), this.worldSize.y - (artworkSize * amountOfOverlapY) - (artworkSize / flowerScaleFactor), "flower").setScale(flowerScale).setOrigin(0.5, 1)
            flowerRotateAmount = Phaser.Math.Between(8, 18)
            flowerTweenTime = Phaser.Math.Between(1000, 1100)
            flowerTween = this.tweens.add({
                targets: flowerObject,
                angle: flowerRotateAmount,
                duration: flowerTweenTime,
                paused: false,
                yoyo: true,
                repeat: -1
            })
            flowerArray.push(flowerObject)
            flowerTweenArray.push(flowerTween)
        }
        console.log("flowerArray.length", flowerArray.length)

        flowerScaleFactor = 0.5
        artworkSize = 512 * flowerScaleFactor
        amountOfOverlapX = 0.5
        amountOfOverlapY = 0.8
        amountOfFlowers = Math.ceil(this.worldSize.x / (artworkSize * amountOfOverlapX))
        for (let i = 0; i < amountOfFlowers; i++) {
            flowerScale = Phaser.Math.FloatBetween(flowerScaleFactor - (flowerScaleFactor / 12), flowerScaleFactor + (flowerScaleFactor / 12))
            //scale around 0.5 (0.4 - 0.6)
            flowerObject = this.add.image(i * (artworkSize * amountOfOverlapX), this.worldSize.y - (artworkSize * amountOfOverlapY) - (artworkSize), "flower").setScale(flowerScale).setOrigin(0.5, 1)
            flowerRotateAmount = Phaser.Math.Between(8, 18)
            flowerTweenTime = Phaser.Math.Between(1000, 1100)
            flowerTween = this.tweens.add({
                targets: flowerObject,
                angle: flowerRotateAmount,
                duration: flowerTweenTime,
                paused: false,
                yoyo: true,
                repeat: -1
            })
            flowerArray.push(flowerObject)
            flowerTweenArray.push(flowerTween)

        }
        console.log("flowerArray.length", flowerArray.length)

        flowerScaleFactor = 1
        artworkSize = 512
        amountOfOverlapX = 0.5
        amountOfOverlapY = 0.5
        amountOfFlowers = Math.ceil(this.worldSize.x / (artworkSize * amountOfOverlapX))

        for (let i = 0; i < amountOfFlowers; i++) {
            flowerScale = Phaser.Math.FloatBetween(flowerScaleFactor - (flowerScaleFactor / 12), flowerScaleFactor + (flowerScaleFactor / 12))
            flowerObject = this.add.image(i * (artworkSize * amountOfOverlapX), this.worldSize.y - (artworkSize * amountOfOverlapY) - (- artworkSize / 2), "flower").setScale(flowerScale).setOrigin(0.5, 1)
            flowerRotateAmount = Phaser.Math.Between(8, 18)
            flowerTweenTime = Phaser.Math.Between(1000, 1100)
            flowerTween = this.tweens.add({
                targets: flowerObject,
                angle: flowerRotateAmount,
                duration: flowerTweenTime,
                paused: false,
                yoyo: true,
                repeat: -1
            })
            flowerArray.push(flowerObject)
            flowerTweenArray.push(flowerTween)
            console.log("i * (artworkSize * amountOfOverlapX)", i * (artworkSize * amountOfOverlapX))
        }
        console.log("flowerArray.length", flowerArray.length)

        //!
        this.touchBackgroundCheck = this.add.rectangle(0, 0, this.worldSize.x, this.worldSize.y, 0xfff000)
            .setInteractive() //{ useHandCursor: true }
            //.on('pointerup', () => console.log('touched background'))
            .on('pointerdown', () => ManageSession.playerMove = true)
            .setDepth(219)
            .setOrigin(0)
            .setVisible(false)

        this.touchBackgroundCheck.input.alwaysEnabled = true //this is needed for an image or sprite to be interactive also when alpha = 0 (invisible)
        //!
        // about drag an drop multiple  objects efficiently https://www.youtube.com/watch?v=t56DvozbZX4&ab_channel=WClarkson
        // End Background .........................................................................................

        //.......  PLAYER ....................................................................................
        //* create default player and playerShadow
        //* create player in center with artworldCoordinates
        this.player = new PlayerDefault(this, CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, ManageSession.playerPosX), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, ManageSession.playerPosY), this.playerAvatarPlaceholder).setDepth(201)
        //Player.createPlayerItemsBar(this)
        this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder }).setDepth(200)
        // for back button, has to be done after player is created for the history tracking!
        HistoryTracker.pushLocation(this)

        //....... PLAYER VS WORLD .............................................................................
        this.gameCam = this.cameras.main //.setBackgroundColor(0xFFFFFF);
        this.gameCam.zoom = 1
        this.gameCam.startFollow(this.player)
        this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y)
        //https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
        //......... end PLAYER VS WORLD .......................................................................

        //! needed for handling object dragging
        this.input.on('dragstart', function (pointer, gameObject) {

        }, this)

        this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX
            gameObject.y = dragY

            if (gameObject.name == "handle") {
                gameObject.data.get('vector').set(dragX, dragY) //get the vector data for curve handle objects
            }

        }, this)

        this.input.on('dragend', function (pointer, gameObject) {
            let worldX = Math.round(CoordinatesTranslator.Phaser2DToArtworldX(this.worldSize.x, gameObject.x))
            let worldY = Math.round(CoordinatesTranslator.Phaser2DToArtworldY(this.worldSize.y, gameObject.y))


            //store the original scale when selecting the gameObject for the first time
            if (ManageSession.selectedGameObject != gameObject) {
                ManageSession.selectedGameObject = gameObject
                ManageSession.selectedGameObject_startScale = gameObject.scale
                ManageSession.selectedGameObject_startPosition.x = gameObject.x
                ManageSession.selectedGameObject_startPosition.y = gameObject.y
                console.log("editMode info startScale:", ManageSession.selectedGameObject_startScale)
            }
            //ManageSession.selectedGameObject = gameObject

            console.log("editMode info posX posY: ", worldX, worldY, "scale:", ManageSession.selectedGameObject.scale, "width*scale:", Math.round(ManageSession.selectedGameObject.width * ManageSession.selectedGameObject.scale), "height*scale:", Math.round(ManageSession.selectedGameObject.height * ManageSession.selectedGameObject.scale), "name:", ManageSession.selectedGameObject.name)
        }, this)
        //!

        //!
        Player.loadPlayerAvatar(this)
        //!



    } //end create

    generateLocations() {
        //we set draggable on restart scene with a global flag

        let locationVector = new Phaser.Math.Vector2(-1215, -589)
        locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
            this.worldSize,
            locationVector
        )

        //  if ( this.location1 != null ) this.location1.destroy()

        this.location1 = new GenerateLocation({
            scene: this,
            type: "isoBox",
            draggable: ManageSession.gameEditMode,
            x: locationVector.x,
            y: locationVector.y,
            locationDestination: "Location1",
            locationImage: "museum",
            enterButtonImage: "enter_button",
            locationText: "Location 1",
            referenceName: "Location1",
            fontColor: 0x8dcb0e,
            color1: 0xffe31f,
            color2: 0xf2a022,
            color3: 0xf8d80b,
        })


        //*set the particle first on 0,0 so they are below the mario_star
        //*later move them relative to the mario_star
        var particles = this.add.particles('music_quarter_note').setDepth(139)

        var music_emitter = particles.createEmitter({
            x: 0,
            y: 0,
            lifespan: { min: 2000, max: 8000 },
            speed: { min: 80, max: 120 },
            angle: { min: 270, max: 360 },
            gravityY: -50,
            gravityX: 50,
            scale: { start: 1, end: 0 },
            quantity: 1,
            frequency: 1600,
        })

        locationVector = new Phaser.Math.Vector2(-792, -1138)
        locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
            this.worldSize,
            locationVector
        )

        this.mario_star = new GenerateLocation({
            scene: this,
            type: "image",
            size: 200,
            draggable: ManageSession.gameEditMode,
            x: locationVector.x,
            y: locationVector.y,
            internalUrl: "mariosound",
            locationImage: "mario_star",
            enterButtonImage: "enter_button",
            locationText: "Mario Sound",
            referenceName: "MarioSound",
            fontColor: 0x8dcb0e,
            color1: 0x8dcb0e,
            color2: 0x3f8403,
            color3: 0x63a505,
        })
        this.mario_star.setDepth(140)


        music_emitter.setPosition(this.mario_star.x + 15, this.mario_star.y - 20)

        locationVector = new Phaser.Math.Vector2(-2125, 1017)
        locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
            this.worldSize,
            locationVector
        )

        // this.pencil = this.add.image(locationVector.x, locationVector.y, "pencil")
        // this.pencil.rotation = 0.12
        // this.pencil.setInteractive()
        // this.pencil.on('pointerup', () => CurrentApp.set("drawing"))

        this.pencil = new GenerateLocation({
            scene: this,
            type: "image",

            draggable: ManageSession.gameEditMode,
            x: locationVector.x,
            y: locationVector.y,
            appUrl: "drawing",
            locationImage: "pencil",
            enterButtonImage: "enter_button",
            locationText: "drawingApp",
            referenceName: "drawingApp",
            fontColor: 0x8dcb0e,
            color1: 0x8dcb0e,
            color2: 0x3f8403,
            color3: 0x63a505,
        })
        this.pencil.rotation = 0.12

        locationVector = new Phaser.Math.Vector2(-1555, 809)
        locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
            this.worldSize,
            locationVector
        )

        this.animalGardenChallenge = new GenerateLocation({
            scene: this,
            type: "image",

            draggable: ManageSession.gameEditMode,
            x: locationVector.x,
            y: locationVector.y,
            locationDestination: "AnimalGardenChallenge",
            locationImage: "dinoA",
            enterButtonImage: "enter_button",
            locationText: "animal Garden",
            referenceName: "animalGardenChallenge",
            fontColor: 0x8dcb0e,
            color1: 0x8dcb0e,
            color2: 0x3f8403,
            color3: 0x63a505,
        })

    }

    update(time, delta) {

        // zoom in and out of game
        this.gameCam.zoom = ManageSession.currentZoom

        //don't move the player with clicking and swiping in edit mode
        if (!ManageSession.gameEditMode) {
            //...... ONLINE PLAYERS ................................................
            Player.parseNewOnlinePlayerArray(this)
            //........... PLAYER SHADOW .............................................................................
            // the shadow follows the player with an offset
            this.playerShadow.x = this.player.x + this.playerShadowOffset
            this.playerShadow.y = this.player.y + this.playerShadowOffset
            //........... end PLAYER SHADOW .........................................................................

            //....... stopping PLAYER ......................................................................................
            Move.checkIfPlayerReachedMoveGoal(this) // to stop the player when it reached its destination
            //....... end stopping PLAYER .................................................................................

            // to detect if the player is clicking/tapping on one place or swiping
            if (this.input.activePointer.downX != this.input.activePointer.upX) {
                Move.moveBySwiping(this)
            } else {
                Move.moveByTapping(this)
            }
        } else {
            //when in edit mode
            //this.updateCurveGraphics()
        }

    } //update

    updateCurveGraphics() {
        this.curveGraphics.clear()
        this.curveGraphics.lineStyle(60, 0xffff00, 1)
        this.curve.draw(this.curveGraphics, 64)
    }

} //class
