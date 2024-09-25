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

import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import {
  convertImage,
  getAllHouses,
  listAllObjects,
  getAccount,
  getObject,
  updateObject,
} from '../../../helpers/nakamaHelpers';
import { HomeEditBarExpanded, Profile, ShowHomeEditBar } from '../../../session';
import GenerateLocation from './GenerateLocation';
import CoordinatesTranslator from './CoordinatesTranslator';
import ArtworkOptions from './ArtworkOptions';
import { HomeElements, homeElement_Selected } from '../../../storage';

import { ART_FRAME_BORDER, AVATAR_SPRITESHEET_LOAD_SIZE } from '../../../constants';

import { dlog } from '../../../helpers/debugLog';
import AnimalChallenge from './animalChallenge';
import { myHomeStore, Liked, ModeratorLiked } from '../../../storage';
import { PlayerLocation, PlayerUpdate, PlayerPos } from '../playerState';

import * as Phaser from 'phaser';

class ServerCall {
  constructor() {

  }

  async checkIfHomeSelf(_location) {
    let profile = get(Profile);

    ShowHomeEditBar.set(profile.id === _location);
    return get(ShowHomeEditBar);
  }

  async getHomeElements(_location) {
    // stores serverobject in homeElements_Store
    await HomeElements.getFromServer(_location);
    console.log('FINISHED servercall: await ServerCall.getHomeElements(this.location)');

    // if there are no homeElements the home is still old version
    // we load a standard drawingGallery and stopMotionGallery
    // we do this reactively in UIScene

  }

  async getHomesFiltered(filter, _scene) {
    const scene = _scene;
    // homes represented, the images / gameObjects to represent homes in the scene
    scene.homesRepresented = [];
    scene.homes = [];
    // dlog('scene.homesRepresented.length before', scene.homesRepresented.length);
    // dlog('scene.homes.length before', scene.homes.length);

    // get a list of all homes objects and then filter
    Promise.all([getAllHouses(filter, null)]).then((homesRec) => {
      // dlog('homesRec: ', homesRec[0]);
      scene.homes = homesRec[0];
      // dlog('scene.homes', scene.homes);

      this.generateHomes(scene);
    });
  }

  async generateHomes(scene) {
    // check if server query is finished, then make the home from the list
    if (scene.homes === null) return;
      // dlog('generate homes!');
      // dlog('scene.homes', scene.homes);

      // store element.username in a const with \n for linebreak
      // this is for debug purposes
      let usersWithAHome = '';

      scene.homes.forEach((element, index) => {
        // add username to usersWithAHome
        usersWithAHome += `${element.username}\n`;

        // dlog(element, index)
        //unique key for home image also when updated
        const homeImageKey = `homeKey_${element.user_id}_${element.update_time}`;
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

  async getHomeImages(url, element, index, homeImageKey, scene) {
    // dlog('getHomeImages');
    if (scene.textures.exists(homeImageKey)) {
      ServerCall.createHome(element, index, homeImageKey, scene);
    } else {
      await convertImage(url, '128', '128', 'png').then((rec) => {
        // dlog("rec", rec)
        // load all the images to phaser
        scene.load.image(homeImageKey, rec).on(
          `filecomplete-image-${homeImageKey}`,
          () => {
            // delete from ManageSession.resolveErrorObjectArray
            ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
              (obj) => obj.imageKey !== homeImageKey
            );

            ServerCall.createHome(element, index, homeImageKey, scene);
          },
          this
        );
        // put the file in the loadErrorCache, in case it doesn't load
        // it get's removed from loadErrorCache when it is loaded successfully
        ManageSession.resolveErrorObjectArray.push({
          loadFunction: 'getHomeImage',
          element,
          index,
          imageKey: homeImageKey,
          scene,
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
      parentScene: scene.scene.key,
      userHome: element.user_id,
      draggable: ManageSession.gameEditMode,
      type: 'image',
      x: CoordinatesTranslator.artworldToPhaser2DX(scene.worldSize.x, element.value.posX),
      y: CoordinatesTranslator.artworldToPhaser2DY(scene.worldSize.y, element.value.posY),
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
    }

    scene.homesRepresented[index].setDepth(30);

    if (scene.homesRepresented[index].numberOfArtworks < 1 || ManageSession.gameEditMode) {
      scene.homesRepresented[index].numberArt.setVisible(false);
      scene.homesRepresented[index].numberBubble.setVisible(false);
      scene.homesRepresented[index].setData('enteringPossible', 'false');
    }
  }

  static async filterFellowHomeAreaObjects(userHomeArea, user, serverObjectsHandler) {
    // get all homes from the server with userHome in the name, with the function getAllHouse
    const homesRec = await getAllHouses(userHomeArea, null);
    // dlog('homesRec: ', homesRec);
    // from homesRec filter out the key 'name' and put it in an array
    const namesInHomeAreaWithoutUser = homesRec.map((i) => i.username).filter((i) => i !== user);
    // dlog('homesNames: ', namesInHomeAreaWithoutUser);
    // dlog('serverObjectsHandler: ', serverObjectsHandler);

    // Filter serverObjectsHandler for objects whose username exists in namesInHomeAreaWithoutUser
    const objectsOfFellowsOfUser = serverObjectsHandler.filter((obj) =>
      namesInHomeAreaWithoutUser.includes(obj.username)
    );

    // dlog('objectsOfFellowsOfUser: ', objectsOfFellowsOfUser);
    // Filter serverObjectsHandler for objects whose username doesn't exist in namesInHomeAreaWithoutUser
    const remainingItemsArray = serverObjectsHandler.filter(
      (obj) => !namesInHomeAreaWithoutUser.includes(obj.username)
    );

    // dlog('remainingItemsArray: ', remainingItemsArray);

    return { objectsOfFellowsOfUser, remainingItemsArray };
  }

  updateHomeImage(scene, value) {
    // this is called from UIScene which is subscribed to $myHomeStore
    let previousHome = { value: { url: '' } };

    dlog('ServerCall.updateHomeImage');

    // dlog('previousHome, value: ', previousHome, value);
    if (value.value.url !== '' && previousHome.value.url !== value.value.url) {
      // find the image in the container by name
      if (!ManageSession.playerHomeContainer) return;
      const homeImageInGame = ManageSession.playerHomeContainer.getByName('location');
      // dlog('homeImageInGame: ', homeImageInGame);
      dlog('user home image updated');
      previousHome = value;
      // dlog('value', value);
      // dlog('value.url', value.url);
      if (scene.textures.exists(value.url)) {
        homeImageInGame.setTexture(value.url);
      } else {
        scene.load.image(value.url, value.url).on(
          `filecomplete-image-${value.url}`,
          () => {
            dlog('done loading new home image');
            if (homeImageInGame !== null) {
              // dlog('homeImageInGame: ', homeImageInGame);
              homeImageInGame.setTexture(value.url);
            }
          },
          this
        );
        scene.load.start(); // start loading the image in memory
      }

      // set the right size
      const width = 140;
      if (!homeImageInGame) return;
      // dlog('homeImageInGame: ', homeImageInGame);
      homeImageInGame.displayWidth = width;
      homeImageInGame.scaleY = homeImageInGame.scaleX;
      // // sometimes there is a little border visible on a drawn image; we crop it off
      // const cropMargin = 1;
      // homeImageInGame.setCrop(cropMargin, cropMargin, width - cropMargin, width - cropMargin);
    }
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

  /* this function first gets all the objects from the server
   *  it filters out the objects that are not in the trash
   *  then it sends the array to the function handleServerArray
   */

  async downloadAndPlaceArtByType({ type, serverObjectsHandler, artSize, artMargin }) {
    // const scene = ManageSession.currentScene;
    if (type === 'dier') {
      let allFoundAnimals;
      let animalsOfUser;
      let allAnimalNotOfUser;

      const recStopmotion = await listAllObjects('stopmotion', null);
      const recAnimalChallenge = await listAllObjects('animalchallenge', null);

      // dlog('recAnimalChallenge : ', recAnimalChallenge);

      // filter out all stopmotion with displayname 'dier and who are not in the trash
      allFoundAnimals = recStopmotion.filter(
        (obj) => obj.value.displayname.toLowerCase() === type && obj.value.status !== 'trash'
      );
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
        const results = allFoundAnimals.reduce(
          (acc, obj) => {
            if (obj.username === user) {
              acc.animalsOfUser.push(obj);
            } else {
              acc.allAnimalNotOfUser.push(obj);
            }
            return acc;
          },
          { animalsOfUser: [], allAnimalNotOfUser: [] }
        );

        animalsOfUser = results.animalsOfUser;
        allAnimalNotOfUser = results.allAnimalNotOfUser;

        // dlog('animalsOfUser: ', animalsOfUser);

        const { objectsOfFellowsOfUser, remainingItemsArray } = await ServerCall.filterFellowHomeAreaObjects(
          userHomeArea,
          user,
          allAnimalNotOfUser
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

        serverObjectsHandler.array = animalArray;
        this.handleServerArray({
          type,
          serverObjectsHandler,
          artSize,
          artMargin,
        });
      } else {
        // we use all available animals

        serverObjectsHandler.array = allFoundAnimals;
        // dlog('serverObjectsHandler', serverObjectsHandler);

        this.handleServerArray({
          type,
          serverObjectsHandler,
          artSize,
          artMargin,
        });
      } // end of dier
    } else if (type === 'bloem') {
      let allFoundFlowers;
      let flowersOfUser;
      let allFlowersNotOfUser;

      const recDrawing = await listAllObjects('drawing', null);
      const recFlowerChallenge = await listAllObjects('flowerchallenge', null);

      // dlog('recAnimalChallenge : ', recAnimalChallenge);
      // filter out all stopmotion with displayname 'dier and who are not in the trash
      allFoundFlowers = recDrawing.filter(
        (obj) => obj.value.displayname.toLowerCase() === type && obj.value.status !== 'trash'
      );
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
        const results = allFoundFlowers.reduce(
          (acc, obj) => {
            if (obj.username === user) {
              acc.flowersOfUser.push(obj);
            } else {
              acc.allFlowersNotOfUser.push(obj);
            }
            return acc;
          },
          { flowersOfUser: [], allFlowersNotOfUser: [] }
        );

        flowersOfUser = results.flowersOfUser;
        allFlowersNotOfUser = results.allFlowersNotOfUser;

        // dlog('animalsOfUser: ', animalsOfUser);

        const { objectsOfFellowsOfUser, remainingItemsArray } = await ServerCall.filterFellowHomeAreaObjects(
          userHomeArea,
          user,
          allFlowersNotOfUser
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

        serverObjectsHandler.array = animalArray;
        this.handleServerArray({
          type,
          serverObjectsHandler,
          artSize,
          artMargin,
        });
      } else {
        // we use all available flowers

        serverObjectsHandler.array = allFoundFlowers;
        this.handleServerArray(type, serverObjectsHandler, artSize, artMargin);
      } // end of bloem
    } else if (type === 'downloadLikedDrawing') {
      // async get the liked stores and handle the data when they are loaded
      ServerCall.getLikedStores({ serverObjectsHandler })
        .then((randomLiked) => {
          serverObjectsHandler.array = randomLiked;
          /** randomLiked.array has that data
           *  so it is passed on to serverObjectsHandler.array
           */

          this.handleServerArray({
            type,
            serverObjectsHandler,
            artSize,
            artMargin,
          });
        })
        .catch((error) => {
          console.error('Error:', error);
        });
  
    } else if (type === 'downloadStopmotionDefaultUserHome') {
      /** type === 'downloadStopmotionDefaultUserHome'
       *  is for downloading all the stopmotions from a user's home
       */
      // const scene = ManageSession.currentScene;

      // // make a new drawingGallery store
      // const stopmotiongGallery = homeGalleryStore('stopmotion', selfHome);

      // // set the pageSize of the gallery
      // stopmotiongGallery.setHomeGalleryPageSize(scene.homeGallery_stopmotion_PageSize);
      // // set the currrent page of the gallery
      // stopmotiongGallery.setHomeGalleryCurrentPage(scene.homeGallery_stopmotion_CurrentPage);

      // await stopmotiongGallery.loadArtworks(userId);
  
      // // Get total pages
      // const totalPages = get(stopmotiongGallery.homeGalleryTotalPages);
      // scene.homeGallery_stopmotion_TotalPages = totalPages;
      
      // console.log('Total pages:', totalPages);
  
      // // Get current paginated artworks
      // const currentImages = get(stopmotiongGallery.homeGalleryPaginatedArt);
      // scene.homeGallery_stopmotion_ArtOnCurrentPage = currentImages;

      // console.log('Current paginated artworks stopmotion:', currentImages);

      // serverObjectsHandler.array = currentImages;

      // dlog('serverObjectsHandler: ', type, userId, serverObjectsHandler);
      // this.handleServerArray({
      //   type,
      //   serverObjectsHandler,
      //   artSize,
      //   artMargin,
      // });
      
    } else if (type === 'drawing_HomeElement') {
      console.log('type: ', type);
      /** type === 'drawing_HomeElement'
       *  is for downloading all home elements of type drawing
       */

      // const homeElements = await HomeElements.getFromServer(ManageSession.currentScene.location);

      // we already have the homeElements in ManageSession via UIScene subscription
      //TODO is this also correct for other users then self?
      //serverObjectsHandler is in the scene calling it (DefaultUserHome)
      // it is used to keep track of success and fails of the download
      serverObjectsHandler.array = ManageSession.homeElements;
      dlog(' drawing_HomeElement serverObjectsHandler.array: ', serverObjectsHandler.array);
      // .filter((obj) => obj.permission_read === 2)
      // .sort((a, b) => new Date(a.update_time) - new Date(b.update_time));
      // sorting by update_time in descending order

      // dlog('serverObjectsHandler: ', type, userId, serverObjectsHandler);
      this.handleServerArray({
        type,
        serverObjectsHandler,
        artSize,
        artMargin,
      });
    }
  }

  static async getLikedStores() {
    // Await for the asynchronous results
    const userLikedArt = (await Liked.get()) || [];
    const moderatorLikedArt = (await ModeratorLiked.get()) || [];

    if (!Array.isArray(userLikedArt) || !Array.isArray(moderatorLikedArt)) {
      throw new Error('Data from stores is not in the expected format');
    }

    ManageSession.likedStore.allLikedArt = [...userLikedArt, ...moderatorLikedArt];

    ManageSession.likedStore.stopmotionLiked = ManageSession.likedStore.allLikedArt.filter(
      (art) => art.value.collection === 'stopmotion'
    );

    ManageSession.likedStore.drawingLiked = ManageSession.likedStore.allLikedArt.filter(
      (art) => art.value.collection === 'drawing'
    );

    const randomLiked = ServerCall.getRandomElements(ManageSession.likedStore.drawingLiked, 4);

    return randomLiked;
  }

  static shuffleArray(inputArray) {
    const array = [...inputArray]; // Create a copy of the input array
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  static serverHandleFlowerArray(foundFlowers, serverObjectsHandler, type, artSize, artMargin) {
    serverObjectsHandler.array = foundFlowers;
    // remove the flower placeholder from the array
    serverObjectsHandler.shift();
    // dlog('foundFlowers: ', foundFlowers);
    // dlog('serverObjectsHandler: ', serverObjectsHandler);
    this.handleServerArray({
      type,
      serverObjectsHandler,
      artSize,
      artMargin,
    });
  }

  /** handle the array of objects that comes from the server
   *  we keep stats on the array before we begin downloading media
   *  we note how many media are being asked to be downloaded
   *  We then mark the success of fail with a download completed counter
   *  Depending on the kind of download we present a placeholder in case of a fail
   *  or we remove the item from the array (we skip a media that does exist)
   * */
  handleServerArray({ type, serverObjectsHandler, artSize, artMargin }) {
    dlog('serverObjectsHandler.array.length: ', serverObjectsHandler.array.length);
    // dlog('serverObjectsHandler: ', serverObjectsHandler);

    if (serverObjectsHandler.array.length > 0) {
      serverObjectsHandler.startLength = serverObjectsHandler.array.length;
      /** itemsDownloadCompleted = success or failure
       * we handle the fails in the resolveError function
       * the phaser downloadManager will fire a on.('complete') event when a items has failed or downloaded
       * we keep track of the items that have been completed in the downloadManager
       * then we know when we are done with the download queque
       * how we handle a failure depends on the situation:
       * eg.
       * downloading a house image will be replaced with a placeholder
       * downloading a drawing will be skipped
       */

      serverObjectsHandler.itemsDownloadCompleted = 0;

      // add to serverObjectsHandler artSize

      serverObjectsHandler.artSize = artSize;
      // add to serverObjectsHandler artMargin

      serverObjectsHandler.artMargin = artMargin;

      serverObjectsHandler.array.forEach((element, index) => {
        // dlog('element', element);
        this.downloadArtwork({
          element,
          index,
          type,
          artSize,
          artMargin,
        });
      });
    }
  }

  async loadAssetArray(scene, array, type) {
    scene.localAssetsCheck.startLength = array.length;
    dlog('array.length: ', array.length);
    array.forEach((element, index) => {
      // dlog('element', element);
      this.loadAsset(scene, element, index, type);
    });
  }

  async loadAsset(scene, element, index, type) {
    if (type === 'localImage') {
      // const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);
      // const imageKey = element.key;
      const path = element.path;
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'localImage',
        element,
        index,
        imageKey: element.key,
        scene,
      });

      scene.load.image(element.key, path).on(
        `filecomplete-image-${element.key}`,
        () => {
          // dlog('filecomplete-image-$ element.key: ,', element.key);
          // delete from ManageSession.resolveErrorObjectArray because of successful download
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== element.key
          );

          element.downloaded = true;
          // ServerCall.createDrawing_Container(element, index, artSize, artMargin);
        },
        scene
      );
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

        scene.localAssetsCheck.itemsDownloadCompleted = downloadCompleted;
        // dlog('STOPMOTION loader downloadCompleted after, startLength', downloadCompleted, startLength);
        if (downloadCompleted === startLength) {
          dlog('loader localImage COMPLETE');
        }
      });
    }
  }

  downloadAndPlaceHomeElements(array){
    // console.log("Downloading and placing home elements, array: ", array);
    // sort per type of element
    let homeElements_Drawings = array.value.filter((elm) => elm.value.collection === 'drawing');
    let homeElements_Stopmotions = array.value.filter((elm) => elm.value.collection === 'stopmotion');

    homeElements_Drawings.forEach((element, index) => {
      const type = 'drawing_HomeElement';
      const artSize = element.value.height;
      const artMargin = (artSize / 10);
      this.downloadArtwork({ element, index, type, artSize, artMargin })
    });

    homeElements_Stopmotions.forEach((element, index) => {
      const type = 'stopmotion_HomeElement';
      const artSize = element.value.height;
      const artMargin = (artSize / 10);
      this.downloadArtwork({ element, index, type, artSize, artMargin })
    });
  }

  createHomeElement_Drawing_Container(element) {
    const scene = ManageSession.currentScene;
    const worldSize = scene.worldSize;

    if (!scene) return;
    if (!element) return;
    if (!scene.homeElements_Drawing_Group) return;

    const imageKeyUrl = element.value.url;

    //check if there is already a home element of this type in the group,
    // if so skip
    const existingHomeElement_Group = scene.homeElements_Drawing_Group.getChildren()

    // Check if the container should already exist
    // checking in the array of objects existingHomeElement_Group is an object with .nakamaData.key === element.key
    if (existingHomeElement_Group.some(obj => obj.nakamaData && obj.nakamaData.key === element.key))
      {
          // dlog(`Skipping creation of drawing home element with key: ${element.key}`);
          return;
      }
  
    const artSizeSaved = element.value.height;

    const posY_Phaser = CoordinatesTranslator.artworldToPhaser2DY(worldSize.y, element.value.posY);
    const posX_Phaser = CoordinatesTranslator.artworldToPhaser2DX(worldSize.x, element.value.posX);

    const imageContainer = scene.add.container(0, 0).setDepth(100);
    // dlog('image coordX, index', coordX, index);

    /**  copy over the data from the element to the container
       so we can do sorting on the container later (eg order on date)
       collection: "drawing"
        downloaded: true
        key: "1658759573357_groenblauwKogelvis"
        permission_read: 2
        read: 2
        update_time: "2022-07-25T17:16:47.504205+02:00"
        user_id: "8f0a26fc-f51a-4a05-ab67-638b37a2a979"
        username: "user52"
        value:
          displayname: "groenblauwKogelvis"
          url: "drawing/8f0a26fc-f51a-4a05-ab67-638b37a2a979/5_1658759573357_groenblauwKogelvis.png"
          version: 5
    */
    imageContainer.nakamaData = { ...element };

    // put an artFrame in the container as a background and frame
    // imageContainer.add(scene.add.image(0, 0, 'artFrame_512').setOrigin(0));

    // adds the image to the container, on top of the artFrame
    const setImage = scene.add.image(0, 0, imageKeyUrl).setOrigin(0.5);

    const topLeft = new Phaser.Math.Vector2(-artSizeSaved / 2, -artSizeSaved / 2);
    const topRight = new Phaser.Math.Vector2(artSizeSaved / 2, -artSizeSaved / 2);
    const bottomRight = new Phaser.Math.Vector2(artSizeSaved / 2, artSizeSaved / 2);
    const bottomLeft = new Phaser.Math.Vector2(-artSizeSaved / 2, artSizeSaved / 2);

    // define the icons that will be used to manipulate the homeElement
    const icon = {
      scale: {},
      move: {},
      rotate: {},
      more: {}
    };

    // set the image for the icons
    icon.scale = scene.add.image(bottomRight.x, bottomRight.y, 'full-screen').setOrigin(0.5)
    .setTint(0xf2f2f2); // This sets the tint to grey
    icon.move = scene.add.image(topLeft.x, topLeft.y, 'moveIcon').setOrigin(0.5)
    .setTint(0xf2f2f2); // This sets the tint to grey
    icon.rotate = scene.add.image(topRight.x, topRight.y, 'reloadSign').setOrigin(0.5).setScale(0.3)
    .setTint(0xf2f2f2); // This sets the tint to grey
    icon.more = scene.add.image(bottomLeft.x, bottomLeft.y, 'moreOptions').setOrigin(0.5)
    .setTint(0xf2f2f2); // This sets the tint to grey

    // explicitly set the size of the image incase the image has a non standard size
    setImage.displayWidth = artSizeSaved;
    setImage.displayHeight = artSizeSaved;

    // Make icon.move draggable
    icon.move.setInteractive({ draggable: true });
    icon.rotate.setInteractive({ draggable: true });
    icon.scale.setInteractive({ draggable: true });
    icon.more.setInteractive({ draggable: true });

    // Set the scale icon functionality
    this.setScaleIconFunctionality(icon, imageContainer, element, artSizeSaved, worldSize)

    // Set the move icon functionality
    this.setMoveIconFunctionality(icon, imageContainer, element, worldSize)

    // Set the rotate icon functionality
    this.setRotateIconFunctionality(icon, imageContainer, element, worldSize)

    // Create a red border around the container/ image
    // this also makes the container clickable, and set the selected homeElement
    const containerBackground = scene.add.graphics();
    containerBackground.fillStyle(0xf2f2f2, 0.5); // grey with 50% opacity
    
    // Draw the rectangle (x, y, width, height)
    containerBackground.fillRect(
      -element.value.width/2, 
      -element.value.height/2, 
      element.value.width, 
      element.value.height
    );
    // this.setBackgroundImageFunctionality(scene, containerBackground, imageContainer, element)

    
    const editBorder = scene.add.graphics();
    editBorder.lineStyle(4, 0xFF0000); // 2 pixel width, red color
    editBorder.strokeRect(
      -element.value.width/2, 
      -element.value.height/2, 
      element.value.width, 
      element.value.height
    );
    editBorder.setVisible(false);

    // Add the border to the container
    imageContainer.add(containerBackground); 
    imageContainer.add(setImage);
    imageContainer.add(editBorder);

    imageContainer.add(icon.scale);
    imageContainer.add(icon.move);
    imageContainer.add(icon.rotate);
    imageContainer.add(icon.more);

    imageContainer.setSize(artSizeSaved, artSizeSaved);
    imageContainer.setPosition(posX_Phaser, posY_Phaser);
    imageContainer.setRotation(element.value.rotation);

    imageContainer.setName(element.key);

    // event listener for the edit mode of all the home elements
    scene.game.events.on('toggleHomeElement_Controls', (value) => {
      // we first show the border if there is one selected 
      // for when the editHomeBar is opened while an element is selected
      const selected = get(homeElement_Selected);
      this.toggleHomeElement_Selected_Handler(icon, editBorder, element, selected);

      // when the editHomeBar is closed we also hide the editBorder in the toggleHomeElement_Controls_Handler
      this.toggleHomeElement_Controls_Handler(icon, containerBackground, editBorder, value);
    }, scene);

    // Set the initial state of the home element controls based on if Edithome menu is open
    this.toggleHomeElement_Controls_Handler(icon, containerBackground, editBorder, get(HomeEditBarExpanded))

    // event listener for the selected home element
    scene.homeElement_Selected = scene.game.events.on('homeElement_Selected', (value) => {
      this.toggleHomeElement_Selected_Handler(icon, editBorder, element, value)
    }, this);

    // check if an element is already selected
    this.toggleHomeElement_Selected_Handler(icon, editBorder, element, get(homeElement_Selected))

    /** this check prevent errors
     * when we go out of the scene when things are still loading and being created  */
    if (!scene.homeElements_Drawing_Group) return;

    scene.homeElements_Drawing_Group.add(imageContainer);

    //react on phaser event, delete the container with the event.key as name

    scene.game.events.on('homeElemetDeleted', (event) => {
      dlog('homeElemetDeleted event: ', event);
      const containers = scene.homeElements_Drawing_Group.getChildren();
      
      const deleteContainer = containers.find((container) => container.name === event.key);
      // dlog('container: ', container);
      if (deleteContainer) {
      // set all buttons in the container to not interactive
      deleteContainer.list.forEach((element) => {
        element.disableInteractive();
      });
        deleteContainer.destroy();
      }
    });
  }

  createHomeElement_Stopmotion_Container(element) {
    const scene = ManageSession.currentScene;
    const worldSize = scene.worldSize;

    if (!scene) return;
    if (!element) return;
    if (!scene.homeElements_Stopmotion_Group) return;

    const imageKeyUrl = element.value.url;

    //check if there is already a home element of this type in the group,
    // if so skip
    const existingHomeElement_Group = scene.homeElements_Stopmotion_Group.getChildren()

    // Check if the container should already exist
    // checking in the array of objects existingHomeElement_Group is an object with .nakamaData.key === element.key
    if (existingHomeElement_Group.some(obj => obj.nakamaData && obj.nakamaData.key === element.key))
      {
          // dlog(`Skipping creation of drawing home element with key: ${element.key}`);
          return;
      }
  
    const artSizeSaved = element.value.height;

    const posY_Phaser = CoordinatesTranslator.artworldToPhaser2DY(worldSize.y, element.value.posY);
    const posX_Phaser = CoordinatesTranslator.artworldToPhaser2DX(worldSize.x, element.value.posX);

    const imageContainer = scene.add.container(0, 0).setDepth(100);
    // dlog('image coordX, index', coordX, index);

    /**  copy over the data from the element to the container
       so we can do sorting on the container later (eg order on date)
       collection: "drawing"
        downloaded: true
        key: "1658759573357_groenblauwKogelvis"
        permission_read: 2
        read: 2
        update_time: "2022-07-25T17:16:47.504205+02:00"
        user_id: "8f0a26fc-f51a-4a05-ab67-638b37a2a979"
        username: "user52"
        value:
          displayname: "groenblauwKogelvis"
          url: "drawing/8f0a26fc-f51a-4a05-ab67-638b37a2a979/5_1658759573357_groenblauwKogelvis.png"
          version: 5
    */
    imageContainer.nakamaData = { ...element };

    // put an artFrame in the container as a background and frame
    // imageContainer.add(scene.add.image(0, 0, 'artFrame_512').setOrigin(0));

    // adds the image to the container, on top of the artFrame
    const avatar = scene.textures.get(imageKeyUrl);

    const avatarWidth = avatar.frames.__BASE.width;
    // dlog('stopmotion width: ', avatarWidth);

    const avatarHeight = avatar.frames.__BASE.height;
    // dlog(`stopmotion Height: ${avatarHeight}`);

    const avatarFrames = Math.round(avatarWidth / avatarHeight);
    let setFrameRate = 0;
    if (avatarFrames > 1) {
      setFrameRate = avatarFrames;
    } else {
      setFrameRate = 0;
    }
    // dlog(`stopmotion Frames: ${avatarFrames}`);

    // animation for the stopmotion .........................
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
    // . end animation for the stopmotion ......................

    // adds the image to the container
    const setImage  = scene.add.sprite(0 , 0, imageKeyUrl).setOrigin(0.5);

    setImage.setData('playAnim', `moving_${imageKeyUrl}`);
    setImage.setData('stopAnim', `stop_${imageKeyUrl}`);
    if (avatarFrames > 1) {
      setImage.play(`moving_${imageKeyUrl}`);
    }
    const topLeft = new Phaser.Math.Vector2(-artSizeSaved / 2, -artSizeSaved / 2);
    const topRight = new Phaser.Math.Vector2(artSizeSaved / 2, -artSizeSaved / 2);
    const bottomRight = new Phaser.Math.Vector2(artSizeSaved / 2, artSizeSaved / 2);
    const bottomLeft = new Phaser.Math.Vector2(-artSizeSaved / 2, artSizeSaved / 2);

    // define the icons that will be used to manipulate the homeElement
    const icon = {
      scale: {},
      move: {},
      rotate: {},
      more: {}
    };

    // set the image for the icons
    icon.scale = scene.add.image(bottomRight.x, bottomRight.y, 'full-screen').setOrigin(0.5)
    .setTint(0xf2f2f2); // This sets the tint to grey
    icon.move = scene.add.image(topLeft.x, topLeft.y, 'moveIcon').setOrigin(0.5)
    .setTint(0xf2f2f2); // This sets the tint to grey
    icon.rotate = scene.add.image(topRight.x, topRight.y, 'reloadSign').setOrigin(0.5).setScale(0.3)
    .setTint(0xf2f2f2); // This sets the tint to grey
    icon.more = scene.add.image(bottomLeft.x, bottomLeft.y, 'moreOptions').setOrigin(0.5)
    .setTint(0xf2f2f2); // This sets the tint to grey

    // explicitly set the size of the image incase the image has a non standard size
    setImage.displayWidth = artSizeSaved;
    setImage.displayHeight = artSizeSaved;

    // Make icon.move draggable
    icon.move.setInteractive({ draggable: true });
    icon.rotate.setInteractive({ draggable: true });
    icon.scale.setInteractive({ draggable: true });
    icon.more.setInteractive({ draggable: true });

    // Set the scale icon functionality
    this.setScaleIconFunctionality(icon, imageContainer, element, artSizeSaved, worldSize)

    // Set the move icon functionality
    this.setMoveIconFunctionality(icon, imageContainer, element, worldSize)

    // Set the rotate icon functionality
    this.setRotateIconFunctionality(icon, imageContainer, element, worldSize)

    // Create a red border around the container/ image
    // this also makes the container clickable, and set the selected homeElement
    const containerBackground = scene.add.graphics();
    containerBackground.fillStyle(0xf2f2f2, 0.5); // grey with 50% opacity
    
    // Draw the rectangle (x, y, width, height)
    containerBackground.fillRect(
      -element.value.width/2, 
      -element.value.height/2, 
      element.value.width, 
      element.value.height
    );
    // this.setBackgroundImageFunctionality(scene, containerBackground, imageContainer, element)

    
    const editBorder = scene.add.graphics();
    editBorder.lineStyle(4, 0xFF0000); // 2 pixel width, red color
    editBorder.strokeRect(
      -element.value.width/2, 
      -element.value.height/2, 
      element.value.width, 
      element.value.height
    );
    editBorder.setVisible(false);

    // Add the border to the container
    imageContainer.add(containerBackground); 
    imageContainer.add(setImage);
    imageContainer.add(editBorder);

    imageContainer.add(icon.scale);
    imageContainer.add(icon.move);
    imageContainer.add(icon.rotate);
    imageContainer.add(icon.more);

    imageContainer.setSize(artSizeSaved, artSizeSaved);
    imageContainer.setPosition(posX_Phaser, posY_Phaser);
    imageContainer.setRotation(element.value.rotation);

    imageContainer.setName(element.key);

    // event listener for the edit mode of all the home elements
    scene.game.events.on('toggleHomeElement_Controls', (value) => {
      // we first show the border if there is one selected 
      // for when the editHomeBar is opened while an element is selected
      const selected = get(homeElement_Selected);
      this.toggleHomeElement_Selected_Handler(icon, editBorder, element, selected);

      // when the editHomeBar is closed we also hide the editBorder in the toggleHomeElement_Controls_Handler
      this.toggleHomeElement_Controls_Handler(icon, containerBackground, editBorder, value);
    }, scene);

    // Set the initial state of the home element controls based on if Edithome menu is open
    this.toggleHomeElement_Controls_Handler(icon, containerBackground, editBorder, get(HomeEditBarExpanded))

    // event listener for the selected home element
    scene.homeElement_Selected = scene.game.events.on('homeElement_Selected', (value) => {
      this.toggleHomeElement_Selected_Handler(icon, editBorder, element, value)
    }, this);

    // check if an element is already selected
    this.toggleHomeElement_Selected_Handler(icon, editBorder, element, get(homeElement_Selected))

    /** this check prevent errors
     * when we go out of the scene when things are still loading and being created  */
    if (!scene.homeElements_Stopmotion_Group) return;

    scene.homeElements_Stopmotion_Group.add(imageContainer);

    //react on phaser event, delete the container with the event.key as name

    scene.game.events.on('homeElemetDeleted', (event) => {
      dlog('homeElemetDeleted event: ', event);
      const containers = scene.homeElements_Stopmotion_Group.getChildren();
      
      const deleteContainer = containers.find((container) => container.name === event.key);
      // dlog('container: ', container);
      if (deleteContainer) {
      // set all buttons in the container to not interactive
      deleteContainer.list.forEach((element) => {
        element.disableInteractive();
      });
        deleteContainer.destroy();
      }
    });
  }

  hanglePrioriotizedSelection(pointer) {
        // Get all objects under the pointer
        const hitObjects = this.input.hitTestPointer(pointer);
        console.log('hitObjects: ', hitObjects);
  }

  setRotateIconFunctionality(icon, imageContainer, element, worldSize) {
    // Variable to store the initial angle when rotation starts
    let startAngle = 0;
    icon.rotate.on('pointerdown', () => {
      ManageSession.playerIsAllowedToMove = false;
    });
    icon.rotate.on('pointerup', () => {
      ManageSession.playerIsAllowedToMove = true;
    });
    icon.rotate.on('dragstart', (pointer) => {
      
        startAngle = this.angleBetweenPoints(
            imageContainer.x, 
            imageContainer.y, 
            pointer.worldX, 
            pointer.worldY
        );
    });

    icon.rotate.on('drag', (pointer) => {
      ManageSession.playerIsAllowedToMove = false;

        const currentAngle = this.angleBetweenPoints(
            imageContainer.x, 
            imageContainer.y, 
            pointer.worldX, 
            pointer.worldY
        );
        
        // Calculate the change in angle
        const deltaAngle = currentAngle - startAngle;
        
        // Rotate the container
        imageContainer.setRotation(imageContainer.rotation + deltaAngle);
        
        // Update the start angle for the next drag event
        startAngle = currentAngle;
    });

    // Modify the dragend event to include rotation
    icon.rotate.on('dragend', () => {
      this.handleDragEnd(imageContainer, element, worldSize);
    });
  }

  setBackgroundImageFunctionality(scene, containerBackground, imageContainer, element) {
    // Set the line style (color, width)
    // border.lineStyle(2, 0xFF0000); // 2 pixel width, red color
    containerBackground.fillStyle(0xf2f2f2, 0.5); // grey with 50% opacity
    
    // Draw the rectangle (x, y, width, height)
    containerBackground.fillRect(
      -element.value.width/2, 
      -element.value.height/2, 
      element.value.width, 
      element.value.height
    );
    // Make it interactive
    containerBackground.setInteractive(new Phaser.Geom.Rectangle(
      -element.value.width/2, 
      -element.value.height/2, 
      element.value.width, 
      element.value.height
    ), Phaser.Geom.Rectangle.Contains);

    containerBackground.on('pointerup', () => {
      // dlog('containerBackground clicked: ', element);
      // scene.game.events.emit('homeElement_Selected', element.key);
      homeElement_Selected.set(element);
    });
  }

  setMoveIconFunctionality(icon, imageContainer, element, worldSize) {

    // Listen for drag events on icon.move to move the imageContainer
    icon.move.on('pointerdown', () => {
      ManageSession.playerIsAllowedToMove = false;
    });
    icon.move.on('pointerup', () => {
      ManageSession.playerIsAllowedToMove = true;
    });

    icon.move.on('drag', (pointer) => {
      ManageSession.playerIsAllowedToMove = false;
      // Calculate location of the dragIcon relative to the container center
      const deltaX = pointer.position.x - pointer.prevPosition.x;
      const deltaY = pointer.position.y - pointer.prevPosition.y;

      // camera zoom factor seems to influence the drag distance
      // for now it looks like a feature, not a bug

      // Move the container
      imageContainer.setX(imageContainer.x + deltaX);
      imageContainer.setY(imageContainer.y + deltaY);
    });

    icon.move.on('dragend', () => {
      this.handleDragEnd(imageContainer, element, worldSize);
    });
  }

  setScaleIconFunctionality(icon, imageContainer, element, artSizeSaved, worldSize) {
        // scale the container when dragging the icon.scale
        icon.scale.on('pointerdown', () => {
          ManageSession.playerIsAllowedToMove = false;
        });
        icon.scale.on('pointerup', () => {
          ManageSession.playerIsAllowedToMove = true;
        });
    
        // scale the container when dragging the icon.scale
        let startPointerDistance;
        let startScale;
    
        icon.scale.on('dragstart', (pointer) => {
            startPointerDistance = Phaser.Math.Distance.Between(
                imageContainer.x, imageContainer.y,
                pointer.worldX, pointer.worldY
            );
            startScale = imageContainer.scale;
        });
    
        icon.scale.on('drag', (pointer) => {
          ManageSession.playerIsAllowedToMove = false;
            const currentPointerDistance = Phaser.Math.Distance.Between(
                imageContainer.x, imageContainer.y,
                pointer.worldX, pointer.worldY
            );
    
            const scaleFactor = currentPointerDistance / startPointerDistance;
            const newScale = startScale * scaleFactor;
    
            // You might want to set min and max scale limits
            const minScale = 0.1;
            const maxScale = 3;
            const clampedScale = Phaser.Math.Clamp(newScale, minScale, maxScale);
    
            imageContainer.setScale(clampedScale);
    
            // Update width and height
            imageContainer.width = artSizeSaved * clampedScale;
            imageContainer.height = artSizeSaved * clampedScale;
        });
    
        icon.scale.on('dragend', () => {
            this.handleDragEnd(imageContainer, element, worldSize);
        });
      }

  toggleHomeElement_Selected_Handler(icon, editBorder, element, value) {
    // turn off the border for all elements
    Object.values(icon).forEach(() => {
      editBorder.setVisible(false);
    });

    if (value.key === element.key) {
      editBorder.setVisible(true);
    }
  }

  toggleHomeElement_Controls_Handler(icon, containerBackground, editBorder, show) {
    console.log("show: ", show);
 
    Object.values(icon).forEach(iconX => {
      if (!iconX.active) return;
      iconX.setVisible(show);
      iconX.setInteractive(show ? { draggable: true } : false);
    });
    containerBackground.setVisible(show);
    if (!show) {
      editBorder.setVisible(false);
    }
  }
  
  handleDragEnd(container, element, worldSize) {
    homeElement_Selected.set(element);

    const x = CoordinatesTranslator.phaser2DToArtworldX(worldSize.x, container.x);
    const y = CoordinatesTranslator.phaser2DToArtworldY(worldSize.y, container.y);

    // dlog('handleDragEnd element: ', element);
    // dlog('handleDragEnd container: ', container);  
    // dlog('handleDragEnd x, y: ', x, y);

    const rotation = container.rotation;
    const width = container.width;
    const height = container.height;
    const scale = container.scale;

    const pub = element.permission_read;
    const type = element.collection;
    const name = element.key;
    let newValue = {...element.value};  // Create a copy of the value object
    
    newValue.posX = x;
    newValue.posY = y;
    newValue.height = height;
    newValue.width = width;
    newValue.rotation = rotation;
    newValue.scale = scale;

    // dragend also happens when pointer went from down to up without moving
    // so we check if there is a change
    const areEqual = JSON.stringify(element.value) === JSON.stringify(newValue);
    if (areEqual) {
      console.log('No changes detected');
      return;
    }

    // update store without reactivity
    HomeElements.updateStoreSilently(element.key, newValue);
    // update on the server
    updateObject(type, name, newValue, pub);
  }

  // calculate the angle between two points
  angleBetweenPoints(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1).toFixed(4);
  }

  async downloadArtwork({ element, index, type, artSize, artMargin }) {
    if (!ManageSession.currentScene) return;
    if (!artSize) return;
    if (!element) return;

    const scene = ManageSession.currentScene;

    let imageKeyUrl = element.value.url;

    let imgSize = artSize.toString();
    const fileFormat = 'png';
    const getImageWidth = (artSize * 100).toString();

    if (scene.textures.exists(imageKeyUrl)) {
      // if the artwork has already been downloaded
      if (type === 'downloadDrawingDefaultUserHome') {
        element.downloaded = true;
        ServerCall.createDrawing_Container(element, index, artSize, artMargin);

        if (!scene.drawing_ServerList || !scene.drawing_ServerList.startLength) return;

        const startLength = scene.drawing_ServerList.startLength;
        let downloadCompleted = scene.drawing_ServerList.itemsDownloadCompleted;
        downloadCompleted += 1;
        scene.drawing_ServerList.itemsDownloadCompleted = downloadCompleted;
        // dlog('DRAWING loader downloadCompleted after, startLength', downloadCompleted, startLength);
        if (downloadCompleted === startLength) {
          dlog('load DRAWING COMPLETE');
          ServerCall.repositionContainers(type);
        }
      } else if (type === 'downloadStopmotionDefaultUserHome') {
        element.downloaded = true;
        ServerCall.createStopmotion_Container(element, index, artSize, artMargin);

        if (!scene.stopmotion_ServerList || !scene.stopmotion_ServerList.startLength) return;
        console.log('scene.stopmotion_ServerList: ', scene.stopmotion_ServerList);
        const startLength = scene.stopmotion_ServerList.startLength;
        let downloadCompleted = scene.stopmotion_ServerList.itemsDownloadCompleted;
        downloadCompleted += 1;
        scene.stopmotion_ServerList.itemsDownloadCompleted = downloadCompleted;
        // dlog('STOPMOTION loader downloadCompleted after, startLength', downloadCompleted, startLength);
        if (downloadCompleted === startLength) {
          dlog('load downloadStopmotionDefaultUserHome COMPLETE');
          ServerCall.repositionContainers(type);
        }
      } else if (type === 'dier') {
        // dlog('element, index', element, index);
        new AnimalChallenge(scene, element, artSize);
      } else if (type === 'bloem') {
        // dlog('element, index', element, index);
        // push het element in flowerKeyArray
        scene.flowerKeyArray.push(imageKeyUrl);
        // scene.flowerFliedStartMaking = true;
      } else if (type === 'downloadLikedDrawing') {
        element.downloaded = true;
        ServerCall.createdownloadLiked_Drawing_Container(element, index);

        const startLength = ManageSession.likedStore.startLength;
        let downloadCompleted = ManageSession.likedStore.itemsDownloadCompleted;
        downloadCompleted += 1;
        ManageSession.likedStore.itemsDownloadCompleted = downloadCompleted;
        // dlog('DRAWING loader downloadCompleted after, startLength', downloadCompleted, startLength);
        if (downloadCompleted === startLength) {
          dlog('load LIKED COMPLETE');
          ServerCall.repositionContainers(type);
        }
      } else if (type === 'drawing_HomeElement') {
        // element.downloaded = true;
        // console.log('imageKeyUrl already exists: ', imageKeyUrl)
        this.createHomeElement_Drawing_Container(element, index, artSize, artMargin);

        // const startLength = scene.drawing_HomeElementServerList.startLength;
        // let downloadCompleted = scene.drawing_HomeElementServerList.itemsDownloadCompleted;
        // downloadCompleted += 1;
        // scene.drawing_HomeElementServerList.itemsDownloadCompleted = downloadCompleted;
        // dlog('DRAWING loader downloadCompleted after, startLength', downloadCompleted, startLength);
        // if (downloadCompleted === startLength) {
          // dlog('load drawing_HomeElement COMPLETE');
        // }
      } else if (type === 'stopmotion_HomeElement') {
        this.createHomeElement_Stopmotion_Container(element, index, artSize, artMargin);
      }
      
    // if the artwork is not already downloaded
    } else if (type === 'downloadDrawingDefaultUserHome') {
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadDrawingDefaultUserHome',
        element,
        index,
        imageKey: imageKeyUrl,
        scene,
        resolved: false,
      });
      const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);

      scene.load.image(imageKeyUrl, convertedImage).on(
        `filecomplete-image-${imageKeyUrl}`,
        () => {
          // delete from ManageSession.resolveErrorObjectArray because of successful download
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== imageKeyUrl
          );

          element.downloaded = true;

          ServerCall.createDrawing_Container(element, index, artSize, artMargin);
        },
        scene
      );

      scene.load.start(); // start the load queue to get the image in memory

      /** this is fired when the queue is finished downloading
       * the phaser download queue reports downloads and failed download equaly
       * but 'complete' does not say which file failed
       * the on.('loaderror') event does report which file failed
       *   */
      scene.load.on('complete', () => {
        if (!scene.drawing_ServerList || !scene.drawing_ServerList.startLength) return;
        const startLength = scene.drawing_ServerList.startLength;
        let downloadCompleted = scene.drawing_ServerList.itemsDownloadCompleted;
        downloadCompleted += 1;
        scene.drawing_ServerList.itemsDownloadCompleted = downloadCompleted;
        // dlog('DRAWING loader downloadCompleted after, startLength', downloadCompleted, startLength);
        if (downloadCompleted === startLength) {
          dlog('download downloadDrawingDefaultUserHome COMPLETE');
          ServerCall.repositionContainers(type);
        }
      });
    } else if (type === 'downloadStopmotionDefaultUserHome') {
      const convertedImage = await convertImage(imageKeyUrl, imgSize, getImageWidth, fileFormat);

      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadStopmotionDefaultUserHome',
        element,
        index,
        imageKey: imageKeyUrl,
        scene,
      });

      scene.load
        .spritesheet(imageKeyUrl, convertedImage, {
          frameWidth: artSize,
          frameHeight: artSize,
        })
        .on(`filecomplete-spritesheet-${imageKeyUrl}`, () => {
          // remove the file from the error-resolve-queue
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== imageKeyUrl
          );

          ServerCall.createStopmotion_Container(element, index, artSize, artMargin);
        });
      // dlog('stopmotion', imageKeyUrl);
      scene.load.start(); // start the load queue to get the image in memory

      // this is fired each time a file is finished downloading (or failing)
      scene.load.on('complete', () => {
        // dlog('loader STOPMOTION is complete');
        const startLength = scene.stopmotion_ServerList.startLength;
        let downloadCompleted = scene.stopmotion_ServerList.itemsDownloadCompleted;
        // dlog('STOPMOTION loader downloadCompleted before, startLength', downloadCompleted, startLength);
        downloadCompleted += 1;
        scene.stopmotion_ServerList.itemsDownloadCompleted = downloadCompleted;
        // dlog('STOPMOTION loader downloadCompleted after, startLength', downloadCompleted, startLength);
        if (downloadCompleted === startLength) {
          dlog('download STOPMOTION COMPLETE');
          ServerCall.repositionContainers(type);
        }
      });
    } else if (type === 'dier') {
      // dlog('imageKeyUrl, element, index', imageKeyUrl, element, index);
      const convertedImage = await convertImage(imageKeyUrl, imgSize, getImageWidth, fileFormat);
      // const convertedImage = element.value.previewUrl
      // dlog('dier convertedImage', convertedImage);
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadAnimalChallenge',
        element,
        index,
        imageKey: imageKeyUrl,
        scene,
      });

      scene.load
        .spritesheet(imageKeyUrl, convertedImage, {
          frameWidth: artSize,
          frameHeight: artSize,
        })
        .on(`filecomplete-spritesheet-${imageKeyUrl}`, () => {
          // remove the file from the error-resolve-queue
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== imageKeyUrl
          );

          // dlog('imageKeyUrl', imageKeyUrl);

          new AnimalChallenge(scene, element, artSize);
        });
      scene.load.start(); // start the load queue to get the image in memory
    } else if (type === 'avatar') {
      const convertedImage = await convertImage(imageKeyUrl, imgSize, getImageWidth, fileFormat);

      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadAvatarKey',
        element,
        index,
        imageKey: imageKeyUrl,
        scene,
      });

      scene.load
        .spritesheet(imageKeyUrl, convertedImage, {
          frameWidth: artSize,
          frameHeight: artSize,
        })
        .on(`filecomplete-spritesheet-${imageKeyUrl}`, () => {
          // remove the file from the error-resolve-queue
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== imageKeyUrl
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
        loadFunction: 'downloadFlowerChallenge',
        element,
        index,
        imageKey: imageKeyUrl,
        scene,
      });

      scene.load.image(imageKeyUrl, convertedImage).on(
        `filecomplete-image-${imageKeyUrl}`,
        () => {
          // delete from ManageSession.resolveErrorObjectArray because of successful download
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== imageKeyUrl
          );

          element.downloaded = true;

          // push het element in flowerKeyArray
          // dlog('imageKeyUrl, convertedImage', imageKeyUrl, convertedImage);
          scene.flowerKeyArray.push(imageKeyUrl);
          // scene.flowerFliedStartMaking = true;
        },
        this
      );
      scene.load.start(); // start the load queue to get the image in memory
    } else if (type === 'downloadLikedDrawing') {
      const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);

      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      ManageSession.resolveErrorObjectArray.push({
        loadFunction: 'downloadLikedDrawing',
        element,
        index,
        imageKey: imageKeyUrl,
        scene,
        resolved: false,
      });

      scene.load.image(imageKeyUrl, convertedImage).on(
        `filecomplete-image-${imageKeyUrl}`,
        () => {
          // delete from ManageSession.resolveErrorObjectArray because of successful download
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== imageKeyUrl
          );

          const newElement = { ...element }; // create a new object with the same properties as element
          newElement.downloaded = true; // modify the downloaded property of the new object
          newElement.used = true; // mark the liked artwork as being used in the game

          /** add the successfully downloaded liked to the ManageSession.likedStore */
          // add the newElement to the ManageSession.likedStore.successfulDownload array,
          //  check first if ManageSession.likedStore.successfulDownload array exists, make it otherwise
          ManageSession.likedStore.successfulDownload = ManageSession.likedStore.successfulDownload
            ? [...ManageSession.likedStore.successfulDownload, newElement]
            : [newElement];

          ServerCall.createdownloadLiked_Drawing_Container(newElement, index);
        },
        scene
      );
      scene.load.start(); // start the load queue to get the image in memory

      // this is fired each time a file is finished downloading (or failing)
      scene.load.on('complete', () => {
        const startLength = ManageSession.likedStore.startLength;
        let downloadCompleted = ManageSession.likedStore.itemsDownloadCompleted;
        downloadCompleted += 1;
        ManageSession.likedStore.itemsDownloadCompleted = downloadCompleted;
        // dlog('DRAWING loader downloadCompleted after, startLength', downloadCompleted, startLength);
        if (downloadCompleted === startLength) {
          // dlog('load LIKED COMPLETE');
          ServerCall.repositionContainers(type);
        }
      });
    } else if (type === 'drawing_HomeElement') {
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      // ManageSession.resolveErrorObjectArray.push({
      //   loadFunction: 'download_DrawingHomeElement',
      //   element,
      //   index,
      //   imageKey: imageKeyUrl,
      //   scene,
      //   resolved: false,
      // });

      //! we resize the image to the size that is stored in the element
      // We actually load 1 size for all copies of this image
      // fance would be to check first which size is the biggest and load that one
      // more realistic is to load half of max size
      imgSize = Math.round(element.value.height).toString();

      const convertedImage = await convertImage(imageKeyUrl, imgSize, imgSize, fileFormat);
      scene.load.image(imageKeyUrl, convertedImage).on(
        `filecomplete-image-${imageKeyUrl}`,
        () => {
          // dlog('filecomplete-image-$ element.key: ,', imageKeyUrl);
          // delete from ManageSession.resolveErrorObjectArray because of successful download
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== imageKeyUrl
          );

          element.downloaded = true;
          this.createHomeElement_Drawing_Container(element, index, artSize, artMargin);
        },
        scene
      );

      scene.load.start(); // start the load queue to get the image in memory

      /** this is fired when the queue is finished downloading
       * the phaser download queue reports downloads and failed download equaly
       * but 'complete' does not say which file failed
       * the on.('loaderror') event does report which file failed
       *   */
      // scene.load.on('complete', () => {
      //   const startLength = scene.drawing_ServerList.startLength;
      //   let downloadCompleted = scene.drawing_ServerList.itemsDownloadCompleted;
      //   downloadCompleted += 1;
      //   scene.drawing_ServerList.itemsDownloadCompleted = downloadCompleted;
      //   // dlog('DRAWING loader downloadCompleted after, startLength', downloadCompleted, startLength);

      //   // if multiple homeElements have the same key, the second one will not be loaded
      //   // because the first is not downloaded yet, so we reload when an item is downloaded
      //   // ManageSession.currentScene.game.events.emit('homeElements_reload');

      //   if (downloadCompleted === startLength) {
      //     dlog('download downloadDrawingDefaultUserHome COMPLETE');
      //     //ServerCall.repositionContainers(type);
      //   }
      // });
    } else if (type === 'stopmotion_HomeElement') {
      // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
      // ManageSession.resolveErrorObjectArray.push({
      //   loadFunction: 'download_DrawingHomeElement',
      //   element,
      //   index,
      //   imageKey: imageKeyUrl,
      //   scene,
      //   resolved: false,
      // });

      //! we resize the image to the size that is stored in the element
      // We actually load 1 size for all copies of this image
      // fance would be to check first which size is the biggest and load that one
      // more realistic is to load half of max size
      imgSize = Math.round(element.value.width).toString();
      const imgWidth = Math.round((element.value.height)*200).toString();

      const convertedImage = await convertImage(imageKeyUrl, imgSize, imgWidth, fileFormat);
      scene.load
        .spritesheet(imageKeyUrl, convertedImage, {
          frameWidth: artSize,
          frameHeight: artSize,
        })
        .on(`filecomplete-spritesheet-${imageKeyUrl}`, () => {
          // remove the file from the error-resolve-queue
          ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
            (obj) => obj.imageKey !== imageKeyUrl
          );
          this.createHomeElement_Stopmotion_Container(element, index, artSize, artMargin);

        });
      scene.load.start(); // start the load queue to get the image in memory
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
    // 2. Load the Spritesheet
    ServerCall.loadSpritesheetForUser(user, scene);
    // .then((fileNameCheck) => fileNameCheck);
  }

  static loadSpritesheetForUser(user, scene) {
    const fileNameCheck = `${user.id}_${user.update_time}`;

    convertImage(user.avatar_url, AVATAR_SPRITESHEET_LOAD_SIZE, AVATAR_SPRITESHEET_LOAD_SIZE * 100, 'png').then(
      (url) => {
        scene.load
          .spritesheet(fileNameCheck, url, {
            frameWidth: AVATAR_SPRITESHEET_LOAD_SIZE,
            frameHeight: AVATAR_SPRITESHEET_LOAD_SIZE,
          })
          .on(`filecomplete-spritesheet-${fileNameCheck}`, () => fileNameCheck);
        scene.load.start(); // start loading the image in memory
      }
    );
  }

  replaceLikedsInBalloonContainer() {
    const scene = ManageSession.currentScene;
    const containers = scene.balloonContainer.list;

    if (!containers) {
      console.log('No containers found in the balloonContainer');
      return;
    }

    // delete the liked drawings from the balloonContainer, not the balloon itself
    containers.slice().forEach((child) => {
      if (child instanceof Phaser.GameObjects.Container) {
        scene.balloonContainer.remove(child, true); // Remove and destroy the child container
      }
    });

    // get 4 likes from the drawings
    const randomLiked = ServerCall.getRandomElements(ManageSession.likedStore.drawingLiked, 4);

    // put the 4 random liked drawings in the likedStore.array
    ManageSession.likedStore.array = [];
    ManageSession.likedStore.array = randomLiked;

    const type = 'downloadLikedDrawing';
    const artSize = ManageSession.likedStore.artSize;
    const artMargin = ManageSession.likedStore.artMargin;
    const serverObjectsHandler = ManageSession.likedStore;

    this.handleServerArray({
      type,
      serverObjectsHandler,
      artSize,
      artMargin,
    });
  }

  static createdownloadLiked_Drawing_Container(element, index) {
    const scene = ManageSession.currentScene;
    if (!scene) return;
    if (!element) return;
    if (scene.balloonContainer.list.length > 5) return;

    const { width } = ServerCall.getContainerBounds(scene.balloonContainer);

    let placeX;
    // let placeY;
    if (index === 0) {
      placeX = width * 0.6;
    } else {
      placeX = width + 20 + 256;
    }
    const placeY = 70;

    const imageKeyUrl = element.value.url;
    const imageContainer = scene.add.container(0, 0);

    /** set the image explicitly to desiredWidth
     * TODO use desiredWidth pass on to the function
     */
    const desiredWidth = 256;

    // get the width and height of the original image
    let imageWidth = scene.textures.get('artFrame_512').getSourceImage().width;
    // add the background artFrame and set the image width to 256
    let image = scene.add.image(0, 0, 'artFrame_512').setOrigin(0);
    image.setScale((desiredWidth + ART_FRAME_BORDER) / imageWidth, (desiredWidth + ART_FRAME_BORDER) / imageWidth);
    // put an artFrame in the container as a background and frame
    imageContainer.add(image);

    imageWidth = scene.textures.get(imageKeyUrl).getSourceImage().width;
    // adds the image to the container, on top of the artFrame
    image = scene.add.image(0 + ART_FRAME_BORDER / 2, 0 + ART_FRAME_BORDER / 2, imageKeyUrl).setOrigin(0);
    image.setScale(desiredWidth / imageWidth, desiredWidth / imageWidth);

    // make image interactive so that we can goto the user's home
    // we want to show a button image on top of the image
    // to confirm we go to the user's home

    // image.setInteractive();
    // image.on('pointerup', () => {
    //   dlog('clicked image: ', element);
    // });
    imageContainer.add(image);

    // create the button shadow
    const buttonShadow = scene.add.image(imageWidth - 70, imageWidth, 'purpleCircle_128').setDepth(500);
    buttonShadow.displayWidth = 60;
    buttonShadow.displayHeight = 60;
    buttonShadow.setVisible(false);
    imageContainer.add(buttonShadow);

    // create the button image
    const buttonImage = scene.add.image(imageWidth - 70, imageWidth, 'enter').setDepth(500);
    buttonImage.rotation = -1.5708;
    buttonImage.displayWidth = 60;
    buttonImage.displayHeight = 60;
    buttonImage.setVisible(false);
    imageContainer.add(buttonImage);

    // create the button image tween
    const enterButtonTweenX = buttonImage.x - 10;
    const buttonImageTween = scene.tweens.add({
      targets: buttonImage,
      x: enterButtonTweenX,
      duration: 500,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
    });

    let gotoHouse = false;
    // make the image interactive and show the button shadow and image when clicked
    image.setInteractive();
    image.on('pointerup', () => {
      if (!gotoHouse) {
        // dlog('clicked image: ', element);
        // show the button shadow and image
        // buttonShadow.setPosition(image.x, image.y + 5);
        // buttonShadow.setVisible(true);
        // buttonImage.setPosition(image.x, enterButtonY);
        buttonShadow.setVisible(true);
        buttonImage.setVisible(true);
        buttonImageTween.play();

        // hide the button shadow and image after 2 seconds
        setTimeout(() => {
          buttonShadow.setVisible(false);
          buttonImage.setVisible(false);
          gotoHouse = false;
        }, 3000);
        gotoHouse = true;
      } else {
        // go to the user's home
        dlog('go to the user home');
        ServerCall.gotoPlayerHome(element);
      }
    });

    imageContainer.setPosition(placeX, placeY);
    // adds the image to the container
    if (!scene.balloonContainer) return;
    scene.balloonContainer.add(imageContainer);
  }

  static async gotoPlayerHome(element) {
    // get user account
    const friendId = element.value.user_id;
    const friendAccount = await getAccount(friendId);
    // in the friendAccount.meta:
    // metadata.Azc
    const friendHomeLocation = friendAccount.metadata.Azc;
    // get home object of friend to get pos of that home
    const friendHome = await getObject('home', friendHomeLocation, friendId);

    PlayerLocation.set({
      scene: friendHomeLocation,
    });

    // check if there is posX and posY from the home object
    if (typeof friendHome.value.posX !== 'undefined' && typeof friendHome.value.posY !== 'undefined') {
      // place user next to nameplate of home
      const playerPosX = friendHome.value.posX - 80;
      const playerPosY = friendHome.value.posY - 100;

      PlayerUpdate.set({ forceHistoryReplace: false });
      PlayerPos.set({
        x: playerPosX,
        y: playerPosY,
      });
    } else {
      // if there was no posX and y from home object
      PlayerUpdate.set({ forceHistoryReplace: false });
      PlayerPos.set({
        x: -80,
        y: -100,
      });
    }
  }

  static createDrawing_Container(element, index, artSize, artMargin) {
    const scene = ManageSession.currentScene;
    if (!scene) return;
    if (!element) return;

    const imageKeyUrl = element.value.url;
    const y = artMargin;
    const artBorder = ART_FRAME_BORDER;

    const artStart = 38; // start the art on the left side

    const coordX = index === 0 ? artStart : artStart + index * (artSize + artMargin);
    // dlog('image coordX, index', coordX, index);
    const imageContainer = scene.add.container(0, 0).setDepth(100);

    /**  copy over the data from the element to the container
     * so we can do sorting on the container later (eg order on date)
     * collection: "drawing"
        downloaded: true
        key: "1658759573357_groenblauwKogelvis"
        permission_read: 2
        read: 2
        update_time: "2022-07-25T17:16:47.504205+02:00"
        user_id: "8f0a26fc-f51a-4a05-ab67-638b37a2a979"
        username: "user52"
        value:
          displayname: "groenblauwKogelvis"
          url: "drawing/8f0a26fc-f51a-4a05-ab67-638b37a2a979/5_1658759573357_groenblauwKogelvis.png"
          version: 5
    */
    imageContainer.nakamaData = { ...element };

    // put an artFrame in the container as a background and frame
    imageContainer.add(scene.add.image(0, 0, 'artFrame_512').setOrigin(0));

    // adds the image to the container, on top of the artFrame
    const setImage = scene.add.image(0 + artBorder, 0 + artBorder, imageKeyUrl).setOrigin(0);
    // explicitly set the size of the image incase the image has a non standard size
    setImage.displayWidth = artSize;
    setImage.displayHeight = artSize;

    imageContainer.add(setImage);

    const containerSize = artSize + artBorder;
    const tempX = containerSize - artMargin;
    const tempY = containerSize + artBorder;
    ArtworkOptions.placeHeartButton(scene, tempX, tempY, imageKeyUrl, element, imageContainer);
    imageContainer.setPosition(coordX, y);
    imageContainer.setSize(containerSize, containerSize);

    /** this check prevent errors
     * when we go out of the scene when things are still loading and being created  */
    const homeGroup = scene[`homeGroup_drawing`];
    const parentContainer = scene.children.getByName(`ParentContainer_drawing`);

    if (!homeGroup) return;

    homeGroup.add(imageContainer);
    parentContainer.add(imageContainer);
  }

  static createStopmotion_Container(element, index, artSize, artMargin) {
    const scene = ManageSession.currentScene;
    if (!scene) return;
    if (!element) return;

    const imageKeyUrl = element.value.url;
    const y = artMargin;
    const artBorder = ART_FRAME_BORDER;

    const artStart = 38; // start the art on the left side

    const coordX = index === 0 ? artStart : artStart + index * (artSize + artMargin);
    const imageContainer = scene.add.container(0, 0).setDepth(100);
    imageContainer.nakamaData = { ...element };
    imageContainer.add(scene.add.image(0, 0, 'artFrame_512').setOrigin(0).setName('frame'));

    // dlog('STOPMOTION element, index, artSize, artMargin', element, index, artSize, artMargin);
    const avatar = scene.textures.get(imageKeyUrl);

    const avatarWidth = avatar.frames.__BASE.width;
    // dlog('stopmotion width: ', avatarWidth);

    const avatarHeight = avatar.frames.__BASE.height;
    // dlog(`stopmotion Height: ${avatarHeight}`);

    const avatarFrames = Math.round(avatarWidth / avatarHeight);
    let setFrameRate = 0;
    if (avatarFrames > 1) {
      setFrameRate = avatarFrames;
    } else {
      setFrameRate = 0;
    }
    // dlog(`stopmotion Frames: ${avatarFrames}`);

    // animation for the stopmotion .........................
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
    // . end animation for the stopmotion ......................

    // adds the image to the container
    const completedImage = scene.add.sprite(0 + artBorder, 0 + artBorder, imageKeyUrl).setOrigin(0);
    // set the size of the stopmotion to artSize explicitly
    completedImage.setScale(artSize / completedImage.width, artSize / completedImage.height);
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
    if (!imageContainer) return;
    if (!scene) return;

    
    const homeGroup = scene[`homeGroup_stopmotion`];
    const parentContainer = scene.children.getByName(`ParentContainer_stopmotion`);

    if (!homeGroup) return;

    homeGroup.add(imageContainer);
    parentContainer.add(imageContainer);
  }

static repositionContainers(type) {
  const scene = ManageSession.currentScene;
  let containers = [];

  if (type === 'downloadDrawingDefaultUserHome') {
    if (!scene.homeDrawingGroup) return;
    containers = scene.homeDrawingGroup.getChildren();
    console.log('containers', containers);
  } else if (type === 'downloadStopmotionDefaultUserHome') {
    if (!scene.homeStopmotionGroup) return;
    containers = scene.homeStopmotionGroup.getChildren();
  } else if (type === 'downloadLikedDrawing') {
    containers = scene.balloonContainer.list;
  }

  const artSize = scene.artDisplaySize;
  const artMargin = scene.artMargin;
  const artStart = 38;

  if (type === 'downloadDrawingDefaultUserHome' || type === 'downloadStopmotionDefaultUserHome') {
    // Reposition containers within ParentContainer
    // containers.forEach((element, index) => {
    //   const coordX = index * (artSize + artMargin);
    //   element.setPosition(coordX, 0);
    //   parentContainer.add(element);
    // });
    
  } else {
    // For downloadLikedDrawing, keep the original positioning logic
    containers.forEach((element, index) => {
      const coordX = index === 0 ? artStart : artStart + index * (artSize + artMargin);
      element.setX(coordX);
    });
  }
}


  /** Provide detailed information on a file loading error in Phaser, and provide fallback */
  resolveLoadError(offendingFile) {
    // element, index, homeImageKey, offendingFile, scene
    // ManageSession.resolveErrorObjectArray; // all loading images
    // dlog('offendingFile', offendingFile);
    const resolveErrorObject = ManageSession.resolveErrorObjectArray.find((o) => o.imageKey === offendingFile.key);

    if (!resolveErrorObject) {
      return;
    }

    dlog('offendingFile resolveErrorObject', resolveErrorObject);

    const { loadFunction } = resolveErrorObject;
    const { element } = resolveErrorObject;
    const { index } = resolveErrorObject;
    const imageKey = offendingFile.key;
    const { scene } = resolveErrorObject;
    // dlog("element, index, homeImageKey, offendingFile, scene", element, index, imageKey, scene)
    let flowerKeyArray;
    let randomLiked;
    let type;
    let serverObjectsHandler;
    let artSize;
    let artMargin;
    let containers;
    // let targetObject;
    switch (loadFunction) {
      case 'getHomeImage':
        dlog('offending file, load placeholder image instead', imageKey);

        /** we assign the placeholder image to the imageKey of the user's home */
        scene.load.image(imageKey, './assets/ball_grey.png').on(
          `filecomplete-image-${imageKey}`,
          () => {
            // delete from ManageSession.resolveErrorObjectArray
            ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
              (obj) => obj.imageKey !== imageKey
            );
            dlog('ManageSession.resolveErrorObjectArray', ManageSession.resolveErrorObjectArray);

            // create the home with the placeholder imageKey
            ServerCall.createHome(element, index, imageKey, scene);
          },
          this
        );
        scene.load.start();
        break;
      case 'downloadDrawingDefaultUserHome':
        dlog('offending drawing loading failed, removing from array', imageKey);

        // delete from scene.drawing_ServerList

        scene.drawing_ServerList.array = scene.drawing_ServerList.array.filter(
          (obj) => obj.value.url !== imageKey
        );

        // delete from ManageSession.resolveErrorObjectArray
        ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
          (obj) => obj.imageKey !== imageKey
        );

        // dlog('ManageSession.resolveErrorObjectArray', ManageSession.resolveErrorObjectArray);

        break;
      case 'downloadStopmotionDefaultUserHome':
        dlog('offending stopmotion loading failed, removing from array');
        // eslint-disable-next-line no-case-declarations
        const stopmotion_ServerList = scene.stopmotion_ServerList;
        // delete from scene.stopmotion_ServerList

        stopmotion_ServerList.array = stopmotion_ServerList.array.filter(
          (obj) => obj.value.url !== imageKey);

        // delete from ManageSession.resolveErrorObjectArray
        ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
          (obj) => obj.imageKey !== imageKey
        );

        break;
      case 'downloadAnimalChallenge':
        dlog('offending dier loading failed, removing from array');
        // eslint-disable-next-line no-case-declarations
        const userServerList = scene.animalArray;

        // delete from scene.stopmotion_ServerList
        userServerList.array = userServerList.array.filter((obj) => obj.value.url !== imageKey);

        // delete from ManageSession.resolveErrorObjectArray
        ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
          (obj) => obj.imageKey !== imageKey
        );

        break;
      case 'downloadAvatarKey':
        dlog('loading avatar conversion failed');
        ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
          (obj) => obj.imageKey !== imageKey
        );
        break;
      case 'downloadFlowerChallenge':
        dlog('loading flower for FlowerFlieldChallenge failed');

        dlog(`remove ${imageKey} from flowerKeyArray`);
        flowerKeyArray = scene.flowerKeyArray;

        // delete from scene.stopmotion_ServerList
        flowerKeyArray.array = flowerKeyArray.array.filter((obj) => obj.value.url !== imageKey);

        ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
          (obj) => obj.imageKey !== imageKey
        );
        break;
      case 'localImage':
        dlog('loading localImage failed');

        // delete from ManageSession.resolveErrorObjectArray
        ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
          (obj) => obj.imageKey !== imageKey
        );

        break;
      case 'downloadLikedDrawing':
        dlog('loading downloadLikedDrawing failed');
        // dlog('element, index, imageKey: ', element, index, imageKey);
        dlog('ManageSession.likedStore: ', ManageSession.likedStore);

        // delete from ManageSession.resolveErrorObjectArray
        ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter(
          (obj) => obj.imageKey !== imageKey
        );

        // delete the element from the ManageSession.likedStore.array
        ManageSession.likedStore.array = ManageSession.likedStore.array.filter((obj) => obj.value.url !== imageKey);

        // delete the element from the ManageSession.likedStore.allLikedArt
        // so we can't get it again later
        ManageSession.likedStore.allLikedArt = ManageSession.likedStore.allLikedArt.filter(
          (obj) => obj.value.url !== imageKey
        );

        // delete the element from the ManageSession.likedStore.drawingLiked
        // so we can't get it again later
        ManageSession.likedStore.drawingLiked = ManageSession.likedStore.drawingLiked.filter(
          (obj) => obj.value.url !== imageKey
        );

        containers = scene.balloonContainer.list;
        if (containers.length < 4) {
          // get a new random liked drawing
          randomLiked = ServerCall.getRandomElements(ManageSession.likedStore.drawingLiked, 1);
          // dlog('ManageSession.likedStore.drawingLiked: ', ManageSession.likedStore.drawingLiked);
          // dlog('randomLiked', randomLiked);

          // replace the element in the likedStore.array with the new random liked drawing
          // ManageSession.likedStore.array[index] = randomLiked[0];

          // push the random liked drawing to the likedStore.array
          ManageSession.likedStore.array.push(randomLiked[0]);

          type = 'downloadLikedDrawing';
          artSize = ManageSession.likedStore.artSize;
          artMargin = ManageSession.likedStore.artMargin;
          serverObjectsHandler = ManageSession.likedStore;
          this.handleServerArray({
            type,
            serverObjectsHandler,
            artSize,
            artMargin,
          });
        }
        break;

      default:
        dlog('please state fom which function the loaderror occured!');
    }
  }
} // end ServerCall

export default new ServerCall();
