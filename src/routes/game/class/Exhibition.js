/* eslint-disable class-methods-use-this */
class Exhibition {
  AbriBig(config) {
    const { scene, posX, posY, name } = config;

    // the container with the name of the config
    scene[name] = scene.add.container();
    scene[name].name = name;

    const billBoardName = `${name}_billBoard`;
    scene[billBoardName] = scene.add.image(0, 0, 'exhibit_outdoor_big'); // the image of the billBoard svg

    scene[name].setSize(
      scene[billBoardName].width,
      scene[billBoardName].height,
    );

    // 1. TopLeft
    // 2. TopRight
    // 3. LeftBottom
    // 4. RightBottom
    const vertices = [
      -0.08, 0.154,

      0.08, 0.062,

      -0.08, -0.051,

      0.08, -0.143,
    ];

    const uvs = [0, 0, 1, 0, 0, 1, 1, 1];

    const indicies = [0, 2, 1, 2, 3, 1];

    const meshName = `${name}_mesh`;
    scene[meshName] = scene.add.mesh(
      -20,
      -80,

      'play',
    );

    // play
    // artFrame_512

    scene[meshName].addVertices(vertices, uvs, indicies);

    // placing the artWork in perspective works with the perspective cam of the mesh
    // this.mesh.setOrtho(orthoRatio, 1) // zooming with neshPanZ doesn't work with Ortho
    scene[meshName].setPerspective(
      scene.sys.game.canvas.width,
      scene.sys.game.canvas.height,
      60,
    );

    // the 'zoom' is dependent on the screen size, this formula works well
    const meshPanZ = (scene.sys.game.canvas.height / 1000) * 2;

    // dlog("meshPanZ", meshPanZ)

    // the name of the mesh is name_mesh
    scene[meshName].panZ(meshPanZ); // pan is zoom level, bigger is smaller, only works with perspective projection
    // x: 0.4154389168615932
    // y: -0.77795430111968
    // z: -0.43183495571265507

    // this.mesh.modelRotation.x = 0.42
    // this.mesh.modelRotation.y = -0.77795430111968
    // this.mesh.modelRotation.z = -0.42

    // const rotateRate = 1
    // const panRate = 1
    // const zoomRate = 4
    scene[name].add([scene[billBoardName], scene[meshName]]);
    scene[name].x = posX;
    scene[name].y = posY;
  }

  AbriSmall1(config) {
    const { scene, posX, posY, name } = config;

    // the container with the name of the config
    scene[name] = scene.add.container();
    scene[name].name = name;

    const billBoardName = `${name}_billBoard`;
    scene[billBoardName] = scene.add.image(0, 0, 'exhibit_outdoor_small1');

    scene[name].setSize(
      scene[billBoardName].width,
      scene[billBoardName].height,
    );

    // 1. TopLeft
    // 2. TopRight
    // 3. LeftBottom
    // 4. RightBottom
    const vertices = [
      -0.08, 0.154,

      0.08, 0.062,

      -0.08, -0.051,

      0.08, -0.143,
    ];

    const uvs = [0, 0, 1, 0, 0, 1, 1, 1];

    const indicies = [0, 2, 1, 2, 3, 1];

    const meshName = `${name}_mesh`;
    scene[meshName] = scene.add.mesh(
      -20,
      -80,

      'play',
    );

    // play
    // artFrame_512

    scene[meshName].addVertices(vertices, uvs, indicies);

    // placing the artWork in perspective works with the perspective cam of the mesh
    // this.mesh.setOrtho(orthoRatio, 1) // zooming with neshPanZ doesn't work with Ortho
    scene[meshName].setPerspective(
      scene.sys.game.canvas.width,
      scene.sys.game.canvas.height,
      60,
    );

    // the 'zoom' is dependent on the screen size, this formula works well
    const meshPanZ = (scene.sys.game.canvas.height / 1000) * 2;

    // dlog("meshPanZ", meshPanZ)

    // the name of the mesh is name_mesh
    scene[meshName].panZ(meshPanZ); // pan is zoom level, bigger is smaller, only works with perspective projection

    scene[name].add([scene[billBoardName], scene[meshName]]);
    scene[name].x = posX;
    scene[name].y = posY;
  }

  AbriSmall2(config) {
    const { scene, posX, posY, name } = config;
    // the container with the name of the config
    scene[name] = scene.add.container();
    scene[name].name = name;

    const billBoardName = `${name}_billBoard`;
    scene[billBoardName] = scene.add.image(0, 0, 'exhibit_outdoor_small2'); // the image of the billBoard svg

    scene[name].setSize(
      scene[billBoardName].width,
      scene[billBoardName].height,
    );

    // 1. TopLeft
    // 2. TopRight
    // 3. LeftBottom
    // 4. RightBottom
    const vertices = [
      -0.03, -0.017,

      0.051, -0.064,

      -0.03, -0.098,

      0.051, -0.145,
    ];

    const uvs = [0, 0, 1, 0, 0, 1, 1, 1];

    const indicies = [0, 2, 1, 2, 3, 1];

    const meshName = `${name}_mesh`;
    scene[meshName] = scene.add.mesh(
      -20,
      -80,

      'play',
    );

    // play
    // artFrame_512

    scene[meshName].addVertices(vertices, uvs, indicies);

    // placing the artWork in perspective works with the perspective cam of the mesh
    // this.mesh.setOrtho(orthoRatio, 1) // zooming with neshPanZ doesn't work with Ortho
    scene[meshName].setPerspective(
      scene.sys.game.canvas.width,
      scene.sys.game.canvas.height,
      60,
    );

    // the 'zoom' is dependent on the screen size, this formula works well
    const meshPanZ = (scene.sys.game.canvas.height / 1000) * 2;

    // dlog("meshPanZ", meshPanZ)

    // the name of the mesh is name_mesh
    scene[meshName].panZ(meshPanZ); // pan is zoom level, bigger is smaller, only works with perspective projection

    scene[name].add([scene[billBoardName], scene[meshName]]);
    scene[name].x = posX;
    scene[name].y = posY;
  }
}

export default new Exhibition();
