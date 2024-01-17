[https://phaser.io/examples/v3/view/scenes/scene-add](https://phaser.io/examples/v3/view/scenes/scene-add)   

[Add Scene After Game, with passing on data](https://phaser.io/examples/v3/view/scenes/add-scene-after-game)   

[Add Scene From Another Scene](https://phaser.io/examples/v3/view/scenes/add-scene-from-another-scene)   

[Add and start Scene](https://phaser.io/examples/v3/view/scenes/scene-add-manual-start)

[Scene Files Payload](https://phaser.io/examples/v3/view/scenes/scene-files-payload)   
Files specified in the Scene config files payload
will be loaded in *before* the Scene is started,
meaning they're available before even the Scene.preload function (if set) is called

This is perfect for loading in small JSON config files for example,
or a tiny amount of preloader assets that the preloader itself needs to use.