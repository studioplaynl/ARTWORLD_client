export default class playerDefaultShadow extends Phaser.GameObjects.Sprite {

    constructor(config) {
        super(config.scene, config.x, config.y, config.texture)

        config.scene.add.existing(this);

        //scene.add.sprite(scene.player.x + scene.playerShadowOffset, scene.player.y + scene.playerShadowOffset, textureKey).setDepth(100);
        this.setTint(0x000000);
        this.alpha = 0.2;

        //  add images and physics to the scene, displayList and updateList
       // scene.add.existing(this);
        // scene.physics.add.existing(this);

        // //  Set some default physics properties
        // this.body.onOverlap = true
        // this.setDepth(101)
    }
}

// config.scene, config.x, config.y, "bomb"

// constructor(scene, x, y, textureKey) {
//     super(scene, x, y, 'defaultPlayerAvatar');

//     scene.add.sprite(scene.player.x + scene.playerShadowOffset, scene.player.y + scene.playerShadowOffset, textureKey).setDepth(100);
//     this.setTint(0x000000);
//     this.alpha = 0.2;

//     //  add images and physics to the scene, displayList and updateList
//     scene.add.existing(this);
//     // scene.physics.add.existing(this);

//     // //  Set some default physics properties
//     // this.body.onOverlap = true
//     // this.setDepth(101)
// }
// }