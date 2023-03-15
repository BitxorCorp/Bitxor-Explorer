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
	<component
		:is="extendGraphicComponent"
		:value="value"
		:transactionType="transactionType"
	/>
</template>

<script>
import GraphicComponent from '../graphics/GraphicComponent.vue';
import ExtendTransferValue from '@/components/extend-graphic-value/ExtendTransferValue.vue';
import ExtendNamespaceRegistrationValue from '@/components/extend-graphic-value/ExtendNamespaceRegistrationValue.vue';
import ExtendAliasValue from '@/components/extend-graphic-value/ExtendAliasValue.vue';
import ExtendTokenSupplyChangeValue from '@/components/extend-graphic-value/ExtendTokenSupplyChangeValue.vue';
import ExtendTokenSupplyRevocationValue from '@/components/extend-graphic-value/ExtendTokenSupplyRevocationValue.vue';
import ExtendTokenDefinitionValue from '@/components/extend-graphic-value/ExtendTokenDefinitionValue.vue';
import ExtendKeyLinkValue from '@/components/extend-graphic-value/ExtendKeyLinkValue.vue';
import ExtendSecretLockValue from '@/components/extend-graphic-value/ExtendSecretLockValue.vue';
import ExtendSecretProofValue from '@/components/extend-graphic-value/ExtendSecretProofValue.vue';
import ExtendHashLockValue from '@/components/extend-graphic-value/ExtendHashLockValue.vue';
import ExtendMetadataValue from '@/components/extend-graphic-value/ExtendMetadataValue.vue';
import ExtendAccountOperationRestrictionValue from '@/components/extend-graphic-value/ExtendAccountOperationRestrictionValue.vue';
import ExtendAccountTokenRestrictionValue from '@/components/extend-graphic-value/ExtendAccountTokenRestrictionValue.vue';
import ExtendAccountAddressRestrictionValue from '@/components/extend-graphic-value/ExtendAccountAddressRestrictionValue.vue';
import ExtendTokenGlobalRestrictionValue from '@/components/extend-graphic-value/ExtendTokenGlobalRestrictionValue.vue';
import { TransactionType } from 'bitxor-sdk';
export default {
	extends: GraphicComponent,

	name: 'ExtendGraphicValueField',

	props: {
		value: {
			type: [Array, Object],
			required: true,
			default: () => []
		},
		transactionType: {
			type: [String, Number],
			required: true
		}
	},

	components: {
		ExtendTransferValue,
		ExtendNamespaceRegistrationValue,
		ExtendAliasValue,
		ExtendTokenSupplyChangeValue,
		ExtendTokenSupplyRevocationValue,
		ExtendTokenDefinitionValue,
		ExtendKeyLinkValue,
		ExtendSecretLockValue,
		ExtendSecretProofValue,
		ExtendHashLockValue,
		ExtendMetadataValue,
		ExtendAccountOperationRestrictionValue,
		ExtendAccountTokenRestrictionValue,
		ExtendAccountAddressRestrictionValue,
		ExtendTokenGlobalRestrictionValue
	},

	data () {
		return {
			TransactionType
		};
	},

	computed: {
		extendGraphicComponent () {
			switch (this.transactionType) {
			case TransactionType.TRANSFER: return 'ExtendTransferValue';
			case 'outgoing_' + TransactionType.TRANSFER: return 'ExtendTransferValue';
			case 'incoming_' + TransactionType.TRANSFER: return 'ExtendTransferValue';
			case TransactionType.NAMESPACE_REGISTRATION: return 'ExtendNamespaceRegistrationValue';
			case TransactionType.ADDRESS_ALIAS:
			case TransactionType.TOKEN_ALIAS: return 'ExtendAliasValue';
			case TransactionType.TOKEN_SUPPLY_CHANGE: return 'ExtendTokenSupplyChangeValue';
			case TransactionType.TOKEN_SUPPLY_REVOCATION: return 'ExtendTokenSupplyRevocationValue';
			case TransactionType.TOKEN_DEFINITION: return 'ExtendTokenDefinitionValue';
			case TransactionType.VOTING_KEY_LINK:
			case TransactionType.VRF_KEY_LINK:
			case TransactionType.NODE_KEY_LINK:
			case TransactionType.ACCOUNT_KEY_LINK: return 'ExtendKeyLinkValue';
			case TransactionType.SECRET_LOCK: return 'ExtendSecretLockValue';
			case TransactionType.SECRET_PROOF: return 'ExtendSecretProofValue';
			case TransactionType.HASH_LOCK: return 'ExtendHashLockValue';
			case TransactionType.ACCOUNT_METADATA:
			case TransactionType.TOKEN_METADATA:
			case TransactionType.NAMESPACE_METADATA: return 'ExtendMetadataValue';
			case TransactionType.ACCOUNT_OPERATION_RESTRICTION: return 'ExtendAccountOperationRestrictionValue';
			case TransactionType.ACCOUNT_TOKEN_RESTRICTION: return 'ExtendAccountTokenRestrictionValue';
			case TransactionType.ACCOUNT_ADDRESS_RESTRICTION: return 'ExtendAccountAddressRestrictionValue';
			case TransactionType.TOKEN_GLOBAL_RESTRICTION: return 'ExtendTokenGlobalRestrictionValue';
			}
			return null;
		}
	}

};
</script>
