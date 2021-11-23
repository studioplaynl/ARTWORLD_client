import { Scene3D, THREE } from "@enable3d/phaser-extension";
import i18next from "i18next";
import { locale } from "svelte-i18n";

let latestValue = null;
export default class Location7Scene extends Scene3D {
  platform;
  avatar;
  avatarImage;
  keys;
  zooming;

  buildings;

  entranceMessage;

  width;
  height;

  chosenScene;

  back;

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
    this.third.load.preload(
      "repetition",
      "./assets/art_styles/repetition/b17b86ac876ea7bed716fb3d0465b2f2.jpg"
    );
  }

  async create() {
    this.scene.stop("UI_Scene");

    // this disables 3d ground, blue sky and ability to move around the 3d world with mouse
    const { lights } = await this.third.warpSpeed(
      "-ground",
      "-sky",
      "-orbitControls"
    );

    this.zooming = 90;
    // view from top
    this.third.camera.position.set(0, this.zooming, 0);
    this.third.camera.lookAt(0, 0, 0);

    // the main platform
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
        y: 0,
      },
      {
        phong: { color: "white" },
      }
    );

    // adding avatar to the world
    this.avatarImage = await this.third.load.texture("avatar");
    const geometry = new THREE.PlaneGeometry(10, 10, 1, 1);
    const material = new THREE.MeshLambertMaterial({
      map: this.avatarImage,
    });
    this.avatar = new THREE.Mesh(geometry, material);
    this.avatar.material.side = THREE.DoubleSide;
    this.avatar.castShadow = true;
    this.avatar.position.set(0, 1.1, 0);
    this.avatar.rotation.x = Math.PI / 2;
    this.third.add.existing(this.avatar);
    this.third.physics.add.existing(this.avatar, {
      collisionFlags: 4,
    });

    // adding ground images
    this.addGroundPicture("vertical", 30, 30);
    this.addGroundPicture("cubeDots", -30, 30);
    this.addGroundPicture("egg", 30, -30);
    this.addGroundPicture("doodle", -30, -30);
    this.addGroundPicture("repetition", 90, -30);

    // adding 3d objects as buildings
    this.buildings = [
      this.third.physics.add.box({
        name: "location1",
        x: -30,
        y: 1,
        z: -30,
        width: 16,
        height: 5,
        depth: 16,
      }),
      this.third.physics.add.cone({
        name: "location2",
        x: 30,
        y: 1,
        z: -30,
        radius: 10,
      }),
      this.third.physics.add.cylinder({
        name: "location3",
        x: -30,
        y: 1,
        z: 30,
        radiusTop: 6,
        radiusBottom: 6,
        height: 2,
      }),
      this.third.physics.add.sphere({
        name: "location4",
        x: 30,
        y: 1,
        z: 30,
        radius: 6,
      }),
      this.third.physics.add.box({
        name: "location5",
        x: 90,
        y: 1,
        z: -30,
        width: 16,
        height: 5,
        depth: 16,
      }),
    ];

    // making buildings static
    this.buildings.forEach((object) => {
      object.body.setCollisionFlags(1);
    });

    // zoom buttons
    this.width = this.sys.game.canvas.width;
    this.height = this.sys.game.canvas.height;

    this.zoom = this.add
      .image(this.width / 10 + 40, (this.height - 60) / 50, "ui_eye")
      .setOrigin(0)
      .setDepth(1000)
      .setScale(this.width / this.width / 8);

    this.zoomIn = this.add
      .image(
        this.width / 10 + 120,
        (this.height - 60) / 40,
        "ui_magnifier_plus"
      )
      .setOrigin(0)
      .setDepth(1000)
      .setScale(this.width / this.width / 6)
      .setInteractive({ useHandCursor: true });

    this.zoomOut = this.add
      .image(this.width / 10, (this.height - 60) / 40, "ui_magnifier_minus")
      .setOrigin(0)
      .setDepth(1000)
      .setScale(this.width / this.width / 6)
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

    // detecting collision of the avatar with buildings and displaying a respective message
    this.avatar.body.on.collision((building, event) => {
      if (building.name === "location1") {
        this.displayLocationEntrance(building.name, event);
      }
      if (building.name === "location2") {
        this.displayLocationEntrance(building.name, event);
      }
      if (building.name === "location3") {
        this.displayLocationEntrance(building.name, event);
      }
      if (building.name === "location4") {
        this.displayLocationEntrance(building.name, event);
      }
      if (building.name === "location5") {
        this.displayLocationEntrance(building.name, event);
      }
    });

    // entrance message's visibility by default is set to false
    this.entranceMessage = this.add
      .text(this.width / 2, this.height / 2, ``, {
        fontFamily: "Arial",
        fontSize: "22px",
      })
      .setOrigin(1)
      .setShadow(1, 1, "#000", 1)
      .setDepth(1000)
      .setInteractive()
      .setVisible(false);

    // switch to the respective location on click
    this.entranceMessage.on("pointerup", () => {
      this.scene.stop();
      this.scene.start(`${this.chosenScene}_Scene`);
    });

    // detecting the change of language
    let countDisplay = 0;
    locale.subscribe((value) => {
      if (countDisplay === 0) {
        countDisplay++;
        return;
      }
      if (countDisplay > 0) {
        i18next.changeLanguage(value);
      }
      if (latestValue !== value) {
        this.scene.restart();
      }
      latestValue = value;
    });

    // back button to go to location1
    this.back = this.add
      .text(this.width / 10 - 120, this.height / 10, `${i18next.t("back")}`, {
        fontFamily: "Arial",
        fontSize: "22px",
      })
      .setOrigin(0)
      .setShadow(1, 1, "#000000", 1)
      .setDepth(1000)
      .setInteractive();

    this.back.on("pointerup", () => {
      this.scene.switch("location1_Scene");
    });
  }

  async addGroundPicture(image, x, z) {
    const picture = await this.third.load.texture(image);
    const coords = new THREE.PlaneGeometry(50, 50, 1, 1);
    const source = new THREE.MeshLambertMaterial({
      map: picture,
    });
    const settings = new THREE.Mesh(coords, source);
    settings.material.side = THREE.DoubleSide;
    settings.receiveShadow = true;
    settings.position.set(x, 1, z);
    settings.rotation.x = Math.PI / 2;
    this.third.add.existing(settings);
    this.third.physics.add.existing(settings, {
      collisionFlags: 1,
    });
  }

  displayLocationEntrance(sceneName, event) {
    this.chosenScene = sceneName;
    // while being inside of the building, show the entrance message
    if (event === "start" || event === "collision") {
      this.entranceMessage.setText(`Go to ${sceneName}`).setVisible(true);
      // go to the respective scene on click
    }
    // once outside of the building, hide the message
    if (event === "end") {
      this.entranceMessage.setVisible(false);
    }
  }

  update() {
    if (this.avatar && this.avatar.body) {
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
