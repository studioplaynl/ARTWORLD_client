class background {
    constructor(config) {
    }

    repeatingDots(config) {
        //fill in textures
        //get world size
        const scene = config.scene

        const worldSize = config.scene.worldSize
        ///*........... white background of 6000x6000 pix .............................................................
        scene.add.rectangle(0, 0, worldSize.x, worldSize.y, config.backgroundColor)

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

        //create renderTexture
        let bgDotRendertexture = scene.add.renderTexture(0, 0, dotWidth * 2, dotWidth * 2)

        //draw gaphics to renderTexture
        bgDotRendertexture.draw(bgDot)

        //save the rendertexture with a key ('dot')
        let t = bgDotRendertexture.saveTexture('dot');

        for (let i = 0; i < gridWidth; i += offset) {
            for (let j = 0; j < gridWidth; j += offset) {
                scene.add.image(i, j, 'dot').setOrigin(0);
            }
        }
    }
}

export default new background();