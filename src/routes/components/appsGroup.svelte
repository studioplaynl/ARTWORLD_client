<script>
/**
 * @file appsGroup.svelte
 * @author Maarten
 *
 *  What is this file for?
 *  ======================
 *  Displays a list of apps in the itemsBar
 *  When the user clicks on the icon of the app
 *  it opens a panel with all the works in that categorie, and
 *  allows the player to start a new work
 */

import Avatar from './avatar.svelte';
import House from './house.svelte';
import AppItemsbar from './appItemsbar.svelte';
</script>

<div class="appsGroupContainer">

    <Avatar showHistory="{true}" />
        <br />
    <House />
        <br />
    <AppItemsbar appName = 'drawing' />
        <br />
    <AppItemsbar appName = 'stopmotion' />
        <br />
    <AppItemsbar appName = 'animalchallenge' />
        <br />
    <AppItemsbar appName = 'flowerchallenge' />

</div>


<style>
.appsGroupContainer{
    padding: 4px
}
</style>
