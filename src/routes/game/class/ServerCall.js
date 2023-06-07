/* eslint-disable no-new */
/* eslint-disable prefer-destructuring */
import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import {
  convertImage, getAllHouses, listAllObjects,
} from '../../../helpers/nakamaHelpers';
import GenerateLocation from './GenerateLocation';
import CoordinatesTranslator from './CoordinatesTranslator';
import ArtworkList from './ArtworkList';
import { ART_FRAME_BORDER } from '../../../constants';
import { dlog } from '../../../helpers/debugLog';
import AnimalChallenge from './animalChallenge';
import { myHomeStore } from '../../../storage';

class ServerCall {
  async getHomesFiltered(filter, _scene) {
    const scene = _scene;
    // homes represented, to created homes in the scene
    scene.homesRepresented = [];
    scene.homes = [];
    // dlog('scene.homesRepresented.length before', scene.homesRepresented.length);
    // dlog('scene.homes.length before', scene.homes.length);

    // get a list of all homes objects and then filter
    Promise.all([getAllHouses(filter, null)])
      .then((homesRec) => {
        // dlog('rec homes: ', homesRec);
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

      // store element.username in a const with \n for linebreak
      let usersWithAHome = '';

      scene.homes.forEach((element, index) => {
        // add username to usersWithAHome
        usersWithAHome += `${element.username}\n`;

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
      if (ManageSession.gameEditMode) {
        dlog('usersWithAHome:');
        dlog(usersWithAHome);
      }
    }
  }

  async getHomeImages(url, element, index, homeImageKey, scene) {
    // dlog('getHomeImages');
    if (scene.textures.exists(homeImageKey)) {
      ServerCall.createHome(element, index, homeImageKey, scene);
    } else {
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
          // put the file in the loadErrorCache, in case it doesn't load
          // it get's removed from loadErrorCache when it is loaded successfully
          ManageSession.resolveErrorObjectArray.push({
            loadFunction: 'getHomeImage', element, index, imageKey: homeImageKey, scene,
          });
          scene.load.start(); // start loading the image in memory
        });
    }
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
      // scene.homesRepresented[index].setScale(1.6);
      // store the use home gameObject in ManageSession so that it can be referenced for live updating
      ManageSession.playerHomeContainer = scene.homesRepresented[index];
      // dlog('ManageSession.playerHomeContainer: ', ManageSession.playerHomeContainer);
      // dlog('ManageSession.playerHomeContainer.getAll(): ', ManageSession.playerHomeContainer.getAll());
      // subscribe to myHome if the location is the home
      let previousHome = { value: { url: '' } };

      myHomeStore.subscribe((value) => {
        // dlog('previousHome, value: ', previousHome, value);
        if (value.value.url !== '' && previousHome.value.url !== value.value.url) {
          // find the image in the container by name
          const homeImageInGame = ManageSession.playerHomeContainer.getByName('location');
          // dlog('homeImageInGame: ', homeImageInGame);
          dlog('user home image updated');
          previousHome = value;
          // dlog('value', value);
          // dlog('value.url', value.url);
          if (scene.textures.exists(value.url)) {
            homeImageInGame.setTexture(value.url);
          } else {
            scene.load.image(value.url, value.url)
              .on(`filecomplete-image-${value.url}`, () => {
                dlog('done loading new home image');
                if (homeImageInGame !== null) {
                  // dlog('homeImageInGame: ', homeImageInGame);
                  homeImageInGame.setTexture(value.url);
                }
              }, this);
            scene.load.start(); // start loading the image in memory
          }

          // dlog('ManageSession.playerHomeContainer.list[2]', ManageSession.playerHomeContainer.list[2]);
          // set the right size
          const width = 140;
          if (homeImageInGame !== null) {
            // dlog('homeImageInGame: ', homeImageInGame);
            homeImageInGame.displayWidth = width;
            homeImageInGame.scaleY = homeImageInGame.scaleX;
            const cropMargin = 1; // sometimes there is a little border visible on a drawn image
            homeImageInGame.setCrop(
              cropMargin,
              cropMargin,
              width - cropMargin,
              width - cropMargin,
            );
          }
        }
      });
    }

    scene.homesRepresented[index].setDepth(30);

    if (scene.homesRepresented[index].numberOfArtworks < 1 || ManageSession.gameEditMode) {
      scene.homesRepresented[index].numberArt.setVisible(false);
      scene.homesRepresented[index].numberBubble.setVisible(false);
      scene.homesRepresented[index].setData('enteringPossible', 'false');
    }
  }

  static getAnimalsFellowHomeArea(userHome, serverItemsArray, foundAnimals) {
    // get all homes from the server with userHome in the name, with the function getAllHouse
    Promise.all([getAllHouses(userHome, null)])
      .then((homesRec) => {
        // dlog('rec homes: ', homesRec);
        // dlog('homesRec: ', homesRec);
        // from homesRec filter out the key 'name' and put it in an array
        const homesNames = homesRec[0].map((i) => i.username);
        // dlog('homesNames: ', homesNames);

        // for every name in homesNames, check if the are in serverItemsArray,
        // if so, put them in foundAnimals and remove them from serverItemsArray
        homesNames.forEach((name) => {
          // dlog('name: ', name);

          const usersAnimals = serverItemsArray.array.filter((i) => i.username === name);

          if (usersAnimals.length > 0) {
            // dlog('usersAnimals: ', usersAnimals);
            usersAnimals.forEach((animal) => {
              // dlog('animal: ', animal);
              foundAnimals.push(animal);
              serverItemsArray.array.splice(animal, 1);
            });
          }
        });
      }); // end of getAllHouses

    // dlog('foundAnimals: ', foundAnimals);

    // add more animals to foundAnimals if there are less then 50
    if (foundAnimals.length < 50) {
      const remainderAnimals = 50 - foundAnimals.length + 5;
      for (let i = 0; i < remainderAnimals; i += 1) {
        const randomIndex = Math.floor(Math.random() * serverItemsArray.array.length);
        foundAnimals.push(serverItemsArray.array[randomIndex]);
        serverItemsArray.array.splice(randomIndex, 1);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async downloadAndPlaceArtworksByType(type, location, serverItemsArray, artSize, artMargin) {
    // const scene = ManageSession.currentScene;
    if (type === 'dier') {
      await listAllObjects('stopmotion', null).then((rec) => {
        // eslint-disable-next-line no-param-reassign
        dlog('serverItemsArray, rec : ', rec, serverItemsArray);

        // serverItemsArray.array = rec.filter((obj) => obj.permission_read === 2);
        // eslint-disable-next-line no-param-reassign
        serverItemsArray.array = rec;

        // eslint-disable-next-line no-param-reassign
        serverItemsArray.array = serverItemsArray.array.filter((obj) => obj.value.displayname.toLowerCase() === type);
        dlog('dier serverItemsArray.array', serverItemsArray.array);
        // ServerCall.handleServerArray(type, serverItemsArray, artSize, artMargin);

        let foundAnimals = serverItemsArray.array;
        // dlog('foundFlowers: ', foundFlowers);

        // if there are more then 50 flower, make a selection of flowers to show
        if (foundAnimals.length > 50) {
          // amount of flowers we found so far, empty because we wan to find new flowers
          foundAnimals = [];

          const userProfile = get(myHomeStore);
          const user = userProfile.value.username;
          dlog('user: ', user);
          const userHome = userProfile.key;
          dlog('userHome: ', userHome);

          // see if there are flowers from the user
          const animalsOfUser = serverItemsArray.array.filter((obj) => obj.username === user);
          dlog('animalsOfUser: ', animalsOfUser);

          // if there are animals from the user, add them to the foundFlowers array
          if (animalsOfUser.length > 0) {
            foundAnimals = foundAnimals.concat(animalsOfUser);
            ServerCall.getAnimalsFellowHomeArea(userHome, serverItemsArray, foundAnimals);
          } else {
            // put 50 random unique items of the serverItemsArray in the foundFlowers array
            // by removing the items from the serverItemsArray

            ServerCall.getAnimalsFellowHomeArea(userHome, serverItemsArray, foundAnimals);
          }
          // eslint-disable-next-line no-param-reassign
          serverItemsArray.array = foundAnimals;
          ServerCall.handleServerArray(type, serverItemsArray, artSize, artMargin);
          // dlog('foundFlowers: ', foundFlowers);
        } else {
          ServerCall.handleServerArray(type, serverItemsArray, artSize, artMargin);
        }
      });
    } else if (type === 'bloem') {
      await listAllObjects('drawing', null).then((rec) => {
        // eslint-disable-next-line no-param-reassign
        dlog('serverItemsArray, rec : ', rec, serverItemsArray);

        // drawings
        // eslint-disable-next-line no-param-reassign
        serverItemsArray.array = rec;

        // serverItemsArray.array = rec.filter((obj) => obj.permission_read === 2);

        // filter all 'bloem' from drawings
        // eslint-disable-next-line no-param-reassign
        serverItemsArray.array = serverItemsArray.array.filter((obj) => obj.value.displayname.toLowerCase() === type);
        dlog('bloem serverItemsArray.array', serverItemsArray.array);

        let foundFlowers = serverItemsArray.array;
        // dlog('foundFlowers: ', foundFlowers);

        // if there are more then 50 flower, make a selection of flowers to show
        if (foundFlowers.length > 50) {
          // amount of flowers we found so far, empty because we wan to find new flowers
          foundFlowers = [];

          const user = get(myHomeStore).value.username;
          dlog('user: ', user);

          // see if there are flowers from the user
          const flowersOfUser = serverItemsArray.array.filter((obj) => obj.username === user);

          // if there are flowers from the user, add them to the foundFlowers array
          if (flowersOfUser.length > 0) {
            // for loop to put the flowers in the foundFlowers array 20 times
            for (let i = 0; i < 20; i += 1) {
              foundFlowers = foundFlowers.concat(flowersOfUser);
            }

            // put 30 random unique items of the serverItemsArray in the foundFlowers array
            // by removing the items from the serverItemsArray
            for (let i = 0; i < 30; i += 1) {
              const randomIndex = Math.floor(Math.random() * serverItemsArray.array.length);
              foundFlowers.push(serverItemsArray.array[randomIndex]);
              serverItemsArray.array.splice(randomIndex, 1);
            }
          } else {
            // put 50 random unique items of the serverItemsArray in the foundFlowers array
            // by removing the items from the serverItemsArray
            for (let i = 0; i < 50; i += 1) {
              const randomIndex = Math.floor(Math.random() * serverItemsArray.array.length);
              foundFlowers.push(serverItemsArray.array[randomIndex]);
              serverItemsArray.array.splice(randomIndex, 1);
            }
          }
          ServerCall.serverHandleFlowerArray(foundFlowers, serverItemsArray, type, artSize, artMargin);
          // dlog('foundFlowers: ', foundFlowers);
        } else if (foundFlowers.length < 1) {
          ServerCall.handleServerArray(type, serverItemsArray, artSize, artMargin);
        } else {
          ServerCall.serverHandleFlowerArray(foundFlowers, serverItemsArray, type, artSize, artMargin);
        }
        // ServerCall.handleServerArray(type, serverItemsArray, artSize, artMargin);
      }); // end of bloem
    } else {
      await listAllObjects(type, location).then((rec) => {
        // eslint-disable-next-line no-param-reassign
        serverItemsArray.array = rec.filter((obj) => obj.permission_read === 2);
        // dlog('serverItemsArray: ', type, location, serverItemsArray);
        ServerCall.handleServerArray(type, serverItemsArray, artSize, artMargin);
      });
    }
  }

  static serverHandleFlowerArray(foundFlowers, serverItemsArray, type, artSize, artMargin) {
    // eslint-disable-next-line no-param-reassign
    serverItemsArray.array = foundFlowers;
    // remove the flower placeholder from the array
    serverItemsArray.shift();
    // dlog('foundFlowers: ', foundFlowers);
    // dlog('serverItemsArray: ', serverItemsArray);
    ServerCall.handleServerArray(type, serverItemsArray, artSize, artMargin);
  }

  static handleServerArray(type, serverItemsArray, artSize, artMargin) {
    dlog('serverItemsArray.array.length: ', serverItemsArray.array.length);

    if (serverItemsArray.array.length > 0) {
      // eslint-disable-next-line no-param-reassign
      serverItemsArray.startLength = serverItemsArray.array.length;
      // eslint-disable-next-line no-param-reassign
      serverItemsArray.itemsDownloadCompleted = 0;
      // eslint-disable-next-line no-param-reassign
      serverItemsArray.itemsFailed = 0;

      serverItemsArray.array.forEach((element, index, array) => {
        // dlog('element', element);
        ServerCall.downloadArtwork(element, index, array, type, artSize, artMargin);
      });
    }
  }

  loadAssetArray(scene, array, type) {
    // eslint-disable-next-line no-param-reassign
    scene.localAssetsCheck.startLength = array.length;
    array.forEach((element, index) => {
      // dlog('element', element);
      this.loadAsset(scene, element, index, type);
    });
  }



  loadAsset(scene, element, index, type) {
    if (type === 'localImage') {
      // const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);
      const imageKey = element.key;
      const path = element.path;
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadLocalImage', element, index, imageKey, scene,
      });

      scene.load.image(imageKey, path)
        .on(`filecomplete-image-${imageKey}`, () => {
          // delete from ManageSession.resolveErrorObjectArray because of succesful download
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== imageKey,
          );
          // eslint-disable-next-line no-param-reassign
          element.downloaded = true;


          // ServerCall.createDrawingContainer(element, index, artSize, artMargin);
        }, this);
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      // ManageSession.resolveErrorObjectArray.push({
      //   loadFunction: 'downloadDrawingDefaultUserHome', element, index, imageKey: imageKeyUrl, scene,
      // });

      scene.load.start(); // start the load queue to get the image in memory

      // this is fired each time a file is finished downloading (or failing)
      scene.load.on('complete', () => {
        const startLength = scene.localAssetsCheck.startLength;
        let downloadCompleted = scene.localAssetsCheck.itemsDownloadCompleted;
        // dlog('STOPMOTION loader downloadCompleted before, startLength', downloadCompleted, startLength);
        downloadCompleted += 1;
        // eslint-disable-next-line no-param-reassign
        scene.localAssetsCheck.itemsDownloadCompleted = downloadCompleted;
        // dlog('STOPMOTION loader downloadCompleted after, startLength', downloadCompleted, startLength);
        if (downloadCompleted === startLength) {
          dlog('loader localImage COMPLETE');
          // ServerCall.repositionContainers('drawing');
        }
      });
    }
  }

  static async downloadArtwork(element, index, array, type, artSize, artMargin) {
    const scene = ManageSession.currentScene;
    if (!element.value.url) { dlog('element.value.url is empty'); return; }
    const imageKeyUrl = element.value.url;
    const imgSize = artSize.toString();
    const fileFormat = 'png';
    const getImageWidth = (artSize * 100).toString();

    if (scene.textures.exists(imageKeyUrl)) {
      // if the artwork has already been downloaded
      if (type === 'drawing') {
        // eslint-disable-next-line no-param-reassign
        element.downloaded = true;
        ServerCall.createDrawingContainer(element, index, artSize, artMargin);
      } else if (type === 'stopmotion') {
        // eslint-disable-next-line no-param-reassign
        element.downloaded = true;
        ServerCall.createStopmotionContainer(element, index, artSize, artMargin);
      } else if (type === 'dier') {
        // eslint-disable-next-line no-new
        // dlog('element, index', element, index);
        new AnimalChallenge(scene, element, artSize);
      } else if (type === 'bloem') {
        // eslint-disable-next-line no-new
        // dlog('element, index', element, index);
        // push het element in flowerKeyArray
        scene.flowerKeyArray.push(imageKeyUrl);
        // scene.flowerFliedStartMaking = true;
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

          ServerCall.createDrawingContainer(element, index, artSize, artMargin);
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
          dlog('loader DRAWING COMPLETE');
          ServerCall.repositionContainers('drawing');
        }
      });
    } else if (type === 'stopmotion') {
      const convertedImage = await convertImage(imageKeyUrl, imgSize, getImageWidth, fileFormat);

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

          ServerCall.createStopmotionContainer(element, index, artSize, artMargin);
        });
      // dlog('stopmotion', imageKeyUrl);
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
          ServerCall.repositionContainers('stopmotion');
        }
      });
    } else if (type === 'dier') {
      // dlog('imageKeyUrl, element, index', imageKeyUrl, element, index);
      const convertedImage = await convertImage(imageKeyUrl, imgSize, getImageWidth, fileFormat);
      // const convertedImage = element.value.previewUrl
      // dlog('dier convertedImage', convertedImage);
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadAnimalChallenge', element, index, imageKey: imageKeyUrl, scene,
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

          // dlog('imageKeyUrl', imageKeyUrl);
          // eslint-disable-next-line no-new
          new AnimalChallenge(scene, element, artSize);
        });
      scene.load.start(); // start the load queue to get the image in memory
    } else if (type === 'avatar') {
      const convertedImage = await convertImage(imageKeyUrl, imgSize, getImageWidth, fileFormat);

      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadAvatarKey', element, index, imageKey: imageKeyUrl, scene,
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

          scene.events.emit('avatarConverted', imageKeyUrl);
        });
      // dlog('stopmotion', imageKeyUrl);
      scene.load.start(); // start the load queue to get the image in memory
    } else if (type === 'bloem') {
      // dlog('imageKeyUrl, element, index', imageKeyUrl, element, index);
      const convertedImage = await convertImage(imageKeyUrl, imgSize, getImageWidth, fileFormat);
      // const convertedImage = element.value.previewUrl
      // dlog('convertedImage', convertedImage);
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadFlowerChallenge', element, index, imageKey: imageKeyUrl, scene,
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

          // push het element in flowerKeyArray
          // dlog('imageKeyUrl, convertedImage', imageKeyUrl, convertedImage);
          scene.flowerKeyArray.push(imageKeyUrl);
          // scene.flowerFliedStartMaking = true;
        }, this);
      scene.load.start(); // start the load queue to get the image in memory

      // on('complete') fires each time an image is finished downloading
      // scene.load.on('complete', () => {

      // });
    }
  }

  static createDrawingContainer(element, index, artSize, artMargin) {
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

  static createStopmotionContainer(element, index, artSize, artMargin) {
    const scene = ManageSession.currentScene;

    const imageKeyUrl = element.value.url;
    const y = artSize * 1.4;
    const artBorder = ART_FRAME_BORDER;

    const artStart = 38; // start the art on the left side

    const coordX = index === 0 ? artStart : (artStart) + (index * (artSize + artMargin));
    const imageContainer = scene.add.container(0, 0).setDepth(100);

    imageContainer.add(scene.add.image(0, 0, 'artFrame_512').setOrigin(0).setName('frame'));

    // dlog('STOPMOTION element, index, artSize, artMargin', element, index, artSize, artMargin);
    const avatar = scene.textures.get(imageKeyUrl);
    // eslint-disable-next-line no-underscore-dangle
    const avatarWidth = avatar.frames.__BASE.width;
    // dlog('stopmotion width: ', avatarWidth);

    // eslint-disable-next-line no-underscore-dangle
    const avatarHeight = avatar.frames.__BASE.height;
    // dlog(`stopmotion Height: ${avatarHeight}`);

    const avatarFrames = Math.round(avatarWidth / avatarHeight);
    let setFrameRate = 0;
    if (avatarFrames > 1) { setFrameRate = (avatarFrames); } else {
      setFrameRate = 0;
    }
    // dlog(`stopmotion Frames: ${avatarFrames}`);

    // animation for the player avatar .........................
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
    // . end animation for the player avatar ......................

    // adds the image to the container
    const completedImage = scene.add.sprite(
      0 + artBorder,
      0 + artBorder,
      imageKeyUrl,
    ).setOrigin(0);
    completedImage.setName('stopmotion');
    imageContainer.add(completedImage);

    completedImage.setData('playAnim', `moving_${imageKeyUrl}`);
    completedImage.setData('stopAnim', `stop_${imageKeyUrl}`);
    if (avatarFrames > 1) {
      completedImage.play(`moving_${imageKeyUrl}`);
    }

    const containerSize = artSize + artBorder;
    const tempX = containerSize - artMargin;
    const tempY = containerSize + artBorder;
    ArtworkList.placeHeartButton(scene, tempX, tempY, imageKeyUrl, element, imageContainer);
    ArtworkList.placePlayPauseButton(scene, tempX, tempY, imageKeyUrl, element, imageContainer);
    imageContainer.setPosition(coordX, y);
    imageContainer.setSize(containerSize, containerSize);
    scene.stopmotionGroup.add(imageContainer);
  }

  static repositionContainers(type) {
    // if there are images that didn't download, reorder the containers
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
    // const artBorder = ART_FRAME_BORDER;

    // give each container a position according to the place in the index
    // const y = artSize * 2.4;

    const artStart = 38; // start the art on the left side
    containers.forEach((element, index) => {
      const coordX = index === 0 ? artStart : (artStart) + (index * (artSize + artMargin));
      element.setX(coordX);
      // dlog('reposition: coordX', coordX);
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
    let flowerKeyArray;
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
        // dlog('ManageSession.resolveErrorObjectArray', ManageSession.resolveErrorObjectArray);

        break;

      case 'downloadStopmotionDefaultUserHome':
        dlog('offending stopmotion loading failed, removing from array');
        // eslint-disable-next-line no-case-declarations
        const userStopmotionServerList = scene.userStopmotionServerList;
        // delete from scene.userStopmotionServerList

        userStopmotionServerList.array = userStopmotionServerList.array.filter((obj) => obj.value.url !== imageKey);

        // delete from ManageSession.resolveErrorObjectArray
        ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
          (obj) => obj.imageKey !== imageKey,
        );

        break;

      case 'downloadAnimalChallenge':
        dlog('offending dier loading failed, removing from array');
        // eslint-disable-next-line no-case-declarations
        const userServerList = scene.animalArray;
        // delete from scene.userStopmotionServerList

        userServerList.array = userServerList.array.filter((obj) => obj.value.url !== imageKey);

        // delete from ManageSession.resolveErrorObjectArray
        ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
          (obj) => obj.imageKey !== imageKey,
        );

        break;

      case 'downloadAvatarKey':
        dlog('loading avatar conversion failed');
        ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
          (obj) => obj.imageKey !== imageKey,
        );
        break;

      case 'downloadFlowerChallenge':
        dlog('loading flower for FlowerFlieldChallenge failed');

        dlog(`remove ${imageKey} from flowerKeyArray`);
        flowerKeyArray = scene.flowerKeyArray;
        // delete from scene.userStopmotionServerList

        flowerKeyArray.array = flowerKeyArray.array.filter((obj) => obj.value.url !== imageKey);

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
