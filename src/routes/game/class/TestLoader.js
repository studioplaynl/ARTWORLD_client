class TestLoader {
  constructor() {}

  run(scene) { 
    console.log("test loader is running")
    const halfWidth = scene.sys.game.canvas.width / 2
    const halfHeight = scene.sys.game.canvas.height / 2

    const loadingText = scene.add.text(halfWidth, halfHeight - 150, 'LOADING ...', { font: '20px Arial' }).setOrigin(0.5, 0.5);
    loadingText.setTint(0x0000);  

    const progressWidth = 300
    const progressHeight = 30
    const padding = 5

    const progressBox = scene.add.graphics()
    progressBox.fillStyle(0x227CAD, 1)
    progressBox.fillRect(loadingText.x - (progressWidth / 2), loadingText.y + (progressHeight / 2), progressWidth, progressHeight);

    const progressBar = scene.add.graphics()
    scene.load.on('progress', function (value) {
        progressBar.clear();
        progressBar.fillStyle(0x6D740F, 1)
        progressBar.fillRect(loadingText.x - (progressWidth / 2 - padding), loadingText.y + (progressHeight / 2 + padding), (progressWidth - padding * 2) * value, progressHeight - padding * 2);
    });
    
    scene.load.on('fileprogress', function (file) {
    
    });

    scene.load.on('complete', function () {
        scene.loadingDone = true
        progressBar.destroy();
        progressBox.destroy();
    });

  }
}

export default new TestLoader()
