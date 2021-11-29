class preloader {
    constructor() {
    }
    Loading(scene) {

        let width = scene.sys.game.canvas.width
        let height = scene.sys.game.canvas.height

        let loadingText = scene.make.text({
            x: width,
            y: height,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5)

        let progressBar = scene.add.graphics()
        let progressBox = scene.add.graphics()

        progressBox.fillStyle(0x222222, 0.8)
        progressBox.fillRect(240, 270, 320, 50);

        scene.load.on('progress', function (value) {
            // console.log(value);
            progressBar.clear();
            progressBar.fillStyle(0x2f2f2f, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        scene.load.on('fileprogress', function (file) {
            // console.log(file.src);
        });
        scene.load.on('complete', function () {
            // console.log('complete');
            progressBar.destroy();
            progressBox.destroy();
        });

    }
} //end class

export default new preloader()





    // var width = scene.sys.game.canvas.width;
    // var height = scene.sys.game.canvas.height;

    // var loadingText = scene.make.text({
    //   x: 400,
    //   y: 250,
    //   text: 'Loading...',
    //   style: {
    //     font: '20px monospace',
    //     fill: '#ffffff'
    //   }
    // });
    // loadingText.setOrigin(0.5, 0.5);

    // var progressBar = scene.add.graphics()
    // var progressBox = scene.add.graphics()

    // progressBox.fillStyle(0x222222, 0.8)
    // progressBox.fillRect(240, 270, 320, 50);

    // scene.load.on('progress', function (value) {
    //   console.log(value);
    //   progressBar.clear();
    //   progressBar.fillStyle(0xffffff, 1);
    //   progressBar.fillRect(250, 280, 300 * value, 30);
    // });

    // scene.load.on('fileprogress', function (file) {
    //   console.log(file.src);
    // });
    // scene.load.on('complete', function () {
    //   console.log('complete');
    //   progressBar.destroy();
    //   progressBox.destroy();
    // });