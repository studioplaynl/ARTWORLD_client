<script>
    import {client, SSL} from "../nakama.svelte"
    import { Session, Profile, logout} from "../session.js"
    import {Error} from "./../session.js"
    import {updateObjectAdmin, listAllObjects, deleteObjectAdmin, convertImage} from "../api"
    import { onMount } from "svelte";
    //import { writable } from "svelte/store";

    const verboseLogging = false;
    const socket = client.createSocket(SSL, verboseLogging);
    let match_ID = "";
    let AllUsers = [];
    let payload = [];
    let status = "left";
    let locations = ["lab", `home`, `library`];
    let selected;
    let id

    onMount(()=>{
    id = $Profile.id
    console.log(id)
    })

    async function chat() {
        const createStatus = true;
        console.log($Profile);

        await socket.connect($Session, createStatus);

        //own join
        // var joined = await socket.rpc('join')

        //stream
        socket.onstreamdata = (streamdata) => {
            console.info("Received stream data:", streamdata);
            let data = JSON.parse(streamdata.data);
            console.log(data)
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
        var action = "walk" //stop, too, move
        var opCode = 1;
        var data =
            `{ "action": "${action}",
              "posX": ${Math.floor(Math.random() * 100)},
              "posY": ${Math.floor(Math.random() * 100)},
              "location": "${selected}"
             }`
        console.log(data)
        socket.rpc("move_position", data).then((rec) => {
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



//////////////////////// locatie ////////////////////////
let locatie = '', posX = Math.floor(Math.random()*100), posY = Math.floor(Math.random()*100), where,name, value = '{"posX": "123", "posY": "123"}'
async function addLocation() {
    let type = where// plaats hier de soort locatie
    let pub = true // is het publiek zichtbaar of enkel voor de gebruiker die het creert
    //await updateObject(type, name, value, pub)
    console.log(id + type + name + value + pub)
    await updateObjectAdmin(id, type, name, value, pub)

    getUserLocations()
}

let whereList
let locationsList = []

async function getUserLocations() {
    locationsList = await listAllObjects(whereList) 
    console.log(locationsList)   
}

function renewObject(loc) {
    console.log(loc)
    where = loc.collection
    name = loc.key
    value = JSON.stringify(loc.value)
    id = loc.user_id
}

////////////////////////// image converter /////////////////////////////

let imgUrl = "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/blauwslang.jpeg"
let imgSize = "64"
let fileFormat = "png"
let url

async function convert() {
    url = await convertImage(imgUrl,imgSize,fileFormat)
    console.log(url)
}
    
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

    <h2>Create objects, eg for locations</h2>
    <!-- <label>where</label><input type="text" bind:value="{where}"> -->

    <label>select object</label>
    <select bind:value="{where}">
        <option value="home">home</option>
        <option value="location">location</option>
        <option value="world">world</option>
        <option value="addressbook">addressbook</option>
    </select>
    <label>type object name</label><input type="text" bind:value="{where}">
    
    <label>value (alle keys and values need to be placed within " " to not error)</label><textarea bind:value="{value}"></textarea>
    <label>name</label><input type="text" bind:value="{name}">
    <label>user_id</label><input type="text" bind:value="{id}">


    <button on:click="{addLocation(id)}">creeer</button>

    <h2>List of Objects</h2>
    <select bind:value="{whereList}">
        <option value="home">home</option>
        <option value="location">location</option>
        <option value="world">world</option>
        <option value="addressbook">addressbook</option>
    </select>
    <label>type object name</label><input type="text" bind:value="{whereList}">

    <button on:click="{getUserLocations}">Get</button>
    {#each locationsList as location}
        <div class:blueBack="{location.user_id === $Session.user_id}" class="redBack">
            <p>username: {location.username}</p>            
            <p>userID: {location.user_id}</p>
        <p>name:{location.key}</p>
        <p>value: {JSON.stringify(location.value)}
        <button on:click="{async ()=>{await deleteObjectAdmin(location.user_id, location.collection,location.key);getUserLocations()}}">delete</button>
        <button on:click="{async ()=>{await renewObject(location);getUserLocations()}}">update</button>
        </div>
    {/each}

    <h2>Get Converted Image</h2>
    <labe>img url</labe>
    <input type="text" bind:value="{imgUrl}">

    <input type="text" bind:value="{imgSize}">
    <input type="text" bind:value="{fileFormat}"> 
    <button on:click="{convert}">Convert</button>

    <img src="{url}">

</main>


<style>
    .blueBack {
        background-color: rgba(0,0,255,0.6);
        padding: 10px;
        border-radius: 5px;
    }
    .redBack {
        background-color: rgba(255,0,0,0.6);
        padding: 10px;
        border-radius: 5px;
    }

    main {
    max-width: 500px;
    display: block;
    margin: 0 auto;
}
</style>
