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
					<li v-for="(server, idx) in servers" :key="idx"><router-link class="dropdown-item" :to="'/'+encodeURIComponent(server.url)+'/vhosts/'+encodeURIComponent($route.params.vhost)">{{server.name||server.url}}</router-link></li>
				</ul>
			</li>
			<li class="breadcrumb-item"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts'">vhosts</router-link></li>
			<li class="breadcrumb-item active" aria-current="page">
				{{$route.params.vhost}}
				<div class="spinner-border spinner-border-sm" role="status" v-if="loading">
					<span class="visually-hidden">Loading...</span>
				</div>
			</li>
		</ol>
	</nav>
	<div class="alert alert-danger" v-if="error">{{error}}</div>
	<div class="row">
		<div class="col-8">
			<ul>
				<li>Name: <span v-if="vhost">{{vhost.name}}</span><span v-else class="placeholder col-7"></span></li>
				<li>Cross domains: <code v-if="vhost" v-for="(name, idx) in vhost.crossDomains" :idx="idx">{{name}}</code><span v-else class="placeholder col-7"></span></li>
				<li v-if="vhost?.host">Host names: <code v-for="(name, idx) in vhost.host.names" :idx="idx">{{name}}</code></li>
				<li v-if="vhost?.host?.tls">TLS certificate: <code>{{vhost.host.tls.certPath}}</code></li>
				<li v-if="vhost?.host?.tls">TLS chain: <code>{{vhost.host.tls.chainCertPath}}</code></li>
				<li v-if="vhost?.host?.tls">TLS key: <code>{{vhost.host.tls.keyPath}}</code></li>
				<li v-if="vhost?.admissionWebhooks">
					Admission Webhooks
					<ul>
						<li>Control server URL: {{vhost?.admissionWebhooks?.controlServerUrl}}</li>
						<li>Secret key: ***</li>
						<li>Enables providers: {{vhost?.admissionWebhooks?.enables?.providers}}</li>
						<li>Enables publishers: {{vhost?.admissionWebhooks?.enables?.publishers}}</li>
						<li>Timeout: {{vhost?.admissionWebhooks?.timeOut}}</li>
					</ul>
				</li>
				<li>Cross-domains: <code>{{vhost?.crossDomains.join(', ')}}</code></li>
				<li>Distribution: {{vhost?.distribution}}</li>
				<li><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps'">Apps</router-link></li>
				<li><a class="text-danger" href="#" @click="deleteVhost($route.params.vhost)">Delete</a></li>
			</ul>
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
		server: null,
		servers: null,
		vhost: null,
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
				this.vhost = null;
				this.statistics = null;
				await this.loadServers();
				this.vhost = await this.$api.get(`vhosts/${encodeURIComponent(this.$route.params.vhost)}`);
				this.statistics = await this.$api.get(`stats/current/vhosts/${encodeURIComponent(this.$route.params.vhost)}`);
			} catch(e) {
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		deleteVhost(vhost) {
			this.$api.request('DELETE', `vhosts/${encodeURIComponent(vhost)}`).then(() => this.loadVhosts(), err => this.error = err);
		},
	},
};
</script>