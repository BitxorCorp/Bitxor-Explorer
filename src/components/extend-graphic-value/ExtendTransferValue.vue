/*
 *
 * Copyright 2022 Bitxor Community
 *
 * Licensed under the Apache License, Version 2.0 (the "License ");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

<template>
	<div class="extendGraphicValueContainer">
		<span
			v-if="hasMessage"
			title="">
			<MessageCircle
				style="width: 16px; height: 16px;"
				:message="message"
			/>
		</span>

		<span
			v-if="hasTokens"
			:title="getTranslation('tokens')">
			<TokensCircle
				style="width: 16px; height: 16px;"
				id="target"
				:tokens="[]"
			/>
		</span>

		<span
			v-if="hasNativeToken"
			:title="getTranslation('amount') + ': ' + nativeToken + ' ' + networkCurrency"
			:class="amountClass"
			style="display: flex;"
		>
			<Decimal :value="nativeToken" class="decimal"/> {{ networkCurrencySub }}
		</span>
	</div>
</template>

<script>
import MessageCircle from '@/components/graphics/MessageCircle.vue';
import TokensCircle from '@/components/graphics/TokensCircle.vue';
import GraphicComponent from '@/components/graphics/GraphicComponent.vue';

import Decimal from '@/components/fields/Decimal.vue';
import http from '../../infrastructure/http';

export default {
	extends: GraphicComponent,

	components: {
		MessageCircle,
		TokensCircle,
		Decimal
	},

	props: {
		value: {
			type: Object,
			required: true,
			default: () => ({})
		},
		transactionType: {
			type: [String, Number]
		}
	},

	computed: {
		hasNativeToken () {
			if (this.value.nativeToken)
				return 'N/A' !== this.value.nativeToken;

			return false;
		},
		hasMessage () {
			if (this.value.message)
				return 'string' === typeof this.value.message.payload && 0 < this.value.message.payload.length;

			return false;
		},

		hasTokens () {
			if (this.value.tokens)
				return Array.isArray(this.value.tokens) && 0 < this.value.tokens.length;

			return false;
		},

		nativeToken () {
			if (this.value.nativeToken) {
				const amount = this.value.nativeToken.replace(/,/g, '');

				if (Number.isInteger(Number(amount)))
					return Number(amount).toLocaleString('en-US');
				return this.value.nativeToken;
			}

			return '';
		},

		message () {
			return this.value.message || '';
		},

		tokens () {
			return this.value.tokens || [];
		},

		networkCurrency () {
			return http.networkCurrency.namespaceName;
		},

		networkCurrencySub () {
			// eslint-disable-next-line no-constant-condition
			if (
				'string' === typeof http.networkCurrency.namespaceName &&
				0 < http.networkCurrency.namespaceName.length
			) {
				const namespaceLevels = http.networkCurrency.namespaceName.split('.');

				return ' ' + namespaceLevels.pop()?.toUpperCase();
			}

			return '';
		},

		amountClass () {
			if ('string' === typeof this.transactionType && this.transactionType.includes('incoming'))
				return 'incoming';
			if ('string' === typeof this.transactionType && this.transactionType.includes('outgoing'))
				return 'outgoing';
			return '';
		}
	}

};
</script>

<style lang="scss" scoped>
.extendGraphicValueContainer {
    display: inline-flex;
}

.incoming {
    color: var(--balance-green-text);
}

.outgoing {
    color: $red-color;
}
</style>
