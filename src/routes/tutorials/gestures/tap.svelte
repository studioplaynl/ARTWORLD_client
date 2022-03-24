<script>
    import anime from 'animejs';
    export let posX
    export let posY
    export let run = true


    anime({
        targets: '#cursor',
        translateX: 250,
        rotate: '10turn',
        backgroundColor: '#FFF',
        duration: 800
    });

</script>

{#if run}
    <div>
        <img id="cursor" src="assets/svg/cursor.svg">
        <img id="hand" src="assets/svg/pointinghand.svg">
    </div>
{/if}