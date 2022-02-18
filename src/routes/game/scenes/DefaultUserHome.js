import ManageSession from "../ManageSession"
import { listImages, convertImage } from '../../../api.js'

import PlayerDefault from '../class/PlayerDefault'
import PlayerDefaultShadow from '../class/PlayerDefaultShadow'
import Player from '../class/Player.js'
import Preloader from '../class/Preloader.js'
import Background from "../class/Background.js"
import DebugFuntions from "../class/DebugFuntions.js"
import CoordinatesTranslator from "../class/CoordinatesTranslator.js"
// import GenerateLocation from "../class/GenerateLocation.js"
import HistoryTracker from "../class/HistoryTracker.js"
import ArtworkList from "../class/ArtworkList.js"
import Move from "../class/Move.js"

export default class DefaultUserHome extends Phaser.Scene {

    constructor() {
        super("DefaultUserHome");

        this.worldSize = new Phaser.Math.Vector2(6000, 1000)

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

        this.location = ""

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
        HistoryTracker.pushLocation(this)
        //console.log("ManageSession.locationHistory", ManageSession.locationHistory)

        //copy worldSize over to ManageSession, so that positionTranslation can be done there
        ManageSession.worldSize = this.worldSize

        //.......  LOAD PLAYER AVATAR ..........................................................................
        ManageSession.createPlayer = true
        //....... end LOAD PLAYER AVATAR .......................................................................
        Background.repeatingDots({ scene: this, gridOffset: 50, dotWidth: 2, dotColor: 0x909090, backgroundColor: 0xFFFFFF })

        this.touchBackgroundCheck = this.add.rectangle(0, 0, this.worldSize.x, this.worldSize.y, 0xfff000)
            .setInteractive() //{ useHandCursor: true }
            .on('pointerup', () => console.log("touched background"))
            .on('pointerdown', () => ManageSession.playerMove = true)
            .setDepth(219)
            .setOrigin(0)
            .setVisible(false)

        this.touchBackgroundCheck.input.alwaysEnabled = true //this is needed for an image or sprite to be interactive also when alpha = 0 (invisible)

        //.......  PLAYER ....................................................................................
        //* create default player and playerShadow
        //* create player in center with artworldCoordinates
        this.player = new PlayerDefault(this, CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0), this.playerAvatarPlaceholder).setDepth(201)
        Player.createPlayerItemsBar(this)
        this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder }).setDepth(200)
        //.......  end PLAYER ................................................................................

        //....... onlinePlayers ..............................................................................
        // add onlineplayers group
        this.onlinePlayersGroup = this.add.group()
        //....... end onlinePlayers ..........................................................................
        Player.createOnlinePlayerItemsBar(this)
        //....... PLAYER VS WORLD .............................................................................
        this.gameCam = this.cameras.main //.setBackgroundColor(0xFFFFFF);
        //!setBounds has to be set before follow, otherwise the camera doesn't follow!
        this.gameCam.zoom = 1
        this.gameCam.startFollow(this.player)
        this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y)

        //......... end PLAYER VS WORLD .......................................................................

        //......... INPUT .....................................................................................
        this.cursors = this.input.keyboard.createCursorKeys();
        //.......... end INPUT ................................................................................

        //.......... locations ................................................................................
        //.......... end locations ............................................................................

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

        this.artworksListSpinner = this.rexSpinner.add.pie({
            x: this.worldSize.x / 2,
            y: this.worldSize.y / 2,
            width: 400,
            height: 400,
            duration: 850,
            color: 0xffff00
        }).setDepth(199)

        this.artworksListSpinner.start()

        Player.loadPlayerAvatar(this)

        await listImages("drawing", this.location, 100).then((rec) => {
            //this.userArtServerList is an array with objects, in the form of:

            //collection: "drawing"
            //create_time: "2022-01-27T16:46:00Z"
            //key: "1643301959176_cyaanConejo"
            //permission_read: 1
            //permission_write: 1
            //update_time: "2022-02-09T13:47:01Z"
            //user_id: "5264dc23-a339-40db-bb84-e0849ded4e68"
            //value:
            //  displayname: "cyaanConejo"
            //  json: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.json"
            //  previewUrl: "https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png?signature=6339bb9aa7f10a73387337ce0ab59ab5d657e3ce95b70a942b339cbbd6f15355"
            //  status: ""
            //  url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png"
            //  version: 0

            //permission_read: 1 indicates hidden
            //permission_read: 2 indicates visible

            //we filter out the visible artworks
            //filter only the visible art = "permission_read": 2
            this.userArtServerList = rec.filter(obj => obj.permission_read == 2)

            console.log("this.userArtServerList", this.userArtServerList)
            if (this.userArtServerList.length > 0) {
                this.userArtServerList.forEach((element, index, array) => {
                    this.downloadArt(element, index, array)
                })
                
            } else {
                this.artworksListSpinner.destroy()
            }
        })
    }//end create

    async downloadArt(element, index, array) {
        //! we are placing the artWorks 'around' the center of the world
        const totalArtWorks = array.length
        const imageKeyUrl = element.value.url
        const imgSize = this.artDisplaySize.toString()
        const fileFormat = "png"
        // put the artworks 'around' the center, which mean take total artworks * space = total x space eg 3 * 550 = 1650
        // we start at middleWorld.x - totalArtWidth + (artIndex * artDisplaySize) 
   
        const totalArtWidth = (this.artDisplaySize + 38) * totalArtWorks

        console.log("totalArtWidth", totalArtWidth)
        const middleWorldX = CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0)
        const startXArt = middleWorldX - (totalArtWidth/2)

        const coordX = index == 0 ? startXArt : (startXArt) + (index * (this.artDisplaySize + 38))
        this.artContainer = this.add.container(0, 0).setDepth(100)

        const y = 500

        if (this.textures.exists(imageKeyUrl)) { // if the image has already downloaded, then add image by using the key

            // adds a frame to the container
            this.artContainer.add(this.add.image(coordX - this.artDisplaySize / 2, y, 'artFrame_512').setOrigin(0.5))

            // adds the image to the container
            const setImage = this.add.image(coordX - this.artDisplaySize / 2, y, imageKeyUrl).setOrigin(0.5)
            this.artContainer.add(setImage)
            this.artworksListSpinner.destroy()

        } else { // otherwise download the image and add it

            const convertedImage = await convertImage(imageKeyUrl, imgSize, fileFormat)

            // for tracking each file in progress
            this.progress.push({ imageKeyUrl, coordX })

            this.load.image(imageKeyUrl, convertedImage)

            this.load.start() // start the load queue to get the image in memory
        }

        ArtworkList.placeHeartButton(this, coordX, y, imageKeyUrl, element)

        const progressBox = this.add.graphics()
        const progressBar = this.add.graphics()
        const progressWidth = 256
        const progressHeight = 50
        const padding = 10

        this.load.on("fileprogress", (file, value) => {

            progressBox.clear();
            progressBar.clear();
            progressBox.fillStyle(0x000000, 1)
            progressBar.fillStyle(0xFFFFFF, 1)

            // the progress bar is displayed for each artworks loading process 
            const progressedImage = this.progress.find(element => element.imageKeyUrl == file.key)

            // we want to run the progress bar only for artworks, 
            // and it should not be triggered for any other loading processes
            if (progressedImage) {
                progressBox.fillRect(progressedImage.coordX - progressWidth * 1.5, y, progressWidth, progressHeight)
                progressBar.fillRect(progressedImage.coordX - progressWidth * 1.5 + padding, y + padding, (progressWidth * value) - (padding * 2), progressHeight - padding * 2)
            }

        })

        this.load.on('filecomplete', (key) => {

            // on completion of each specific artwork
            const currentImage = this.progress.find(element => element.imageKeyUrl == key)

            // we don't want to trigger any other load completions 
            if (currentImage) {
                // adds a frame to the container
                this.artContainer.add(this.add.image(currentImage.coordX - this.artDisplaySize / 2, y, 'artFrame_512').setOrigin(0.5))

                // adds the image to the container
                const completedImage = this.add.image(currentImage.coordX - this.artDisplaySize / 2, y, currentImage.imageKeyUrl).setOrigin(0.5)
                this.artContainer.add(completedImage)
            }
        })

        this.load.on("complete", () => {
            progressBar.destroy()
            progressBox.destroy()
            this.progress = []
            this.artworksListSpinner.destroy()
        })
    }//end downloadArt

    update(time, delta) {
        //...... ONLINE PLAYERS ................................................
        Player.parseNewOnlinePlayerArray(this)
        //.......................................................................

        this.gameCam.zoom = this.UI_Scene.currentZoom
        //.......................................................................

        //........... PLAYER SHADOW .............................................................................
        // the shadow follows the player with an offset
        this.playerShadow.x = this.player.x + this.playerShadowOffset
        this.playerShadow.y = this.player.y + this.playerShadowOffset
        //........... end PLAYER SHADOW .........................................................................

        //....... moving ANIMATION ......................................................................................
        Move.checkIfPlayerIsMoving(this)
        //....... end moving ANIMATION .................................................................................

        // to detect if the player is clicking/tapping on one place or swiping
        if (this.input.activePointer.downX != this.input.activePointer.upX) {
            Move.moveBySwiping(this)
        } else {
            Move.moveByTapping(this)
        }

        // player items bar follows the position of the player 
        if (this.playerItemsBar) {
            Move.movePlayerItemsBar(this)
        }

        // player liked panel follows the position of the player 
        if (this.playerLikedPanel) {
            Move.movePlayerLikedPanel(this)
        }

        // once a movement is detected the addressbook is hidden
        if (this.playerAddressbookContainer) {
            Player.hideAddressbook(this)
        }
    } //update
} //class

