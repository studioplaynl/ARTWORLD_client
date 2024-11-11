import * as Phaser from 'phaser';

export default class FlamingoWereld extends Phaser.Scene {
  constructor() {
    super('FlamingoWereld');    
  }

  create() {
    this.scene.start('FlamengoWereld');
  }
}
