import { Scene3D, THREE } from "@enable3d/phaser-extension";
export default class location7_Scene extends Scene3D {
  platform;
  avatar;
  avatarImage;
  keys;
  zooming;

  objects;

  box;
  cone;
  cylinder;
  sphere;

  message;
  messageFlag;

  constructor() {
    super("location7_Scene");
  }

  init() {
    this.accessThirdDimension({ gravity: { x: 0, y: 0, z: 0 } });
  }

  preload() {
    this.third.load.preload("ground", "./assets/background_location7.jpg");
    this.third.load.preload("avatar", "./assets/paper.jpg");
    this.third.load.preload(
      "cubeDots",
      "./assets/art_styles/drawing_painting/7f1d6dec9e811d96eb892a874a1bcb01.jpg"
    );
    this.third.load.preload(
      "vertical",
      "./assets/art_styles/drawing_painting/87b2481918d9c9491c9b998008a2053c.jpg"
    );
    this.third.load.preload(
      "egg",
      "./assets/art_styles/drawing_painting/699f77a8e723a41f0cfbec5434e7ac5c.jpg"
    );
    this.third.load.preload(
      "doodle",
      "./assets/art_styles/drawing_painting/e13ad7758c0241352ffe203feffd6ff2.jpg"
    );
  }

  async create() {
    // this.third.physics.debug.enable();
    this.scene.stop("UI_Scene");

    // this disables 3d ground, blue sky and ability to move around the 3d world with mouse
    const { lights } = await this.third.warpSpeed(
      "-ground",
      "-sky",
      "-orbitControls"
    );

    this.zooming = 90;
    // we want the camera to view from top
    this.third.camera.position.set(0, this.zooming, 0);
    this.third.camera.lookAt(0, 0, 0);

    this.third.load
      .texture("ground")
      .then((ground) => (this.third.scene.background = ground));

    this.platform = this.third.physics.add.box(
      {
        name: "platform",
        width: 300,
        depth: 300,
        height: 1,
        mass: 0,
        y: -1,
      },
      {
        phong: { color: "white" },
      }
    );

    // adding avatar to the world
    this.avatarImage = await this.third.load.texture("avatar");
    const geometry = new THREE.PlaneGeometry(15, 15, 1, 1);
    const material = new THREE.MeshLambertMaterial({
      map: this.avatarImage,
    });
    this.avatar = new THREE.Mesh(geometry, material);
    this.avatar.material.side = THREE.DoubleSide;
    this.avatar.castShadow = true;
    this.avatar.position.set(0, 1, 0);
    this.avatar.rotation.x = Math.PI / 2;

    this.third.add.existing(this.avatar);
    this.third.physics.add.existing(this.avatar, {
      collisionFlags: 4,
    });

    this.avatar.body.on.collision((building, event) => {
      if (building.name === "location1") {
        this.showMessage(building.name);
      }
      if (building.name === "location2") {
        this.showMessage(building.name);
      }
      if (building.name === "location3") {
        this.showMessage(building.name);
      }
      if (building.name === "location4") {
        this.showMessage(building.name);
      }
    });

    this.addGroundPicture("vertical", 30, 30);
    this.addGroundPicture("cubeDots", -30, 30);
    this.addGroundPicture("egg", 30, -30);
    this.addGroundPicture("doodle", -30, -30);

    // inner objects
    this.objects = [
      this.third.physics.add.box({
        name: "location1",
        x: -30,
        y: 0,
        z: -30,
        width: 8,
        height: 5,
        depth: 8,
      }),
      this.third.physics.add.cone({
        name: "location2",
        x: 30,
        y: 1,
        z: -30,
        radius: 2,
      }),
      this.third.physics.add.cylinder({
        name: "location3",
        x: -30,
        y: 2,
        z: 30,
        radiusTop: 2.5,
        radiusBottom: 2.5,
        height: 2,
      }),
      this.third.physics.add.sphere({
        name: "location4",
        x: 30,
        y: 2,
        z: 30,
        radius: 2,
      }),
      this.third.physics.add.box(
        {
          x: -30,
          y: 1,
          z: -30,
          width: 16,
          height: 10,
          depth: 16,
        },
        { lambert: { color: "darkblue" } }
      ),
      this.third.physics.add.sphere(
        { x: 30, y: 1, z: 30, radius: 10 },
        { lambert: { color: "green" } }
      ),
      this.third.physics.add.cylinder(
        {
          x: -30,
          y: 1,
          z: 30,
          radiusTop: 8,
          radiusBottom: 8,
          height: 5,
        },
        { lambert: { color: "red" } }
      ),
      this.third.physics.add.cone(
        { x: 30, y: 2, z: -30, radius: 10 },
        { lambert: { color: "gray" } }
      ),
    ];

    this.objects.forEach((object) => {
      object.body.setCollisionFlags(4);
    });

    // zoom buttons
    let width = this.sys.game.canvas.width;
    let height = this.sys.game.canvas.height - 60;

    this.zoom = this.add
      .image(width / 10 + 40, height / 50, "ui_magnifier")
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

  async addGroundPicture(image, x, z) {
    const picture = await this.third.load.texture(image);
    const coords = new THREE.PlaneGeometry(50, 50, 1, 1);
    const source = new THREE.MeshLambertMaterial({
      map: picture,
    });
    const settings = new THREE.Mesh(coords, source);

    // other objects can't move this object
    settings.geometry.attributes.position.dynamic = true;

    settings.material.side = THREE.DoubleSide;
    settings.receiveShadow = true;
    settings.position.set(x, 0, z);
    settings.rotation.x = Math.PI / 2;
    this.third.add.existing(settings);
    this.third.physics.add.existing(settings);
  }

  showMessage(sceneName) {
    let width = this.sys.game.canvas.width;
    let height = this.sys.game.canvas.height;
    this.messageFlag = sceneName;

    this.message = this.add
      .text(width / 2, height / 2, `Go to ${sceneName}`, {
        fontFamily: "Arial",
        fontSize: "22px",
      })
      .setOrigin(1)
      .setShadow(1, 1, "#000", 1)
      .setDepth(1000)
      .setInteractive()
      .setVisible(true);

    // go to the respective scene on click
    this.message.on("pointerup", () => {
      console.log(`has gone to ${sceneName}`);
      this.scene.stop();
      this.scene.start(`${sceneName}_Scene`);
    });
  }

  update() {
    if (this.avatar && this.avatar.body) {
      // if (
      //   this.messageFlag == "location1" ||
      //   this.messageFlag == "location2" ||
      //   this.messageFlag == "location3" ||
      //   this.messageFlag == "location4"
      // ) {
      //   this.message.setVisible(false);
      // }

      const speed = 15;
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
