---
title: "Log: feature - place visitor next to house"
date: "2023-01-10"
---

current user -> profile:

1. _{id: 'f011a5dc-901a-42c0-9589-587b389d1e3e', username: 'user11', avatar\_url: 'avatar/f011a5dc-901a-42c0-9589-587b389d1e3e/0\_2023-01-03T21\_08\_17\_WitKaaiman.png', lang\_tag: 'en', metadata: '{"Azc": "GreenSquare", "PosX": -1635, "PosY": 749,…eAnimalGarden", "TotalPlayTime": 398437367465947}', …}_
    1. **avatar\_url**: "avatar/f011a5dc-901a-42c0-9589-587b389d1e3e/0\_2023-01-03T21\_08\_17\_WitKaaiman.png"
    
    3. **create\_time**: "2022-05-11T12:18:13Z"
    
    5. **edge\_count**: 2
    
    7. **id**: "f011a5dc-901a-42c0-9589-587b389d1e3e"
    
    9. **lang\_tag**: "en"
    
    11. **meta**:
        1. **Azc**: "GreenSquare"
        
        3. **Location**: "ChallengeAnimalGarden"
        
        5. **PosX**: -1635
        
        7. **PosY**: 749
        
        9. **Role**: "speler"
        
        11. **TotalPlayTime**: 398437367465947
        
        13. **User\_id**: ""
        
        15. \[\[Prototype\]\]: Object
    
    13. **metadata**: "{\\"Azc\\": \\"GreenSquare\\", \\"PosX\\": -1635, \\"PosY\\": 749, \\"Role\\": \\"speler\\", \\"User\_id\\": \\"\\", \\"Location\\": \\"ChallengeAnimalGarden\\", \\"TotalPlayTime\\": 398437367465947}"
    
    15. **update\_time**: "2023-01-09T14:39:58Z"
    
    17. **url**: "https://d1p8yo0yov6nht.cloudfront.net/fit-in/1800x150/filters:format(png)/avatar/f011a5dc-901a-42c0-9589-587b389d1e3e/0\_2023-01-03T21\_08\_17\_WitKaaiman.png?signature=67efc42a243ded09f3acde439217b6d4abf81f6f71694dd4bfd4dd23b4e8a547"
    
    19. **username**: "user11"

* * *

'Other' user: nakama object house with user id

$SelectedOnlinePlayer => in svelte store in session.js

$SelectedOnlinePlayer.meta.Azc = 'Greensquare'  
$SelectedOnlinePlayer.meta.PosX = 10  
$SelectedOnlinePlayer.meta.PosY = -30

In selectedOnlinePlayerBar.svelte

* * *

**Cases where we click on a house and want to be taken next to house**

1. itemsBar currentPlayer, left, house icon

3. itemsBar selectedOnlinePlayer, house icon

* * *

Case 1: current player

itemsbar.svelte

```
     <button
        on:click="{() => {
          goHome();
        }}"
        class="avatar"
      >
        <img src="{$myHome.url}" alt="My Home" />
      </button>
```

```
  async function goHome(id) {
    if (typeof id === 'string') {
      SceneSwitcher.switchScene('DefaultUserHome', id);
    } else if ($ShowItemsBar) {
      SceneSwitcher.switchScene(
        'DefaultUserHome',
        ManageSession.userProfile.id,
      );
    }
  }
```

We can switch to the scene where the home is (Profile.meta.Azc), we can get the PosX and PosY of the home by querying the Home object, then pass

```
push(`/?location=${SCENE}&x=0&y=0`);
```

Home Object is being loaded in the beginning as **userHouseObject**

```
userHouseObject = {
    "collection": "home",
    "key": "GreenSquare",
    "permission_read": 2,
    "permission_write": 1,
    "value": {
        "url": "house/f011a5dc-901a-42c0-9589-587b389d1e3e/0_2023-01-03T21_08_34_BlauwChirurgVis.png",
        "posX": -1085.2499376200167,
        "posY": 84.58334073217338,
        "version": 2,
        "username": "user11"
    },
    "version": "c812e30ac619377abdf4522374739a7f",
    "user_id": "f011a5dc-901a-42c0-9589-587b389d1e3e",
    "create_time": "2022-08-07T09:20:32Z",
    "update_time": "2023-01-03T21:09:04Z"
} 
```

* * *

There is a bug in switching user from location to location that has to be fixed first

https://artworlddev.maartenvanderglas.com/?p=180

This bug has been fixed. Switching Scenes is maybe a bit 'too reactive' still in some cases
