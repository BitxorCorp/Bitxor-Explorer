<template>
	<div>
		<svg
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			x="0px"
			y="0px"
			:width="getPixels(transactionGraphicWidth)"
			:height="getPixels(transactionGraphicHeight)"
			:viewBox="transactionGraphicViewbox"
			xml:space="preserve"
		>
			<AccountIcon
				:x="subjectPositionX"
				:y="subjectPositionY"
				:width="subjectWidth"
				:height="subjectHeight"
				:address="address"
			/>
			<AccountIcon
				:x="objectPositionX"
				:y="objectPositionY"
				:width="subjectWidth"
				:height="subjectHeight"
				:address="signer"
			/>
			<Arrow :x="arrowPositionX" :y="arrowPositionY" />
			<TokensCircle
				v-if="hasToken"
				id="target"
				:x="getCircleIconPositionX(0)"
				:y="circleIconPositionY"
				:tokens="tokenList"
			/>
			<NativeTokenCircle
				v-if="hasNativeToken"
				id="target"
				:x="getCircleIconPositionX(1)"
				:y="circleIconPositionY"
				:tokens="[nativeToken]"
			/>
			<text :x="transactionTypeTextPositionX" :y="transactionTypeTextPositionY" text-anchor="middle" class="message">
				{{ getTranslation(transactionType) }}
			</text>
		</svg>
	</div>
</template>

<script>
import GraphicComponent from '../graphics/GraphicComponent.vue';
import AccountIcon from '../graphics/AccountIcon.vue';
import Arrow from '../graphics/Arrow.vue';
import TokensCircle from '../graphics/TokensCircle.vue';
import NativeTokenCircle from '../graphics/NativeTokenCircle.vue';

export default {
	extends: GraphicComponent,

	components: {
		AccountIcon,
		Arrow,
		TokensCircle,
		NativeTokenCircle
	},

	props: {
		signer: {
			type: String,
			required: true,
			default: ''
		},
		address: {
			type: String,
			required: true,
			default: ''
		},
		tokens: {
			type: Array,
			default: () => []
		}
	},

	data () {
		return {
			width: this.transactionGraphicWidth,
			heigth: this.transactionGraphicHeight
		};
	},

	computed: {
		transactionType () {
			return this.getTransactionTypeCaption(this.type);
		},

		circleIconsToDisplay () {
			return [this.hasToken, this.hasNativeToken];
		},

		hasNativeToken () {
			return 'undefined' !== typeof this.nativeToken;
		},

		hasToken () {
			return 0 < this.tokenList.length;
		},

		token () {
			return { tokenId: this.tokenId };
		},

		nativeToken () {
			return this.tokens.find(token => token.tokenId === this.nativeTokenId);
		},

		tokenList () {
			return this.tokens.filter(token => token.tokenId !== this.nativeTokenId);
		}
	}
};
</script>
