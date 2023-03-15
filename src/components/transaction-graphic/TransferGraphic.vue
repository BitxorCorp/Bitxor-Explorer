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
				:address="signer"
			/>
			<AccountIcon
				:x="objectPositionX"
				:y="objectPositionY"
				:width="subjectWidth"
				:height="subjectHeight"
				:address="recipient"
			/>
			<Arrow :x="arrowPositionX" :y="arrowPositionY" />
			<MessageCircle
				v-if="hasMessage"
				:x="getCircleIconPositionX(0)"
				:y="circleIconPositionY"
				:message="message"
			/>
			<TokensCircle
				v-if="hasToken"
				id="target"
				:x="getCircleIconPositionX(1)"
				:y="circleIconPositionY"
				:tokens="tokenList"
			/>
			<NativeTokenCircle
				v-if="hasNativeToken"
				id="target"
				:x="getCircleIconPositionX(2)"
				:y="circleIconPositionY"
				:tokens="[nativeToken]"
			/>
			<text :x="transactionTypeTextPositionX" :y="transactionTypeTextPositionY" text-anchor="middle" class="message">
				{{ transactionType }}
				<title>{{ transactionType }}</title>
			</text>
		</svg>
	</div>
</template>

<script>
import GraphicComponent from '../graphics/GraphicComponent.vue';
import AccountIcon from '../graphics/AccountIcon.vue';
import MessageCircle from '../graphics/MessageCircle.vue';
import TokensCircle from '../graphics/TokensCircle.vue';
import NativeTokenCircle from '../graphics/NativeTokenCircle.vue';
import Arrow from '../graphics/Arrow.vue';

export default {
	extends: GraphicComponent,

	components: {
		AccountIcon,
		MessageCircle,
		TokensCircle,
		NativeTokenCircle,
		Arrow
	},

	props: {
		message: {
			type: Object,
			default: () => {}
		},
		signer: {
			type: String,
			required: true,
			default: ''
		},
		recipient: {
			type: String,
			required: true,
			default: ''
		},
		tokens: {
			type: Array,
			default: () => []
		}
	},

	computed: {
		transactionType () {
			return this.getTransactionTypeCaption(16724); // Transfer
		},

		circleIconsToDisplay () {
			return [this.hasMessage, this.hasToken, this.hasNativeToken];
		},

		hasMessage () {
			return 'string' === typeof this.message.payload && 0 < this.message.payload.length;
		},

		hasNativeToken () {
			return 'undefined' !== typeof this.nativeToken;
		},

		hasToken () {
			return 0 < this.tokenList.length;
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
