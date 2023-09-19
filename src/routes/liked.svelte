<script>
  import SvelteTable from 'svelte-table';
  import { beforeUpdate, onDestroy } from 'svelte';
  import { Liked } from '../storage';
  import { PlayerPos, PlayerLocation, PlayerUpdate } from './game/playerState';
  // import FriendAction from './components/friendaction.svelte';
  import ArtworkLoader from './components/artworkLoader.svelte';
  import ToggleLikeButton from './components/toggleLikeButton.svelte';
  import {
    // ListFriends,
    // addFriend,
    // setLoader,
    convertImage,
    getAccount,
    getObject,
  } from '../helpers/nakamaHelpers';
  // import { convertImage } from '../helpers/nakamaHelpers';
  import { DEFAULT_PREVIEW_HEIGHT } from '../constants';
  // import { dlog } from '../helpers/debugLog';
  import { returnPartsOfArtUrl } from './game/helpers/UrlHelpers';

  // const drawingIcon =
  //   '<img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg" />';
  // const stopMotionIcon =
  //   '<img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg" />';
  // const AudioIcon =
  //   '<img class="icon" src="assets/SHB/svg/AW-icon-square-music.svg.svg" />';
  // const videoIcon =
  //   '<img class="icon" src="assets/SHB/svg/AW-icon-play.svg" />';
  let alreadysubbed = false;
  let unsubscribe;

  let lastLengthArtworks;
  let likedArtworks;
  let images = [];

  beforeUpdate(() => {
    if (!alreadysubbed) subscribeToLiked();
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });

  function subscribeToLiked() {
    unsubscribe = Liked.subscribe((value) => {
      alreadysubbed = true;

      if (lastLengthArtworks !== value.length) {
        lastLengthArtworks = value.length;

        // clear the images list
        images = [];
        likedArtworks = value;

        if (likedArtworks.length > 0) {
          likedArtworks.forEach(async (liked) => {
            if (liked.value && liked.value?.url) {
              const img = await convertImage(
                liked.value.url,
                DEFAULT_PREVIEW_HEIGHT,
              );

              images = [
                ...images,
                {
                  img,
                  url: liked.value.url,
                  collection: liked.value.collection,
                },
              ];
            }
          });
        }
      }
    });
  }

  async function handleEvents(event) {
    const { row } = event.detail;
    // dlog('event: ', event);
    if (event.detail.key === 'voorbeeld') {
      // We send the player to the left side of the user's home
      const likedArtUrl = row.url;
      const parts = returnPartsOfArtUrl(likedArtUrl);

      if (parts === null) return;

      const { userId } = parts;

      // get user account
      const friendAccount = await getAccount(userId);
      // in the friendAccount.meta:
      // metadata.Azc
      const friendHomeLocation = friendAccount.meta.Azc;

      // get home object of friend to get pos of that home
      const friendHome = await getObject('home', friendHomeLocation, userId);

      PlayerLocation.set({
        scene: friendHomeLocation,
      });

      // check if there is posX and posY from the home object
      if (typeof friendHome.value.posX !== 'undefined' && typeof friendHome.value.posY !== 'undefined') {
        // place user next to nameplate of home
        const playerPosX = friendHome.value.posX - 80;
        const playerPosY = friendHome.value.posY - 100;

        PlayerUpdate.set({ forceHistoryReplace: false });
        PlayerPos.set({
          x: playerPosX,
          y: playerPosY,
        });
      } else {
        // if there was no posX and y from home object
        PlayerUpdate.set({ forceHistoryReplace: false });
        PlayerPos.set({
          x: -80,
          y: -100,
        });
      }
    }
  }

  const columns = [
  // {
  //   key: 'Soort',
  //   title: '',
  //   value: (v) => {
  //     if (v.collection === 'drawing') {
  //       return drawingIcon;
  //     }
  //     if (v.collection === 'stopmotion') {
  //       return stopMotionIcon;
  //     }
  //     if (v.collection === 'audio') {
  //       return AudioIcon;
  //     }
  //     if (v.collection === 'video') {
  //       return videoIcon;
  //     }
  //     return null;
  //   },
  //   sortable: true,
  // },
    {
      key: 'voorbeeld',
      title: '',
      renderComponent: {
        component: ArtworkLoader,
        props: {},
      },
    },
    {
      key: 'unlike',
      title: '',
      renderComponent: {
        component: ToggleLikeButton,
        props: {

        },
      },
    },

  ];

</script>

<SvelteTable
  columns="{columns}"
  rows="{images}"
  on:clickCell="{handleEvents}"
  classNameTable="profileTable"
/>
