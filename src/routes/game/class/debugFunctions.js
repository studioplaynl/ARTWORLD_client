import manageSession from "./../manageSession";

class debugFuntions {
    constructor(scene) {
        //scene = config.scene 
    }

    keyboard(scene) {
        scene.input.keyboard.on('keyup-A', function (event) {
            //get online player group
            const displaylist = scene.onlinePlayersGroup.getChildren()
            console.log(displaylist)
        }, scene);

        scene.input.keyboard.on('keyup-ONE', function (event) {

            console.log('1 key');

            manageSession.getStreamUsers("get_users", scene.location)

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

            console.log('D key');

            console.log(" ")
            console.log('scene.onlinePlayers: ')
            console.log(scene.onlinePlayers)

            console.log("manageSession.allConnectedUsers: ")
            console.log(manageSession.allConnectedUsers)

            console.log("onlinePlayerGroup Children: ")
            console.log(scene.onlinePlayersGroup.getChildren())

            console.log("scene.player: ")
            console.log(scene.player)

        }, scene);

        scene.input.keyboard.on('keyup-F', function (event) {

            console.log('F key');

            console.log("manageSession.userProfile: ")
            console.log(manageSession.userProfile)

            console.log("scene.createOnlinePlayers: ")
            console.log(manageSession.createOnlinePlayers)

            console.log("scene.createdPlayer: ")
            console.log(scene.createdPlayer)
        }, scene);

        scene.input.keyboard.on('keyup-Q', function (event) {

            console.log('Q key');
            getAccount();

        }, scene);

        scene.input.keyboard.on('keyup-W', function (event) {

            console.log('W key');


        }, scene);

        // //  Receives every single key down event, regardless of type

        // scene.input.keyboard.on('keydown', function (event) {

        //   console.dir(event);

        // }, scene);
    }
}

export default new debugFuntions();