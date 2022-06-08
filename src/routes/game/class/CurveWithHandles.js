import ManageSession from "../ManageSession"

export default class CurveWithHandles {

    constructor(config) {

        this.scene = config.scene
        this.points = config.points //array of points
        this.x = config.x
        this.y = config.y
       
        let path = { t: 0, vec: new Phaser.Math.Vector2() };

        this.curve = new Phaser.Curves.Spline([
          CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -977), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 598),
          CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -604), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 526),
          CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -608), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 92),
          CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 339), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 202),
          CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 616), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 972),
        ]);
    
        let points = this.curve.points;
    
        //  Create drag-handles for each point
        if (ManageSession.gameEditMode) {
          for (var i = 0; i < points.length; i++) {
            var point = points[i];
    
            this.handle = this.add.image(point.x, point.y, 'ball', 0).setScale(0.1).setInteractive().setDepth(40)
            this.handle.name = "handle"
    
            this.handle.setData('vector', point);
    
            this.input.setDraggable(this.handle);
          }
    
          
        }
        this.curveGraphics = this.add.graphics();
        this.curveGraphics.lineStyle(60, 0xffff00, 1)
        this.curve.draw(this.curveGraphics, 64)

    }
}
