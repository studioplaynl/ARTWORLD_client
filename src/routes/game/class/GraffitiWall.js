import { uploadImage } from "../../../api.js"
import ManageSession from "../ManageSession"

class GraffitiWall {
  constructor() {
  }

  create(scene, x, y, width, height, name, color, imageFile = null) {

    //we name the container as this.[name] so we can reference it later
    scene[name] = scene.add.container()
    scene[name].setSize(width + 10, height + 10)

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

    //make an array with current and previous mouse point, to interpolate between them
    let previousPointer = [] // an array of Vec2 for worldX and worldY
    let points = []


    rt.on('pointermove', function (pointer) {
      if (pointer.isDown) {
        let line1 = new Phaser.Curves.Line([0, 0, 0, 0])
        //var points = pointer.getInterpolatedPosition(30)
        this.graffitiDrawing = true
        this.isClicking = true
        var hsv = Phaser.Display.Color.HSVColorWheel()
        var i = color

        previousPointer.push(new Phaser.Math.Vector2(pointer.worldX, pointer.worldY))  // an array of Vec2 for worldX and worldY

        if (previousPointer.length > 1) {
          //create an array of interpolated points between the first and second entry of the previousPointer array, deleting the first and second entries
          // create a line of previousPointer[0] and previousPointer[1]
          let line1 = new Phaser.Curves.Line([previousPointer[0].x, previousPointer[0].y, previousPointer[1].x, previousPointer[1].y])
          previousPointer.splice(0, 1)

          //get the interpolated points on the line, with interpolation factor
          points = line1.getPoints(16)
        }
        

        points.forEach(function (p) {
          //console.log("p", p)
          rt.draw('brush', p.x - scene[name].x + (width / 2), p.y - scene[name].y + (height / 2), 1, hsv[i].color)
          //rt.draw('brush', p.worldX - scene[name].x + (width / 2), p.worldY - scene[name].y + (height / 2), 1, hsv[i].color)
        })

        // this.draw('brush', pointer.worldX - scene[name].x + (width / 2), pointer.worldY - scene[name].y + (height / 2), 1, hsv[i].color) // old drawing - without interpolation
      }
    })

    rt.on('pointerup', function (pointer) {
      this.graffitiDrawing = false

      //empty the array of previous point when lifting the pointer
      previousPointer = [] 
      points = []
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