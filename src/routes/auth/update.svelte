<script>
	let email = ""
	let username = "user"
	let password = 'somesupersecretpassword'
	let passwordCheck = 'somesupersecretpassword'
	let role = ''
	let azc = ''
    let meta = {}
	let action = "registreren"
	export let params = {}
    import {Session,Profile, Error} from "../../session.js"
	import {getAccount} from "../../api"
	import {client} from "../../nakama.svelte"
	import { _ } from 'svelte-i18n'


	const Locaties = [
    "Amersfoort",
    "Almelo",
    "Almere",
    "Amsterdam",
    "Apeldoorn",
    "Arnhem-Zuid",
    "Baexem",
    "Budel-Cranendonck",
    "Burgum",
    "Delfzijl",
    "Den Helde",
    "Drachten",
    "Emmen",
    "Gilze en Rijen",
    "Grave",
    "Heerhugowaard",
    "Heerlen",
    "Katwijk",
    "Leersum",
    "Luttelgeest",
    "Middelburg",
    "Oisterwijk",
    "Overloon",
    "Rijswijk",
    "Ter Apel",
    "Utrecht",
  ];

	console.log($_ /*_("game.mainmenu.welcomeTo")*/)

	async function register() {
		const create = true;
		console.log("azc: " + azc)
		let data = {"userId": $Session.user_id, "azc": azc, "role": role}
		console.log(client)
		var token = client.configuration.bearerToken
		client.configuration.bearerToken = null
		const newUser = await client.authenticateEmail(email, password, create, username, data)
		.catch(err => $Error = err)
		client.configuration.bearerToken = token
		console.log(newUser)
		alert('New user created' + newUser.user_id)
	}

    async function update(){
        if(role == "admin"){
            meta = {azc: azc, role: role}
        }
        await client.updateAccount($Session, {
            username: username,
            email: email,
            password: password,
            metadata: meta
        });
    }
	
	function onSubmit() {
		let promise = update();
	}

	if(!!params.user){
		getAccount(params.user)
		.then((account) => {
			console.log(account)
			username = account.username
			role = account.metadata.role
			azc = account.metadata.azc
		})

	}else {
        username = $Profile.username
		role = $Profile.meta.role
		azc = $Profile.meta.azc

    }


</script>

<main>
	<div class="registerForm">
	<form on:submit|preventDefault={onSubmit}>
		<div class="container">
		  <h1>Update deze gebruiker</h1>

		  <hr>
		  <label for="username"><b>{$_('register.username')}</b></label>
		  <input type="text" placeholder="Enter Username" name="username" id="username" bind:value={username} required>
	  	  
		  <label for="email"><b>{$_('register.email')}</b></label>
		  <input type="text" placeholder="Enter Email" name="email" id="email" bind:value={email} required>
	  
		  <label for="psw"><b>{$_('register.password')}</b></label>
		  <input type="password" placeholder="Enter Password" name="psw" id="psw" bind:value={password} required>
	  
		  <label for="psw-repeat"><b>{$_('register.repeatPassword')}</b></label>
		  <input type="password" placeholder="Repeat Password" name="psw-repeat" id="psw-repeat" bind:value={passwordCheck} required>
		  
          {#if $Profile.meta.role == "admin"}
          <hr>

		  <label for="Role"><b>{$_('register.role')}</b></label>
		  <select name="Role" bind:value={role} required>
			<option value="speler">{$_('role.speler')}</option>
			<option value="kunstenaar">{$_('role.artist')}</option>
			<option value="moderator">{$_('role.moderator')}</option>
			<option value="admin">{$_('role.admin')}</option>
		  </select>

		  <label for="AZC"><b>{$_('register.location')}</b></label>
		  <select name="AZC" bind:value={azc} required>
			
			<option value="null">{$_('register.none')}</option>
			{#each Locaties as locatie}
			<option value="{locatie}">{locatie}</option>
			{/each}
			
	      </select>
          {/if}
		  <button type="submit" class="registerbtn">Update</button>
		</div>
	  </form>
	</div>
</main>

<style>
	* {box-sizing: border-box}
.registerForm {
	max-width: 400px;
	margin: 0 auto;
}

/* Add padding to containers */
.container {
  padding: 16px;
}

/* Full-width input fields */
input[type=text], input[type=password] {
  width: 100%;
  padding: 15px;
  margin: 5px 0 22px 0;
  display: inline-block;
  border: none;
  background: #f1f1f1;
}

input[type=text]:focus, input[type=password]:focus {
  background-color: #ddd;
  outline: none;
}

select {
	width: 100%;
    padding: 15px;
    margin: 5px 0 22px 0;
    display: inline-block;
    border: none;
    background: #f1f1f1;
}

/* Overwrite default styles of hr */
hr {
  border: 1px solid #f1f1f1;
  margin-bottom: 25px;
}

/* Set a style for the submit/register button */
.registerbtn {
  background-color: #04AA6D;
  color: white;
  padding: 16px 20px;
  margin: 8px 0;
  border: none;
  cursor: pointer;
  width: 100%;
  opacity: 0.9;
}

.registerbtn:hover {
  opacity:1;
}

/* Add a blue text color to links */
a {
  color: dodgerblue;
}

/* Set a grey background color and center the text of the "sign in" section */
.signin {
  background-color: #f1f1f1;
  text-align: center;
}
</style>