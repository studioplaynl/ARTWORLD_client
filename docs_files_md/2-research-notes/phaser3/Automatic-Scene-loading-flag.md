```
super({ key: “AZC1_Scene”, active: true});
```

when there is a active: true flag, the scene gets loaded even when it is not the first in line.

Scenes get loaded in order of the config
scenes: [scene1, scene2, scene3]

scene1 gets loaded first, but scene2 get loaded after that when active: true, default is: active: false
