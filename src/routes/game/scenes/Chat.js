import {client} from "../../../nakama.svelte"
import { Session, Profile, logout } from "../../../store.js";

class Chat {
  constructor() {
    this.createStatus;
    //this.session;
    //this.socket;
    this.joined;
  }

  async chat() {
    const useSSL = false;
    const verboseLogging = false;
    const socket = client.createSocket(useSSL, verboseLogging);
    var match_ID = "";

    this.createStatus = true;

    //const socket = client.createSocket(useSSL, verboseLogging);
    const session = ""; // obtained by authentication.

    session = await socket.connect(Session, this.createStatus);
    console.log(this.session);

    client.socket.onchannelmessage = (channelMessage) => {
      console.info("Received chat message:", channelMessage.content.message);
    };

    client.socket.onstreamdata = (streamdata) => {
      console.info("Received stream data:", streamdata);
    };

    const channelId = "TEST";
    const persistence = false;
    const hidden = false;

    let response = await socket.joinChat(channelId, 1, persistence, hidden);
    console.info("Successfully joined channel:", response.room_name);

    const messageAck = await socket.writeChatMessage(response.id, {
      message: "Pineapple doesn't belong on a pizza!",
    });
    console.info("Successfully sent chat message:", messageAck);

    //on join
    this.joined = await client.socket.rpc("join");
    console.log(this.socket);
    console.log(this.joined);
    //stream
    client.socket.onstreamdata = (streamdata) => {
      console.info("Received stream data:", streamdata);
    };
    client.socket.onstreampresence = (streampresence) => {
      console.log(
        "Received presence event for stream: %o",
        streampresence.joins
      );
      streampresence.joins.forEach((join) => {
        console.log("New user joined: %o", join.user_id);
      });
      streampresence.leaves.forEach((leave) => {
        console.log("User left: %o", leave.user_id);
      });
    };
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
