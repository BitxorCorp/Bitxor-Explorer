import {
	TransactionType,
	TokenSupplyChangeAction,
	NamespaceRegistrationType,
	AliasAction,
	LinkAction,
	AccountType,
	AccountKeyTypeFlags,
	LockHashAlgorithm,
	NetworkType,
	MetadataType,
	ReceiptType,
	ResolutionType,
	AddressRestrictionFlag,
	TokenRestrictionFlag,
	OperationRestrictionFlag,
	TokenRestrictionEntryType,
	TokenRestrictionType,
	LockStatus,
	BlockType
} from 'bitxor-sdk';

class Constants {
	static PageSize = 25

	static Message = {
		UNLIMITED: 'UNLIMITED',
		UNAVAILABLE: 'N/A',
		INFINITY: 'INFINITY',
		TOKEN: 'TOKEN',
		ADDRESS: 'ADDRESS',
		NO_ALIAS: 'NO ALIAS',
		ACTIVE: 'ACTIVE',
		INACTIVE: 'INACTIVE',
		UNKNOWN: 'UNKNOWN',
		EXPIRED: 'EXPIRED'
	}

	static TransactionType = {
		[TransactionType.TRANSFER]: 'Transfer',
		[TransactionType.NAMESPACE_REGISTRATION]: 'Namespace Registration',
		[TransactionType.ADDRESS_ALIAS]: 'Address Alias',
		[TransactionType.TOKEN_ALIAS]: 'Token Alias',
		[TransactionType.TOKEN_DEFINITION]: 'Token Definition',
		[TransactionType.TOKEN_SUPPLY_CHANGE]: 'Token Supply Change',
		[TransactionType.TOKEN_SUPPLY_REVOCATION]: 'Reclaim',
		[TransactionType.MULTISIG_ACCOUNT_MODIFICATION]: 'Multisig Account Modification',
		[TransactionType.AGGREGATE_COMPLETE]: 'Aggregate Complete',
		[TransactionType.AGGREGATE_BONDED]: 'Aggregate Bonded',
		[TransactionType.HASH_LOCK]: 'Hash Lock',
		[TransactionType.SECRET_LOCK]: 'Secret Lock',
		[TransactionType.SECRET_PROOF]: 'Secret Proof',
		[TransactionType.ACCOUNT_ADDRESS_RESTRICTION]: 'Account Address Restriction',
		[TransactionType.ACCOUNT_TOKEN_RESTRICTION]: 'Account Token Restriction',
		[TransactionType.ACCOUNT_OPERATION_RESTRICTION]: 'Account Operation Restriction',
		[TransactionType.ACCOUNT_KEY_LINK]: 'Account Key Link',
		[TransactionType.TOKEN_ADDRESS_RESTRICTION]: 'Token Address Restriction',
		[TransactionType.TOKEN_GLOBAL_RESTRICTION]: 'Token Global Restriction',
		[TransactionType.ACCOUNT_METADATA]: 'Account Metadata',
		[TransactionType.TOKEN_METADATA]: 'Token Metadata',
		[TransactionType.NAMESPACE_METADATA]: 'Namespace Metadata',
		[TransactionType.VRF_KEY_LINK]: 'VRF Key Link',
		[TransactionType.VOTING_KEY_LINK]: 'Voting Key Link',
		[TransactionType.NODE_KEY_LINK]: 'Node Key Link'
	}

	static TokenSupplyChangeAction = {
		[TokenSupplyChangeAction.Increase]: 'Increase',
		[TokenSupplyChangeAction.Decrease]: 'Decrease'
	}

	static NamespaceRegistrationType = {
		[NamespaceRegistrationType.RootNamespace]: 'rootNamespace',
		[NamespaceRegistrationType.SubNamespace]: 'Sub Namespace'
	}

	static AliasAction = {
		[AliasAction.Link]: 'Link',
		[AliasAction.Unlink]: 'Unlink'
	}

	static LinkAction = {
		[LinkAction.Link]: 'Link',
		[LinkAction.Unlink]: 'Unlink'
	}

	static AccountType = {
		[AccountType.Unlinked]: 'Unlinked',
		[AccountType.Main]: 'Main',
		[AccountType.Remote]: 'Remote',
		[AccountType.Remote_Unlinked]: 'Remote Unlinked'
	}

	static AccountKeyTypeFlags = {
		[AccountKeyTypeFlags.Unset]: 'Unset',
		[AccountKeyTypeFlags.Linked]: 'Linked',
		[AccountKeyTypeFlags.VRF]: 'VRF',
		[AccountKeyTypeFlags.Node]: 'Node',
		[AccountKeyTypeFlags.All]: 'All'
	}

	static LockHashAlgorithm = {
		[LockHashAlgorithm.Op_Sha3_256]: 'Sha3 256',
		[LockHashAlgorithm.Op_Hash_160]: 'Hash 160',
		[LockHashAlgorithm.Op_Hash_256]: 'Hash 256'
	}

	static MetadataType = {
		[MetadataType.Account]: 'Account',
		[MetadataType.Token]: 'Token',
		[MetadataType.Namespace]: 'Namespace'
	}

	static ReceiptType = {
		[ReceiptType.Harvest_Fee]: 'Harvest Fee',
		[ReceiptType.LockHash_Created]: 'LockHash Created',
		[ReceiptType.LockHash_Completed]: 'LockHash Completed',
		[ReceiptType.LockHash_Expired]: 'LockHash Expired',
		[ReceiptType.LockSecret_Created]: 'LockSecret Created',
		[ReceiptType.LockSecret_Completed]: 'LockSecret Completed',
		[ReceiptType.LockSecret_Expired]: 'LockSecret Expired',
		[ReceiptType.Token_Levy]: 'Token Levy',
		[ReceiptType.Token_Rental_Fee]: 'Token Rental Fee',
		[ReceiptType.Namespace_Rental_Fee]: 'Namespace Rental Fee',
		[ReceiptType.Token_Expired]: 'Token Expired',
		[ReceiptType.Namespace_Expired]: 'Namespace Expired',
		[ReceiptType.Namespace_Deleted]: 'Namespace Deleted',
		[ReceiptType.Inflation]: 'Inflation'
	}

	static ResolutionType = {
		[ResolutionType.Address]: 'Address',
		[ResolutionType.Token]: 'Token'
	}

	static NetworkType = {
		[NetworkType.MAIN_NET]: 'MAINNET',
		[NetworkType.TEST_NET]: 'TESTNET'
	}

	static RoleType = {
		1: 'Peer node',
		2: 'Api node',
		3: 'Peer Api node',
		4: 'Voting node',
		5: 'Peer Voting node',
		6: 'Api Voting node',
		7: 'Peer Api Voting node'
	}

	static AddressRestrictionFlag = {
		[AddressRestrictionFlag.AllowIncomingAddress]: 'Allow Incoming Addresses',
		[AddressRestrictionFlag.AllowOutgoingAddress]: 'Allow Outgoing Addresses',
		[AddressRestrictionFlag.BlockIncomingAddress]: 'Block Incoming Addresses',
		[AddressRestrictionFlag.BlockOutgoingAddress]: 'Block Outgoing Addresses'
	}

	static TokenRestrictionFlag = {
		[TokenRestrictionFlag.AllowToken]: 'Allow Tokens',
		[TokenRestrictionFlag.BlockToken]: 'Block Tokens'
	}

	static OperationRestrictionFlag = {
		[OperationRestrictionFlag.AllowOutgoingTransactionType]: 'Allow Outgoing Transactions',
		[OperationRestrictionFlag.BlockOutgoingTransactionType]: 'Block Outgoing Transactions'
	}

	static TokenRestrictionEntryType = {
		[TokenRestrictionEntryType.ADDRESS]: 'Token address restriction',
		[TokenRestrictionEntryType.GLOBAL]: 'Token global restriction'
	}

	static TokenRestrictionType = {
		[TokenRestrictionType.EQ]: 'tokenRestrictionType.EQ',
		[TokenRestrictionType.GE]: 'tokenRestrictionType.GE',
		[TokenRestrictionType.GT]: 'tokenRestrictionType.GT',
		[TokenRestrictionType.LE]: 'tokenRestrictionType.LE',
		[TokenRestrictionType.LT]: 'tokenRestrictionType.LT',
		[TokenRestrictionType.NE]: 'tokenRestrictionType.NE',
		[TokenRestrictionType.NONE]: 'tokenRestrictionType.NONE'
	}

	static MerkleRootsOrder = [
		'AccountState',
		'Namespace',
		'Token',
		'Multisig',
		'HashLockInfo',
		'SecretLockInfo',
		'AccountRestriction',
		'TokenRestriction',
		'Metadata'
	];

	static ReceiptTransactionStatementType = {
		BalanceChangeReceipt: 'Balance Change Receipt',
		BalanceTransferReceipt: 'Balance Transfer Receipt',
		InflationReceipt: 'Inflation Receipt',
		ArtifactExpiryReceipt: 'Artifact Expiry Receipt'
	}

	static LockStatusType = {
		[LockStatus.UNUSED]: 'Unused',
		[LockStatus.USED]: 'Used'
	}

	static BlockType = {
		[BlockType.ImportanceBlock]: 'Importance Block',
		[BlockType.GenesisBlock]: 'Genesis Block',
		[BlockType.NormalBlock]: 'Normal Block'
	}

	static EpochStatus = {
		CURRENT: 'Current',
		FUTURE: 'Future',
		EXPIRED: 'Expired'
	}
}

export default Constants;
