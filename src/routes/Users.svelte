<script>
  import SvelteTable from 'svelte-table';

  var users = [];
  var Onlineusers = [];
  const columns = [
    {
      key: 'Username',
      title: 'Username',
      value: (v) => v.username,
      sortable: true,
    },
    {
      key: 'Locatie',
      title: 'Last Locatie',
      value: (v) => v.meta.Locatie,
    },
  ];
</script>

<h1>Online Users</h1>
<SvelteTable
  columns="{columns}"
  rows="{Onlineusers}"
  classNameTable="profileTable"
/>

<h1>Offline Users</h1>
<SvelteTable columns="{columns}" rows="{users}" classNameTable="profileTable" />

<style>
</style>
