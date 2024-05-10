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
					<li v-for="(server, idx) in servers" :key="idx"><router-link class="dropdown-item" :to="'/'+encodeURIComponent(server.url)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps'">{{server.name||server.url}}</router-link></li>
				</ul>
			</li>
			<li class="breadcrumb-item"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts'">vhosts</router-link></li>
			<li class="breadcrumb-item"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)">{{$route.params.vhost}}</router-link></li>
			<li class="breadcrumb-item active" aria-current="page">
				Apps
				<div class="spinner-border spinner-border-sm" role="status" v-if="loading">
					<span class="visually-hidden">Loading...</span>
				</div>
			</li>
		</ol>
	</nav>
	<div class="alert alert-danger" v-if="error">{{error}}</div>
	<table v-if="apps && apps.length > 0" class="table table-sm table-striped">
		<tbody>
			<tr v-for="(app,idx) in apps" :key="idx">
				<td><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+$route.params.vhost+'/apps/'+app">{{app}}</router-link></td>
				<td><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+$route.params.vhost+'/apps/'+app+'/outputProfiles'">Output profiles</router-link></td>
				<td><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+$route.params.vhost+'/apps/'+app+'/pushes'">Pushes</router-link></td>
				<td><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+$route.params.vhost+'/apps/'+app+'/streams'">Streams</router-link></td>
				<td class="text-end"><a href="#" @click.stop.prevent="deleteApp($route.params.vhost, app)" class="text-danger">Delete</a></td>
			</tr>
		</tbody>
	</table>
	<div v-else>No apps</div>
</template>

<script>
export default {
	data() { return {
		error: null,
		loading: 0,
		server: null,
		servers: null,
		apps: [],
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
				this.apps = null;
				await this.loadServers();
				this.apps = await this.$api.get(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps`);
			} catch(e) {
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		deleteApp(vhost, app) {
			if(!confirm(`Are you sure you want to delete ${vhost}/${app}?`)) return;
			this.$api.request('DELETE', `vhosts/${encodeURIComponent(vhost)}/apps/${encodeURIComponent(app)}`).then(() => this.loadApps(), err => this.error = err);
		},
	},
};
</script>
