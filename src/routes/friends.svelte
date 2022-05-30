<script>
    import SvelteTable from "svelte-table";
import { each } from "svelte/internal";
import FriendAction from "./components/friendaction.svelte"
import Stopmotion from "./components/stopmotion.svelte"
    import {ListFriends, addFriend, setLoader, convertImage} from "../api"
    var users = [];
    var usersRequest = [];
    var usersPending = [];
    var ID = "";
    var Username


    let load = async function() {
        users = []
        usersRequest = []
        usersPending = []
        setLoader(true)
        ListFriends()
    .then( list => {
        console.log(list.friends)
        list.friends.forEach(async (user) => {
            console.log(user.user.avatar_url)
            user.user.url = await convertImage(user.user.avatar_url,"150","1000")
            if(user.state === 2){
                usersRequest.push(user)
                usersRequest = usersRequest
            }
            if(user.state === 1){
                usersPending.push(user)
                usersPending = usersPending
            }
            if(user.state === 0){
                users.push(user)
                users = users
            }
        });
        console.log(usersRequest)
        setLoader(false)
    })
    }

    load()
    
    
    const columns = [
        {
          key: "status",
          title: "",
          value: v => { if(v.user.online) {return `<div class="online"/>`} else {return `<div class="offline"/>`}},
        },
        {
        key: "avatar",
        title: "",
        renderComponent: {component: Stopmotion, props: {}}
      },
        {
          key: "Username",
          title: "Username",
          value: v => `<a href="/#/profile/${v.user.id}">${v.user.username}<a>`,
          sortable: true,
        },
        {
        key: "action",
        title: "",
        renderComponent: {component: FriendAction, props: {load}}
      },
      ]
  </script>
  
  <h1>Add friend</h1>
  <!-- <input bind:value={ID} placeholder="user ID"> -->
  <input bind:value={Username} placeholder="username">
  <button on:click="{()=>{ addFriend(ID,Username).then(()=>{ load()})}}">Add friend</button>

  <h1>All friends</h1>
  <SvelteTable columns="{columns}" rows="{users}" classNameTable="profileTable"></SvelteTable>

  <h1>Pending friend requests</h1>
  <SvelteTable columns="{columns}" rows="{usersPending}" classNameTable="profileTable"></SvelteTable>


  <h1>Friend requests</h1>
  <SvelteTable columns="{columns}" rows="{usersRequest}" classNameTable="profileTable"></SvelteTable>
  
  <style>

  
  </style>