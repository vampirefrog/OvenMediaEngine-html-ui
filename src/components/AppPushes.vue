<template>
	<breadcrumbs/>
	<div class="row">
		<div class="col-8">
			<div class="alert alert-danger" v-if="error">{{error}}</div>
			<div v-if="loading>0">Loading...</div>
			<div v-else-if="pushes">
				<div class="float-end">
					<div class="form-check form-switch form-check-reverse">
						<input class="form-check-input" type="checkbox" id="showJson" v-model="showJson">
						<label class="form-check-label" for="showJson">raw</label>
					</div>
				</div>
				<h3>Pushes</h3>
				<pre v-show="showJson">{{pushes}}</pre>
				<table class="table table-sm" v-show="!showJson">
					<thead><tr><th>URL</th><th></th></tr></thead>
					<tbody>
						<tr v-for="(p, idx) in pushes">
							<td>{{p.id}}<br />{{p.state}} {{p.protocol}} <router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/streams/'+encodeURIComponent(p.stream.name)">{{p.stream.name}}</router-link><br />{{p.url}}<br /><code>{{prettyBytes(p.sentBytes)}}/{{readableTime(p.sentTime)}} sent, {{prettyBytes(p.totalsentBytes)}}/{{readableTime(p.totalsentTime)}} total, {{prettyBytes(p.totalsentBytes/p.totalsentTime*1000)}}/s average</code></td>
							<td>

							</td>
							<td class="text-end"><a href="#" @click.prevent="stopPush(p.id)" class="text-danger">Stop</a></td>
						</tr>
					</tbody>
				</table>
			</div>
			<div v-else>No pushes</div>
		</div>
		<div class="col-4">
			<form action="" @submit.prevent.stop="startPush()">
				<div class="form-group mb-3">
					<label for="pushId">ID</label>
					<input type="text" class="form-control" v-model="push.id" id="pushId">
				</div>
				<div class="form-group mb-3">
					<label for="pushStreamName">Stream</label>
					<select class="form-select" v-model="push.streamName" id="pushStreamName">
						<option v-for="(p, idx) in outputProfiles" :key="idx" :value="p">{{p}}</option>
					</select>
				</div>
				<div class="form-group mb-3" v-if="outputProfile">
					<div class="form-check form-check-inline" v-for="(v, idx) in outputProfile.encodes.audios" :key="idx">
						<input class="form-check-input" type="checkbox" :value="v.name" :id="'pushStreamAudioVariant_'+v.name">
						<label class="form-check-label" :for="'pushStreamAudioVariant_'+v.name">{{v.name}}</label>
					</div>
					<div class="form-check form-check-inline" v-for="(v, idx) in outputProfile.encodes.videos" :key="idx">
						<input class="form-check-input" type="checkbox" :value="v.name" :id="'pushStreamAudioVariant_'+v.name">
						<label class="form-check-label" :for="'pushStreamAudioVariant_'+v.name">{{v.name}}</label>
					</div>
				</div>
				<div class="form-group mb-3">
					<label for="pushUrl">URL</label>
					<input type="text" class="form-control" v-model="push.url" id="pushUrl">
				</div>
				<div class="form-group mb-3">
					<label for="pushProtocol">Protocol</label><br />
					<div class="form-check form-check-inline">
						<input class="form-check-input" type="radio" id="pushProtocolRtmp" value="rtmp" v-model="push.protocol">
						<label class="form-check-label" for="pushProtocolRtmp">RTMP</label>
					</div>
					<div class="form-check form-check-inline">
						<input class="form-check-input" type="radio" id="pushProtocolSrt" value="srt" v-model="push.protocol">
						<label class="form-check-label" for="pushProtocolSrt">SRT</label>
					</div>
				</div>
				<div class="form-group mb-3">
					<label for="pushStreamKey">Stream key</label>
					<input type="text" class="form-control" v-model="push.streamKey" id="pushStreamKey">
				</div>
				<label>&nbsp;</label><br />
				<button type="submit" class="btn btn-primary">Start push</button>
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
		servers: null,
		server: null,
		showJson: false,
		autoRefresh: false,
		pushes: [],
		outputProfiles: [],
		outputProfile: null,
		push: {
			protocol: 'rmtp',
			streamKey: '',
			id: '',
			streamName: '',
			url: 'rtmp://',
		},
	}},
	async created() {
		await this.loadView();
	},
	unmounted() {
		if(this.refreshInterval) clearInterval(this.refreshInterval);
	},
	watch: {
		$route: async function(to, from) { await this.loadView(); },
		'push.streamName': function(value) { this.$api.get(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${encodeURIComponent(this.$route.params.app)}/outputProfiles/${encodeURIComponent(value)}`).then(profile => this.outputProfile = profile, err => this.error = err) },
		autoRefresh: function(value) { if(value) this.refreshInterval = setInterval(() => this.reloadPushes(), 2000); else if(this.refreshInterval) clearInterval(this.refreshInterval); },
	},
	methods: {
		async loadView() {
			try {
				this.loading++;
				this.error = null;
				this.pushes = null;
				this.outputProfiles = null;
				await this.loadServers();
				this.pushes = await this.$api.post(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${this.$route.params.app}:pushes`);
				this.outputProfiles = await this.$api.get(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${this.$route.params.app}/outputProfiles`);
				if(!this.push.streamName && this.outputProfiles.length > 0) this.push.streamName = this.outputProfiles[0];
			} catch(e) {
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		async reloadPushes() {
			try {
				this.loading++;
				this.error = null;
				this.pushes = await this.$api.post(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${this.$route.params.app}:pushes`);
			} catch(e) {
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		async stopPush(id) {
			if(!confirm(`Are you sure you want to stop push ${id}?`)) return;
			try {
				this.loading++;
				await this.$api.post(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${encodeURIComponent(this.$route.params.app)}:stopPush`, { id });
				await this.reloadPushes();
			} catch(e) {
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		startPush() {
			console.log('push', this.push);
		},
		prettyBytes(num) {
			// jacked from: https://github.com/sindresorhus/pretty-bytes
			if (typeof num !== 'number' || isNaN(num)) {
				return '-';
			}

			var exponent;
			var unit;
			var neg = num < 0;
			var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

			if (neg) {
				num = -num;
			}

			if (num < 1) {
				return (neg ? '-' : '') + num + ' B';
			}

			exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
			num = (num / Math.pow(1000, exponent)).toFixed(2) * 1;
			unit = units[exponent];

			return (neg ? '-' : '') + num + ' ' + unit;
		},
		readableTime(ms) {
			const
				s = Math.floor(ms / 1000),
				seconds = s % 60,
				minutes = Math.floor(s / 60) % 60,
				hours = Math.floor(s / 60 / 60 ) % 60,
				days = Math.floor(s / 60 / 60 / 24);

			return `${days ? `${days}d,` : ''}${days||hours ? `${this.padInt(hours)}:` : ''}${days||hours||minutes ? `${this.padInt(minutes)}:` : ''}${this.padInt(seconds)}`;
		},
		padInt(i) { return i > 10 ? i : `0${i}`; },
	},
}
</script>
