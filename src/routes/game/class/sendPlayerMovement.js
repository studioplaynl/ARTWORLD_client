import manageSession from "../manageSession";

class sendPlayerMovement {

    constructor() {
    }

    network(scene) {
        if (scene.createdPlayer) {
            if (
                manageSession.updateMovementTimer > manageSession.updateMovementInterval
            ) {

                //send the player position as artworldCoordinates, because we store in artworldCoordinates on the server
                manageSession.sendMoveMessage(translateCoordinates.Phaser2DToArtworld(scene.player.x), translateCoordinates.Phaser2DToArtworld(scene.player.y))
                //console.log(this.player.x)
                manageSession.updateMovementTimer = 0
            }
            // this.scrollablePanel.x = this.player.x
            // this.scrollablePanel.y = this.player.y + 150
        }
    }

}

export default new sendPlayerMovement()