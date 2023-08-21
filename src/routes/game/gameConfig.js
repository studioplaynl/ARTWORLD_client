
import Phaser from 'phaser';

import CircleMaskImagePlugin from 'phaser3-rex-plugins/plugins/circlemaskimage-plugin';
// import ScrollerPlugin from 'phaser3-rex-plugins/plugins/scroller-plugin';
// import SpinnerPlugin from 'phaser3-rex-plugins/templates/spinner/spinner-plugin';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin';
import GesturesPlugin from 'phaser3-rex-plugins/plugins/gestures-plugin';
// Load Scenes
import PreloadScene from './scenes/PreloadScene';
import GameOnboarding from './scenes/GameOnboarding';
import Location1 from './scenes/Location1';
import Location3 from './scenes/Location3';
import Location4 from './scenes/Location4';
import UIScene from './scenes/UIScene';
import Artworld from './scenes/Artworld';
import TestCoordinates from './scenes/TestCoordinates';
import DefaultUserHome from './scenes/DefaultUserHome';
import ChallengeAnimalGarden from './scenes/ChallengeAnimalGarden';
import ChallengeFlowerField from './scenes/ChallengeFlowerField';
import BlueSail from './scenes/BlueSail';
import GreenSquare from './scenes/GreenSquare';
import RedStar from './scenes/RedStar';
import TurquoiseTriangle from './scenes/TurquoiseTriangle';
import YellowDiamond from './scenes/YellowDiamond';
import RobotWorld from './scenes/RobotWorld';
import FireWorld from './scenes/FireWorld';
import SlimeWorld from './scenes/SlimeWorld';
import MarsWorld from './scenes/MarsWorld';
import UnderwaterWorld from './scenes/UnderwaterWorld';
import SeaWorld from './scenes/SeaWorld';
import CloudWorld from './scenes/CloudWorld';
import MoonWorld from './scenes/MoonWorld';
import PizzaWorld from './scenes/PizzaWorld';
import UndergroundWorld from './scenes/UndergroundWorld';
import WoestijnWereld from './scenes/WoestijnWereld';
import IjscoWereld from './scenes/IjscoWereld';
import IjsWereld from './scenes/IjsWereld';
import BijenWereld from './scenes/BijenWereld';

/** Phaser Plugins */

const SCENES = [
  PreloadScene,
  GameOnboarding,
  Location1,
  Location3,
  Location4,
  Artworld,
  UIScene,
  TestCoordinates,
  DefaultUserHome,
  ChallengeAnimalGarden,
  ChallengeFlowerField,
  BlueSail,
  GreenSquare,
  RedStar,
  TurquoiseTriangle,
  YellowDiamond,
  FireWorld,
  RobotWorld,
  SlimeWorld,
  MarsWorld,
  UnderwaterWorld,
  SeaWorld,
  CloudWorld,
  MoonWorld,
  PizzaWorld,
  UndergroundWorld,
  WoestijnWereld,
  IjscoWereld,
  IjsWereld,
  BijenWereld,
];

import { CONFIG } from '../../constants';


export default {

  parent: 'phaserId',

  type: Phaser.WEBGL,
  transparent: true, // for 3d scene

  domCreateContainer: false,
  input: {
    windowEvents: false, // no input to phaser from outside the canvas, the rest of the html doc
  },

  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: CONFIG.WIDTH,
    height: CONFIG.HEIGHT,
  },
  plugins: {
    scene: [
      // {
      //   key: 'rexSpinner',
      //   plugin: SpinnerPlugin,
      //   mapping: 'rexSpinner',
      // },
      {
        key: 'rexGestures',
        plugin: GesturesPlugin,
        mapping: 'rexGestures',
      },
    ],

    global: [
      {
        key: 'rexCircleMaskImagePlugin',
        plugin: CircleMaskImagePlugin,
        start: true,
      },
      // {
      //   key: 'rexScroller',
      //   plugin: ScrollerPlugin,
      //   start: true,
      // },
      {
        key: 'rexOutlinePipeline',
        plugin: OutlinePipelinePlugin,
        start: true,
      },

    ],
  }, // end plugins

  physics: {
    default: 'arcade',
    arcade: {
      // gravity: { y: 0 },
      debug: true,
      fixedStep: true,
      fps: 60,
    },
  },

  scene: SCENES, // scenes defined above

};

