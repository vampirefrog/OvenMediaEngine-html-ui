export default class OvenMediaEngineAPIClient {
	constructor(apiUrl, accessToken) {
		this.setApiUrl(apiUrl);
		this.setAccessToken(accessToken);
	}
	setApiUrl(url) { this.apiUrl = url; }
	setAccessToken(token) { this.accessToken = btoa(token); }
	request(method, resource, body) {
		console.log(method, resource, body);
		let fetchOptions = {
			headers: { Authorization: `Basic ${this.accessToken}` },
			method,
		};
		if(method == 'POST') fetchOptions.body = JSON.stringify(body);
		const url = `${this.apiUrl}/v1/${resource}`;
		return fetch(url, fetchOptions).then(r => r.json()).then(r => {
			if(Array.isArray(body)) {
				if(r[0].statusCode != 200)
					throw new Error(`API Error ${r[0].statusCode} ${r[0].message}`);
			} else if(r.statusCode != 200)
				throw new Error(`API Error ${r.statusCode} ${r.message}`);
			return r.response;
		});
	}
	get(resource) {
		return this.request('GET', resource);
	}
	post(resource, body) {
		return this.request('POST', resource, body);
	}
};

