class GraffitiWall {
  constructor() {
  }

  create(scene, x, y, width, height, name, color, imageFile = null) {
    scene[name] = scene.add.container()

    // checking if a drawing wall has a front image
    if (imageFile) {
      let graffitiWall = scene.add.image(0, 0, imageFile).setOrigin(0.5).setDepth(198)
      graffitiWall.displayWidth = width
      graffitiWall.displayHeight = height
      scene[name].add(graffitiWall)
    }

    let rt = scene.add.renderTexture(-(width/2), -(height/2), width, height).setInteractive().setDepth(199).setName(name)
    scene[name].add(rt)
    scene[name].setSize(width+40, height+40)

    
    scene.input.keyboard.on('keydown-' + 'SPACE', function () {
      rt.clear()
    })

    rt.on('pointerdown', function (pointer) {
      console.log("graffiti wall")
      this.graffitiDrawing = true
      this.isClicking = true
      this.draw('brush', pointer.worldX - scene[name].x + (width/2), pointer.worldY - scene[name].y + (height/2), 1, color)
    })

    rt.on('pointermove', function (pointer) {
      if (pointer.isDown) {
        this.graffitiDrawing = true
        this.isClicking = true
        this.draw('brush', pointer.worldX - scene[name].x + (width/2), pointer.worldY - scene[name].y + (height/2), 1, color)
      }
    })

    rt.on('pointerup', function (pointer) {
      this.graffitiDrawing = false
    })


    scene[name].x = x 
    scene[name].y = y
  }
}

export default new GraffitiWall()