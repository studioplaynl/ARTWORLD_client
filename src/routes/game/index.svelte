<script>
  //* Svelte
  import { onMount } from 'svelte';

  //* Phaser Plugins
  // import { enable3d, Canvas } from "@enable3d/phaser-extension"
  import Phaser from 'phaser';
  import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
  import CircleMaskImagePlugin from 'phaser3-rex-plugins/plugins/circlemaskimage-plugin';
  import ScrollerPlugin from 'phaser3-rex-plugins/plugins/scroller-plugin';
  import SpinnerPlugin from 'phaser3-rex-plugins/templates/spinner/spinner-plugin';
  import { CONFIG } from './config';
  import { sessionCheck } from '../../api';
  import Itemsbar from '../components/itemsbar.svelte';
  import SelectedOnlinePlayerBar from '../components/selectedOnlinePlayerBar.svelte';
  import AppLoader from '../components/appLoader.svelte';
  import TopBar from '../components/topbar.svelte';
  import AchievementAnimation from '../components/achievement.svelte';
  import TutLoader from '../tutorials/tutLoader.svelte';

  // Add scenes
  import PreloadScene from './scenes/PreloadScene';
  import UrlParser from './scenes/UrlParser';
  import NetworkBoot from './scenes/NetworkBoot';
  import Location1 from './scenes/Location1';
  import Location3 from './scenes/Location3';
  import Location4 from './scenes/Location4';
  import UIScene from './scenes/UIScene';
  import Artworld from './scenes/Artworld';
  import TestCoordinates from './scenes/TestCoordinates';
  import DefaultUserHome from './scenes/DefaultUserHome';
  import ChallengeAnimalGarden from './scenes/ChallengeAnimalGarden';
  import ChallengeFlowerField from './scenes/ChallengeFlowerField';

  const SCENES = [
    PreloadScene,
    UrlParser,
    NetworkBoot,
    Location1,
    Location3,
    Location4,
    Artworld,
    UIScene,
    TestCoordinates,
    DefaultUserHome,
    ChallengeAnimalGarden,
    ChallengeFlowerField,
  ];

  onMount(async () => {
    sessionCheck();

    const config = {
      // parent: "phaserId",

      type: Phaser.WEBGL,
      transparent: true, // for 3d scene

      domCreateContainer: false,
      // width: CONFIG.WIDTH,
      // height: CONFIG.HEIGHT,
      input: {
        windowEvents: false, // no input to phaser from outside the canvas, the rest of the html doc
      },

      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'phaserId',
        width: CONFIG.WIDTH,
        height: CONFIG.HEIGHT,
      },
      plugins: {
        scene: [
          {
            key: 'rexUI',
            plugin: UIPlugin,
            mapping: 'rexUI',
          },
          {
            key: 'rexSpinner',
            plugin: SpinnerPlugin,
            mapping: 'rexSpinner',
          },
        ],
        global: [
          {
            key: 'rexCircleMaskImagePlugin',
            plugin: CircleMaskImagePlugin,
            start: true,
          },
          {
            key: 'rexScroller',
            plugin: ScrollerPlugin,
            start: true,
          },
        ],
      }, // end plugins

      // scale: {
      //           mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT ,
      //           autoCenter: Phaser.Scale.CENTER_BOTH
      //       },
      // backgroundColor: "#000000",
      // transparent: true,

      physics: {
        default: 'arcade',
        arcade: {
          // gravity: { y: 0 },
          debug: false,
          fixedStep: true,
          fps: 60,
        },
      },

      scene: SCENES, // scenes defined in config.js

      // ...Canvas(), //enable 3D
    };

    // enable3d(() => new Phaser.Game(config)).withPhysics("/ammo/kripken")
    // TODO Fix 'new' error below:
    new Phaser.Game(config);
  });
</script>

<Itemsbar />
<SelectedOnlinePlayerBar />
<AppLoader />
<TopBar />
<AchievementAnimation />
<main>
  <div id="phaserId"></div>
</main>
<TutLoader />
