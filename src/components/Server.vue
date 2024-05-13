<template>
	<breadcrumbs/>
	<div class="row">
		<div class="col-8">
			<div v-if="loading>0">Loading...</div>
			<div v-else>
				<div class="alert alert-danger" v-if="error">{{error}}</div>
				<ul>
					<li>Name: {{server?.name}}</li>
					<li>URL: {{server?.url}}</li>
					<li>Version: <span class="placeholder col-1" v-if="!version"></span><span v-else>{{version?.version}}</span></li>
					<li>Git Version: <span class="placeholder col-1" v-if="!version"></span><span v-else>{{version?.gitVersion}}</span></li>
					<li><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts'">vhosts</router-link></li>
				</ul>
				<button type="button" class="btn btn-primary btn-sm me-1" @click.prevent="reloadAllCertificates()">Reload all certificates</button>
				<button type="button" class="btn btn-danger btn-sm" @click.prevent="deleteHost()">Delete</button>
			</div>
		</div>
		<div class="col-4" v-if="server">
			<div class="form form-inline">
				<div class="form-group mb-3">
					<label for="apiName" class="form-label">Name</label>
					<input type="text" class="form-control" v-model="server.name" id="apiName">
				</div>
				<div class="form-group mb-3">
					<label for="apiUrl" class="form-label">API URL</label>
					<input type="text" readonly disabled class="form-control" v-model="server.url" id="apiUrl">
				</div>
				<div class="form-group mb-3">
					<label for="apiKey" class="form-label">API Key</label>
					<div class="input-group">
						<input :type="showPassword ? 'text' : 'password'" class="form-control" v-model="server.token" id="apiKey">
						<button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">Show</button>
					</div>
				</div>
				<button type="button" class="btn btn-primary btn-justified" @click.prevent.stop="saveHost()">Save</button>
			</div>
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
		showPassword: false,
		version: null,
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
				this.version = null;
				await this.loadServers();
				this.version = await this.$api.get('version');
			} catch(e) {
				console.error('Error loading view', e);
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		async saveHost() {
			try {
				await this.$storage.updateHostByUrl(this.$route.params.serverUrl, this.server);
			} catch(e) {
				this.error = e;
			}
		},
		async deleteHost() {
			try {
				const host = this.server;
				if(!confirm(`Are you sure you want to delete ${host.name?`${host.name} (${host.url})`:host.url}?`)) return;
				await this.$storage.deleteHostByUrl(this.server.url);
				this.$router.push({ path: '/' });
			} catch(e) {
				console.error(e);
				this.error = e;
			}
		},
		async reloadAllCertificates() {
			try {
				this.loading++;
				await this.$api.post(`vhosts:reloadAllCertificates`);
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
