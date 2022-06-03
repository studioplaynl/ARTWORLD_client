<script>
  import SvelteTable from "svelte-table";
  import { Liked } from "../storage.js";
  import NameEdit from "./components/nameEdit.svelte"
  import Stopmotion from "./components/stopmotion.svelte"
  import  {beforeUpdate, onMount} from "svelte"
  import {convertImage} from "../api"

  let drawingIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg" />'
  let stopMotionIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg" />'
  let AudioIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-square-music.svg.svg" />'
  let videoIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-play.svg" />'
  let alreadysubbed = false;

  const columns = [
      {
        key: "Soort",
        title: "",
        value: v => {
          if(v.collection == "drawing") {
            return drawingIcon
          }
          if(v.collection == "stopmotion"){
            return stopMotionIcon
          }
          if(v.collection == "audio"){
            return AudioIcon
          }
          if(v.collection == "video"){
            return videoIcon
          }
        },
        sortable: true,
      },
      {
        key: "voorbeeld",
        title: "",
        renderComponent: {component: Stopmotion, props: {}}
      },
    //   {
    //     key: "title",
    //     title: "",
    //     renderComponent: {component: NameEdit, props: {isCurrentUser}}
    //   },
  ];

  function isCurrentUser(){
    return false
  }


  beforeUpdate(()=>{
      if(!alreadysubbed) subscribeToLiked();
  })


let lastLengthArtworks, likedArtworks, images


function subscribeToLiked() {
    //console.log("subscribeToLiked");
    Liked.subscribe((value) => {
        alreadysubbed = true
 
      if (lastLengthArtworks != value.length) {
        lastLengthArtworks = value.length;
        //clear the images list
        images = [];
        likedArtworks = value;

        if (likedArtworks.length > 0) {
          likedArtworks.forEach(async (liked) => {
            images.push({
              img: await convertImage(liked.value.url, "128", "128"),
              url: liked.value.url,
              collection: liked.value.collection
            });
            images = images;
          });

        }
      }
    });
  }
</script>

<SvelteTable columns="{columns}" rows="{images}" classNameTable="profileTable"></SvelteTable>
