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
				:address="targetAddress"
			/>
			<Arrow :x="arrowPositionX" :y="arrowPositionY" />
			<TokenRestrictionCircle
				:x="getCircleIconPositionX(0)"
				:y="circleIconPositionY"
				:data="data"
				:title="transactionType"
			/>
			<TokensCircle
				:x="getCircleIconPositionX(1)"
				:y="circleIconPositionY"
				:tokens="[token]"
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
import TokenRestrictionCircle from '../graphics/TokenRestrictionCircle.vue';
import Arrow from '../graphics/Arrow.vue';

export default {
	extends: GraphicComponent,

	components: {
		AccountIcon,
		TokensCircle,
		TokenRestrictionCircle,
		Arrow
	},

	props: {
		signer: {
			type: String,
			required: true,
			default: ''
		},
		targetAddress: {
			type: String,
			required: true
		},
		tokenId: {
			type: String,
			required: true
		},
		restrictionKey: {
			type: String,
			required: true
		},
		previousRestrictionValue: {
			type: [String, Number],
			required: true
		},
		newRestrictionValue: {
			type: [String, Number],
			required: true
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
			return [true, true];
		},

		token () {
			return { tokenId: this.tokenId };
		},

		data () {
			return {
				type: 'token.address',
				tokenId: this.tokenId,
				restrictionKey: this.restrictionKey,
				previousRestrictionValue: this.previousRestrictionValue,
				newRestrictionValue: this.newRestrictionValue
			};
		}
	}
};
</script>
