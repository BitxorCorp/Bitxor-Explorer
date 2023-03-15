<template>
	<b-popover :target="target" placement="bottom" triggers="hover">
		<template v-slot:title>{{ title }}</template>
		<b-list-group>
			<TokenListItem
				v-for="(value, key) in addedRestriction"
				:key="'rmlp_' + key"
				:token="value"
				:value="getTranslation('restrictionAdded')"
			/>

			<TokenListItem
				v-for="(value, key) in removedRestriction"
				:key="'rmlp_' + key"
				:token="value"
				:value="getTranslation('restrictionRemoved')"
			/>
		</b-list-group>
	</b-popover>
</template>

<script>
import GraphicComponent from './GraphicComponent.vue';
import TokenListItem from './TokenListItem.vue';

export default {
	extends: GraphicComponent,

	components: {
		TokenListItem
	},

	props: {
		data: {
			type: Object,
			default: () => ({})
		},

		title: {
			type: String,
			default: 'Table'
		},

		target: {
			type: String,
			required: true
		}
	},
	computed: {
		addedRestriction () {
			return this.data.added;
		},
		removedRestriction () {
			return this.data.removed;
		}
	},
	methods: {
		getTranslation (key) {
			return this.$store.getters['ui/getNameByKey'](key);
		}
	}
};
</script>
