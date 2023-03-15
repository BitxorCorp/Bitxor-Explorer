<template>
	<div>
		<span
			class="restrictionItem"
			v-if="hasRestrictionAccountTokenAdditions"
		>
			<b-badge variant="primary" pill>
				{{ additionsCount }} {{ getTranslation('added') }}
			</b-badge>
		</span>

		<span
			class="restrictionItem"
			v-if="hasRestrictionAccountTokenDeletions"
		>
			<b-badge variant="primary" pill>
				{{ deletionsCount }} {{ getTranslation('removed') }}
			</b-badge>
		</span>
	</div>
</template>

<script>
import GraphicComponent from '@/components/graphics/GraphicComponent.vue';

export default {
	extends: GraphicComponent,

	props: {
		value: {
			type: Array,
			required: true,
			default: () => []
		}
	},

	computed: {
		hasRestrictionAccountTokenAdditions () {
			for (const item of this.value) {
				if (Object.keys(item).includes('restrictionTokenAdditions'))
					return Array.isArray(item.restrictionTokenAdditions) && 0 < item.restrictionTokenAdditions.length;
			}

			return false;
		},

		hasRestrictionAccountTokenDeletions () {
			for (const item of this.value) {
				if (Object.keys(item).includes('restrictionTokenDeletions'))
					return Array.isArray(item.restrictionTokenDeletions) && 0 < item.restrictionTokenDeletions.length;
			}

			return false;
		},

		additionsCount () {
			for (const item of this.value) {
				if (Object.keys(item).includes('restrictionTokenAdditions'))
					return item.restrictionTokenAdditions.length;
			}

			return 0;
		},

		deletionsCount () {
			for (const item of this.value) {
				if (Object.keys(item).includes('restrictionTokenDeletions'))
					return item.restrictionTokenDeletions.length;
			}

			return 0;
		}
	}

};
</script>

<style lang="scss" scoped>
.restrictionItem {
    display: flex;
    flex-wrap: wrap;
}
</style>
