<template>
	<breadcrumbs/>
	<div class="alert alert-danger" v-if="error">{{error}}</div>
	<div v-if="loading>0">
		Loading...
	</div>
	<div v-else>
		<div v-if="outputProfiles && outputProfiles.length > 0">
			<table class="table table-sm">
				<thead><tr><th>Name</th></tr></thead>
				<tbody>
					<tr v-for="(p, idx) in outputProfiles">
						<td><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/outputProfiles/'+encodeURIComponent(p)">{{p}}</router-link></td>
					</tr>
					<tr v-if="!outputProfiles.length"><td colspan="1" class="text-center"><i>No data</i></td></tr>
				</tbody>
			</table>
			<a class="float-end" target="_blank" href="https://airensoft.gitbook.io/ovenmediaengine/rest-api/v1/virtualhost/application/output-profile#get-v1-vhosts-vhost-apps-app-outputprofiles">Documentation for <code>GET /v1/vhosts/{vhost}/apps/{app}/outputProfiles</code></a>
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
		error: null,
		loading: 0,
		servers: null,
		server: null,
		outputProfiles: [],
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
				this.outputProfiles = null;
				await this.loadServers();
				this.outputProfiles = await this.$api.get(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${this.$route.params.app}/outputProfiles`);
			} catch(e) {
				this.error = e;
			} finally {
				this.loading--;
			}
		},
	},
};
</script>

