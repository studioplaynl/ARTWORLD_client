<script>
//phaser
import { onMount } from 'svelte';
import MainMenu from "./scenes/MainMenu";
import Matchmaking from "./scenes/Matchmaking";
import InGame from "./scenes/InGame";
import Location2Scene from "./scenes/Location2Scene";
//import Phaser from "phaser";

import CONFIG from "./config";


onMount(async () => {

const config = {
	parent: "phaserId",
	type: Phaser.AUTO,
	domCreateContainer: false,
	width: CONFIG.WIDTH,
	height: CONFIG.HEIGHT,
	//backgroundColor: "#FF4C4C",
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
  <div id="phaserId"></div>
  
</main>
