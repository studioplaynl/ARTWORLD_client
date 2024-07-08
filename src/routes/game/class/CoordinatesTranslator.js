import * as Phaser from 'phaser';

const CoordinatesTranslator = {
  artworldVectorToPhaser2D(worldSize, _positionVector) {
    const worldSizeX = worldSize.x;
    const worldSizeY = worldSize.y;
    const positionVector = new Phaser.Math.Vector2(
      _positionVector.x,
      _positionVector.y,
    );

    positionVector.x += worldSizeX / 2;
    positionVector.y = worldSizeY / 2 - positionVector.y;
    return positionVector;
  },

  artworldToPhaser2DX(worldAxis, a) {
    return a + worldAxis / 2;
  },

  artworldToPhaser2DY(worldAxis, a) {
    return worldAxis / 2 - a;
  },

  phaser2DVectorToArtworld(worldSize, _positionVector) {
    const worldSizeX = worldSize.x;
    const worldSizeY = worldSize.y;
    const positionVector = new Phaser.Math.Vector2(
      _positionVector.x,
      _positionVector.y,
    );

    positionVector.x -= worldSizeX / 2;
    positionVector.y = -(positionVector.y - worldSizeY / 2);
    return positionVector;
  },

  phaser2DToArtworldX(worldAxis, a) {
    return a - worldAxis / 2;
  },

  phaser2DToArtworldY(worldAxis, a) {
    return -(a - worldAxis / 2);
  }
};

export default CoordinatesTranslator;
