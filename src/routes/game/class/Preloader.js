class Preloader {
    constructor() {
    }
    Loading(scene) {

        const halfWidth = scene.sys.game.canvas.width / 2
        const halfHeight = scene.sys.game.canvas.height / 2

        const loadingText = scene.add.text(halfWidth, halfHeight - 150, '', { font: '30px Arial' }).setOrigin(0.5, 0.5);
        loadingText.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);

        const progressWidth = 300
        const progressHeight = 50
        const padding = 10

        const progressBox = scene.add.graphics()
        progressBox.fillStyle(0xff0000, 1)
        progressBox.fillRect(loadingText.x - (progressWidth / 2), loadingText.y + (progressHeight / 2), progressWidth, progressHeight);

        const progressBar = scene.add.graphics()
        scene.load.on('progress', function (value) {
            progressBar.clear()

            progressBar.fillStyle(0xffffff, 1)

            progressBar.fillRect(loadingText.x - (progressWidth / 2 - padding), loadingText.y + (progressHeight / 2 + padding), (progressWidth - padding * 2) * value, progressHeight - padding * 2);
        });

        scene.load.on('fileprogress', function (file) {

        });

        scene.load.on('complete', function () {
            scene.loadingDone = true
            loadingText.destroy()
            progressBar.destroy()
            progressBox.destroy()
        });

    }
} //end class

export default new Preloader()