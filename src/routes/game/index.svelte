<script>
  //phaser
  import { onMount } from "svelte";
  import MainMenu from "./scenes/MainMenu";
  import Matchmaking from "./scenes/Matchmaking";
  import InGame from "./scenes/InGame";
  import Location2Scene from "./scenes/Location2Scene";
  //import Phaser from "phaser";

  import CONFIG from "./config";

  onMount(async () => {
    const config = {
      type: Phaser.AUTO,
      //domCreateContainer: false,
      scale: {
        //fit to window
        mode: Phaser.Scale.FIT,
        parent: "phaserId",
        // Center vertically and horizontally
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: CONFIG.WIDTH,
        height: CONFIG.HEIGHT,
      },

      backgroundColor: "#FF4C4C",
      physics: {
        default: "arcade",
        arcade: {
          //gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [MainMenu, Matchmaking, InGame, Location2Scene],
    };

    new Phaser.Game(config);
  });
</script>

<main>
  <div id="phaserId" />
</main>
