---
title: "Feature: user can change name"
date: "2023-08-15"
---

user\_name cannot be changed, but display\_name can

User can change display\_name once, if there is a mistake admin or moderator can change it to "", then the user can set it's display\_name again

* * *

display\_name shown in:

- itemsBar > profile.svelte

- in the game: the home discriptor

- in the selectedOnlinePlayerItemsBar

- in the friends list

* * *

## Update account

[https://heroiclabs.com/docs/nakama/concepts/user-accounts/](https://heroiclabs.com/docs/nakama/concepts/user-accounts/)

When a user is registered most of their profile is setup with default values. A user can update their own profile to change fields but cannot change any other user’s profile.

CLIENT

<table><tbody><tr><td><code>1 2 3 4 5</code></td><td><code><strong>await</strong> client<strong>.</strong>updateAccount<strong>(</strong>session<strong>,</strong> <strong>{</strong> display_name<strong>:</strong> "My new name"<strong>,</strong> avatar_url<strong>:</strong> "http://graph.facebook.com/avatar_url"<strong>,</strong> location<strong>:</strong> "San Francisco" <strong>});</strong></code></td></tr></tbody></table>

* * *

Example code:

```
export async function setAvatar(avatar_url) {
  const session = get(Session);
  await client.updateAccount(session, {
    avatar_url,
  });
  const Image = await convertImage(
    avatar_url,
    DEFAULT_PREVIEW_HEIGHT,
    DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
    'png',
  );
  // Profile.update((n) => { n.url = Image; return n });
  getAccount();
  Success.set(true);
  setLoader(false);
  return Image;
}
```

Try code:

```
export async function setDisplayName(display_name) {
  const session = get(Session);
  await client.updateAccount(session, {
    display_name,
  });
  
  getAccount();
  Success.set(true);
  setLoader(false);
}
```

Location of the code: profile.svelte

I implemented if account.display\_name is empty string, then the user can set the display\_name.

If a user has set a display\_name, the display\_name cannot be changed.

* * *

nakamaHelpers.js > getAllHouses includes user\_displayname

* * *

friends.svelte addFriend also with display\_name -> not possible without rewriting the search function, so the search is removed for now

* * *

getAccount(id) krijgt nu meta en metadata terug, is dat nieuw? Voorheen was het altijd meta....

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2023/08/Screenshot-from-2023-08-28-14-52-49.png)

* * *

**friends.svelte friends are listed with display\_name or username**

```
  const columns = [
    {
      key: 'status',
      title: '',
      value: (v) => {
        if (v.user.online) {
          return '<div class="online"/>';
        }
        return '<div class="offline"/>';
      },
    },
    {
      key: 'avatar',
      title: '',
      renderComponent: {
        component: ArtworkLoader,
        props: {},
      },
    },
    {
      key: 'Username',
      title: 'Username',
      value: (v) => `<p class="link">${v.user.display_name || v.user.username}<p>`,
      sortable: true,
    },
    {
      key: 'action',
      title: '',
      renderComponent: {
        component: FriendAction,
        props: {
          load,
        },
      },
    },
  ];
```

* * *
