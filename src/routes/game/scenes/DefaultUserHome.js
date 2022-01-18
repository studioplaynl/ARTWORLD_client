import { CONFIG } from "../config.js";
import ManageSession from "../ManageSession"
import { listObjects, listImages, convertImage } from '../../../api.js'

import PlayerDefault from '../class/PlayerDefault'
import PlayerDefaultShadow from '../class/PlayerDefaultShadow'
import Player from '../class/Player.js'
import Preloader from '../class/Preloader.js'
import BouncingBird from "../class/BouncingBird.js"
import Background from "../class/Background.js"
import DebugFuntions from "../class/DebugFuntions.js"
import CoordinatesTranslator from "../class/CoordinatesTranslator.js"
import GenerateLocation from "../class/GenerateLocation.js"
import HistoryTracker from "../class/HistoryTracker.js";
import ArtworkList from "../class/ArtworkList.js"
import { element } from "svelte/internal";

export default class DefaultUserHome extends Phaser.Scene {

    constructor() {
        super("DefaultUserHome");

        this.worldSize = new Phaser.Math.Vector2(2000, 1000)

        this.debug = false

        this.gameStarted = false
        this.phaser = this

        this.onlinePlayers = []
        this.newOnlinePlayers = []

        this.currentOnlinePlayer
        this.avatarName = []
        this.tempAvatarName = ""
        this.loadedAvatars = []

        this.player
        this.playerShadow
        this.playerContainer
        this.playerAvatarPlaceholder = "avatar1"
        this.playerMovingKey = "moving"
        this.playerStopKey = "stop"
        this.playerAvatarKey = ""
        this.createdPlayer = false

        this.homes = []
        this.homesRepreseneted = []
        this.homesGenerate = false

        this.allUserArt = []
        this.userArtServerList = []
        this.userArtDisplayList = []
        this.artUrl = []

        // track for progress and completion of artworks
        this.progress = []



        //sizes for the artWorks
        this.artIconSize = 64
        this.artPreviewSize = 128
        this.artDisplaySize = 512
        this.artFullSize
        this.artOffsetBetween = 20

        this.offlineOnlineUsers

        this.location = "DefaultUserHome"

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
        this.target = new Phaser.Math.Vector2();
        this.distance

        //shadow
        this.playerShadowOffset = -8
        this.playerIsMovingByClicking = false

        //UI scene
        this.currentZoom
        this.UI_Scene
    }

    init(data) {
        this.location = data.user_id
        //console.log('init', data)
    }

    async preload() {
        Preloader.Loading(this) //.... PRELOADER VISUALISER


    }//end preload


    async create() {

        // for back button
        ManageSession.locationHistory.push("DefaultUserHome")

        //timers
        ManageSession.updateMovementTimer = 0;
        ManageSession.updateMovementInterval = 60; //1000 / frames =  millisec

        //.......  LOAD PLAYER AVATAR ..........................................................................
        ManageSession.createPlayer = true
        //....... end LOAD PLAYER AVATAR .......................................................................
        Background.repeatingDots({ scene: this, gridOffset: 50, dotWidth: 2, dotColor: 0x909090, backgroundColor: 0xFFFFFF })
        //.......  PLAYER ....................................................................................
        //* create deafult player and playerShadow
        //* create player in center with artworldCoordinates
        this.player = new PlayerDefault(this, CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0), this.playerAvatarPlaceholder)

        this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder })
        //.......  end PLAYER ................................................................................

        //....... onlinePlayers ..............................................................................
        // add onlineplayers group
        this.onlinePlayersGroup = this.add.group();
        //....... end onlinePlayers ..........................................................................

        //....... PLAYER VS WORLD .............................................................................
        this.gameCam = this.cameras.main //.setBackgroundColor(0xFFFFFF);
        //!setBounds has to be set before follow, otherwise the camera doesn't follow!
        this.gameCam.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
        this.gameCam.zoom = 1
        this.gameCam.startFollow(this.player);
        //......... end PLAYER VS WORLD .......................................................................

        //......... INPUT .....................................................................................
        this.cursors = this.input.keyboard.createCursorKeys();
        //.......... end INPUT ................................................................................

        //.......... locations ................................................................................
        //generating homes from online query is not possible in create, because the server query can take time
        //this.generateLocations()
        //.......... end locations ............................................................................

        //BouncingBird.generate({ scene: this, birdX: 200, birdY: 200, birdScale: 1.2 })

        //......... DEBUG FUNCTIONS ...........................................................................
        DebugFuntions.keyboard(this);
        //this.createDebugText();
        //......... end DEBUG FUNCTIONS .......................................................................

        //......... UI Scene  .................................................................................
        this.UI_Scene = this.scene.get("UI_Scene")
        this.scene.launch("UI_Scene")
        this.currentZoom = this.UI_Scene.currentZoom
        this.UI_Scene.location = this.location
        this.gameCam.zoom = this.currentZoom
        //......... end UI Scene ..............................................................................

        // ArtworkList.getImages(this, "512", this.artDisplaySize, 550, 260, null)
        console.log()
        await listImages("drawing", this.location, 100).then((rec) => {
            this.userArtServerList = rec

            if (this.userArtServerList.length > 0) {
                this.userArtServerList.forEach((element, index) => {

                    this.downloadArt(element, index)
                })
            }
        })

    }//end create

    async downloadArt(element, index) {

        const imgUrl = element.value.url
        const imgSize = this.artDisplaySize.toString()
        const fileFormat = "png"
        const key = `${element.key}_${imgSize}`
        const coordX = index == 0 ? this.artDisplaySize / 2 : (this.artDisplaySize / 2) + (index * (this.artDisplaySize + 38))
        this.artContainer = this.add.container(0, 0);

        const y = 300

        if (this.textures.exists(key)) { // if the image has already downloaded, then add image by using the key

            // adds a frame to the container
            this.artContainer.add(this.add.image(coordX - this.artDisplaySize / 2, y, 'artFrame_512').setOrigin(0, 0.5))

            // adds the image to the container
            const setImage = this.add.image(coordX, y, key)
            this.artContainer.add(setImage)

        } else { // otherwise download the image and add it

            this.artUrl[index] = await convertImage(imgUrl, imgSize, fileFormat)

            // for tracking each file in progress
            this.progress.push({ key, coordX })

            this.load.image(key, this.artUrl[index])

            this.load.start() // load the image in memory
        }

        const progressBox = this.add.graphics()
        const progressBar = this.add.graphics()
        const progressWidth = 300
        const progressHeight = 50
        const padding = 10

        this.load.on("fileprogress", (file, value) => {

            progressBox.clear();
            progressBar.clear();
            progressBox.fillStyle(0x000000, 1)
            progressBar.fillStyle(0xFFFFFF, 1)

            const progressedImage = this.progress.find(element => element.key == file.key)

            progressBox.fillRect(progressedImage.coordX - progressWidth / 2, y, progressWidth, progressHeight)
            progressBar.fillRect(progressedImage.coordX - progressWidth / 2 + padding, y + padding, (progressWidth * value) - (padding * 2), progressHeight - padding * 2)

        })

        this.load.on('filecomplete', (key) => {

            const currentImage = this.progress.find(element => element.key == key)

            // adds a frame to the container
            this.artContainer.add(this.add.image(currentImage.coordX - this.artDisplaySize / 2, y, 'artFrame_512').setOrigin(0, 0.5))

            // adds the image to the container
            const completedImage = this.add.image(currentImage.coordX, y, currentImage.key)
            this.artContainer.add(completedImage)
        })

        this.load.once("complete", () => {
            progressBar.destroy()
            progressBox.destroy()
            this.progress = []
        });
    }//end downloadArt



    update(time, delta) {
        //...... ONLINE PLAYERS ................................................
        //Player.loadOnlinePlayers(this)
        //Player.receiveOnlinePlayersMovement(this)
        Player.loadOnlineAvatar(this)

        this.gameCam.zoom = this.UI_Scene.currentZoom
        //.......................................................................

        //........... PLAYER SHADOW .............................................................................
        // the shadow follows the player with an offset
        this.playerShadow.x = this.player.x + this.playerShadowOffset
        this.playerShadow.y = this.player.y + this.playerShadowOffset
        //........... end PLAYER SHADOW .........................................................................

        //.......... UPDATE TIMER      ..........................................................................
        ManageSession.updateMovementTimer += delta
        // console.log(time) //running time in millisec
        // console.log(delta) //in principle 16.6 (60fps) but drop to 41.8ms sometimes
        //....... end UPDATE TIMER  ..............................................................................

        //........ PLAYER MOVE BY KEYBOARD  ......................................................................
        if (!this.playerIsMovingByClicking) {
            Player.moveByKeyboard(this) //player moving with keyboard with playerMoving Class
        }

        Player.moveByCursor(this)
        //....... end PLAYER MOVE BY KEYBOARD  ..........................................................................

        //....... moving ANIMATION ......................................................................................
        Player.movingAnimation(this)
        //....... end moving ANIMATION .................................................................................

        //this.playerMovingByClicking()
        // to detect if the player is scrolling
        Player.identifySurfaceOfPointerInteraction(this)

        // to detect if the player is clicking/tapping on one place or swiping
        if (this.input.activePointer.downX != this.input.activePointer.upX) {
            Player.moveBySwiping(this)
        } else {
            Player.moveByTapping(this)
        }

        if (this.scrollablePanel) {
            Player.moveScrollablePanel(this);
        }

        if (this.playerContainer) {
            Player.movePlayerContainer(this);
        }
    } //update
} //class

