import 'bootstrap/scss/bootstrap.scss';
import * as bootstrap from 'bootstrap'

import { createApp, h } from 'vue';
import { createWebHashHistory, createRouter } from 'vue-router';
import moment from 'moment';

import OvenMediaEngineAPIClient from './OvenMediaEngineAPIClient.js';
import LocalStorageHostList from './LocalStorageHostList.js';
import App from './App.vue';
import Statistics from './components/Statistics.vue';
import Home from './components/Home.vue';
import Server from './components/Server.vue';
import VHosts from './components/VHosts.vue';
import VHost from './components/VHost.vue';
import Apps from './components/Apps.vue';
import AppComponent from './components/App.vue';
import AppOutputProfiles from './components/AppOutputProfiles.vue';
import OutputProfile from './components/OutputProfile.vue';
import AppOutputProfile from './components/AppOutputProfile.vue';
import AppPushes from './components/AppPushes.vue';
import AppStreams from './components/AppStreams.vue';
import AppStream from './components/AppStream.vue';

function formatBytes(bytes, decimals = 2) {
	if(!bytes) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ name: 'Home',           path: '/', component: Home },
		{ name: 'Server',         path: '/:serverUrl', component: Server },
		{ name: 'VHosts',         path: '/:serverUrl/vhosts', component: VHosts, meta: { breadcrumbs: { vhosts: true } } },
		{ name: 'VHost',          path: '/:serverUrl/vhosts/:vhost', component: VHost, meta: { loadVhosts: true } },
		{ name: 'Apps',           path: '/:serverUrl/vhosts/:vhost/apps', component: Apps, meta: { loadVhosts: true } },
		{ name: 'App',            path: '/:serverUrl/vhosts/:vhost/apps/:app', component: AppComponent, meta: { loadVhosts: true, loadApps: true } },
		{ name: 'OutputProfiles', path: '/:serverUrl/vhosts/:vhost/apps/:app/outputProfiles', component: AppOutputProfiles, meta: { loadVhosts: true, loadApps: true } },
		{ name: 'OutputProfile',  path: '/:serverUrl/vhosts/:vhost/apps/:app/outputProfiles/:outputProfile', component: AppOutputProfile, meta: { loadVhosts: true, loadApps: true } },
		{ name: 'Pushes',         path: '/:serverUrl/vhosts/:vhost/apps/:app/pushes', component: AppPushes, meta: { loadVhosts: true, loadApps: true } },
		{ name: 'Streams',        path: '/:serverUrl/vhosts/:vhost/apps/:app/streams', component: AppStreams, meta: { loadVhosts: true, loadApps: true } },
		{ name: 'Stream',         path: '/:serverUrl/vhosts/:vhost/apps/:app/streams/:stream', component: AppStream, meta: { loadVhosts: true, loadApps: true } },
	],
});

const app = createApp({render: ()=>h(App)});
app.config.globalProperties = {
	$api: new OvenMediaEngineAPIClient(),
	$storage: new LocalStorageHostList(),
	$util: {
		formatBytes,
		fromNow(d) { return moment(d).fromNow(); },
	},
	async loadServers() {
		this.servers = await this.$storage.getHosts();
		if(this.$route.params.serverUrl) {
			this.server = await this.$storage.getHostByUrl(this.$route.params.serverUrl);
			this.$api.setApiUrl(this.server.url);
			this.$api.setAccessToken(this.server.token);
		}
	},
};

app.use(router);

app.mount('#app');
