<script>
import itemsBar from "./itemsbar.js"

//export let itemsbar = {}

export let click = true


function getLiked(){
    console.log(itemsBar.liked)
    console.log(itemsBar.addressbook)
    console.log(itemsBar.home)
}

</script>


<div id="itemsbar" class:show={!!click} on:click="{getLiked}">

</div>


<style>
    #itemsbar {
        background-color: white;
        color: #fff;
        text-align: center;
        border-radius: 10px;
        border: 2px solid #7300ED;
        padding: 16px;
        position: fixed;
        z-index: 10;
        -webkit-transition: 0.5s all ease-in-out;
        -moz-transition: 0.5s all ease-in-out;
        -o-transition: 0.5s all ease-in-out;
        transition: 0.5s all ease-in-out;
        opacity: 0;
        pointer-events: none;
    }

    @media screen and (max-width: 600px) {
        #itemsbar {
        left: 30px;
        bottom: 30px;
        }
    }
    @media screen and (min-width: 600px) {
        #itemsbar {
        left: 30px;
        bottom: 30px;
        }
    }


    /* Show the snackbar when clicking on a button (class added with JavaScript) */
    #itemsbar.show {
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
