export default class playerDefaultShadow extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.texture)

        config.scene.add.existing(this);

        this.setTint(0x000000);
        this.alpha = 0.2;
    }
}