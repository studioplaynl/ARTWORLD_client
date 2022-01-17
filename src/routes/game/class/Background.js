import { RGBA_ASTC_10x10_Format } from "three"

class Background {
    constructor(config) {
    }

    repeatingDots(config) {
        //fill in textures
        //get world size
        const scene = config.scene

        const worldSize = config.scene.worldSize

        ///*........... white background of worldSize*2 width .............................................................
        scene.add.rectangle(0, 0, worldSize.x * 2, worldSize.y * 2, config.backgroundColor)

        //*........... repeating pattern on the white background .............................................................
        const gridWidth = worldSize.x
        const offset = config.gridOffset

        //......... repeating dots as pattern on white background .............................................................
        //background dot size
        let dotWidth = config.dotWidth

        //create the dot: graphics
        let bgDot = scene.add.graphics()
        bgDot.fillStyle(0x909090);
        bgDot.fillCircle(dotWidth, dotWidth, dotWidth).setVisible(false)

        //create renderTexture to place the dot on
        let bgDotRendertexture = scene.add.renderTexture(0, 0, dotWidth * 2, dotWidth * 2)

        //draw the dot on the renderTexture
        bgDotRendertexture.draw(bgDot)

        //save the rendertexture with a key ('dot')
        bgDotRendertexture.saveTexture('dot')

        // destroy the bgDot graphic and renderTexture
        bgDot.destroy()
        bgDotRendertexture.destroy()


        //repeat this savend texture over the background
        for (let i = 0; i < gridWidth; i += offset) {
            for (let j = 0; j < gridWidth; j += offset) {
                scene.add.image(i, j, 'dot').setOrigin(0)
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

        //save the rendertexture with a key 
        rt2.saveTexture(name)
        scene.add.image(posX, posY, name).setOrigin(0.5).setScale(1)

        console.log(name)
        
        rt2.destroy()
        rt1.destroy()
        eraser.destroy()
        rectangle.destroy()
    }
}

export default new Background();