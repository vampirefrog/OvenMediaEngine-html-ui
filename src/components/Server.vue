<template>
	<nav aria-label="breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><router-link to="/">Servers</router-link></li>
			<li class="breadcrumb-item">
				{{server?.name||server?.url||$route.params.serverUrl}}
				<a href="#" class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></a>
				<ul class="dropdown-menu dropdown-menu-end">
					<li v-for="(server, idx) in servers" :key="idx"><router-link class="dropdown-item" :to="'/'+encodeURIComponent(server.url)">{{server.name||server.url}}</router-link></li>
				</ul>
			</li>
		</ol>
	</nav>
	<div class="row">
		<div class="col-8">
			<div class="alert alert-danger" v-if="error">{{error}}</div>
			<ul>
				<li>Name: {{server?.name}}</li>
				<li>URL: {{server?.url}}</li>
				<li>Version: {{version?.version}}</li>
				<li>Git Version: {{version?.gitVersion}}</li>
				<li><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts'">vhosts</router-link></li>
			</ul>
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
export default {
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
		saveHost() {
			try {
				const servers = JSON.parse(localStorage.getItem('hosts')||'[]');
				const idx = servers.findIndex(s => s.url == this.$route.params.serverUrl);
				if(idx < 0) throw new Error(`Server ${this.$route.params.serverUrl} not found`);
				servers[idx].name = this.server.name;
				servers[idx].token = this.server.token;
				localStorage.setItem('hosts', JSON.stringify(servers));
			} catch(e) {
				this.error = e;
			}
		},
	},
};
</script>

