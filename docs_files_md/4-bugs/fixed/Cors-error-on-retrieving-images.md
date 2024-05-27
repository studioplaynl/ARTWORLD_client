---
title: 'Log: cors error on retrieving images'
date: '2023-01-03'
---

Access to image at

'https://artworld01.s3.eu-central-1.amazonaws.com/avatar/fcbcc269-a109-4a4b-a570-5ccafc5308d8/0\_2022-12-28T14\_17\_06\_GroenBaard.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA3VY3XUKP6SYAM4OK%2F20230104%2Feu-central-1%2Fs3%2Faws4\_request&X-Amz-Date=20230104T104203Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=a72c2f7bd20029e2546f5fc4965a8d378c9e1ef8977ef67e3be22d4300bd9476'

from origin

'https://artworld.vrolijkheid.nl'

has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

[https://aws.amazon.com/premiumsupport/knowledge-center/no-access-control-allow-origin-error/](https://aws.amazon.com/premiumsupport/knowledge-center/no-access-control-allow-origin-error/)

```
curl -H "Origin: artworld.vrolijkheid.nl" -v "https://artworld01.s3.eu-central-1.amazonaws.com/avatar/fcbcc269-a109-4a4b-a570-5ccafc5308d8/0_2022-12-28T14_17_06_GroenBaard.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA3VY3XUKP6SYAM4OK%2F20230104%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20230104T104203Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=a72c2f7bd20029e2546f5fc4965a8d378c9e1ef8977ef67e3be22d4300bd9476"
```

return:

```
Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< x-amz-id-2: Z0a88pOWAFUgOmBCB/R0e3TPg66g7v7CeKtjwYeeshOYpLugd8NCFg5E3EdBudQlH8EuXhSLFnc=
< x-amz-request-id: HS542A220XJFVABR
< Date: Wed, 04 Jan 2023 10:48:29 GMT
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: PUT, HEAD, GET
< Vary: Origin, Access-Control-Request-Headers, Access-Control-Request-Method
< Last-Modified: Mon, 02 Jan 2023 14:25:35 GMT
< ETag: "8e07129259d6e55599fb94b47714c078"
< x-amz-version-id: cHPlJHGeZEB1.MaX7IRw7klhDe2Z3dj4
< Accept-Ranges: bytes
< Content-Type: multipart/form-data
< Server: AmazonS3
< Content-Length: 159817
```

cloudfront page

[https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=eu-central-1#/originAccess/](https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=eu-central-1#/originAccess/)

---

hypothesis 1: the image is first retreived with an empty value. Because of the way displayName is updated.

To test: go back to commit that does not have that code

Result: going back didn't solve the issue.

Test 2: go back further (to when it did work)

With commit 8caa677c538f888220791e290224fdf533073b48 downloading and editing artworks works:

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2023/01/Screenshot-from-2023-01-03-18-33-44-1024x686.png)

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2023/01/Screenshot-from-2023-01-03-18-31-32-1024x91.png)

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2023/01/Screenshot-from-2023-01-03-18-30-21-1-1024x346.png)

So we see above that even when it works there is a undefined asked from the server, with a 404 response.

But in our case we also get a cors problem:

---

git log of commits:

d1735d059859cc3a968030f4825afbc8cd75da19 - when I tried to solve the drawing over the edge bug, but had not changed the displayName

8118fd2da334d346657bc4e9b9968f462b79da78 - the commit with Eelkes code before I started to alter the drawing app

8caa677c538f888220791e290224fdf533073b48 - before Eelke, working without cors

```
 if (appType == "avatar") {
      lastImg = await convertImage($Profile.avatar_url, "2048", "10000");
      isPreexistingArt = true;
```

then to put the image on the canvas:

```
    // put images on canvas
    if (appType == "avatar" || appType == "stopmotion") {
      console.log("avatar");
      let frameAmount;
      var framebuffer = new Image();
      framebuffer.src = lastImg;
      framebuffer.onload = function () {
        console.log("img", this.width);
        lastWidth = this.width;
        frameAmount = lastWidth / 2048;

        FrameObject.src = lastImg;
        FrameObject.width = lastWidth;
        frames = [];
        for (let i = 0; i < frameAmount; i++) {
          FrameObject.left = 0;
          FrameObject.width = 2048;
          FrameObject.cropX = i * 2048;
          // FrameObject.clipTo = function (ctx) {
          //   // origin is the center of the image
          //   // var x = rectangle.left - image.getWidth() / 2;
          //   // var y = rectangle.top - image.getHeight() / 2;
          //   // ctx.rect(i * -2048, 2048, (i * -2048)+2048, 2048);
          //   ctx.rect(0,-2048,2048,2048)
          // };
          // FrameObject.setCoords();
          frames.push({
            version: "4.6.0",
            objects: [{ ...FrameObject }],
          });
        }
        frames = frames;
        console.log("frames", frames);
        currentFrame = 0;
        canvas.loadFromJSON(frames[0], function () {
          canvas.renderAll.bind(canvas);
          // for (let i = 0; i < frames.length; i++) {
          //     updateFrame()
          //     changeFrame(i)

          // }
        });
      };
    }
```

```
  let FrameObject = {
    type: "image",
    version: "4.6.0",
    originX: "left",
    originY: "top",
    left: -2048,
    top: 0,
    width: 0,
    height: 2048,
    fill: "rgb(0,0,0)",
    stroke: null,
    strokeWidth: 0,
    strokeDashArray: null,
    strokeLineCap: "butt",
    strokeDashOffset: 0,
    strokeLineJoin: "miter",
    strokeUniform: false,
    strokeMiterLimit: 4,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    shadow: null,
    visible: true,
    backgroundColor: "",
    fillRule: "nonzero",
    paintFirst: "fill",
    globalCompositeOperation: "source-over",
    skewX: 0,
    skewY: 0,
    erasable: true,
    cropX: 0,
    cropY: 0,
    src: "",
    crossOrigin: "anonymous",
    filters: [],
  };
```

But here the avatar is loaded with the convertImage -> that is wrong because then the quality of the avatar get worse over time!

We need to get the image without conversion. Is that with the getFile api function?

```
export async function getFile(file_url) {
  const payload = { "url": file_url };
  let url
  const rpcid = "download_file";
  await client.rpc(Sess, rpcid, payload)
    .then((fileurl) => {
      url = fileurl.payload.url
      //console.log("url")
      //console.log(url)
      return url
    })
    .catch(() => {
      console.log('fail')
      return ''
    })
  return url
}
```

---

git log before Eelke:

commit c87da81339cdc1e1831ed05675083846a7de6727  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Sun Jul 24 22:36:10 2022 +0200

```
removed multiplayer from animalGarden because of crash when someone joint the garden
```

commit 78aa5bfdc328443a51457b83d20fc03a6709ae00  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Sun Jul 24 21:11:38 2022 +0200

```
save stopmotions when adding a frame to prevent data loss
```

commit d218d7c78aafb15a24eb63634568b3aaa9c7ff6e  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Sun Jul 24 21:07:24 2022 +0200

```
save stopmotions when adding a frame to prevent data loss
```

commit e9735a9436badaaa7cd93f68e4d7b114752a4a34  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Sun Jul 24 14:36:11 2022 +0200

```
debug animalChallenge
```

commit a1742295a72c6cd77bd2cb1211079a3bb2f21e5d  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Sun Jul 24 14:32:15 2022 +0200

```
debug animalChallenge
```

commit 323dcdd4f66158ecfdb76b5046e0d93e10aa5030  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Sun Jul 24 14:22:10 2022 +0200

```
debugging animalChallenge fixed some issues, look into rest
```

commit bb99cc08bce849f1847dbde5f67e1c9d94f8c029  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Sun Jul 24 13:26:58 2022 +0200

```
halved the artwork resolution to 1024 to save resources on poor laptops
```

commit 45667ae850d5936f6f8134f5e6c423e61b721238  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Sun Jul 24 12:35:35 2022 +0200

```
console.log behind a boolean flag via nakama.svelte and ManageSession.js
```

commit 48eb228fe47457d876f04bbcb6f85baf63e41056  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Fri Jul 22 22:14:45 2022 +0200

```
made world 5500x5500
```

commit c938bddf63c2a46968c750628a2012432412c9a8  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Fri Jul 22 22:11:53 2022 +0200

```
made world 5000x5000
```

commit bf47e052c76fd0e3eb607b83ed03698605745efb  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Fri Jul 22 22:02:42 2022 +0200

```
made world 5500x5500
```

commit 854d1188b629fa9da97171e25d325633d05de619  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Thu Jul 21 18:32:18 2022 +0200

```
changed artworld size to 8000x8000
```

commit e51a8149be35cc214b369f0aaa252706603ea140  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Thu Jul 21 18:19:37 2022 +0200

```
increased artworld size
```

commit e5f5589b05c91525465bfaf314d7b58d4fd99343  
Author: linjoe [linjoe@localhost.localdomain](mailto:linjoe@localhost.localdomain)  
Date: Thu Jul 21 17:56:12 2022 +0200

```
add username to email in register
```

commit 4785a0cb0ac7216a53cda34d61fc7274c990aeba  
Author: linjoe [linjoe@localhost.localdomain](mailto:linjoe@localhost.localdomain)  
Date: Thu Jul 21 16:30:07 2022 +0200

```
qr fix
```

commit 9e1b18f0b70862058917d71849ddfe55c3dc2985  
Author: linjoe [linjoe@localhost.localdomain](mailto:linjoe@localhost.localdomain)  
Date: Thu Jul 21 14:22:59 2022 +0200

```
qr code and history bugfix
```

commit a018c848df473dba8dfec71400da1f730a453ebc  
Author: maarten [maartenvanderglas@gmail.com](mailto:maartenvanderglas@gmail.com)  
Date: Thu Jul 21 11:53:48 2022 +0200

```
fixed gl outline bug, plugin in sloading in artworld scene, should still load in global setup
```
