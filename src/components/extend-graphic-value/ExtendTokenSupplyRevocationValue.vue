<template>
	<div>
		<span
			v-if="hasTokens"
			:title="getTranslation('tokens')">
			<TokensCircle
				style="width: 16px; height: 16px;"
				id="target"
				:tokens="[]"
			/>
		</span>
	</div>
</template>

<script>
import GraphicComponent from '@/components/graphics/GraphicComponent.vue';
import TokensCircle from '@/components/graphics/TokensCircle.vue';

export default {
	extends: GraphicComponent,

	components: {
		TokensCircle
	},

	props: {
		value: {
			type: Object,
			required: true,
			default: () => ({})
		}
	},

	computed: {
		hasTokens () {
			if (this.value.tokens)
				return Array.isArray(this.value.tokens) && 0 < this.value.tokens.length;

			return false;
		}
	}
};
</script>
