import Constants from '../config/constants';
import http from '../infrastructure/http';
import {
	TransactionType,
	TransactionGroup,
	AliasType,
	NamespaceRegistrationType,
	AccountOrderBy,
	MetadataType,
	TokenRestrictionEntryType,
	ReceiptType
} from 'bitxor-sdk';

const customTransactionReceiptFilter = {
	balanceTransfer: {
		receiptTypes: [
			ReceiptType.Token_Rental_Fee,
			ReceiptType.Namespace_Rental_Fee
		],
		receiptTransactionStatementType: Constants.ReceiptTransactionStatementType.BalanceTransferReceipt
	},
	balanceChange: {
		receiptTypes: [
			ReceiptType.Harvest_Fee,
			ReceiptType.LockHash_Created,
			ReceiptType.LockHash_Completed,
			ReceiptType.LockHash_Expired,
			ReceiptType.LockSecret_Created,
			ReceiptType.LockSecret_Completed,
			ReceiptType.LockSecret_Expired
		],
		receiptTransactionStatementType: Constants.ReceiptTransactionStatementType.BalanceChangeReceipt
	},
	artifactExpiry: {
		receiptTypes: [
			ReceiptType.Token_Expired,
			ReceiptType.Namespace_Expired,
			ReceiptType.Namespace_Deleted
		],
		receiptTransactionStatementType: Constants.ReceiptTransactionStatementType.ArtifactExpiryReceipt
	},
	inflation: {
		receiptTypes: [
			ReceiptType.Inflation
		],
		receiptTransactionStatementType: Constants.ReceiptTransactionStatementType.InflationReceipt
	}
};

export const transaction = [
	{
		label: 'Recent',
		icon: 'mdi-clock-outline',
		value: {}
	},
	{
		label: 'Unconfirmed',
		icon: 'mdi-dots-horizontal',
		value: { group: TransactionGroup.Unconfirmed }
	},
	{
		label: 'Partial',
		icon: 'mdi-dots-horizontal',
		value: { group: TransactionGroup.Partial }
	},
	{
		label: 'Transfer',
		icon: 'mdi-swap-vertical',
		value: { type: [TransactionType.TRANSFER] }
	},
	{
		label: 'Account',
		icon: 'mdi-account',
		value: {
			type: [
				TransactionType.ADDRESS_ALIAS,
				TransactionType.MULTISIG_ACCOUNT_MODIFICATION,
				TransactionType.ACCOUNT_ADDRESS_RESTRICTION,
				TransactionType.ACCOUNT_TOKEN_RESTRICTION,
				TransactionType.ACCOUNT_OPERATION_RESTRICTION,
				TransactionType.ACCOUNT_KEY_LINK,
				TransactionType.ACCOUNT_METADATA,
				TransactionType.VRF_KEY_LINK,
				TransactionType.VOTING_KEY_LINK,
				TransactionType.NODE_KEY_LINK
			]
		}
	},
	{
		label: 'Aggregate',
		icon: 'mdi-gamepad-circle',
		value: {
			type: [
				TransactionType.AGGREGATE_COMPLETE,
				TransactionType.AGGREGATE_BONDED,
				TransactionType.HASH_LOCK
			]
		}
	},
	{
		label: 'Alias',
		icon: 'mdi-comment-account',
		value: {
			type: [
				TransactionType.ADDRESS_ALIAS,
				TransactionType.TOKEN_ALIAS
			]
		}
	},
	{
		label: 'Metadata',
		icon: 'mdi-xml',
		value: {
			type: [
				TransactionType.ACCOUNT_METADATA,
				TransactionType.TOKEN_METADATA,
				TransactionType.NAMESPACE_METADATA
			]
		}
	},
	{
		label: 'Token',
		icon: 'mdi-circle',
		value: {
			type: [
				TransactionType.TOKEN_ALIAS,
				TransactionType.TOKEN_DEFINITION,
				TransactionType.TOKEN_SUPPLY_CHANGE,
				TransactionType.TOKEN_SUPPLY_REVOCATION,
				TransactionType.ACCOUNT_TOKEN_RESTRICTION,
				TransactionType.TOKEN_ADDRESS_RESTRICTION,
				TransactionType.TOKEN_GLOBAL_RESTRICTION,
				TransactionType.TOKEN_METADATA
			]
		}
	},
	{
		label: 'Namespace',
		icon: 'mdi-tag',
		value: {
			type: [
				TransactionType.NAMESPACE_REGISTRATION,
				TransactionType.NAMESPACE_METADATA
			]
		}
	},
	{
		label: 'Restriction',
		icon: 'mdi-alert',
		value: {
			type: [
				TransactionType.ACCOUNT_ADDRESS_RESTRICTION,
				TransactionType.ACCOUNT_TOKEN_RESTRICTION,
				TransactionType.ACCOUNT_OPERATION_RESTRICTION,
				TransactionType.TOKEN_ADDRESS_RESTRICTION,
				TransactionType.TOKEN_GLOBAL_RESTRICTION
			]
		}
	},
	{
		label: 'Secret',
		icon: 'mdi-lock',
		value: {
			type: [
				TransactionType.SECRET_LOCK,
				TransactionType.SECRET_PROOF
			]
		}
	},
	{
		label: 'Key Link',
		icon: 'mdi-link',
		value: {
			type: [
				TransactionType.VOTING_KEY_LINK,
				TransactionType.VRF_KEY_LINK,
				TransactionType.NODE_KEY_LINK,
				TransactionType.ACCOUNT_KEY_LINK
			]
		}
	}
];

export const account = [
	{
		label: 'Recent',
		icon: 'mdi-clock-outline',
		value: {}
	},
	{
		label: 'Rich List',
		icon: 'mdi-cash',
		value: {
			orderBy: AccountOrderBy.Balance,
			tokenId: http.networkCurrency.tokenId
		}
	}
];

export const namespace = [
	{
		label: 'Recent',
		icon: 'mdi-clock-outline',
		value: {}
	},
	{
		label: 'Address Alias',
		icon: 'mdi-account',
		value: {
			aliasType: AliasType.Address
		}
	},
	{
		label: 'Token Alias',
		icon: 'mdi-circle',
		value: {
			aliasType: AliasType.Token
		}
	},
	{
		label: 'Root',
		icon: 'mdi-tag',
		value: {
			registrationType: NamespaceRegistrationType.RootNamespace
		}
	},
	{
		label: 'Sub',
		icon: 'mdi-tag',
		value: {
			registrationType: NamespaceRegistrationType.SubNamespace
		}
	}
];

export const metadata = [
	{
		label: 'Recent',
		icon: 'mdi-clock-outline',
		value: {}
	},
	{
		label: 'Address Alias',
		icon: 'mdi-account',
		value: {
			metadataType: MetadataType.Account
		}
	},
	{
		label: 'Token Alias',
		icon: 'mdi-circle',
		value: {
			metadataType: MetadataType.Token
		}
	},
	{
		label: 'Namespace',
		icon: 'mdi-tag',
		value: {
			metadataType: MetadataType.Namespace
		}
	}
];

export const tokenRestriction = [
	{
		label: 'Token Global Restriction',
		icon: 'mdi-alert',
		value: {
			entryType: TokenRestrictionEntryType.GLOBAL
		}
	},
	{
		label: 'Token Address Restriction',
		icon: 'mdi-account',
		value: {
			entryType: TokenRestrictionEntryType.ADDRESS
		}
	}
];

export const nodeRoles = [
	{
		label: 'All Nodes',
		icon: '',
		value: {
			rolesRaw: null
		},
		exportCSV: {
			isActive: true,
			name: 'nodeListCSV'
		}
	},
	{
		label: Constants.RoleType[1],
		icon: '',
		value: {
			rolesRaw: 1
		},
		exportCSV: {
			isActive: true,
			name: 'nodeListCSV'
		}
	},
	{
		label: Constants.RoleType[2],
		icon: '',
		value: {
			rolesRaw: 2
		},
		exportCSV: {
			isActive: true,
			name: 'nodeListCSV'
		}
	},
	{
		label: Constants.RoleType[3],
		icon: '',
		value: {
			rolesRaw: 3
		},
		exportCSV: {
			isActive: true,
			name: 'nodeListCSV'
		}
	},
	{
		label: Constants.RoleType[4],
		icon: '',
		value: {
			rolesRaw: 4
		},
		exportCSV: {
			isActive: true,
			name: 'nodeListCSV'
		}
	},
	{
		label: Constants.RoleType[5],
		icon: '',
		value: {
			rolesRaw: 5
		},
		exportCSV: {
			isActive: true,
			name: 'nodeListCSV'
		}
	},
	{
		label: Constants.RoleType[6],
		icon: '',
		value: {
			rolesRaw: 6
		},
		exportCSV: {
			isActive: true,
			name: 'nodeListCSV'
		}
	},
	{
		label: Constants.RoleType[7],
		icon: '',
		value: {
			rolesRaw: 7
		},
		exportCSV: {
			isActive: true,
			name: 'nodeListCSV'
		}
	}
];

export const payouts = [
	{
		label: 'rounds',
		value: 'rounds'
	},
	{
		label: 'voting',
		value: 'voting'
	}
];

export const accountTransactionReceipt = [
	{
		label: Constants.ReceiptTransactionStatementType.BalanceChangeReceipt,
		icon: 'mdi-receipt',
		value: {
			...customTransactionReceiptFilter.balanceChange,
			receiptTypes: customTransactionReceiptFilter.balanceChange.receiptTypes.filter(type => type !== ReceiptType.Harvest_Fee)
		}
	},
	{
		label: Constants.ReceiptTransactionStatementType.BalanceTransferReceipt,
		icon: 'mdi-receipt',
		value: {
			...customTransactionReceiptFilter.balanceTransfer
		}
	}
];

export const blockTransactionReceipt = [
	{
		label: Constants.ReceiptTransactionStatementType.BalanceChangeReceipt,
		icon: 'mdi-alert',
		value: {
			...customTransactionReceiptFilter.balanceChange
		}
	},
	{
		label: Constants.ReceiptTransactionStatementType.BalanceTransferReceipt,
		icon: 'mdi-alert',
		value: {
			...customTransactionReceiptFilter.balanceTransfer
		}
	},
	{
		label: Constants.ReceiptTransactionStatementType.ArtifactExpiryReceipt,
		icon: 'mdi-alert',
		value: {
			...customTransactionReceiptFilter.artifactExpiry
		}
	},
	{
		label: Constants.ReceiptTransactionStatementType.InflationReceipt,
		icon: 'mdi-alert',
		value: {
			...customTransactionReceiptFilter.inflation
		}
	}
];
