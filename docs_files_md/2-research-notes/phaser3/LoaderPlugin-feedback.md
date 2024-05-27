## LoaderPlugin

Good info: [https://rexrainbow.github.io/phaser3-rex-notes/docs/site/loader/](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/loader/)

When queue has loaded and completed, it can be found through the key of the event listener:

    this.load.once("complete", (key) => {})

The key shows properties such as:

    totalToLoad: 5
    totalFailed: 0
    totalComplete: 5

### Getting loading completion feedback

this.load.image(key) will put the file in the queue

this.load.start() starts the queue

```
this.load.image('cakewalk');
this.load.image('flectrum');
this.load.image('fork');

this.load.start()
```

this.load.on('complete', ...) fires when the queue is done loading all the images.

```
this.load.on('complete', subLoadCompleted, this);

function subLoadCompleted ()
{
    console.log('Load Complete')
}
```

Feedback about the download progress of a **specific file**

```
 this.load.on('fileprogress', function (file, value) {

        if (file.key === 'goldrunner')
        {
            progress.clear();
            progress.fillStyle(0xffffff, 0.4);
            progress.fillRect(450, 500 - (value * 400), 200, value * 400);
        }
    })
```

```
    this.load.on('complete', function () {
        progress.destroy()
    })
```

### Get filecomplete on a specific file name!!!

```
this.load.on('filecomplete-image-taikodrummaster', addImage, this)

function addImage (key, file)
{
    this.add.image(400, 300, key)
}
```

For a spritesheet:

```
this.load.on('filecomplete-spritesheet-GAMEOVERExplosion', function (key, type, data) {
    // Your handler code
})
```

[Phaser.Loader.Events FILE_COMPLETE](https://photonstorm.github.io/phaser3-docs/Phaser.Loader.Events.html#event:FILE_COMPLETE__anchor)

[https://phaser.io/examples/v3/view/loader/loader-events/file-complete-event-with-key](https://phaser.io/examples/v3/view/loader/loader-events/file-complete-event-with-key)

[https://phaser.io/examples/v3/view/loader/loader-events/file-complete-event#](https://phaser.io/examples/v3/view/loader/loader-events/file-complete-event#)

---

### Loader key object

```
animation: ƒ (key, url, dataKey, xhrSettings)
aseprite: ƒ (key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings)
atlas: ƒ (key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings)
atlasXML: ƒ (key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings)
audio: ƒ (key, urls, config, xhrSettings)
audioSprite: ƒ (key, jsonURL, audioURL, audioConfig, audioXhrSettings, jsonXhrSettings)
baseURL: ""
binary: ƒ (key, url, dataType, xhrSettings)
bitmapFont: ƒ (key, textureURL, fontDataURL, textureXhrSettings, fontDataXhrSettings)
cacheManager: CacheManager {game: Game, binary: BaseCache, bitmapFont: BaseCache, json: BaseCache, physics: BaseCache, …}
crossOrigin: undefined
css: ƒ (key, url, xhrSettings)
glsl: ƒ (key, url, shaderType, xhrSettings)
html: ƒ (key, url, xhrSettings)
htmlTexture: ƒ (key, url, width, height, xhrSettings)
image: ƒ (key, url, xhrSettings)
inflight: Set {entries: Array(0)}
json: ƒ (key, url, dataKey, xhrSettings)
list: Set {entries: Array(0)}
maxParallelDownloads: 32
multiKeyIndex: 0
multiatlas: ƒ (key, atlasURL, path, baseURL, atlasXhrSettings)
obj: ƒ (key, objURL, matURL, flipUVs, xhrSettings)
pack: ƒ (key, url, packKey, xhrSettings)
path: ""
plugin: ƒ (key, url, start, mapping, xhrSettings)
prefix: ""
progress: 1
queue: Set {entries: Array(0)}
scene: ArtworldAmsterdam {sys: Systems, worldSize: Vector2, debug: false, gameStarted: false, phaser: ArtworldAmsterdam, …}
sceneFile: ƒ (key, url, xhrSettings)
sceneManager: SceneManager {game: Game, keys: {…}, scenes: Array(12), _pending: Array(0), _start: Array(0), …}
scenePlugin: ƒ (key, url, systemKey, sceneKey, xhrSettings)
script: ƒ (key, url, xhrSettings)
scripts: ƒ (key, url, xhrSettings)
spritesheet: ƒ (key, url, frameConfig, xhrSettings)
state: 3
svg: ƒ (key, url, svgConfig, xhrSettings)
systems: Systems {scene: ArtworldAmsterdam, config: 'ArtworldAmsterdam', settings: {…}, game: Game, sceneUpdate: ƒ, …}
text: ƒ (key, url, xhrSettings)
textureManager: TextureManager {_events: Events, _eventsCount: 0, game: Game, name: 'TextureManager', list: {…}, …}
tilemapCSV: ƒ (key, url, xhrSettings)
tilemapImpact: ƒ (key, url, xhrSettings)
tilemapTiledJSON: ƒ (key, url, xhrSettings)
totalComplete: 5
totalFailed: 0
totalToLoad: 5
unityAtlas: ƒ (key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings)
video: ƒ (key, urls, loadEvent, asBlob, noAudio, xhrSettings)
xhr: {responseType: '', async: true, user: '', password: '', timeout: 0, …}
xml: ƒ (key, url, xhrSettings)
_deleteQueue: Set {entries: Array(0)}
_events: Events {progress: Array(2), fileprogress: Array(2), complete: Array(2)}
_eventsCount: 3
```
