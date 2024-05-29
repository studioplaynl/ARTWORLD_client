<script>
/**
 * @file AppGroup.svelte
 * @author Maarten
 *
 *  What is this file for?
 *  ======================
 *  Displays a list of apps in the itemsBar
 *  When the user clicks on the icon of the app
 *  it opens a panel with all the works in that categorie, and
 *  allows the player to start a new work
 * 
 *  We pass on props to the appItemsbar and ArtListView component
 */

import AvatarSelector from './AvatarSelector.svelte';
import House from './HomeSelector.svelte';
import AppItemsbar from './AppItemsBar.svelte';
</script>

<div class="appsGroupContainer">

    <AvatarSelector showHistory="{true}" />
        <br />
    <House />
        <br />
    <AppItemsbar appName = 'drawing' showAddNew={true} showStatusComp={true} showDeleteComp={true} showSendTo={true} showDeletedArtContainer={true}/>
        <br />
    <AppItemsbar appName = 'stopmotion' showAddNew={true} showStatusComp={true} showDeleteComp={true} showSendTo={true} showDeletedArtContainer={true}/>
        <br />
    <AppItemsbar appName = 'animalchallenge' showAddNew={true} showStatusComp={true} showDeleteComp={true} showSendTo={true} showDeletedArtContainer={true}/>
        <br />
    <AppItemsbar appName = 'flowerchallenge' showAddNew={true} showStatusComp={true} showDeleteComp={true} showSendTo={true} showDeletedArtContainer={true}/>

</div>


<style>
.appsGroupContainer{
    padding: 4px
}
</style>
