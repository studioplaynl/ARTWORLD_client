<script>
    import {client} from "../nakama.svelte"
    import { Session, Profile, logout} from "../store.js"
    const useSSL = false;
    const verboseLogging = false;
    const socket = client.createSocket(useSSL, verboseLogging);
    var match_ID = "";

    async function chat() {

        const createStatus = true;

        //const socket = client.createSocket(useSSL, verboseLogging);
        var session = ""; // obtained by authentication.
    
        session = await socket.connect($Session, createStatus);
        console.log(session)

        socket.onchannelmessage = (channelMessage) => {
            console.info("Received chat message:", channelMessage.content.message);
        };

        socket.onstreamdata = (streamdata) => {
            console.info("Received stream data:", streamdata);
        };

        const channelId = "TESTT";
        const persistence = false;
        const hidden = false;

        var response = await socket.joinChat(channelId, 1, persistence, hidden);
        console.info("Successfully joined channel:", response.room_name);

        const messageAck = await socket.writeChatMessage(response.id, {"message": "Pineapple doesn't belong on a pizza!"});
        console.info("Successfully sent chat message:", messageAck);
        
        //own join
        var joined = await socket.rpc('join')
        console.log( socket)
        console.log(joined)
        //stream
        socket.onstreamdata = (streamdata) => {
            console.info("Received stream data:", streamdata);
        };
        socket.onstreampresence = (streampresence) => {
        console.log("Received presence event for stream: %o", streampresence.joins);
        streampresence.joins.forEach((join) => {
            console.log("New user joined: %o", join.user_id);
        });
        streampresence.leaves.forEach((leave) => {
            console.log("User left: %o", leave.user_id);
        });
        };

    }
    let promise = chat();

export   function onclick() {
        console.log('test')
        var opCode = 1;
        var data = '{ "move": {"dir": "left", "steps": 4} }';
        socket.rpc('move_position', data);

    }

    export let ChatClick = onclick()

    
</script>

<main>
    <h1>test</h1>
    <a on:click={onclick}>test</a>
</main>