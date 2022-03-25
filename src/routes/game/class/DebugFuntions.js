import ManageSession from "../ManageSession"
import { getAccount, updateObject, listObjects, setLoader } from '../../../api.js'
import CoordinatesTranslator from "./CoordinatesTranslator"
import ArtworkList from "./ArtworkList"
import Player from "./Player"

class DebugFuntions {
    constructor(scene) {
        //scene = config.scene 

    }

    keyboard(scene) {


        //let combo = scene.input.keyboard.createCombo(['Alt', 'Shift'])

        scene.input.keyboard.createCombo([16, 18, 69, 70], { resetOnMatch: true })

        //scene.input.keyboard.createCombo([16, 18], { resetOnMatch: true })

        scene.input.keyboard.on('keycombomatch', function (event) {
            //console.log(event, 'SHIFT ALT E F pressed: edit mode')
            // ManageSession.gameEditMode == false ? true : false
            
            if (ManageSession.gameEditMode) {
                ManageSession.gameEditMode = false
            } else {
                ManageSession.gameEditMode = true
            }

            console.log("ManageSession.gameEditMode", ManageSession.gameEditMode)
            
            if (ManageSession.gameEditMode) {
                console.log("EDIT MODE on")
            } else {
                console.log("EDIT MODE off")

            }
        })



    }

    debugKeys(scene) {


        //KEYS THAT ARE TAKEN
        // 1 2 A S D F Q W E R H T P U

        scene.input.keyboard.on('keyup-A', function (event) {

        }, scene)

        scene.input.keyboard.on('keyup-ONE', function (event) {

            console.log('1 key')
            //ManageSession.getStreamUsers("get_users", scene.location)

            Promise.all([listObjects("liked", ManageSession.userProfile.id, 10)])
                .then((rec) => {
                    console.log("liked query", rec[0])
                })
            // ManageSession.getStreamUsers("get_users", scene.location)
            // listObjects("addressbook", ManageSession.userProfile.id, 10)

            Promise.all([listObjects("addressbook", ManageSession.userProfile.id, 10)
            ]).then((rec) => {
                console.log("addressbook query", rec[0])
            })

        }, scene)

        scene.input.keyboard.on('keyup-TWO', async (event) => {
            console.log('2 key')

            scene.player.anims.play(scene.playerMovingKey, true)
            scene.playerShadow.anims.play(scene.playerMovingKey, true)

        }, scene)


        scene.input.keyboard.on('keyup-THREE', async (event) => {
            console.log('2 key')

            scene.player.anims.play(scene.playerStopKey, true)
            scene.playerShadow.anims.play(scene.playerStopKey, true)
        }, scene)

        scene.input.keyboard.on('keyup-S', function (event) {

            console.log('S key')
            //setLoader(true)


        }, scene);

        scene.input.keyboard.on('keyup-D', function (event) {

            console.log('D key')

            //list all images in the textureManager
            console.log(scene.textures.list)

            //Return an array listing the events for which the emitter has registered listeners.
            console.log("Return an array listing the events for which the emitter has registered listeners: ")
            console.log(scene.textures.eventNames())

            console.log(scene.children) //get the whole DisplayList

        }, scene)


        scene.input.keyboard.on('keyup-G', function (event) {

            console.log(event)
            console.log(" ")
            console.log('scene.onlinePlayers: ')
            console.log(scene.onlinePlayers)

            console.log("ManageSession.allConnectedUsers: ")
            console.log(ManageSession.allConnectedUsers)

            console.log("onlinePlayerGroup Children: ")
            console.log(scene.onlinePlayersGroup.getChildren())

            console.log("scene.player: ")
            console.log(scene.player)

        }, scene)

        scene.input.keyboard.on('keyup-F', function (event) {

            console.log('F key');

            console.log("ManageSession.userProfile: ")
            console.log(ManageSession.userProfile)

            console.log("scene.createOnlinePlayers: ")
            console.log(ManageSession.createOnlinePlayers)

            console.log("scene.createdPlayer: ")
            console.log(scene.createdPlayer)
        }, scene);

        scene.input.keyboard.on('keyup-Q', function (event) {

            console.log('Q key');
            getAccount();

        }, scene);

        scene.input.keyboard.on('keyup-W', function (event) {

            console.log('W key');

            listObjects("addressbook", ManageSession.userProfile.id, 10)
        }, scene)

        scene.input.keyboard.on('keyup-H', function (event) {
            console.log('H key');
            console.log(ManageSession.addressbook)
            console.log(ManageSession.addressbook.value)
        }, scene)

        scene.input.keyboard.on('keyup-R', function (event) {
            console.log('R key');
            const value = '{"user_id": "b9ae6807-1ce1-4b71-a8a3-f5958be4d340", "posX": "100", "posY": "500"}'

            const type = "addressbook"
            const name = type + "_" + ManageSession.userProfile.id
            const pub = 2

            updateObject(type, name, value, pub)
        }, scene)

        scene.input.keyboard.on('keyup-H', function (event) {

            console.log('H key');
            console.log(listObjects("location", "", 200))

        }, scene);

        scene.input.keyboard.on('keyup-T', function (event) {

            console.log('T key')
            console.log("::Test Coordinates Scene::")
            this.scene.stop(ManageSession.currentlocation);
            this.scene.start("TestCoordinates")

        }, scene);

        scene.input.keyboard.on('keyup-P', function (event) {

            console.log('P key')
            console.log("Display Mouse coordinates")
            console.log("World Coordinates: ")
            console.log(scene.input.mousePointer.worldX, scene.input.mousePointer.worldY)
            console.log("artworldCoordinates: ")
            console.log(CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, scene.input.activePointer.worldX))
            console.log(CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.y, scene.input.activePointer.worldY))

        }, scene);

        scene.input.keyboard.on('keyup-U', async (event) => {
            scene.playerLikedPanelUrls = await ArtworkList.convertRexUIArray(scene)
        }, scene)

    }
}

export default new DebugFuntions();