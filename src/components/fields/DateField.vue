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
	<div class="date-container">
		<span :title="utcDate(timestamp)" >{{ utcDate(timestamp) }}</span>

		<span v-if="isShowTimestamp" class="timestamp">{{ getNameByKey('bitxorTime') }} : {{ timestamp }}</span>
	</div>
</template>
<script>
import helper from '../../helper';

export default {
	name: 'DateField',
	props: {
		timestamp: Number,
		isShowTimestamp: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		utcDate (timestamp) {
			return helper.convertToUTCDate(timestamp);
		},
		getNameByKey (e) {
			return this.$store.getters['ui/getNameByKey'](e);
		}
	}
};
</script>

<style lang="scss" scoped>
.date-container {
    .timestamp {
        padding-left: 5px;
        opacity: 0.5;
    }
}
</style>
