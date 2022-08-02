<script>
  import SvelteTable from 'svelte-table';
  import { beforeUpdate } from 'svelte';
  import { Liked } from '../storage';
  import ArtworkLoader from './components/artworkLoader.svelte';
  import { convertImage } from '../api';

  const drawingIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg" />';
  const stopMotionIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg" />';
  const AudioIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-music.svg.svg" />';
  const videoIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-play.svg" />';
  let alreadysubbed = false;

  const columns = [
    {
      key: 'Soort',
      title: '',
      value: (v) => {
        if (v.collection === 'drawing') {
          return drawingIcon;
        }
        if (v.collection === 'stopmotion') {
          return stopMotionIcon;
        }
        if (v.collection === 'audio') {
          return AudioIcon;
        }
        if (v.collection === 'video') {
          return videoIcon;
        }
        return null;
      },
      sortable: true,
    },
    {
      key: 'voorbeeld',
      title: '',
      renderComponent: { component: ArtworkLoader, props: {} },
    },
    //   {
    //     key: "title",
    //     title: "",
    //     renderComponent: {component: NameEdit, props: {isCurrentUser}}
    //   },
  ];

  beforeUpdate(() => {
    if (!alreadysubbed) subscribeToLiked();
  });

  let lastLengthArtworks;
  let likedArtworks;
  let images = [];

  function subscribeToLiked() {
    Liked.subscribe((value) => {
      alreadysubbed = true;

      if (lastLengthArtworks !== value.length) {
        lastLengthArtworks = value.length;

        // clear the images list
        images = [];
        likedArtworks = value;

        if (likedArtworks.length > 0) {
          likedArtworks.forEach(async (liked) => {
            if (liked.value && liked.value?.url) {
              const img = await convertImage(liked.value.url, '128', '128');

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
</script>

<SvelteTable
  columns="{columns}"
  rows="{images}"
  classNameTable="profileTable"
/>
