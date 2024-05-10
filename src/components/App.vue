<template>
	<nav aria-label="breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><router-link to="/">Servers</router-link></li>
			<li class="breadcrumb-item">
				<router-link type="button" :to="'/'+encodeURIComponent($route.params.serverUrl)">
					{{server?.name||server?.url||$route.params.serverUrl}}
				</router-link>
				<a href="#" class="dropdown-toggle ms-2" data-bs-toggle="dropdown" aria-expanded="false"></a>
				<ul class="dropdown-menu dropdown-menu-end">
					<li v-for="(server, idx) in servers" :key="idx"><router-link class="dropdown-item" :to="'/'+encodeURIComponent(server.url)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)">{{server.name||server.url}}</router-link></li>
				</ul>
			</li>
			<li class="breadcrumb-item" aria-current="page"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts'">vhosts</router-link></li>
			<li class="breadcrumb-item" aria-current="page"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)">{{$route.params.vhost}}</router-link></li>
			<li class="breadcrumb-item" aria-current="page"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps'">Apps</router-link></li>
			<li class="breadcrumb-item active" aria-current="page">
				{{$route.params.app}}
				<div class="spinner-border spinner-border-sm" role="status" v-if="loading">
					<span class="visually-hidden">Loading...</span>
				</div>
			</li>
		</ol>
	</nav>
	<div class="alert alert-danger" v-if="error">{{error}}</div>
	<div class="row">
		<div class="col-8" v-if="app">
			<div class="float-end">
				<div class="form-check form-switch form-check-reverse">
					<input class="form-check-input" type="checkbox" id="showJson" v-model="showJson">
					<label class="form-check-label" for="showJson">raw</label>
				</div>
			</div>
			<h3>{{app.name}}</h3>
			<pre v-show="showJson">{{app}}</pre>
			<div v-show="!showJson">
				<ul>
					<li>Name: {{app.name}}</li>
					<li>Dynamic: {{app.dynamic}}</li>
					<li>Type: {{app.type}}</li>
					<li v-if="app.transcodeWebhook">
						Transcode webhook
						<ul>
							<li>Control server URL: {{app.transcodeWebhook.controlServerUrl}}</li>
							<li>Enable: {{app.transcodeWebhook.enable}}</li>
							<li>Secret key: ******</li>
							<li>Timeout: {{app.transcodeWebhook.timeout}}</li>
							<li>Use Local Profiles On Connection Failure: {{app.transcodeWebhook.useLocalProfilesOnConnectionFailure}}</li>
							<li>Use Local Profiles On Error Response: {{app.transcodeWebhook.useLocalProfilesOnErrorResponse}}</li>
							<li>Use Local Profiles On Server Disallow: {{app.transcodeWebhook.useLocalProfilesOnServerDisallow}}</li>
						</ul>
					</li>
					<li v-if="app.publishers">
						Publishers
						<ul>
							<li v-if="app.publishers.ovt">OVT</li>
							<li v-if="app.publishers.llhls">LLHLS</li>
							<li v-if="app.publishers.webRtc">WebRTC</li>
						</ul>
					</li>
					<li v-if="app.providers">
						Providers
						<ul>
							<li v-if="app.providers.rtmp">RTMP</li>
							<li v-if="app.providers.webRtc">WebRTC</li>
							<li v-if="app.providers.srt">SRT</li>
							<li v-if="app.providers.rstpPull">RTSPPull</li>
							<li v-if="app.providers.ovt">OVT</li>
							<li v-if="app.providers.mpegts">MPEGTS</li>
						</ul>
					</li>
					<li><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/pushes'">Pushes</router-link></li>
					<li><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/streams'">Streams</router-link></li>
					<li><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/outputProfiles'">Output profiles</router-link>: <span v-for="(p, idx) in app?.outputProfiles?.outputProfile"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/outputProfiles/'+encodeURIComponent(p.name)">{{p.name}}</router-link></span></li>
					<li><a href="#" @click.prevent="deleteApp()" class="text-danger">Delete</a></li>
				</ul>
			</div>
		</div>
		<div class="col-4">
			<statistics :data="statistics"/>
		</div>
	</div>
</template>

<script>
import Statistics from './Statistics.vue';

export default {
	data() { return {
		error: null,
		loading: 0,
		servers: null,
		server: null,
		showJson: false,
		app: null,
		statistics: null,
	}},
	components: {
		Statistics,
	},
	async created() {
		await this.loadView();
	},
	watch: {
		$route: async function(to, from) { await this.loadView(); },
	},
	methods: {
		async loadView() {
			try {
				this.loading++;
				this.error = null;
				this.app = null;
				this.statistics = null;
				await this.loadServers();
				this.app = await this.$api.get(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${encodeURIComponent(this.$route.params.app)}`);
				this.statistics = await this.$api.get(`stats/current/vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${encodeURIComponent(this.$route.params.app)}`);
			} catch(e) {
				console.error(e);
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		async deleteApp() {
			try {
				this.loading++;
				this.error = null;
				if(!confirm(`Are you sure you want to delete ${this.$route.params.app}?`)) return;
				await this.$api.request('DELETE', `vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${encodeURIComponent(this.$route.params.app)}`);
				this.$router.push({ path: `/${encodeURIComponent(this.$route.params.serverUrl)}/vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps`});
			} catch(e) {
				console.error(e);
				this.error = e;
			} finally {
				this.loading--;
			}
		},
	},
};
</script>
