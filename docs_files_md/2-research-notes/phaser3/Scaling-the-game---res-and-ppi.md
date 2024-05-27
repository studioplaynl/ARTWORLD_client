The best summary:
[https://www.joshmorony.com/how-to-scale-a-game-for-all-device-sizes-in-phaser/](https://www.joshmorony.com/how-to-scale-a-game-for-all-device-sizes-in-phaser/)

```game = new Phaser.Game(
  window.innerWidth * window.devicePixelRatio,
  window.innerHeight * window.devicePixelRatio,
  Phaser.CANVAS,
  'gameArea'
);
```

Scaling Game Assets
The other issue we run into when scaling is with the size of graphical assets (i.e player sprites, objects and so on). If you create some object at 300 x 300 pixels and it looks great on a device with a DPR of 1 (i.e your desktop computer or an iPhone 4) it will probably look teeny tiny on devices with a higher DPR.

Take the iPhone 5 for example again, although the object is 300 x 300 pixels it will only look like it's 150 x 150 pixels. We need the asset to be twice as big for iPhone 5's, so how do we handle this?

What you can do is create the object to suit the highest DPR you are supporting, which will likely be 3. This means that your 300 x 300 object should actually be 900 x 900. Then we scale it down in game to suit the device that it is actually on. On a device with a DPR of 3 we do nothing, with a DPR of 2 we will scale it down to 2/3rds of it's original size and for a device with a DPR of 1 we will scale it down to 1/3rd of its original size.

To do this, first you need to figure out what this scaleRatio is. Create a new globally stored variable with the following code:

```
scaleRatio = window.devicePixelRatio / 3
```

and now whenever you add a new asset to the game, call the following method to scale it appropriately:

```
myAsset.scale.setTo(scaleRatio, scaleRatio)
```

Now your asset will scale appropriately no matter what device your game is loaded on.

---

many examples of fitting and scaling, resizing:

https://phaser.io/examples/v3/category/scalemanager

Basics to Deal with Multiple Resolutions & Device Pixel Density in Phaser 3

[![Resolutions](https://img.youtube.com/vi/o3y9Yjy6dy4/mqdefault.jpg)](https://www.youtube.com/watch?v=o3y9Yjy6dy4&ab_channel=Ourcade 'Basics to Deal with Multiple Resolutions & Device Pixel Density in Phaser 3')
