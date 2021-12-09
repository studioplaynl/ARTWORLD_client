<script>
	let email = "";
	let username = "user";
	let password = "somesupersecretpassword";
	let passwordCheck = "somesupersecretpassword";
	let role = "";
	let azc = "";
	let id = "";
	let meta = {};
	export let params = {};
	import { Session, Profile, Error } from "../../session.js";
	import {
		getFullAccount,
		setFullAccount,
		updateObjectAdmin,
		deleteObjectAdmin,
		listObjects
	} from "../../api";
	import { client } from "../../nakama.svelte";
	import { onMount } from "svelte";
	import { _ } from "svelte-i18n";

	// location
	let type,
		other,
		posX,
		posY,
		name,
		value = `{"posX": 123, "posY": 123}`,
		pub = true,
		locations = ["lab", `home`, `library`, "other"];

	onMount(() => {
		if (!!params.user) {
			getFullAccount(params.user).then((account) => {
				console.log(account);
				username = account.name;
				role = account.meta.role;
				azc = account.meta.azc;
				email = account.email;
				id = account.user_id;
			});
		} else {
			getFullAccount().then((account) => {
				console.log(account);
				username = account.name;
				role = account.meta.role;
				azc = account.meta.azc;
				email = account.email;
				id = account.user_id;
			});
		}
	});

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

	async function update() {
		if (role == "admin") {
			meta = { azc: azc, role: role };
		}

		await setFullAccount(id, username, password, email, meta);
	}

	function onSubmit() {
		let promise = update();
	}

	async function addLocation() {
		if (type == "other") {
			type = other;
		}
		updateObjectAdmin(id, type, name, value, pub);
	}

	let whereList, otherWhere
	let locationsList = {objects: []}
	async function getLocations() {
		if (whereList == "other") {
			whereList = otherWhere;
		}
		otherWhere
		let limit = 100;
		locationsList = await listObjects(whereList, id, limit);
		console.log(locationsList.objects);
	}
	async function deleteObject(id, type, name) {
		deleteObjectAdmin(id, type, name);
	}



</script>

<main>
	<div class="registerForm">
		<form on:submit|preventDefault={onSubmit}>
			<div class="container">
				<h1>Update deze gebruiker</h1>

				<hr />
				<label for="username"><b>{$_("register.username")}</b></label>
				<input
					type="text"
					placeholder="Enter Username"
					name="username"
					id="username"
					bind:value={username}
					required
				/>

				<label for="email"><b>{$_("register.email")}</b></label>
				<input
					type="text"
					placeholder="Enter Email"
					name="email"
					id="email"
					bind:value={email}
				/>

				<label for="psw"><b>{$_("register.password")}</b></label>
				<input
					type="password"
					placeholder="Enter Password"
					name="psw"
					id="psw"
					bind:value={password}
					required
				/>

				<label for="psw-repeat"
					><b>{$_("register.repeatPassword")}</b></label
				>
				<input
					type="password"
					placeholder="Repeat Password"
					name="psw-repeat"
					id="psw-repeat"
					bind:value={passwordCheck}
					required
				/>

				{#if $Profile.meta.role == "admin"}
					<hr />

					<label for="Role"><b>{$_("register.role")}</b></label>
					<select name="Role" bind:value={role} required>
						<option value="speler">{$_("role.speler")}</option>
						<option value="kunstenaar">{$_("role.artist")}</option>
						<option value="moderator">{$_("role.moderator")}</option
						>
						<option value="admin">{$_("role.admin")}</option>
					</select>

					<label for="AZC"><b>{$_("register.location")}</b></label>
					<select name="AZC" bind:value={azc} required>
						<option value="null">{$_("register.none")}</option>
						{#each Locaties as locatie}
							<option value={locatie}>{locatie}</option>
						{/each}
					</select>
				{/if}
				<button type="submit" class="registerbtn">Update</button>
			</div>
		</form>
		<div>
			<h1>Add location</h1>
			<label>type</label>
			<select bind:value={type}>
				<option value="home">home</option>
				<option value="location">location</option>
				<option value="world">world</option>
				<option value="other">other</option>
			</select>
			{#if type == "other"}
				<label>other</label><input type="text" bind:value={other} />
			{/if}

			<label>Value</label><textarea bind:value />
			<label>name</label><input type="text" bind:value={name} />
			<label>Public</label><input type="checkbox" bind:checked={pub} /><br
			/>
			<button on:click={addLocation}>creeer</button>
		</div>
		<div>
			<h1>User's locations</h1>
			<select bind:value="{whereList}">
				<option value="home">home</option>
				<option value="location">location</option>
				<option value="world">world</option>
				<option value="other">other</option>
			</select>
			{#if whereList == "other"}
				<label>other</label><input type="text" bind:value={otherWhere} />
			{/if}
			<button on:click={getLocations}>Get</button>
			{#each locationsList.objects as location}
				<div
					class:blueBack={location.user_id === $Session.user_id}
					class="redBack"
				>
					<p>userID: {location.user_id}</p>
					<p>key:{location.key}</p>
					<p>
						posX: {location.value.posX}, posY: {location.value.posY}
					</p>
					<button
						on:click={async () => {
							await deleteObject(
								location.user_id,
								location.collection,
								location.key
							);
							getLocations();
						}}>delete</button
					>
				</div>
			{/each}
		</div>
	</div>
</main>

<style>
	* {
		box-sizing: border-box;
	}
	.registerForm {
		max-width: 400px;
		margin: 0 auto;
	}

	/* Add padding to containers */
	.container {
		padding: 16px;
	}

	/* Full-width input fields */
	input[type="text"],
	input[type="password"] {
		width: 100%;
		padding: 15px;
		margin: 5px 0 22px 0;
		display: inline-block;
		border: none;
		background: #f1f1f1;
	}

	input[type="text"]:focus,
	input[type="password"]:focus {
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
		background-color: #04aa6d;
		color: white;
		padding: 16px 20px;
		margin: 8px 0;
		border: none;
		cursor: pointer;
		width: 100%;
		opacity: 0.9;
	}

	.registerbtn:hover {
		opacity: 1;
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
