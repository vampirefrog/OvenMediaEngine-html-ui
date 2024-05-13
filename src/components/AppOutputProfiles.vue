<template>
	<breadcrumbs/>
	<div class="alert alert-danger" v-if="error">{{error}}</div>
	<div v-if="outputProfiles && outputProfiles.length > 0">
		<table class="table table-sm">
			<thead><tr><th>Name</th></tr></thead>
			<tbody>
				<tr v-for="(p, idx) in outputProfiles">
					<td><router-link :to="'/'+encodeURIComponent($route.params.serverUrl)+'/vhosts/'+encodeURIComponent($route.params.vhost)+'/apps/'+encodeURIComponent($route.params.app)+'/outputProfiles/'+encodeURIComponent(p)">{{p}}</router-link></td>
				</tr>
			</tbody>
		</table>
	</div>
	<div v-else>No data</div>
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

