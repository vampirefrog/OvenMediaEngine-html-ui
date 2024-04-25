<template>
	<li class="breadcrumb-item">
		<router-link type="button" :to="'/'+encodeURIComponent($route.params.serverUrl)">
			{{server?.name||server?.url||$route.params.serverUrl}}
		</router-link>
		<a href="#" class="dropdown-toggle ms-2" data-bs-toggle="dropdown" aria-expanded="false"></a>
		<ul class="dropdown-menu dropdown-menu-end">
			<li v-for="(server, idx) in servers" :key="idx"><router-link class="dropdown-item" :to="'/'+encodeURIComponent(server.url)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/streams'">{{server.name||server.url}}</router-link></li>
		</ul>
	</li>
</template>

<script>
export default {
	props: {
		serverUrl: String,
		vhost: String,
		app: String,
	},
	data() { return {
		error: null,
		server: null,
		servers: null,
	}},
	watch: {
		serverUrl: function(serverUrl) {
			this.loadServers(serverUrl);
		},
	},
	created() {
		this.loadServers(this.serverUrl);
	},
}
</script>
