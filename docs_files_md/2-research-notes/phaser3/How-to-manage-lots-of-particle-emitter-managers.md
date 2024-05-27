---
title: 'Note: How to manage lots of Particle Emitter (Managers)?'
date: '2022-12-27'
---

[https://phaser.discourse.group/t/how-to-manage-lots-of-particle-emitter-managers/12654](https://phaser.discourse.group/t/how-to-manage-lots-of-particle-emitter-managers/12654)

You could pool them, but you might not have to.

For most situations you need only one manager per particle texture. You can create as many emitters as you need from one manager. Remove an emitter you never want to use again. To disable an emitter temporarily, you can set its `on = false` and `visible = false`.
