class translateCoordinates {
    constructor() {
    }

    artworldVectorToPhaser2D(scene, positionVector) {
        const worldSizeX = scene.worldSize.x
        const worldSizeY = scene.worldSize.y

        positionVector.x = positionVector.x + (worldSizeX / 2)
        positionVector.y = positionVector.y + (worldSizeX / 2)
        return positionVector 
    }

    Phaser2DVectorToArtworld(scene, x, y) {
        const worldSizeX = scene.worldSize.x
        const worldSizeY = scene.worldSize.y

        positionVector.x = positionVector.x - (worldSizeX / 2)
        positionVector.y = positionVector.y - (worldSizeX / 2)
        return positionVector 
    }

    //single value calculation
    artworldToPhaser2D(scene, a) {   
        const worldSizeX = scene.worldSize.x
        const worldSizeY = scene.worldSize.y

        a = a + (worldSizeX / 2)
        
        return a 
    }

    //single value calculation
    Phaser2DToArtworld(scene, a) {
        const worldSizeX = scene.worldSize.x
        const worldSizeY = scene.worldSize.y

        a = a - (worldSizeX / 2)
        
        return a 
    }
}

export default new translateCoordinates()