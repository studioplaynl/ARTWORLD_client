import { Scene3D, ExtendedObject3D } from "@enable3d/phaser-extension";
import ManageSession from "../ManageSession"

export default class Location2Scene extends Scene3D {

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
    ManageSession.currentLocation = this.scene.key;

    const { ground } = await this.third.warpSpeed("-orbitControls");

    this.robot = new ExtendedObject3D();
    const pos = { x: 3, y: 2, z: -7 };

    this.addBackButton()

    this.addZoomingButtons()

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

  addBackButton() {
    this.backButton = this.add.image(40, 40, "back_button")
      .setOrigin(0, 0.5)
      .setDepth(1000)
      .setScale(0.075)
      .setInteractive({ useHandCursor: true });
    
    this.backButton.on("pointerup", () => {
      const currentLocation = ManageSession.currentLocation.split("_");
      ManageSession.socket.rpc("leave", currentLocation[0])

      const previousLocation = ManageSession.previousLocation.split("_")
      const targetScene = this.scene.get(ManageSession.previousLocation)

      targetScene.player.location = previousLocation[0]

      setTimeout(() => {

        ManageSession.location = previousLocation[0]
        ManageSession.createPlayer = true
        ManageSession.getStreamUsers("join", previousLocation[0])
        this.scene.stop(ManageSession.currentLocation)

        this.scene.start(ManageSession.previousLocation)

      }, 500)
    });
  }

  async addZoomingButtons() {
    this.zooming = 90;
    // view from top
    this.third.camera.position.set(0, this.zooming, 0);
    this.third.camera.lookAt(0, 0, 0);
    // zoom buttons
    this.width = this.sys.game.canvas.width;
    this.height = this.sys.game.canvas.height;

    this.zoomOut = this.add
      .image(60 + 40, 40, "ui_magnifier_minus")
      .setOrigin(0, 0.5)
      .setDepth(1000)
      .setScale(0.175)
      .setInteractive({ useHandCursor: true });

    this.zoom = this.add
      .image(60 + 80, 40, "ui_eye")
      .setOrigin(0, 0.5)
      .setDepth(1000)
      .setScale(0.125);

    this.zoomIn = this.add
      .image(60 + 160, 40, "ui_magnifier_plus")
      .setOrigin(0, 0.5)
      .setDepth(1000)
      .setScale(0.175)
      .setInteractive({ useHandCursor: true });

    this.zoomIn.on("pointerup", () => {
      this.third.camera.position.set(0, (this.zooming -= 10), 0);
    });

    this.zoomOut.on("pointerup", () => {
      this.third.camera.position.set(0, (this.zooming += 10), 0);
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
