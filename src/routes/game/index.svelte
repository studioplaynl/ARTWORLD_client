<script>
  //* Svelte
  import { onMount } from "svelte";
  
  //* Phaser Plugins
  import { enable3d, Canvas } from "@enable3d/phaser-extension";
  // import GesturesPlugin from 'phaser3-rex-plugins/plugins/gestures-plugin.js'; //swipe gestures
  import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
  import CircleMaskImagePlugin from "phaser3-rex-plugins/plugins/circlemaskimage-plugin.js";

  import { CONFIG, SCENES } from "./config";

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
        scene: [
          {
            key: "rexUI",
            plugin: UIPlugin,
            mapping: "rexUI",
          },
        ],
        global: [
          {
            key: "rexCircleMaskImagePlugin",
            plugin: CircleMaskImagePlugin,
            start: true,
          },
        ],
      }, //end plugins

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

      scene: SCENES, //scenes defined in config.js

      ...Canvas(), //enable 3D
    };

    enable3d(() => new Phaser.Game(config)).withPhysics("/ammo/kripken");
  });
</script>

<main>
  <div id="phaserId" />
</main>
