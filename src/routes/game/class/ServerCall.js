/* eslint-disable prefer-destructuring */
import { element } from 'svelte/internal';
import ManageSession from '../ManageSession';
import {
  convertImage, getAllHouses, listAllObjects,
} from '../../../api';
import GenerateLocation from './GenerateLocation';
import CoordinatesTranslator from './CoordinatesTranslator';
import ArtworkList from './ArtworkList';
import { ART_FRAME_BORDER } from '../../../constants';
import { dlog } from '../helpers/DebugLog';

class ServerCall {
  async getHomesFiltered(filter, _scene) {
    const scene = _scene;
    // homes represented, to created homes in the scene
    scene.homesRepresented = [];
    scene.homes = [];
    // console.log('scene.homesRepresented.length before', scene.homesRepresented.length);
    // console.log('scene.homes.length before', scene.homes.length);

    // get a list of all homes objects and then filter
    Promise.all([getAllHouses(filter, null)])
      .then((homesRec) => {
        // console.log('rec homes: ', homesRec);
        scene.homes = homesRec[0];
        // dlog('scene.homes', scene.homes);

        this.generateHomes(scene);
      });
  }

  async generateHomes(scene) {
    // check if server query is finished, then make the home from the list
    if (scene.homes != null) {
      // dlog('generate homes!');
      // dlog('scene.homes', scene.homes);
      scene.homes.forEach((element, index) => {
        // dlog(element, index)
        const homeImageKey = `homeKey_${element.user_id}`;
        // get a image url for each home
        // get converted image from AWS
        const { url } = element.value;

        // check if homekey is already loaded
        if (scene.textures.exists(homeImageKey)) {
          // create the home
          // dlog('element generateHomes textures.exists', element);
          ServerCall.createHome(element, index, homeImageKey, scene);
        } else {
          // get the image server side
          this.getHomeImages(url, element, index, homeImageKey, scene);
        }
      }); // end forEach
    }
  }

  async getHomeImages(url, element, index, homeImageKey, scene) {
    // dlog('getHomeImages');
    await convertImage(url, '128', '128', 'png')
      .then((rec) => {
        // dlog("rec", rec)
        // load all the images to phaser
        scene.load.image(homeImageKey, rec)
          .on(`filecomplete-image-${homeImageKey}`, () => {
            // delete from ManageSession.resolveErrorObjectArray
            ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
              (obj) => obj.imageKey !== homeImageKey,
            );
            // dlog("ManageSession.resolveErrorObjectArray", ManageSession.resolveErrorObjectArray)
            // create the home
            ServerCall.createHome(element, index, homeImageKey, scene);
          }, this);
        // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
        ManageSession.resolveErrorObjectArray.push({
          loadFunction: 'getHomeImage', element, index, imageKey: homeImageKey, scene,
        });
        scene.load.start(); // start loading the image in memory
      });
  }

  static createHome(element, index, homeImageKey, _scene) {
    const scene = _scene;

    // home description
    const locationDescription = element.value.username;

    // only show the number of artworks on the houses if we know it
    const numberOfDrawing = element.artworks.drawing;
    const numberOfStopmotion = element.artworks.stopmotion;

    const numberOfArtworks = numberOfDrawing + numberOfStopmotion;
    // if (typeof element.artWorks === 'undefined') {
    //   numberOfArtworks = -1;
    // } else {
    //   numberOfArtworks = element.artWorks.length;
    // }

    scene.homesRepresented[index] = new GenerateLocation({
      scene,
      size: 140,
      userHome: element.user_id,
      draggable: ManageSession.gameEditMode,
      type: 'image',
      x: CoordinatesTranslator.artworldToPhaser2DX(
        scene.worldSize.x,
        element.value.posX,
      ),
      y: CoordinatesTranslator.artworldToPhaser2DY(
        scene.worldSize.y,
        element.value.posY,
      ),
      locationDestination: 'DefaultUserHome',
      numberOfArtworks,
      locationText: locationDescription,
      locationImage: homeImageKey,
      referenceName: locationDescription,
      enterButtonImage: 'enter_button',
      fontColor: 0x8dcb0e,
      color1: 0xffe31f,
      color2: 0xf2a022,
      color3: 0xf8d80b,
    });

    // make a home smaller when there is no art inside
    // if (typeof element.artWorks != "undefined" && element.artWorks.length < 1) {
    //   scene.homesRepresented[index].setScale(0.8)
    // }

    // set the house of SELF bigger
    if (element.user_id === ManageSession.userProfile.id) {
      scene.homesRepresented[index].setScale(1.6);
    }

    scene.homesRepresented[index].setDepth(30);

    if (scene.homesRepresented[index].numberOfArtworks < 1 || ManageSession.gameEditMode) {
      scene.homesRepresented[index].numberArt.setVisible(false);
      scene.homesRepresented[index].numberBubble.setVisible(false);
      scene.homesRepresented[index].setData('enteringPossible', 'false');
    }
  }

  async downloadAndPlaceArtworksByType(type, location, serverItemsArray, artSize, artMargin) {
    // const scene = ManageSession.currentScene;
    await listAllObjects(type, location).then((rec) => {
      // eslint-disable-next-line no-param-reassign
      serverItemsArray.array = rec.filter((obj) => obj.permission_read === 2);
      // eslint-disable-next-line no-param-reassign
      serverItemsArray.startLength = serverItemsArray.array.length;
      // eslint-disable-next-line no-param-reassign
      serverItemsArray.itemsDownloadCompleted = 0;
      // eslint-disable-next-line no-param-reassign
      serverItemsArray.itemsFailed = 0;


      dlog('finding offending serverItemsArray: ', type, serverItemsArray);
      if (serverItemsArray.array.length > 0) {
        serverItemsArray.array.forEach((element, index, array) => {
          this.downloadArtwork(element, index, array, type, artSize, artMargin);
        });
      }
    });
  }

  async downloadArtwork(element, index, array, type, artSize, artMargin) {
    const scene = ManageSession.currentScene;
    const imageKeyUrl = element.value.url;
    const imgSize = artSize.toString();
    const fileFormat = 'png';
    const getImageWidth = (artSize * 1000).toString();

    if (scene.textures.exists(imageKeyUrl)) {
      // if the artwork has already been downloaded
      if (type === 'drawing') {
        // eslint-disable-next-line no-param-reassign
        element.downloaded = true;
        this.createImageContainer(element, index, artSize, artMargin);
      } else if (type === 'stopmotion') {
        // eslint-disable-next-line no-param-reassign
        element.downloaded = true;
        this.createStopmotionContainer(element, index, artSize, artMargin);
      }
      // if the artwork is not already downloaded
    } else if (type === 'drawing') {
      const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);

      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadDrawingDefaultUserHome', element, index, imageKey: imageKeyUrl, scene,
      });

      scene.load.image(imageKeyUrl, convertedImage)
        .on(`filecomplete-image-${imageKeyUrl}`, () => {
          // delete from ManageSession.resolveErrorObjectArray because of succesful download
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== imageKeyUrl,
          );
          // eslint-disable-next-line no-param-reassign
          element.downloaded = true;
          // dlog('drawing downloaded', imageKeyUrl);
          // dlog('object updated: ', element);
          // create container with artwork

          this.createImageContainer(element, index, artSize, artMargin);
          // dlog("ManageSession.resolveErrorObjectArray", ManageSession.resolveErrorObjectArray)
          // create the home
          // ServerCall.createHome(element, index, homeImageKey, scene);
        }, this);
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      // ManageSession.resolveErrorObjectArray.push({
      //   loadFunction: 'downloadDrawingDefaultUserHome', element, index, imageKey: imageKeyUrl, scene,
      // });

      scene.load.start(); // start the load queue to get the image in memory

      // this is fired each time a file is finished downloading (or failing)
      scene.load.on('complete', () => {
        const startLength = scene.userDrawingServerList.startLength;
        let downloadCompleted = scene.userDrawingServerList.itemsDownloadCompleted;
        // dlog('STOPMOTION loader downloadCompleted before, startLength', downloadCompleted, startLength);
        downloadCompleted += 1;
        scene.userDrawingServerList.itemsDownloadCompleted = downloadCompleted;
        // dlog('STOPMOTION loader downloadCompleted after, startLength', downloadCompleted, startLength);
        if (downloadCompleted === startLength) {
          dlog('loader STOPMOTION COMPLETE');
          this.repositionContainers('drawing');
        }
      });
    } else if (type === 'stopmotion') {
      const convertedImage = await convertImage(imageKeyUrl, imgSize, getImageWidth, fileFormat);
      // const convertedImage = element.value.previewUrl

      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadStopmotionDefaultUserHome', element, index, imageKey: imageKeyUrl, scene,
      });

      scene.load.spritesheet(
        imageKeyUrl,
        convertedImage,
        { frameWidth: artSize, frameHeight: artSize },
      )
        .on(`filecomplete-spritesheet-${imageKeyUrl}`, () => {
          // remove the file from the error-resolve-queue
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== imageKeyUrl,
          );

          this.createStopmotionContainer(element, index, artSize, artMargin);
        });
      // console.log('stopmotion', imageKeyUrl);
      scene.load.start(); // start the load queue to get the image in memory

      // this is fired each time a file is finished downloading (or failing)
      scene.load.on('complete', () => {
        // dlog('loader STOPMOTION is complete');
        const startLength = scene.userStopmotionServerList.startLength;
        let downloadCompleted = scene.userStopmotionServerList.itemsDownloadCompleted;
        // dlog('STOPMOTION loader downloadCompleted before, startLength', downloadCompleted, startLength);
        downloadCompleted += 1;
        scene.userStopmotionServerList.itemsDownloadCompleted = downloadCompleted;
        // dlog('STOPMOTION loader downloadCompleted after, startLength', downloadCompleted, startLength);
        if (downloadCompleted === startLength) {
          dlog('loader STOPMOTION COMPLETE');
          this.repositionContainers('stopmotion');
        }
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  createImageContainer(element, index, artSize, artMargin) {
    const scene = ManageSession.currentScene;

    const imageKeyUrl = element.value.url;
    const y = 38;
    const artBorder = ART_FRAME_BORDER;

    const artStart = 38; // start the art on the left side

    const coordX = index === 0 ? artStart : (artStart) + (index * (artSize + artMargin));
    // dlog('image coordX, index', coordX, index);
    const imageContainer = scene.add.container(0, 0).setDepth(100);

    imageContainer.add(scene.add.image(0, 0, 'artFrame_512').setOrigin(0));

    // adds the image to the container
    const setImage = scene.add.image(0 + artBorder, 0 + artBorder, imageKeyUrl).setOrigin(0);
    imageContainer.add(setImage);

    const containerSize = artSize + artBorder;
    const tempX = containerSize - artMargin;
    const tempY = containerSize + artBorder;
    ArtworkList.placeHeartButton(scene, tempX, tempY, imageKeyUrl, element, imageContainer);
    imageContainer.setPosition(coordX, y);
    imageContainer.setSize(containerSize, containerSize);
    scene.drawingGroup.add(imageContainer);
    // dlog('scene.drawingGroup.getChildren()', scene.drawingGroup.getChildren());
  }

  createStopmotionContainer(element, index, artSize, artMargin) {
    const scene = ManageSession.currentScene;

    const imageKeyUrl = element.value.url;
    const y = artSize * 1.4;
    const artBorder = ART_FRAME_BORDER;

    const artStart = 38; // start the art on the left side

    const coordX = index === 0 ? artStart : (artStart) + (index * (artSize + artMargin));
    const imageContainer = scene.add.container(0, 0).setDepth(100);

    imageContainer.add(scene.add.image(0, 0, 'artFrame_512').setOrigin(0));

    // dlog('STOPMOTION element, index, artSize, artMargin', element, index, artSize, artMargin);
    const avatar = scene.textures.get(imageKeyUrl);
    // eslint-disable-next-line no-underscore-dangle
    const avatarWidth = avatar.frames.__BASE.width;
    // console.log('stopmotion width: ', avatarWidth);

    // eslint-disable-next-line no-underscore-dangle
    const avatarHeight = avatar.frames.__BASE.height;
    // console.log(`stopmotion Height: ${avatarHeight}`);

    const avatarFrames = Math.round(avatarWidth / avatarHeight);
    let setFrameRate = 0;
    if (avatarFrames > 1) { setFrameRate = (avatarFrames); } else {
      setFrameRate = 0;
    }
    // console.log(`stopmotion Frames: ${avatarFrames}`);

    // . animation for the player avatar ......................

    this.stopmotionMovingKey = 'moving_stopmotion';
    this.stopmotionStopKey = 'stop_stopmotion';

    // check if the animation already exists
    if (!scene.anims.exists(this.stopmotionMovingKey)) {
      scene.anims.create({
        key: `moving_${imageKeyUrl}`,
        frames: scene.anims.generateFrameNumbers(imageKeyUrl, {
          start: 0,
          end: avatarFrames - 1,
        }),
        frameRate: setFrameRate,
        repeat: -1,
        yoyo: false,
      });

      scene.anims.create({
        key: `stop_${imageKeyUrl}`,
        frames: scene.anims.generateFrameNumbers(imageKeyUrl, {
          start: 0,
          end: 0,
        }),
      });
    }
    // . end animation for the player avatar ......................

    // adds the image to the container
    const completedImage = scene.add.sprite(
      0 + artBorder,
      0 + artBorder,
      imageKeyUrl,
    ).setOrigin(0);
    imageContainer.add(completedImage);

    completedImage.setData('moveAnim', `moving_${imageKeyUrl}`);
    completedImage.setData('stopAnim', `stop_${imageKeyUrl}`);
    if (avatarFrames > 1) {
      completedImage.play(`moving_${imageKeyUrl}`);
    }

    const containerSize = artSize + artBorder;
    const tempX = containerSize - artMargin;
    const tempY = containerSize + artBorder;
    ArtworkList.placeHeartButton(scene, tempX, tempY, imageKeyUrl, element, imageContainer);
    imageContainer.setPosition(coordX, y);
    imageContainer.setSize(containerSize, containerSize);
    scene.stopmotionGroup.add(imageContainer);
  }

  // eslint-disable-next-line class-methods-use-this
  repositionContainers(type) {
    // get the children of the stopmotion group
    const scene = ManageSession.currentScene;
    let containers = {};

    if (type === 'drawing') {
      containers = scene.drawingGroup.getChildren();
    } else if (type === 'stopmotion') {
      containers = scene.stopmotionGroup.getChildren();
    }


    const artSize = scene.artDisplaySize;
    const artMargin = scene.artMargin;
    const artBorder = ART_FRAME_BORDER;

    // give each container a position according to the place in the index
    const y = artSize * 2.4;

    const artStart = 38; // start the art on the left side
    containers.forEach((element, index) => {
      const coordX = index === 0 ? artStart : (artStart) + (index * (artSize + artMargin));
      element.setX(coordX);
    });
  }

  /** Provide detailed information on a file loading error in Phaser, and provide fallback */
  resolveLoadError(offendingFile) {
    // element, index, homeImageKey, offendingFile, scene
    // ManageSession.resolveErrorObjectArray; // all loading images
    dlog('offendingFile', offendingFile);

    const resolveErrorObject = ManageSession.resolveErrorObjectArray.find(
      (o) => o.imageKey === offendingFile.key,
    );

    // dlog('offendingFile resolveErrorObject', resolveErrorObject);

    const { loadFunction } = resolveErrorObject;
    const { element } = resolveErrorObject;
    const { index } = resolveErrorObject;
    const imageKey = offendingFile.key;
    const { scene } = resolveErrorObject;
    // dlog("element, index, homeImageKey, offendingFile, scene", element, index, imageKey, scene)
    switch (loadFunction) {
      case 'getHomeImage':
        dlog('offending file, load placeholder image instead', imageKey);

        scene.load.image(imageKey, './assets/ball_grey.png')
          .on(`filecomplete-image-${imageKey}`, () => {
            // delete from ManageSession.resolveErrorObjectArray
            ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
              (obj) => obj.imageKey !== imageKey,
            );
            dlog('ManageSession.resolveErrorObjectArray', ManageSession.resolveErrorObjectArray);

            // create the home
            ServerCall.createHome(element, index, imageKey, scene);
          }, this);
        scene.load.start();
        break;
      case 'downloadDrawingDefaultUserHome':
        dlog('offending drawing loading failed, removing from array', imageKey);


        // delete from scene.userDrawingServerList
        // eslint-disable-next-line max-len
        scene.userDrawingServerList.array = scene.userDrawingServerList.array.filter((obj) => obj.value.url !== imageKey);

        // delete from ManageSession.resolveErrorObjectArray
        ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
          (obj) => obj.imageKey !== imageKey,
        );
        dlog('ManageSession.resolveErrorObjectArray', ManageSession.resolveErrorObjectArray);


        break;

      case 'downloadStopmotionDefaultUserHome':
        dlog('offending stopmotion loading failed, removing from array');
        const userStopmotionServerList = scene.userStopmotionServerList;
        // delete from scene.userStopmotionServerList

        userStopmotionServerList.array = userStopmotionServerList.array.filter((obj) => obj.value.url !== imageKey);

        // delete from ManageSession.resolveErrorObjectArray
        ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
          (obj) => obj.imageKey !== imageKey,
        );



        break;

      default:
        dlog('please state fom which function the loaderror occured!');
    }
  }
} // end ServerCall

export default new ServerCall();
