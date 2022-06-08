class Background {
    constructor(config) {
    }

    repeatingDots(config) {
        //fill in textures
        //get world size
        const scene = config.scene

        const worldSize = config.scene.worldSize

        ///*........... white background of worldSize width .............................................................
        scene.add.rectangle(0, 0, worldSize.x, worldSize.y, config.backgroundColor).setOrigin(0)

        //*........... repeating pattern on the white background .............................................................
        const gridWidth = worldSize.x
        const gridHeight = worldSize.y
        const offset = config.gridOffset
        const offsetY = offset / 2

        //......... repeating dots as pattern on white background .............................................................
        //background dot size
        let dotWidth = config.dotWidth

        //create the dot: graphics
        let bgDot = scene.add.graphics()
        bgDot.fillStyle(config.dotColor)
        bgDot.fillCircle(dotWidth, dotWidth, dotWidth).setVisible(false)

        //create renderTexture to place the dot on
        let bgDotRendertexture = scene.add.renderTexture(0, 0, dotWidth * 2, dotWidth * 2)

        //draw the dot on the renderTexture
        bgDotRendertexture.draw(bgDot)

        //save the rendertexture with a key ('dot')
        bgDotRendertexture.saveTexture('dot')

        // destroy the bgDot graphic and renderTexture, because we can reference the dot as 'dot' (prev step)
        bgDot.destroy()
        bgDotRendertexture.destroy()

        //repeat this saved texture over the background
        //console.log("gridWidth/offset", gridWidth / offset)
        for (let i = 0; i < gridWidth / offset; i++) {
            for (let j = 0; j < gridHeight / offsetY; j++) {
                //offset the odd rows by half offset
                if (j % 2 == 0) {
                    scene.add.image(i * offset, j * offsetY, 'dot').setOrigin(0)
                } else {
                    scene.add.image((i * offset) + (offset / 2), j * offsetY, 'dot').setOrigin(0)
                }
            }
        }
    }

    circle(config) {
        //! create renderTexture images on network boot, 
        //! use the image KEYS in the SCENES, that way they don't need to be created each time when entering a scene

        const scene = config.scene
        const posX = config.posX
        const posY = config.posY
        const name = config.name
        // const worldSize = scene.worldSize
        const size = config.size
        const gradient1 = config.gradient1
        const gradient2 = config.gradient2

        //create graphic: a large rectangle
        //out of this rectangle we cut out a circle and with that frame we cut out a circle out of an other rectangle
        let rectangle = scene.add.graphics();
        // rectangle.setVisible(false);
        rectangle.fillGradientStyle(gradient1, gradient1, gradient2, gradient2, 1);
        rectangle.fillRect(0, 0, size, size);

        let rt1 = scene.add.renderTexture(0, 0, size, size);
        let rt2 = scene.add.renderTexture(0, 0, size, size);

        rt1.draw(rectangle);
        rt2.draw(rectangle);

        let eraser = scene.add.circle(0, 0, size / 2, 0x000000)
        // eraser.setVisible(false);

        //erase the circle from the first rect
        rt1.erase(eraser, size / 2, size / 2)

        //erase the rect with the cutout from the second rect, creating the circle with gradient
        rt2.erase(rt1, 0, 0)

        //the center of the renderTexture has offset of (size / 2)
        rt2.x = posX - (size / 2)
        rt2.y = posY - (size / 2)

        // save the rendertexture with a key 
        // and as this.[name] on scene level
        // add name to the scene[name] gameObject

        rt2.saveTexture(name)
        scene[name] = scene.add.image(posX, posY, name).setOrigin(0.5).setScale(1)
        scene[name].name = name
        //console.log(name)

        rt2.destroy()
        rt1.destroy()
        eraser.destroy()
        rectangle.destroy()
    }
}

export default new Background()