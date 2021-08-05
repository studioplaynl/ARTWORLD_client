import App from './App.svelte';
import {Client} from "@heroiclabs/nakama-js";
import {userId, Session} from "store.js"

var client = new Client("WeEatChildrenForBreakfast", "192.168.0.133", "7350");
client.ssl = false;


async function login() {
	const create = false;
	const session = await client.authenticateEmail(email, password, create);
	console.log(session)
	localStorage.nakamaAuthToken = session.token;
	//Session.set(session.token);
	//userId.set(session.user_id)
	console.info("Authenticated successfully. User id:", session.user_id);
	
}

async function getAccount() {
	const account = await client.getAccount($Session);
	console.info(account.user.id);
	console.info(account.user.username);
	console.info(account.wallet);
}
async function register() {
	console.log('test')
	const create = true;
	const newUser = await client.authenticateEmail(email, password, create, username,{"userId": $userId});
	console.log(newUser)
	alert('New user created' + newUser.user_id)
	//localStorage.nakamaAuthToken = session.token;
	//console.info("Authenticated successfully. User id:", session.user_id);
}


const app = new App({
	target: document.body,
	props: {
		name: '',
		client: client
	}
});

export default app;