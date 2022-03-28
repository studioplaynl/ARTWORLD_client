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
        //combo ALT SHIT E F
        scene.input.keyboard.createCombo([16, 18, 69, 70], { resetOnMatch: true })

        scene.input.keyboard.on('keycombomatch', function (event) {
            if (ManageSession.gameEditMode) {
                ManageSession.gameEditMode = false
                console.log("EDIT MODE off")
                scene.events.emit('gameEditMode', 'off')
            } else {
                ManageSession.gameEditMode = true
                console.log("EDIT MODE on")
                scene.events.emit('gameEditMode', 'on')
            }
        })

        //check all key up events
        scene.input.keyboard.on('keyup', function (event) {
            //only activate debug functions when in edit mode
            if (ManageSession.gameEditMode) {
                //console.log(event)
                this.debugKeys(scene, event.code)
            }
        }, this)

        // scene.events.emit(eventName, parameter0, ...)
    }

    debugKeys(scene, code) {
        //avoid E F -> already used for edit mode

        //edit mode to activate debugKeyboard

        // code: AltLeft, KeyS, Digit1 -> always the same for alphabet and digits
        // key: Alt, s, Shift, 1 -> always small key, also with shift, except with CAPS
        // keyCode: 18, 83, 49

        switch (code) {
            case ('ArrowRight'):
                //reserverd for moving the camera in EditMode
                ManageSession.currentScene.player.x += 50
                ManageSession.currentScene.playerShadow.x += 50
                break

            case ('ArrowLeft'):
                //reserverd for moving the camera in EditMode
                ManageSession.currentScene.player.x -= 50
                ManageSession.currentScene.playerShadow.x -= 50
                break

            case ('ArrowUp'):
                //reserverd for moving the camera in EditMode
                ManageSession.currentScene.player.y -= 50
                ManageSession.currentScene.playerShadow.y -= 50
                break

            case ('ArrowDown'):
                //reserverd for moving the camera in EditMode
                ManageSession.currentScene.player.y += 50
                ManageSession.currentScene.playerShadow.y += 50
                break

            case 'KeyA':
                console.log(code)

                break

            case 'Digit1':
                console.log(code)

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
                break

            case 'Digit2':
                console.log(code)

                scene.player.anims.play(scene.playerMovingKey, true)
                scene.playerShadow.anims.play(scene.playerMovingKey, true)
                break

            case 'KeyD':
                console.log(code)

                //list all images in the textureManager
                console.log(scene.textures.list)

                //Return an array listing the events for which the emitter has registered listeners.
                console.log("Return an array listing the events for which the emitter has registered listeners: ")
                console.log(scene.textures.eventNames())

                console.log(scene.children) //get the whole DisplayList

                break

            case 'KeyG':
                console.log(code)
                console.log('scene.onlinePlayers: ')
                console.log(scene.onlinePlayers)

                console.log("ManageSession.allConnectedUsers: ")
                console.log(ManageSession.allConnectedUsers)

                console.log("onlinePlayerGroup Children: ")
                console.log(scene.onlinePlayersGroup.getChildren())

                console.log("scene.player: ")
                console.log(scene.player)
                break

            case 'KeyT':
                console.log(code)
                console.log("ManageSession.userProfile: ")
                console.log(ManageSession.userProfile)

                console.log("scene.createOnlinePlayers: ")
                console.log(ManageSession.createOnlinePlayers)

                console.log("scene.createdPlayer: ")
                console.log(scene.createdPlayer)
                break

            case 'KeyY':
                console.log(code)
                getAccount()
                break

            case 'KeyW':
                console.log(code)
                listObjects("addressbook", ManageSession.userProfile.id, 10)
                break

            case 'KeyH':
                console.log(code)
                console.log(ManageSession.addressbook)
                console.log(ManageSession.addressbook.value)
                break

            case 'KeyR':
                console.log(code)
                const value = '{"user_id": "b9ae6807-1ce1-4b71-a8a3-f5958be4d340", "posX": "100", "posY": "500"}'

                const type = "addressbook"
                const name = type + "_" + ManageSession.userProfile.id
                const pub = 2

                updateObject(type, name, value, pub)

                break

            case 'KeyP':
                console.log(code)
                console.log("Display Mouse coordinates")
                console.log("World Coordinates: ")
                console.log(scene.input.mousePointer.worldX, scene.input.mousePointer.worldY)
                console.log("artworldCoordinates: ")
                console.log(CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, scene.input.activePointer.worldX))
                console.log(CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.y, scene.input.activePointer.worldY))

                break

            default:

                break

        }
    }


}

export default new DebugFuntions();