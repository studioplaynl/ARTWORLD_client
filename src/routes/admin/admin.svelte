<script>
  import { push } from 'svelte-spa-router';

  /** eslint-disable max-len */
  import SvelteTable from 'svelte-table';
  import {
    ListAllUsers,
    listAllObjects,
    updateObjectAdmin,
  } from '../../helpers/nakamaHelpers';
  import { dlog } from '../../helpers/debugLog';
  import { SCENE_INFO } from '../../constants';

  // const groups = [];
  let users = [];
  const drawingIcon =
    // eslint-disable-next-line max-len
    '<svg class="icon" viewBox="0 0 576 512"><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z" /></svg>';

  ListAllUsers().then((list) => {
    // dlog('listallusers: ', list);
    // user list is in the format of:
    // {
    // email: ""
    // meta: {User_id: '', Location: 'home', PosX: 930, PosY: 918, Role: 'speler', …}
    // name: "artworld1"
    // user_id: "4bd9378d-8b5b-4ea3-b683-6c3324792afe"
    // }
    list.shift();
    list.forEach((user) => {
      // eslint-disable-next-line no-param-reassign
      if (!user.meta.Azc) user.meta.Azc = 'Unknown';
      if (user.meta.azc || user.meta.role) {
        dlog('Incorrect Profile formatting!!! ', user);
      }

      // dlog('user.user_id: ', user.user_id);
      Promise.all([listAllObjects('home', user.user_id)]).then((rec) => {
        if (rec[0].length === 0) {
          dlog('user does not have home object!', user);
        }
        // dlog('rec[0]: ', rec[0]);
        rec[0].forEach((homeObject) => {
          // dlog('homeObject: ', homeObject.username, homeObject.key, homeObject.permission_read);
          if (homeObject.permission_read === 1) {
            dlog('homeObject 1: ', homeObject);
            // collection: "home"
            // key: "SlimeWorld"
            // permission_read: 1
            // read: 1
            // update_time: "2023-02-02T14:45:55.667385+01:00"
            // user_id: "e856c876-b9cb-4bcc-bc46-f30d7363c801"
            // username: "user440"
            // value:
            //     posX: -726.666637791529
            //     posY: 1609.9999360243505
            //     url: "/home/stock/portalBlauw.png"
            //     username: "user440"

            // test with one user
            // then with 2 in a loop
            // if (homeObject.username === 'user442' || homeObject.username === 'user443') {
            // updateObjectAdmin(id, type, name, value, pub);
            const pub = true;
            // dlog(homeObject.user_id, homeObject.collection, homeObject.key, homeObject.value, pub);
            // dlog('....');
            // dlog('homeObject: ', homeObject);
            Promise.all([
              updateObjectAdmin(
                homeObject.user_id,
                'home',
                homeObject.key,
                homeObject.value,
                pub,
              ),
            ]);
            // }
          }
          if (homeObject.permission_read === 2) {
            // if (homeObject.username === 'user442' || homeObject.username === 'user443') {
            // dlog('homeObject 2: ', homeObject);
            // }
          }

          // key: "RobotWorld"
          // permission_read: 1
          // read: 1
          // update_time: "2022-12-21T20:13:54.488073+01:00"
          // user_id: "91a9d3d6-8bc0-4757-985d-de9ba725cc00"
          // username: "user348"
        });
      });

      // if (user.meta.Azc && user.meta.Role) dlog('Correct Profile formatting: ', user);
    });
    // dlog(list);
    users = list;
    // console.log(users);
  });

  // location house
  // edit user
  // create user

  const Locaties = SCENE_INFO.map((i) => i.scene);
  const roles = ['admin', 'speler', 'kunstenaar', 'moderator'];
  // const groupColumns = [];
  const userColumns = [
    {
      key: 'Username',
      title: 'Username',
      value: (v) => `<a >${v.name}<a>`, // href="/#/profile/${v.user_id}"
      sortable: true,
      searchValue: (v) => v.name,
    },
    // {
    //   key: 'User ID',
    //   title: 'User ID',
    //   value: (v) => v.user_id,
    //   sortable: true,
    //   searchValue: (v) => v.user_id,
    // },
    {
      key: 'Locatie',
      title: 'Huis locatie',
      value: (v) => v.meta.Azc,
      sortable: true,
      filterOptions: Locaties,
    },
    {
      key: 'Last location',
      title: 'Laatste locatie',
      value: (v) => v.meta.Location,
    },
    {
      key: 'rol',
      title: 'Rol',
      value: (v) => v.meta.Role,
      filterOptions: roles,
    },
    {
      key: 'Edit',
      title: 'Edit',
      value: (v) => ` <a href="/#/update/${v.user_id}">${drawingIcon}</a>`,
    },
  ];
</script>

<div class="box">
  <h1>All Users</h1>
  <a href="/#/register"><button>Add new user</button></a>
  <a href="/#/printSheet"><button>Print QR Code Sheet</button></a>
  <SvelteTable
    columns="{userColumns}"
    rows="{users}"
    classNameTable="profileTable"
  />

  <!-- <h1>All Groeps</h1>
  <a href="/#/group"><button>Add new group</button></a>
  <SvelteTable
    columns="{groupColumns}"
    rows="{groups}"
    classNameTable="profileTable"
  /> -->
  <div
    class="app-close"
    on:click="{() => {
      push('/');
    }}"
  >
    <img alt="Close" src="assets/SHB/svg/AW-icon-cross.svg" />
  </div>
</div>

<style>
  * {
    box-sizing: border-box;
  }

  h1 {
    display: inline;
  }

  button {
    float: right;
    margin: 5px;
  }

  .app-close {
    position: absolute;
    right: 15px;
    top: 15px;
    z-index: 13;
    box-shadow: 5px 5px 0px #7300ed;
    cursor: pointer;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }

  .app-close > img {
    width: 40px;
  }

  @media only screen and (max-width: 640px) {
    .app-close {
      top: unset;
      bottom: 120px;
    }
  }
</style>
