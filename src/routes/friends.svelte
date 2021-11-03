<script>
    import SvelteTable from "svelte-table";
    import {ListFriends, addFriend} from "../api"
    var users = [];
    var ID = "";
    var Username

    ListFriends()
    .then( list => {
        console.log(list.friends)
        users = list.friends
    })
    
    const columns = [
        {
          key: "status",
          title: "status",
          value: v => { if(v.user.online) {return "online"} else {return "offline"}},
          sortable: true,
        },
        {
          key: "Username",
          title: "Username",
          value: v => `<a href="/#/profile/${v.user.id}">${v.user.username}<a>`,
          sortable: true,
        },
        {
          key: "Locatie",
          title: "AZC",
          value: v => v.user.metadata.azc
        },
      ]
  </script>
  
  <h1>Add friend</h1>
  <input bind:value={ID} placeholder="user ID">
  <input bind:value={Username} placeholder="username">
  <button on:click="{()=>{ addFriend(ID,Username)}}">Add friend</button>

  <h1>All friends</h1>
  <SvelteTable columns="{columns}" rows="{users}" classNameTable="profileTable"></SvelteTable>
  
  
  <style>
  
  </style>