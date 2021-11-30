import manageSession from "./../manageSession";

class playerLoadOnlineAvatar {
    constructor() { 
    }

    debug(scene, player) {
        console.log(scene)
        console.log(player)
    }

    loadAvatar(scene) { 
        //check if account info is loaded
        if (manageSession.userProfile.id != null) {
            //check for createPlayer flag
            if (manageSession.createPlayer) {
                manageSession.createPlayer = false;
                //console.log("manageSession.createPlayer = false;")

                //set the location of the player to this location

                scene.createdPlayer = false; //? WORKING ?

                //console.log("loadAndCreatePlayerAvatar")

                // is playerAvaterKey already in loadedAvatars?
                //no -> load the avatar and add to loadedAvatars
                //yes -> dont load the avatar

                scene.playerAvatarKey = manageSession.userProfile.id + "_" + manageSession.userProfile.create_time
                console.log(scene.playerAvatarKey)

                // console.log("this.textures.exists(this.playerAvatarKey): ")
                // console.log(this.textures.exists(this.playerAvatarKey))

                // console.log(this.cache.game.textures.list[this.playerAvatarKey])

                console.log(scene.textures.exists(scene.playerAvatarKey))

                //!
                scene.add.existing(this);
                scene.physics.add.existing(this);

                //if the texture already exists attach it again to the player
                if (!scene.textures.exists(scene.playerAvatarKey)) {
                    //check if url is not empty for some reason, returns so that previous image is kept
                    if (manageSession.userProfile.url === "") {
                        console.log("avatar url is empty")
                        manageSession.createPlayer = false;
                        console.log("manageSession.createPlayer = false;")
                        scene.createdPlayer = true;
                        console.log("scene.createdPlayer = true;")
                        return
                    } else {
                        // console.log(" loading: manageSession.userProfile.url: ")
                        // console.log(manageSession.userProfile.url)

                        scene.load.spritesheet(
                            scene.playerAvatarKey,
                            manageSession.userProfile.url, { frameWidth: 128, frameHeight: 128 }
                        );

                        scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
                            console.log("loadAndCreatePlayerAvatar complete:")
                            console.log(manageSession.userProfile.url)

                            if (scene.textures.exists(scene.playerAvatarKey)) {

                                this.attachAvatarToPlayer(scene) 

                            }// if (this.textures.exists(this.playerAvatarKey)) 
                        })
                    }

                    scene.load.start(); // load the image in memory
                    //console.log("this.load.start();");

                } else {
                    this.attachAvatarToPlayer(scene) 
                }
            }//if(manageSession.playerCreated)
        }
    }// end loadAvatar

    attachAvatarToPlayer(scene) { 
        
        const avatar = scene.textures.get(scene.playerAvatarKey)
        console.log(avatar)
        const avatarWidth = avatar.frames.__BASE.width
        console.log("avatarWidth")
        console.log(avatarWidth)
        const avatarHeight = avatar.frames.__BASE.height
        console.log("avatarHeight")
        console.log(avatarHeight)

        const avatarFrames = Math.round(avatarWidth / avatarHeight)
        console.log("avatarFrames: " + avatarFrames)

        //make an animation if the image is wider than tall
        if (avatarFrames > 1) {
            //. animation for the player avatar ......................

            scene.playerMovingKey = "moving" + "_" + scene.playerAvatarKey;
            scene.playerStopKey = "stop" + "_" + scene.playerAvatarKey;

            scene.anims.create({
                key: scene.playerMovingKey,
                frames: scene.anims.generateFrameNumbers(scene.playerAvatarKey, { start: 0, end: avatarFrames - 1 }),
                frameRate: (avatarFrames + 2) * 2,
                repeat: -1,
                yoyo: true
            });

            scene.anims.create({
                key: scene.playerStopKey,
                frames: scene.anims.generateFrameNumbers(scene.playerAvatarKey, { start: 0, end: 0 }),
            });

            //. end animation for the player avatar ......................
        }

        // texture loaded so use instead of the placeholder
        console.log("scene.playerAvatarKey")
        console.log(scene.playerAvatarKey)
        console.log(scene.player.texture.key)

        scene.player.texture = scene.playerAvatarKey

        //scale the player to 64px
        const width = 64
        scene.player.displayWidth = width
        scene.player.scaleY = scene.player.scaleX

        scene.playerShadow.displayWidth = width
        scene.playerShadow.scaleY = scene.playerShadow.scaleX

        //* set the collision body
        //* setCircle(radius [, offsetX] [, offsetY])
        // scene.player.body.setCircle(width, width, width / 2)
        scene.player.body.setCircle(width / 1.1, width / 5, width / 5)

        //place the player in the last known position
        // this.player.x = this.player.posX
        // this.player.y = this.player.posY

        // console.log("player avatar has loaded ")
        // console.log("this.playerAvatarKey")
        // console.log(this.playerAvatarKey)
        scene.player.location = scene.location

        console.log("this.player: ")
        console.log(scene.player)

        scene.createdPlayer = true;
        // console.log("this.createdPlayer = true;")

        //send the current player position over the network
        manageSession.sendMoveMessage(Math.round(scene.player.x), Math.round(scene.player.y));

        // scene.add.existing(this)
        // scene.physics.add.existing(this)
    }//attachAvatarToPlayer


} //end class

export default new playerLoadOnlineAvatar();