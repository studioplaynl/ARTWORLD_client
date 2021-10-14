import { client, SSL } from "../../nakama.svelte";
// import { user, url, getAccount } from '../../api.js';
// import { Color } from "fabric/fabric-impl";


class manageSession {
  constructor() {
    this.sessionStored;
    this.user_id;
    this.username;

    this.session;
    this.client;
    this.socket;

    this.joined;
    this.useSSL = SSL;
    this.verboseLogging = false;

    this.match;
    this.matchID;
    this.deviceID;

    this.AccountObject;
    this.playerObjectSelf;
    this.createPlayer = true;

    this.createOnlinePlayers = false;
    this.updateOnlinePlayers = false;
    this.allConnectedUsers = [];
    this.removedConnectedUsers = [];
    this.removeConnectedUser = false;

    // this.createdPlayer = false;
    this.playerAvatarKey = ""
    // this.playerMovingKey = "moving";
    // this.playerStopKey = "stop";

    this.gameStarted = false;

    this.location = "home"

    //chat example
    this.channelId = "pineapple-pizza-lovers-room";
    this.persistence = false;
    this.hidden = false;

    //timers
    this.updateMovementTimer = 0;
    this.updateMovementInterval = 30; //20 fps
  }

  async createSocket() {
    this.socket = await client.createSocket(this.useSSL, this.verboseLogging);
    console.log("socket created with client");

    const createStatus = true;
    this.session = ""; // obtained by authentication.

    this.session = await this.socket.connect(this.sessionStored, createStatus);
    console.log("session created with socket");

    // //await this.getAccountDetails()
    // console.log("this.playerObjectSelf")
    // await this.getAccountDetails().then((blob) => {
    //   console.log(blob);
    //   this.createPlayer = true;
    // }).catch(e => console.log(e));

    //await this.getAvatarUrl()

    // console.log(this.createPlayer)
    // console.log(this.playerObjectSelf)

    // console.log("this.getAvatarUrl();")
    // await this.getAvatarUrl().then(this.createPlayer = true)
    // console.log(this.createPlayer)

    console.log('this.getStreamUsers("join", this.location)')
    await this.getStreamUsers("join", this.location)

    //stream
    this.socket.onstreamdata = (streamdata) => {
      //console.info("Received stream data:", streamdata);
      let data = JSON.parse(streamdata.data);
      for (const user of this.allConnectedUsers) {
        if (user.user_id == data.user_id) {
          //console.log("test");
          user.posX = data.posX;
          user.posY = data.posY;

          //this could be refined to update specific online player?
          this.updateOnlinePlayers = true
        }
      }
      // console.log(this.allConnectedUsers);
      // var newPos = this.allConnectedUsers;
      // this.allConnectedUsers = newPos;
     
    };



    this.socket.onstreampresence = (streampresence) => {
      //streampresence is everybody that is present also SELF

      console.log(
        "Received presence event for stream: %o",
        streampresence
      );
      this.getStreamUsers("get_users", this.location)
      if (!!streampresence.leaves) {
        console.log("leaves:" + streampresence.leaves);
        streampresence.leaves.forEach((leave) => {
          console.log("User left: %o", leave.username);
          //remove leave.user_id from 

          // this.removedConnectedUsers.push(leave.user_id);
          // console.log(this.removedConnectedUsers)
          console.log(this.allConnectedUsers)
          this.createOnlinePlayers = true
          console.log("this.createOnlinePlayers = true")
          //allConnectedUsers is updated after someone leaves
          // this.allConnectedUsers = this.allConnectedUsers.filter(function (item) {
          //   return item.name !== leave.username;
          // });
        });
        this.removeConnectedUser = true;
        this.createOnlinePlayers = true

      }

      // if (!!streampresence.joins) {
      //   streampresence.joins.forEach((join) => {
      //     if (join.user_id != this.user_id) {
      //       console.log("some one joined")
      //       // this.getStreamUsers("home")
      //       console.log(join)

      //       console.log(this.allConnectedUsers)

      //       this.allConnectedUsers.push(join)
      //       this.createOnlinePlayers = true
      //     }

      //     // update array when someone joins
      //     // this.allConnectedUsers.push(leave.user_id)
      //   });
      //   // this.getStreamUsers("home")
      // }
    }; //this.socket.onstreampresence
  } //end createSocket

  async getAccountDetails() {
    this.AccountObject = await client.getAccount(this.session);
    this.playerObjectSelf = this.AccountObject.user;
    console.log(this.AccountObject.user)

    const payload = { "url": this.playerObjectSelf.avatar_url };
    const rpcid = "download_file";
    const fileurl = await client.rpc(this.session, rpcid, payload);
    this.playerObjectSelf.url = fileurl.payload.url
    console.log(this.playerObjectSelf.url)
  }

  async getAvatarUrl() {
    const payload = { "url": this.playerObjectSelf.avatar_url };
    const rpcid = "download_file";
    const fileurl = await client.rpc(this.session, rpcid, payload);
    this.playerObjectSelf.url = fileurl.payload.url
    console.log(this.playerObjectSelf.url)

  }

  async getStreamUsers(rpc_command, location) {
    // if (!this.createOnlinePlayers) {
      //rpc_command:
      //"join" = join the stream, get the online users, except self
      //"get_users" = after joined, get the online users, except self

      console.log(rpc_command)

      this.socket.rpc(rpc_command, location).then((rec) => {

        //the server report all users in location except self
        this.allConnectedUsers = JSON.parse(rec.payload) || []
        //if there are no users online, the array length == 0

        console.log("joined users:")
        
        if (this.allConnectedUsers.length > 0) {
          console.log(this.allConnectedUsers)
          this.createOnlinePlayers = true
          console.log("this.createOnlinePlayers = true")
        } else {
          //this.createOnlinePlayers = false
          console.log("no online users")
        }

        //status = "joined"
      })
    // }
  }


  loadAndCreatePlayerAvatar(location) {
    //check if account info is loaded
    if (this.sessionStored.user_id != null) {
      //check for createPlayer flag
      if (this.createPlayer) {
        this.createPlayer = false
        console.log("this.createPlayer = false;")

        let createdPlayer = location + ".createdPlayer"
        createdPlayer = eval(createdPlayer)
        createdPlayer = false;

        console.log("loadAndCreatePlayerAvatar")

        // is playerAvaterKey already in loadedAvatars?
        //no -> load the avatar and add to loadedAvatars
        //yes -> dont load the avatar

        let playerAvatarKey = location +  ".playerAvatarKey"
        playerAvatarKey = eval(playerAvatarKey)

        playerAvatarKey = this.playerObjectSelf.id + "_" + this.playerObjectSelf.create_time
        console.log(playerAvatarKey)

        console.log("this.textures.exists(this.playerAvatarKey): ")

        let textures = location + ".textures"
        textures = eval(textures)
        // console.log(this.textures.exists(this.playerAvatarKey))
        console.log(textures.exists(playerAvatarKey))

        //check if url is not empty for some reason, returns so that previous image is kept
        if (!this.textures.exists(this.playerAvatarKey)) {
          if (this.playerObjectSelf.url === "") {
            console.log("avatar url is empty")
            this.createPlayer = false;
            console.log("this.createPlayer = false;")
            this.createdPlayer = true;
            console.log("this.createdPlayer = true;")
            return
          } else {
            console.log(" loading: this.playerObjectSelf.url: ")
            console.log(this.playerObjectSelf.url)

            this.load.spritesheet(
              this.playerAvatarKey,
              this.playerObjectSelf.url, { frameWidth: 128, frameHeight: 128 }
            );

            this.load.once(Phaser.Loader.Events.COMPLETE, () => {
              console.log("loadAndCreatePlayerAvatar complete")
              if (this.textures.exists(this.playerAvatarKey)) {

                const avatar = this.textures.get(this.playerAvatarKey)
                const avatarWidth = avatar.frames.__BASE.width
                const avatarHeight = avatar.frames.__BASE.height

                const avatarFrames = Math.round(avatarWidth / avatarHeight)
                console.log(avatarFrames)

                //make an animation if the image is wider than tall
                if (avatarFrames > 1) {
                  //.. animation for the player avatar ............................................
                  //works
                  this.playerMovingKey = "moving" + "_" + this.playerAvatarKey;
                  this.playerStopKey = "stop" + "_" + this.playerAvatarKey;

                  this.anims.create({
                    key: this.playerMovingKey,
                    frames: this.anims.generateFrameNumbers(this.playerAvatarKey, { start: 0, end: avatarFrames - 1 }),
                    frameRate: (avatarFrames + 2) * 2,
                    repeat: -1,
                    yoyo: true
                  });

                  //works
                  this.anims.create({
                    key: this.playerStopKey,
                    frames: this.anims.generateFrameNumbers(this.playerAvatarKey, { start: 0, end: 0 }),
                  });

                  //.. end animation for the player avatar ............................................
                }

                // texture loaded so use instead of the placeholder
                this.player.setTexture(this.playerAvatarKey)



                this.playerShadow.setTexture(this.playerAvatarKey)

                //scale the player to 68px
                const width = 128
                this.player.displayWidth = width
                this.player.scaleY = this.player.scaleX

                this.playerShadow.displayWidth = width
                this.playerShadow.scaleY = this.playerShadow.scaleX

                //set the collision body
                const portionWidth = width / 3
                this.player.body.setCircle(portionWidth, portionWidth / 4, portionWidth / 4)

                console.log("player avatar has loaded ")
                console.log(this.playerAvatarKey)

                this.createdPlayer = true;
                console.log("this.createdPlayer = true;")

              }// if (this.textures.exists(this.playerAvatarKey)) 
            })
          }

          this.load.start(); // load the image in memory
          console.log("this.load.start();");

        }

      }//if(this.playerCreated)
    }
  }


  testMoveMessage() { //works
    var opCode = 1;
    var data =
      '{ "posX": ' +
      Math.floor(Math.random() * 100) +
      ', "posY": ' +
      Math.floor(Math.random() * 100) +
      ', "location": "home" }';
    this.socket.rpc("move_position", data).then((rec) => {
      //status;
      data = JSON.parse(rec.payload) || [];
      console.log("sent pos:");
      console.log(data);
    });

  }

  sendMoveMessage(posX, posY) {
    var opCode = 1;
    var data =
      '{ "posX": ' +
      posX +
      ', "posY": ' +
      posY +
      ', "location": "home" }';

    this.socket.rpc("move_position", data).then((rec) => {
      //status;
      // data = JSON.parse(rec.payload) || [];
      // console.log("sent pos:");
      // console.log(data);
    });
  } //end sendChatMessage

  async chatExample() {
    // var onlineUsers = [];
    // this.socket.onchannelpresence = (presences) => {
    //   // Remove all users who left.
    //   onlineUsers = onlineUsers.filter((user) => {
    //     return !presences.leave.includes(user);
    //   });
    //   // Add all users who joined.
    //   onlineUsers.concat(presences.join);
    // };

    const roomname = "PizzaFans";
    const persistence = true;
    const hidden = false;

    // 1 = Room, 2 = Direct Message, 3 = Group
    const response = await this.socket.joinChat(
      roomname,
      1,
      persistence,
      hidden
    );

    // // Setup initial online user list.
    // onlineUsers.concat(response.channel.presences);
    // // Remove your own user from list.
    // onlineUsers = onlineUsers.filter((user) => {
    //   return user != channel.self;
    // });
  } //end chatExample
} //end class

export default new manageSession();