---
title: 'BugFix: load assets per scene, with error handling'
date: '2023-08-11'
---

I moved the this.load.on('loaderror') to each scene as it gave an error on scenes when it was in UIscene

Possible solutions:  
1\. keep preloadscene running  
2\. this.load.on in UI scene  
3\. put a this.load.on('loaderror' in each scene

ad 1.
If PreloadScene is running with the error handler, and I load a file in CloudWorld that doesn't resolve, it doesn't throw an error.

I don't really understand why there is correct error handling in UserHomes

ad 2.
does this catch all load errors?

No it doesn't catch an error in CloudWorld for instance.

ad 3.

Now only on 'complete' there is a check if all images are downloaden

---

We now have an 'onerror' checker in each scene.

But we now can go back to prev scene when current scene is still loading... this gives errors.

CHECK: [https://rexrainbow.github.io/phaser3-rex-notes/docs/site/loader/](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/loader/)

---

'filecomplete-image-${filename}'.on -> the files is not fully loaded when this fires!

progress and complete are acting strange, and are not useful....

**My custom way of checking if all items of an array are loaded works best: before loading save the number of items. On 'complete' increment 'downloaded', when downloaded is the same size as the nrOfItems then it is finished**

---

Svelte is loading assets again and again. Maybe use this: [https://github.com/bluwy/svelte-preprocess-import-assets](https://github.com/bluwy/svelte-preprocess-import-assets)

---

#### off(event \[, fn\] \[, context\] \[, once\])

Remove the listeners of a given event.

##### Parameters:

| Name      | Type     | Argument   | Description                                         |
| --------- | -------- | ---------- | --------------------------------------------------- | --------------- |
| `event`   | string   |  symbol    |                                                     | The event name. |
| `fn`      | function | <optional> | Only remove the listeners that match this function. |
| `context` | \*       | <optional> | Only remove the listeners that have this context.   |
| `once`    | boolean  | <optional> | Only remove one-time listeners.                     |

---

In a world with houses, when the loading of the houses is interrupted. There is an error when the image is already loaded, but the house is 'in the making'. We get a On Error: Uncaught TypeError: Cannot read properties of null (reading 'image')

But we cannot help this: the images as loaded, but the creation of the houses is interrupted. We can't put a check on that.
