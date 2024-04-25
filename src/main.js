import 'bootstrap/scss/bootstrap.scss';
import * as bootstrap from 'bootstrap'

import { createApp, h } from 'vue';
import { createWebHashHistory, createRouter } from 'vue-router';
import moment from 'moment';

import OvenMediaEngineAPIClient from './OvenMediaEngineAPIClient.js';
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
		{ path: '/', component: Home },
		{ path: '/:serverUrl', component: Server },
		{ path: '/:serverUrl/vhosts', component: VHosts },
		{ path: '/:serverUrl/vhosts/:vhost', component: VHost },
		{ path: '/:serverUrl/vhosts/:vhost/apps', component: Apps },
		{ path: '/:serverUrl/vhosts/:vhost/apps/:app', component: AppComponent },
		{ path: '/:serverUrl/vhosts/:vhost/apps/:app/outputProfiles', component: AppOutputProfiles },
		{ path: '/:serverUrl/vhosts/:vhost/apps/:app/outputProfiles/:outputProfile', component: AppOutputProfile },
		{ path: '/:serverUrl/vhosts/:vhost/apps/:app/pushes', component: AppPushes },
		{ path: '/:serverUrl/vhosts/:vhost/apps/:app/streams', component: AppStreams },
		{ path: '/:serverUrl/vhosts/:vhost/apps/:app/streams/:stream', component: AppStream },
	]
});

const app = createApp({render: ()=>h(App)});
app.config.globalProperties = {
	$api: new OvenMediaEngineAPIClient(),
	$util: {
		formatBytes,
		fromNow(d) { return moment(d).fromNow(); },
	},
	async loadServers() {
		try {
			this.loading++;
			this.error = null;
			this.servers = JSON.parse(localStorage.getItem('hosts')||'[]');
			this.server = this.servers.find(s => s.url == this.$route.params.serverUrl);
			if(!this.server) throw new Error(`Server ${this.$route.params.serverUrl} not found`);
			this.$api.setApiUrl(this.server.url);
			this.$api.setAccessToken(this.server.token);
			this.vhosts = await this.$api.get('vhosts');
		} catch(e) {
			this.error = e;
		} finally {
			this.loading--;
		}
	},
};

app.use(router);

app.mount('#app');
