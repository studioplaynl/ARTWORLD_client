<script>
  import Router from "svelte-spa-router";
  import {wrap} from 'svelte-spa-router/wrap'
  import home from "./routes/game/index.svelte";
  import registerPage from "./routes/auth/register.svelte";
  import login from "./routes/auth/login.svelte";
  import profile from "./routes/profile.svelte";
  import match from "./routes/match.svelte";
  import drawing from "./routes/apps/drawing.svelte"
  import { Session, Profile, logout } from "./session.js";
  import UploadAvatar from "./routes/uploadAvatar.svelte";
  import Error from "./routes/components/error.svelte"
  import Menu from "./routes/components/menu.svelte"

  

let isLogedIn = (detail) => {
				if($Session != null) return true;
				else {
					window.location.href = "/#/login"
					return false;
				}
			}


</script>

<Menu/>

<Router
  routes={{
    "/": wrap({
        component: home,
        conditions: [
            (detail) => {
				if($Session != null) return true;
				else {
					window.location.href = "/#/login"
					return false;
				}
			}
        ]
    }),
    "/register": wrap({
        component: registerPage,
        conditions: [
            (detail) => {
				return isLogedIn(detail)
			}
        ]
    }),
    "/login": login,
    "/profile/:user?": wrap({
        component: profile,
        conditions: [
            (detail) => {
				return isLogedIn(detail)
			}
        ]
    }),
    "/match": wrap({
        component: match,
        conditions: [
            (detail) => {
				return isLogedIn(detail)
			}
        ]
    }),
    "/drawing/:user?/:name?": wrap({
        component: drawing,
        conditions: [
            (detail) => {
				return isLogedIn(detail)
			}
        ]
    }),
    "/stopmotion/:user?/:name?": wrap({
        component: drawing,
        conditions: [
            (detail) => {
				return isLogedIn(detail)
			}
        ]
    }),
    "/avatar/:user?/:name?": wrap({
        component: drawing,
        conditions: [
            (detail) => {
				return isLogedIn(detail)
			}
        ]
    }),
  }}
/>
<Error/>
