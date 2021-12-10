//* Scenes
import PreloadScene from "./scenes/PreloadScene";
import MainMenu from "./scenes/MainMenu";
import NetworkBoot from "./scenes/NetworkBoot.js";
import Location1 from "./scenes/Location1";
import Location2 from "./scenes/Location2";
import Location3 from "./scenes/Location3";
import Location4 from "./scenes/Location4";
import Location5 from "./scenes/Location5";
import UI_Scene from "./scenes/UI_Scene";
import ArtworldAmsterdam from "./scenes/ArtworldAmsterdam.js";
import TestCoordinates from "./scenes/TestCoordinates";


export const CONFIG = {
  WIDTH: window.innerWidth,
  HEIGHT: window.innerHeight
  // WIDTH: '100%',
  // HEIGHT: '100%'

  // WIDTH: window.innerWidth * window.devicePixelRatio,
  // HEIGHT: window.innerHeight * window.devicePixelRatio

  // WIDTH: screen.availWidth,
  // HEIGHT: screen.availHeight

}

export const SCENES = [
  PreloadScene,
  MainMenu,
  NetworkBoot,
  Location1,
  Location2,
  Location3,
  Location4,
  Location5,
  ArtworldAmsterdam,
  UI_Scene,
  TestCoordinates
]

//export default CONFIG