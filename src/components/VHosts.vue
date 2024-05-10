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
					<li v-for="(server, idx) in servers" :key="idx"><router-link class="dropdown-item" :to="'/'+encodeURIComponent(server.url)+'/vhosts/'">{{server.name||server.url}}</router-link></li>
				</ul>
			</li>
			<li class="breadcrumb-item active" aria-current="page">
				vhosts
				<div class="spinner-border spinner-border-sm" role="status" v-if="loading">
					<span class="visually-hidden">Loading...</span>
				</div>
			</li>
		</ol>
	</nav>
	<div class="alert alert-danger" v-if="error">{{error}}</div>
	<div class="row">
		<div class="col-8">
			<table class="table table-sm table-striped">
				<thead><tr><th>VHost</th><th></th><th></th></tr></thead>
				<tbody>
					<tr v-for="(vhost,idx) in vhosts" :key="idx">
						<td><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent(vhost)">{{vhost}}</router-link></td>
						<td><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent(vhost)+'/apps'">Apps</router-link></td>
						<td class="text-end"><a href="#" @click.prevent="deleteVhost(vhost)" class="text-danger">Delete</a></td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="col-4">
			<form @submit.prevent="addVhost()">
				<div class="form-group">
					<label for="vhostName" class="form-label">Name</label>
					<input class="form-control" id="vhostName" v-model="vhost.name">
				</div>
				<div class="form-group">
					<div v-for="(name, idx) in vhost.host.names" class="input-group">
						<input class="form-control" :id="`vhostHostName${idx}`" v-model="vhost.host.names[idx]">
						<button type="button" class="btn btn-danger" @click="vhost.host.names.splice(idx, 1)">X</button>
					</div>
				</div>
				<div class="form-group">
					<label for="vhostTlsCertPath">TLS Cert Path</label>
					<input class="form-control" id="vhostTlsCertPath" v-model="vhost.host.tls.certPath">
					<label for="vhostTlsChainCertPath">TLS Chain Cert Path</label>
					<input class="form-control" id="vhostTlsChainCertPath" v-model="vhost.host.tls.chainCertPath">
					<label for="vhostTlsKeyPath">TLS Key Path</label>
					<input class="form-control" id="vhostTlsKeyPath" v-model="vhost.host.tls.keyPath">
				</div>
				<div class="form-group mb-3">
					<label for="vhostSignedPolicyPolicyQueryKeyName" class="form-label">Signed Policy Query Key Name</label>
					<input class="form-control" id="vhostSignedPolicyPolicyQueryKeyName" v-model="vhost.signedPolicy.policyQueryKeyName">
				</div>
				<button class="btn btn-primary" type="button" @click="vhost.host.names.push('')">Add</button>
			</form>
		</div>
	</div>
</template>

<script>
export default {
	data() { return {
		loading: 0,
		error: null,
		server: null,
		servers: null,
		vhosts: [],
		vhost: {
			host: {
				names: [],
				tls: {
					certPath: '',
					chanCertPath: '',
					keyPath: '',
				},
			},
			signedPolicy: {
				enables: {
					providers: 'rtmp,webrtc,srt',
					publishers: 'webrtc,llhls',
				},
				policyQueryKeyName: 'policy',
				secretKey: '',
				signatureQueryKeyName: '',
			},
			admissionWebhooks: {
				controlServerUrl: '',
				enables: {
					providers: 'rtmp,webrtc,srt',
					publishers: 'webrtc,llhls',
				},
				secretKey: '',
				timeout: 3000,
			},
			origins: {
				origin: [],
			},
			originMapStore: {
				originHostName: '',
				redisServer: {
					auth: '',
					host: '',
				},
			},
		},
		providers: [ 'rtmp', 'webrtc', 'srt', ],
		publishers: [ 'webrtc', 'llhls', ],
	}},
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
				this.vhosts = null;
				await this.loadServers();
				this.vhosts = await this.$api.get('vhosts');
			} catch(e) {
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		deleteVhost(vhost) {
			if(!confirm(`Are you sure you want to delete ${vhost}?`)) return;
			this.$api.request('DELETE', `vhosts/${encodeURIComponent(vhost)}`).then(() => this.loadVhosts(), err => this.error = err);
		},
	},
};
</script>

