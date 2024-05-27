Fade camera out from color:

```
this.cameras.main.fadeFrom(2000, Phaser.Math.Between(50, 255), Phaser.Math.Between(50, 255), Phaser.Math.Between(50, 255));

    this.cameras.main.on('camerafadeoutcomplete', function () {

        this.scene.restart();

    }, this);
```

Fade camera in to color:

```
var red = Phaser.Math.Between(50, 255);
var green = Phaser.Math.Between(50, 255);
var blue = Phaser.Math.Between(50, 255);

this.cameras.main.fade(2000, red, green, blue);
```
