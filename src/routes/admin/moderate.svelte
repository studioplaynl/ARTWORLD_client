<script>
  import { _ } from 'svelte-i18n';
  import SvelteTable from 'svelte-table';
  import { getAccount, convertImage, listAllObjects } from '../../api';
  import { Session, Profile } from '../../session';
  import StatusComp from '../components/statusbox.svelte';
  import DeleteComp from '../components/deleteButton.svelte';
  import NameEdit from '../components/nameEdit.svelte';

  let useraccount;
  const drawingIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg" />';
  const stopMotionIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg" />';
  const AudioIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-music.svg.svg" />';
  const videoIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-play.svg" />';
  console.log($Session);
  let user = '',
    role = '',
    avatar_url = '',
    house_url = '',
    azc = '',
    id = null,
    art = [],
    drawings = [],
    stopMotion = [],
    video = [],
    audio = [],
    trash = [],
    picture = [],
    CurrentUser;

  const columns = [
    {
      key: 'Soort',
      title: 'Soort',
      value: (v) => {
        if (v.collection == 'drawing') {
          return drawingIcon;
        }
        if (v.collection == 'stopmotion') {
          return stopMotionIcon;
        }
        if (v.collection == 'audio') {
          return AudioIcon;
        }
        if (v.collection == 'video') {
          return videoIcon;
        }
      },
      sortable: true,
    },
    {
      key: 'voorbeeld',
      title: 'voorbeeld',
      value: (v) => `<img src="${v.value.previewUrl}">`,
    },
    {
      key: 'title',
      title: 'Title',
      renderComponent: { component: NameEdit, props: { isCurrentUser } },
    },
    {
      key: 'Datum',
      title: 'Datum',
      value: (v) => {
        const d = new Date(v.update_time);
        return `${d.getHours()}:${
          d.getMinutes() < 10 ? '0' : ''
        }${d.getMinutes()} ${d.getDate() < 10 ? '0' : ''}${d.getDate()}/${
          d.getMonth() + 1
        }`;
      },
      sortable: true,
    },
    {
      key: 'Username',
      title: 'Username',
      value: (v) => `<a href="/#/profile/${v.user_id}">${v.username}</a>`,
      sortable: true,
    },
    {
      key: true,
      title: true,
      class: 'iconWidth',
      renderComponent: {
        component: StatusComp,
        props: { moveToArt, isCurrentUser },
      },
    },
    {
      key: 'Delete',
      title: 'Delete',
      renderComponent: {
        component: DeleteComp,
        props: { removeFromTrash, moveToTrash, isCurrentUser },
      },
    },
  ];

  function removeFromTrash(key) {
    for (let i = 0; i < trash.length; i++) {
      if (!!trash[i] && trash[i].key == key) {
        delete trash[i];
        i = trash.length;
        trash = trash;
      }
    }
  }

  function moveToTrash(key) {
    for (let i = 0; i < art.length; i++) {
      if (!!art[i] && art[i].key == key) {
        console.log(art[i]);
        trash.push(art[i]);
        delete art[i];
        i = art.length;
        trash = trash;
        art = art;
      }
    }
  }

  function moveToArt(key) {
    console.log(trash);
    for (let i = 0; i < trash.length; i++) {
      if (!!trash[i] && trash[i].key == key) {
        art.push(trash[i]);
        delete trash[i];
        i = trash.length;
        trash = trash;
        art = art;
      }
    }
  }

  function isCurrentUser() {
    return CurrentUser;
  }

  async function getArt() {
    drawings = await listAllObjects('drawing');
    video = await listAllObjects('video');
    audio = await listAllObjects('audio');
    stopMotion = await listAllObjects('stopmotion');
    picture = await listAllObjects('picture');
    console.log(drawings);
    useraccount = await getAccount(id);
    console.log(useraccount);
    user = useraccount.username;
    role = useraccount.metadata.role;
    azc = useraccount.metadata.azc;
    avatar_url = useraccount.url;

    art = [].concat(drawings);
    art = art.concat(stopMotion);
    art = art.concat(video);
    art = art.concat(audio);
    art = art.concat(picture);
    art.forEach(async (item, index) => {
      if (item.value.status === 'trash') {
        trash.push(item);
        delete art[index];
      }
      if (item.value.json) item.url = item.value.json.split('.')[0];
      if (item.value.url) item.url = item.value.url.split('.')[0];
      item.value.previewUrl = await convertImage(item.value.url, '64', '64');
      console.log(item.value.previewUrl);
      art = art;
    });

    trash = trash;
  }
  const promise = getArt();
</script>

<div class="box">
  <h1>kunstwerken</h1>
  <SvelteTable columns="{columns}" rows="{art}" classNameTable="profileTable" />
  {#if CurrentUser || $Profile.meta.Role == 'moderator' || $Profile.meta.Role == 'admin'}
    <h1>Prullenmand</h1>
    <SvelteTable
      columns="{columns}"
      rows="{trash}"
      classNameTable="profileTable"
    />
  {/if}
</div>

<style>
  .box {
    max-width: fit-content;
    margin: 0 auto;
  }
</style>
