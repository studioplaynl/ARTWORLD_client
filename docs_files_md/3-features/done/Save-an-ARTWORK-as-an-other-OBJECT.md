---
title: 'Feature: save an ARTWORK as an other OBJECT'
date: '2023-09-05'
---

For example:

- save a drawing as a house

- a house as a drawing

- a stopmotion as an avatar

- a stopmotion as an animal

- an avatar as a stopmotion etc

There should be a concept about what is a drawing and what is a stopmotion

---

stopmotion object example

```
userID: f011a5dc-901a-42c0-9589-587b389d1e3e

key:1661448025760_zilverBear

value: {
"url":"stopmotion/f011a5dc-901a-42c0-9589-587b389d1e3e/4_1661448025760_zilverBear.png",

"version":"0",

"previewUrl":"https://d1p8yo0yov6nht.cloudfront.net/fit-in/1800x150/filters:format(png)/stopmotion/f011a5dc-901a-42c0-9589-587b389d1e3e/4_1661448025760_zilverBear.png?signature=c43f701a0e54c74b5ff9fcc201b1f298ace3b40bc871ea68caa8e593f40b2e6f",

"displayname":"holiMoly"
}
```

---

drawing object example

```
userID: f011a5dc-901a-42c0-9589-587b389d1e3e

key:2023-02-15T11_50_40_GroenVleermuis

value:
{"url":"drawing/f011a5dc-901a-42c0-9589-587b389d1e3e/0_2023-02-15T11_50_40_GroenVleermuis.png",

"version":0,

"previewUrl":"https://d1p8yo0yov6nht.cloudfront.net/fit-in/1800x150/filters:format(png)/drawing/f011a5dc-901a-42c0-9589-587b389d1e3e/0_2023-02-15T11_50_40_GroenVleermuis.png?signature=0099cb5599dff8836c2366ab5d00f2a1c2d0bf07e736582af47b01a728546c8a",

"displayname":"GroenVleermuis"
}
```

---

house object example (the image for a home)

```
userID: f011a5dc-901a-42c0-9589-587b389d1e3e

key:2023-02-17T10_31_38_toren

value:
{
"url":"house/f011a5dc-901a-42c0-9589-587b389d1e3e/0_2023-02-17T10_31_38_toren.png",
"version":0,
"displayname":"toren"
}
```

---

avatar object example

```
userID: f011a5dc-901a-42c0-9589-587b389d1e3e

key:2023-01-02T14_29_17_WitKaaiman

value: {
"url":"avatar/f011a5dc-901a-42c0-9589-587b389d1e3e/0_2023-01-02T14_29_17_WitKaaiman.png",

"version":0,

"displayname":"WitKaaiman"
}
```

---

drawing and stopmotion have a preview-url. When and where is that generated?

clean way to transfer:

1. get the image data (raw, largest)

2. save it with a new key, with same display name

3. do the url's get generated?

In Apploader.svelte loading and making new files is handled

A new function/ state should be defined: **transferFile()**

**currentFile** contains all the information about the file

**CurrentApp** should also contain animalGarden, flowerGarden etc

```
if (
      isValidLoaderApp($CurrentApp) && // Dont run on the game
      isValidQuery(parsedQuery) // AND when the query is valid (to open an existing file)
    ) {
      loadFile();
    } else if (isValidLoaderApp($CurrentApp)) {
      newFile();
    }
  });
```

```
  async function loadFile() {
    currentFile.loaded = false;

    const userId = parsedQuery?.userId ?? null;
    const key = parsedQuery?.key ?? null;
    const loadFromCollection = $CurrentApp;

    currentFile = await getFileInformation(loadFromCollection, userId, key);
    dlog('currentFile loaded: ', currentFile);
  }
```

```
  async function newFile() {
    const saveToCollection = $CurrentApp;
    displayName = await getRandomName();
    const tempKey = await getDateAndTimeFormatted();
    currentFile = {
      userId: $Profile.id,
      loaded: false,
      new: true,
      displayName,
      key: `${tempKey}_${displayName}`,
      type: saveToCollection,
      status: PERMISSION_READ_PUBLIC,
    };
  }
```

---

in drawing.svelte the image data is loaded

```
function createframeBuffer(img) {
    dlog('baseSize: ', baseSize);
    loadCanvas.width = baseSize;
    loadCanvas.height = baseSize;
    const ctx = loadCanvas.getContext('2d');
    for (let index = 0; index < frames; index++) {
      ctx.drawImage(
        img,
        index * img.height,
        0,
        img.height,
        img.height,
        0,
        0,
        baseSize,
        baseSize,
      );
      framesArray[index] = loadCanvas.toDataURL('image/png');
      // clear the loadingCanvas
      ctx.clearRect(0, 0, baseSize, baseSize);
    }
```

We don't need to create a frameBuffer (we don't need to devide the stopmotion in frames for example). We just need to load the image in a loadCanvas and then save it with the right info.

```
// Was there an image to load? Do so
    if (file?.url) {
      dlog('load file url drawing');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = (e) => {
        frames = Math.floor(e.target.width / e.target.height);
        createframeBuffer(img); // disabled looking for error
      };

      img.src = file.url;
      setLoader(false);
    } else {
      // new image
      frames = 1;
      setLoader(false);
    }

function createframeBuffer(img) {
    dlog('baseSize: ', baseSize);
loadCanvas.width = baseSize;
    loadCanvas.height = baseSize;
    const ctx = loadCanvas.getContext('2d');
    for (let index = 0; index < frames; index++) {
      ctx.drawImage(
        img,
        index * img.height,
        0,
        img.height,
        img.height,
        0,
        0,
        baseSize,
        baseSize,
      );

    }

    // clear the loadingCanvas
    ctx.clearRect(0, 0, baseSize, baseSize);

    // make the loadingCanvas 0
    loadCanvas.width = 0;
```
