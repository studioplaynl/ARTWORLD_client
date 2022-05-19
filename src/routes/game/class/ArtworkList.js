import { updateObject, listObjects, convertImage } from '../../../api.js'
import ManageSession from '../ManageSession.js'
import Player from './Player.js'
import R_UI from "./R_UI"
import { Liked } from '../../../storage.js'
class ArtworkList {
  constructor() {
    this.heartArray = []
    this.heartArrayLastValue = 0
  }

  subscribeToLiked() {
    Liked.subscribe(value => {
      this.alreadySubscribedToLiked = true
      this.heartArray = value
      if (this.heartArrayLastValue != this.heartArray.length) {
         this.heartArrayLastValue = this.heartArray.length

       }

    })
  }

  async getImages(scene, imageSize, viewSize, distanceBetweenArts, x, y) {
    await listObjects("drawing", scene.location, 100).then((response) => {

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

              scene.artUrl[index] = await convertImage(imgUrl, imgSize, imgSize, fileFormat)

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

    const allLikedArray = ManageSession.liked.liked // we get an array of objects, an object has the form of: 
    // {
    // collection: "drawing"
    // key: "groenblauwtoekan"
    // url: "drawing/4ced8bff-d79c-4842-b2bd-39e9d9aa597e/groenblauwtoekan.png"
    // user_id: "4ced8bff-d79c-4842-b2bd-39e9d9aa597e"
    // }

    //we get the number of elements we want to show
    //we subtract when an item is loaded, if zero we are complete and update the list
    let allItems = allLikedArray.length

    //we initialise the function/array that keeps track of progress and completion
    let tempArray = { artworks: [] }

    allLikedArray.map(async (element) => {
      // getting the key of the artwork
      const key = `${element.key}_128`

      //if the image is not yet loaded, we download it
      if (!scene.textures.exists(key)) {
        const currentImage = await convertImage(
          element.url,
          "128",
          "128",
          "png"
        )

        scene.load.image(key, currentImage) //put the image in the queue
        scene.load.start(); // start the queue with all the images
        //check if the specific image has loaded
        const fileNameCheck = `filecomplete-image-${key}`
        scene.load.on(fileNameCheck, () => allItems = this.checkAllItemsList(scene, allItems, -1, key, tempArray)) // processing each artwork
      } else {
        //when an image was already loaded and is still in memory, it also counts:
        allItems = this.checkAllItemsList(scene, allItems, -1, key, tempArray)
      }
    })
  }

  async convertRexUIArrayOnlinePlayer(scene) {
    const allLikedArray = ManageSession.likedOnlinePlayer.liked // an array of objects, an object is in form of:
    // {
    // collection: "drawing"
    // key: "groenblauwtoekan"
    // url: "drawing/4ced8bff-d79c-4842-b2bd-39e9d9aa597e/groenblauwtoekan.png"
    // user_id: "4ced8bff-d79c-4842-b2bd-39e9d9aa597e"
    // }

    //we get the number of elements we want to show
    //we subtract when an item is loaded, if zero we are complete and update the list
    let allItems = allLikedArray.length

    //we initialize the function/array that keeps track of progress and completion
    let tempArray = { artworks: [] }

    if (allItems > 0) {
      allLikedArray.map(async (element) => {
        const key = `${element.key}_128`

        //if the image is not yet loaded, we download it
        if (!scene.textures.exists(key)) {
          const currentImage = await convertImage(
            element.url,
            "128",
            "128",
            "png"
          )

          scene.load.image(key, currentImage) //put the image in the queue
          scene.load.start(); // start the queue with all the images
          //check if the specific image has loaded
          const fileNameCheck = `filecomplete-image-${key}`
          scene.load.on(fileNameCheck, () => allItems = this.checkAllItemsListOnlinePlayer(scene, allItems, -1, key, tempArray))
        } else {
          //when an image was already loaded and is still in memory, it also counts:
          allItems = this.checkAllItemsListOnlinePlayer(scene, allItems, -1, key, tempArray)
        }
      })
    } else {
      scene.onlinePlayerLikedPanelKeys = { artworks: [{ name: 'artFrame_128' }] }
      this.createLikedPanel(scene, scene.onlinePlayerLikedPanelSpinner, "onlinePlayerLikedPanel", scene.onlinePlayerItemsBar, scene.onlinePlayerLikedPanelKeys)
    }
  }

  placeHeartButton(scene, x, y, keyImgUrl, mediaObject) {
    //console.log("keyImgUrl, mediaObject", keyImgUrl, mediaObject)
    //we get the mediaObject passed along:
    //collection: "drawing"
    //create_time: "2022-01-27T16:46:00Z"
    //key: "1643301959176_cyaanConejo"
    //permission_read: 2
    //permission_write: 1
    //update_time: "2022-02-Heart:14:07Z"
    //user_id: "5264dc23-a339-40db-bb84-e0849ded4e68"
    //value:
    //      displayname: "cyaanConejo"
    //      json: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.json"
    //      previewUrl: "https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png?signature=6339bb9aa7f10a73387337ce0ab59ab5d657e3ce95b70a942b339cbbd6f15355"
    //      status: ""
    //      url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png"
    //version: 0

    //keyImgUrl = mediaObject.value.url

    //place heartButton under the artwork, make them interactive
    const artFrame = scene.textures.get("artFrame_512")
    let currentHeart = scene.add.image(x, y + (artFrame.height / 2), "heart").setOrigin(1, 0).setScale(0.7)
      .setInteractive()
      .setData("toggle", true) //true, not liked state
      .on('pointerup', () => { this.heartButtonToggle(scene, mediaObject, currentHeart) })

    scene.artContainer.add(currentHeart)

    //subscribe once to the Liked store
    if (this.alreadySubscribedToLiked != true) {
      this.subscribeToLiked()
    }

    //console.log("this.heartArray", this.heartArray)
    const exists = this.heartArray.some(element => element.value.url == keyImgUrl)
    if (exists) {
      // changing to red, liked
      currentHeart.setTexture("heart")
      currentHeart.setData("toggle", false)
    } else {
      // changing to blank, not liked
      currentHeart.setTexture("heart_empty")
      currentHeart.setData("toggle", true)
    }
  }

  async heartButtonToggle(scene, mediaObject, button) {
    //we get the mediaObject passed along:
    //collection: "drawing"
    //create_time: "2022-01-27T16:46:00Z"
    //key: "1643301959176_cyaanConejo"
    //permission_read: 2
    //permission_write: 1
    //update_time: "2022-02-Heart:14:07Z"
    //user_id: "5264dc23-a339-40db-bb84-e0849ded4e68"
    //value:
    //      displayname: "cyaanConejo"
    //      json: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.json"
    //      previewUrl: "https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png?signature=6339bb9aa7f10a73387337ce0ab59ab5d657e3ce95b70a942b339cbbd6f15355"
    //      status: ""
    //      url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png"
    //version: 0

    //button is the heart button
    let parsedMediaOject = { user_id: mediaObject.user_id, collection: mediaObject.collection, key: mediaObject.key, version: mediaObject.value.version, url: mediaObject.value.url, previewURl: mediaObject.value.previewURl }
    let toggle = button.getData("toggle")

    if (toggle) {
      // changing to red, liked
      button.setTexture("heart")
      button.setData("toggle", false)

      // updates the object locally
      // add to the array
      // //ManageSession.liked.liked.push(parsedMediaOject)
      //create server object
      // updates the object server side 
      // const type = "liked"
      // const name = mediaObject.key
      // const pub = 2
      // const value = parsedMediaOject
      Liked.create(mediaObject.key, parsedMediaOject)

      // updateObject(type, name, value, pub)

    } else {
      // changing to empty, not liked
      button.setTexture("heart_empty")
      button.setData("toggle", true)

      // updates the object locally
      // find the object in the array, by url, filter the object with the url out
      // // ManageSession.liked.liked = ManageSession.liked.liked.filter(obj => obj.url != mediaObject.value.url)

      Liked.delete(mediaObject.key)
    }

    // // updates the object server side 
    // const type = "liked"
    // const name = type + "_" + ManageSession.userProfile.id
    // const pub = 2
    // const value = ManageSession.liked
    // updateObject(type, name, value, pub)
  }
}

export default new ArtworkList()