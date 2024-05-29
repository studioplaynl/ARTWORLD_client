<script>
  export const col = null;
  export let row;
  // const role = $Profile.meta.Role; // ;
  const name = `${row.username}_${row.update_time}_${row.key}_${row.value.displayname}.png`;
  const image = `${window.location.origin}/${row.value.url}`;
</script>

<main>
  <a download="{name}" href="{image}">
    <button class="clear-button-styles">
      <img class="download" src="/assets/SHB/svg/AW-icon-save.svg" alt="download item" />
    </button>
  </a>
</main>

<style>
  img.download {
    width: 42px;
    cursor: pointer;
  }
</style>
