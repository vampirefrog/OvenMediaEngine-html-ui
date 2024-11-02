<template>
	<nav aria-label="breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><router-link to="/">Servers</router-link></li>
			<li class="breadcrumb-item" :class="{ active: $route.name == 'Server' }">
				<span v-if="$route.name == 'Server'">
					{{server?.name||server?.url||$route.params.serverUrl}}
				</span>
				<router-link v-else type="button" :to="'/'+encodeURIComponent($route.params.serverUrl)">
					{{server?.name||server?.url||$route.params.serverUrl}}
				</router-link>
				<a href="#" class="dropdown-toggle ms-1" data-bs-toggle="dropdown" aria-expanded="false"></a>
				<ul class="dropdown-menu dropdown-menu-end">
					<li v-for="(server, idx) in servers" :key="idx"><router-link class="dropdown-item" :to="'/'+encodeURIComponent(server.url)+($route.name=='VHosts'||$route.params.vhost?'/vhosts':'')+($route.params.vhost?'/'+encodeURIComponent($route.params.vhost):'')+($route.name=='Apps'||$route.params.app?'/apps':'')+($route.params.app?'/'+encodeURIComponent($route.params.app):'')+($route.name=='Pushes'?'/pushes':'')+($route.name=='Streams'||$route.params.stream?'/streams':'')+($route.params.stream?'/'+encodeURIComponent($route.params.stream):'')+($route.name=='OutputProfiles'||$route.params.outputProfile?'/outputProfiles':'')+($route.params.outputProfile?'/'+encodeURIComponent($route.params.outputProfile):'')">{{server.name||server.url}}</router-link></li>
				</ul>
			</li>
			<li class="breadcrumb-item" :class="{ active: !!$route.params.serverUrl }" v-if="$route.params.serverUrl && $route.name != 'Server'"><span v-if="$route.name == 'VHosts'">vhosts</span><router-link v-else :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts'">vhosts</router-link></li>
			<li class="breadcrumb-item" :class="{ active: !!$route.params.vhost }" v-if="$route.params.vhost"><span v-if="$route.name == 'VHost'">{{$route.params.vhost}}</span><router-link v-else :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)">{{$route.params.vhost}}</router-link></li>
			<li class="breadcrumb-item" :class="{ active: $route.name == 'Apps' }" v-if="$route.params.vhost && $route.name != 'VHost'"><span v-if="$route.name == 'Apps'">Apps</span><router-link v-else :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps'">Apps</router-link></li>
			<li class="breadcrumb-item" :class="{ active: $route.name == 'App' }" v-if="$route.params.app">
				<span v-if="$route.name == 'App'">{{$route.params.app}}</span>
				<router-link v-else :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)">{{$route.params.app}}</router-link>
				<a href="#" class="dropdown-toggle ms-1" data-bs-toggle="dropdown" aria-expanded="false"></a>
				<ul class="dropdown-menu dropdown-menu-end">
					<li v-for="app in apps"><router-link class="dropdown-item" :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent(app)+($route.name == 'Pushes' ? '/pushes' : '')+($route.name == 'Streams' || $route.name == 'Stream' ? '/streams' : '')+($route.name == 'OutputProfiles' ? '/outputProfiles' : '')+($route.params.outputProfile?'/outputProfiles/'+encodeURIComponent($route.params.outputProfile):'')">{{app}}</router-link></li>
				</ul>
			</li>
			<li class="breadcrumb-item" :class="{ active: $route.name == 'Streams' || $route.name == 'Pushes' || $route.name == 'OutputProfiles' }" v-if="$route.params.app && $route.name != 'App'">
				<span v-if="$route.name == 'Streams'">Streams</span>
				<span v-else-if="$route.name == 'Pushes'">Pushes</span>
				<span v-else-if="$route.name == 'OutputProfiles'">Output Profiles</span>
				<router-link v-else-if="$route.name == 'Stream'" :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/streams'">Streams</router-link>
				<router-link v-else-if="$route.name == 'OutputProfile'" :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/outputProfiles'">Output Profiles</router-link>
				<a href="#" class="dropdown-toggle ms-1" data-bs-toggle="dropdown" aria-expanded="false"></a>
				<ul class="dropdown-menu dropdown-menu-end">
					<li><router-link class="dropdown-item" :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/streams'">Streams</router-link></li>
					<li><router-link class="dropdown-item" :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/pushes'">Pushes</router-link></li>
					<li><router-link class="dropdown-item" :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/outputProfiles'">Output Profiles</router-link></li>
				</ul>
			</li>
			<li class="breadcrumb-item active" v-if="$route.params.stream">
				{{$route.params.stream}}
			</li>
			<li class="breadcrumb-item active" v-if="$route.params.outputProfile">
				{{$route.params.outputProfile}}
			</li>

			<li class="breadcrumb-item" v-if="loading > 0" style="--bs-breadcrumb-divider: '';">
				<div class="spinner-border spinner-border-sm" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
			</li>
		</ol>
	</nav>
</template>

<script>
export default {
	data() { return {
		loading: 0,
		error: null,
		servers: null,
		server: null,
		vhosts: null,
		apps: null,
		pushes: null,
		outputProfiles: null,
	}},
	watch: {
		'$route': function(route) {
			this.loadBreadcrumbData();
		},
	},
	mounted() {
		this.loadBreadcrumbData();
	},
	methods: {
		async loadBreadcrumbData() {
			try {
				this.loading++;
				this.servers = await this.$storage.getHosts();
				if(this.$route.params.serverUrl) {
					this.server = await this.$storage.getHostByUrl(this.$route.params.serverUrl);
					this.$api.setApiUrl(this.server.url);
					this.$api.setAccessToken(this.server.token);
				}
				if(this.$route.meta.loadVhosts)
					this.vhosts = await this.$api.get('vhosts');
				if(this.$route.meta.loadApps)
					this.apps = await this.$api.get(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps`);
			} catch(e) {
				this.error = e;
			} finally {
				this.loading--;
			}
		}
	}
}
</script>
