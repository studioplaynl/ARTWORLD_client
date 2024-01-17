### To enable the player to collide with the world bounds (in Player):

```
        scene.player.setCollideWorldBounds(true)
        scene.player.onWorldBounds = true

        scene.player.body.onWorldBounds = true
        scene.player.body.checkCollision.up = true
        scene.player.body.checkCollision.down = true
        scene.player.body.checkCollision.left = true
        scene.player.body.checkCollision.right = true
```

### To catch the collided object with the world bounds (in the scene):

```
    this.physics.world.on('worldbounds', (collidingObject) => {

    })
```
