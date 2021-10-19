<script>
  import SvelteTable from "svelte-table";
  var users = [
  ];
  const columns = [
      {
        key: "Username",
        title: "Username",
        value: v => v.username,
        sortable: true,
      },
      {
        key: "Locatie",
        title: "Loccatie",
        value: v => v.meta.locatie
      },
    ]
</script>



<SvelteTable columns="{columns}" rows="{users}" classNameTable="profileTable"></SvelteTable>



<style>

</style>