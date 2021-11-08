import { Scene3D, THREE } from "@enable3d/phaser-extension";
export default class Location7Scene extends Scene3D {
  platform;
  avatar;
  keys;
  objects;
  zooming;

  constructor() {
    super("location7_Scene");
  }

  init() {
    this.accessThirdDimension({ gravity: { x: 0, y: -20, z: 0 } });
  }

  preload() {
    this.third.load.preload("ground", "./assets/background_location7.jpg");
  }

  async create() {
    this.third.physics.debug.enable();
    this.scene.stop("UI_Scene");

    // this disables 3d ground, blue sky and ability to move around the 3d world with mouse
    const { lights } = await this.third.warpSpeed(
      "-ground",
      "-sky",
      "-orbitControls"
    );

    this.zooming = 60;
    // we want the camera to view from top
    this.third.camera.position.set(0, this.zooming, 0);
    this.third.camera.lookAt(0, 0, 0);

    this.third.load
      .texture("ground")
      .then((ground) => (this.third.scene.background = ground));

    this.platform = this.third.physics.add.box(
      {
        name: "platform",
        width: 120,
        depth: 120,
        height: 1,
        mass: 0,
      },
      {
        phong: { color: "darkgreen" },
      }
    );

    // the avatar that one can move around
    this.avatar = this.third.physics.add.box(
      {
        x: -10,
        y: 10,
        width: 5,
        height: 3,
        depth: 5,
        mass: 1,
        collisionFlags: 0,
      },
      { lambert: { color: "blue" } }
    );

    // A list of objects
    this.objects = [
      this.third.physics.add.box(
        {
          x: -10,
          y: 1,
          z: 15,
          width: 4,
          height: 3,
          depth: 3,
        },
        { lambert: { color: "darkblue" } }
      ),
      this.third.physics.add.cylinder(
        {
          x: 4,
          y: 6,
          z: 0,
          radiusTop: 5,
          radiusBottom: 5,
          height: 1,
        },
        { lambert: { color: "red" } }
      ),
      this.third.physics.add.box(
        {
          x: 20,
          y: 2,
          z: 3,
          width: 10,
          height: 4,
          depth: 10,
          mass: 1,
        },
        { lambert: { color: "yellow" } }
      ),

      this.third.physics.add.sphere(
        { x: -20, y: 2, z: 10, radius: 5 },
        { lambert: { color: "green" } }
      ),
      this.third.physics.add.cylinder({
        x: -10,
        y: 2,
        z: -10,
        radiusTop: 5,
        radiusBottom: 5,
        height: 10,
      }),
    ];

    // we are giving the objects Kinematic, so that they stay where they are.
    // these objects do NOT react to force or gravity
    this.objects.forEach((object) => {
      object.body.setCollisionFlags(2);
    });

    // zoom buttons
    let width = this.sys.game.canvas.width;
    let height = this.sys.game.canvas.height - 60;

    this.zoom = this.add
      .image(width / 10 + 40, height / 50, "ui_eye")
      .setOrigin(0)
      .setDepth(1000)
      .setScale(width / width / 8);

    this.zoomIn = this.add
      .image(width / 10 + 120, height / 40, "ui_magnifier_plus")
      .setOrigin(0)
      .setDepth(1000)
      .setScale(width / width / 6)
      .setInteractive({ useHandCursor: true });

    this.zoomOut = this.add
      .image(width / 10, height / 40, "ui_magnifier_minus")
      .setOrigin(0)
      .setDepth(1000)
      .setScale(width / width / 6)
      .setInteractive({ useHandCursor: true });

    this.zoomIn.on("pointerup", () => {
      this.third.camera.position.set(0, (this.zooming -= 10), 0);
    });

    this.zoomOut.on("pointerup", () => {
      this.third.camera.position.set(0, (this.zooming += 10), 0);
    });

    // keys of keyboard that are used to move the avatar
    this.keys = {
      up: this.input.keyboard.addKey("w"),
      left: this.input.keyboard.addKey("a"),
      down: this.input.keyboard.addKey("s"),
      right: this.input.keyboard.addKey("d"),
    };
  }

  update() {
    if (this.avatar && this.avatar.body) {
      const speed = 10;

      // stop any further movement;
      this.avatar.body.setVelocityX(0);
      this.avatar.body.setVelocityZ(0);

      // fix the camera on the moving object
      this.third.camera.position
        .copy(this.avatar.position)
        .add(new THREE.Vector3(0, this.zooming, 0));

      // keys for moving the object
      if (this.keys.left.isDown) {
        this.avatar.body.setVelocityX(-speed);
      }
      if (this.keys.right.isDown) {
        this.avatar.body.setVelocityX(speed);
      }
      if (this.keys.up.isDown) {
        this.avatar.body.setVelocityZ(-speed);
      }
      if (this.keys.down.isDown) {
        this.avatar.body.setVelocityZ(speed);
      }
    }
  }
}
