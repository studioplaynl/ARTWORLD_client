import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import { ART_DISPLAY_SIZE_LARGE, ART_DISPLAY_SIZE } from '../../../constants';
import { HomeEditBarExpanded } from '../../../session';

import { HomeElements, homeElements_Store, homeElement_Selected } from '../../../storage';
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
    const storeKey = this.selfHome ? `My_${this.type}_GalleryStore` : `Other_${this.type}_GalleryStore`;

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

    if (storeValue) {
      // 3. set the right pageSize on the store
      this.store.setHomeGalleryPageSize(this.homeGallery_PageSize);

      // 4. set the current page of the gallery, on the store
      this.store.setHomeGalleryCurrentPage(this.homeGallery_CurrentPage);

      // 5. get the total pages of the gallery, from the store
      this.homeGallery_TotalPages = get(this.store.homeGalleryTotalPages);

      // Get the images we want to display
      this.serverList.array = get(this.store.homeGalleryPaginatedArt);
    } else {
      console.error('Store value is undefined');
    }
  }

  async loadAndPlaceGallery() {
    try {
      // Safety check for group before clearing
      if (this.group?.clear) {
        this.group.clear(true, true);
      }

      const serverObjectsHandler = this.serverList;
      serverObjectsHandler.array = get(this.store.homeGalleryPaginatedArt);
      const userId = this.location;
      const artSize = 200;
      const frameBorderSize = artSize / 30;
      const artMargin = artSize / 10;

      // Clear existing members of the group
      if (this.homeGroup) {
        this.homeGroup.clear(true, true);
      }
      this.homeGroup = this.scene.add.group();

      const imagePlusBorders = artSize + (frameBorderSize * 2);
      const imagePlusBordersPlusMargin = imagePlusBorders + artMargin;
      const totalWidth = (this.homeGallery_PageSize * imagePlusBordersPlusMargin) + artMargin;

      // Destroy existing children of the parent container if any
      if (this.parentContainer) {
        const children = this.parentContainer.getAll();
        children.forEach((child) => {
          this.parentContainer.remove(child);
          child.destroy();
        });
      }

      // if the array is empty, don't create the gallery
      if (serverObjectsHandler.array.length === 0) {
        return;
      }

      // Check if there's a gallery object in the homeElements store
      const store = get(homeElements_Store);
      const galleryCollection = `gallery_${this.type}`;
      let galleryElement = null;

      // Search through all collections for gallery elements
      for (const collection in store) {
        if (store[collection]?.byKey) {
          // Look for the first element that matches our gallery type
          const galleryGroup = Object.values(store[collection].byKey).find(
            (group) => group[0]?.value.collection === galleryCollection
          );
          if (galleryGroup) {
            galleryElement = galleryGroup[0];
            break;
          }
        }
      }

      if (!galleryElement && this.selfHome) {
        // Create a new gallery homeElement
        const value = {
          collection: galleryCollection,
          pageSize: this.homeGallery_PageSize,
          posX: 100,
          posY: this.type === 'drawing' ? 100 : 1200,
          rotation: 0,
          scale: 1,
        };

        const key = `gallery_${this.type}_1`;
        await HomeElements.create(key, value);

        // Refresh and find the newly created element
        const updatedStore = get(homeElements_Store);
        for (const collection in updatedStore) {
          if (updatedStore[collection]?.byKey) {
            const newGalleryGroup = Object.values(updatedStore[collection].byKey).find(
              (group) => group[0]?.value.collection === galleryCollection
            );
            if (newGalleryGroup) {
              galleryElement = newGalleryGroup[0];
              break;
            }
          }
        }
      }

      // Use the position from the Gallery element if it exists, otherwise use default values
      const galleryX =
        galleryElement && galleryElement.value.posX !== undefined ? galleryElement.value.posX : artMargin / 2;
      const galleryY =
        galleryElement && galleryElement.value.posY !== undefined
          ? galleryElement.value.posY
          : this.type === 'drawing'
            ? artMargin / 2
            : 1200;

      const parentContainerWidth = totalWidth;
      const parentContainerHeight = artSize + artMargin * 5;

      this.parentContainer = this.scene.add
        .container(galleryX, galleryY)
        .setSize(parentContainerWidth, parentContainerHeight)
        .setName(`ParentContainer_${this.type}`);

      // create background graphics for ParentContainer
      const graphic = this.scene.add.graphics();
      graphic.fillStyle(0xa9a9a9); //dark grey
      graphic.fillRect(0, 0, parentContainerWidth, parentContainerHeight);
      this.parentContainer.add(graphic);

      const graphic2Height = parentContainerHeight / 1.115;
      const graphic2 = this.scene.add.graphics();
      graphic2.fillStyle(0xf2f2f2);
      graphic2.fillRect(0, 0, totalWidth, graphic2Height);
      this.parentContainer.add(graphic2);
      
      const toolBarHeight = parentContainerHeight - (parentContainerHeight / 1.115);
      const textSize = Math.ceil(toolBarHeight / 2);
      // Add page information text
      const textX = totalWidth / 2 + (totalWidth / 20);
      const textY = parentContainerHeight * 0.95;
      const pageInfoText = this.scene.add
        .text(textX, textY, '', {
          font: `${textSize}px Arial`,
          fill: '#000000',
        })
        .setOrigin(0.5);
      this.parentContainer.add(pageInfoText);

      // Update page info text
      const updatePageInfo = () => {
        pageInfoText.setText(`${this.homeGallery_CurrentPage} / ${this.homeGallery_TotalPages}`);
        if (backButton && nextButton) {
          backButton.setVisible(this.homeGallery_CurrentPage > 1);
          nextButton.setVisible(this.homeGallery_CurrentPage < this.homeGallery_TotalPages);
        }
      };

      // Add move button if we are in this.selfHome
      if (this.selfHome) {
        const moveIconX = parentContainerWidth - (artMargin * 2);
        const moveIcon = this.scene.add
          .image(moveIconX, textY, 'moveIcon')
          .setOrigin(0.5)
          .setInteractive({ draggable: true })
          .setTint(0xf2f2f2)
          .setVisible(get(HomeEditBarExpanded));
        moveIcon.displayWidth = toolBarHeight * 0.8;
        moveIcon.displayHeight = toolBarHeight * 0.8;

        // Set up drag functionality for the move button
        this.setupMoveIconDrag(moveIcon);

        // Subscribe to HomeEditBarExpanded changes
        HomeEditBarExpanded.subscribe((value) => {
          moveIcon.setVisible(value);
          moveIcon.setInteractive(value ? { draggable: true } : false);
        });

        this.parentContainer.add(moveIcon);
      }

      // add navigation buttons
      const backButton = this.createNavigationButton(
        totalWidth / 2 - (toolBarHeight*0.3),
        parentContainerHeight  - (toolBarHeight / 2),
        'back_button',
        -1,
        updatePageInfo, 
        toolBarHeight * 0.8
      );
      const nextButton = this.createNavigationButton(
        totalWidth / 2 + (toolBarHeight * 2.3),
        parentContainerHeight  - (toolBarHeight / 2),
        'back_button',
        1,
        updatePageInfo,
        toolBarHeight * 0.8
      );

      this.parentContainer.add(backButton);
      this.parentContainer.add(nextButton);


      // Add app icon on the left side
      const appIcon = this.scene.add
        .image(artMargin * 2, textY, 'appIcon')
        .setOrigin(0.5)
        .setTint(0xf2f2f2);
      appIcon.displayWidth = toolBarHeight * 0.2;
      appIcon.displayHeight = toolBarHeight * 0.2;

      // Set the correct icon texture based on gallery type
      if (this.type === 'drawing') {
        appIcon.setTexture('drawing-icon');
      } else if (this.type === 'stopmotion') {
        appIcon.setTexture('animation-icon'); 
      }

      this.parentContainer.add(appIcon);

      updatePageInfo();

      this.homeGroup.add(this.parentContainer);

      // Call ServerCall.handleServerArray without the callback
      ServerCall.handleServerArray({
        type: `download${this.type.charAt(0).toUpperCase() + this.type.slice(1)}DefaultUserHome`,
        userId,
        serverObjectsHandler,
        artSize,
        artMargin,
      });
    } catch (error) {
      // console.warn('Error in loadAndPlaceGallery:', error);
    }
  }

  setupMoveIconDrag(moveIcon) {
    moveIcon.on('pointerdown', () => (ManageSession.playerIsAllowedToMove = false));
    moveIcon.on('pointerup', () => (ManageSession.playerIsAllowedToMove = true));

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
    const store = get(homeElements_Store);
    const galleryCollection = `gallery_${this.type}`;
    let galleryElement = null;

    // Find gallery element in the new store structure
    for (const collection in store) {
      if (store[collection]?.byKey) {
        const galleryGroup = Object.values(store[collection].byKey).find(
          (group) => group[0]?.value.collection === galleryCollection
        );
        if (galleryGroup) {
          galleryElement = galleryGroup[0];
          break;
        }
      }
    }

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
        scale,
      };

      if (JSON.stringify(galleryElement.value) !== JSON.stringify(newValue)) {
        HomeElements.updateStoreSilently(galleryElement.key, newValue);
        updateObject(galleryElement.collection, galleryElement.key, newValue, galleryElement.permission_read);
      }
    }
  }

  createNavigationButton(x, y, texture, direction, updatePageInfo, toolBarHeight ) {
    const button = this.scene.add
      .image(x, y, texture)
      .setDepth(500)
      .setVisible(true)
      .setName(direction === -1 ? 'backButton' : 'nextButton');

    if (direction === 1) {
      button.rotation = Math.PI;
    }

    button.displayWidth = toolBarHeight;
    button.displayHeight = toolBarHeight;
    button.setInteractive();

    button.on('pointerup', () => {
      const currentPage = this.homeGallery_CurrentPage;
      const totalPages = this.homeGallery_TotalPages;

      if ((direction === -1 && currentPage > 1) || (direction === 1 && currentPage < totalPages)) {
        this.homeGallery_CurrentPage += direction;

        const children = this.parentContainer.getAll('type', 'Container');
        children.forEach((child) => {
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
