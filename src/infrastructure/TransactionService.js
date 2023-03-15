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

import http from './http';
import Constants from '../config/constants';
import helper from '../helper';
import {
	BlockService,
	LockService,
	CreateTransaction
} from '../infrastructure';
import { toArray } from 'rxjs/operators';
import {
	TransactionType,
	Address,
	TransactionInfo,
	AggregateTransactionInfo,
	TransactionGroup,
	Order,
	UInt64,
	Token
} from 'bitxor-sdk';

class TransactionService {
  /**
   * Gets a transaction status for a transaction hash
   * @param {string} hash Transaction hash
   * @returns {object} TransactionStatus object
   */
  static getTransactionStatus = hash => {
  	return new Promise((resolve, reject) => {
  		let transactionStatus = {
  			message: null,
  			detail: {}
  		};

  		http.createRepositoryFactory.createTransactionStatusRepository()
  			.getTransactionStatus(hash)
  			.toPromise()
  			.then(response => {
  				transactionStatus.message = response.group;
  				transactionStatus.detail = response;
  				resolve(transactionStatus);
  			})
  			.catch(error => {
				  // handle REST error https://github.com/bitxorcorp/bitxorcore-rest/pull/499
				  // Todo: Remove if statement, after REST error is fix.
				  if (-1 === error.message.search('statusCode')) {
  					transactionStatus.message = error.message;
  					transactionStatus.detail = error;
  					resolve(transactionStatus);
				  }
  				resolve(transactionStatus);
  			});
  	});
  }

  /**
   * Gets a transaction from hash.
   * @param {string} hash Transaction hash.
   * @param {string} transactionGroup transaction status.
   * @returns {object} Transaction.
   */
  static getTransaction = async (hash, transactionGroup) => {
  	const transaction = await http.createRepositoryFactory.createTransactionRepository()
  		.getTransaction(hash, transactionGroup)
  		.toPromise();

  	return transaction;
  }

  /**
   * Gets a transaction from searchCriteria
   * @param {object} transactionSearchCriteria Object of Search Criteria
   * @returns {object} transaction data with pagination info
   */
  static searchTransactions = async transactionSearchCriteria => {
  	const searchTransactions = await http.createRepositoryFactory.createTransactionRepository()
  		.search(transactionSearchCriteria)
  		.toPromise();

  	return searchTransactions;
  }

  /**
   * Gets a transactions from streamer
   * @param {object} transactionSearchCriteria Object of Search Criteria
   * @returns {array} Transaction[]
   */
  static streamerTransactions = async transactionSearchCriteria => {
  	const streamerTransactions = await http.transactionPaginationStreamer
  		.search(transactionSearchCriteria).pipe(toArray())
  		.toPromise();

  	return streamerTransactions;
  }

  /**
   * Gets a transaction's effective paid fee
   * @param {string} hash Transaction hash
   * @returns {string} formatted effectiveFee string
   */
  static getTransactionEffectiveFee = async hash => {
  	let effectiveFee = await http.createRepositoryFactory.createTransactionRepository()
  		.getTransactionEffectiveFee(hash)
  		.toPromise();

  	return helper.toNetworkCurrency(effectiveFee);
  }

  /**
   * Gets Formatted Transaction Info for Vue component
   * @param {string} hash Transaction hash
   * @returns {object} Custom Transaction object
   */
  static getTransactionInfo = async hash => {
  	const transactionStatus = await this.getTransactionStatus(hash);
  	const transactionGroup = transactionStatus.message;
  	const transaction = await this.getTransaction(hash, transactionGroup);

  	const [{ timestamp }, effectiveFee] = await Promise.all([
		  BlockService.getBlockInfo(UInt64.fromUint(transaction.transactionInfo.height))
		  	.catch(() => ({ timestamp: null })),
		  this.getTransactionEffectiveFee(hash)
		  	.catch(() => null)
	  ]);

  	const formattedTransaction = await this.createTransactionFromSDK(transaction);

  	const transactionInfo = {
		  ...formattedTransaction,
		  blockHeight: formattedTransaction.transactionInfo.height || undefined,
		  transactionHash: formattedTransaction.transactionInfo.hash,
		  effectiveFee,
		  timestamp,
		  status: transactionStatus.detail.code,
		  confirm: transactionStatus.message
  	};

  	return transactionInfo;
  }

  /**
   * Gets Formatted Hash Lock Info for Vue component
   * @param {string} hash Transaction hash
   * @returns {object} Custom Hash Lock object
   */
  static getHashLockInfo = async hash => {
  	const hashInfo = await LockService.getHashLock(hash);

  	const tokens = [new Token(hashInfo.tokenId, hashInfo.amount)];

  	const tokensFieldObject = await helper.tokensFieldObjectBuilder(tokens);

  	return {
		  ...hashInfo,
		  tokens: tokensFieldObject
	  };
  }

  /**
   * Gets array of transactions
   * @param {object} pageInfo - object for page info such as pageNumber, pageSize
   * @param {object} filterValue - object for search criteria
   * @returns {array} Formatted transactionDTO[]
   */
  static getTransactionList = async (pageInfo, filterValue) => {
  	const { pageNumber, pageSize } = pageInfo;
  	const searchCriteria = {
  		pageNumber,
  		pageSize,
  		order: Order.Desc,
  		type: [],
  		group: TransactionGroup.Confirmed,
  		...filterValue
  	};

  	const searchTransactions = await this.searchTransactions(searchCriteria);

  	const transactions = {
  		...searchTransactions,
  		data: searchTransactions.data.map(transaction => this.formatTransaction(transaction))
  	};

  	await Promise.all(transactions.data.map(async transaction => {
		  if (transaction?.recipientAddress) {
			  const { recipientAddress, transactionBody, transactionInfo } = transaction;

  			return (transactionBody.recipient = await helper.resolvedAddress(recipientAddress, transactionInfo.height));
  		}
  	}));

  	if (searchCriteria.group === TransactionGroup.Partial || searchCriteria.group === TransactionGroup.Unconfirmed) {
  		return {
  			...transactions,
  			data: transactions.data.map(transaction => ({
  				...transaction,
  				transactionHash: transaction.transactionInfo.hash,
  				transactionType: transaction.type,
  				recipient: transaction.transactionBody?.recipient,
  				extendGraphicValue: this.extendGraphicValue(transaction)
  			}))
  		};
  	}

  	const blocksHeight = [...new Set(transactions.data.map(data => data.transactionInfo.height))];

  	const blockInfos = await Promise.all(blocksHeight.map(height => BlockService.getBlockInfo(height)));

  	// Cap data in 50 pages
  	const totalRecords = 50 * pageSize;

  	return {
  		...transactions,
  		totalRecords,
  		data: transactions.data.map(({ deadline, ...transaction }) => ({
  			...transaction,
  			age: helper.convertToUTCDate(blockInfos.find(block => block.height === transaction.transactionInfo.height).timestamp),
  			height: transaction.transactionInfo.height,
  			transactionHash: transaction.transactionInfo.hash,
  			transactionType: transaction.type,
  			recipient: transaction.transactionBody?.recipient,
  			extendGraphicValue: this.extendGraphicValue(transaction)
  		}))
  	};
  }

  /**
   * Format Transaction
   * @param {object} transaction transaction object from endpoint.
   * @returns {object} readable transactionDTO object.
   */
  static formatTransaction = transaction => ({
  	...transaction,
  	deadline: helper.convertDeadlinetoDate(transaction.deadline.adjustedValue),
  	maxFee: helper.toNetworkCurrency(Number(transaction.maxFee.toString())),
  	signer: transaction.signer.address.plain(),
  	transactionBody: this.formatTransactionBody(transaction),
  	transactionInfo: this.formatTransactionInfo(transaction.transactionInfo)
  })

  /**
   * Format Different Type of Transaction such as TransferTransaction
   * @param {object} transactionBody transaction body info.
   * @returns {object} readable TransactionBody object
   */
  static formatTransactionBody = transactionBody => {
  	switch (transactionBody.type) {
  	case TransactionType.TRANSFER:
  		return {
  			transactionType: transactionBody.type,
  			recipient: transactionBody.recipientAddress,
  			tokens: transactionBody.tokens.map(token => ({
  				...token,
  				id: token.id.toHex(),
  				amount: token.amount.compact().toString()
  			})),
  			message: transactionBody.message
  		};

  	case TransactionType.NAMESPACE_REGISTRATION:
  		let parentIdHex = transactionBody.parentId ? transactionBody.parentId.toHex() : '';

  		let duration = transactionBody.duration ? transactionBody.duration.compact() : 0;

  		return {
  			transactionType: transactionBody.type,
  			recipient: http.networkConfig.NamespaceRentalFeeSinkAddress.address,
  			registrationType: Constants.NamespaceRegistrationType[transactionBody.registrationType],
  			namespaceName: transactionBody.namespaceName,
  			namespaceId: transactionBody.namespaceId.toHex(),
  			parentId: '' === parentIdHex ? Constants.Message.UNAVAILABLE : parentIdHex,
  			duration: 0 === duration ? Constants.Message.UNLIMITED : duration
  		};

  	case TransactionType.ADDRESS_ALIAS:
  		return {
  			transactionType: transactionBody.type,
  			aliasAction: Constants.AliasAction[transactionBody.aliasAction],
  			namespaceId: transactionBody.namespaceId.toHex(),
  			namespaceName: transactionBody.namespaceId.fullName,
  			address: transactionBody.address.address
  		};

  	case TransactionType.TOKEN_ALIAS:
  		return {
  			transactionType: transactionBody.type,
  			aliasAction: Constants.AliasAction[transactionBody.aliasAction],
  			namespaceId: transactionBody.namespaceId.id.toHex(),
  			namespaceName: transactionBody.namespaceId.fullName,
  			tokenId: transactionBody.tokenId.id.toHex()
  		};

  	case TransactionType.TOKEN_DEFINITION:
  		return {
  			transactionType: transactionBody.type,
  			recipient: http.networkConfig.TokenRentalSinkAddress.address,
  			tokenId: transactionBody.tokenId.toHex(),
  			divisibility: transactionBody.divisibility,
  			duration: transactionBody.duration.compact(),
  			nonce: transactionBody.nonce.toHex(),
  			supplyMutable: transactionBody.flags.supplyMutable,
  			transferable: transactionBody.flags.transferable,
  			restrictable: transactionBody.flags.restrictable,
  			revokable: transactionBody.flags.revokable
  		};

  	case TransactionType.TOKEN_SUPPLY_CHANGE:
  		return {
  			transactionType: transactionBody.type,
  			tokenId: transactionBody.tokenId.id.toHex(),
  			action: Constants.TokenSupplyChangeAction[transactionBody.action],
  			delta: transactionBody.delta.compact()
  		};
  	case TransactionType.TOKEN_SUPPLY_REVOCATION:
  		return {
  			transactionType: transactionBody.type,
  			address: transactionBody.sourceAddress.address,
  			tokens: [{
  				id: transactionBody.token.id.toHex(),
  				amount: transactionBody.token.amount.compact().toString()
  			}]
  		};

  	case TransactionType.MULTISIG_ACCOUNT_MODIFICATION:
  		return {
  			transactionType: transactionBody.type,
  			minApprovalDelta: transactionBody.minApprovalDelta,
  			minRemovalDelta: transactionBody.minRemovalDelta,
  			addressAdditions: transactionBody.addressAdditions.map(address => address.address),
  			addressDeletions: transactionBody.addressDeletions.map(address => address.address)
  		};

  	case TransactionType.AGGREGATE_COMPLETE:
  		return {
  			transactionType: transactionBody.type,
  			innerTransactions: transactionBody.innerTransactions,
  			cosignatures: transactionBody.cosignatures.map(cosigner => ({
  				...cosigner,
  				signer: cosigner.signer.address.address
  			}))
  		};

  	case TransactionType.AGGREGATE_BONDED:
  		return {
  			transactionType: transactionBody.type,
  			innerTransactions: transactionBody.innerTransactions,
  			cosignatures: transactionBody.cosignatures.map(cosigner => ({
  				...cosigner,
  				signer: cosigner.signer.address.address
  			}))
  		};

  	case TransactionType.HASH_LOCK:
  		return {
  			transactionType: transactionBody.type,
  			duration: transactionBody.duration.compact(),
  			tokenId: transactionBody.token.id.toHex(),
  			amount: helper.toNetworkCurrency(transactionBody.token.amount),
  			hash: transactionBody.hash
  		};

  	case TransactionType.SECRET_LOCK:
  		return {
  			transactionType: transactionBody.type,
  			duration: transactionBody.duration.compact(),
  			tokenId: transactionBody.token.id.toHex(),
  			amount: helper.toNetworkCurrency(transactionBody.token.amount),
  			secret: transactionBody.secret,
  			recipient: transactionBody.recipientAddress,
  			hashAlgorithm: Constants.LockHashAlgorithm[transactionBody.hashAlgorithm]
  		};

  	case TransactionType.SECRET_PROOF:
  		return {
  			transactionType: transactionBody.type,
  			hashAlgorithm: Constants.LockHashAlgorithm[transactionBody.hashAlgorithm],
  			recipient: transactionBody.recipientAddress,
  			secret: transactionBody.secret,
  			proof: transactionBody.proof
  		};
  	case TransactionType.ACCOUNT_ADDRESS_RESTRICTION:
  		return {
  			transactionType: transactionBody.type,
  			restrictionType: Constants.AddressRestrictionFlag[transactionBody.restrictionFlags],
  			restrictionAddressAdditions: transactionBody.restrictionAdditions.map(restriction => {
  				if (restriction instanceof Address)
  					return restriction.address;

  				return restriction.fullName;
  			}),
  			restrictionAddressDeletions: transactionBody.restrictionDeletions.map(restriction => {
  				if (restriction instanceof Address)
  					return restriction.address;

  				return restriction.fullName;
  			})
  		};

  	case TransactionType.ACCOUNT_TOKEN_RESTRICTION:
  		return {
  			transactionType: transactionBody.type,
  			restrictionType: Constants.TokenRestrictionFlag[transactionBody.restrictionFlags],
  			restrictionTokenAdditions: transactionBody.restrictionAdditions.map(token => token.id.toHex()),
  			restrictionTokenDeletions: transactionBody.restrictionDeletions.map(token => token.id.toHex())
  		};

  	case TransactionType.ACCOUNT_OPERATION_RESTRICTION:
  		return {
  			transactionType: transactionBody.type,
  			restrictionType: Constants.OperationRestrictionFlag[transactionBody.restrictionFlags],
  			restrictionOperationAdditions: transactionBody.restrictionAdditions,
  			restrictionOperationDeletions: transactionBody.restrictionDeletions
  		};

  	case TransactionType.TOKEN_ADDRESS_RESTRICTION:
  		return {
  			transactionType: transactionBody.type,
  			tokenId: transactionBody.tokenId.toHex(),
  			targetAddress: transactionBody.targetAddress,
  			restrictionKey: transactionBody.restrictionKey.toHex(),
  			previousRestrictionValue: transactionBody.previousRestrictionValue.toString(),
  			newRestrictionValue: transactionBody.newRestrictionValue.toString()
  		};

  	case TransactionType.TOKEN_GLOBAL_RESTRICTION:
  		return {
  			transactionType: transactionBody.type,
  			referenceTokenId: '0000000000000000' === transactionBody.referenceTokenId.toHex()
			  ? transactionBody.tokenId.toHex()
			  : transactionBody.referenceTokenId.toHex(),
  			restrictionKey: transactionBody.restrictionKey.toHex(),
  			previousRestrictionType: Constants.TokenRestrictionType[transactionBody.previousRestrictionType],
  			previousRestrictionValue: transactionBody.previousRestrictionValue.compact(),
  			newRestrictionType: Constants.TokenRestrictionType[transactionBody.newRestrictionType],
  			newRestrictionValue: transactionBody.newRestrictionValue.compact()
  		};

  	case TransactionType.ACCOUNT_METADATA:
  		return {
  			transactionType: transactionBody.type,
  			scopedMetadataKey: transactionBody.scopedMetadataKey.toHex(),
  			targetAddress: transactionBody.targetAddress.address,
  			metadataValue: transactionBody.value,
  			valueSizeDelta: transactionBody.valueSizeDelta
  		};

  	case TransactionType.TOKEN_METADATA:
  		return {
  			transactionType: transactionBody.type,
  			scopedMetadataKey: transactionBody.scopedMetadataKey.toHex(),
  			targetTokenId: transactionBody.targetTokenId.toHex(),
  			targetAddress: transactionBody.targetAddress.address,
  			metadataValue: transactionBody.value,
  			valueSizeDelta: transactionBody.valueSizeDelta
  		};

  	case TransactionType.NAMESPACE_METADATA:
  		return {
  			transactionType: transactionBody.type,
  			scopedMetadataKey: transactionBody.scopedMetadataKey.toHex(),
  			targetNamespaceId: transactionBody.targetNamespaceId.toHex(),
  			targetAddress: transactionBody.targetAddress.address,
  			metadataValue: transactionBody.value,
  			valueSizeDelta: transactionBody.valueSizeDelta
  		};
  	case TransactionType.VOTING_KEY_LINK:
		  return {
  			transactionType: transactionBody.type,
  			linkAction: Constants.LinkAction[transactionBody.linkAction],
  			linkedPublicKey: transactionBody.linkedPublicKey,
  			linkedAccountAddress: Address.createFromPublicKey(transactionBody.linkedPublicKey, http.networkType).plain(),
  			startEpoch: transactionBody.startEpoch,
  			endEpoch: transactionBody.endEpoch
  		};
  	case TransactionType.VRF_KEY_LINK:
  	case TransactionType.NODE_KEY_LINK:
  	case TransactionType.ACCOUNT_KEY_LINK:
  		return {
  			transactionType: transactionBody.type,
  			linkAction: Constants.LinkAction[transactionBody.linkAction],
  			linkedPublicKey: transactionBody.linkedPublicKey,
  			linkedAccountAddress: Address.createFromPublicKey(transactionBody.linkedPublicKey, http.networkType).plain()
  		};
  	}
  }

  /**
   * Format transactionInfoDTO.
   * @param {object} transactionInfo transactionInfoDTO.
   * @returns {object} readable transactionInfoDTO object.
   */
  static formatTransactionInfo = transactionInfo => {
  	if (transactionInfo instanceof TransactionInfo) {
  		return {
  			...transactionInfo,
  			height: transactionInfo.height.compact()
  		};
  	}

  	if (transactionInfo instanceof AggregateTransactionInfo) {
  		return {
  			...transactionInfo
  		};
  	}

  	return {};
  }

  /**
   * extend graphic value for transaction list.
   * @param {object} transactionInfo formatted transaction info.
   * @returns {array} graphicValue.
   */
  static extendGraphicValue = transactionInfo => {
  	const { transactionBody } = transactionInfo;

  	switch (transactionInfo.type) {
  	case TransactionType.TRANSFER:
  		return {
  			nativeToken: helper.getNetworkCurrencyBalance(transactionInfo.tokens),
  			message: transactionBody.message,
  			tokens: transactionBody.tokens.filter(token =>
  				token.id !== http.networkCurrency.tokenId &&
				token.id !== http.networkCurrency.namespaceId)
  		};
  	case TransactionType.NAMESPACE_REGISTRATION:
  		return [{ namespace: {
  			namespaceId: transactionBody.namespaceId,
  			namespaceName: transactionBody.namespaceName
  		}
  		}];
  	case TransactionType.ADDRESS_ALIAS:
  		return [
			  { linkAction: transactionBody.aliasAction }
		  ];
  	case TransactionType.TOKEN_ALIAS:
		  return [
  			{ linkAction: transactionBody.aliasAction }
		  ];
  	case TransactionType.TOKEN_DEFINITION:
		  return [
  			{ tokenId: transactionBody.tokenId }
		  ];
  	case TransactionType.TOKEN_SUPPLY_CHANGE:
		  return [
  			{ action: transactionBody.action }
		  ];
  	case TransactionType.TOKEN_SUPPLY_REVOCATION:
  		return {
  			tokens: transactionBody.tokens
		  };
  	case TransactionType.MULTISIG_ACCOUNT_MODIFICATION:
		  return [
			  { minApprovalDelta: transactionBody.minApprovalDelta },
			  { minRemovalDelta: transactionBody.minRemovalDelta }
		  ];
  	case TransactionType.HASH_LOCK:
		  return [
			  { amount: transactionBody.amount }
		  ];
  	case TransactionType.SECRET_LOCK:
		  return [
			  { secret: transactionBody.secret }
		  ];
  	case TransactionType.SECRET_PROOF:
		  return [
			  { proof: transactionBody.proof }
		  ];
  	case TransactionType.ACCOUNT_ADDRESS_RESTRICTION:
		  return [
			  { restrictionAddressAdditions: transactionBody.restrictionAddressAdditions },
			  { restrictionAddressDeletions: transactionBody.restrictionAddressDeletions }
		  ];
  	case TransactionType.ACCOUNT_TOKEN_RESTRICTION:
		  return [
			  { restrictionTokenAdditions: transactionBody.restrictionTokenAdditions },
			  { restrictionTokenDeletions: transactionBody.restrictionTokenDeletions }
		  ];
  	case TransactionType.ACCOUNT_OPERATION_RESTRICTION:
		  return [
  			{ restrictionOperationAdditions: transactionBody.restrictionOperationAdditions },
  			{ restrictionOperationDeletions: transactionBody.restrictionOperationDeletions }
		  ];
  	case TransactionType.TOKEN_ADDRESS_RESTRICTION:
		  return [
			  { targetAddress: transactionBody.targetAddress }
		  ];
  	case TransactionType.TOKEN_GLOBAL_RESTRICTION:
		  return [
			  { referenceTokenId: transactionBody.referenceTokenId }
		  ];
  	case TransactionType.ACCOUNT_METADATA:
  	case TransactionType.TOKEN_METADATA:
  	case TransactionType.NAMESPACE_METADATA:
		  return [
			  { metadataValue: transactionBody.metadataValue }
		  ];
  	case TransactionType.VOTING_KEY_LINK:
  	case TransactionType.VRF_KEY_LINK:
  	case TransactionType.NODE_KEY_LINK:
  	case TransactionType.ACCOUNT_KEY_LINK:
		  return [
  			{ linkAction: transactionBody.linkAction }
		  ];
  	default:
  		return [];
  	}
  }

  /**
   * Build standalone transaction object for Vue components.
   * @param  {object} transactionDTO - transaction dto from SDK.
   * @returns {object} formatted transactionObj.
   */
  static createStandaloneTransactionFromSDK = async transactionDTO => {
	  const transactionObj = {
		  ...transactionDTO,
		  transactionType: transactionDTO.type,
		  deadline: helper.convertDeadlinetoDate(transactionDTO.deadline.adjustedValue),
		  maxFee: helper.toNetworkCurrency(transactionDTO.maxFee),
		  signer: transactionDTO.signer.address.plain(),
		  transactionInfo: this.formatTransactionInfo(transactionDTO.transactionInfo)
	  };

  	switch (transactionDTO.type) {
  	case TransactionType.TRANSFER:
  		return CreateTransaction.transferTransaction(transactionObj);
  	case TransactionType.NAMESPACE_REGISTRATION:
  		return CreateTransaction.namespaceRegistration(transactionObj);
  	case TransactionType.ADDRESS_ALIAS:
  		return CreateTransaction.addressAlias(transactionObj);
  	case TransactionType.TOKEN_ALIAS:
  		return CreateTransaction.tokenAlias(transactionObj);
  	case TransactionType.TOKEN_DEFINITION:
  		return CreateTransaction.tokenDefinition(transactionObj);
  	case TransactionType.TOKEN_SUPPLY_CHANGE:
  		return CreateTransaction.tokenSupplyChange(transactionObj);
  	case TransactionType.TOKEN_SUPPLY_REVOCATION:
  		return CreateTransaction.tokenSupplyRevocation(transactionObj);
  	case TransactionType.MULTISIG_ACCOUNT_MODIFICATION:
  		return CreateTransaction.multisigAccountModification(transactionObj);
  	case TransactionType.HASH_LOCK:
  		return CreateTransaction.hashLock(transactionObj);
  	case TransactionType.SECRET_LOCK:
  		return CreateTransaction.secretLock(transactionObj);
  	case TransactionType.SECRET_PROOF:
  		return CreateTransaction.secretProof(transactionObj);
  	case TransactionType.ACCOUNT_ADDRESS_RESTRICTION:
  		return CreateTransaction.accountAddressRestriction(transactionObj);
  	case TransactionType.ACCOUNT_TOKEN_RESTRICTION:
  		return CreateTransaction.accountTokenRestriction(transactionObj);
  	case TransactionType.ACCOUNT_OPERATION_RESTRICTION:
  		return CreateTransaction.accountOperationRestriction(transactionObj);
  	case TransactionType.TOKEN_ADDRESS_RESTRICTION:
  		return CreateTransaction.tokenAddressRestriction(transactionObj);
  	case TransactionType.TOKEN_GLOBAL_RESTRICTION:
  		return CreateTransaction.tokenGlobalRestriction(transactionObj);
  	case TransactionType.ACCOUNT_METADATA:
  		return CreateTransaction.accountMetadata(transactionObj);
  	case TransactionType.TOKEN_METADATA:
  		return CreateTransaction.tokenMetadata(transactionObj);
  	case TransactionType.NAMESPACE_METADATA:
  		return CreateTransaction.namespaceMetadata(transactionObj);
  	case TransactionType.VOTING_KEY_LINK:
  		return CreateTransaction.votingKeyLink(transactionObj);
  	case TransactionType.VRF_KEY_LINK:
  		return CreateTransaction.vrfKeyLink(transactionObj);
  	case TransactionType.NODE_KEY_LINK:
  		return CreateTransaction.nodeKeyLink(transactionObj);
  	case TransactionType.ACCOUNT_KEY_LINK:
  		return CreateTransaction.accountKeyLink(transactionObj);
  	default:
  		throw new Error('Unimplemented transaction with type ' + transactionDTO.type);
	  }
  }

  /**
   * Build transaction object for Vue components.
   * @param {object} transactionDTO - transaction dto from SDK
   * @returns {object} transactionObj
   */
  static createTransactionFromSDK = async transactionDTO => {
	  if (transactionDTO.type === TransactionType.AGGREGATE_BONDED
		|| transactionDTO.type === TransactionType.AGGREGATE_COMPLETE) {
  		const innerTransactions = transactionDTO.innerTransactions
		  ? await Promise.all(transactionDTO.innerTransactions.map(async (transaction, index) => {
  			return {
  				index: index + 1,
  				...await this.createStandaloneTransactionFromSDK(transaction)
  			};
  		})) : [];

  		return {
			  ...transactionDTO,
			  innerTransactions,
			  cosignatures: transactionDTO.cosignatures ? transactionDTO.cosignatures.map(cosignature => {
				  return {
					  ...cosignature,
					  signature: cosignature.signature,
					  signer: cosignature.signer.address.plain()
				  };
			  }) : [],
			  deadline: helper.convertDeadlinetoDate(transactionDTO.deadline.adjustedValue),
			  maxFee: helper.toNetworkCurrency(transactionDTO.maxFee),
			  signer: transactionDTO.signer.address.plain(),
			  transactionInfo: this.formatTransactionInfo(transactionDTO.transactionInfo),
			  transactionBody: {
  				transactionType: transactionDTO.type
			  }
		  };
	  }

	  return this.createStandaloneTransactionFromSDK(transactionDTO);
  }
}

export default TransactionService;
