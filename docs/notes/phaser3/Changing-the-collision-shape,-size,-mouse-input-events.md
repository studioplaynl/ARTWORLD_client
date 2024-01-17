All collision examples:

http://labs.phaser.io/index.html?dir=physics/arcade/&q=

[![alt text](https://img.youtube.com/vi/7rcw_9Bqso0/mqdefault.jpg)](https://www.youtube.com/watch?v=7rcw_9Bqso0&ab_channel=WClarkson "collision shape and size")


The video explains how to set the size of the collision rectangle

Eg star object set the box to 100, 200 pix, true sets it in the middle
```
star.body.setSize(100,200, true);
```
Change the shape to a circle:
```
star.body.setCircle(100, -100 + star.body.halfHeight, -100 + star.body.halfWidth)
```
----
Center the circle

https://phaser.discourse.group/t/circular-collider-using-setcircle-is-not-centred-properly/8263/3

---


.setInteractive is to get pointer input events. Change the shape/ hit area like this:


```
let star = this.add.image(100,100, “star”)
var shape = new Phaser.Geom.Polygon([ 0, 143, 200, 143, 220, 200, 0, 200 ]);
star.setInteractive(shape, Phaser.Geom.Polygon.Contains);
this.input.on(‘gameobjectover’, function (pointer, gameObject) {
gameObject.setTint(0x7878ff); console.log(“mouse over”)
});
this.input.on(‘gameobjectout’, function (pointer, gameObject) {
gameObject.clearTint();
});
// Draw the polygon var graphics = this.add.graphics({ x: star.x, y: star.y});
graphics.lineStyle(2, 0x00aa00);
graphics.beginPath();
graphics.moveTo(shape.points[0].x, shape.points[0].y);
for (var i = 1; i < shape.points.length; i++) { graphics.lineTo(shape.points[i].x, shape.points[i].y); }
graphics.closePath(); graphics.strokePath();
```


![](https://maartenvanderglas.com/NOTPRIV/artworld/wp-content/uploads/sites/7/2021/09/Screenshot-from-2021-09-24-12-55-57-282x300.png)

mousing over the green shape makes the start change color

---

Mouse input with setInteractive, input area, attach input to GameObject:
```
this.location2DialogBox = this.add.graphics();

this.location2DialogBox.fillStyle(0xfffff00, 0.4)

this.location2DialogBox.fillRoundedRect(0, 0, mainWidth, mainHeight, 32) this.location2DialogBox.setVisible(false)

this.realtimeTexture = this.add.renderTexture(0, 0, mainWidth, mainHeight);

this.realtimeTexture.draw(this.location2DialogBox);

this.realtimeTexture.setInteractive(new Phaser.Geom.Rectangle(0, 0, mainWidth, mainWidth), Phaser.Geom.Rectangle.Contains)

this.realtimeTexture.on(‘pointerdown’, () => { this.enterLocation2Scene() });
```

Add an existing GameObject to the physics

this.physics.add.existing(Gameobject)

Works also with graphics

using matter physics:

https://www.thepolyglotdeveloper.com/2020/08/use-matterjs-physics-sprite-collisions-phaser-game/