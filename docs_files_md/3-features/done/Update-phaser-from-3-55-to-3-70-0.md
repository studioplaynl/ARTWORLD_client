---
title: 'Log: update Phaser from 3.55 to 3.70.0'
date: '2024-01-04'
---

The update from 3.55 to 3.60 is actually a breaking update.

broken

Fabric
UPGRADE PHASER with Fabric

Fabric with eraser breaks

Possible solution:

- https://github.com/fabricjs/fabric.js/issues/7171

- https://www.npmjs.com/package/fabric-with-erasing

RexPlugins

Swiper Svelte

---

Working:  
Vite + Phaser 3.70.0

Breaking point:

ManageSession.js:48 Uncaught TypeError: Cannot read properties of undefined (reading 'Math')  
at new ManageSession (ManageSession.js:48:35)  
at ManageSession.js:399:16  
ManageSession @ ManageSession.js:48 **this.swipeAmount = new Phaser.Math.Vector2(0, 0);**

(anonymous) @ ManageSession.js:399

fix: import \* as Phaser from 'phaser';  
replaced  
const { Phaser } = window;  
in many files  
import \* as Phaser from 'phaser';

Breaking point:

RegisterPostPipeline.js:4 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'renderer')  
at RegisterPostPipeline (RegisterPostPipeline.js:4:17)

Turned off Outliner plugin

Breaking:

FlamengoWereld.js:85 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'sizeX')  
at FlamengoWereld.create (FlamengoWereld.js:85:34)

temp fix (**hack**):  
this.worldSize.x = 5500;  
this.worldSize.y = 5000;
