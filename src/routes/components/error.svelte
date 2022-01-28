<script>
    import {onMount} from "svelte"
    import {Error, Session} from "../../session.js"

    let error
    let showMessage = false
    Error.subscribe(err => {
        error = err
        setTimeout(()=> {$Error = null},5000)
    });

    onMount(() => {
		window.onunhandledrejection = (e) => {
            console.log(e)
            console.log(e.reason)

            console.log(typeof e.reason)
            if(typeof e.reason == 'object'){
                $Error = e.reason.message || e.reason.statusText
                if(e.reason.state == "401" || e.reason.status == "401"){
                    // relogin
                    $Session = null
                    window.location.href = "/#/login"
                    location.reload();
                }
            }
            else {
                $Error = e.reason
            }
        }
        window.onerror = function onError(msg, file, line, col, error) {
            $Error = msg
        };
    })

</script>

<div id="snackbar" class:show={!!error}>
    <p>Oeps... er ging iets mis</p>
    <button on:click="{()=>{ showMessage = !showMessage}}">Show error</button>
    <a on:click="{()=> {$Error = null}}">X</a>
    {#if showMessage}
    <div id="errorMessage">
        {error}
    </div>
    {/if}
</div>


<style>
    #snackbar {
    visibility: hidden; /* Hidden by default. Visible on click */
    min-width: 250px; /* Set a default minimum width */
    margin-left: -125px; /* Divide value of min-width by 2 */
    background-color: #333; /* Black background color */
    color: #fff; /* White text color */
    text-align: center; /* Centered text */
    border-radius: 2px; /* Rounded borders */
    padding: 16px; /* Padding */
    position: fixed; /* Sit on top of the screen */
    z-index: 1; /* Add a z-index if needed */
    left: 50%; /* Center the snackbar */
    top: 60px; /* 30px from the bottom */
    }

    #errorMessage{
    }

    /* Show the snackbar when clicking on a button (class added with JavaScript) */
    #snackbar.show {
    visibility: visible; /* Show the snackbar */
    /* Add animation: Take 0.5 seconds to fade in and out the snackbar.
    However, delay the fade out process for 2.5 seconds */
    -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
    animation: fadein 0.5s, fadeout 0.5s 2.5s;
    }

    /* Animations to fade the snackbar in and out */
    @-webkit-keyframes fadein {
    from {top: 0; opacity: 0;}
    to {top: 60px; opacity: 1;}
    }

    @keyframes fadein {
    from {top: 0; opacity: 0;}
    to {top: 60px; opacity: 1;}
    }

    @-webkit-keyframes fadeout {
    from {top: 60px; opacity: 1;}
    to {top: 0; opacity: 0;}
    }

    @keyframes fadeout {
    from {top: 60px; opacity: 1;}
    to {top: 0; opacity: 0;}
    }
</style>