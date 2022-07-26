// TODO This should not be a class (no shared data..)!
// Instead each function should be exported as-is.
// So as first step we are removing all CoordinatesTranslator.functionName calls and replacing with
// const { functionName } = CoordinatesTranslator;

class CoordinatesTranslator {
  constructor() {
  }

  artworldVectorToPhaser2D(worldSize, positionVector) {
    // usage:
    // pass the worldSize and the coordinates you want to do the calculation on
    // output is a Vector
    const worldSizeX = worldSize.x;
    const worldSizeY = worldSize.y;

    positionVector.x += (worldSizeX / 2); //* correct
    positionVector.y = (worldSizeY / 2) - positionVector.y; //* correct
    return positionVector;
  }

  // single value calculation
  artworldToPhaser2DX(worldAxis, a) {
    // usage: ONLY FOR X!
    // pass the worldSize.x or worldSize.y and the coordinate you want to do the calculation on
    a += (worldAxis / 2); //* correct

    return a;
  }

  // single value calculation
  artworldToPhaser2DY(worldAxis, a) {
    // usage: ONLY FOR Y!
    // pass the worldSize.x or worldSize.y and the coordinate you want to do the calculation on
    a = (worldAxis / 2) - a; //* correct

    return a;
  }

  // ..........................................................................................................

  Phaser2DVectorToArtworld(worldSize, positionVector) {
    // usage:
    // pass the worldSize and the coordinates you want to do the calculation on
    // output is a Vector
    const worldSizeX = worldSize.x;
    const worldSizeY = worldSize.y;

    positionVector.x -= (worldSizeX / 2); //* correct
    positionVector.y = -(positionVector.y - (worldSizeY / 2)); //* correct
    return positionVector;
  }

  // single value calculation
  Phaser2DToArtworldX(worldAxis, a) {
    // usage: ONLY X!
    // pass the this.worldSize.x or worldSize.y and the coordinate you want to do the calculation on

    a -= (worldAxis / 2); //* correct

    return a;
  }

  // single value calculation
  Phaser2DToArtworldY(worldAxis, a) {
    // usage: ONLY Y!
    // pass the worldSize.x or worldSize.y and the coordinate you want to do the calculation on

    a = -(a - (worldAxis / 2)); //* correct

    return a;
  }
}

export default new CoordinatesTranslator();
