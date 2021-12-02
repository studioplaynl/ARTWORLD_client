import manageSession from "./../manageSession";

class playersNetworkMovement {
  constructor() {
  }

  receive(scene) {
    if (manageSession.updateOnlinePlayers) {
      if (!manageSession.createPlayer) {
        if (manageSession.allConnectedUsers != null && manageSession.allConnectedUsers.length > 0) {

          manageSession.allConnectedUsers.forEach(player => {
            // const playerID = player.user_id
            // const found = manageSession.allConnectedUsers.some(user => user.user_id === playerID)
            // if (found) {console.log(player)}

            let tempPlayer = scene.onlinePlayers.find(o => o.user_id === player.user_id);
            if (typeof tempPlayer !== 'undefined') {

              //translate the artworldCoordinates to Phaser coordinates
              // tempPlayer.x = translateCoordinates.artworldToPhaser2D(player.posX)
              // tempPlayer.y = translateCoordinates.artworldToPhaser2D(player.posY)

              tempPlayer.x = player.posX
              tempPlayer.y = player.posY

              const movingKey = tempPlayer.getData("movingKey")

              //get the key for the moving animation of the player, and play it
              tempPlayer.anims.play(movingKey, true);

              setTimeout(() => {
                tempPlayer.anims.play(tempPlayer.getData("stopKey"), true);
              }, 250);
            }

          })

          manageSession.updateOnlinePlayers = false;
        }
      }
    }
  }

}

export default new playersNetworkMovement()