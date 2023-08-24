<script>
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { push } from 'svelte-spa-router';
  import { Session, Profile } from '../../session';
  import {
    isValidEmail,
    isValidPassword,
    hasSpecialCharacter,
    isEmpty,
    isEqual,
  } from '../../validations';
  import {
    getFullAccount,
    setFullAccount,
    updateObjectAdmin,
    deleteObjectAdmin,
    listObjects,
    resetPasswordAdmin,
  } from '../../helpers/nakamaHelpers';
  import { dlog } from '../../helpers/debugLog';
  import { SCENE_INFO } from '../../constants';

  export let params = {};

  let email = '';
  let username = 'user';
  let Displayname;
  let password = 'somesupersecretpassword';
  let passwordCheck = 'somesupersecretpassword';
  let role = 'speler';
  let azc = 'GreenSquare';
  let id = '';
  let meta = {};

  $: emailValid = !isEmpty(email) && isValidEmail(email);
  $: usernameValid = !isEmpty(username) && !hasSpecialCharacter(username);
  $: passwordValid = !isEmpty(password) && isValidPassword(password);
  $: passwordCheckValid = passwordValid && isEqual(password, passwordCheck);
  $: formValid = emailValid && usernameValid && passwordCheckValid;

  // location
  let type;
  let other;
  let name;
  let value = {
    posX: 123,
    posY: 123,
  };
  let pub = true;

  onMount(() => {
    if (params.user) {
      getFullAccount(params.user).then((account) => {
        dlog(account);
        username = account.name;
        role = account.meta.Role || 'speler';
        azc = account.meta.Azc;
        email = account.email;
        id = account.user_id;
        meta = account.meta;
        Displayname = account.display_name;
      });
    } else {
      getFullAccount().then((account) => {
        dlog(account);
        username = account.name;
        role = account.meta.Role || 'speler';
        azc = account.meta.Azc;
        email = account.email;
        id = account.user_id;
        Displayname = account.display_name;
      });
    }
  });

  const Locaties = SCENE_INFO.map((i) => i.scene);

  async function update() {
    // get metadata

    if ($Profile.meta.Role.toLowerCase() === 'admin') {
      meta.Azc = azc;
      meta.Role = role;
    }
    dlog('meta', meta);
    await setFullAccount(id, username, Displayname, email, meta);
  }

  async function onSubmit() {
    if (formValid) {
      update();
    }
  }

  async function addLocation() {
    if (type === 'other') {
      type = other;
    }
    updateObjectAdmin(id, type, name, value, pub);
  }

  let whereList;
  let otherWhere;
  let locationsList = [];

  async function getLocations() {
    if (whereList === 'other') {
      whereList = otherWhere;
    }
    const limit = 100;
    const objects = await listObjects(whereList, id, limit);
    locationsList = objects.objects;
    dlog(locationsList);
  }

  async function deleteObject(_id, _type, _name) {
    deleteObjectAdmin(_id, _type, _name);
  }

  async function resetPassword() {
    // if (!passwordCheckValid) return;
    resetPasswordAdmin(id, email, password);
  }
</script>

<div class="box">
  <div class="registerForm">
    <form on:submit|preventDefault="{onSubmit}">
      <div class="container">
        <h1>{$_('update.title')}</h1>

        <hr />
        <label for="username">
          <b>{$_('register.username')}</b>
        </label>
        <input
          type="text"
          placeholder="Enter Username"
          name="username"
          id="username"
          bind:value="{username}"
          class:invalid="{!usernameValid}"
          required
        />

        <label for="email">
          <b>{$_('register.email')}</b>
        </label>
        <input
          type="text"
          placeholder="Enter Email"
          name="email"
          id="email"
          bind:value="{email}"
          class:invalid="{!emailValid}"
          required
        />

        {#if $Profile.meta.Role === 'admin'}
          <hr />
          <label for="displayName">
            <b>Display name</b>
          </label>
          <input
            type="text"
            placeholder="Enter Displayname"
            name="Displayname"
            id="Displayname"
            bind:value="{Displayname}"
          />
              
          <label for="Role">
            <b>{$_('register.role')}</b>
          </label>
          <select name="Role" bind:value="{role}" required>
            <option value="speler">{$_('role.speler')}</option>
            <option value="kunstenaar">{$_('role.artist')}</option>
            <option value="moderator">{$_('role.moderator')}</option>
            <option value="admin">{$_('role.admin')}</option>
          </select>

          <label for="AZC">
            <b>{$_('register.location')}</b>
          </label>
          <select name="AZC" bind:value="{azc}" required>
            <option value="null">{$_('register.none')}</option>
            {#each Locaties as locatie}
              <option value="{locatie}">{locatie}</option>
            {/each}
          </select>
          
        {/if}
        <button type="submit" class="registerbtn" disabled="{!formValid}"
          >Update</button
        >
      </div>
    </form>
    <div class="password-form">
      <h1>Password reset</h1>
      <label for="psw">
        <b>{$_('register.password')}</b>
      </label>
      <input
        type="text"
        placeholder="Enter Password"
        name="psw"
        id="psw"
        bind:value="{password}"
        class:invalid="{!passwordValid}"
        required
      />

      <label for="psw-repeat">
        <b>{$_('register.repeatPassword')}</b>
      </label>
      <input
        type="text"
        placeholder="Repeat Password"
        name="psw-repeat"
        id="psw-repeat"
        bind:value="{passwordCheck}"
        class:invalid="{!passwordCheckValid}"
        required
      />
      <button on:click="{resetPassword}">Reset password</button>
    </div>

    <div>
      <h1>{$_('update.addLocation')}</h1>

      <label for="addLocation">type</label>
      <select id="addLocation" bind:value="{type}">
        <option value="home">home</option>
        <option value="location">location</option>
        <option value="world">world</option>
        <option value="other">other</option>
      </select>

      {#if type === 'other'}
        <label for="otherAddLocation">other</label>
        <input id="otherAddLocation" type="text" bind:value="{other}" />
      {/if}

      <label for="value">Value</label>
      <textarea id="value" bind:value="{value}"></textarea>

      <label for="name">name</label>
      <input id="name" type="text" bind:value="{name}" />

      <label for="public">Public</label>
      <input id="public" type="checkbox" bind:checked="{pub}" />

      <br />

      <button on:click="{addLocation}">creeer</button>
    </div>
    <div>
      <h1>{$_('update.userLocation')}</h1>
      <select bind:value="{whereList}">
        <option value="home">home</option>
        <option value="location">location</option>
        <option value="world">world</option>
        <option value="other">other</option>
      </select>

      {#if whereList === 'other'}
        <label for="userLocationOther">other</label>
        <input id="userLocationOther" type="text" bind:value="{otherWhere}" />
      {/if}

      <button on:click="{getLocations}">Get</button>
      {#each locationsList as location}
        <div
          class:blueBack="{location.user_id === $Session.user_id}"
          class="redBack"
        >
          <p>userID: {location.user_id}</p>
          <p>key:{location.key}</p>
          <p>
            value: {JSON.stringify(location.value)}
          </p>
          <button
            on:click="{async () => {
              await deleteObject(
                location.user_id,
                location.collection,
                location.key,
              );
              getLocations();
            }}"
          >
            delete
          </button>
          <button
            on:click="{async () => {
              // await deleteObject(
              // location.user_id,
              // location.collection,
              // location.key
              // );
              type = location.collection;
              name = location.key;
              value = JSON.stringify(location.value);

              getLocations();
            }}"
          >
            update
          </button>
        </div>
      {/each}
    </div>
  </div>

  <div
    class="app-close"
    on:click="{() => {
      push('/admin');
    }}"
  >
    <img alt="Close" src="assets/SHB/svg/AW-icon-cross.svg" />
  </div>
</div>

<style>
  * {
    box-sizing: border-box;
  }
  .registerForm {
    max-width: 400px;
    margin: 0 auto;
  }

  /* Add padding to containers */
  .container {
    padding: 16px;
  }

  /* Full-width input fields */
  input[type='text'],
  input[type='text'],
  textarea {
    width: 100%;
    padding: 15px;
    margin: 5px 0 22px 0;
    display: inline-block;
    background: #f1f1f1;
  }

  input[type='text']:focus,
  input[type='text']:focus {
    background-color: #ddd;
    outline: none;
  }

  .invalid {
    border-color: red;
  }

  select {
    width: 100%;
    padding: 15px;
    margin: 5px 0 22px 0;
    display: inline-block;
    background: #f1f1f1;
  }

  /* Overwrite default styles of hr */
  hr {
    border: 1px solid #f1f1f1;
    margin-bottom: 25px;
  }

  /* Set a style for the submit/register button */
  .registerbtn {
    background-color: #7300eb;
    border-radius: 25px;
    color: white;
    padding: 16px 20px;
    margin: 8px 0;
    border: none;
    cursor: pointer;
    width: 100%;
    opacity: 0.9;
  }

  .registerbtn:hover {
    opacity: 1;
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

  select {
    width: 100%;
    padding: 10px;
  }
</style>
