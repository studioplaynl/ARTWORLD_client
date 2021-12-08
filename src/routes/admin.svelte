<script>
  import SvelteTable from "svelte-table";
  import { ListAllUsers } from "../api";
  let groups = [];
  let users = [];
  let drawingIcon =
    '<svg class="icon" viewBox="0 0 576 512"><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z" /></svg>';

  ListAllUsers().then((list) => {
    list.shift();
    list.forEach((user) => {
     // user.meta = JSON.parse(user.meta);
      if (!!!user.meta.azc) user.meta.azc = "Unknown";
    });
    console.log(list);
    users = list;
  });

  // location house
  // edit user
  // create user

  const Locaties = [
    "Amersfoort",
    "Almelo",
    "Almere",
    "Amsterdam",
    "Apeldoorn",
    "Arnhem-Zuid",
    "Baexem",
    "Budel-Cranendonck",
    "Burgum",
    "Delfzijl",
    "Den Helde",
    "Drachten",
    "Emmen",
    "Gilze en Rijen",
    "Grave",
    "Heerhugowaard",
    "Heerlen",
    "Katwijk",
    "Leersum",
    "Luttelgeest",
    "Middelburg",
    "Oisterwijk",
    "Overloon",
    "Rijswijk",
    "Ter Apel",
    "Utrecht",
  ];
  const roles = ["admin", "speler", "kunstenaar", "moderator"];
  const groupColumns = []
  const userColumns = [
    {
      key: "Username",
      title: "Username",
      value: (v) => `<a href="/#/profile/${v.user_id}">${v.name}<a>`,
      sortable: true,
      searchValue: v => v.name,
    },
    {
      key: "Locatie",
      title: "AZC",
      value: (v) => v.meta.azc,
      sortable: true,
      filterOptions: Locaties,
    },
    {
      key: "Last location",
      title: "Last location",
      value: (v) => v.meta.location,
    },
    {
      key: "rol",
      title: "Rol",
      value: (v) => v.meta.role,
      filterOptions: roles,
    },
    {
      key: "Edit",
      title: "Edit",
      value: v => { return ` <a href="/#/update/${v.user_id}">${drawingIcon}</a>`}
    },
  ];

</script>
<div class="box">
<h1>All Users</h1>
<a href="/#/register"><button>Add new user</button></a>
<SvelteTable columns={userColumns} rows={users} classNameTable="profileTable" />

<h1>All Groeps</h1> <a href="/#/group"><button>Add new group</button></a>
<SvelteTable columns={groupColumns} rows={groups} classNameTable="profileTable" />
</div>
<style>
  	* {box-sizing: border-box}
.box {
	max-width: fit-content;
	margin: 0 auto;
}
h1 {
  display: inline;
}

button {
  float: right;
  margin: 5px;
}

</style>