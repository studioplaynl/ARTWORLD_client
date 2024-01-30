---
title: "BugFix: Aanpassen ‘touch targets’ werelden [fixed]"
date: "2023-08-10"
---

this.location. width & height => de width & height van het originele plaatje  
this.location.displayWidth => de width hoe het getoond wordt  
scaleX en scaleY zetten de displayHeight correct

de hitTarget wordt ook automatisch goed gezet, behalve bij de icoBox, die wordt daarom gecorrigeerd.

\=================================================================

const hitAreaWidth = this.location.width;  
const hitAreaheight = this.location.height;  
if (hitAreaWidth !== hitAreaheight) {  
// Coordinates are relative from the top-left, so we want out hit area to be  
// an extra 60 pixels around the texture, so -30 from the x/y and + 60 to the texture width and height

```
  // extend the isobox hitarea
  this.location.input.hitArea.setTo(
    -hitAreaWidth / 3,
    -hitAreaWidth / 1.3,
    hitAreaWidth * 1.4,
    hitAreaWidth * 1.5,
  );
}
```

\=================================================================

this.location.body height en width is de target tussen andere physics bodies

\=================================================================  

naambordjes correct plaatsen \[done\]

* * *

this.location.displayWidth: 300  
this.location.width: 1141  
width: 300  
this.location.height: 629

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2023/08/Screenshot-from-2023-08-10-15-16-08.png)

* * *

this.location.displayWidth: 200  
this.location.width: 720  
width: 200  
this.location.height: 720

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2023/08/Screenshot-from-2023-08-10-15-17-30.png)

* * *

this.location.displayWidth: 200.00000000000003  
this.location.width: 699  
width: 200  
this.location.height: 860

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2023/08/Screenshot-from-2023-08-10-15-18-33.png)

* * *

this.location.displayWidth: 200  
this.location.width: 482  
width: 200  
this.location.height: 755

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2023/08/Screenshot-from-2023-08-10-15-20-55.png)

* * *

this.location.displayWidth: 200  
this.location.width: 200  
width: 200  
this.location.height: 142.85714285714286

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2023/08/Screenshot-from-2023-08-10-15-19-46.png)
