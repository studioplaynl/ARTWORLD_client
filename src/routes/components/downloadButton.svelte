<script>
  import { Modal, Dialog, Button } from 'attractions';
  import { ArtworksStore } from '../../storage';
  import {convertImage} from '../../api'


  export let row;
  //const role = $Profile.meta.Role; // ;
  let name = `${row.username}_${row.update_time}_${row.key}_${row.value.displayname}.png`
  let image = ''
  let link

  async function download() {
    await convertImage(row.value.url)
    .then((url)=>{
      var link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
}


  //userName_creationDateFormatted_artworkKey_displayName.png
</script>

<main>
    <button class="clear-button-styles" on:click={download}> 
        <img
          class="download"
          src="/assets/SHB/svg/AW-icon-save.svg"
          alt="Put item in trash can"
        />
      </button>
  
  </main>

<style>
  .trash {
    width: 40px;
    cursor: pointer;
  }
</style>
