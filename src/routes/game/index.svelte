<script>
  //phaser
  import { onMount } from "svelte";
  import MainMenu from "./scenes/MainMenu";

  import AZC1_Scene from "./scenes/AZC1_Scene";
  import Location2_Scene from "./scenes/Location2_Scene";
  //import Phaser from "phaser";

  import CONFIG from "./config";

  onMount(async () => {
    const config = {
      parent: "phaserId",
      type: Phaser.AUTO,
      domCreateContainer: false,
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT,
      backgroundColor: "#000000",
      physics: {
        default: "arcade",
        arcade: {
          //gravity: { y: 0 },
          debug: false,
          fixedStep: true,
          fps: 60,
        },
      },
      scene: [MainMenu, AZC1_Scene, Location2_Scene],
    };

    new Phaser.Game(config);
  });
</script>

<main>
  <div id="phaserId" />
</main>
