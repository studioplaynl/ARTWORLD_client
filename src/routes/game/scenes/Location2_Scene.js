import { Scene3D } from "@enable3d/phaser-extension";
import i18next from "i18next";
import { locale } from "svelte-i18n";


let latestValue = null;
export default class Location2Scene extends Scene3D {

  back;

  constructor() {
    super("location2_Scene");
  }

  init() {
    this.accessThirdDimension();
  }

  create() {
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
        this.scene.start("location1_Scene")
      });


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
