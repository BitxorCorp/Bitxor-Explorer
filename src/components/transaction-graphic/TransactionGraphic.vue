<template>
	<component
		:is="graphicComponent"
		v-bind="data"
	/>
</template>

<script>
import TransferGraphic from '@/components/transaction-graphic/TransferGraphic.vue';
import AddressAliasGraphic from '@/components/transaction-graphic/AddressAliasGraphic.vue';
import TokenAliasGraphic from '@/components/transaction-graphic/TokenAliasGraphic.vue';
import NamespaceRegistrationGraphic from '@/components/transaction-graphic/NamespaceRegistrationGraphic.vue';
import TokenDefinitionGraphic from '@/components/transaction-graphic/TokenDefinitionGraphic.vue';
import TokenSupplyChangeGraphic from '@/components/transaction-graphic/TokenSupplyChangeGraphic.vue';
import TokenSupplyRevocationGraphic from '@/components/transaction-graphic/TokenSupplyRevocationGraphic.vue';
import SecretLockGraphic from '@/components/transaction-graphic/SecretLockGraphic.vue';
import HashLockGraphic from '@/components/transaction-graphic/HashLockGraphic.vue';
import VrfKeyGraphic from '@/components/transaction-graphic/VrfKeyGraphic.vue';
import AccountKeyLinkGraphic from '@/components/transaction-graphic/AccountKeyLinkGraphic.vue';
import NodeKeyLinkGraphic from '@/components/transaction-graphic/NodeKeyLinkGraphic.vue';
import VotingKeyLinkGraphic from '@/components/transaction-graphic/VotingKeyLinkGraphic.vue';
import SecretProofGraphic from '@/components/transaction-graphic/SecretProofGraphic.vue';
import AccountMetadataGraphic from '@/components/transaction-graphic/AccountMetadataGraphic.vue';
import NamespaceMetadataGraphic from '@/components/transaction-graphic/NamespaceMetadataGraphic.vue';
import TokenMetadataGraphic from '@/components/transaction-graphic/TokenMetadataGraphic.vue';
import TokenGlobalRestrictionGraphic from '@/components/transaction-graphic/TokenGlobalRestrictionGraphic.vue';
import TokenAddressRestrictionGraphic from '@/components/transaction-graphic/TokenAddressRestrictionGraphic.vue';
import AccountOperationRestrictionGraphic from '@/components/transaction-graphic/AccountOperationRestrictionGraphic.vue';
import AccountAddressRestrictionGraphic from '@/components/transaction-graphic/AccountAddressRestrictionGraphic.vue';
import AccountTokenRestrictionGraphic from '@/components/transaction-graphic/AccountTokenRestrictionGraphic.vue';
import MultisigAccountModificationGraphic from '@/components/transaction-graphic/MultisigAccountModificationGraphic.vue';
import { TransactionType } from 'bitxor-sdk';

export default {
	props: {
		data: {
			type: Object,
			required: true,
			default: () => {}
		}
	},

	components: {
		TransferGraphic,
		AddressAliasGraphic,
		TokenAliasGraphic,
		NamespaceRegistrationGraphic,
		TokenDefinitionGraphic,
		TokenSupplyChangeGraphic,
		TokenSupplyRevocationGraphic,
		SecretLockGraphic,
		HashLockGraphic,
		SecretProofGraphic,
		VrfKeyGraphic,
		AccountKeyLinkGraphic,
		NodeKeyLinkGraphic,
		VotingKeyLinkGraphic,
		AccountMetadataGraphic,
		NamespaceMetadataGraphic,
		TokenMetadataGraphic,
		TokenGlobalRestrictionGraphic,
		TokenAddressRestrictionGraphic,
		AccountOperationRestrictionGraphic,
		AccountAddressRestrictionGraphic,
		AccountTokenRestrictionGraphic,
		MultisigAccountModificationGraphic
	},

	data () {
		return {
			TransactionType
		};
	},

	computed: {
		graphicComponent () {
			switch (this.data?.type) {
			case TransactionType.TRANSFER: return 'TransferGraphic';
			case TransactionType.ADDRESS_ALIAS: return 'AddressAliasGraphic';
			case TransactionType.TOKEN_ALIAS: return 'TokenAliasGraphic';
			case TransactionType.NAMESPACE_REGISTRATION: return 'NamespaceRegistrationGraphic';
			case TransactionType.TOKEN_DEFINITION: return 'TokenDefinitionGraphic';
			case TransactionType.TOKEN_SUPPLY_CHANGE: return 'TokenSupplyChangeGraphic';
			case TransactionType.TOKEN_SUPPLY_REVOCATION: return 'TokenSupplyRevocationGraphic';
			case TransactionType.SECRET_LOCK: return 'SecretLockGraphic';
			case TransactionType.HASH_LOCK: return 'HashLockGraphic';
			case TransactionType.SECRET_PROOF: return 'SecretProofGraphic';
			case TransactionType.VRF_KEY_LINK: return 'VrfKeyGraphic';
			case TransactionType.ACCOUNT_KEY_LINK: return 'AccountKeyLinkGraphic';
			case TransactionType.NODE_KEY_LINK: return 'NodeKeyLinkGraphic';
			case TransactionType.VOTING_KEY_LINK: return 'VotingKeyLinkGraphic';
			case TransactionType.TOKEN_GLOBAL_RESTRICTION: return 'TokenGlobalRestrictionGraphic';
			case TransactionType.TOKEN_ADDRESS_RESTRICTION: return 'TokenAddressRestrictionGraphic';
			case TransactionType.ACCOUNT_OPERATION_RESTRICTION: return 'AccountOperationRestrictionGraphic';
			case TransactionType.ACCOUNT_ADDRESS_RESTRICTION: return 'AccountAddressRestrictionGraphic';
			case TransactionType.ACCOUNT_TOKEN_RESTRICTION: return 'AccountTokenRestrictionGraphic';
			case TransactionType.MULTISIG_ACCOUNT_MODIFICATION: return 'MultisigAccountModificationGraphic';
			case TransactionType.ACCOUNT_METADATA: return 'AccountMetadataGraphic';
			case TransactionType.NAMESPACE_METADATA: return 'NamespaceMetadataGraphic';
			case TransactionType.TOKEN_METADATA: return 'TokenMetadataGraphic';
			}
			return null;
		}
	}
};
</script>
