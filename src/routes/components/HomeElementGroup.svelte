<script>
    import { createEventDispatcher } from 'svelte';
    import ArtworkLoader from './ArtworkLoader.svelte';
    import { homeElement_Selected, HomeElements } from '../../storage';

    const dispatch = createEventDispatcher();
    
    export let group;

    function handleDelete(element) {
        if ($homeElement_Selected?.key === element.key) {
            homeElement_Selected.set(null);
        }
        HomeElements.delete(element.key);
        dispatch('deleteHomeElementPhaser', element);
        dispatch('elementDeleted', element);
    }

    function handleDuplicate(element) {
        const posX = element.value.posX + 10;
        const posY = element.value.posY + 10;
        const value = {
            collection: element.value.collection,
            key: element.value.key,
            displayName: element.value.displayName,
            previewUrl: element.value.previewUrl,
            url: element.value.url,
            version: element.value.version,
            posX,
            posY,
            rotation: 0,
            scale: 1,
            width: 512,
            height: 512
        };
        HomeElements.create(value.key, value);
    }

    function handleArtClick(event) {
        console.log('handleArtClick', event.detail);
        homeElement_Selected.set(event.detail);
    }

    $: isSelected = (element) => {
        if (!$homeElement_Selected) return false;
        return $homeElement_Selected.key === element.key;
    };
</script>

<div class="element-group">
    <!-- Unique element (group leader) -->
    <button type="button" class="unique-element" class:selected={isSelected(group[0])}
         on:click={() => handleArtClick({detail: group[0]})}>
        <ArtworkLoader 
            artClickable={false} 
            row={group[0]} 
            deleteIcon={true}
            duplicateIcon={true}
            previewSize={50} 
            on:deleteArtworkInContext={() => handleDelete(group[0])} 
            on:artClicked={() => handleArtClick({detail: group[0]})}
            on:duplicateArtworkInContext={() => handleDuplicate(group[0])}
        />
    </button>

    <!-- Duplicates -->
    {#if group.length > 1}
        {#each group.slice(1) as duplicate}
            <button type="button" class="duplicate-element" class:selected={isSelected(duplicate)}
                 on:click={() => handleArtClick({detail: duplicate})}>
                <ArtworkLoader 
                    artClickable={false} 
                    row={duplicate} 
                    deleteIcon={true}
                    duplicateIcon={true}
                    previewSize={50} 
                    on:deleteArtworkInContext={() => handleDelete(duplicate)} 
                    on:artClicked={() => handleArtClick({detail: duplicate})}
                    on:duplicateArtworkInContext={() => handleDuplicate(duplicate)}
                />
            </button>
        {/each}
    {/if}
</div>

<style>
    .element-group {
        margin: 10px 0;
    }

    .unique-element {
        border-left: 3px solid #7300ed;
        padding-left: 5px;
        cursor: pointer;
    }

    .duplicate-element {
        margin-left: 20px;
        padding-left: 5px;
        border-left: 1px solid #7300ed;
        cursor: pointer;
    }

    .selected {
        background-color: rgba(115, 0, 237, 0.1);
        border-radius: 5px;
    }

    .unique-element.selected,
    .duplicate-element.selected {
        border: 2px solid #7300ed;
        padding: 5px;
        margin: 5px;
    }

    button {
        background-color: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
    }
</style> 