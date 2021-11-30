 //* Scenes
 import PreloadScene from "./scenes/PreloadScene";
 import MainMenu from "./scenes/MainMenu";
 import networkBoot_Scene from "./scenes/networkBoot_Scene";
 import location1_Scene from "./scenes/Location1_Scene";
 import location2_Scene from "./scenes/Location2_Scene";
 import location3_Scene from "./scenes/Location3_Scene";
 import location4_Scene from "./scenes/Location4_Scene";
 import location5_Scene from "./scenes/Location5_Scene";
 import location6_Scene from "./scenes/Location6_Scene";
 import location7_Scene from "./scenes/Location7_Scene";
 import UI_Scene from "./scenes/UI_Scene";

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
    networkBoot_Scene,
    location1_Scene,
    location2_Scene,
    location3_Scene,
    location4_Scene,
    location5_Scene,
    location6_Scene,
    location7_Scene,
    UI_Scene,
  ]

//export default CONFIG