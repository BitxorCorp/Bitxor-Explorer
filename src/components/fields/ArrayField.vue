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
	<div>
		<div v-for="(row, rowIndex) in value" :title="row" :key="'af_r'+rowIndex" @click.stop>
			<router-link v-if="isKeyClickable(itemKey_) && getItemHref(itemKey_, row)" :to="getItemHref(itemKey_, row)">
				<Truncate v-if="isTruncate(itemKey_)">{{row}}</Truncate>
				<div v-else>{{ row }}</div>
			</router-link>
			<TransactionType v-else-if="isTransactionType(itemKey_)" :value="row" />
			<div v-else>
				<Truncate v-if="isTruncate(itemKey_)">{{row}}</Truncate>
				<div v-else>{{ row }}</div>
			</div>
		</div>
	</div>
</template>

<script>
import TableView from '@/components/tables/TableView.vue';
import TransactionType from '@/components/fields/TransactionType.vue';

export default {
	name: 'ArrayField',
	extends: TableView,

	components: {
		TransactionType
	},

	props: {
		itemKey: {
			type: String,
			required: true
		},

		value: {
			type: Array,
			required: true
		}
	},

	computed: {
		itemKey_ () {
			return this.itemKey + '_';
		}
	}
};
</script>
