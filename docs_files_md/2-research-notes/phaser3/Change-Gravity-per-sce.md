
You can specify the gravity for a particular scene by redefining the physics settings in the scene’s constructor method.
```

class FirstScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'first',
      physics: {
        default: 'arcade',
        arcade: { 
          gravity: { y: 2000 }
        }
      }
    });
} 

```

Check out the API Docs to see what else can be configured on a scene-by-scene basis.

