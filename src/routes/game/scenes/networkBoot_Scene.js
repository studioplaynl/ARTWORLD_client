import CONFIG from "../config.js";
import manageSession from "../manageSession";

import { compute_slots } from "svelte/internal";
import { location } from "svelte-spa-router";

export default class networkBoot_Scene extends Phaser.Scene {
  constructor() {
    super("networkBoot_Scene");
    this.phaser = this;
  }

  async preload() {
    manageSession.location = "location1"
    await manageSession.createSocket();
  }

  async create() {


    this.scene.launch("location1_Scene")
    

    
  } // end create


  update() {
   

  } //update
} //class
