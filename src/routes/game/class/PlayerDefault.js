import ManageSession from '../ManageSession';
// import CoordinatesTranslator from './CoordinatesTranslator';
import { ShowItemsBar } from '../../../session';

const { Phaser } = window;

//
export default class PlayerDefault extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'defaultPlayerAvatar');

    // load the texture that is associated with the animation key 'stop'
    this.play('stop');

    //  add images and physics to the scene, displayList and updateList
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // making the avatar interactive
    this.setInteractive({ useHandCursor: true });

    // also detect movementTouch when clicking on player: to detect swipt starting from player
    this.on('pointerdown', () => {
      ManageSession.playerIsAllowedToMove = true;
    });

    // creating a hit area for a better user experience
    this.input.hitArea.setTo(-10, -10, this.width + 50, this.height + 50);

    this.on('pointerup', async () => {
      ShowItemsBar.set(true);
    });

    //  Set some default physics properties
    this.body.onOverlap = true;
    this.setDepth(101);
  }
}
