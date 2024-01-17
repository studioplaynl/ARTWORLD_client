home object:    
```
collection: "home"
create_time: "2022-01-19T16:31:43Z"
key: "Amsterdam"
permission_read: 2
permission_write: 1
update_time: "2022-01-19T16:32:27Z"
user_id: "4c0003f0-3e3f-4b49-8aad-10db98f2d3dc"
value:    
    posX: 184.83
    posY: 312.66
    url: "home/stock/portalBlauw.png"
    username: "user22"
    version: 0

version: "0579e989a16f3e228a10d49d13dc3da6"
```

1. Get array of home objects => create home array **scene.homes** //  **scene.homesRepresented = []**
2. filter by key = location (eg Amsterdam) => **scene.homes**
3. A download the images
3. B if image can't be downloaded, use a placeholder (should we also send a noticifation to admin?)
4. create the home in an array **scene.homesRepresented** and in the scene with the image key, and posX posY from scene.homes, with the class **GenerateLocation**

***

In Phaser we get a global download error event, so we are handling that in a special way:

```
  await convertImage(url, "128", "png")
            .then((rec) => {
                //console.log("rec", rec)
                // load all the images to phaser
                scene.load.image(homeImageKey, rec)
                    .on(`filecomplete-image-${homeImageKey}`, (homeImageKey) => {
                        //delete from this.resolveErrorObjectArray
                        this.resolveErrorObjectArray = this.resolveErrorObjectArray.filter((obj) => obj.imageKey !== homeImageKey)
                       // console.log("this.resolveErrorObjectArray", this.resolveErrorObjectArray)
                        //create the home
                        this.createHome(element, index, homeImageKey, scene)
                    }, this)

                // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
                this.resolveErrorObjectArray.push({ loadFunction: "getHomeImage", element: element, index: index, imageKey: homeImageKey, scene: scene })

                scene.load.start() // start loading the image in memory
            })
```

We push the element we want to download into a global resolveErrorObjectArray with all the relevant information:    
1. the element (object)
2. the index of the array it is being handled in 
3. the imageKey that is already generated in the context
4. the scene it is being used in
5. the loadFunction

The loadFunction we use in the error handling function to inject the image in the right array and function to that the image is put in the right place:

```
resolveLoadError(offendingFile) {
        // element, index, homeImageKey, offendingFile, scene
        this.resolveErrorObjectArray //all loading images

        let resolveErrorObject = this.resolveErrorObjectArray.find(o => o.imageKey == offendingFile.key)

        let loadFunction = resolveErrorObject.loadFunction
        let element = resolveErrorObject.element
        let index = resolveErrorObject.index
        let imageKey = offendingFile.key
        let scene = resolveErrorObject.scene

       // console.log("element, index, homeImageKey, offendingFile, scene", element, index, imageKey, scene)
        switch (loadFunction) {
            case ("getHomeImage"):
                console.log("load offendingFile again", imageKey)

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

