import { Scene3D } from "@enable3d/phaser-extension";
export default class Location7Scene extends Scene3D {
  objects;
  constructor() {
    super("location7_Scene");
  }

  init() {
    this.accessThirdDimension();
  }

  preload() {
    this.third.load.preload(
      "ground",
      "./assets/art_styles/landscape/c27971221b721283988c3be1975a4901.jpg"
    );
  }

  create() {
    // this disables 3d ground, blue sky and ability to move around the 3d world with mouse
    this.third.warpSpeed("-ground", "-sky", "-orbitControls");

    this.third.camera.position.set(0, 30, 0);
    this.third.camera.lookAt(0, 0, 0);

    this.third.load
      .texture("ground")
      .then((ground) => (this.third.scene.background = ground));

    this.objects = [
      // we can change Y to make a feeling of the object being higher or lower of other ones
      this.third.add.box({ x: -10, y: 10, z: 0 }),
      this.third.add.cylinder({
        x: 4,
        y: 15,
        z: -5,
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
