<template>
	<div>
		Audios:
		<table class="table table-sm table-striped" v-if="profile.encodes && profile.encodes.audios">
			<thead>
				<tr><th>Name</th><th>Bypass</th><th>Bitrate</th><th>Channels</th><th>Codec</th><th>Sample rate</th></tr>
			</thead>
			<tbody>
				<tr v-for="(a, idx) in profile.encodes.audios" :key="idx">
					<td>{{a.name}}</td>
					<td>{{a.bypass ? '☑' : '☐'}} <code v-if="a.bypassIfMatch">{{a.bypassIfMatch}}</code></td>
					<td>{{a.bitrate}}</td>
					<td>{{a.channel}}</td>
					<td>{{a.codec}}</td>
					<td>{{a.samplerate}}</td>
				</tr>
			</tbody>
		</table>
		Videos:
		<table class="table table-sm table-striped" v-if="profile.encodes && profile.encodes.videos">
			<thead>
				<tr><th>Name</th><th>Bypass</th><th>Bitrate</th><th>Channels</th><th>Codec</th><th>Frame rate</th></tr>
			</thead>
			<tbody>
				<tr v-for="(a, idx) in profile.encodes.videos" :key="idx">
					<td>{{a.name}}</td>
					<td>{{a.bypass ? '☑' : '☐'}} <code v-if="a.bypassIfMatch">{{a.bypassIfMatch}}</code></td>
					<td>{{a.bitrate}}</td>
					<td>{{a.channel}}</td>
					<td>{{a.codec}}</td>
					<td>{{a.framerate}}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
export default {
	props: {
		profile: Object,
	},
}
</script>
