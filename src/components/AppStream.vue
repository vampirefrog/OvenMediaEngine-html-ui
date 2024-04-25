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
					<li v-for="(server, idx) in servers" :key="idx"><router-link class="dropdown-item" :to="'/'+encodeURIComponent(server.url)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/streams/'+encodeURIComponent($route.params.stream)">{{server.name||server.url}}</router-link></li>
				</ul>
			</li>
			<li class="breadcrumb-item"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts'">vhosts</router-link></li>
			<li class="breadcrumb-item"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)">{{$route.params.vhost}}</router-link></li>
			<li class="breadcrumb-item"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps'">Apps</router-link></li>
			<li class="breadcrumb-item"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)">{{$route.params.app}}</router-link></li>
			<li class="breadcrumb-item"><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/streams'">Streams</router-link></li>
			<li class="breadcrumb-item active" aria-current="page">
				{{$route.params.stream}}
				<div class="spinner-border spinner-border-sm" role="status" v-if="loading">
					<span class="visually-hidden">Loading...</span>
				</div>
			</li>
		</ol>
	</nav>
	<div class="alert alert-danger" v-if="error">{{error}}</div>
	<div v-if="stream">
		<div class="row">
			<div class="col-8">
				<div class="float-end">
					<div class="form-check form-switch form-check-reverse">
						<input class="form-check-input" type="checkbox" id="showStreamJson" v-model="showStreamJson">
						<label class="form-check-label" for="showStreamJson">raw</label>
					</div>
				</div>
				<h3>Stream</h3>
				<pre v-show="showStreamJson">{{stream}}</pre>
				<div v-show="!showStreamJson">
					<ul>
						<li>Created <abbr :title="stream.input.createdTime">{{$util.fromNow(stream.input.createdTime)}}</abbr></li>
						<li>Source: {{stream.input.sourceType}} from {{stream.input.sourceUrl}}</li>
						<li>Name: {{stream.name}}</li>
					</ul>
					<h3>Input tracks</h3>
					<table class="table table-sm">
						<thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Details</th></tr></thead>
						<tbody>
							<tr v-for="(t, idx) in stream.input.tracks" :key="idx">
								<td>{{t.id}}</td>
								<td>{{t.name}}</td>
								<td>{{t.type}}</td>
								<td>
									<ul v-if="t.video">
										<li>{{t.video.width}}x{{t.video.height}}@{{t.video.framerate}}fps</li>
										<li>bitrate: {{t.video.bitrate}}</li>
										<li>bypass: {{t.video.bypass}}</li>
										<li>codec: {{t.video.codec}}</li>
										<li>hasBframes: {{t.video.hasBframes}}</li>
										<li>keyFrameInterval: {{t.video.keyFrameInterval}} ({{(t.video.keyFrameInterval/t.video.framerate).toFixed(2)}}s)</li>
									</ul>
									<ul v-else-if="t.audio">
										<li>bitrate: {{t.audio.bitrate}}</li>
										<li>bypass: {{t.audio.bypass}}</li>
										<li>channel: {{t.audio.channel}}</li>
										<li>codec: {{t.audio.codec}}</li>
										<li>samplerate: {{t.audio.samplerate}}</li>
									</ul>
								</td>
							</tr>
						</tbody>
					</table>
					<div v-for="(o, idx) in stream.outputs">
						<h3>Output {{o.name}}</h3>
						<table class="table table-sm">
							<thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Details</th></tr></thead>
							<tbody>
								<tr v-for="(t, idx2) in o.tracks" :key="idx2">
									<td>{{t.id}}</td>
									<td>{{t.name}}</td>
									<td>{{t.type}}</td>
									<td>
										<ul v-if="t.video">
											<li>bypass: {{t.video.bypass}}</li>
											<li>{{t.video}}</li>
										</ul>
										<ul v-else-if="t.audio">
											<li>bypass: {{t.audio.bypass}}</li>
											<li>{{t.audio}}</li>
										</ul>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div class="col-4">
				<statistics :data="statistics"/>
			</div>
		</div>
	</div>
	<div v-else>No data</div>
</template>

<script>
import ServerBreadcrumb from './ServerBreadcrumb.vue';
import Statistics from './Statistics.vue';

export default {
	data() { return {
		error: null,
		loading: 0,
		servers: null,
		server: null,
		stream: null,
		statistics: null,
		showStreamJson: false,
	}},
	components: {
		Statistics,
		ServerBreadcrumb,
	},
	async created() {
		await this.loadView();
	},
	watch: {
		$route: async function(to, from) { this.loadView(); },
	},
	methods: {
		async loadView() {
			try {
				this.loading++;
				this.error = null;
				this.stream = null;
				this.statistics = null;
				await this.loadServers();
				this.stream = await this.$api.get(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${this.$route.params.app}/streams/${this.$route.params.stream}`);
				this.statistics = await this.$api.get(`stats/current/vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${this.$route.params.app}/streams/${this.$route.params.stream}`);
			} catch(e) {
				console.error('Error loading view', e);
				this.error = e;
			} finally {
				this.loading--;
			}
		},
	},
}
</script>
