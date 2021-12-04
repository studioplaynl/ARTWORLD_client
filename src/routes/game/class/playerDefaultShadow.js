export default class PlayerDefaultShadow extends Phaser.GameObjects.Sprite {
    
    constructor(config) {
        super(config.scene, config.texture)

        config.scene.add.existing(this);

        this.setTexture(config.texture)
        this.setTint(0x000000)
        this.alpha = 0.2
    }
}