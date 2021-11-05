import CONFIG from "../config.js";
import manageSession from "../manageSession";

import { compute_slots } from "svelte/internal";
import { location } from "svelte-spa-router";

export default class networkBoot_Scene extends Phaser.Scene {
  constructor() {
    super("networkBoot_Scene");
    this.phaser = this;

    this.launchLocation
  }

  async preload() {
    this.launchLocation = manageSession.location + "_Scene"
    console.log(this.launchLocation)

    // await manageSession.createSocket()
    //   .then(rec => {

    //     console.log(rec)
    //     this.scene.launch(this.launchLocation)


    //   })

  }

  async create() {


    this.scene.launch(this.launchLocation)



  } // end create


  update() {


  } //update
} //class
