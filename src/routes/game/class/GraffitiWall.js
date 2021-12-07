class GraffitiWall {
  constructor() {
  }

  create(scene, x, y, width, height, name, imageFile = null) {
    const rt = scene.add.renderTexture(x, y, width, height).setInteractive().setDepth(1001).setName(name)
    console.log("RT", rt)
    if (imageFile) {
      const graffitiWall = scene.add.image(x, y, imageFile).setOrigin(0).setDepth(1000)
      graffitiWall.displayWidth = width
      graffitiWall.displayHeight = height
    }

    let hsv = Phaser.Display.Color.HSVColorWheel();

    let i = 0;

    scene.input.keyboard.on('keydown-' + 'SPACE', function () {
      rt.clear();
    });

    rt.on('pointerdown', function (pointer) {
      this.graffitiDrawing = true
      this.isClicking = true
      this.draw('brush', pointer.worldX - x, pointer.worldY - y, 1, hsv[i].color);
    });

    rt.on('pointermove', function (pointer) {
      if (pointer.isDown) {
        this.graffitiDrawing = true
        this.isClicking = true
        this.draw('brush', pointer.worldX - x, pointer.worldY - y, 1, hsv[i].color);
        i = Phaser.Math.Wrap(i + 1, 0, 360);
      }
    })

    rt.on('pointerup', function (pointer) {
      this.graffitiDrawing = false
    })
  }
}

export default new GraffitiWall()