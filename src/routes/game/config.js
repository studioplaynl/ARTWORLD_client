 //* Scenes
 import PreloadScene from "./scenes/PreloadScene";
 import MainMenu from "./scenes/MainMenu";
 import NetworkBoot_Scene from "./scenes/NetworkBoot_Scene";
 import Location1_Scene from "./scenes/Location1_Scene";
 import Location2_Scene from "./scenes/Location2_Scene";
 import Location3_Scene from "./scenes/Location3_Scene";
 import Location4_Scene from "./scenes/Location4_Scene";
 import Location5_Scene from "./scenes/Location5_Scene";
 import Location6_Scene from "./scenes/Location6_Scene";
 import Location7_Scene from "./scenes/Location7_Scene";
 import UI_Scene from "./scenes/UI_Scene";
 import ArtworldAmsterdam from "./scenes/ArtworldAmsterdam";
 

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
    NetworkBoot_Scene,
    Location1_Scene,
    Location2_Scene,
    Location3_Scene,
    Location4_Scene,
    Location5_Scene,
    Location6_Scene,
    Location7_Scene,
    ArtworldAmsterdam,
    UI_Scene,
  ]

//export default CONFIG