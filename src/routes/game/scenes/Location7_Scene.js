import { enable3d, Scene3D, Canvas, THREE } from "@enable3d/phaser-extension";

export default class Location7Scene extends Scene3D {
  direction;
  background;

  constructor() {
    super("location7_Scene");
  }

  init() {
    this.accessThirdDimension();
  }

  preload() {}

  async create() {
    // await this.third.warpSpeed("-orbitControls");
    // this.third.camera.position.set(0, 30, 0);
    // console.log(ground);
    // ground.geometry.parameters.depthSegments = 0;
    // // depth = 0;
    // height = 100;
    // width = 100;
    // this.direction = new THREE.Vector3();
    // Some "native" three.js code
    // const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    // const material = new THREE.MeshLambertMaterial({ color: 0x2194ce });
    // const cube = new THREE.Mesh(geometry, material);
    // cube.position.set(1, 1, 1);
    // We set shape manually to 'box' that enable3d is aware of the shape
    // cube.shape = "box";
    // Add cube to the scene
    // this.third.add.existing(cube);
  }

  update() {}
}
