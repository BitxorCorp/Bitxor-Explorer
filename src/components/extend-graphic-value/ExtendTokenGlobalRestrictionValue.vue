<template>
	<span
		v-if="hasReferenceTokenId"
		:title="getTranslation('referenceTokenId') + ': ' + referenceTokenId"
		style="display: flex;"
	>
		<TokenIcon
			hideCaption
			:width="16"
			:height="16"
			:tokenId="referenceTokenId"
		/>

		{{ truncString(referenceTokenId) }}
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
		hasReferenceTokenId () {
			for (const item of this.value) {
				if (Object.keys(item).includes('referenceTokenId'))
					return 'string' === typeof item.referenceTokenId;
			}

			return false;
		},

		referenceTokenId () {
			for (const item of this.value) {
				if (Object.keys(item).includes('referenceTokenId'))
					return item.referenceTokenId;
			}

			return 'N/A';
		}
	}

};
</script>

<style lang="scss" scoped>
.restrictionItem {
    display: flex;
    flex-wrap: wrap;
}
</style>
