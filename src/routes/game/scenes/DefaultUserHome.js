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
import HistoryTracker from "../class/HistoryTracker.js";

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

        this.progressOn = []
        this.progressComplete = []
        this.onRepeatedDisplay = []
    
       

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

    createArtFrame() {
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
        artFrameRendertexture.saveTexture('artFrame_512')
        // this.add.image(0, 0, 'artFrame_512').setVisible(false) // .setOrigin(0)
    }

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

        this.createArtFrame()
        //get a list of artworks of the user
        // this.allUserArt = []
        // this.userArtServerList = []
        // this.userArtDisplayList = []
        // this.artUrl = []


        await listImages("drawing", this.location, 100).then((rec) => {

            // userArt = array of visible art of specific type, from this array urls, keys have to be created to display the art

            //! bug from the server: 
            //! 1: sometimes the art with stored in .objects (with a cursor: undefined above)
            //! 2: editing artworks are not reflected, artworks dissapear
            //* now I am testing with this.userArtserverList = rec

            // if (typeof rec.objects != undefined) {
            //     console.log("rec.objects")
            //     this.userArtServerList = rec.objects
            // } else {
            //     console.log("rec")
            //     this.userArtServerList = rec
            // }
    
            this.userArtServerList = rec
            // if (rec.hasOwnProperty('objects')){
            //     this.userArtServerList = rec.objects
            //     console.log("*************")
            // } else {
            //     this.userArtServerList = rec
            //     console.log("!!!!!!!!!!")
            // }

            console.log("this.userArtServerList: ", this.userArtServerList)
            
            if (this.userArtServerList.length > 0) {
                //download the art, by loading the url and setting a key
                this.userArtServerList.forEach((element, index) => {
                    console.log("element, current index", element.key, index)
                    this.downloadArt(element, index)
                })//end userArt downloadArt         
               

            }


        }) //end listImages


        const progressBox = this.add.graphics();
        const progressBar = this.add.graphics();
        const progressWidth = 300;
        const progressHeight = 50;
        const padding = 10;
        const y = 300;

        this.load.on("fileprogress", (file, value) => {
            if (this.progressOn.length > 0) { 
            progressBox.clear();
            progressBar.clear();
            progressBox.fillStyle(0x000000, 1)
            progressBar.fillStyle(0xFFFFFF, 1);
            
            console.log("progress", file.key, value)
            // if (this.progressOn.length == this.userArtServerList.length) {
                // it gets the first element of the processed array and gives the position for the progress bar of the respective image
                const processedFile = this.progressOn[0]

                progressBox.fillRect(processedFile.coordX - progressWidth / 2, y, progressWidth, progressHeight);
                progressBar.fillRect(processedFile.coordX - progressWidth / 2 + padding, y + padding, (progressWidth * value) - (padding * 2), progressHeight - padding * 2);
    
                // once the progress of the current image is done, it is taken out from the array
                if (value == 1) {
                    this.progressOn.shift()
                }
            // }
            }
        })

        this.load.on('filecomplete', (key) => {
            if (this.progressComplete.length > 0) {
                 console.log("completed", key)
                // gets the first element of the array
                const completedFile = this.progressComplete.shift();
    
                // creates a container
                const artContainer = this.add.container(0, 0)
    
                // adds a frame to the container
                artContainer.add(this.add.image(completedFile.coordX - this.artDisplaySize / 2, y, 'artFrame_512').setOrigin(0, 0.5))
        
                // adds the image to the container
                const currentImage = this.add.image(completedFile.coordX, y, key)
                artContainer.add(currentImage)
    
                // once finished loads the next element
                if (completedFile) {
                    this.load.image(completedFile.name);
                }
            }
        })

        this.load.once("complete", () => {
            progressBar.destroy();
            progressBox.destroy()
            this.progressOn = []
            this.progressComplete = []
            console.log("once complete", this.progressOn, this.progressComplete)
        });
   


    }//end create

    async downloadArt(element, index) {

        console.log("running 1")
        let imgUrl = element.value.url
        let imgSize = "512"
        let fileFormat = "png"

        this.artUrl[index] = await convertImage(imgUrl, imgSize, fileFormat)
        
        const currentImage = {
            name: element.key + "_" + imgSize,
            path: this.artUrl[index],
            coordX: index == 0 ? this.artDisplaySize / 2 : (this.artDisplaySize / 2) + index * 550 // a different value can be given instead of 550 depending on how much of a gap we want to see between the artworks 
        }


        // run only if the artworks have been downloaded before
        if (this.onRepeatedDisplay.some(element => element.name == currentImage.name)) {
            console.log("running 2")
            // creates a container
            const artContainerForFollowingRuns = this.add.container(0, 0)

            // adds a frame to the container
            artContainerForFollowingRuns.add(this.add.image(currentImage.coordX - this.artDisplaySize / 2, 300, 'artFrame_512').setOrigin(0, 0.5))

            // adds the image to the container
            const setImage = this.add.image(currentImage.coordX, 300, currentImage.name)
            artContainerForFollowingRuns.add(setImage)
        } else {
            // for tracking each file in progress
            this.progressOn.push(currentImage)
            // for tracking each file in completion
            this.progressComplete.push(currentImage)    
        }


        this.onRepeatedDisplay.push(currentImage)

        this.load.image(currentImage.name, currentImage.path)
        this.load.start() // load the image in memory

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

        // to detect if the player is clicking/tapping on one place or swiping
        if (this.input.activePointer.downX != this.input.activePointer.upX) {
            Player.moveBySwiping(this)
        } else {
            Player.moveByTapping(this)
        }

    } //update
} //class

