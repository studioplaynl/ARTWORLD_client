import ManageSession from "../ManageSession"
import CoordinatesTranslator from "./CoordinatesTranslator"

export default class PlayerDefault extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, textureKey) {
        super(scene, x, y, 'defaultPlayerAvatar');

        //load the texture that is associated with the animation key 'stop'
        this.play('stop')

        //  add images and physics to the scene, displayList and updateList
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //  Set some default physics properties
        this.body.onOverlap = true
        this.setDepth(101)

        //set url param's to player pos and scene key
        ManageSession.setUrl(scene.location, CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, ManageSession.playerPosX), CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, ManageSession.playerPosY))
    }
}