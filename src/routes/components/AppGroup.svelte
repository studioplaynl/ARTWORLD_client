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
 *  We pass on props to the AppItem and ArtListView component
 */

import AvatarSelector from './AvatarSelector.svelte';
import HomeSelector from './HomeSelector.svelte';
import AppItem from './AppItem.svelte';

export let showAvatarSelector = false;
export let showHomeSelector = false;

//show or hide components in ArtListView
export let showAddNew = false;
export let showVisibilityToggle = false;
export let showDeleteButton = false;
export let showSendTo = false;
export let showDeletedArtContainer = false;
export let showPlaceHomeElement = false;
export let artClickable = true;

</script>

<div class="appsGroupContainer">

    {#if showAvatarSelector}
    <AvatarSelector showHistory="{true}" />
        <br />
    {/if}
    
    {#if showHomeSelector}
    <HomeSelector />
        <br />
    {/if}

    <AppItem 
    appName = 'drawing' 
    showAddNew={showAddNew} 
    showVisibilityToggle={showVisibilityToggle} 
    showDeleteButton={showDeleteButton} 
    showSendTo={showSendTo} 
    showDeletedArtContainer={showDeletedArtContainer} 
    showPlaceHomeElement={showPlaceHomeElement} 
    artClickable={artClickable}/>
        <br />
    <AppItem appName = 'stopmotion' 
    showAddNew={showAddNew} 
    showVisibilityToggle={showVisibilityToggle} 
    showDeleteButton={showDeleteButton} 
    showSendTo={showSendTo} 
    showDeletedArtContainer={showDeletedArtContainer} 
    showPlaceHomeElement={showPlaceHomeElement} 
    artClickable={artClickable}/>
        <br />
    <AppItem appName = 'animalchallenge' 
    showAddNew={showAddNew} 
    showVisibilityToggle={showVisibilityToggle} 
    showDeleteButton={showDeleteButton} 
    showSendTo={showSendTo} 
    showDeletedArtContainer={showDeletedArtContainer} 
    showPlaceHomeElement={showPlaceHomeElement} 
    artClickable={artClickable}/>
        <br /> 
    <AppItem appName = 'flowerchallenge' 
    showAddNew={showAddNew} 
    showVisibilityToggle={showVisibilityToggle} 
    showDeleteButton={showDeleteButton} 
    showSendTo={showSendTo} 
    showDeletedArtContainer={showDeletedArtContainer} 
    showPlaceHomeElement={showPlaceHomeElement} 
    artClickable={artClickable}/>

</div>


<style>
.appsGroupContainer{
    padding: 4px
}
</style>
