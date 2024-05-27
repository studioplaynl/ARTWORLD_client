## We get the following results from the comparison of png and jpg image formats to heic, avif and webp.

**Artworld.png** is converted to the respective image formats, and we get the following sizes
|Format|Size of image (KB)|Size respectively to the png file|
|-|:-:|-:|
|PNG|33|100%|
|HEIC|12|36%|
|AVIF|10|30%|
|WEBP|32|97%|

Based on the doodle picture from location1 **e13…ff2.jpg**
|Format|Size of image (KB)|Size respectively to the jpg file|
|-|:-:|-:|
|JPG|33|100%|
|HEIC|19|58%|
|AVIF|31|94%|
|WEBP|25|76%|

Based on **museum.png** from location1
|Format|Size of image (KB)|Size respectively to the png file|
|-|:-:|-:|
|PNG|25|100%|
|HEIC|11|44%|
|AVIF|2|8%|
|WEBP|27|108%|

## We get the following results on rendering in location1

**Heic**
https://user-images.githubusercontent.com/71214731/145584124-cbe05ea9-e995-4e2c-bfff-1a33017d28e8.png
No image is rendered.

**Avif**
https://user-images.githubusercontent.com/71214731/145584135-8b55f81d-28f0-45c9-b705-909efdfcbdd1.png
Some images get the black background color after conversion, some does not display at all.

**Webp**
https://user-images.githubusercontent.com/71214731/145584140-3ca3ee14-81d6-41ce-91a1-2f3c43f690ef.png
All images are displayed as they are supposed.

### This format can be used to be able to load an image from several alternative formats according to browser support

"this.load.image('museum', [
'museum.webp',
'museum.avif',
'museum.png'
]);"
