<script>
	let email = "@vrolijkheid.nl"
	let username = "user"
	let password = ''

	let passwordCheck = 'somesupersecretpassword'
	let role = 'speler'
	let azc = "BlueSail"
	let print_div;
	import QrCode from "svelte-qrcode"
	export let params = {}
    import {Session, Error} from "../../session.js"
	import {client} from "../../nakama.svelte"
	import { _ } from 'svelte-i18n'
	import { onMount } from 'svelte';

	let QRUrl

	onMount(async () => {
		genPassword()
	});

	const Locaties = [
    "GreenSquare",
    "RedStar",
    "TurquioseTriangle",
    "YellowDiamond",
	"BlueSail"
  ];

  let houses = [
		"portalBlauw.png",
		"portalDonkerBlauw.png",
		"portalGeel.png",
		"portalGifGroen.png",
		"portalGroen.png",
		"portalRood.png",
		"portalRoze.png",
		"portalZwart.png"
	]

	let house = houses[(Math.floor(houses.length*Math.random()))]

	let avatars = [
		"avatarBlauw.png",
		"avatarGeel.png",
		"avatarGroen.png",
		"avatarPaars.png",
		"avatarRood.png",
		"avatarRoze.png"
	]

	let avatar = avatars[(Math.floor(avatars.length*Math.random()))]
	
	function genPassword() {
		//removed confusing charecters like O o L and made the chance for number bigger
   	 let chars = "0123456789abcdefghijklmnpqrstuvwxyz0123456789ABCDEFGHIJKMNPQRSTUVWXYZ0123456789";
  	  let passwordLength = 9;
 		for (var i = 0; i <= passwordLength; i++) {
 	  let randomNumber = Math.floor(Math.random() * chars.length);
 		  password += chars.substring(randomNumber, randomNumber +1);
 		 }
        //document.getElementById("password").value = password;
	 }

	console.log($_ /*_("game.mainmenu.welcomeTo")*/)

	async function register() {
		const create = true;
		console.log("azc: " + azc)
		let data = {"userId": $Session.user_id, "azc": azc, "role": role, "avatar": "/avatar/stock/" + avatar, "home": "/home/stock/" + house }
		console.log(client)
		var token = client.configuration.bearerToken
		client.configuration.bearerToken = null
		const newUser = await client.authenticateEmail(email, password, create, username, data)
		.catch(err => $Error = err)
		client.configuration.bearerToken = token
		console.log(newUser)
		//alert('New user created: ' + newUser.user_id)

		print();
	}
	
	function onSubmit() {
		let promise = register();
	}



	function print(){
		QRUrl = `https://${window.location.host}/#/login/${email}/${password}`
		setTimeout(()=>{
			var print_area = window.open();
			print_area.document.title = username;
			print_area.document.write(print_div.innerHTML);
			print_area.document.close();
			print_area.focus();
			print_area.print();
			print_area.close();
		},1000)
		
	}

</script>

<main>
	<div class="registerForm">
	<form on:submit|preventDefault={onSubmit}>
		<div class="container">
		  <h1>{$_('register.title')}</h1>

		  <hr>
		  <label for="username"><b>{$_('register.username')}</b></label>
		  <input type="text" placeholder="Enter Username" name="username" id="username" bind:value={username} on:change="{()=>{email = username + "@vrolijkheid.nl"}}" required>
	  	  
		  <label for="email"><b>{$_('register.email')}</b></label>
		  <input type="text" placeholder="Enter Email" name="email" id="email" bind:value={email} required>
	  
		  <label for="psw"><b>{$_('register.password')}</b></label>
		  <input type="text" placeholder="Enter Password" name="psw" id="psw" bind:value={password} required>
	  
		  <label for="psw-repeat"><b>{$_('register.repeatPassword')}</b></label>
		  <input type="text" placeholder="Repeat Password" name="psw-repeat" id="psw-repeat" bind:value={passwordCheck} required>
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
			{#each Locaties as locatie, i}
			<option value="{locatie}">{locatie}</option>
			{/each}
			
	      </select>
		  <label for="avatar"><b>avatar</b></label>
		  <img src="{"assets/SHB/avatar/" + avatar}">
		  <label for="house"><b>House</b></label>
		  <img src="{"assets/SHB/portal/" + house}">


		  <button type="submit" class="registerbtn">Register</button>	  
		</div>
	  </form>
	  <button on:click="{print}" class="registerbtn">print userdata</button>
		  <div class="printarea" bind:this="{print_div}"> 
			<table>
			<tr> 
				<td>
					<QrCode value="{QRUrl}" />
				</td>
				<td>
					<h5>Email adress:</h5>
					<b>{email}</b>
					<h5>Password:</h5>
					<b>{password}</b>
				</td>
			</tr>	
		</table>
	  </div>

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
  background: #f1f1f1;
}

input[type=text]:focus, input[type=password]:focus {
  background-color: #ddd;
  outline: none;
}


/* Overwrite default styles of hr */
hr {
  border: 1px solid #f1f1f1;
  margin-bottom: 25px;
}

/* Set a style for the submit/register button */
.registerbtn {
  background-color: #7300EB;
  border-radius: 25px;
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

.printarea{
	display: none;
}

img {
	width:60px;
}
</style>