import ManageSession from "../ManageSession"

class LocationDialogbox {
    constructor(scene) {
        this.locationGameObject
        this.scene = scene
        this.show = false
        this.player
    }

    create(scene, locationObject, locationName, mainWidth, mainHeight) {

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.locationGameObject = locationObject
        this.scene = scene
        console.log(scene)
        this.player = scene.player

        locationObject.setData("entered", false)
        locationObject.setName(locationName)

        //create variable for the text of the dialog box, set the text after
        let nameText = "scene." + locationObject.name + "DialogBox"
        nameText = scene.add.text(mainWidth - 60, mainHeight - 30, locationName, { fill: '#000' })

        //create variable to hold dialogbox graphics
        let nameBox = "scene." + locationObject.name + "DialogBox"

        //background panel for dialogbox
        nameBox = scene.add.graphics();
        nameBox.fillStyle(0xfffff00, 0.4)
        nameBox.fillRoundedRect(0, 0, mainWidth, mainHeight, 32)
        nameBox.setVisible(false)

        //create variable for texture that holds the graphics and the clickable area for the dialogbox
        let nameTexture = "scene." + locationObject.name + "Texture"

        nameTexture = scene.add.renderTexture(0, 0, mainWidth, mainHeight);
        nameTexture.draw(nameBox);
        nameTexture.setInteractive(new Phaser.Geom.Rectangle(0, 0, mainWidth, mainWidth), Phaser.Geom.Rectangle.Contains)
        nameTexture.on('pointerdown', () => { this.enterLocationScene(scene, locationObject.name) });

        //create container that holds all of the dialogbox: can be moved and hidden
        let nameContainer = "scene." + locationObject.name + "DialogBoxContainer"

        // nameContainer = scene.add.container(locationObject.x - (mainWidth / 2), locationObject.y - (mainHeight / 2), [nameTexture, nameText]).setDepth(900)
        nameContainer = scene.add.container(locationObject.body.x + (locationObject.body.width / 4), locationObject.body.y + (locationObject.body.height / 4), [nameTexture, nameText]).setDepth(900)

        nameContainer.setVisible(false)
        nameContainer.setName(locationObject.name)

        //add everything to the container
        scene.locationDialogBoxContainersGroup.add(nameContainer);

        //call overlap between player and the location, set the callback function and scope
        // more info about passing arguments to callback function https://phaser.discourse.group/t/passing-argments-into-functions/4411/2
        scene.physics.add.overlap(scene.player, locationObject, this.confirmEnterLocation, null, this)

    }

    confirmEnterLocation(player, locationObject) {
        //console.log(locationObject)
        // locationObject = this.locationGameObject
        let show

        if (!locationObject.getData("entered")) {
            //start event
            show = false
            //   scene.time.addEvent({ delay: 2000, callback: this.enterLocationDialogBox, args: [player, location, show], callbackScope: this, loop: false })
            setTimeout(this.enterLocationDialogBox, 2000, locationObject, show)

            //show the box
            show = true
            this.enterLocationDialogBox(locationObject, show)
            locationObject.setData("entered", true)
        }
    }

    enterLocationDialogBox(locationObject, show) {
        //console.log(locationObject)
        let scene = locationObject.scene

        scene.add.existing(this)
        scene.physics.add.existing(this)
    
        let nameContainer = locationObject.name
        
        let container = Phaser.Actions.GetFirst(scene.locationDialogBoxContainersGroup.getChildren(), { name: nameContainer })
        //console.log(container)
        // console.log(container)

        if (show) {
            container.setVisible(show)
        } else {
            container.setVisible(show)
            locationObject.setData("entered", show)
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