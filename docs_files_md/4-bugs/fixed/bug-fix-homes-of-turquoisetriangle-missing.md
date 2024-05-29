---
title: 'Bug Fix: homes of TurquoiseTriangle missing'
date: '2023-08-28'
---

A lot of homes of TurquoiseTriangle are missing. I made a mistake naming the Azc Torquoise, so the Azc and the homeObject are spelled wrong.

---

Fix: user Azc

Fix: user homeObjects

---

Extra fixes:

I inadvertently deleted the homeObject of user19. FIX THAT!

But also fix the error that the itemsBar cannot be opened to select a default homeObject

```
ImagePicker.svelte:195 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'url')
    at Object.create [as c] (ImagePicker.svelte:195:31)
    at Object.update [as p] (ImagePicker.svelte:189:9)
    at update$2 (index.mjs:1093:36)
```

```
stopmotion.svelte:18 Uncaught TypeError: Cannot read properties of undefined (reading 'clientWidth')
    at stopmotion.svelte:18:18
```
