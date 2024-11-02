<template>
	<breadcrumbs/>
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
					<div class="row">
						<div class="col">
							<ul>
								<li>Created <abbr :title="stream.input.createdTime">{{$util.fromNow(stream.input.createdTime)}}</abbr></li>
								<li>Source: {{stream.input.sourceType}} from {{stream.input.sourceUrl}}</li>
								<li>Name: {{stream.name}}</li>
								<li>LLHLS: <a :href="llhlsUrl">{{llhlsUrl}}</a></li>
							</ul>
							<button type="button" class="btn btn-sm btn-danger" @click.prevent="deleteStream()">Delete</button>
						</div>
						<div class="col">
							<hls-player ref="player" :source="llhlsUrl" @hlsManifestLoading="videoLoading=true" @hlsInitPtsFound="videoLoading=false" @muted="muted=true" @unmuted="muted=false" @pause="playing = false" @play="playing = true"></hls-player>
						</div>
					</div>
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
				<a class="float-end" target="_blank" href="https://airensoft.gitbook.io/ovenmediaengine/rest-api/v1/virtualhost/application/stream#get-v1-vhosts-vhost-apps-app-streams-stream">Documentation for <code>GET /v1/vhosts/{vhost}/apps/{app}/streams/{stream}</code></a>
			</div>
			<div class="col-4">
				<statistics :data="statistics"/>
			</div>
		</div>
	</div>
	<div v-else>No data</div>
</template>

<script>
import Statistics from './Statistics.vue';
import HlsPlayer from './HlsPlayer.vue';
import Breadcrumbs from './Breadcrumbs.vue';

export default {
	data() { return {
		error: null,
		loading: 0,
		servers: null,
		server: null,
		stream: null,
		statistics: null,
		showStreamJson: false,
		llhlsUrl: null,
	}},
	components: {
		Statistics,
		HlsPlayer,
		Breadcrumbs,
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
				this.llhlsUrl = `${this.$route.params.serverUrl}/${encodeURIComponent(this.$route.params.app)}/${encodeURIComponent(this.$route.params.stream)}/llhls.m3u8`;
				this.statistics = await this.$api.get(`stats/current/vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${this.$route.params.app}/streams/${this.$route.params.stream}`);
			} catch(e) {
				console.error('Error loading view', e);
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		async deleteStream(stream) {
			if(!confirm(`Are you sure you want to stop stream ${this.$route.params.stream}?`)) return;
			try {
				this.loading++;
				this.streams = await this.$api.request('DELETE', `vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${encodeURIComponent(this.$route.params.app)}/streams/${encodeURIComponent(this.$route.params.stream)}`);
			} catch(e) {
				this.error = e;
			} finally {
				this.loading--;
			}
		},
	},
}
</script>
