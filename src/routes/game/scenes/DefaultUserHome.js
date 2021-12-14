import { CONFIG } from "../config.js";
import ManageSession from "../ManageSession"
import { listObjects, listImages, convertImage } from '../../../api.js'

import PlayerDefault from '../class/PlayerDefault'
import PlayerDefaultShadow from '../class/PlayerDefaultShadow'
import Player from '../class/Player.js'
import Preloader from '../Preloader.js'
import BouncingBird from "../class/BouncingBird.js"
import Background from "../class/Background.js"
import DebugFuntions from "../class/DebugFuntions.js"
import CoordinatesTranslator from "../class/CoordinatesTranslator.js"
import GenerateLocation from "../class/GenerateLocation.js"
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

        this.currentZoom
        this.UI_Scene
    }

    init(data) {
        this.location = data.user_id
        console.log("this.location: ", this.location)
        //console.log('init', data)
    }

    async preload() {
        Preloader.Loading(this) //.... PRELOADER VISUALISER


    }//end preload

    async downloadArt(element, index) {

        let imgUrl = element.value.url
        console.log(imgUrl)
        let imgSize = "512"
        let fileFormat = "png"


        this.artUrl[index] = await convertImage(imgUrl, imgSize, fileFormat)
        console.log(this.artUrl[index])

        this.load.image(
            element.key + "_" + imgSize,
            this.artUrl[index]
        )

        this.load.once('complete', () => {
            console.log("loading art complete")

            const imageGameObject = this.add.image(300, 400, element.key + "_" + imgSize).setDepth(50)
            this.userArtDisplayList.push(imageGameObject)
            this.displayUserArt()

        })

        this.load.start() // load the image in memory
        console.log("download started")

    }

    async create() {

        console.log("this.location: ", this.location)

        // for back button history
        ManageSession.locationHistory.push(this.location);
        ManageSession.currentLocation = this.location
        console.log("this.scene.key", this.location)

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

        //get a list of artworks of the user
        await listImages("drawing", this.location, 100).then((rec) => {

            // userArt = array of visible art of specific type, from this array urls, keys have to be created to display the art
            this.userArtServerList = rec
            console.log(this.userArtServerList)

            if (this.userArtServerList.length > 0) {
                //download the art, by loading the url and setting a key
                this.userArtServerList.forEach((element, index) => {
                    this.downloadArt(element, index)

                    //make a key
                    console.log(element.key)
                    //load the url with key
                })//end userArt downloadArt
            }
        }) //end listImages

    }

    displayUserArt() {
        console.log("this.userArtDisplayList: ", this.userArtDisplayList)
        //const circle = new Phaser.Geom.Circle(400, 300, 220);

        //Phaser.Actions.PlaceOnCircle(this.userArtDisplayList, circle);
        if (this.userArtDisplayList.length > 0) {
            this.userArtDisplayList.forEach((element, index) => {
                console.log("element.x", element.x)
                element.x = (index * 520) + (512/2)
            })
            // Phaser.Actions.GridAlign(this.userArtDisplayList, {
            //     width: this.userArtDisplayList.length,
            //     height: 1,
            //     cellWidth: 512,
            //     cellHeight: 512,
            //     x: 2048,
            //     y: 512
            // });
        }
    }
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

        // to detect if the player is clicking/tapping on one place or swiping
        if (this.input.activePointer.downX != this.input.activePointer.upX) {
            Player.moveBySwiping(this)
        } else {
            Player.moveByTapping(this)
        }

    } //update
} //class
