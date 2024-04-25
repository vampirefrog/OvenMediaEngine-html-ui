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
					<li v-for="(server, idx) in servers" :key="idx"><router-link class="dropdown-item" :to="'/'+encodeURIComponent(server.url)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/streams'">{{server.name||server.url}}</router-link></li>
				</ul>
			</li>
			<li class="breadcrumb-item"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)">{{$route.params.vhost}}</router-link></li>
			<li class="breadcrumb-item"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps'">Apps</router-link></li>
			<li class="breadcrumb-item"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)">{{$route.params.app}}</router-link></li>
			<li class="breadcrumb-item active" aria-current="page">
				Streams
				<div class="spinner-border spinner-border-sm" role="status" v-if="loading">
					<span class="visually-hidden">Loading...</span>
				</div>
				<a v-else href="#" @click.prevent="loadView()">&#128472;</a>
			</li>
		</ol>
	</nav>
	<div class="alert alert-danger" v-if="error">{{error}}</div>
	<div v-if="streams && streams.length > 0">
		<div class="row">
			<div class="col-8">
				<div class="float-end">
					<div class="form-check form-switch form-check-reverse">
						<input class="form-check-input" type="checkbox" id="showJson" v-model="showJson">
						<label class="form-check-label" for="showJson">raw</label>
					</div>
				</div>
				<h3>Streams</h3>
				<pre v-show="showJson">{{streams}}</pre>
				<table class="table table-sm" v-show="!showJson">
					<thead><tr><th>Stream ID</th><th></th></tr></thead>
					<tbody>
						<tr v-for="(p, idx) in streams">
							<td><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/streams/'+encodeURIComponent(p)">{{p}}</router-link></td>
							<td class="text-end"><a href="#" class="text-danger" @click.prevent="deleteStream($route.params.vhost, $route.params.app, p)">Delete</a></td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
	<div v-else-if="loading==0">No streams</div>
</template>

<script>
import ServerBreadcrumb from './ServerBreadcrumb.vue';

export default {
	data() { return {
		error: null,
		loading: 0,
		servers: null,
		server: null,
		showJson: false,
		streams: [],
	}},
	components: {
		ServerBreadcrumb,
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
				this.streams = null;
				await this.loadServers();
				this.streams = await this.$api.get(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${this.$route.params.app}/streams`);
			} catch(e) {
				console.error('Error loading view', e);
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		async deleteStream(vhost, app, stream) {
			try {
				this.loading++;
				this.streams = await this.$api.request('DELETE', `vhosts/${encodeURIComponent(vhost)}/apps/${encodeURIComponent(app)}/streams/${encodeURIComponent(stream)}`);
			} catch(e) {
				this.error = e;
			} finally {
				this.loading--;
			}
		},
	},
}
</script>
