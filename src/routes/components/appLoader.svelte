<script>
  import { get } from 'svelte/store';
  import { pop, push } from 'svelte-spa-router';
  import DrawingApp from '../apps/drawing.svelte';
  import { CurrentApp } from '../../session';
  import ManageSession from '../game/ManageSession';
  import { getAccount } from '../../api';
  import { isValidApp, DEFAULT_APP } from '../apps/apps';
  import { playerHistory } from '../game/playerState';
  import { DEFAULT_SCENE } from '../../constants';

  import AppContainer from './appContainer.svelte';

  async function closeApp() {
    if ($CurrentApp === 'avatar') {
      getAccount(ManageSession.userProfile.id);
    }
    if (get(playerHistory).length > 1) {
      pop();
      playerHistory.pop();
    } else {
      push(`/${DEFAULT_APP}?location=${DEFAULT_SCENE}`);
    }
  }
</script>

<AppContainer
  open="{$CurrentApp !== null &&
    $CurrentApp !== DEFAULT_APP &&
    isValidApp($CurrentApp)}"
  on:close="{closeApp}"
>
  <DrawingApp bind:appType="{$CurrentApp}" />
</AppContainer>
