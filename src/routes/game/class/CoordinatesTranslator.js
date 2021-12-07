class CoordinatesTranslator {
    constructor() {
    }

    artworldVectorToPhaser2D(worldSize, positionVector) {
        const worldSizeX = worldSize.x
        const worldSizeY = worldSize.y

        positionVector.x = positionVector.x + (worldSizeX / 2)
        positionVector.y = positionVector.y + (worldSizeY / 2)
        return positionVector
    }

    Phaser2DVectorToArtworld(worldSize, x, y) {
        // usage: 
        // pass the worldSize and the coordinates you want to do the calculation on
        // output is a Vector

        const worldSizeX = worldSize.x
        const worldSizeY = worldSize.y

        positionVector.x = positionVector.x - (worldSizeX / 2)
        positionVector.y = positionVector.y - (worldSizeY / 2)
        return positionVector
    }

    //single value calculation
    artworldToPhaser2D(worldAxis, a) {
        // usage: 
        // pass the worldSize.x or worldSize.y and the coordinate you want to do the calculation on
        a = a + (worldAxis / 2)

        return a
    }

    //single value calculation
    Phaser2DToArtworld(worldAxis, a) {
        // usage: 
        // pass the worldSize.x or worldSize.y and the coordinate you want to do the calculation on

        a = a - (worldAxis / 2)

        return a
    }
}

export default new CoordinatesTranslator()