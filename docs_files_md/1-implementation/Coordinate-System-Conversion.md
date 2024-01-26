Coordinate system Conversion

ARTWORLD needs to be able to grow from time to time. It is better to have worlds where 0, 0 is the center, because then coordinates remain valid when worlds become bigger. 0 , 0 is still the center etc

This means that there needs to be a conversion between what I call ARTWORLDcoordinates (0, 0 is center) and phaser2Dcoordinates(0,0 is top left)

It is a simple conversion when we know the worldSize. 


    artworldVectorToPhaser2D(worldSize, positionVector) {
        const worldSizeX = worldSize.x
        const worldSizeY = worldSize.y

        positionVector.x = positionVector.x + (worldSizeX / 2)
        positionVector.y = positionVector.y + (worldSizeY / 2)
        return positionVector
    }

    Phaser2DVectorToArtworld(worldSize, x, y) {
        // usage: 
        // pass the worldSize and the coordinates you want to do the calculation on
        // output is a Vector

        const worldSizeX = worldSize.x
        const worldSizeY = worldSize.y

        positionVector.x = positionVector.x - (worldSizeX / 2)
        positionVector.y = positionVector.y - (worldSizeY / 2)
        return positionVector
    }

So we need to define a wordSize(x,y) in each scene, this way our ARTWORLDcoordinates stay consistent.

ARTWORLDcoordinates are especially important when we think where to place 'houses', artworks, etc, and when we store the last position of the player.


***

### Conventions to make this system work   

* In Phaser everything works with Phaser2Dcoordinates   
* We design worlds with ARTWORLDcoordinates  
* On the server we store everything in ARTWROLDcoordinates, so that everything is placed as designed, also when the world has grown in each direction  

That means that coordinates only have to be converted when sending it over the network, and when receiving coordinates over the networks. 
 Also when we place Locations we do it with ARTWORLDcoordinates, and we convert them to Phaser2Dcoordinates when passing arguments.  Then Phaser just deals with them as Phaser2Dcoordinates  

In practice what we have to do when making a scene:

* import CoordinatesTranslator from "../class/CoordinatesTranslator.js"

* define globally: this.worldSize = new Phaser.Math.Vector2(3000, 3000)

* define locations with ARTWORLDcoordinates

`this.location1 = this.add.isotriangle(CoordinatesTranslator.artworldToPhaser2D(this.worldSize.x, -200), CoordinatesTranslator.artworldToPhaser2D(this.worldSize.y, 200), 150, 150, false, 0x8dcb0e, 0x3f8403, 0x63a505)`

Behind the scenes coordinates are converted here:

* When the player avatar is loaded from the server, the last know position is also retreived

> in Player.js attachAvatarToPlayer   
> //*place the player in the last known position   
> scene.player.x = translateCoordinates.artworldToPhaser2D(this.worldSize.x, this.player.posX)   
> scene.player.y = translateCoordinates.artworldToPhaser2D(this.worldSize.y, this.player.posY)   

* When we send Player movement over the network  
It is not yet converted in the Player.js, but it will be converted in ManageSession.sendMoveMessage, so we pass scene, to know worldSize later on.   


> in Player.js  
> sendMovement(scene) {  
>    if (scene.createdPlayer) {  
>      if (  
>       ManageSession.updateMovementTimer > ManageSession.updateMovementInterval  
>      ) {  
>        //send the player position as artworldCoordinates, because we store in artworldCoordinates on the server  
>        ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y)  
>        ManageSession.updateMovementTimer = 0  
>      }  
>    }
> }


In ManageSession.sendMoveMessage   

`sendMoveMessage(scene, posX, posY) {
    //transpose phaser coordinates to artworld coordinates
    //console.log(scene)
    posX = CoordinatesTranslator.Phaser2DToArtworld(scene.worldSize.x, posX)
    posY = CoordinatesTranslator.Phaser2DToArtworld(scene.worldSize.y, posY)

    var opCode = 1;
    var data =
      '{ "posX": ' + posX + ', "posY": ' + posY + ', "location": "' + this.location + '" }'

    this.socket.rpc("move_position", data)
  }` 

