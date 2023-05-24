import { setLoader } from '../../../helpers/nakamaHelpers';

class Preloader {
  Loading(_scene) {
    this.scene = _scene;
    this.scene.load.once(
      'progress',
      () => {
        // we could start the Loader when clicking on login button to start the animation sooner
        setLoader(true);
      },
    );

    this.scene.load.on('complete', () => {
      setLoader(false);
      this.scene.loadingDone = true;
    });
  }
} // end class

export default new Preloader();
