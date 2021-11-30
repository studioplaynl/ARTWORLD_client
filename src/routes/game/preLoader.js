class preloader {
    constructor() {
    }
    Loading(scene) {

        let width = scene.sys.game.canvas.width
        let height = scene.sys.game.canvas.height
        const halfWidth = width / 2
        const halfHeight = height / 2
        const quaterHeight = height / 4
        const offsetX = width / 10
        const offsetRect = 10

        console.log("scene.sys.game.canvas.width, scene.sys.game.canvas.height:")
        console.log(scene.sys.game.canvas.width, scene.sys.game.canvas.height)

        const text1 = scene.add.text(halfWidth - offsetX, quaterHeight, 'LOADING ...', { font: '30px Arial' });
        text1.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);

        let progressBox = scene.add.graphics()
        let progressBar = scene.add.graphics()
        
        progressBox.fillStyle(0xff0000, 1)
        //fillRect x top-left y top-left width height 
        progressBox.fillRect(text1.x - (offsetRect * 8), text1.y + (offsetRect * 4), 320, 50);

        scene.load.on('progress', function (value) {
            // console.log(value);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(text1.x - (offsetRect * 8) + offsetRect, text1.y + (offsetRect * 1) + (offsetRect * 4), 300 * value, 30);
        });

        scene.load.on('fileprogress', function (file) {
            // console.log(file.src);
        });
        scene.load.on('complete', function () {
            // console.log('complete');
            scene.loadingDone = true
            progressBar.destroy();
            progressBox.destroy();
        });

    }
} //end class

export default new preloader()