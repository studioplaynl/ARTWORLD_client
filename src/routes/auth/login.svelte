<script>
    import {Session, login, Error} from "../../session.js"
	import { _ } from 'svelte-i18n'
  import {onMount} from 'svelte'
  export let params;

    console.log($Session)
	let email
	let password

	async function onSubmit() {
  
		  let promise = await login(email, password)

	}

  onMount(()=>{
    email = params.user || "user1@vrolijkheid.nl"
	  password = params.password || 'somesupersecretpassword'
    console.log(params)
    if(!!$Session){
      window.location.href = "/#/"
    }
  })

</script>

<main>
  <div class="registerForm">
	<form on:submit|preventDefault={onSubmit}>
		<div class="container">

		  <label for="email"><b>{$_('register.email')}</b></label>
		  <input type="text" placeholder="Enter Email" name="email" id="email" bind:value={email} required>
	  
		  <label for="psw"><b>{$_('register.password')}</b></label>
		  <input type="password" placeholder="Enter Password" name="psw" id="psw" bind:value={password} required>
	  
		  <button type="submit" class="registerbtn">{$_('login.login')}</button>
		</div>
	
	  </form>
  </div>
</main>

<style>
  main {
    background: linear-gradient(90deg, white 29px, transparent 0%) center, linear-gradient(white 29px, transparent 0%) center, #7300ED;
    background-size: 30px 30px;
  }

	* {box-sizing: border-box}
  .registerForm {
    max-width: 400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-around;
    flex-direction: column;
    height: 100vh;
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
</style>