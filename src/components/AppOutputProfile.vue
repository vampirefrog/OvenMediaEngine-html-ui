<template>
	<breadcrumbs/>
	<div class="alert alert-danger" v-if="error">{{error}}</div>
	<div v-if="loading>0">Loading...</div>
	<div v-else>
		<output-profile v-if="outputProfile" :profile="outputProfile"/>
		<div v-else>No data</div>
		<a class="float-end" target="_blank" href="https://airensoft.gitbook.io/ovenmediaengine/rest-api/v1/virtualhost/application/output-profile#get-v1-vhosts-vhost-apps-app-outputprofiles-profile">Documentation for <code>GET /v1/vhosts/{vhost}/apps/{app}/outputProfiles/{profile}</code></a>
	</div>
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
