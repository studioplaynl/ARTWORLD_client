import ManageSession from '../ManageSession';
import CoordinatesTranslator from './CoordinatesTranslator';

const { Phaser } = window;

export default class CurveWithHandles {
  constructor(config) {
    const { artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;

    this.scene = config.scene;
    this.points = config.points; // array of points
    this.x = config.x;
    this.y = config.y;

    this.curve = new Phaser.Curves.Spline([
      artworldToPhaser2DX(this.worldSize.x, -977), artworldToPhaser2DY(this.worldSize.y, 598),
      artworldToPhaser2DX(this.worldSize.x, -604), artworldToPhaser2DY(this.worldSize.y, 526),
      artworldToPhaser2DX(this.worldSize.x, -608), artworldToPhaser2DY(this.worldSize.y, 92),
      artworldToPhaser2DX(this.worldSize.x, 339), artworldToPhaser2DY(this.worldSize.y, 202),
      artworldToPhaser2DX(this.worldSize.x, 616), artworldToPhaser2DY(this.worldSize.y, 972),
    ]);

    const { points } = this.curve;

    //  Create drag-handles for each point
    if (ManageSession.gameEditMode) {
      for (let i = 0; i < points.length; i += 1) {
        const point = points[i];

        this.handle = this.add.image(point.x, point.y, 'ball', 0).setScale(0.1).setInteractive().setDepth(40);
        this.handle.name = 'handle';

        this.handle.setData('vector', point);

        this.input.setDraggable(this.handle);
      }
    }
    this.curveGraphics = this.add.graphics();
    this.curveGraphics.lineStyle(60, 0xffff00, 1);
    this.curve.draw(this.curveGraphics, 64);
  }
}
