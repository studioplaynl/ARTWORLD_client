<script>
	let email = "ik2@lindseyschaap.nl"
	let username = "linjoe3"
	let password = 'somesupersecretpassword'
	let passwordCheck = 'somesupersecretpassword'
    import {Session} from "../../store.js"
	import {client} from "../../nakama.svelte"


	async function register() {
		const create = true;
		const newUser = await client.authenticateEmail(email, password, create, username,{"userId": $Session.user_id});
		console.log(newUser)
		alert('New user created' + newUser.user_id)
		//localStorage.nakamaAuthToken = session.token;
		//console.info("Authenticated successfully. User id:", session.user_id);
	}


	//let promise = login();

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
	<form on:submit|preventDefault={onSubmit}>
		<div class="container">
		  <h1>Register</h1>
		  <p>Please fill in this form to create an account.</p>
		  <hr>
		  <label for="username"><b>Username</b></label>
		  <input type="text" placeholder="Enter Username" name="username" id="username" bind:value={username} required>
	  	  
		  <label for="email"><b>Email</b></label>
		  <input type="text" placeholder="Enter Email" name="email" id="email" bind:value={email} required>
	  
		  <label for="psw"><b>Password</b></label>
		  <input type="password" placeholder="Enter Password" name="psw" id="psw" bind:value={password} required>
	  
		  <label for="psw-repeat"><b>Repeat Password</b></label>
		  <input type="password" placeholder="Repeat Password" name="psw-repeat" id="psw-repeat" bind:value={passwordCheck} required>
		  <hr>
	  
		  <p>By creating an account you agree to our <a href="#">Terms & Privacy</a>.</p>
		  <button type="submit" class="registerbtn">Register</button>
		</div>
	  </form>
</main>

<style>
	* {box-sizing: border-box}

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