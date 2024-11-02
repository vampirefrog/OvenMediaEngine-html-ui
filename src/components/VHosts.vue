<template>
	<breadcrumbs/>
	<div class="alert alert-danger" v-if="error">{{error}}</div>
	<div class="row">
		<div class="col-8">
			<div v-if="loading>0">Loading...</div>
			<table v-else class="table table-sm table-striped">
				<thead><tr><th>VHost</th><th></th><th></th></tr></thead>
				<tbody>
					<tr v-for="(vhost,idx) in vhosts" :key="idx">
						<td><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent(vhost)">{{vhost}}</router-link></td>
						<td><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent(vhost)+'/apps'">Apps</router-link></td>
						<td class="text-end"><a href="#" @click.prevent="reloadCertificate(vhost)">Reload certificate</a></td>
						<td class="text-end"><a href="#" @click.prevent="deleteVhost(vhost)" class="text-danger">Delete</a></td>
					</tr>
					<tr v-if="!vhosts?.length">
						<td colspan="4" class="text-center"><i>No vhosts</i></td>
					</tr>
				</tbody>
			</table>
			<a target="_blank" href="https://airensoft.gitbook.io/ovenmediaengine/rest-api/v1/virtualhost#get-v1-vhosts">Documentation for <code>GET /v1/vhosts</code></a>
		</div>
		<div class="col-4">
			<form @submit.prevent="addVhost()">
				<div class="form-group mb-2">
					<label for="vhostName" class="form-label">Name</label>
					<input class="form-control" id="vhostName" v-model="vhost.name" required>
				</div>
				<div class="form-group mb-2">
					<a href="#" @click.prevent="vhost.host.names.push('')" class="float-end">Add name</a>
					<label for="vhostNames0" class="form-label">Host Names</label>
					<div v-for="(name, idx) in vhost.host.names" class="input-group mb-1">
						<input class="form-control" :id="`vhostHostName${idx}`" v-model="vhost.host.names[idx]">
						<button type="button" class="btn btn-danger" @click="vhost.host.names.splice(idx, 1)">X</button>
					</div>
				</div>
				<div class="form-group mb-2">
					<label for="vhostTlsCertPath">TLS Cert Path</label>
					<input class="form-control" id="vhostTlsCertPath" v-model="vhost.host.tls.certPath">
				</div>
				<div class="form-group mb-2">
					<label for="vhostTlsChainCertPath">TLS Chain Cert Path</label>
					<input class="form-control" id="vhostTlsChainCertPath" v-model="vhost.host.tls.chainCertPath">
				</div>
				<div class="form-group mb-2">
					<label for="vhostTlsKeyPath">TLS Key Path</label>
					<input class="form-control" id="vhostTlsKeyPath" v-model="vhost.host.tls.keyPath">
				</div>
				<div class="form-group mb-3">
					<label for="vhostSignedPolicyPolicyQueryKeyName" class="form-label">Signed Policy Query Key Name</label>
					<input class="form-control" id="vhostSignedPolicyPolicyQueryKeyName" v-model="vhost.signedPolicy.policyQueryKeyName">
				</div>
				<button class="btn btn-primary" type="submit">Add</button>
				<a class="float-end" target="_blank" href="https://airensoft.gitbook.io/ovenmediaengine/rest-api/v1/virtualhost#post-v1-vhosts">Documentation for <code>POST /v1/vhosts</code></a>
			</form>
		</div>
	</div>
</template>

<script>
import Breadcrumbs from './Breadcrumbs.vue';

export default {
	components: {
		Breadcrumbs,
	},
	data() { return {
		loading: 0,
		error: null,
		server: null,
		servers: null,
		vhosts: [],
		vhost: {
			name: 'vhost',
			host: {
				names: ['*'],
				tls: {
					certPath: '',
					chainCertPath: '',
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
			// admissionWebhooks: {
			// 	controlServerUrl: 'http://localhost:8080',
			// 	enables: {
			// 		providers: 'rtmp,webrtc,srt',
			// 		publishers: 'webrtc,llhls',
			// 	},
			// 	secretKey: '',
			// 	timeout: 3000,
			// },
			origins: {
				origin: [],
			},
			// originMapStore: {
			// 	originHostName: '',
			// 	redisServer: {
			// 		auth: '',
			// 		host: '',
			// 	},
			// },
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
		async loadVhosts() {
			this.vhosts = await this.$api.get('vhosts');
		},
		async loadView() {
			try {
				this.loading++;
				this.error = null;
				this.vhosts = null;
				await this.loadServers();
				await this.loadVhosts();
			} catch(e) {
				console.error(e);
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		async addVhost() {
			try {
				this.loading++;
				this.error = null;
				await this.$api.post(`vhosts`, [ this.vhost ]);
				await this.loadVhosts();
			} catch(e) {
				console.error(e);
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		async deleteVhost(vhost) {
			try {
				this.loading++;
				this.error = null;
				if(!confirm(`Are you sure you want to delete ${vhost}?`)) return;
				await this.$api.request('DELETE', `vhosts/${encodeURIComponent(vhost)}`);
				await this.loadVhosts();
			} catch(e) {
				console.log(e);
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		async reloadCertificate(vhost) {
			try {
				this.loading++;
				await this.$api.post(`vhosts/${encodeURIComponent(vhost)}:reloadCertificate`);
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

