export default class playerDefault extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'defaultPlayerAvatar');

        this.play('stop');

        //  You can either do this:
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //  Or this, the end result is the same
        // scene.sys.displayList.add(this);
        // scene.sys.updateList.add(this);
        // scene.sys.arcadePhysics.world.enableBody(this, 0);

        //!  Set some default physics properties
        this.body.onOverlap = true
        this.setDepth(101) //!works
    }

    changeTexture(scene, avatarKey) {
        this.setTexture(avatarKey)
        this.play('stop2', true);
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

}