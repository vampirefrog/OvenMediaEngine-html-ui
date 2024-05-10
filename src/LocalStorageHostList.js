import HostList from './HostList.js';

export default class LocalStorageHostList extends HostList {
	async getHosts() {
		return JSON.parse(localStorage.getItem('hosts')||'[]');
	}

	async setHosts(hosts) {
		localStorage.setItem('hosts', JSON.stringify(hosts));
	}

	async getHostByUrl(url) {
		const servers = await this.getHosts();
		const server = servers.find(s => s.url == url);
		if(!server) throw new Error(`Server ${url} not found`);
		return server;
	}

	async removeHostByUrl(url) {
		const servers = await this.getHosts();
		const idx = servers.findIndex(s => s.url == url);
		if(idx < 0) throw new Error(`Server ${url} not found`);
		servers.splice(idx, 1);
		this.setHosts(servers);
	}

	async updateHostByUrl(url, data) {
		const servers = await this.getHosts();
		const idx = servers.findIndex(s => s.url == url);
		if(idx < 0) throw new Error(`Server ${url} not found`);
		servers[idx].name = server.name;
		servers[idx].token = server.token;
		await this.setHosts(servers);
	}

	async deleteHostByUrl(url) {
		const servers = await this.getHosts();
		const idx = servers.findIndex(s => s.url == url);
		if(idx < 0) throw new Error(`Server not found ${url}`);
		servers.splice(idx, 1);
		await this.setHosts(servers);
	}

	async addHost(host) {
		const servers = await this.getHosts();
		servers.push(host);
		await this.setHosts(servers);
	}
}
