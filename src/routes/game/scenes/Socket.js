import { client } from "../../../nakama.svelte";
//import { Session, Profile, logout } from "../../../store.js";
import manageSession from "./manageSession.js";

class Chat {
  constructor() {
    // this.createStatus;
    this.session;
    this.socket;
    this.joined;
    this.useSSL = false;
    this.verboseLogging = false;
  }

  async createSocket() {
    this.socket = await client.createSocket(this.useSSL, this.verboseLogging);
    console.log("socket created with client");

    const createStatus = true;

    //const socket = client.createSocket(useSSL, verboseLogging);
    this.session = ""; // obtained by authentication.

    this.session = await this.socket.connect(
      manageSession.sessionStored,
      createStatus
    );

    // //on join
    // this.joined = await this.socket.rpc("join");
    // //console.log(this.socket);
    // console.log(this.joined);

    await this.socket.rpc("joingo", "home").then((rec) => {
      let payload = JSON.parse(rec.payload);
      console.log(payload);
      payload.forEach((user) => {
        console.log(user.avatar_url);
      });
    });
    //stream
    this.socket.onstreamdata = (streamdata) => {
      // console.info("Received stream data object:", streamdata);
      console.info("Streamdata.stream:", streamdata.stream);

      console.info("Received stream data object.data:", streamdata.data);
      // let parsedData = JSON.parse(JSON.stringify(streamdata.data))
      let parsedData = JSON.parse(streamdata.data);

      console.info("Received stream data object.data.posX:", parsedData.posX);
      console.info(
        "Received stream data object.data.user_id:",
        parsedData.user_id
      ); //user_id
    };
    this.socket.onstreampresence = (streampresence) => {
      console.log(
        "Received presence event for stream: %o",
        streampresence.joins
      );

      this.socket.rpc("joingo", "home").then((rec) => {
        let payload = JSON.parse(rec.payload);
        console.log(payload);
        payload.forEach((user) => {
          console.log(user.avatar_url);
        });
      });
      // streampresence.joins.forEach((join) => {
      //   console.log("New user joined: %o", join.user_id);
      // });
      // streampresence.leaves.forEach((leave) => {
      //   console.log("User left: %o", leave.user_id);
      // });
    };
  }

  async chat() {
    this.socket.onchannelmessage = (channelMessage) => {
      console.info("Received chat message:", channelMessage.content.message);
    };

    this.socket.onstreamdata = (streamdata) => {
      // const parsedData = JSON.parse(streamdata)
      console.info("Received stream data:", streamdata);
    };

    const channelId = "TEST";
    const persistence = false;
    const hidden = false;

    let response = await this.socket.joinChat(
      channelId,
      1,
      persistence,
      hidden
    );
    console.info("Successfully joined channel:", response.room_name);

    const messageAck = await this.socket.writeChatMessage(response.id, {
      message: "Pineapple doesn't belong on a pizza!",
    });
    console.info("Successfully sent chat message:", messageAck);

    //on join
    this.joined = await this.socket.rpc("join");
    //console.log(this.socket);
    console.log(this.joined);

    //stream
    this.socket.onstreamdata = (streamdata) => {
      console.info("Received stream data:", streamdata);
    };
    this.socket.onstreampresence = (streampresence) => {
      console.log(
        "Received presence event for stream: %o",
        streampresence.joins
      );
      // streampresence.joins.forEach((join) => {
      //   console.log("New user joined: %o", join.user_id);
      // });
      // streampresence.leaves.forEach((leave) => {
      //   console.log("User left: %o", leave.user_id);
      // });
    };

    console.log("send test ");
    var opCode = 1;
    var data = { dir: "left", steps: 4 };
    this.socket.rpc("move_position", data);
  }

  sendChatMessage(posX, posY) {
    console.log("test");
    var opCode = 1;
    // const data = '{"posX":' + posX + ', "posY":' + posY + '}'; // working
    const data =
      '{"user_id":"' +
      manageSession.user_id +
      '", "posX":' +
      posX +
      ', "posY":' +
      posY +
      "}";

    // const data = '{"dir": "left", "steps": 4 }'; //working example
    this.socket.rpc("move_position", data);
  }
}

export default new Chat();
