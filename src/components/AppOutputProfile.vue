<template>
	<breadcrumbs/>
	<div class="alert alert-danger" v-if="error">{{error}}</div>
	<output-profile v-if="outputProfile" :profile="outputProfile"/>
	<div v-else>No data</div>
</template>

<script>
import OutputProfile from './OutputProfile.vue';
import Breadcrumbs from './Breadcrumbs.vue';

export default {
	data() { return {
		error: null,
		loading: 0,
		servers: null,
		server: null,
		outputProfile: [],
	}},
	components: {
		OutputProfile,
		Breadcrumbs,
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
				this.error = null;
				this.outputProfile = null;
				await this.loadServers();
				this.outputProfile = await this.$api.get(`vhosts/${encodeURIComponent(this.$route.params.vhost)}/apps/${this.$route.params.app}/outputProfiles/${this.$route.params.outputProfile}`);
			} catch(e) {
				this.error = e;
			} finally {
				this.loading--;
			}
		},
	},
}
</script>
