##Grid

![grid background with grid function](https://maartenvanderglas.com/NOTPRIV/artworld/wp-content/uploads/sites/7/2021/09/Screenshot-from-2021-09-21-12-59-28.png)

var g1 = this.add.grid(0, 0, 3200, 3200, 32, 32, 0xFFFFFF)

---

##Map with dot as Tileset

![](https://maartenvanderglas.com/NOTPRIV/artworld/wp-content/uploads/sites/7/2021/09/Screenshot-from-2021-09-21-13-13-30.png)

The map is still generated as an image, so there is no benefit when zooming in.

---

##Dot repeating with grid methods

![](https://maartenvanderglas.com/NOTPRIV/artworld/wp-content/uploads/sites/7/2021/09/Screenshot-from-2021-09-21-16-41-47.png)

```
let group = this.add.group({ key: 'dot', repeat: 8000, setX: { x: 0, y: 0, stepX: 64 } });

Phaser.Actions.GridAlign(group.getChildren(), { width: 100, height: 200, cellWidth: 64, cellHeight: 64, x: 16, y: 16 });
```

There is not a sharpness advantage, because the SVG is being converted to an image when loading. You can preload the SVG scaled, that will actually create a scaled up image.
See: https://phaser.io/examples/v3/view/loader/svg/load-svg-with-scale

---

##graphics elements

```

let circles = [] <br><br>const graphics = this.add.graphics();<br><br>graphics.fillStyle(0xffffff); <br>graphics.fillRect(0, 0, 3000, 3000);<br><br>graphics.fillStyle(color, alpha);

const offset = 50 <br>for (let i = 0; i &lt; 2000; i += offset) { <br>for (let j = 0; j &lt; 2000; j += offset) { <br>circles[i] = graphics.fillCircle(i, j, 2);

```

This works but there is slowness when loading the array, and when the player is moving accross the field the graphics scrolling is not smooth

---

##This works really well:

##Here is a way to generate patterns on a texture with an array:

```
et cross = [
'.....',
 '..1..',
 '.111.',
 '..1..',
 '.....',
 ]

//generate the texture from the array

this.textures.generate('cross', { data: cross, pixelWidth: 4 });

//display the texture on an image

const gridWidth = 4000
const offset = 40

for (let i=0;i< gridWidth; i += offset){ for (let j=0;j< gridWidth; j += offset){ this.add.image(i, j, 'cross').setOrigin(0, 1); } }
```

![](https://maartenvanderglas.com/NOTPRIV/artworld/wp-content/uploads/sites/7/2021/09/Screenshot-from-2021-09-24-15-35-59.png)

---

Draw a shape to a texture, and repeat it there.

Slow to generate, but fast after that.

![](https://maartenvanderglas.com/NOTPRIV/artworld/wp-content/uploads/sites/7/2021/09/Screenshot-from-2021-09-27-12-05-01.png)

```
// //display the texture on an image
    const gridWidth = 4000
    const offset = 50

    let rt = this.add.renderTexture(0, 0, gridWidth, gridWidth);
    let circle = this.add.circle(-1000, -1000, 6, 0x6666ff)
    for (let i = 0; i < gridWidth; i += offset) {
      for (let j = 0; j < gridWidth; j += offset) {
        rt.draw(circle, i, j);
      }
    }
```

---

![](https://maartenvanderglas.com/NOTPRIV/artworld/wp-content/uploads/sites/7/2021/09/Screenshot-from-2021-09-27-13-40-23.png)

```

let cross = [
      '.....',
      '..1..',
      '.111.',
      '..1..',
      '.....',

    ]

    //generate the texture from the array
    this.textures.generate('cross', { data: cross, pixelWidth: 2 });

    //display the texture on an image
    const gridWidth = 4000
    const offset = 50

    for (let i = 0; i < gridWidth; i += offset) {
      for (let j = 0; j < gridWidth; j += offset) {
        this.add.image(i, j, 'cross').setOrigin(0, 1);
      }
    }

    let graphics = this.add.graphics();

    graphics.fillStyle(0x0000ff, 1);

    graphics.fillCircle(800, 300, 200);

    for (let i = 0; i < 250; i += 60) {
      graphics.lineStyle(5, 0xFF00FF, 1.0);
      graphics.beginPath();
      graphics.moveTo(800, 200 + i);
      graphics.lineTo(1200, 200 + i);
      graphics.closePath();
      graphics.strokePath();
    }


    for (let i = 0; i < 250; i += 60) {
      graphics.lineStyle(5, 0xFF00FF, 1.0);
      graphics.beginPath();
      graphics.moveTo(900 + i, 150);
      graphics.lineTo(900 + i, 550);
      graphics.closePath();
      graphics.strokePath();
    }



    let rectangle = this.add.graphics();
    rectangle.setVisible(false);
    rectangle.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
    rectangle.fillRect(0, 0, 400, 400);

    let rt = this.add.renderTexture(200, 100, 600, 600);
    let rt2 = this.add.renderTexture(100, 600, 600, 600);

    rt.draw(rectangle);
    rt2.draw(rectangle);

    let eraser = this.add.circle(0, 0, 190, 0x000000);
    eraser.setVisible(false);

    rt.erase(eraser, 200, 200);

    rt2.erase(rt, 0, 0)

    rt2.x = 400
    rt2.y = 600
```

---
