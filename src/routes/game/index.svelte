<script>
  //phaser
  import { onMount } from "svelte";
  import { enable3d, Canvas } from "@enable3d/phaser-extension";
  import MainMenu from "./scenes/MainMenu";
  // import GesturesPlugin from 'phaser3-rex-plugins/plugins/gestures-plugin.js'; //swipe gestures
  import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

  import networkBoot_Scene from "./scenes/networkBoot_Scene";
  import location1_Scene from "./scenes/Location1_Scene";
  import location2_Scene from "./scenes/Location2_Scene";
  import location3_Scene from "./scenes/Location3_Scene";
  import location4_Scene from "./scenes/Location4_Scene";
  import location5_Scene from "./scenes/Location5_Scene";

  import UI_Scene from "./scenes/UI_Scene";

  import CONFIG from "./config";

  onMount(async () => {
    const config = {
      //parent: "phaserId",
      type: Phaser.WEBGL,
      transparent: true, // for 3d scene
      domCreateContainer: false,
      // width: CONFIG.WIDTH,
      // height: CONFIG.HEIGHT,
      input: {
        windowEvents: false, //no input to phaser from outside the canvas, the rest of the html doc
      },

      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "phaserId",
        width: CONFIG.WIDTH,
        height: CONFIG.HEIGHT,
      },
      plugins: {
        scene: [{
            key: 'rexUI',
            plugin: UIPlugin,
            mapping: 'rexUI'
        },
        // ...
        ]
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
      scene: [
        MainMenu,
        networkBoot_Scene,
        location1_Scene,
        location2_Scene,
        location3_Scene,
        location4_Scene,
        location5_Scene,
        UI_Scene,
      ],
      ...Canvas(),
    };

    enable3d(() => new Phaser.Game(config)).withPhysics("/ammo/kripken");
  });
</script>

<main>
  <div id="phaserId" />
</main>
