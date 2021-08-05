<svelte:head>
	<title>Welcome</title>
</svelte:head>

<h1>Hello and welcome to my site!</h1>

<script>
  import MainMenu from "./scenes/MainMenu";
  import Matchmaking from "./scenes/Matchmaking";
  import InGame from "./scenes/InGame";
  import Location2Scene from "./scenes/Location2Scene";
  import Phaser from "phaser";

  import CONFIG from "./config";

  const config = {
    type: Phaser.AUTO,
    domCreateContainer: true,
    parent: "phaser-id",
    width: CONFIG.WIDTH,
    height: CONFIG.HEIGHT,
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
</script>

<main>
  <div id="phaser-id" />
</main>
