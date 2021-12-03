import manageSession from "./../manageSession";

class onlinePlayerLoader {
    constructor() {
    }

    load(scene) {
        //manageSession.connectedOpponents //list of the opponents
        //for each of the opponents, attach a png,

        //TODO loading is broken, so I'm checking if the player avater has already loaded, after that I load onlineUsers
        if (scene.createdPlayer) {
            //first check if onlineplayers need to be created
            if (manageSession.createOnlinePlayers) {
                console.log("creating onlineplayer")
                manageSession.createOnlinePlayers = false

                //manageSession.allConnnectedUsers are all the users that are in the stream, we first have to load the new arrivals: scene.newOnlinePlayers
                scene.newOnlinePlayers = []

                if (scene.debug) {
                    console.log("")
                    console.log("createOnlinePlayers...");
                }

                //all current onlinePlayers, or an empty []
                scene.onlinePlayers = scene.onlinePlayersGroup.getChildren() || []

                // ..... DESTROY OFFLINE PLAYERS ........................................................................................................................................................................
                //check if there are players in scene.onlinePlayers that are not in .allConnectedUsers ->  they need to be destroyed
                scene.offlineOnlineUsers = []

                scene.onlinePlayers.forEach(player => {
                    const playerID = player.user_id
                    const found = manageSession.allConnectedUsers.some(user => user.user_id === playerID)
                    if (!found) scene.offlineOnlineUsers.push(player)
                })

                if (scene.debug) {
                    console.log("scene.offlineOnlineUsers")
                    console.log(scene.offlineOnlineUsers)
                }

                //players in scene.onlinePlayers that are not in .allConnectedUsers -> they need to be deactivated and hidden
                if (scene.offlineOnlineUsers.length > 0) {
                    //hide users
                    if (scene.debug) {
                        console.log("")
                        console.log("# Players that are not online anymore")
                    }



                    for (let i = 0; i < scene.offlineOnlineUsers.length; i++) {
                        //check if the user_id is in scene.onlinePlayers
                        console.log(scene.offlineOnlineUsers[i])
                        scene.offlineOnlineUsers[i].destroy()

                        //get the index of user_id from scene.offlineOnlineUsers[i].user_id in scene.onlinePlayers and deactivate them in scene.onlinePlayers
                        // let index = scene.onlinePlayers.findIndex(function (person) {
                        //   return person.user_id == scene.offlineOnlineUsers[i].user_id
                        // });

                        // scene.onlinePlayers[index].active = false
                        // scene.onlinePlayers[index].visible = false
                        // if (scene.debug) {
                        //   console.log("deactivated and hidden User: ")
                        //   console.log(scene.onlinePlayers[index])
                        //   console.log("")
                        // }
                    }

                }
                //......... end DESTROY OFFLINE PLAYERS ............................................................................................................................................................


                //...... LOAD NEW PLAYERS ........................................................................................
                //(new) players present in .allConnectedUsers but not in scene.onlinePlayers ->load their avatar and animation
                scene.newOnlinePlayers = []
                manageSession.allConnectedUsers.forEach(player => {
                    const playerID = player.user_id
                    const found = scene.onlinePlayers.some(user => user.user_id === playerID)
                    if (!found) scene.newOnlinePlayers.push(player)
                })
                if (scene.debug) {
                    console.log("  ")
                    console.log("new Online Players")
                    console.log(newOnlinePlayers)
                    console.log("  ")
                }

                //load the spritesheet for the new online user //give the online player a placeholder avatar
                scene.newOnlinePlayers.forEach((element, i) => {

                    let elementCopy = element
                    // console.log("elementCopy: ")
                    // console.log(elementCopy)
                    //a new user
                    scene.tempAvatarName = element.user_id + "_" + element.avatar_time;

                    //if the texture already exists attach it again to the player
                    if (!scene.textures.exists(scene.tempAvatarName)) {

                        //add it to loading queue
                        scene.load.spritesheet(scene.tempAvatarName, element.avatar_url, { frameWidth: 128, frameHeight: 128 })

                        if (scene.debug) {
                            console.log("loading: ")
                            console.log(scene.tempAvatarName)
                        }
                    }
                    console.log("give the online player a placeholder avatar first")
                    //give the online player a placeholder avatar first
                    element = scene.add.sprite(element.posX, element.posY, scene.playerAvatarPlaceholder)
                        .setDepth(90)

                    element.setData("movingKey", "moving");
                    element.setData("stopKey", "stop");

                    //create animation for moving
                    scene.anims.create({
                        key: element.getData("movingKey"),
                        frames: scene.anims.generateFrameNumbers(scene.playerAvatarPlaceholder, { start: 0, end: 8 }),
                        frameRate: 20,
                        repeat: -1,
                    });

                    //create animation for stop
                    scene.anims.create({
                        key: element.getData("stopKey"),
                        frames: scene.anims.generateFrameNumbers(scene.playerAvatarPlaceholder, { start: 4, end: 4 }),
                    });

                    Object.assign(element, elementCopy); //add all data from elementCopy to element; like prev Position, Location, UserID
                    element.x = element.posX
                    element.y = element.posY

                    // add new player to group
                    scene.onlinePlayersGroup.add(element)
                    //} else {
                    //! if the avatar already existed; get the player from the onlinePlayers array !

                    this.attachtAvatarToOnlinePlayer(scene, element)
                    //}
                })

                //update scene.onlinePlayers, hidden or visible
                scene.onlinePlayers = scene.onlinePlayersGroup.getChildren()
                if (scene.debug) {
                    console.log("all players in the group, hidden or visible ")
                    console.log(scene.onlinePlayers)
                }

                //added new players
                scene.load.start(); // load the image in memory
                console.log("started loading new (online) avatars")
                //.... end load new Avatars ....................................................................................

                //when the images are loaded the new ones should be set to the players
                scene.load.on('filecomplete', () => {
                    console.log("players added: ")
                    console.log(scene.newOnlinePlayers)

                    scene.onlinePlayers = scene.onlinePlayersGroup.getChildren()

                    for (let i = 0; i < scene.onlinePlayers.length; i++) {

                        this.attachtAvatarToOnlinePlayer(scene, scene.onlinePlayers[i])
                    } //for (let i = 0; i < scene.onlinePlayers.length; i++)
                }) //scene.load.on('filecomplete', () =>


                console.log("manageSession.allConnectedUsers")
                console.log(manageSession.allConnectedUsers)

                //scene.onlinePlayers = scene.onlinePlayersGroup.getChildren()

                //? not necessary
                // manageSession.allConnectedUsers.forEach((player, i) => {

                //   var index = scene.onlinePlayers.findIndex(function (player) {
                //     return player.user_id == manageSession.allConnectedUsers[i].user_id
                //   });

                //   scene.onlinePlayers[index].active = true
                //   scene.onlinePlayers[index].visible = true
                //   console.log("make all allConnectedUsers visible")
                //   console.log(scene.onlinePlayers[index])
                // })
                //send player position over the network for the online users to see
                manageSession.sendMoveMessage(scene.player.x, scene.player.y);

            }//if (manageSession.createOnlinePlayers)
        }//if (manageSession.createdPlayer) 
    }//loader

    attachtAvatarToOnlinePlayer(scene, player, preExisting) {
        scene.tempAvatarName = player.user_id + "_" + player.avatar_time;
        //scene.onlinePlayers[i] = scene.add.image(scene.onlinePlayers[i].posX, scene.onlinePlayers[i].posY, scene.tempAvatarName)

        console.log("player added: ")
        console.log(player)

        //sometimes the player is not visible because the postion is 0,0
        if (player.posX == 0 && player.posY == 0) {
            player.posX = 300
            player.posY = 400
        }

        player.x = player.posX
        player.y = player.posY


        console.log("avatar key: ")
        console.log(scene.tempAvatarName)
        if (!preExisting) {
            player.setTexture(scene.tempAvatarName)
        } else {

        }


        player.active = true
        player.visible = true

        const avatar = scene.textures.get(scene.tempAvatarName)
        const avatarWidth = avatar.frames.__BASE.width
        const avatarHeight = avatar.frames.__BASE.height

        const avatarFrames = Math.round(avatarWidth / avatarHeight)
        console.log(avatarFrames)

        if (avatarFrames > 1) {

            // set names for the moving and stop animations

            player.setData("movingKey", "moving" + "_" + scene.tempAvatarName);
            player.setData("stopKey", "stop" + "_" + scene.tempAvatarName);
            console.log('player.getData("movingKey")')
            console.log(player.getData("movingKey"))

            console.log('player.getData("movingKey")')
            console.log(player.getData("movingKey"))

            //create animation for moving
            scene.anims.create({
                key: player.getData("movingKey"),
                frames: scene.anims.generateFrameNumbers(scene.tempAvatarName, { start: 0, end: avatarFrames - 1 }),
                frameRate: (avatarFrames + 2) * 2,
                repeat: -1,
                yoyo: true
            });

            //create animation for stop
            scene.anims.create({
                key: player.getData("stopKey"),
                frames: scene.anims.generateFrameNumbers(scene.tempAvatarName, { start: 0, end: 0 }),
            });
        } //if (avatarFrames > 1) {

        scene.updateOnlinePlayers = true
    }

} //end class

export default new onlinePlayerLoader();