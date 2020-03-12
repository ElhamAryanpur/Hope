import App from './App.svelte';
var socket = io();

const app = new App({
	target: document.body,
	props: {
		socket: socket
	}
});

export default app;