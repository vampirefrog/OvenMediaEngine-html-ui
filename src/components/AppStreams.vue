<template>
	<breadcrumbs/>
	<div class="alert alert-danger" v-if="error">{{error}}</div>
	<div v-if="loading>0">Loading...</div>
	<div v-else>
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
								<td class="text-end"><a href="#" class="text-danger" @click.prevent="deleteStream(p)">Delete</a></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div v-else-if="loading==0">No streams</div>
	</div>
</template>

<script>
import Breadcrumbs from './Breadcrumbs.vue';

export default {
	components: {
		Breadcrumbs,
	},
	data() { return {
		error: null,
		loading: 0,
		servers: null,
		server: null,
		showJson: false,
		streams: [],
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
				this.streams = null;
				await this.loadServers();
				this.streams = await this.$api.get(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${encodeURIComponent(this.$route.params.app)}/streams`);
			} catch(e) {
				console.error('Error loading view', e);
				this.error = e;
			} finally {
				this.loading--;
			}
		},
		async deleteStream(stream) {
			if(!confirm(`Are you sure you want to stop stream ${stream}?`)) return;
			try {
				this.loading++;
				this.streams = await this.$api.request('DELETE', `vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${encodeURIComponent(this.$route.params.app)}/streams/${encodeURIComponent(stream)}`);
			} catch(e) {
				this.error = e;
			} finally {
				this.loading--;
			}
		},
	},
}
</script>
