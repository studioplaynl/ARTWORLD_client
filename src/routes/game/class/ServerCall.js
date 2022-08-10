/* eslint-disable prefer-destructuring */
import ManageSession from '../ManageSession';
import {
  listObjects, convertImage, listAllObjects,
} from '../../../api';
import GenerateLocation from './GenerateLocation';
import CoordinatesTranslator from './CoordinatesTranslator';
import { dlog } from '../helpers/DebugLog';

class ServerCall {
  async getHomesFiltered(collection, filter, maxItems, _scene) {
    const scene = _scene;
    // homes represented, to created homes in the scene
    scene.homesRepresented = [];
    scene.homes = [];
    // console.log('scene.homesRepresented.length before', scene.homesRepresented.length);
    // console.log('scene.homes.length before', scene.homes.length);

    // when there is a loading error, the error gets thrown multiple times
    // because I subscribe to the 'loaderror' event multiple times
    // const eventNames = scene.load.eventNames();
    // dlog("eventNames", eventNames)
    const isReady = scene.load.isReady();
    dlog('isReady', isReady);
    const isLoading = scene.load.isLoading();
    dlog('isLoading', isLoading);

    // subscribe to loaderror event
    scene.load.on('loaderror', (offendingFile) => {
      this.resolveLoadError(offendingFile);
    }, this);

    // get a list of all homes objects and then filter
    Promise.all([listObjects(collection, null, maxItems)])
      .then((homesRec) => {
        // console.log('rec homes: ', homesRec);
        scene.homes = homesRec[0];
        // console.log('scene.homes', scene.homes);
        // filter only amsterdam homes
        scene.homes = scene.homes.filter((obj) => obj.key === filter);

        // retreive how many artworks are in the home
        // let tempAllArtPerUser = []

        scene.homes.forEach(
          (homeElement, homeIndex) => {
            if (typeof scene.homes[homeIndex].artWorks === 'undefined') {
              scene.homes[homeIndex].artWorks = [];
              // console.log('artWorks was undefined');
            }

            this.getAllArtworks(homeElement, homeIndex);
          },
        );
        this.generateHomes(scene);
      });
  }

  getAllArtworks(homeElement, homeIndex) {
    // console.log('this.getAllArtworks');
    const scene = ManageSession.currentScene;
    Promise.all([
      listAllObjects('drawing', homeElement.user_id),
      listAllObjects('stopmotion', homeElement.user_id)]).then(
      (artWorksArrays) => {
        // the 2 promisses create an array each, so iterate over both

        // we filter out the visible artworks
        // filter only the visible art = "permission_read": 2
        artWorksArrays[0] = artWorksArrays[0].filter((obj) => obj.permission_read === 2);
        artWorksArrays[1] = artWorksArrays[1].filter((obj) => obj.permission_read === 2);

        const allArtworks = [...artWorksArrays[0], ...artWorksArrays[1]];

        scene.homes[homeIndex].artWorks = allArtworks;
        scene.events.emit('updateArtBubbles');
      },
    );
  }

  async generateHomes(scene) {
    // check if server query is finished, then make the home from the list
    if (scene.homes != null) {
      dlog('generate homes!');
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

  updateArtBubbles() {
    // scene.homesRepresented is klaar en zijn de GameObjects
    // scene.homes bevat het aantal artWorks
    const scene = ManageSession.currentScene;

    if (!ManageSession.gameEditMode) {
      scene.homesRepresented.forEach((element, index) => {
        const artWorkLength = scene.homes[index].artWorks.length;
        element.numberOfArtworks = artWorkLength;
        element.numberArt.setText(artWorkLength);
        if (artWorkLength > 0) {
          scene.homesRepresented[index].numberArt.setVisible(true);
          scene.homesRepresented[index].numberBubble.setVisible(true);
          scene.homesRepresented[index].setData('enteringPossible', 'true');
        } else {
          scene.homesRepresented[index].numberArt.setVisible(false);
          scene.homesRepresented[index].numberBubble.setVisible(false);
          scene.homesRepresented[index].setData('enteringPossible', 'false');
        }
      });
    }
  }

  static createHome(element, index, homeImageKey, _scene) {
    const scene = _scene;

    // home description
    const locationDescription = element.value.username;

    // only show the number of artworks on the houses if we know it
    let numberOfArtworks;
    if (typeof element.artWorks === 'undefined') {
      numberOfArtworks = -1;
    } else {
      numberOfArtworks = element.artWorks.length;
    }

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

  /** Provide detailed information on a file loading error in Phaser, and provide fallback */
  resolveLoadError(offendingFile) {
    // element, index, homeImageKey, offendingFile, scene
    // ManageSession.resolveErrorObjectArray; // all loading images

    const resolveErrorObject = ManageSession.resolveErrorObjectArray.find(
      (o) => o.imageKey === offendingFile.key,
    );

    const { loadFunction } = resolveErrorObject;
    const { element } = resolveErrorObject;
    const { index } = resolveErrorObject;
    const imageKey = offendingFile.key;
    const { scene } = resolveErrorObject;

    // dlog("element, index, homeImageKey, offendingFile, scene", element, index, imageKey, scene)
    switch (loadFunction) {
      case 'getHomeImage':
        dlog('load offendingFile again', imageKey);

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

      default:
        dlog('please state fom which function the loaderror occured!');
    }
  }
} // end ServerCall

export default new ServerCall();
