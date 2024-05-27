Camera follows player with:

```
this.gameCam = this.cameras.main;

this.gameCam.startFollow(this.player);
```

//setBounds has to be set before follow, otherwise the camera doesn’t follow!

Order is:

```
this.gameCam = this.cameras.main;

this.gameCam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

this.gameCam.startFollow(this.player);
```
