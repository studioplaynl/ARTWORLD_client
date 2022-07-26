import { dlog } from '../helpers/DebugLog';

const { Phaser } = window;
export default class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, fontColor, key1, text) {
    super(scene);

    // this.scene = scene

    this.x = x;
    this.y = y;

    const button = scene.add.image(
      x,
      y,
      key1,
    ).setInteractive();

    const buttonText = scene.add.text(x, y, text, {
      fontSize:
                '18px',
      color: fontColor,
    });

    Phaser.Display.Align.In.Center(buttonText, button);

    this.add(button);
    this.add(buttonText);
    button.on('pointerdown', () => {
      buttonText.setText('pointerDown');
    });

    button.on('pointerup', () => {
      buttonText.setText(text);
    });

    dlog(scene.textures.exists(key1));
    scene.add.existing(this);
  }
}
