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
	<div class="tokens-container">
		<span
			v-for="(item, index) in value"
			class="token"
			:key="'mos_s' + index"
			:title="'Token: ' + item.tokenId + ' | Amount: ' + item.amount"
		>
			<span class="token-name" @click.stop>
				<router-link :to="getItemHref('tokenId', item.tokenId)">
					<b class="link">{{ getTokenName(item) }}</b>
				</router-link>
			</span>
			<span class="token-amount">
				<Decimal :value="item.amount" class="decimal"/>
			</span>
		</span>
	</div>
</template>

<script>
import Decimal from '@/components/fields/Decimal.vue';
import helper from '../../helper';

export default {
	name: 'TokensField',

	components: {
		Decimal
	},

	props: {
		value: {
			type: Array,
			required: true
		}
	},

	methods: {
		timeSince (interval) {
			return helper.timeSince(interval);
		},

		getItemHref (itemKey, item) {
			return this.$store.getters['ui/getPageHref']({ pageName: itemKey, param: item });
		},

		getTokenName (token) {
			return helper.getTokenName(token);
		}
	}
};
</script>

<style lang="scss" scoped>
.tokens-container {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;

    .token {
        display: inline-block;
        background: var(--token-filed-bg);
        color: var(--text-color);
        border-radius: 5px;
        border-width: 1px;
        border-style: solid;
        border-color: var(--token-filed-bg);
        padding: 5px 10px;
        margin-right: 10px;
        white-space: nowrap;

        .token-name {
            margin-right: 10px;

            .link {
                color: #fff;
            }
        }

        .token-amount {
            .decimal {
                display: inline;
                color: #fff;
            }
        }
    }
}
</style>
