import ManageSession from "../ManageSession"

// export default class LocationDialogbox extends Phaser.GameObjects.Container {
class LocationDialogbox {
    constructor(scene) {
        this.locationGameObject
    }


    create(scene, location, locationName, mainWidth, mainHeight) {
        this.locationGameObject = location

        location.setData("entered", false)
        location.setName(locationName)

        //create variable for the text of the dialog box, set the text after
        let nameText = "scene." + location.name + "DialogBox"
        nameText = scene.add.text(mainWidth - 60, mainHeight - 30, locationName, { fill: '#000' })

        //create variable to hold dialogbox graphics
        let nameBox = "scene." + location.name + "DialogBox"

        //background panel for dialogbox
        nameBox = scene.add.graphics();
        nameBox.fillStyle(0xfffff00, 0.4)
        nameBox.fillRoundedRect(0, 0, mainWidth, mainHeight, 32)
        nameBox.setVisible(false)

        //create variable for texture that holds the graphics and the clickable area for the dialogbox
        let nameTexture = "scene." + location.name + "Texture"

        nameTexture = scene.add.renderTexture(0, 0, mainWidth, mainHeight);
        nameTexture.draw(nameBox);
        nameTexture.setInteractive(new Phaser.Geom.Rectangle(0, 0, mainWidth, mainWidth), Phaser.Geom.Rectangle.Contains)
        nameTexture.on('pointerdown', () => { this.enterLocationScene(scene, location.name) });

        //create container that holds all of the dialogbox: can be moved and hidden
        let nameContainer = "scene." + location.name + "DialogBoxContainer"

        // nameContainer = scene.add.container(location.x - (mainWidth / 2), location.y - (mainHeight / 2), [nameTexture, nameText]).setDepth(900)
        nameContainer = scene.add.container(location.body.x + (location.body.width / 4), location.body.y + (location.body.height / 4), [nameTexture, nameText]).setDepth(900)

        nameContainer.setVisible(false)
        nameContainer.setName(location.name)

        //add everything to the container
        scene.locationDialogBoxContainersGroup.add(nameContainer);

        //call overlap between player and the location, set the callback function and scope
        scene.physics.add.overlap(scene.player, location, this.confirmEnterLocation, null, this)
    }

    confirmEnterLocation(scene, player, location, show) {
        location = this.locationGameObject
        if (!location.getData("entered")) {
            //start event
            show = false
            //   scene.time.addEvent({ delay: 2000, callback: this.enterLocationDialogBox, args: [player, location, show], callbackScope: this, loop: false })
            setTimeout(this.enterLocationDialogBox, 2000, player, location, show)

            //show the box
            show = true
            this.enterLocationDialogBox(scene, player, location, show)
            location.setData("entered", true)
        }
    }

    enterLocationDialogBox(player, location, show) {
        let scene = player.scene

        let container = "scene." + location.name + "DialogBoxContainer"

        // console.log(player.scene)
        // console.log(container)

        let nameContainer = location.name
        let search = { name: location }

        container = Phaser.Actions.GetFirst(scene.locationDialogBoxContainersGroup.getChildren(), { name: nameContainer });

        if (show) {
          container.setVisible(show)
        } else {
          container.setVisible(show)
          location.setData("entered", show)
        }

    }

    enterLocationScene(scene, location) {
        //const locationScene = location + "_Scene"

        ManageSession.previousLocation = scene.scene.key
        ManageSession.currentLocation = location

        scene.physics.pause()
        scene.player.setTint(0xff0000)

        //player has to explicitly leave the stream it was in!
        console.log("leave, scene.location")
        console.log(scene.location)
        ManageSession.socket.rpc("leave", scene.location)

        scene.player.location = location
        console.log("scene.player.location:")
        console.log(location)

        setTimeout(() => {
            ManageSession.location = location
            ManageSession.createPlayer = true
            ManageSession.getStreamUsers("join", location)
            scene.scene.stop(scene.scene.key)
            scene.scene.start(location)
        }, 500)

    }
}

export default new LocationDialogbox()