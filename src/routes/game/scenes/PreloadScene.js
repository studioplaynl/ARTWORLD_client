import preloader from '../preLoader.js'


export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
        this.loadingDone = false
    }

    preload() {
        //.... PRELOADER VISUALISER ...............................................................................................
        preloader.Loading(this)
        //.... end PRELOADER VISUALISER ...............................................................................................

        this.load.atlas(
            "flares",
            "assets/particles/flares.png",
            "assets/particles/flares.json"
        )

        this.load.image("artworld", "assets/artworld.png")

        this.load.image("ui_magnifier_minus", "assets/ui/circle_minus.png")
        this.load.image("ui_magnifier_plus", "assets/ui/circle_plus.png")
        this.load.image("ui_eye", "assets/ui/eye.png")

        this.load.image("background4", "./assets/art_styles/repetition/3fb6da9378545.560cd556c9413.jpg")
    }

    async create() {

    } //create


    update(time, delta) {
        if (this.loadingDone) this.scene.start("MainMenu");
    } // end update
}
