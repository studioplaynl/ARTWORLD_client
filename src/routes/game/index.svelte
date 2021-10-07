<script>
  //phaser
  import { onMount } from "svelte";
  import MainMenu from "./scenes/MainMenu";
  import AZC1_Scene from "./scenes/AZC1_Scene";
  import location2_Scene from "./scenes/Location2_Scene";
  import location3_Scene from "./scenes/Location3_Scene";

  import CONFIG from "./config";

  onMount(async () => {
    const config = {
      parent: "phaserId",
      type: Phaser.AUTO,
      domCreateContainer: false,
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT,
      // backgroundColor: "#000000",
      // transparent: true,
      physics: {
        default: "arcade",
        arcade: {
          //gravity: { y: 0 },
          debug: true,
          fixedStep: true,
          fps: 60,
        },
      },
      scene: [MainMenu, AZC1_Scene, location2_Scene, location3_Scene],
    };

    new Phaser.Game(config);
  });
</script>

<main>
  <div id="phaserId" />
</main>
