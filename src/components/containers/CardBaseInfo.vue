<template>
	<b-card class="ex-cardbaseinfo">
		<div class="ex-cardbaseinfo-header" style="display: block; text-align: center;">
			<slot name="header" />
			<slot name="title" />
			
		</div>

		<div v-if="loading" class="ex-cardbaseinfo-loading">
			<Loading />
		</div>

		<div v-if="error" class="ex-cardbaseinfo-error">
			<slot name="error" />
		</div>

		<div v-if="!error && !loading" class="ex-cardbaseinfo-body">
			<slot name="body" />
		</div>
	</b-card>
</template>

<script>
import Loading from '@/components/Loading.vue';

export default {
	components: {
		Loading
	},

	props: {
		loading: {
			type: Boolean,
			default: false
		},

		error: {
			type: Boolean,
			default: false
		}
	}
};
</script>

<style lang="scss" scoped>
.ex-cardbaseinfo {
    background: var(--card-bg);
    border-radius: 12px;
        border: 2px solid #25c3f1;
    margin-bottom: 20px;
    transition: all 0.5s ease-in-out;

    .ex-cardbaseinfo-loading {
        height: 187px;
    }

    .ex-cardbaseinfo-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 14px;
        font-weight: 500;
        color: #fff;
        text-transform: uppercase;
        font-family:  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    }

    .ex-cardbaseinfo-body {
        position: relative;
        display: block;
    }

    .ex-cardbaseinfo-error {
        font-size: 14px;
        color: $card-error-text-color;
        display: flex;
        justify-content: center;
        text-align: center;
    }
}
</style>
