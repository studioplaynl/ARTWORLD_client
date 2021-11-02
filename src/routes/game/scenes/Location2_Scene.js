import { Scene3D, ExtendedObject3D } from "@enable3d/phaser-extension";
import i18next from "i18next";
import { locale } from "svelte-i18n";

let latestValue = null;
export default class Location2Scene extends Scene3D {
  back;
  zoomingDistance;

  constructor() {
    super("location2_Scene");
    this.move = { x: 0, y: 0, z: 0 };
  }

  init() {
    this.accessThirdDimension();
  }

  async create() {
    this.scene.stop("UI_Scene");

    let width = this.sys.game.canvas.width;
    let height = this.sys.game.canvas.height - 60;

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

    this.back = this.add
      .text(width / 10 - 120, height / 10, `${i18next.t("back")}`, {
        fontFamily: "Arial",
        fontSize: "22px",
      })
      .setOrigin(0)
      .setShadow(1, 1, "#000000", 1)
      .setDepth(1000)
      .setInteractive();

    this.back.on("pointerup", () => {
      this.scene.start("location1_Scene");
    });

    const { ground } = await this.third.warpSpeed("-orbitControls");

    this.zoomingDistance = 30;

    this.third.camera.position.set(0, this.zoomingDistance, 0);
    this.third.camera.lookAt(0, 0, 0);

    this.robot = new ExtendedObject3D();
    const pos = { x: 3, y: 2, z: -7 };

    this.zoomIn = this.add
      .text(width / 10 + 80, height / 40, `${i18next.t("in")}`, {
        fontFamily: "Arial",
        fontSize: "24px",
      })
      .setOrigin(0)
      .setShadow(1, 1, "#000000", 0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true });

    this.zoomOut = this.add
      .text(width / 10 + 160, height / 40, `${i18next.t("out")}`, {
        fontFamily: "Arial",
        fontSize: "24px",
      })
      .setOrigin(0)
      .setShadow(1, 1, "#000000", 0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true });

    this.zoomIn.on("pointerup", () => {
      this.third.camera.position.set(0, (this.zoomingDistance -= 10), 0);
    });

    this.zoomOut.on("pointerup", () => {
      this.third.camera.position.set(0, (this.zoomingDistance += 10), 0);
    });

    const sensor = this.third.physics.add.box(
      {
        x: pos.x - 4,
        y: pos.y - 0.5,
        z: pos.z - 2,
        width: 0.5,
        height: 3,
        depth: 0.5,
        collisionFlags: 1, // set the flag to static
        mass: 0.001,
      },
      { lambert: { color: 0xff00ff, transparent: true, opacity: 0.2 } }
    );
    sensor.castShadow = sensor.receiveShadow = false;

    this.third.load.fbx("/assets/fbx/Idle.fbx").then((object) => {
      // set the flag to ghost
      sensor.body.setCollisionFlags(4);

      this.robot.add(object);

      this.third.animationMixers.add(this.robot.anims.mixer);

      this.robot.anims.add("Idle", object.animations[0]);
      this.robot.anims.play("Idle");

      this.robot.traverse((child) => {
        if (child.isMesh) child.castShadow = child.receiveShadow = true;
      });

      this.robot.scale.set(0.02, 0.02, 0.02);
      this.robot.position.set(pos.x, pos.y, pos.z);
      this.robot.rotation.set(0, -Math.PI / 2, 0);

      this.third.add.existing(this.robot);
      this.third.physics.add.existing(this.robot, {
        shape: "box",
        ignoreScale: true,
        width: 1,
        depth: 1,
        offset: { y: -0.5 },
      });

      this.third.physics.add.constraints.lock(this.robot.body, sensor.body);

      this.third.physics.add.collider(sensor, ground, (event) => {
        // console.log(event)
        if (event === "end") this.robot.body.setAngularVelocityY(5);
        else this.robot.body.setAngularVelocityY(0);
      });

      // load Walking animations
      this.third.load.fbx(`/assets/fbx/Walking.fbx`).then((object) => {
        console.log("loaded");
        this.robot.anims.add("Walking", object.animations[0]);
        this.robot.anims.play("Walking");
      });
    });
  }

  update() {
    if (this.robot && this.robot.body) {
      const speed = 4;
      const rotation = this.robot.getWorldDirection(
        this.robot.rotation.toVector3()
      );
      const theta = Math.atan2(rotation.x, rotation.z);

      const x = Math.sin(theta) * speed,
        y = this.robot.body.velocity.y,
        z = Math.cos(theta) * speed;

      this.robot.body.setVelocity(x, y, z);
    }
  }
}
