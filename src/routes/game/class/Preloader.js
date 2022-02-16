import { setLoader } from "../../../api.js"

class Preloader {
    constructor() {
    }
    Loading(scene) {

        scene.load.once('progress', function (value) {
           setLoader(true) //we could start the Loader when clicking on login button to start the animation sooner
        })

        scene.load.on('complete', function () {
            setLoader(false)
            scene.loadingDone = true
        })
    }
} //end class

export default new Preloader()