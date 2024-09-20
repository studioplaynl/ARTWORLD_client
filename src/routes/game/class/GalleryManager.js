import { get } from 'svelte/store';
import ManageSession from '../ManageSession';

import {  HomeElements, 
    homeElements_Store, 
    homeElement_Selected, 
    My_drawing_GalleryStore,
    My_stopmotion_GalleryStore,
    Other_drawing_GalleryStore,
    Other_stopmotion_GalleryStore, } from '../../../storage';
import { updateObject } from '../../../helpers/nakamaHelpers';
import ServerCall from './ServerCall';

export default class GalleryManager {
  constructor(scene) {
    this.scene = scene;
    this.galleryTypes = ['drawing', 'stopmotion'];
    this.stores = {};
    this.unsubscribes = {};
  }

  async initializeGalleries(selfHome, location) {
    for (const type of this.galleryTypes) {
      const store = selfHome ? 
        (await import('../../../storage')).default[`My_${type}_GalleryStore`] :
        (await import('../../../storage')).default[`Other_${type}_GalleryStore`];
      
      await this.initializeGalleryStore(store, type, location);
    }
  }

  async initializeGalleryStore(store, type, location) {
    this.stores[type] = store;
    await store.loadArtworks(location);
    this.updateGalleryStore(store, type);

    this.unsubscribes[type] = this.stores[type].subscribe((value) => {
      if (!this.scene[`previous${type.charAt(0).toUpperCase() + type.slice(1)}Store`] || 
          JSON.stringify(this
            .scene[`previous${type.charAt(0).toUpperCase() + type.slice(1)}Store`]) !== JSON.stringify(value)) {
        this.scene[`previous${type.charAt(0).toUpperCase() + type.slice(1)}Store`] = JSON.parse(JSON.stringify(value));
        this.updateGalleryStore(store, type);
        this.loadAndPlaceGallery(type);
      } 
    });
  }

  updateGalleryStore(store, type) {
    store.setHomeGalleryPageSize(this.scene[`homeGallery_${type}_PageSize`]);
    store.setHomeGalleryCurrentPage(this.scene[`homeGallery_${type}_CurrentPage`]);
    this.scene[`homeGallery_${type}_TotalPages`] = get(store.homeGalleryTotalPages);
    this.scene[`${type}_ServerList`].array = get(store.homeGalleryPaginatedArt);
  }

  async loadAndPlaceGallery(type) {
    // ... (copy the loadAndPlace_Gallery function from DefaultUserHome.js)
    // Replace 'this' with 'this.scene' for scene-specific properties and methods
    const serverObjectsHandler = this[`${type}_ServerList`];
    serverObjectsHandler.array = get(this[`${type}_Store`].homeGalleryPaginatedArt);
    const userId = this.location;
    const artSize = this.artDisplaySize;
    const artMargin = artSize / 10;
    this.artMargin = artMargin;
  
    // Destroy existing members of the group if any
    if (this[`home${type.charAt(0).toUpperCase() + type.slice(1)}Group`]) {
      this[`home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].clear(true, true);
    }
    this[`home${type.charAt(0).toUpperCase() + type.slice(1)}Group`] = this.add.group();
  
    const totalWidth = this[`homeGallery_${type}_PageSize`] * (artSize + artMargin);
  
    // Destroy existing children of the parent container if any
    if (this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`]) {
      const children = this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].getAll();
      children.forEach(child => {
        this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].remove(child);
        child.destroy();
      });
    }
  
    // if the array is empty, don't create the gallery
    if (serverObjectsHandler.array.length === 0) {
      console.log(`userHome: loadAndPlace_${type}_Gallery: no artworks to display`);
      return;
    }
  
    // Check if there's a gallery object in the homeElements store
    const homeElements = get(homeElements_Store);
    let galleryElement = homeElements.find(element => element.value.collection === `gallery_${type}`);
  
    if (!galleryElement && this.selfHome) {
      // Create a new gallery homeElement
      const value = {
        collection: `gallery_${type}`,
        pageSize: this[`homeGallery_${type}_PageSize`],
        posX: 100,
        posY: type === 'drawing' ? 100 : 1200, // Adjust Y position based on type
        rotation: 0,
        scale: 1,
      }
  
      const key = `gallery_${type}_1`;
      await HomeElements.create(key, value);
      console.log(`userHome: loadAndPlace_${type}_Gallery: created new gallery_${type} element: `, value);
      // Refresh the homeElements after creating the new element
      galleryElement = get(homeElements_Store).find(element => element.value.collection === `gallery_${type}`);
    }
  
    // Use the position from the Gallery element if it exists, otherwise use default values
    const galleryX = galleryElement && galleryElement.value.posX !== undefined 
      ? galleryElement.value.posX 
      : artMargin/2;
    const galleryY = galleryElement && galleryElement.value.posY !== undefined 
      ? galleryElement.value.posY 
      : (type === 'drawing' ? artMargin/2 : 1200);
  
    this[`parentContainer_home${type.charAt(0)
      .toUpperCase() + type.slice(1)}Group`] = this.add.container(galleryX, galleryY)
      .setSize(totalWidth+(artMargin*2), artSize+(artMargin*4))
      .setName('ParentContainer');
  
    // create background graphics for ParentContainer
    const graphic = this.add.graphics();
    graphic.fillStyle(0xa9a9a9); //dark grey
    graphic.fillRect(0, 0, totalWidth+(artMargin), artSize+(artMargin*5)); 
    this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].add(graphic);
    
    const graphic2 = this.add.graphics();
    graphic2.fillStyle(0xf2f2f2); 
    graphic2.fillRect(0, 0, totalWidth+(artMargin), artSize+(artMargin*3)); 
    this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].add(graphic2);
  
    // Add page information text
    const pageInfoText = this.add.text(totalWidth/2 + 40, artSize + (artMargin*3) + 50, '', {
      font: '24px Arial',
      fill: '#000000'
    }).setOrigin(0.5);
    this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].add(pageInfoText);
  
    // Update page info text
    const updatePageInfo = () => {
      pageInfoText.setText(`${this[`homeGallery_${type}_CurrentPage`]} / ${this[`homeGallery_${type}_TotalPages`]}`);
      if (backButton && nextButton) {
        backButton.setVisible(this[`homeGallery_${type}_CurrentPage`] > 1);
        nextButton.setVisible(this[`homeGallery_${type}_CurrentPage`] < this[`homeGallery_${type}_TotalPages`]);
      }
    };
  
    // Add move button
    const moveIcon = this.add.image(totalWidth - artMargin*3, artSize + 235, 'moveIcon')
      .setOrigin(1, 1)
      .setScale(1)
      .setInteractive({ draggable: true })
      .setTint(0xf2f2f2);
  
    // Set up drag functionality for the move button
    this.setupMoveIconDrag(moveIcon, type);
  
    this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].add(moveIcon);
  
    // add navigation buttons
    const backButton = this.createNavigationButton(totalWidth/2 - 80, 
      artSize + (artMargin*3) + 50, 'back_button', -1, type, updatePageInfo);
    const nextButton = this.createNavigationButton(totalWidth/2 + (artMargin*3.2), 
    artSize + (artMargin * 3) + 50, 'back_button', 1, type, updatePageInfo);
  
    this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].add(backButton);
    this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].add(nextButton);
  
    updatePageInfo();
  
    this[`home${type.charAt(0).toUpperCase() + type.slice(1)}Group`]
    .add(this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`]);
  
    ServerCall.handleServerArray({
      type: `download${type.charAt(0).toUpperCase() + type.slice(1)}DefaultUserHome`,
      userId,
      serverObjectsHandler,
      artSize,
      artMargin,
    });
  }

  setupMoveIconDrag(moveIcon, type) {
    // ... (copy the setupMoveIconDrag function from DefaultUserHome.js)
    // Replace 'this' with 'this.scene' for scene-specific properties and methods
    moveIcon.on('pointerdown', () => ManageSession.playerIsAllowedToMove = false);
    moveIcon.on('pointerup', () => ManageSession.playerIsAllowedToMove = true);
  
    moveIcon.on('drag', (pointer) => {
      ManageSession.playerIsAllowedToMove = false;
      const deltaX = pointer.x - pointer.prevPosition.x;
      const deltaY = pointer.y - pointer.prevPosition.y;
      this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].x += deltaX;
      this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].y += deltaY;
    });
  
    moveIcon.on('dragend', () => {
      this.updateGalleryPosition(type);
    });
  }

  updateGalleryPosition(type) {
    // ... (copy the updateGalleryPosition function from DefaultUserHome.js)
    // Replace 'this' with 'this.scene' for scene-specific properties and methods
    const homeElements = get(homeElements_Store);
    const galleryElement = homeElements.find(element => element.value.collection === `gallery_${type}`);
  
    if (galleryElement) {
      homeElement_Selected.set(galleryElement);
      const x = this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].x;
      const y = this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].y;
      const { rotation, width, height, scale } = this[`parentContainer_home${type
        .charAt(0).toUpperCase() + type.slice(1)}Group`];
      
      const newValue = {
        ...galleryElement.value,
        posX: x,
        posY: y,
        height,
        width,
        rotation,
        scale
      };
  
      if (JSON.stringify(galleryElement.value) !== JSON.stringify(newValue)) {
        HomeElements.updateStoreSilently(galleryElement.key, newValue);
        updateObject(galleryElement.collection, galleryElement.key, newValue, galleryElement.permission_read);
      }
    }
  }

  createNavigationButton(x, y, texture, direction, type, updatePageInfo) {
    // ... (copy the createNavigationButton function from DefaultUserHome.js)
    // Replace 'this' with 'this.scene' for scene-specific properties and methods
    const button = this.add.image(x, y, texture)
      .setDepth(500)
      .setVisible(true)
      .setName(direction === -1 ? 'backButton' : 'nextButton');
  
    if (direction === 1) {
      button.rotation = Math.PI;
    }
  
    button.displayWidth = 80;
    button.displayHeight = 80;
    button.setInteractive();
  
    button.on('pointerup', () => {
      const currentPage = this[`homeGallery_${type}_CurrentPage`];
      const totalPages = this[`homeGallery_${type}_TotalPages`];
  
      if ((direction === -1 && currentPage > 1) || (direction === 1 && currentPage < totalPages)) {
        this[`homeGallery_${type}_CurrentPage`] += direction;
  
        const children = this[`parentContainer_home${type.charAt(0)
          .toUpperCase() + type.slice(1)}Group`].getAll('type', 'Container');
        children.forEach(child => {
          this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].remove(child);
          child.destroy();
        });
  
        updatePageInfo();
        this.update_Gallery_Store(this[`${type}_Store`], type);
        this.loadAndPlace_Gallery(type);
      }
    });
  
    return button;
  }

  unsubscribeAll() {
    for (const type of this.galleryTypes) {
      if (this.unsubscribes[type]) {
        this.unsubscribes[type]();
        this.unsubscribes[type] = null;
      }
    }
  }
}
