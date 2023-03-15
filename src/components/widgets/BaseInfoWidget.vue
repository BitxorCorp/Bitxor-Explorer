<template>
	<Card :loading="loading">
		<template #title>
				<div class="ex-cardbaseinfo-header" style="display: block; text-align: center; padding-bottom: 10px; font-size: 18px;">
			{{getNameByKey('baseInfo')}}
		</div>

		
		</template>

	

		<template #body>
			<b-container fluid style="height: 100%;">
				<b-row>
					<!-- <b-col class="ex-item" sm="3" lg="12">
						<div class="ex-item-title">
							{{getNameByKey('price')}}
						</div>
						<div class="ex-itembaseinfo-value">
							{{marketData.price}}
						</div>
					</b-col>
					<b-col class="ex-item" sm="3" lg="12">
						<div class="ex-item-title">
							{{getNameByKey('marketCap')}}
						</div>
						<div class="ex-itembaseinfo-value">
							{{marketData.marketCap}}
						</div>
					</b-col> -->
						<b-col class="ex-item" sm="2" lg="2">
							<Card class="card-item" :item="item" style="background: linear-gradient(#735ca4a8, #09054cb8);border: 1px solid rgb(37, 195, 241);">
							<template #header>
								<div class="ex-row no-wrap">
								{{getNameByKey('totalTransactions')}}
									</div>
							</template>
							<template #body>
								<div class="ex-row no-wrap" >
									<div class="ex-itembaseinfo-value"  style="text-align: center;">
							{{storageInfo.numTransactions}}
						</div>
								</div>
							
							</template>
						</Card>
					
					
					</b-col>
								<b-col class="ex-item" sm="2" lg="2">
							<Card class="card-item" :item="item" style="background: linear-gradient(#735ca4a8, #09054cb8);border: 1px solid rgb(37, 195, 241);">
							<template #header>
								{{getNameByKey('chainHeight')}}
							</template>
							<template #body>
								<div class="ex-row no-wrap">
									<div class="ex-itembaseinfo-value"  style="text-align: center;">
							{{currentHeight}}
						</div>
								</div>
							
							</template>
						</Card>
					
					
					</b-col>

					<b-col class="ex-item" sm="2" lg="2">
							<Card class="card-item" :item="item" style="background: linear-gradient(#735ca4a8, #09054cb8);border: 1px solid rgb(37, 195, 241);">
							<template #header>
								{{getNameByKey('finalizedHeight')}}
							</template>
							<template #body>
								<div class="ex-row no-wrap">
									<div class="ex-itembaseinfo-value"  style="text-align: center;">
							{{finalizedHeight}}
						</div>
								</div>
							
							</template>
						</Card>
					
					
					</b-col>
						<b-col class="ex-item" sm="2" lg="2">
							<Card class="card-item" :item="item" style="background: linear-gradient(#735ca4a8, #09054cb8);border: 1px solid rgb(37, 195, 241);">
							<template #header>
								{{getNameByKey('lastEpoch')}}
							</template>
							<template #body>
								<div class="ex-row no-wrap">
									<div class="ex-itembaseinfo-value"  style="text-align: center;">
							{{ lastEpoch }} -
							<Age :date="lastEpochAge"/>
						</div>
								</div>
							
							</template>
						</Card>
					
					
					</b-col>
					<b-col class="ex-item" sm="2" lg="2">
							<Card class="card-item" :item="item" style="background: linear-gradient(#735ca4a8, #09054cb8);border: 1px solid rgb(37, 195, 241);">
							<template #header>
								{{getNameByKey('currentEpoch')}}
							</template>
							<template #body>
								<div class="ex-row no-wrap">
									<div class="ex-itembaseinfo-value"  style="text-align: center;">
					{{epoch}}
						</div>
								</div>
							
							</template>
						</Card>
					
					
					</b-col>	
					<b-col class="ex-item" sm="2" lg="2">
							<Card class="card-item" :item="item" style="background: linear-gradient(#735ca4a8, #09054cb8);border: 1px solid rgb(37, 195, 241);">
							<template #header>
								{{getNameByKey('nodes')}}
							</template>
							<template #body>
								<div class="ex-row no-wrap">
									<div class="ex-itembaseinfo-value"  style="text-align: center;">
					{{nodeCount}}
						</div>
								</div>
							
							</template>
						</Card>
					
					
					</b-col>
				
				</b-row>
			</b-container>
		</template>
	</Card>
</template>

<script>
import Card from '@/components/containers/CardBaseInfo.vue'
;
import ButtonMore from '@/components/controls/ButtonMore.vue';
import Age from '@/components/fields/Age.vue';
import { mapGetters } from 'vuex';

export default {
	components: {
		Card,
		ButtonMore,
		Age
	},

	computed: {
		...mapGetters({
			chainInfo: 'chain/getChainInfo',
			storageInfo: 'chain/getStorageInfo',
			marketData: 'chain/getMarketData',
			nodeStats: 'chain/getNodeStats',
			loading: 'chain/getLoading'
		}),

		currentHeight () {
			return this.chainInfo.currentHeight;
		},

		epoch () {
			return this.chainInfo.epoch;
		},

		finalizedHeight () {
			return this.chainInfo.finalizedBlockHeight;
		},

		lastEpoch () {
			return this.chainInfo.lastEpoch.epoch;
		},

		lastEpochAge () {
			return this.chainInfo.lastEpoch.age;
		},

		nodeCount () {
			return this.nodeStats?.total || '-';
		}
	},

	methods: {
		getNameByKey (e) {
			return this.$store.getters['ui/getNameByKey'](e);
		}
	}
};
</script>

<style lang="scss" scoped>
.ex-item {
    padding: 1px 10px;
 //   margin-bottom: 15px;
    text-transform: uppercase;

    .ex-item-title {
        color: var(--text-color);
        font-size: 12px;
    }

    .ex-itembaseinfo-value {
        color: var(--text-color);
        text-align: left;
        font-size: 14px;
        margin: 4px 0 0;
    }
}
</style>
