import { listObjects, listImages, convertImage } from '../../../api.js'

class ListingArtworks {
  constructor() {}

  async getImages(scene, imageSize, viewSize, distanceBetweenArts, x, y) {
    await listImages("drawing", scene.location, 100).then((response) => {
      scene.userArtServerList = response
      if (scene.userArtServerList.length > 0) {
        scene.userArtServerList.forEach((element, index) => {
            (async() => {
              const imgUrl = element.value.url
              const imgSize = imageSize
              const fileFormat = "png"
              const key = `${element.key}_${imgSize}`
              
              if (x == null) {
                var coordX = index == 0 ? viewSize / 2 : (viewSize / 2) + index * distanceBetweenArts
              } else {
                var coordX = x
              }
              
              if (y == null) {
                var coordY = index == 0 ? viewSize / 2 : (viewSize / 2) + index * distanceBetweenArts
              } else {
                var coordY = y
              }
              
             

              scene.artContainer = scene.add.container(0, 0);
              if (scene.textures.exists(key)) { // if the image has already downloaded, then add image by using the key
                
                // adds a frame to the container
                scene.artContainer.add(scene.add.image(coordX - viewSize / 2, coordY, 'artFrame_512').setOrigin(0, 0.5))
                
                // adds the image to the container
                const setImage = scene.add.image(coordX, coordY, key)
                scene.artContainer.add(setImage)
              } else { // otherwise download the image and add it
            
                scene.artUrl[index] = await convertImage(imgUrl, imgSize, fileFormat)
                
                // for tracking each file in progress
                scene.progress.push({key, coordX, coordY})
                
                scene.load.image(key, scene.artUrl[index])
                
                scene.load.start() // load the image in memory

              }

              const progressBox = scene.add.graphics()
              const progressBar = scene.add.graphics()
              const progressWidth = 300
              const progressHeight = 50
              const padding = 10
    
              scene.load.on("fileprogress", (file, value) => {
                  
                progressBox.clear();
                progressBar.clear();
                progressBox.fillStyle(0x000000, 1)
                progressBar.fillStyle(0xFFFFFF, 1)
                  
                const progressedImage = scene.progress.find(element => element.key == file.key)
        
                progressBox.fillRect(progressedImage.coordX - progressWidth / 2, progressedImage.coordY, progressWidth, progressHeight)
                progressBar.fillRect(progressedImage.coordX - progressWidth / 2 + padding, progressedImage.coordY + padding, (progressWidth * value) - (padding * 2), progressHeight - padding * 2)
              
              })
    
              scene.load.on('filecomplete', (key) => {
              
                const currentImage = scene.progress.find(element => element.key == key)
                
                // adds a frame to the container
                scene.artContainer.add(scene.add.image(currentImage.coordX - viewSize / 2, currentImage.coordY, 'artFrame_512').setOrigin(0, 0.5))
                
                // adds the image to the container
                const completedImage = scene.add.image(currentImage.coordX, currentImage.coordY, currentImage.key)
                scene.artContainer.add(completedImage)
              })
          
              scene.load.once("complete", () => {
                  progressBar.destroy()
                  progressBox.destroy()
                  scene.progress = []
              });

            })()
        })     
      }
    })
  }
}

export default new ListingArtworks()