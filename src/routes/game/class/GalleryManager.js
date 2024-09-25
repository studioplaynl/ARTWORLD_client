import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import { ART_DISPLAY_SIZE_LARGE } from '../../../constants';

import {  HomeElements, 
    homeElements_Store, 
    homeElement_Selected,
    } from '../../../storage';
import { updateObject } from '../../../helpers/nakamaHelpers';
import ServerCall from './ServerCall';

export default class GalleryManager {
  constructor({ scene, type, pageSize, CurrentPage, selfHome, location }) {
    this.scene = scene;
    this.type = type;
    this.homeGallery_PageSize = pageSize;
    this.homeGallery_CurrentPage = CurrentPage;
    this.homeGallery_TotalPages = 0;
    this.serverList = { array: [] };
    this.selfHome = selfHome;
    this.location = location;

    // Create the Phaser group in the scene with a type-specific name
    this.homeGroup = this.scene.add.group();
    this.scene.add.existing(this.homeGroup);
    this.scene[`homeGroup_${this.type}`] = this.homeGroup;
    
    this.parentContainer = null;
  }

  async initializeGalleries() {
    const module = await import('../../../storage');
    const storeKey = this.selfHome ? 
      `My_${this.type}_GalleryStore` :
      `Other_${this.type}_GalleryStore`;

    // Log the module and storeKey for debugging
    console.log('Module keys:', Object.keys(module));
    console.log('StoreKey:', storeKey);

    if (!module[storeKey]) {
      console.error(`Gallery store not found: ${storeKey}`);
      return;
    }

    const store = module[storeKey];
    this.store = store;
    await this.initializeGalleryStore();
  }

  async initializeGalleryStore() {
    // 1. set the right Store (this is already done in initializeGalleries)
    
    // 2. load the artworks from the server on the store
    await this.store.loadArtworks(this.location);
  
    this.update_Gallery_Store();
  
    // Subscribe to the gallery store
    this.unsubscribe = this.store.subscribe((value) => {
        console.log('value updated', value);
      // Check if the value has actually changed
      if (!this.previousStore || JSON.stringify(this.previousStore) !== JSON.stringify(value)) {
        this.previousStore = JSON.parse(JSON.stringify(value));
  
        this.update_Gallery_Store();
  
        // You might need to implement this method or adjust it based on your needs
        this.loadAndPlaceGallery();
      } 
    });
  }

  update_Gallery_Store() {
    const storeValue = get(this.store);
    console.log('Store value:', storeValue);

    if (storeValue) {
      // 3. set the right pageSize on the store
      this.store.setHomeGalleryPageSize(this.homeGallery_PageSize);
  
      // 4. set the current page of the gallery, on the store
      this.store.setHomeGalleryCurrentPage(this.homeGallery_CurrentPage);
  
      // 5. get the total pages of the gallery, from the store
      this.homeGallery_TotalPages = get(this.store.homeGalleryTotalPages);
  
      // Get the images we want to display
      this.serverList.array = get(this.store.homeGalleryPaginatedArt);
      
      console.log('homeGallery_TotalPages', this.homeGallery_TotalPages);
      console.log('serverList.array:', this.serverList.array);
    } else {
      console.error('Store value is undefined');
    }
  }

  async loadAndPlaceGallery() {
    const serverObjectsHandler = this.serverList;
    serverObjectsHandler.array = get(this.store.homeGalleryPaginatedArt);
    const userId = this.location;
    const artSize = ART_DISPLAY_SIZE_LARGE;
    const artMargin = artSize / 10;

    // Clear existing members of the group
    if (this.homeGroup) {
      this.homeGroup.clear(true, true);
    }
    this.homeGroup = this.scene.add.group();

    const totalWidth = this.homeGallery_PageSize * (artSize + artMargin);


    // Destroy existing children of the parent container if any
    if (this.parentContainer) {
        const children = this.parentContainer.getAll();
        children.forEach(child => {
            this.parentContainer.remove(child);
            child.destroy();
        });
    }

    // if the array is empty, don't create the gallery
    if (serverObjectsHandler.array.length === 0) {
      console.log(`userHome: loadAndPlace_${this.type}_Gallery: no artworks to display`);
      return;
    }

    // Check if there's a gallery object in the homeElements store
    const homeElements = get(homeElements_Store);
    let galleryElement = homeElements.find(element => element.value.collection === `gallery_${this.type}`);

    if (!galleryElement && this.selfHome) {
      // Create a new gallery homeElement
      const value = {
        collection: `gallery_${this.type}`,
        pageSize: this.homeGallery_PageSize,
        posX: 100,
        posY: this.type === 'drawing' ? 100 : 1200, // Adjust Y position based on type
        rotation: 0,
        scale: 1,
      }

      const key = `gallery_${this.type}_1`;
      await HomeElements.create(key, value);
      console.log(`userHome: loadAndPlace_${this.type}_Gallery: created new gallery_${this.type} element: `, value);
      // Refresh the homeElements after creating the new element
      galleryElement = get(homeElements_Store).find(element => element.value.collection === `gallery_${this.type}`);
    }

    // Use the position from the Gallery element if it exists, otherwise use default values
    const galleryX = galleryElement && galleryElement.value.posX !== undefined 
      ? galleryElement.value.posX 
      : artMargin/2;
    const galleryY = galleryElement && galleryElement.value.posY !== undefined 
      ? galleryElement.value.posY 
      : (this.type === 'drawing' ? artMargin/2 : 1200);

    this.parentContainer = this.scene.add.container(galleryX, galleryY)
      .setSize(totalWidth+(artMargin*2), artSize+(artMargin*4))
      .setName(`ParentContainer_${this.type}`);

    // create background graphics for ParentContainer
    const graphic = this.scene.add.graphics();
    graphic.fillStyle(0xa9a9a9); //dark grey
    graphic.fillRect(0, 0, totalWidth+(artMargin), artSize+(artMargin*5)); 
    this.parentContainer.add(graphic);
    
    const graphic2 = this.scene.add.graphics();
    graphic2.fillStyle(0xf2f2f2); 
    graphic2.fillRect(0, 0, totalWidth+(artMargin), artSize+(artMargin*3)); 
    this.parentContainer.add(graphic2);

    // Add page information text
    const pageInfoText = this.scene.add.text(totalWidth/2 + 40, artSize + (artMargin*3) + 50, '', {
      font: '24px Arial',
      fill: '#000000'
    }).setOrigin(0.5);
    this.parentContainer.add(pageInfoText);

    // Update page info text
    const updatePageInfo = () => {
      pageInfoText.setText(`${this.homeGallery_CurrentPage} / ${this.homeGallery_TotalPages}`);
      if (backButton && nextButton) {
        backButton.setVisible(this.homeGallery_CurrentPage > 1);
        nextButton.setVisible(this.homeGallery_CurrentPage < this.homeGallery_TotalPages);
      }
    };

    // Add move button
    const moveIcon = this.scene.add.image(totalWidth - artMargin*3, artSize + 235, 'moveIcon')
      .setOrigin(1, 1)
      .setScale(1)
      .setInteractive({ draggable: true })
      .setTint(0xf2f2f2);

    // Set up drag functionality for the move button
    this.setupMoveIconDrag(moveIcon);

    this.parentContainer.add(moveIcon);

    // add navigation buttons
    const backButton = this.createNavigationButton(totalWidth/2 - 80, 
      artSize + (artMargin*3) + 50, 'back_button', -1, updatePageInfo);
    const nextButton = this.createNavigationButton(totalWidth/2 + (artMargin*3.2), 
    artSize + (artMargin * 3) + 50, 'back_button', 1, updatePageInfo);

    this.parentContainer.add(backButton);
    this.parentContainer.add(nextButton);

    updatePageInfo();

    this.homeGroup.add(this.parentContainer);

    // Create and add images to the container
    for (let i = 0; i < serverObjectsHandler.array.length; i++) {
      const artwork = serverObjectsHandler.array[i];
      const x = (i % this.homeGallery_PageSize) * (artSize + artMargin) + artSize / 2 + artMargin;
      const y = artSize / 2 + artMargin;

      const image = this.scene.add.image(x, y, artwork.key)
        .setDisplaySize(artSize, artSize)
        .setInteractive();

      // Add any additional properties or event listeners to the image here
      console.log('image:', image);
      this.parentContainer.add(image);
    }

    // Call ServerCall.handleServerArray without the callback
    ServerCall.handleServerArray({
      type: `download${this.type.charAt(0).toUpperCase() + this.type.slice(1)}DefaultUserHome`,
      userId,
      serverObjectsHandler,
      artSize,
      artMargin,
    });
  }

  setupMoveIconDrag(moveIcon) {
    moveIcon.on('pointerdown', () => ManageSession.playerIsAllowedToMove = false);
    moveIcon.on('pointerup', () => ManageSession.playerIsAllowedToMove = true);
  
    moveIcon.on('drag', (pointer) => {
      ManageSession.playerIsAllowedToMove = false;
      const deltaX = pointer.x - pointer.prevPosition.x;
      const deltaY = pointer.y - pointer.prevPosition.y;
      this.parentContainer.x += deltaX;
      this.parentContainer.y += deltaY;
    });
  
    moveIcon.on('dragend', () => {
      this.updateGalleryPosition();
    });
  }

  updateGalleryPosition() {
    const homeElements = get(homeElements_Store);
    const galleryElement = homeElements.find(element => element.value.collection === `gallery_${this.type}`);
  
    if (galleryElement) {
      homeElement_Selected.set(galleryElement);
      const x = this.parentContainer.x;
      const y = this.parentContainer.y;
      const { rotation, width, height, scale } = this.parentContainer;
      
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

  createNavigationButton(x, y, texture, direction, updatePageInfo) {
    const button = this.scene.add.image(x, y, texture)
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
      const currentPage = this.homeGallery_CurrentPage;
      const totalPages = this.homeGallery_TotalPages;
  
      if ((direction === -1 && currentPage > 1) || (direction === 1 && currentPage < totalPages)) {
        this.homeGallery_CurrentPage += direction;
  
        const children = this.parentContainer.getAll('type', 'Container');
        children.forEach(child => {
          this.parentContainer.remove(child);
          child.destroy();
        });
  
        updatePageInfo();
        this.update_Gallery_Store();
        this.loadAndPlaceGallery();
      }
    });
  
    return button;
  }

  unsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
