//* Scenes
import PreloadScene from "./scenes/PreloadScene"
import MainMenu from "./scenes/MainMenu"
import NetworkBoot from "./scenes/NetworkBoot.js"

import Location1 from "./scenes/Location1"
import Location3 from "./scenes/Location3"
import Location4 from "./scenes/Location4"
import UI_Scene from "./scenes/UI_Scene"
import Artworld from "./scenes/Artworld.js"
import TestCoordinates from "./scenes/TestCoordinates"
import DefaultUserHome from "./scenes/DefaultUserHome"


export const CONFIG = {
  WIDTH: window.innerWidth,
  HEIGHT: window.innerHeight //HEIGHT: window.innerHeight - 22
  // WIDTH: '100%',
  // HEIGHT: '100%'

  // WIDTH: window.innerWidth * window.devicePixelRatio,
  // HEIGHT: window.innerHeight * window.devicePixelRatio

}

export const SCENES = [
  PreloadScene,
  MainMenu,
  NetworkBoot,
  Location1,
  Location3,
  Location4,
  Artworld,
  UI_Scene,
  TestCoordinates,
  DefaultUserHome
]

//export default CONFIG