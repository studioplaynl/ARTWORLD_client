import { Scene3D } from "@enable3d/phaser-extension";

export default class Location2Scene extends Scene3D {
  constructor() {
    super("location2_Scene");
  }

  init() {
    this.accessThirdDimension();
  }

  create() {
    this.third.warpSpeed("light", "orbitControls", "sky");

    this.objects = [
      this.third.add.box({ x: -4, y: 0, z: 0 }),
      this.third.add.sphere({ x: -2, y: 0, z: 0, radius: 0.5 }),
      this.third.add.sphere({
        x: 0,
        y: 0,
        z: 0,
        radius: 0.5,
        widthSegments: 6,
        heightSegments: 4,
      }),
      this.third.add.sphere(
        { x: 2, y: 0, z: 0, radius: 0.5, phiLength: Math.PI },
        { lambert: { side: 2 } }
      ),
      this.third.add.cylinder({
        x: 4,
        y: 0,
        z: 0,
        radiusTop: 0.5,
        radiusBottom: 0.5,
        height: 1,
      }),
    ];
  }

  update() {
    this.objects.forEach((obj) => {
      obj.rotation.x += 0.01;
      obj.rotation.y += 0.01;
    });
  }
}
