<template>
	<div class="row">
		<div class="col-8">
			<div class="float-end">
				<div class="form-check form-switch form-check-reverse">
					<input class="form-check-input" type="checkbox" id="showServersJson" v-model="showServersJson">
					<label class="form-check-label" for="showServersJson">raw</label>
				</div>
			</div>
			<h3>Servers</h3>
			<pre v-show="showServersJson">{{servers}}</pre>
			<table class="table table-striped table-sm" v-show="!showServersJson">
				<thead><tr><th>Host</th><th>URL</th><th></th></tr></thead>
				<tbody>
					<tr v-for="(host, idx) in servers">
						<td>
							<router-link :to="'/'+encodeURIComponent(host.url)">{{host.name||host.url}}</router-link>
						</td>
						<td>
							<a :href="host.url">{{host.url}} ☍</a>
						</td>
						<td class="text-end">
							<a href="#" @click.stop.prevent="deleteHost(idx, host)" class="text-danger">Delete</a>
						</td>
					</tr>
					<tr v-if="!servers?.length">
						<td colspan="3" class="text-center text-secondary">
							No servers, please add your servers from the form on the right.
						</td>
					</tr>
				</tbody>
			</table>
			<a :href="`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(servers||null))}`" download="hosts.json">save</a> |
			<input type="file" ref="fileElem" accept="application/json" style="display:none" @change="loadFile($event)" />
			<a href="#" @click.prevent="$refs.fileElem.click()">load</a>
		</div>
		<div class="col-4">
			<div class="form form-inline">
				<div class="form-group mb-3">
					<label for="apiName" class="form-label">Name</label>
					<input type="text" class="form-control" v-model="curHost.name" id="apiName">
				</div>
				<div class="form-group mb-3">
					<label for="apiUrl" class="form-label">API URL</label>
					<input type="text" class="form-control" v-model="curHost.url" id="apiUrl">
				</div>
				<div class="form-group mb-3">
					<label for="apiKey" class="form-label">API Key</label>
					<input type="text" class="form-control" v-model="curHost.token" id="apiKey">
				</div>
				<button type="button" class="btn btn-primary btn-justified" @click.prevent.stop="addHost()">Add</button>
				<p class="form-text">This data is only stored in your browser's local storage</p>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	created() {
		this.loadServers();
	},
	data() { return {
		error: null,
		showServersJson: false,
		servers: [],
		curHost: { name: '', url: '', token: '' },
		vhosts: [],
		vhostName: 'default',
		apps: [],
	}},
	methods: {
		async addHost() {
			try {
				await this.$storage.addHost(this.curHost);
				await this.loadServers();
				this.curHost = { name: '', url: '', token: '' };
			} catch(e) {
				console.error(e);
				this.error = e;
			}
		},
		async deleteHost(idx, host) {
			if(!confirm(`Are you sure you want to delete ${host.name?`${host.name} (${host.url})`:host.url}?`)) return;
			await this.$storage.removeHostByUrl(host.url);
			this.loadServers();
		},
		async loadFile($event) {
			try {
				this.loading++;
				this.error = null;
				const j = await $event?.target?.files?.[0]?.text();
				if(!j) throw new Error('Could not read file');
				this.$storage.setHosts(JSON.parse(j)); // throw error if it's invalid json
				this.loadServers();
			} catch(e) {
				console.error('Could not load hosts file', e);
			} finally {
				this.loading--;
			}
		},
	},
};
</script>
