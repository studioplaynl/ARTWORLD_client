import { uploadImage } from "../../../api.js"
import ManageSession from "../ManageSession"

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

    let rt = scene.add.renderTexture(-(width / 2), -(height / 2), width, height).setInteractive().setDepth(199).setName(name)
    scene[name].add(rt)
    scene[name].setSize(width + 40, height + 40)


    scene.input.keyboard.on('keydown-' + 'SPACE', function () {
      rt.clear()
    })

    rt.on('pointerdown', function (pointer) {
      console.log("graffiti wall")
      this.graffitiDrawing = true
      this.isClicking = true
      var hsv = Phaser.Display.Color.HSVColorWheel()
      var i = color
      console.log("hsv[i].color", hsv[i].color)
      
      this.draw('brush', pointer.worldX - scene[name].x + (width / 2), pointer.worldY - scene[name].y + (height / 2), 1, hsv[i].color)
    })

    rt.on('pointermove', function (pointer) {
      if (pointer.isDown) {
        this.graffitiDrawing = true
        this.isClicking = true
        var hsv = Phaser.Display.Color.HSVColorWheel()
        var i = color

        this.draw('brush', pointer.worldX - scene[name].x + (width / 2), pointer.worldY - scene[name].y + (height / 2), 1, hsv[i].color)
      }
    })

    rt.on('pointerup', function (pointer) {
      this.graffitiDrawing = false

      // rt.snapshot(async (image) => {

      //   const displayName = "testRenderTexture"
      //   const name = displayName
      //   const type = "drawing"
      //   const json = ""
      //   const status = "zichtbaar"
      //   const version = 1
      //   console.log("image", image.src)

      //   var blobData = await dataURItoBlob(image.src)
      //   uploadImage(name, type, json, blobData, status, version, displayName)
      // })

    }, this)


    scene[name].x = x
    scene[name].y = y
  }
}

function dataURItoBlob(dataURI) {
  var binary = atob(dataURI.split(",")[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: "image/png" });
}

export default new GraffitiWall()