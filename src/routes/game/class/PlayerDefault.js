import ManageSession from '../ManageSession';
import CoordinatesTranslator from './CoordinatesTranslator';
import itemsBar from '../../components/itemsbar';
import { setUrl } from '../helpers/UrlHelpers';

const { Phaser } = window;

export default class PlayerDefault extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey) {
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
      ManageSession.playerMove = true;
    });

    // creating a hit area for a better user experience
    this.input.hitArea.setTo(-10, -10, this.width + 50, this.height + 50);

    this.on('pointerup', async () => {
      itemsBar.update(() => ({
        playerClicked: true,
        onlinePlayerClicked: false,
      }));
    });

    //  Set some default physics properties
    this.body.onOverlap = true;
    this.setDepth(101);

    const { Phaser2DToArtworldX, Phaser2DToArtworldY } = CoordinatesTranslator;

    // set url param's to player pos and scene key
    setUrl(
      scene.location,
      Phaser2DToArtworldX(scene.worldSize.x, ManageSession.playerPosX),
      Phaser2DToArtworldY(scene.worldSize.y, ManageSession.playerPosY),
    );
  }
}
