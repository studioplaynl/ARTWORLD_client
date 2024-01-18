---
title: "Log: bug Fix - players are lost when switching location"
date: "2023-01-10"
---

Player are visible when first coming online (when the game is fresh). but when going to a new location players are lost.

Reason: when switching locations they are not logged in to a stream

* * *

```
 switchScene(targetScene, targetHouse) {
    PlayerLocation.set({
      house: targetHouse,
      scene: targetScene,
    });
  }
```

What is the reactiveness on PlayerLocation?

* * *

**The problem is fixed**

in sceneSwitcher the switchScene function was missing doSwitchScene() at the end

in the sceneSwitcher, added a function to switch nakama streams, with call back and used that function in 3 places. This fixed the home button bug where going back home didn't leave and join a stream as it should

* * *

The sceneSwitcher is so reactive that it is firing twice in some cases, seems that then calling the function directly is not needed: find out when this happens

The multiple firing of switching scene only happens when using the home (goto artworld in the middle) button.

I think this is fixed: check
