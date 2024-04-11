<script>
	export let showModal; // boolean

	let dialog; // HTMLDialogElement

	$: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<slot name="header" />
		<hr />
		<slot name="dialogText"/>
	
		<!-- svelte-ignore a11y-autofocus -->
        <div class="button-container">
            <button class="closeButton" autofocus on:click={() => dialog.close()}>
                <img
                    src="/assets/SHB/svg/AW-icon-previous.svg"
                    alt="go back"
                    />
            </button>
        <button>
            <slot name="actionButton"></slot>
        </button>
        </div>
	</div>
</dialog>

<style>
	dialog {
		max-width: 32em;
		border-radius: 0.2em;
		border: none;
		padding: 0;
        position: relative;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		width: 9rem;
        height: 9rem;
        border-radius: 50%;
        padding: 12px;
        box-shadow: 5px 5px 0px #7300eb;
        transition: box-shadow 0.3s ease, transform 0.3s ease; /* smooth transition */
	}
    button:hover {
        box-shadow: 7px 7px 0px #7300eb; /* larger shadow on hover */
    }

    button:active {
        background-color: white;
        box-shadow: 3px 3px 0px #7300eb; /* smaller shadow on mouse down */
        transform: translate(2px, 2px); /* move button slightly on mouse down */
    }

    .button-container {
        display: flex;
        justify-content: space-between;
    }
</style>
