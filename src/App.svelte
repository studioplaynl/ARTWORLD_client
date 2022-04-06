<script>
    import Router from "svelte-spa-router";
    import {onMount} from "svelte"
    import { wrap } from "svelte-spa-router/wrap";
    import home from "./routes/game/index.svelte";
    import registerPage from "./routes/auth/register.svelte";

    import Users from "./routes/users.svelte";
    import login from "./routes/auth/login.svelte";
    import profile from "./routes/profile.svelte";
    import match from "./routes/match.svelte";
    import drawing from "./routes/apps/drawing.svelte";
    import { Session, Profile, logout } from "./session.js";
    import UploadAvatar from "./routes/uploadAvatar.svelte";
    import Error from "./routes/components/error.svelte";
    import Itemsbar from "./routes/components/itemsbar.svelte";
    import Menu from "./routes/components/menu.svelte";
    import Friends from "./routes/friends.svelte";
    import Admin from "./routes/admin.svelte"
    import updatePage from "./routes/auth/update.svelte"
    import mandala from "./routes/apps/mandala.svelte"
    import upload from "./routes/apps/upload.svelte"
    import MarioSequencer from "./routes/apps/marioSequencer.svelte"
    import player from "./routes/apps/player.svelte"
    import Moderate from "./routes/moderate.svelte";
    import AppLoader from "./routes/components/appLoader.svelte"
    import TopBar from "./routes/components/topbar.svelte"
    import TutLoader from "./routes/tutorials/tutLoader.svelte"
    import AchievementAnimation from "./routes/components/achievement.svelte"
    onMount(()=>{
        document.getElementById("loader").classList.add('hide');

    })

    let isLogedIn = (detail) => {
        if ($Session != null) return true;
        else {
            window.location.href = "/#/login";
            return false;
        }
    };
    let isAdmin = (detail) => {
        console.log($Profile)
        if ($Profile.meta.role == "admin") return true;
        else {
            window.location.href = "/#/";
            return false;
        }
    };
    let isModerator = (detail) => {
        console.log($Profile)
        if ($Profile.meta.role == "moderator" || $Profile.meta.role == "admin") return true;
        else {
            window.location.href = "/#/";
            return false;
        }
    };


    
</script>

<Menu />
<Itemsbar />
<AppLoader />
<TopBar />
<AchievementAnimation />
<Router
    routes={{
        "/register": wrap({
            component: registerPage,
            conditions: [
                (detail) => {
                    return isAdmin(detail);
                },
            ],
        }),
        "/update/:user?": wrap ({
            component: updatePage,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/users": wrap({
            component: Users,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/friends": wrap({
            component: Friends,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/login/:user?/:password?": login,
        "/profile/:user?": wrap({
            component: profile,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/match": wrap({
            component: match,
            conditions: [
                (detail) => {
                    return isAdmin(detail); 
                },
            ],
        }),
        // "/drawing/:user?/:name?/:version?": wrap({
        //     component: drawing,
        //     conditions: [
        //         (detail) => {
        //             return isLogedIn(detail);
        //         },
        //     ],
        // }),
        "/stopmotion/:user?/:name?/:version?": wrap({
            component: drawing,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/mandala/:user?/:name?/:version?": wrap({
            component: mandala,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/mariosound/:user?/:name?": wrap({
            component: MarioSequencer,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/avatar/:user?/:name?/:version?": wrap({
            component: drawing,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/audio/:user?/:name?/:version?": wrap({
            component: player,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/video/:user?/:name?/:version?": wrap({
            component: player,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/picture/:user?/:name?/:version?": wrap({
            component: player,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/house/:user?/:name?/:version?": wrap({
            component: drawing,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/upload/:user?/:name?": wrap({
            component: upload,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
        "/admin": wrap({
            component: Admin,
            conditions: [
                (detail) => {
                    return isAdmin(detail);
                },
            ],
        }),
        "/moderator": wrap({
            component: Moderate,
            conditions: [
                (detail) => {
                    return isModerator(detail);
                },
            ],
        }),
        "/:app?/:user?/:name?/:version?": wrap({
            component: home,
            conditions: [
                (detail) => {
                    return isLogedIn(detail);
                },
            ],
        }),
    }}
/>
<TutLoader />
<Error />

