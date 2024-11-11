/* Re-direct scene to CloudWorld
*/ 

import * as Phaser from 'phaser';

export default class WolkenWereld extends Phaser.Scene {
  constructor() {
    super('WolkenWereld');    
  }

  create() {
    this.scene.start('CloudWorld');
  }
}
