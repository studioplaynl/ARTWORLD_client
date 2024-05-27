Standard use:
GameObject1, GameObject2, functions, (processCallback), scope

function:
An optional callback function that is called if the objects collide.

processCallback
An optional callback function that lets you perform additional checks against the two objects if they collide. If this is set then collideCallback will only be called if this callback returns true.

Example:

```
this.physics.add.overlap(this.player, this.location2, this.confirmEnterLocation, null, this);
```

The 2 Objects are automatically passed as arguments, the sprite as the first (https://phaser.discourse.group/t/passing-argments-into-functions/4411/2)
So this is passed on to the function as such:

```
confirmEnterLocation(player, location) {
console.log(player) //Object 1
console.log(location) //Object 2
}
```

OVERLAP ZONE:

https://phaser.io/examples/v3/view/physics/arcade/overlap-zone
