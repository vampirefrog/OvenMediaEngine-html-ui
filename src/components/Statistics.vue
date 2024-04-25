<template>
	<div class="float-end">
		<div class="form-check form-switch form-check-reverse">
			<input class="form-check-input" type="checkbox" id="statisticsJsonSwitch" v-model="json">
			<label class="form-check-label" for="statisticsJsonSwitch">raw</label>
		</div>
	</div>
	<h3>Statistics</h3>
	<pre v-show="json">{{data}}</pre>
	<div v-show="!json" v-if="data">
		<table class="table table-sm">
			<thead><tr><th></th><th class="text-end">IN</th><th class="text-end">OUT</th></tr></thead>
			<tbody>
				<tr><th>Average</th><td class="text-end">{{$util.formatBytes(data.avgThroughputIn)}}/s</td><td class="text-end">{{$util.formatBytes(data.avgThroughputOut)}}/s</td></tr>
				<tr><th>Max</th><td class="text-end">{{$util.formatBytes(data.maxThroughputIn)}}/s</td><td class="text-end">{{$util.formatBytes(data.maxThroughputOut)}}/s</td></tr>
				<tr><th>Last</th><td class="text-end">{{$util.formatBytes(data.lastThroughputIn)}}/s<br/><abbr :title="data.lastRecvTime">{{fromNow(data.lastRecvTime)}}</abbr></td><td class="text-end">{{$util.formatBytes(data.lastThroughputOut)}}/s<br/><abbr :title="data.lastSentTime">{{fromNow(data.lastSentTime)}}</abbr></td></tr>
				<tr><th rowspan="2">Total</th><td class="text-end">{{$util.formatBytes(data.totalBytesIn)}}</td><td class="text-end">{{$util.formatBytes(data.totalBytesOut)}}</td></tr>
				<tr><td class="text-center" colspan="2"><abbr :title="data.createdTime">Since {{fromNow(data.createdTime)}}</abbr></td></tr>
			</tbody>
		</table>
		<table class="table table-sm">
			<thead><tr><th>Connections</th><th></th></tr></thead>
			<tbody>
				<tr :class="{ 'table-success': data?.connections?.dash > 0 }"><th>DASH</th><td class="text-end">{{data?.connections?.dash}}</td></tr>
				<tr :class="{ 'table-success': data?.connections?.file > 0 }"><th>File</th><td class="text-end">{{data?.connections?.file}}</td></tr>
				<tr :class="{ 'table-success': data?.connections?.hls > 0 }"><th>HLS</th><td class="text-end">{{data?.connections?.hls}}</td></tr>
				<tr :class="{ 'table-success': data?.connections?.lldash > 0 }"><th>LLDASH</th><td class="text-end">{{data?.connections?.lldash}}</td></tr>
				<tr :class="{ 'table-success': data?.connections?.llhls > 0 }"><th>LLHLS</th><td class="text-end">{{data?.connections?.llhls}}</td></tr>
				<tr :class="{ 'table-success': data?.connections?.mpegtspush > 0 }"><th>MPEGTS Push</th><td class="text-end">{{data?.connections?.mpegtspush}}</td></tr>
				<tr :class="{ 'table-success': data?.connections?.ovt > 0 }"><th>OVT</th><td class="text-end">{{data?.connections?.ovt}}</td></tr>
				<tr :class="{ 'table-success': data?.connections?.rtmppush > 0 }"><th>RTMP Push</th><td class="text-end">{{data?.connections?.rtmppush}}</td></tr>
				<tr :class="{ 'table-success': data?.connections?.thumbnail > 0 }"><th>Thumbnail</th><td class="text-end">{{data?.connections?.thumbnail}}</td></tr>
				<tr :class="{ 'table-success': data?.connections?.webrtc > 0 }"><th>WebRTC</th><td class="text-end">{{data?.connections?.webrtc}}</td></tr>
			</tbody>
			<tfoot>
				<tr>
					<th>Total</th>
					<td class="text-end">
						{{data.totalConnections}}<br />
						<abbr :title="data.maxTotalConnectionTime">{{fromNow(data.maxTotalConnectionTime)}}</abbr>
					</td>
				</tr>
			</tfoot>
		</table>
		Last updated <abbr :title="data.lastUpdatedTime">{{fromNow(data.lastUpdatedTime)}}</abbr><br />
	</div>
</template>
<script>
import moment from 'moment';

export default {
	data() { return {
		json: false,
	} },
	props: {
		data: Object,
	},
	methods: {
		fromNow(d) { return d && moment(d).fromNow() || '-'; },
	},
};
</script>
