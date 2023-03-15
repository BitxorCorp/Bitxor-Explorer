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
			<LockCircle
				:x="getCircleIconPositionX(0)"
				:y="circleIconPositionY"
				title="Secret Lock"
				:data="secretLockInfo"
			/>
			<TokensCircle
				v-if="hasToken"
				id="target"
				:x="getCircleIconPositionX(1)"
				:y="circleIconPositionY"
				:tokens="tokens"
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
import TokensCircle from '../graphics/TokensCircle.vue';
import LockCircle from '../graphics/LockCircle.vue';
import Arrow from '../graphics/Arrow.vue';
import { TransactionType } from 'bitxor-sdk';

export default {
	extends: GraphicComponent,

	components: {
		AccountIcon,
		TokensCircle,
		LockCircle,
		Arrow
	},

	props: {
		type: {
			type: Number,
			required: true,
			default: TransactionType.SECRET_LOCK
		},
		signer: {
			type: String,
			required: true,
			default: ''
		},
		duration: {
			type: Number,
			required: true,
			default: 0
		},
		recipient: {
			type: String,
			required: true,
			default: ''
		},
		tokens: {
			type: Array,
			default: () => []
		},
		secret: {
			type: String,
			required: true,
			default: ''
		},
		hashAlgorithm: {
			type: String,
			required: true,
			default: ''
		}
	},

	computed: {
		transactionType () {
			return this.getTransactionTypeCaption(this.type);
		},

		circleIconsToDisplay () {
			return [true, this.hasToken];
		},

		token () {
			return {
				tokenId: this.tokenId,
				amount: this.amount,
				tokenAliasName: this.tokenAliasName
			};
		},

		hasToken () {
			return 'undefined' !== this.tokenId;
		},

		secretLockInfo () {
			return {
				duration: this.duration,
				secret: this.secret,
				hashAlgorithm: this.hashAlgorithm
			};
		}
	}
};
</script>
