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
				:address="signer"
			/>
			<Arrow :x="arrowPositionX" :y="arrowPositionY" />
			<RestrictionTokenCircle
				:x="getCircleIconPositionX(0)"
				:y="circleIconPositionY"
				:title="restrictionType"
				:data="restrictionToken"
			/>
			<text :x="transactionTypeTextPositionX" :y="transactionTypeTextPositionY" text-anchor="middle" class="message">
				{{ transactionType  }}
				<title>{{ transactionType }}</title>
			</text>
		</svg>
	</div>
</template>

<script>
import GraphicComponent from '../graphics/GraphicComponent.vue';
import AccountIcon from '../graphics/AccountIcon.vue';
import RestrictionTokenCircle from '../graphics/RestrictionTokenCircle.vue';
import Arrow from '../graphics/Arrow.vue';
import { TransactionType } from 'bitxor-sdk';

export default {
	extends: GraphicComponent,

	components: {
		AccountIcon,
		RestrictionTokenCircle,
		Arrow
	},

	props: {
		type: {
			type: Number,
			required: true,
			default: TransactionType.ACCOUNT_TOKEN_RESTRICTION
		},
		signer: {
			type: String,
			required: true,
			default: ''
		},
		restrictionType: {
			type: String,
			required: true,
			default: ''
		},
		restrictionTokenAdditions: {
			type: Array,
			default: () => []
		},
		restrictionTokenDeletions: {
			type: Array,
			default: () => []
		}
	},

	computed: {
		transactionType () {
			return this.getTransactionTypeCaption(this.type);
		},

		circleIconsToDisplay () {
			return [true];
		},

		restrictionToken () {
			return {
				added: this.restrictionTokenAdditions.map(tokenId => ({ tokenId, tokenAliasName: 'N/A' })),
				removed: this.restrictionTokenDeletions.map(tokenId => ({ tokenId, tokenAliasName: 'N/A' }))
			};
		}
	}
};
</script>
