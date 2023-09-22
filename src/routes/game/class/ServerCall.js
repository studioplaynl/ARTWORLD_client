/**
 * @file ServerCall.js
 * @author Maarten
 *
 *  What is this file for?
 *  ======================
 *  This file contains all the functions that make calls to the server from the game.
 *  It also contains the functions that handle the data that comes back from the server.
 *  Like handling houses, drawings, stopmotions, etc.
 *
 */

/* eslint-disable no-new */
/* eslint-disable prefer-destructuring */
import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import {
  convertImage, getAllHouses, listAllObjects, getAccount,
} from '../../../helpers/nakamaHelpers';
import GenerateLocation from './GenerateLocation';
import CoordinatesTranslator from './CoordinatesTranslator';
import ArtworkOptions from './ArtworkOptions';
import { ART_FRAME_BORDER, AVATAR_SPRITESHEET_LOAD_SIZE } from '../../../constants';
import { dlog } from '../../../helpers/debugLog';
import AnimalChallenge from './animalChallenge';
import { myHomeStore, Liked, ModeratorLiked } from '../../../storage';

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
        // dlog('homesRec: ', homesRec[0]);
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
      // this is for debug purposes
      let usersWithAHome = '';

      scene.homes.forEach((element, index) => {
        // add username to usersWithAHome
        usersWithAHome += `${element.username}\n`;

        // dlog(element, index)
        const homeImageKey = `homeKey_${element.user_id}`;
        // get a image url for each home
        // get converted image from AWS
        const { url } = element.value;

        // get the image server side
        this.getHomeImages(url, element, index, homeImageKey, scene);
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
              // //! TODO
              // console.log(ManageSession.resolveErrorObjectArray.filter(
              //   (obj) => obj.loadFunction === 'getHomeImage',
              // ));
              // const getHomeImageList = ManageSession.resolveErrorObjectArray.filter(
              //   (obj) => obj.loadFunction === 'getHomeImage',
              // );
              // if (getHomeImageList.length === 0) console.log('loading home images completed');
              // //! TODO
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
    // if there is a display_name of the user we use that
    // otherwise we fall back to the username of the user
    let locationDescription = '';

    if (element.display_name && element.display_name !== '') {
      locationDescription = element.display_name;
    } else {
      locationDescription = element.username;
    }

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
      referenceName: element.username,
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

    // set a subscription on the user home object for when the image is updated
    // to update it in game
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

  static async filterFellowHomeAreaObjects(userHomeArea, user, serverItemsArray) {
    // get all homes from the server with userHome in the name, with the function getAllHouse
    const homesRec = await getAllHouses(userHomeArea, null);
    // dlog('homesRec: ', homesRec);
    // from homesRec filter out the key 'name' and put it in an array
    const namesInHomeAreaWithoutUser = homesRec
      .map((i) => i.username)
      .filter((i) => i !== user);
    // dlog('homesNames: ', namesInHomeAreaWithoutUser);
    // dlog('serverItemsArray: ', serverItemsArray);

    // Filter serverItemsArray for objects whose username exists in namesInHomeAreaWithoutUser
    const objectsOfFellowsOfUser = serverItemsArray.filter((obj) => namesInHomeAreaWithoutUser.includes(obj.username));
    // dlog('objectsOfFellowsOfUser: ', objectsOfFellowsOfUser);
    // Filter serverItemsArray for objects whose username doesn't exist in namesInHomeAreaWithoutUser
    const remainingItemsArray = serverItemsArray.filter((obj) => !namesInHomeAreaWithoutUser.includes(obj.username));
    // dlog('remainingItemsArray: ', remainingItemsArray);

    return { objectsOfFellowsOfUser, remainingItemsArray };
  }

  static getRandomElements(arr, count) {
    const randomElements = [];
    const usedIndexes = new Set(); // To keep track of already selected indexes

    while (randomElements.length < count && randomElements.length < arr.length) {
      const randomIndex = Math.floor(Math.random() * arr.length);

      if (!usedIndexes.has(randomIndex)) {
        randomElements.push(arr[randomIndex]);
        usedIndexes.add(randomIndex);
      }
    }

    return randomElements;
  }

  // eslint-disable-next-line class-methods-use-this
  async downloadAndPlaceArtByType(type, userId, serverItemsArray, artSize, artMargin) {
    // const scene = ManageSession.currentScene;
    if (type === 'dier') {
      let allFoundAnimals;
      let animalsOfUser;
      let allAnimalNotOfUser;

      const recStopmotion = await listAllObjects('stopmotion', null);
      const recAnimalChallenge = await listAllObjects('animalchallenge', null);

      // dlog('recAnimalChallenge : ', recAnimalChallenge);
      // filter out all stopmotion with displayname 'dier and who are not in the trash
      allFoundAnimals = recStopmotion.filter((obj) => obj.value.displayname.toLowerCase() === type
        && obj.value.status !== 'trash');
      // dlog('allFoundAnimals', allFoundAnimals);


      // Adding animalchallenge results to foundAnimals
      // exclude animals that are in the trash
      const filteredRecAnimalChallenge = recAnimalChallenge.filter((obj) => obj.value.status !== 'trash');
      allFoundAnimals = allFoundAnimals.concat(filteredRecAnimalChallenge);

      // dlog('allFoundAnimals', allFoundAnimals);

      const maxAnimalsInGarden = 40;

      // if there are only few animal we use them all, otherwise we filter
      if (allFoundAnimals.length > maxAnimalsInGarden) {
        // when there are a lot of animals we prioritize the users animals
        const userProfile = get(myHomeStore);
        const user = userProfile.value.username;
        // dlog('user: ', user);
        const userHomeArea = userProfile.key;
        // dlog('userHomeArea: ', userHomeArea);

        // filter out all animals of users and all animals not of user
        const results = allFoundAnimals.reduce((acc, obj) => {
          if (obj.username === user) {
            acc.animalsOfUser.push(obj);
          } else {
            acc.allAnimalNotOfUser.push(obj);
          }
          return acc;
        }, { animalsOfUser: [], allAnimalNotOfUser: [] });

        animalsOfUser = results.animalsOfUser;
        allAnimalNotOfUser = results.allAnimalNotOfUser;

        // dlog('animalsOfUser: ', animalsOfUser);

        const { objectsOfFellowsOfUser, remainingItemsArray } = await ServerCall.filterFellowHomeAreaObjects(
          userHomeArea,
          user,
          allAnimalNotOfUser,
        );

        // dlog('objectsOfFellowsOfUser: ', objectsOfFellowsOfUser);
        // dlog('remainingItemsArray: ', remainingItemsArray);

        //         max 5 items of animalsOfUser
        // max 20 items of animalsOfFellowsOfUser
        // and fill the rest of animalArray to a max of 40 with items of allFoundAnimals
        const userAnimals = animalsOfUser.slice(0, 5);
        dlog('userAnimals: ', userAnimals);
        const fellowAnimals = objectsOfFellowsOfUser.slice(0, 20);

        const remainingLength = 40 - (userAnimals.length + fellowAnimals.length);

        const shuffledOtherAnimals = ServerCall.shuffleArray([...remainingItemsArray]); // Create a copy and shuffle it
        const otherAnimals = shuffledOtherAnimals.slice(0, remainingLength);

        // const otherAnimals = allOtherAnimals.slice(0, remainingLength);

        const animalArray = [...userAnimals, ...fellowAnimals, ...otherAnimals];


        // eslint-disable-next-line no-param-reassign
        serverItemsArray.array = animalArray;
        ServerCall.handleServerArray(type, serverItemsArray, artSize, artMargin);
      } else {
        // we use all available animals
        // eslint-disable-next-line no-param-reassign
        serverItemsArray.array = allFoundAnimals;
        ServerCall.handleServerArray(type, allFoundAnimals, artSize, artMargin);
      } // end of dier
    } else if (type === 'bloem') {
      let allFoundFlowers;
      let flowersOfUser;
      let allFlowersNotOfUser;

      const recDrawing = await listAllObjects('drawing', null);
      const recFlowerChallenge = await listAllObjects('flowerchallenge', null);

      // dlog('recAnimalChallenge : ', recAnimalChallenge);
      // filter out all stopmotion with displayname 'dier and who are not in the trash
      allFoundFlowers = recDrawing.filter((obj) => obj.value.displayname.toLowerCase() === type
        && obj.value.status !== 'trash');
      // dlog('allFoundAnimals', allFoundAnimals);


      // Adding animalchallenge results to foundAnimals
      // exclude animals that are in the trash
      const filteredRecFlowerChallenge = recFlowerChallenge.filter((obj) => obj.value.status !== 'trash');
      allFoundFlowers = allFoundFlowers.concat(filteredRecFlowerChallenge);

      // dlog('allFoundAnimals', allFoundAnimals);

      const maxDifferentFlowersInGarden = 20;

      // if there are only few animal we use them all, otherwise we filter
      if (allFoundFlowers.length > maxDifferentFlowersInGarden) {
        // when there are a lot of animals we prioritize the users animals
        const userProfile = get(myHomeStore);
        const user = userProfile.value.username;
        // dlog('user: ', user);
        const userHomeArea = userProfile.key;
        // dlog('userHomeArea: ', userHomeArea);

        // filter out all animals of users and all animals not of user
        const results = allFoundFlowers.reduce((acc, obj) => {
          if (obj.username === user) {
            acc.flowersOfUser.push(obj);
          } else {
            acc.allFlowersNotOfUser.push(obj);
          }
          return acc;
        }, { flowersOfUser: [], allFlowersNotOfUser: [] });

        flowersOfUser = results.flowersOfUser;
        allFlowersNotOfUser = results.allFlowersNotOfUser;

        // dlog('animalsOfUser: ', animalsOfUser);

        const { objectsOfFellowsOfUser, remainingItemsArray } = await ServerCall.filterFellowHomeAreaObjects(
          userHomeArea,
          user,
          allFlowersNotOfUser,
        );

        // dlog('objectsOfFellowsOfUser: ', objectsOfFellowsOfUser);
        // dlog('remainingItemsArray: ', remainingItemsArray);

        //         max 5 items of animalsOfUser
        // max 20 items of animalsOfFellowsOfUser
        // and fill the rest of animalArray to a max of 40 with items of allFoundAnimals
        const amountOfFlowersOfUser = 3;
        const userFlowers = flowersOfUser.slice(0, amountOfFlowersOfUser);
        dlog('userFlowers: ', userFlowers);
        const maxAmauntOfFellowFlowers = Math.floor(maxDifferentFlowersInGarden - userFlowers.length) / 2;
        const fellowFlowers = objectsOfFellowsOfUser.slice(0, maxAmauntOfFellowFlowers);

        const remainingLength = maxDifferentFlowersInGarden - (userFlowers.length + fellowFlowers.length);

        const shuffledOtherFlowers = ServerCall.shuffleArray([...remainingItemsArray]); // Create a copy and shuffle it
        const otherFlowers = shuffledOtherFlowers.slice(0, remainingLength);

        // const otherAnimals = allOtherAnimals.slice(0, remainingLength);

        const animalArray = [...userFlowers, ...fellowFlowers, ...otherFlowers];


        // eslint-disable-next-line no-param-reassign
        serverItemsArray.array = animalArray;
        ServerCall.handleServerArray(type, serverItemsArray, artSize, artMargin);
      } else {
        // we use all available animals
        // eslint-disable-next-line no-param-reassign
        serverItemsArray.array = allFoundFlowers;
        ServerCall.handleServerArray(type, allFoundFlowers, artSize, artMargin);
      }// end of bloem
    } else if (type === 'likedDrawing') {
      // async get the liked stores and handle the data when they are loaded
      ServerCall.getLikedStores(serverItemsArray)
        .then((randomLiked) => {
          // eslint-disable-next-line no-param-reassign
          serverItemsArray = randomLiked;
          // console.log('type, randomLiked, artSize, artMargin: ', type, serverItemsArray, artSize, artMargin);
          ServerCall.handleServerArray(type, serverItemsArray, artSize, artMargin);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } else {
      await listAllObjects(type, userId).then((rec) => {
        // eslint-disable-next-line no-param-reassign
        serverItemsArray.array = rec
          .filter((obj) => obj.permission_read === 2)
          .sort((a, b) => new Date(a.update_time) - new Date(b.update_time));
        // sorting by update_time in descending order

        serverItemsArray.array.forEach((element) => console.log(element.update_time));
        dlog('serverItemsArray: ', type, userId, serverItemsArray);
        ServerCall.handleServerArray(type, serverItemsArray, artSize, artMargin);
      });
    }
  }

  static async getLikedStores() {
    return new Promise((resolve, reject) => {
      try {
        this.userLikedArt = Liked.get() || [];
        this.moderatorLikedArt = ModeratorLiked.get() || [];

        if (!Array.isArray(this.userLikedArt) || !Array.isArray(this.moderatorLikedArt)) {
          reject(new Error('Data from stores is not in the expected format'));
          return;
        }

        this.allLikedArt = [...this.userLikedArt, ...this.moderatorLikedArt];

        this.stopmotionLiked = this.allLikedArt.filter((art) => art.value.collection === 'stopmotion');
        this.drawingLiked = this.allLikedArt.filter((art) => art.value.collection === 'drawing');

        this.randomLiked = {};
        // eslint-disable-next-line no-param-reassign
        this.randomLiked.array = ServerCall.getRandomElements(this.drawingLiked, 4);
        // console.log('this.randomLiked: ', this.randomLiked);

        resolve(this.randomLiked);
      } catch (error) {
        reject(error);
      }
    });
  }

  static shuffleArray(inputArray) {
    const array = [...inputArray]; // Create a copy of the input array
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

    /* we keep stats on the array when we begin downloading media
    *  if media does not download down the line, it will be removed from the list
    *  and it will be marked as itemsFailed */

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

  async loadAssetArray(scene, array, type) {
    // eslint-disable-next-line no-param-reassign
    scene.localAssetsCheck.startLength = array.length;
    dlog('array.length: ', array.length);
    array.forEach((element, index) => {
      // dlog('element', element);
      this.loadAsset(scene, element, index, type);
    });
    console.log('ManageSession.resolveErrorObjectArray: ', ManageSession.resolveErrorObjectArray);
  }

  // eslint-disable-next-line class-methods-use-this
  async loadAsset(scene, element, index, type) {
    if (type === 'localImage') {
      // const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);
      // const imageKey = element.key;
      const path = element.path;
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        //! FINISH this!
        loadFunction: 'localImage', element, index, imageKey: element.key, scene,
      });

      scene.load.image(element.key, path)
        .on(`filecomplete-image-${element.key}`, () => {
          // dlog('filecomplete-image-$ element.key: ,', element.key);
          // delete from ManageSession.resolveErrorObjectArray because of succesful download
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== element.key,
          );
          // eslint-disable-next-line no-param-reassign
          element.downloaded = true;
          // ServerCall.createDrawingContainer(element, index, artSize, artMargin);
        }, scene);
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      // ManageSession.resolveErrorObjectArray.push({
      //   loadFunction: 'downloadDrawingDefaultUserHome', element, index, imageKey: imageKeyUrl, scene,
      // });

      scene.load.start(); // start the load queue to get the image in memory

      // this is fired each time a file is finished downloading (or failing)
      scene.load.once('complete', () => {
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
    if (!element.value.url || !element.value) { dlog('element.value.url is empty'); return; }

    const imageKeyUrl = element.value.url;
    // console.log('imageKeyUrl: ', imageKeyUrl);
    // console.log('element: ', element);
    const imgSize = artSize.toString();
    const fileFormat = 'png';
    const getImageWidth = (artSize * 100).toString();

    // console.log('scene.textures.exists(imageKeyUrl): ', scene.textures.exists(imageKeyUrl));
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
      } else if (type === 'likedDrawing') {
        // eslint-disable-next-line no-param-reassign
        element.downloaded = true;
        ServerCall.createDrawingContainer(element, index, artSize, artMargin);
      }
      // if the artwork is not already downloaded
    } else if (type === 'drawing') {
      const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);

      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadDrawingDefaultUserHome', element, index, imageKey: imageKeyUrl, scene, resolved: false,
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
        }, scene);
      // .on('fileprogress', (file, progress) => {
      //   console.log('file: ', file);

      //   console.log('progress: ', progress);
      // }, scene);
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      // ManageSession.resolveErrorObjectArray.push({
      //   loadFunction: 'downloadDrawingDefaultUserHome', element, index, imageKey: imageKeyUrl, scene,
      // });

      scene.load.start(); // start the load queue to get the image in memory

      // this is fired each time a file is finished downloading (or failing)
      scene.load.on('complete', () => {
        const startLength = scene.userHomeDrawingServerList.startLength;
        let downloadCompleted = scene.userHomeDrawingServerList.itemsDownloadCompleted;
        // dlog('STOPMOTION loader downloadCompleted before, startLength', downloadCompleted, startLength);
        downloadCompleted += 1;
        scene.userHomeDrawingServerList.itemsDownloadCompleted = downloadCompleted;
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
    } else if (type === 'likedDrawing') {
      // console.log(imageKeyUrl, imgSize, imgSize, fileFormat);
      const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);

      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadLikedDrawing', element, index, imageKey: imageKeyUrl, scene, resolved: false,
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

          ServerCall.createLikedDrawingContainer(element, index, artSize, artMargin);
          // dlog("ManageSession.resolveErrorObjectArray", ManageSession.resolveErrorObjectArray)
          // create the home
          // ServerCall.createHome(element, index, homeImageKey, scene);
        }, scene);
      // .on('fileprogress', (file, progress) => {
      //   console.log('file: ', file);

      //   console.log('progress: ', progress);
      // }, scene);
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      // ManageSession.resolveErrorObjectArray.push({
      //   loadFunction: 'downloadDrawingDefaultUserHome', element, index, imageKey: imageKeyUrl, scene,
      // });

      scene.load.start(); // start the load queue to get the image in memory

      // this is fired each time a file is finished downloading (or failing)
      // scene.load.on('complete', () => {
      //   const startLength = scene.randomLiked.startLength;
      //   let downloadCompleted = scene.randomLiked.itemsDownloadCompleted;
      //   // dlog('STOPMOTION loader downloadCompleted before, startLength', downloadCompleted, startLength);
      //   downloadCompleted += 1;
      //   scene.randomLiked.itemsDownloadCompleted = downloadCompleted;
      //   // dlog('STOPMOTION loader downloadCompleted after, startLength', downloadCompleted, startLength);
      //   if (downloadCompleted === startLength) {
      //     dlog('loader DRAWING COMPLETE');
      //     ServerCall.repositionContainers('drawing');
      //   }
      // });
    }
  }

  static getContainerBounds(container) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    container.list.forEach((child) => {
      const left = child.x - child.displayWidth * child.originX;
      const right = child.x + child.displayWidth * (1 - child.originX);
      const top = child.y - child.displayHeight * child.originY;
      const bottom = child.y + child.displayHeight * (1 - child.originY);

      minX = Math.min(minX, left);
      maxX = Math.max(maxX, right);
      minY = Math.min(minY, top);
      maxY = Math.max(maxY, bottom);
    });

    return {
      x: minX,
      y: maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  static async loadUserAndSpritesheet(element, scene) {
    const user = await getAccount(element.user_id);
    if (!user || !user.url) {
      console.error("Failed to fetch user data or user's avatar URL is missing");
      return;
    }
    // console.log('user: ', user);
    // 2. Load the Spritesheet
    ServerCall.loadSpritesheetForUser(user, scene);
    // .then((fileNameCheck) => fileNameCheck);
  }

  static loadSpritesheetForUser(user, scene) {
    const fileNameCheck = `${user.id}_${user.update_time}`;

    convertImage(
      user.avatar_url,
      AVATAR_SPRITESHEET_LOAD_SIZE,
      AVATAR_SPRITESHEET_LOAD_SIZE * 100,
      'png',
    ).then((url) => {
      console.log('url: ', url);
      scene.load.spritesheet(
        fileNameCheck,
        url,
        {
          frameWidth: AVATAR_SPRITESHEET_LOAD_SIZE,
          frameHeight: AVATAR_SPRITESHEET_LOAD_SIZE,
        },
      ).on(`filecomplete-spritesheet-${fileNameCheck}`, () => {
        console.log('fileNameCheck: ', fileNameCheck);
        return fileNameCheck;
      });
      scene.load.start(); // start loading the image in memory
    });
  }

  static async createLikedDrawingContainer(element, index) {
    const scene = ManageSession.currentScene;
    // console.log('element, index, artSize, artMargin, scene: ', element, index, artSize, artMargin, scene);
    // console.log('scene.balloonContainer.getWidth(): ', ServerCall.getContainerBounds(scene.balloonContainer));
    // console.log('element: ', element);
    const user = await getAccount(element.value.user_id);
    if (!user || !user.url) {
      console.error("Failed to fetch user data or user's avatar URL is missing");
      console.log('element: ', element);
      const {
        width,
      } = ServerCall.getContainerBounds(scene.balloonContainer);

      let placeX;
      // let placeY;
      if (index === 0) {
        placeX = width;
      } else {
        placeX = width + 20;
      }
      const placeY = 200;

      const imageKeyUrl = element.value.url;


      // place the background (white image)
      scene.balloonContainer.add(scene.add.image(placeX - 5, placeY, 'artFrame_512').setOrigin(0.5).setScale(0.5));

      // adds the image to the container
      scene.balloonContainer.add(scene.add.image(placeX, placeY, imageKeyUrl).setOrigin(0.5));
      return;
    }
    // console.log('user: ', user);

    const fileNameCheck = `${user.id}_${user.update_time}`;

    convertImage(
      user.avatar_url,
      AVATAR_SPRITESHEET_LOAD_SIZE,
      AVATAR_SPRITESHEET_LOAD_SIZE * 100,
      'png',
    ).then((url) => {
      // console.log('url: ', url);
      scene.load.spritesheet(
        fileNameCheck,
        url,
        {
          frameWidth: AVATAR_SPRITESHEET_LOAD_SIZE,
          frameHeight: AVATAR_SPRITESHEET_LOAD_SIZE,
        },
      ).on(`filecomplete-spritesheet-${fileNameCheck}`, () => {
        console.log('fileNameCheck: ', fileNameCheck);

        const {
          width,
        } = ServerCall.getContainerBounds(scene.balloonContainer);

        let placeX;
        // let placeY;
        if (index === 0) {
          placeX = width;
        } else {
          placeX = width + 20;
        }
        const placeY = 200;

        const imageKeyUrl = element.value.url;


        // place the background (white image)
        scene.balloonContainer.add(scene.add.image(placeX - 5, placeY, 'artFrame_512').setOrigin(0.5).setScale(0.5));

        // adds the image to the container
        scene.balloonContainer.add(scene.add.image(placeX, placeY, imageKeyUrl).setOrigin(0.5));
      });
      scene.load.start(); // start loading the image in memory
    });
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
    ArtworkOptions.placeHeartButton(scene, tempX, tempY, imageKeyUrl, element, imageContainer);
    imageContainer.setPosition(coordX, y);
    imageContainer.setSize(containerSize, containerSize);
    scene.homeDrawingGroup.add(imageContainer);
    // dlog('scene.homeDrawingGroup.getChildren()', scene.homeDrawingGroup.getChildren());
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
    ArtworkOptions.placeHeartButton(scene, tempX, tempY, imageKeyUrl, element, imageContainer);
    ArtworkOptions.placePlayPauseButton(scene, tempX, tempY, imageKeyUrl, element, imageContainer);
    imageContainer.setPosition(coordX, y);
    imageContainer.setSize(containerSize, containerSize);
    scene.homeStopmotionGroup.add(imageContainer);
  }

  static repositionContainers(type) {
    // if there are images that didn't download, reorder the containers
    // get the children of the stopmotion group
    const scene = ManageSession.currentScene;
    let containers = {};

    if (type === 'drawing') {
      containers = scene.homeDrawingGroup.getChildren();
    } else if (type === 'stopmotion') {
      containers = scene.homeStopmotionGroup.getChildren();
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
    // let targetObject;
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

        // delete from scene.userHomeDrawingServerList
        // eslint-disable-next-line max-len
        scene.userHomeDrawingServerList.array = scene.userHomeDrawingServerList.array.filter((obj) => obj.value.url !== imageKey);

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

      case 'localImage':
        dlog('loading localImage failed');

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
