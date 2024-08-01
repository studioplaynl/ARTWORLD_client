import * as Phaser from 'phaser';

import ServerCall from '../class/ServerCall';

export default class HomeGalleryManager {
  constructor(scene, config) {
    this.scene = scene;
    this.type = config.type;
    this.userId = config.userId;
    this.artSize = config.artSize;
    this.artMargin = config.artMargin;
    this.pageSize = config.pageSize || 3;
    this.yPosition = config.yPosition || 0;
    
    this.currentPage = 1;
    this.totalPages = 1;
    this.artOnCurrentPage = {};
    
    this.serverObjectsHandler = [];
    this.galleryGroup = null;
    this.parentContainer = null;
  }

  init() {
    this.galleryGroup = this.scene.add.group();
    this.createParentContainer();
    this.addNavigationButtons();
  }

  createParentContainer() {
    const totalWidth = this.pageSize * (this.artSize + this.artMargin);
    
    if (this.parentContainer) {
      this.parentContainer.removeAll(true);
    }
    
    this.parentContainer = this.scene.add.container(this.artMargin/2, this.yPosition)
      .setSize(totalWidth + (this.artMargin * 2), this.artSize + (this.artMargin * 4))
      .setName(`ParentContainer_${this.type}`);

    this.createBackgroundGraphics(totalWidth);
    
    this.galleryGroup.add(this.parentContainer);
  }

  createBackgroundGraphics(totalWidth) {
    const graphic1 = this.scene.add.graphics();
    graphic1.fillStyle(0xa9a9a9);
    graphic1.fillRect(0, 0, totalWidth + this.artMargin, this.artSize + (this.artMargin * 5));
    this.parentContainer.add(graphic1);
    
    const graphic2 = this.scene.add.graphics();
    graphic2.fillStyle(0xf2f2f2);
    graphic2.fillRect(0, 0, totalWidth + this.artMargin, this.artSize + (this.artMargin * 3));
    this.parentContainer.add(graphic2);
  }

  addNavigationButtons() {
    const totalWidth = this.pageSize * (this.artSize + this.artMargin);
    
    const backButton = this.scene.add.image(totalWidth / 2, this.artSize + (this.artMargin * 3) + 50, 'back_button')
      .setDepth(500)
      .setVisible(true)
      .setName('backButton');
    backButton.displayWidth = backButton.displayHeight = 60;
    backButton.setInteractive();
    backButton.on('pointerup', () => this.navigateGallery(-1));
    this.parentContainer.add(backButton);

    const nextButton = this.scene.add.image(
        totalWidth / 2 + (this.artMargin * 2), this.artSize + (this.artMargin * 3) + 50, 'back_button')
      .setDepth(500)
      .setVisible(true)
      .setName('nextButton');
    nextButton.rotation = Math.PI;
    nextButton.displayWidth = nextButton.displayHeight = 60;
    nextButton.setInteractive();
    nextButton.on('pointerup', () => this.navigateGallery(1));
    this.parentContainer.add(nextButton);
  }

  navigateGallery(direction) {
    const newPage = this.currentPage + direction;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.clearArtworks();
      this.loadAndPlaceArtworks();
    }
  }

  clearArtworks() {
    const children = this.parentContainer.getAll('type', 'Container');
    children.forEach(child => {
      this.parentContainer.remove(child);
      child.destroy();
    });
  }

  loadAndPlaceArtworks() {
    ServerCall.downloadAndPlaceArtByType({
      type: this.type,
      userId: this.userId,
      serverObjectsHandler: this.serverObjectsHandler,
      artSize: this.artSize,
      artMargin: this.artMargin,
      selfHome: this.scene.selfHome,
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      onArtworkPlaced: (artwork) => this.onArtworkPlaced(artwork),
      onPageInfoUpdated: (info) => this.onPageInfoUpdated(info)
    });
  }

  onArtworkPlaced(artwork) {
    // Handle artwork placement if needed
  }

  onPageInfoUpdated(info) {
    this.totalPages = info.totalPages;
    this.updateButtonsVisibility();
  }

  updateButtonsVisibility() {
    const backButton = this.parentContainer.getByName('backButton');
    const nextButton = this.parentContainer.getByName('nextButton');
    
    if (backButton && nextButton) {
      backButton.setVisible(this.currentPage > 1);
      nextButton.setVisible(this.currentPage < this.totalPages);
    }
  }
}