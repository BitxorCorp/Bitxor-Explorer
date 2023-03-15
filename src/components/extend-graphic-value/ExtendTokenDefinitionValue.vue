<template>
	<span
		v-if="hasTokenId"
		:title="getTranslation('tokenId') + ': ' + tokenId"
		style="word-break: keep-all; display: flex;"
	>
		<TokenIcon
			hideCaption
			style="margin-right: 5px;"
			:width="16"
			:height="16"
			:tokenId="tokenId"
		/>

		{{ truncString(tokenId) }}
	</span>
</template>

<script>
import GraphicComponent from '@/components/graphics/GraphicComponent.vue';
import TokenIcon from '@/components/graphics/TokenIcon.vue';

export default {
	extends: GraphicComponent,

	components: {
		TokenIcon
	},

	props: {
		value: {
			type: Array,
			required: true,
			default: () => []
		}
	},

	computed: {
		hasTokenId () {
			for (const item of this.value) {
				if (Object.keys(item).includes('tokenId'))
					return 'string' === typeof item.tokenId;
			}

			return false;
		},

		tokenId () {
			for (const item of this.value) {
				if (Object.keys(item).includes('tokenId'))
					return item.tokenId;
			}

			return '';
		}
	}
};
</script>
