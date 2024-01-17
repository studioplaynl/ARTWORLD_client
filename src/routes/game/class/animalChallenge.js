/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line no-unused-vars
import { dlog } from '../../../helpers/debugLog';
import ManageSession from '../ManageSession';

import * as Phaser from 'phaser';


export default class AnimalChallenge extends Phaser.GameObjects.Sprite {
  constructor(scene, element, artSize) {
    if (scene === null) {
      // eslint-disable-next-line no-param-reassign
      scene = ManageSession.currentScene;
    }
    super(scene);
    try {
      this.scene = scene;
      this.lastVelocity = new Phaser.Math.Vector2(0, 0);
      this.animal = {};
      this.artSize = artSize;

      this.element = element;

      const avatarKey = this.element.value.url;

      scene.add.existing(this);
      scene.physics.add.existing(this);

      const avatar = scene.textures.get(avatarKey);
      // dlog('avatar', avatar);
      const avatarWidth = avatar.frames.__BASE.width;
      const avatarHeight = avatar.frames.__BASE.height;

      const avatarFrames = Math.round(avatarWidth / avatarHeight);
      let setFrameRate = 0;
      if (avatarFrames > 1) {
        setFrameRate = (avatarFrames * 2) + 2;
      } else {
        setFrameRate = 0;
      }

      // set names for the moving and stop animations
      scene.anims.create({
        key: `moving_${avatarKey}`,
        frames: scene.anims.generateFrameNumbers(avatarKey, { start: 0, end: avatarFrames - 1 }),
        frameRate: setFrameRate,
        repeat: -1,
        yoyo: true,
      });

      scene.anims.create({
        key: `stop_${avatarKey}`,
        frames: scene.anims.generateFrameNumbers(avatarKey, { start: 0, end: 0 }),
      // frameRate: 8,
      // repeat: -1,
      // yoyo: true
      });

      const tempX = Phaser.Math.Between((this.artSize * 2), scene.worldSize.x - (this.artSize * 2));
      const tempY = Phaser.Math.Between((this.artSize * 2), scene.worldSize.y - (this.artSize * 2));

      // dlog('tempX, tempY', tempX, tempY);
      this.animal = scene.physics.add.sprite(tempX, tempY, 'avatar1');

      this.animal.setData('moveAnim', `moving_${avatarKey}`);
      this.animal.setData('stopAnim', `stop_${avatarKey}`);

      this.animal.play(`moving_${avatarKey}`);

      const width = this.artSize;
      this.animal.displayWidth = width;
      this.animal.scaleY = this.animal.scaleX;
      this.animal.body.setCircle(width / 2, 0, 0);

      this.animal.name = 'dier';

      this.animal.setVelocity(Phaser.Math.Between(-300, 401), Phaser.Math.Between(-200, 400));

      // this.animal.setInteractive()
      this.animal.setDepth(200);
      // dlog('this.animal', this.animal);
      const tempDelay = Phaser.Math.Between(1000, 20000);
      scene.time.addEvent({
        delay: tempDelay, callback: this.stopAnimalMovement, args: [this.animal], callbackScope: this, loop: false,
      });
    } catch (error) {
      console.error('An error occurred while adding the object to the scene:', error);
    }
  }// end constructor

  preUpdate(time, delta) {
    // time and delta are essential to make animations work within the class!
    super.preUpdate(time, delta);
    if (typeof this.animal.body === 'undefined') return;
    this.lastVelocity = this.animal.body.velocity;

    if (this.animal.x < (0 + (this.artSize / 2))) {
      let newVelocityX = this.lastVelocity.x;
      const newVelocityY = Phaser.Math.Between((this.lastVelocity.y * 0.4), (this.lastVelocity.y * 1.6)) + 10;
      newVelocityX = Math.abs(this.lastVelocity.x);
      this.animal.body.setVelocity(newVelocityX, newVelocityY);
    }

    if (this.animal.x > (this.animal.scene.worldSize.x - (this.artSize / 2))) {
      let newVelocityX = this.lastVelocity.x;
      const newVelocityY = Phaser.Math.Between((this.lastVelocity.y * 0.4), (this.lastVelocity.y * 1.6)) + 10;
      newVelocityX = Math.abs(this.lastVelocity.x) * -1;
      this.animal.body.setVelocity(newVelocityX, newVelocityY);
    }

    if (this.animal.y < (0 + (this.artSize / 2))) {
      const newVelocityX = Phaser.Math.Between((this.lastVelocity.x * 0.4), (this.lastVelocity.x * 1.8)) + 10;
      let newVelocityY = this.lastVelocity.y;
      newVelocityY = Math.abs(this.lastVelocity.y);
      this.animal.body.setVelocity(newVelocityX, newVelocityY);
    }

    if (this.animal.y > (this.animal.scene.worldSize.y - (this.artSize / 2))) {
      const newVelocityX = Phaser.Math.Between((this.lastVelocity.x * 0.4), (this.lastVelocity.x * 1.8)) + 10;
      let newVelocityY = this.lastVelocity.y;
      newVelocityY = Math.abs(this.lastVelocity.y) * -1;
      this.animal.body.setVelocity(newVelocityX, newVelocityY);
    }

    if (this.animal.body.velocity.x > 700) {
      this.animal.body.setVelocityX(this.animal.body.velocity.x / 3);
    }
    if (this.animal.body.velocity.y > 700) {
      this.animal.body.setVelocityY(this.animal.body.velocity.y / 3);
    }

    if (this.lastVelocity.x > 0) {
      this.animal.flipX = false;
    } else {
      this.animal.flipX = true;
    }
  } // end preUpdate

  stopAnimalMovement(gameobject) {
    if (typeof gameobject.body !== 'undefined') {
      const tempAnim = gameobject.getData('stopAnim');
      gameobject.body.setVelocity(0, 0);
      gameobject.play(tempAnim);
      const tempDelay = Phaser.Math.Between(1000, 5000);
      this.scene.time.addEvent({
        delay: tempDelay, callback: this.resumeAnimalMovement, args: [gameobject], callbackScope: this, loop: false,
      });
    }
  }

  resumeAnimalMovement(gameobject) {
    const tempAnim = gameobject.getData('moveAnim');
    gameobject.body.setVelocity(Phaser.Math.Between(30, 350), Phaser.Math.Between(-30, -500));
    gameobject.play(tempAnim);

    const tempDelay = Phaser.Math.Between(1000, 20000);
    this.scene.time.addEvent({
      delay: tempDelay, callback: this.stopAnimalMovement, args: [gameobject], callbackScope: this, loop: false,
    });
  }
} // end class
