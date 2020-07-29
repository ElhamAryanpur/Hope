import App from './App.svelte';
var socket = io();
window.socket = socket;

const app = new App({
	target: document.body
});

export default app;