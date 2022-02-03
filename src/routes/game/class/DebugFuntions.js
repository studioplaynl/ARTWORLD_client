import ManageSession from "../ManageSession";
import { getAccount, updateObject, listObjects } from '../../../api.js'
import CoordinatesTranslator from "./CoordinatesTranslator";
import ArtworkList from "./ArtworkList";

class DebugFuntions {
    constructor(scene) {
        //scene = config.scene 
    }

    keyboard(scene) {
        //KEYS THAT ARE TAKEN
        // 1 A S D F Q W E R H T P U

        scene.input.keyboard.on('keyup-A', function (event) {

            var tween = scene.tweens.add({
                targets: scene.playerTest,
                x: 2000,
                paused: false,
                duration: 2000,
                yoyo: true,
                repeat: -1
            })

            //this tween makes the target move to the x absolutely!
            //onComplete:onCompleteHandler ,onCompleteParams:[custom]}
            //https://rexrainbow.github.io/phaser3-rex-notes/docs/site/tween/

        }, scene)

        scene.input.keyboard.on('keyup-ONE', function (event) {

            console.log('1 key')
            //ManageSession.getStreamUsers("get_users", scene.location)

            Promise.all([listObjects("liked", ManageSession.userProfile.id, 10)])
                .then((rec) => {
                    console.log(rec[0])
                })

        }, scene);

        scene.input.keyboard.on('keyup-S', function (event) {

            console.log('S key');

            //list all images in the textureManager
            console.log(scene.textures.list)

            //Return an array listing the events for which the emitter has registered listeners.
            console.log("Return an array listing the events for which the emitter has registered listeners: ")
            console.log(scene.textures.eventNames())

        }, scene);

        scene.input.keyboard.on('keyup-D', function (event) {

            console.log('D key')
            console.log(" ")
            console.log('scene.onlinePlayers: ')
            console.log(scene.onlinePlayers)

            console.log("ManageSession.allConnectedUsers: ")
            console.log(ManageSession.allConnectedUsers)

            console.log("onlinePlayerGroup Children: ")
            console.log(scene.onlinePlayersGroup.getChildren())

            console.log("scene.player: ")
            console.log(scene.player)

            console.log("locationDialogBoxContainersGroup children")
            console.log(scene.locationDialogBoxContainersGroup.getChildren())

        }, scene);

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

        scene.input.keyboard.on('keyup-E', function (event) {
            console.log('E key');
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