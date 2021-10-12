<script>
	let email = "@vrolijkheid.nl"
	let username = "user"
	let password = 'somesupersecretpassword'
	let passwordCheck = 'somesupersecretpassword'
	let role = 'speler'
	let azc = ''
    import {Session, Error} from "../../session.js"
	import {client} from "../../nakama.svelte"
	import { _ } from 'svelte-i18n'

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
	

	function handleClick() {
		promise = register();
	}
	function onSubmit() {
		console.log('test')
		console.log(email)
		let promise = register();
	}

</script>

<main>
	<div class="registerForm">
	<form on:submit|preventDefault={onSubmit}>
		<div class="container">
		  <h1>{$_('register.title')}</h1>

		  <hr>
		  <label for="username"><b>{$_('register.username')}</b></label>
		  <input type="text" placeholder="Enter Username" name="username" id="username" bind:value={username} required>
	  	  
		  <label for="email"><b>{$_('register.email')}</b></label>
		  <input type="text" placeholder="Enter Email" name="email" id="email" bind:value={email} required>
	  
		  <label for="psw"><b>{$_('register.password')}</b></label>
		  <input type="password" placeholder="Enter Password" name="psw" id="psw" bind:value={password} required>
	  
		  <label for="psw-repeat"><b>{$_('register.repeatPassword')}</b></label>
		  <input type="password" placeholder="Repeat Password" name="psw-repeat" id="psw-repeat" bind:value={passwordCheck} required>
		  <hr>

		  <label for="Role"><b>{$_('register.role')}</b></label>
		  <select name="Role" bind:value={role} required>
			<option value="speler">{$_('role.player')}</option>
			<option value="kunstenaar">{$_('role.artist')}</option>
			<option value="moderator">{$_('role.moderator')}</option>
			<option value="admin">{$_('role.admin')}</option>
		  </select>

		  <label for="AZC"><b>{$_('register.location')}</b></label>
		  <select name="AZC" bind:value={azc} required>
			<option value="null">{$_('register.none')}</option>
			<option value="Amersfoort">Amersfoort</option>
			<option value="Almelo">Almelo</option>
			<option value="Almere">Almere</option>
			<option value="Amsterdam">Amsterdam</option>
			<option value="Apeldoorn">Apeldoorn</option>
			<option value="Apeldoorn">Apeldoorn</option>
			<option value="Arnhem-Zuid">Arnhem-Zuid</option>
			<option value="Baexem">Baexem</option>
			<option value="Budel-Cranendonck">Budel-Cranendonck</option>
			<option value="Burgum">Burgum</option>
			<option value="Delfzijl">Delfzijl</option>
			<option value="Den Helder">Den Helder</option>
			<option value="Drachten">Drachten</option>
			<option value="Emmen">Emmen</option>
			<option value="Gilze en Rijen">Gilze en Rijen</option>
			<option value="Grave">Grave</option>
			<option value="Heerhugowaard">Heerhugowaard</option>
			<option value="Heerlen">Heerlen</option>
			<option value="Katwijk">Katwijk</option>
			<option value="Leersum">Leersum</option>
			<option value="Luttelgeest">Luttelgeest</option>
			<option value="Middelburg">Middelburg</option>
			<option value="Oisterwijk">Oisterwijk</option>
			<option value="Overloon">Overloon</option>
			<option value="Rijswijk">Rijswijk</option>
			<option value="Ter Apel">Ter Apel</option>
			<option value="Utrecht">Utrecht</option>
	      </select>

		  <button type="submit" class="registerbtn">Register</button>
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