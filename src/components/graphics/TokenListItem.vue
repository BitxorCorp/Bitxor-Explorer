<template>
	<b-list-group-item
		class="d-flex justify-content-between align-items-center list-item"
		:title="title"
	>
		<TokenIcon
			v-if="!isNativeToken(token.tokenId)"
			hideCaption
			:width="32"
			:height="32"
			:tokenId="token.tokenId"
		/>
		<NativeTokenIcon
			v-else
			:width="32"
			:height="32"
			:tokenId="token.tokenId"
		/>
		{{ text }}
		<b-badge v-if="isValueExist" variant="primary" pill>{{ _value }}</b-badge>
		<div v-else> &nbsp; </div>
	</b-list-group-item>
</template>

<script>
import TokenIcon from '../graphics/TokenIcon.vue';
import NativeTokenIcon from '../graphics/NativeTokenIcon.vue';
import GraphicComponent from './GraphicComponent.vue';

export default {
	extends: GraphicComponent,

	components: {
		TokenIcon,
		NativeTokenIcon
	},

	props: {
		token: {
			type: Object,
			default: () => ({})
		},

		value: {
			type: [Number, String]
		}
	},

	computed: {
		text () {
			return this.truncString(this.getTokenName(this.token), 5);
		},

		title () {
			return this.getTokenName(this.token);
		},

		isValueExist () {
			return 'number' === typeof this._value || 'string' === typeof this._value;
		},

		_value () {
			return this.value || this.token.amount;
		}
	},

	methods: {
		isNativeToken (tokenId) {
			return tokenId === this.nativeTokenId;
		}
	}
};
</script>

<style lang="scss" scoped>
.list-item {
    min-width: 250px;
    background-color: var(--sub-card-bg);
    border: 1px solid var(--sub-card-border);
    color: var(--text-color);
}
</style>
