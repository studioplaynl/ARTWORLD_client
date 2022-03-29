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
      this.draw('brush', pointer.worldX - scene[name].x + (width / 2), pointer.worldY - scene[name].y + (height / 2), 1, color)
    })

    rt.on('pointermove', function (pointer) {
      if (pointer.isDown) {
        this.graffitiDrawing = true
        this.isClicking = true
        this.draw('brush', pointer.worldX - scene[name].x + (width / 2), pointer.worldY - scene[name].y + (height / 2), 1, color)
      }
    })

    rt.on('pointerup', function (pointer) {
      //scene = ManageSession.currentScene

      this.graffitiDrawing = false
      console.log("rt", rt)
      //console.log("ManageSession.userProfile.id", ManageSession.userProfile.id)

      rt.renderer.snapshotArea(pointer.x, pointer.y, 800, 400, async function (image) {
        console.log("image", image.src)

        if (rt.scene.textures.exists('area')) {
          rt.scene.textures.remove('area')
        }
        rt.scene.load.image('area', image)
        let testImage = rt.scene.add.image(3000, 3000, "area")
        //this.scene.textures.addImage('area', image)

        console.log('area', testImage)

        // const displayName = "testRenderTexture"
        // const name = displayName
        // const type = "drawing"
        // const json = ""
        // const status = "zichtbaar"
        // const version = 1
        // console.log("image", image.src)

        // var blobData = await dataURItoBlob(image.src)
        // uploadImage(name, type, json, blobData, status, version, displayName)

      }, this)
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