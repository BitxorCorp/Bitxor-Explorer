<template>
	<b-popover :target="target" placement="bottom" triggers="hover">
		<template v-slot:title>{{ title }}</template>
		<b-list-group>
			<TokenListItem
				v-for="(token, index) in tokens"
				:key="'mlp'+token.tokenId + index"
				:token="token"
			/>
		</b-list-group>
	</b-popover>
</template>

<script>
import TokenListItem from '../graphics/TokenListItem.vue';
import GraphicComponent from './GraphicComponent.vue';

export default {
	extends: GraphicComponent,

	components: {
		TokenListItem
	},

	props: {
		tokens: {
			type: Array,
			default: () => []
		},

		title: {
			type: String,
			default: 'Tokens'
		},

		target: {
			type: String,
			required: true
		}
	},

	methods: {
		click () {
			this.$emit('click', this.tokenId);
		}
	}
};
</script>

<style lang="scss" scoped>
.list-item {
    background-color: var(--sub-card-bg);
    border: 1px solid var(--sub-card-border);
    color: var(--text-color);
    min-width: 250px;
}
</style>
