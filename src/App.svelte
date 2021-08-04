
<script>
	import Router from 'svelte-spa-router';
	import home from './routes/index.svelte';
	import register from './routes/auth/register.svelte'
	import login from './routes/auth/login.svelte'
	import profile from './routes/profile.svelte'
	import upload from './routes/upload.svelte'
	import match from './routes/match.svelte'
    import { Session, Profile, logout} from "./store.js"
	import UploadAvatar from './routes/uploadAvatar.svelte';
	
	let role
	if($Profile == null){
		role = null
	} else {
		role = $Profile.meta.role
	}
	//console.log($Profile.meta.role) 
	let DropdownMenu = () => {
		document.getElementById("DropdownMenu").classList.toggle("show");
	}


</script>

<nav>
	<div class='nav'>
		<div class='left'>
			<a href='/#/'>Home</a>
			<a href='/#/profile'>Profile</a>
			<a href='/#/upload'>upload</a>
			<a href='/#/match'>match</a>
		</div>
		<div class='right'>
			{#if role == 'admin'}
			<div on:click={DropdownMenu} class="dropdown">
				<a>Admin</a>
				<div id="DropdownMenu" class="dropdown-content">
					<a href='/#/register'>Create new user</a>
					<a href='/#/group'>Create new group</a>
				</div>
			</div>
			{/if}

			{#if $Session == null}
			<a href='/#/login'>Login</a>
			{:else}
			<a on:click={logout} href='/'>Logout</a>
			{/if}
		</div>
	</div>
</nav>

<style>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 160px;
  overflow: auto;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.dropdown-content a:hover {background-color: #ddd;}



</style>


<Router routes={{
	'/': home,
	'/register': register,
	'/login': login,
	'/profile': profile,
	'/upload': upload,
	'/match': match,
	'/uploadAvatar': UploadAvatar
}} />