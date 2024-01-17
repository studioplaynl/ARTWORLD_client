Now I using a queue to load details about the function the file is loaded in:

```this.resolveErrorObjectArray = []

    async getHomeImages(url, element, index, homeImageKey, scene) {
        console.log("getHomeImages")
        await convertImage(url, "128", "png")
            .then((rec) => {
                //console.log("rec", rec)
                // load all the images to phaser
                scene.load.image(homeImageKey, rec)
                    .on(`filecomplete-image-${homeImageKey}`, (homeImageKey) => {
                        //delete from this.resolveErrorObjectArray
                        this.resolveErrorObjectArray = this.resolveErrorObjectArray.filter((obj) => obj.imageKey !== homeImageKey)
                        console.log("this.resolveErrorObjectArray", this.resolveErrorObjectArray)
                        //create the home
                        this.createHome(element, index, homeImageKey, scene)
                    }, this)
                // put the file in the loadErrorCache, incase it doesn't load
                this.resolveErrorObjectArray.push({ loadFunction: "getHomeImage", element: element, index: index, imageKey: homeImageKey })
                scene.load.start() // start loading the image in memory
            })
    }

    resolveLoadError(offendingFile) {
      
        let resolveErrorObject = this.resolveErrorObjectArray.find(obj => obj.imageKey == offendingFile.key)

        let loadFunction = resolveErrorObject.loadFunction
        let element = resolveErrorObject.element
        let index = resolveErrorObject.index
        let imageKey = offendingFile.key
        let scene = ManageSession.currentScene

        switch (loadFunction) {
            case ("getHomeImage"):
                console.log("load offendingFile again", imageKey, offendingFile)

                scene.load.image(imageKey, './assets/ball_grey.png')
                    .on(`filecomplete-image-${imageKey}`, (imageKey) => {
                        //delete from this.resolveErrorObjectArray
                        this.resolveErrorObjectArray = this.resolveErrorObjectArray.filter((obj) => obj.imageKey !== imageKey)
                        console.log("this.resolveErrorObjectArray", this.resolveErrorObjectArray)

                        //create the home
                        this.createHome(element, index, imageKey, scene);
                    }, this)
                scene.load.start()
                break

            default:
                console.log("please state fom which function the loaderror occured!")
        }
    }
```
***
Was using this:    
```
scene.load.image(homeImageKey, rec)
                    .on(`filecomplete-image-${homeImageKey}`, (homeImageKey) => {
                        //create the home
                        this.createHome(element, index, homeImageKey, scene)
                    }, this)
                    .on(`loaderror`, (offendingFile) => { this.resolveLoadError(element, index, homeImageKey, offendingFile, scene) }, this)
                scene.load.start()
```
But the .on('loaderror) callback is for the whole scene, so it is difficult to create a callback specific for a method.

On way to do it maybe is to only add to the queue when a method is finished. So to use to load queue per loading method/ sequence...

***

Async loader plugin:   
[https://pablo.gg/en/blog/games/how-to-load-assets-asynchronously-with-phaser-3/](https://pablo.gg/en/blog/games/how-to-load-assets-asynchronously-with-phaser-3/)


***
Maybe a useful methode:    
[https://phaser.discourse.group/t/loading-audio/1306/4](https://phaser.discourse.group/t/loading-audio/1306/4)

```
async create() {

  const asyncLoader = loaderPlugin => {
    return new Promise(resolve => {
      loaderPlugin.on('filecomplete', () => resolve()).on('loaderror', () => resolve())
      loaderPlugin.start()
    })
  }

  await asyncLoader(this.load.audio('song', ['assets/sounds/0781.ogg']))
  this.sound.add('song').play()
}
```