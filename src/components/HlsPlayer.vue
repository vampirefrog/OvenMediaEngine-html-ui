<template>
	<video style="max-width: 100%; max-height: 100%" @click="playPause()" ref="video" muted />
</template>

<script>
import Hls from 'hls.js';
export default {
	props: {
		source: String,
	},
	data() { return {
	}},
	watch: {
		source() {
			this.hls&&this.hls.loadSource(this.source);
		},
	},
	beforeDestroy() {
		this.removePlayer();
	},
	mounted() {
		this.createPlayer();
	},
	updated() {
		this.removePlayer();
		this.createPlayer();
	},
	methods: {
		removePlayer() {
			if(!this.hls) return;
			this.hls.destroy();
		},
		createPlayer() {
			this.removePlayer();
			this.hls = new Hls();
			this.hls.attachMedia(this.$refs.video);
			this.hls.on(Hls.Events.ERROR, (event, data) => {
				if(data.fatal) {
					if(data.type == Hls.ErrorTypes.NETWORK_ERROR && Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
						setTimeout(() => {
							this.createPlayer();
						}, 1000);
					} else if(data.type == Hls.ErrorTypes.MEDIA_ERROR) {
						this.hls.recoverMediaError();
					} else {
						this.hls.destroy();
					}
				}
				this.$emit('error', data);
			});
			this.hls.on(Hls.Events.MEDIA_ATTACHING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.MEDIA_ATTACHED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.MEDIA_DETACHING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.MEDIA_DETACHED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.BUFFER_RESET, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.BUFFER_CODECS, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.BUFFER_CREATED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.BUFFER_APPENDING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.BUFFER_APPENDED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.BUFFER_EOS, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.BUFFER_FLUSHING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.BUFFER_FLUSHED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.BACK_BUFFER_REACHED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.MANIFEST_LOADING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.MANIFEST_LOADED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.STEERING_MANIFEST_LOADED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.LEVEL_SWITCHING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.LEVEL_LOADING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.LEVEL_LOADED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.LEVEL_UPDATED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.LEVEL_PTS_UPDATED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.LEVELS_UPDATED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.AUDIO_TRACK_SWITCHING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.AUDIO_TRACK_LOADING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.AUDIO_TRACK_LOADED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.SUBTITLE_TRACK_LOADING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.SUBTITLE_TRACK_LOADED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.SUBTITLE_FRAG_PROCESSED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.INIT_PTS_FOUND, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FRAG_LOADING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FRAG_LOAD_PROGRESS, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FRAG_LOAD_EMERGENCY_ABORTED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FRAG_LOADED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FRAG_DECRYPTED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FRAG_PARSING_INIT_SEGMENT, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FRAG_PARSING_USERDATA, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FRAG_PARSING_METADATA, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FRAG_PARSING_DATA, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FRAG_PARSED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FRAG_BUFFERED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FRAG_CHANGED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FPS_DROP, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.FPS_DROP_LEVEL_CAPPING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.DESTROYING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.KEY_LOADING, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.KEY_LOADED, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.STREAM_STATE_TRANSITION, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.NON_NATIVE_TEXT_TRACKS_FOUND, (event, data) => this.$emit(event, data));
			this.hls.on(Hls.Events.CUES_PARSED, (event, data) => this.$emit(event, data));
			this.$refs.video.addEventListener('pause', () => this.$emit('pause'));
			this.$refs.video.addEventListener('play', () => this.$emit('play'));
			this.$refs.video.addEventListener('volumechange', () => this.$emit(this.$refs.video.muted ? 'muted' : 'unmuted'));
			this.hls.loadSource(this.source);
			this.$refs.video.play();
		},
		togglePause() {
			if(this.$refs.video.paused)
				this.$refs.video.play();
			else
				this.$refs.video.pause();
		},
		toggleMute() {
			this.$refs.video.muted = !this.$refs.video.muted;
		},
	},
}
</script>
