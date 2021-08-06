import {client} from "../../../nakama.svelte"
//import { Session, Profile, logout } from "../../../store.js";
import manageSession from "./manageSession.js";

class Chat {
  constructor() {
    // this.createStatus;
    this.session;
    this.socket;
    this.joined;
  }

  async chat() {
    const useSSL = false;
    const verboseLogging = false;
    this.socket = client.createSocket(useSSL, verboseLogging);
    console.log("socket created with client")
    //var match_ID = "";

    const createStatus = true;

    //const socket = client.createSocket(useSSL, verboseLogging);
    this.session = ""; // obtained by authentication.

    this.session = await this.socket.connect(manageSession.sessionStored, createStatus);

    // console.log("this.session: ")
    // console.log(this.session);

    this.socket.onchannelmessage = (channelMessage) => {
      console.info("Received chat message:", channelMessage.content.message);
    };

    this.socket.onstreamdata = (streamdata) => {
      console.info("Received stream data:", streamdata);
    };

    const channelId = "TEST";
    const persistence = false;
    const hidden = false;

    let response = await this.socket.joinChat(channelId, 1, persistence, hidden);
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
    var data = '{ "move": {"dir": "left", "steps": 4} }';
    this.socket.rpc("move_position", data);

  }

  sendChatMessage() {
    console.log("test");
    var opCode = 1;
    var data = '{ "move": {"dir": "left", "steps": 4} }';
    this.socket.rpc("move_position", data);
  }

  testConsole(){
    console.log("test");
  }
}

export default new Chat();
