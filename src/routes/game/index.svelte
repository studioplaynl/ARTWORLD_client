<script>
  //phaser
  import { onMount } from "svelte";
  import MainMenu from "./scenes/MainMenu";
  import location1_Scene from "./scenes/Location1_Scene";
  import location2_Scene from "./scenes/Location2_Scene";
  import location3_Scene from "./scenes/Location3_Scene";
  import UI_Scene from "./scenes/UI_Scene";

  import CONFIG from "./config";

  onMount(async () => {
    const config = {
      //parent: "phaserId",
      type: Phaser.AUTO,
      domCreateContainer: false,
      // width: CONFIG.WIDTH,
      // height: CONFIG.HEIGHT,
      input: {
        windowEvents: false
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'phaserId',
        width: CONFIG.WIDTH,
        height:CONFIG.HEIGHT,
    },
      // scale: {
      //           mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT ,
      //           autoCenter: Phaser.Scale.CENTER_BOTH
      //       },
      // backgroundColor: "#000000",
      // transparent: true,
      physics: {
        default: "arcade",
        arcade: {
          //gravity: { y: 0 },
          debug: false,
          fixedStep: true,
          fps: 60,
        },
      },
      scene: [MainMenu, location1_Scene, location2_Scene, location3_Scene, UI_Scene],
    };

    new Phaser.Game(config);
  });
</script>

<main>
  <div id="phaserId" />
</main>
