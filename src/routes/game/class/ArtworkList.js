import { updateObject, listImages, convertImage } from '../../../api.js'
import ManageSession from '../ManageSession.js'

class ArtworkList {
  constructor() { }

  async getImages(scene, imageSize, viewSize, distanceBetweenArts, x, y) {
    await listImages("drawing", scene.location, 100).then((response) => {

      scene.userArtServerList = response

      if (scene.userArtServerList.length > 0) {

        // coords of the scrolling bar container and the container that holds artworks are the same
        const scrollContainerX = 100
        const scrollContainerY = 100

        const scrollContainerWidth = scene.artDisplaySize + 30 // artwork size + the frame stroke
        const scrollContainerHeight = 1000 // for now the scrolling bar container's height is 1000

        const scrollContainer = scene.add.graphics()
          .setPosition(scrollContainerX, scrollContainerY)
          .fillStyle(0x0000, 1)
          .fillRect(0, 0, scrollContainerWidth, scrollContainerHeight)
          .setInteractive(new Phaser.Geom.Rectangle(0, 0, scrollContainerWidth, scrollContainerHeight), Phaser.Geom.Rectangle.Contains)
          .setName("scrollingBarContainer") // the name is needed so that the avatar is not moved, when a user scrolls the artworks

        // creating a container that holds all artworks of the user
        scene.artListContainer = scene.add.container(scrollContainerX, scrollContainerY + 20)

        // the height depends on the amount of the artworks, it is needed for scrolling
        const contentHeight = scene.userArtServerList.length * distanceBetweenArts

        // overflow: auto (makes the objects outside of the scroll container to not overflow
        scene.artListContainer.setMask(scrollContainer.createGeometryMask())

        // where the magic calculations happen :)
        const topBound = scrollContainerY
        let bottomBound
        if (contentHeight > scrollContainerHeight) {
          // over a page
          bottomBound = scrollContainerY - contentHeight + scrollContainerHeight;
        } else {
          bottomBound = scrollContainerY
        }

        // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scroller/
        // scroller plug-in config
        scene.scroller = scene.plugins.get('rexScroller').add(scrollContainer, {
          bounds: [
            topBound,
            bottomBound,
          ],
          value: topBound, // initial view (current camera)

          valuechangeCallback: function (value) {
            scene.artListContainer.y = value; // draggable vertically
          },
        })

        scene.userArtServerList.forEach((element, index) => {
          (async () => {
            const imgUrl = element.value.url
            const imgSize = imageSize
            const fileFormat = "png"
            const key = `${element.key}_${imgSize}`

            if (x == null) {
              var coordX = index == 0 ? viewSize / 2 + 15 : (viewSize / 2) + index * distanceBetweenArts + 15
            } else {
              var coordX = x
            }

            if (y == null) {
              var coordY = index == 0 ? viewSize / 2 + 15 : (viewSize / 2) + index * distanceBetweenArts + 15
            } else {
              var coordY = y
            }

            // scene.artContainer = scene.add.container(0, 0);
            if (scene.textures.exists(key)) { // if the image has already downloaded, then add image by using the key

              // adds a frame to the container
              scene.artListContainer.add(scene.add.image(coordX - viewSize / 2, coordY, 'artFrame_512').setOrigin(0, 0.5))

              // adds the image to the container
              const setImage = scene.add.image(coordX, coordY, key)
              scene.artListContainer.add(setImage)
            } else { // otherwise download the image and add it

              scene.artUrl[index] = await convertImage(imgUrl, imgSize, fileFormat)

              // for tracking each file in progress
              scene.progress.push({ key, coordX, coordY })

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
              scene.artListContainer.add(scene.add.image(currentImage.coordX - viewSize / 2, currentImage.coordY, 'artFrame_512').setOrigin(0, 0.5))

              // adds the image to the container
              const completedImage = scene.add.image(currentImage.coordX, currentImage.coordY, currentImage.key)
              scene.artListContainer.add(completedImage)
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

  async convertRexUIArray(scene) {
    //allLikedArray is an array of art in format:
    //drawing/5264dc23-a339-40db-bb84-e0849ded4e68/geelCoral.png
    //should be format: 
    // liked: [
    // {
    //  user_id: "e0849c23-a339-40db-bb84-e0849ded4e68",
    //  collection: "drawing",
    //  key: "1642771303290_limoenWalrus",
    //  version: 1,
    //  url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/1_1642771303290_limoenWalrus.png",
    //  previewURl: "https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/stopmotion/5264dc23-a339-40db-bb84-e0849ded4e68/1_1642771303290_limoenWalrus.png?signature=c8c1aba753e01a6f06fd321a5a01a46fc18a483bb618ca1e2478283028a077f8",
    //  },
    // ]

    //we want to get a preview of the liked item, for the latest version


    const allLikedArray = Object.keys(ManageSession.allLiked)

    //we get the number of elements we want to show
    //we subtract when an item is loaded, if zero we are complete and update the list
    let allItems = allLikedArray.length

    //we initialise the function/array that keeps track of progress and completion
    let tempArray = { artworks: [] }

    allLikedArray.map(async (element) => {
      console.log(element)
      const splitKey = element.split("/")[2].split(".")[0]
      //we get only the relevant part of the url for the key:
      //drawing/5264dc23-a339-40db-bb84-e0849ded4e68/geelCoral.png -> geelCoral.png

      const key = `${splitKey}_128`

      //if the image is not yet loaded, we download it
      if (!scene.textures.exists(key)) {
        const currentImage = await convertImage(
          element,
          "128",
          "png"
        )

        scene.load.image(key, currentImage) //put the image in the queue
        scene.load.start(); // start the queue with all the images
        //check if the specific image has loaded
        const fileNameCheck = `filecomplete-image-${key}`
        //console.log(fileNameCheck)
        scene.load.on(fileNameCheck, () => allItems = this.checkAllItemsList(scene, allItems, -1, key, tempArray))
        //scene.load.on(fileNameCheck, () => console.log("finished loading: ", fileNameCheck)) // working

      } else {
        //when an image was already loaded and is still in memory, it also counts:
        allItems = this.checkAllItemsList(scene, allItems, -1, key, tempArray)
      }
    })
  }

  async convertRexUIArrayOnlinePlayer(scene) {
    console.log(ManageSession.allLikedOnlinePlayer)
    //allLikedArray is an array of art in format:
    //drawing/5264dc23-a339-40db-bb84-e0849ded4e68/geelCoral.png
    const allLikedArray = Object.keys(ManageSession.allLikedOnlinePlayer)
    console.log(allLikedArray)
    //we get the number of elements we want to show
    //we subtract when an item is loaded, if zero we are complete and update the list
    let allItems = allLikedArray.length

    //we initialise the function/array that keeps track of progress and completion
    let tempArray = { artworks: [] }

    if (allItems > 0) {
      allLikedArray.map(async (element) => {
        console.log(element)
        const splitKey = element.split("/")[2].split(".")[0]
        //we get only the relevant part of the url for the key:
        //drawing/5264dc23-a339-40db-bb84-e0849ded4e68/geelCoral.png -> geelCoral.png

        const key = `${splitKey}_128`

        //if the image is not yet loaded, we download it
        if (!scene.textures.exists(key)) {
          const currentImage = await convertImage(
            element,
            "128",
            "png"
          )

          scene.load.image(key, currentImage) //put the image in the queue
          scene.load.start(); // start the queue with all the images
          //check if the specific image has loaded
          const fileNameCheck = `filecomplete-image-${key}`
          //console.log(fileNameCheck)
          scene.load.on(fileNameCheck, () => allItems = this.checkAllItemsListOnlinePlayer(scene, allItems, -1, key, tempArray))
          //scene.load.on(fileNameCheck, () => console.log("finished loading: ", fileNameCheck)) // working

        } else {
          //when an image was already loaded and is still in memory, it also counts:
          allItems = this.checkAllItemsListOnlinePlayer(scene, allItems, -1, key, tempArray)
        }
      })
    } else {
      scene.onlinePlayerLikedPanelKeys = { artworks: [{ name: 'artFrame_128' }] }
      scene.events.emit("onlinePlayerLikedPanelComplete")
    }
  }



  checkAllItemsList(scene, allItems, subtract, key, tempArray) {
    //the tempArray is initialised in the parent method
    tempArray.artworks.push({ "name": key })

    //console.log(tempArray)

    allItems = allItems + subtract
    //console.log("allItems: ", allItems)
    if (allItems < 1) {
      //console.log("FINISHED!")
      scene.playerLikedPanelKeys = tempArray
      //console.log("scene.playerLikedPanelKeys: ", scene.playerLikedPanelKeys)
      scene.events.emit("playerLikedPanelComplete")

    } else {
      return allItems // return the result if not completed
    }
  }


  checkAllItemsListOnlinePlayer(scene, allItems, subtract, key, tempArray) {
    //the tempArray is initialised in the parent method
    tempArray.artworks.push({ "name": key })

    //console.log(tempArray)

    allItems = allItems + subtract
    //console.log("allItems: ", allItems)
    if (allItems < 1) {
      //console.log("FINISHED!")
      scene.onlinePlayerLikedPanelKeys = tempArray
      //console.log("scene.playerLikedPanelKeys: ", scene.playerLikedPanelKeys)
      scene.events.emit("onlinePlayerLikedPanelComplete")

    } else {
      return allItems // return the result if not completed
    }
  }

  placeHeartButton(scene, x, y, keyImgUrl, mediaObject) {
    //we get the imageObject passed along
    //collection: "drawing"
    //create_time: "2022-01-27T16:46:00Z"
    //key: "1643301959176_cyaanConejo"
    //permission_read: 2
    //permission_write: 1
    //update_time: "2022-02-02T21:14:07Z"
    //user_id: "5264dc23-a339-40db-bb84-e0849ded4e68"
    //value:
    //      displayname: "cyaanConejo"
    //      json: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.json"
    //      previewUrl: "https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png?signature=6339bb9aa7f10a73387337ce0ab59ab5d657e3ce95b70a942b339cbbd6f15355"
    //      status: ""
    //      url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png"
    //version: 0

    console.log(mediaObject)
    //place heartButton under the artwork, make them interactive
    const artFrame = scene.textures.get("artFrame_512")
    let currentHeart = scene.add.image(x, y + (artFrame.height / 2), "bitmap_heart").setOrigin(1, 0).setScale(0.5)
      .setInteractive()
      .setData("toggle", false) //false, not liked state
      //.setTint(0x000000) //black, not liked color
      .on('pointerup', () => { this.heartButtonToggle(mediaObject, currentHeart) })

    scene.artContainer.add(currentHeart)

    //set the heartButton to either back or red depending if an artwork is present in the liked object
    const exists = ManageSession.liked.liked.some(element => element.url == keyImgUrl)
    if (exists) {
      currentHeart.setTint(0xffffff)
      currentHeart.setData("toggle", false)
    } else {
      currentHeart.setTint(0x000000)
      currentHeart.setData("toggle", true)
    }
    // console.log(Object.values(ManageSession.liked))
    // console.log(Object.values(ManageSession.liked.liked))

  }

  heartButtonToggle(mediaObject, button) {

    let parsedMediaOject = { user_id: mediaObject.user_id, collection: mediaObject.collection, key: mediaObject.key, version: mediaObject.value.version, url: mediaObject.value.url, previewURl: mediaObject.value.previewURl }
    let toggle = button.getData("toggle")

    if (toggle) {
      //changing to red, liked
      button.setTint(0xffffff)
      button.setData("toggle", false)
      // updates the object locally
      // add to the array
      ManageSession.liked.liked.push(parsedMediaOject)
      console.log(ManageSession.liked)

      //console.log("turnedRED")
    } else {
      //changing to black, not liked
      button.setTint(0x000000)
      button.setData("toggle", true)
      // updates the object locally
      //find the object in the array, by url, filter the object with the url out

      ManageSession.liked.liked = ManageSession.liked.liked.filter( obj => obj.url != mediaObject.value.url)
      // ManageSession.liked.liked.splice(deleteIndex, deleteIndex + 1)
      console.log(ManageSession.liked.liked)
      //delete ManageSession.allLiked[keyImgUrl]
    }

    const type = "liked"
    const name = type + "_" + ManageSession.userProfile.id
    const pub = 2
    const value = ManageSession.liked
    //  updates the object server side 
    updateObject(type, name, value, pub)
  }
}

//where check against MS.allLiked
//where change MS.allLiked

//we came from [] and now we have .liked[{},{}] and the objects {user_id: "user_id", art_key: "art_key"}

export default new ArtworkList()