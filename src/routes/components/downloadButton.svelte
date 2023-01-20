<script>
  import { Modal, Dialog, Button } from 'attractions';
  import { ArtworksStore } from '../../storage';
  import { convertImage } from '../../api';
  import { STOPMOTION_BASE_SIZE } from '../../constants';

  export let col;
  export let row;
  // const role = $Profile.meta.Role; // ;
  const name = `${row.username}_${row.update_time}_${row.key}_${row.value.displayname}`;
  const image = `${window.location.origin}/proxy/${row.value.url}`;



</script>

<main>
  <a download={name} href={image}>
    <button class="clear-button-styles">
        <img
          class="download"
          src="/assets/SHB/svg/AW-icon-save.svg"
          alt="Put item in trash can"
        />
      </button>
  </a>
  </main>

<style>
  img.download {
    width: 42px;
    cursor: pointer;
  }

</style>
