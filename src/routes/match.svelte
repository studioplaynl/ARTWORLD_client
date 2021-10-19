<script>
    import {client, SSL} from "../nakama.svelte"
    import { Session, Profile, logout} from "../session.js"
    import {Error} from "./../session.js"
    //import { writable } from "svelte/store";

    const verboseLogging = false;
    const socket = client.createSocket(SSL, verboseLogging);
    let match_ID = "";
    let AllUsers = [];
    let payload = [];
    let status = "left";
    let locations = ["lab", `home`, `library`];
    let selected;

    async function chat() {
        const createStatus = true;
        console.log($Profile);
        //const socket = client.createSocket(useSSL, verboseLogging);
        let session = ""; // obtained by authentication.

        session = await socket.connect($Session, createStatus);

        //own join
        // var joined = await socket.rpc('join')

        //stream
        socket.onstreamdata = (streamdata) => {
            console.info("Received stream data:", streamdata);
            let data = JSON.parse(streamdata.data);
            for (const user of AllUsers) {
                if (user.user_id == data.user_id) {
                    console.log("test");
                    user.posX = data.posX;
                    user.posY = data.posY;
                }
            }
            console.log(AllUsers);
            var newPos = AllUsers;
            AllUsers = newPos;
        };
        socket.onstreampresence = (streampresence) => {
            console.log(
                "Received presence event for stream: %o",
                streampresence
            );

            console.log("leaves:" + streampresence.leaves);
            if (!!streampresence.leaves) {
                streampresence.leaves.forEach((leave) => {
                    console.log("User left: %o", leave.username);
                    AllUsers = AllUsers.filter(function (item) {
                        return item.name !== leave.username;
                    });
                });
            }
            if (!!streampresence.joins) {
                streampresence.joins.forEach((join) => {
                    getUsers();
                });
            }
            console.log("all user:");
            console.log(AllUsers);
        };

        // current user array
    }
    let promise = chat();

    export function onclick() {
        var opCode = 1;
        var data =
            '{ "posX": ' +
            Math.floor(Math.random() * 100) +
            ', "posY": ' +
            Math.floor(Math.random() * 100) +
            ', "location": "' +
            selected +
            '" }';
        socket.rpc("move_position", data).then((rec) => {
            status;
            data = JSON.parse(rec.payload) || [];
            console.log("sent pos:");
            console.log(data);
        });
    }

    export async function join() {
        await socket.rpc("join", selected).then((rec) => {
            AllUsers = JSON.parse(rec.payload) || [];
            console.log("joined " + selected);
            console.log("join users:");
            console.log(AllUsers);
            status = "joined";
        });
    }

    export async function getUsers() {
        await socket.rpc("get_users", selected).then((rec) => {
            AllUsers = JSON.parse(rec.payload) || [];
            console.log("all current users in home:");
            console.log(AllUsers);
        });
    }

    export async function leave() {
        await socket.rpc("leave", selected).then((rec) => {
            console.log("left");
            AllUsers = [];
            status = "left";
        });
    }

export async function kill() {
    await socket.rpc("kill", selected)
            .then((rec) => {
                console.log("left")
                AllUsers = []
                status = "left"
            })
}

socket.ondisconnect = (event) => {
  console.info("Disconnected from the server. Event:", event);
  $Error = "Disconnected from the server."
};

socket.onstatuspresence = (statusPresence) => {
  console.info("Received status presence update:", statusPresence);
};
socket.onstreampresence = (streamPresence) => {
  console.info("Received stream presence update:", streamPresence);
};

    
</script>

<main>
    <h1>test</h1>
    <p>Status: {status}</p>

    <select bind:value={selected} on:change={() => console.log(selected)}>
        {#each locations as location}
            <option value={location}>
                {location}
            </option>
        {/each}
    </select>

    <a on:click={join}>join</a>
    <a on:click={leave}>leave</a>
    <a on:click={kill}>kill stream</a>
    <a on:click={onclick}>move</a>
    <a on:click={getUsers}>get Users</a>
    <h1>Your avatar:</h1>
    <p>{$Profile.user}</p>
    <h1>Other players:</h1>
    {#each AllUsers as user}
        <p>{user.name}</p>
        <img src={user.avatar_url} height="100px" />
        <p>position: {user.posX} x {user.posY}</p>
    {/each}
</main>
