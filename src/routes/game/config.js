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
import ChallengeAnimalGarden from "./scenes/ChallengeAnimalGarden"
import ChallengeFlowerField from "./scenes/ChallengeFlowerField"
import GreenSquare from "./scenes/GreenSquare"
import TurquoiseTriangle from "./scenes/TurquoiseTriangle"
import RedStar from "./scenes/RedStar"

export const CONFIG = {
  WIDTH: window.innerWidth * window.devicePixelRatio,
  HEIGHT: window.innerHeight * window.devicePixelRatio 
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
  DefaultUserHome,
  ChallengeAnimalGarden,
  ChallengeFlowerField,
  GreenSquare,
  RedStar,
  TurquoiseTriangle
]

export const SCENE_NAMES = [
  "PreloadScene",
  "MainMenu",
  "NetworkBoot",
  "Location1",
  "Location3",
  "Location4",
  "Artworld",
  "UI_Scene",
  "TestCoordinates",
  "DefaultUserHome",
  "ChallengeAnimalGarden",
  "ChallengeFlowerField",
  "GreenSquare",
  "RedStar",
  "TurquoiseTriangle"
];

//export default CONFIG