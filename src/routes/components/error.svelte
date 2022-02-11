<script>
    import {onMount} from "svelte"
    import {Error, Session, Succes} from "../../session.js"
    import ErrorIcon from "svelte-icons/md/MdErrorOutline.svelte"
    import SuccesIcon from "svelte-icons/md/MdDone.svelte"

    let error
    let succes
    let showMessage = false
    Error.subscribe(err => setError(err));

    function setError(err){
        error = err
        setTimeout(()=> { if(!showMessage) error = null},4000) 
    }

    Succes.subscribe((val) =>setSucces(val))

    function setSucces(val){
        if(val){
            succes = true
            setTimeout(()=> {succes = false; $Succes = false},1500) 
        }
    }

    onMount(() => {
		window.onunhandledrejection = (e) => {
            console.log(e)
            console.log(e.reason)

            console.log(typeof e.reason)
            if(typeof e.reason == 'object'){
                setError(e.reason.message || e.reason.statusText)
                if(e.reason.state == "401" || e.reason.status == "401"){
                    // relogin
                    $Session = null
                    window.location.href = "/#/login"
                    history.go(0)
                }
            }
            else {
                setError(e.reason)
            }
        }
        window.onerror = function onError(msg, file, line, col, error) {
            setError(msg)
        };
    })

    let message = () => {
        if(!showMessage){
            showMessage = true
        } else {
            showMessage = false
            error = ''
        }
        console.log("test")
    }

</script>


<div id="snackbar" class:show={succes}>
    <div class="icon green"><SuccesIcon/></div>    
</div>

<div id="snackbar" on:click="{message}" class:show={!!error}>
    <div class="icon" ><ErrorIcon/></div>
    {#if showMessage}
    <div id="errorMessage">
        {error}
    </div>
    {/if}
</div>




<style>
    #snackbar {
    /* visibility: hidden; Hidden by default. Visible on click */
    /* min-width: 250px; Set a default minimum width */
    margin-left: -125px; /* Divide value of min-width by 2 */
    background-color: #333; /* Black background color */
    color: #fff; /* White text color */
    text-align: center; /* Centered text */
    border-radius: 2px; /* Rounded borders */
    padding: 16px; /* Padding */
    position: fixed; /* Sit on top of the screen */
    z-index: 10; /* Add a z-index if needed */
    /* left: 50%; Center the snackbar
    top: 60px; 30px from the bottom */
    -webkit-transition: 0.5s all ease-in-out;
	-moz-transition: 0.5s all ease-in-out;
	-o-transition: 0.5s all ease-in-out;
	transition: 0.5s all ease-in-out;
    opacity: 0;
    pointer-events: none;
    }

    @media screen and (max-width: 600px) {
        #snackbar {
        right: 30px;
        top: 30px;
        }
    }
    @media screen and (min-width: 600px) {
        #snackbar {
        right: 30px;
        bottom: 30px;
        }
    }


    /* Show the snackbar when clicking on a button (class added with JavaScript) */
    #snackbar.show {
    visibility: visible; /* Show the snackbar */
    /* Add animation: Take 0.5 seconds to fade in and out the snackbar.
    However, delay the fade out process for 2.5 seconds */
    /* -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s; */
    /* animation: fadein 0.5s, fadeout 0.5s 2.5s; */
    opacity: 1.00;
    pointer-events: all;
    }


    /* Animations to fade the snackbar in and out */
    /* @-webkit-keyframes fadein {
    from {top: 0; opacity: 0;}
    to {top: 60px; opacity: 1;}
    } */

    .icon {
        color: red;
        width: 32px;
        height: 32px;
        float: left;
    }

    .icon.green {
        color: green;
    }
</style>