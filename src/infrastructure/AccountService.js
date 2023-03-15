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

import NodeService from './NodeService';
import http from './http';
import { Constants } from '../config';
import helper from '../helper';
import {
	NamespaceService,
	TransactionService,
	ChainService,
	MetadataService,
	LockService,
	ReceiptService,
	TokenService,
	BlockService
} from '../infrastructure';

import {
	Address,
	TransactionType,
	TransactionGroup,
	Order,
	BlockOrderBy,
	ReceiptType,
	Token,
	TokenId
} from 'bitxor-sdk';

class AccountService {
	/**
	 * Gets an AccountInfo for an account.
	 * @param {string} address raw address.
	 * @returns {object} Formatted AccountInfo
	 */
	static getAccount = async address => {
		const account = await http.createRepositoryFactory.createAccountRepository()
			.getAccountInfo(Address.createFromRawAddress(address))
			.toPromise();

		const formattedAccount = this.formatAccountInfo(account);

		return formattedAccount;
	}

	/**
	 * Gets an AccountInfo for an account.
	 * @param {array} addresses account addresses.
	 * @returns {array} Formatted AccountInfos.
	 */
	static getAccounts = async addresses => {
		const accounts = await http.createRepositoryFactory.createAccountRepository()
			.getAccountsInfo(addresses.map(a => Address.createFromRawAddress(a)))
			.toPromise();

		return accounts.map(a => this.formatAccountInfo(a));
	}

	/**
	 * Gets a accounts list from searchCriteria.
	 * @param {object} accountSearchCriteria search Criteria.
	 * @returns {object} formatted account data with pagination info.
	 */
	static searchAccounts = async accountSearchCriteria => {
		const searchAccounts = await http.createRepositoryFactory.createAccountRepository()
			.search(accountSearchCriteria)
			.toPromise();

		return {
			...searchAccounts,
			data: searchAccounts.data.map(account => this.formatAccountInfo(account))
		};
	}

	/**
	 * Get custom Account list dataset into Vue Component
	 * @param {object} pageInfo - pagination info
	 * @param {object} filterValue - search criteria
	 * @returns {object} Custom AccountInfos
	 */
	static getAccountList = async (pageInfo, filterValue) => {
		const { pageNumber, pageSize } = pageInfo;
		const searchCriteria = {
			pageNumber,
			pageSize,
			order: Order.Desc
		};

		// Prevent new TokenId throw error if tokenId is undefined
		if (filterValue.tokenId) {
			Object.assign(searchCriteria, {
				...filterValue,
				tokenId: new TokenId(filterValue.tokenId)
			});
		}

		const accountInfos = await this.searchAccounts(searchCriteria);

		const addresses = accountInfos.data.map(accountInfo => Address.createFromRawAddress(accountInfo.address));

		const accountNames = await NamespaceService.getAccountsNames(addresses);

		const { numAccounts } = await NodeService.getStorageInfo();

		return {
			...accountInfos,
			totalRecords: numAccounts,
			data: accountInfos.data.map(account => ({
				...account,
				balance: helper.getNetworkCurrencyBalance(account.tokens) !== Constants.Message.UNAVAILABLE
					? helper.getNetworkCurrencyBalance(account.tokens)
					: helper.toNetworkCurrency(0),
				accountAliasNames: this.extractAccountNamespace(account, accountNames)
			}))
		};
	}

	/**
	 * Get custom Account info dataset into Vue Component.
	 * @param {string} address - Account address.
	 * @returns {object} Custom AccountInfo.
	 */
	static getAccountInfo = async address => {
		const [ { supplementalPublicKeys, ...accountInfo }, accountNames, { latestFinalizedBlock } ] = await Promise.all([
			this.getAccount(address),
			NamespaceService.getAccountsNames([Address.createFromRawAddress(address)]),
			ChainService.getChainInfo()
		]);

		const getVotingEpochStatus = (startEpoch, endEpoch) => {
			let votingStatus = '';

			if (latestFinalizedBlock.finalizationEpoch >= startEpoch && latestFinalizedBlock.finalizationEpoch <= endEpoch)
				votingStatus = Constants.EpochStatus.CURRENT;

			else if (latestFinalizedBlock.finalizationEpoch < startEpoch)
				votingStatus = Constants.EpochStatus.FUTURE;

			else if (latestFinalizedBlock.finalizationEpoch > endEpoch)
				votingStatus = Constants.EpochStatus.EXPIRED;

			return votingStatus;
		};

		return {
			...accountInfo,
			activityBucket: accountInfo.activityBucket.map(activity => ({
				...activity,
				recalculationBlock: activity.startHeight,
				totalFeesPaid: helper.toNetworkCurrency(activity.totalFeesPaid),
				importanceScore: activity.rawScore
			})),
			supplementalPublicKeys: {
				...supplementalPublicKeys,
				linkedAddress: supplementalPublicKeys.linked === Constants.Message.UNAVAILABLE
					? supplementalPublicKeys.linked
					: helper.publicKeyToAddress(supplementalPublicKeys.linked),
				nodeAddress: supplementalPublicKeys.node === Constants.Message.UNAVAILABLE
					? supplementalPublicKeys.node
					: helper.publicKeyToAddress(supplementalPublicKeys.node),
				vrfAddress: supplementalPublicKeys.vrf === Constants.Message.UNAVAILABLE
					? supplementalPublicKeys.vrf
					: helper.publicKeyToAddress(supplementalPublicKeys.vrf)
			},
			votingList:
				0 < supplementalPublicKeys.voting.length ? supplementalPublicKeys.voting.map(voting => ({
					...voting,
					epochInfo: {
						epochStart: voting.startEpoch,
						epochEnd: voting.endEpoch,
						epochStatus: getVotingEpochStatus(voting.startEpoch, voting.endEpoch)
					},
					address: helper.publicKeyToAddress(voting.publicKey),
					publicKey: voting.publicKey

				})).sort((a, b) => {
					const orderStatus = {
						[Constants.EpochStatus.CURRENT]: 1,
						[Constants.EpochStatus.FUTURE]: 2,
						[Constants.EpochStatus.EXPIRED]: 3
					};

					return orderStatus[a.epochInfo.epochStatus] - orderStatus[b.epochInfo.epochStatus];
				}) : [],
			accountAliasNames: this.extractAccountNamespace(accountInfo, accountNames)
		};
	}

	/**
	 * Gets custom array of confirmed transactions dataset into Vue Component.
	 * @param {object} pageInfo - page info such as pageNumber, pageSize.
	 * @param {object} filterValue - search criteria.
	 * @param {string} address - Account address.
	 * @returns {object} Custom AggregateTransaction[]
	 */
	static getAccountTransactionList = async (pageInfo, filterValue, address) => {
		const { pageNumber, pageSize } = pageInfo;
		const searchCriteria = {
			pageNumber,
			pageSize,
			order: Order.Desc,
			type: [],
			group: TransactionGroup.Confirmed,
			address: Address.createFromRawAddress(address),
			...filterValue
		};

		const searchTransactions = await TransactionService.searchTransactions(searchCriteria);

		const accountTransactions = {
			...searchTransactions,
			data: searchTransactions.data.map(transaction => TransactionService.formatTransaction(transaction))
		};

		await Promise.all(accountTransactions.data.map(async transaction => {
			if (transaction?.recipientAddress) {
				const { recipientAddress, transactionBody, transactionInfo } = transaction;

				return (transactionBody.recipient = await helper.resolvedAddress(recipientAddress, transactionInfo.height));
			}
		}));

		if (searchCriteria.group === TransactionGroup.Partial || searchCriteria.group === TransactionGroup.Unconfirmed) {
			return {
			  	...accountTransactions,
				data: accountTransactions.data.map(accountTransaction => ({
					...accountTransaction,
					transactionHash: accountTransaction.transactionInfo.hash,
					transactionType: accountTransaction.type,
					recipient: accountTransaction.transactionBody?.recipient,
					extendGraphicValue: TransactionService.extendGraphicValue(accountTransaction)
				}))
			};
		}

		const blockHeight = [...new Set(accountTransactions.data.map(data => data.transactionInfo.height))];

		const blockInfos = await Promise.all(blockHeight.map(height => BlockService.getBlockInfo(height)));

		return {
			...accountTransactions,
			data: accountTransactions.data.map(({ deadline, ...accountTransaction }) => ({
				...accountTransaction,
				timestamp: blockInfos.find(block => block.height === accountTransaction.transactionInfo.height).timestamp,
				blockHeight: accountTransaction.transactionInfo.height,
				transactionHash: accountTransaction.transactionInfo.hash,
				transactionType: accountTransaction.type === TransactionType.TRANSFER
					? (accountTransaction.signer === address
						? 'outgoing_' + accountTransaction.transactionBody.transactionType
						: 'incoming_' + accountTransaction.transactionBody.transactionType
					)
					: accountTransaction.transactionBody.transactionType,
				extendGraphicValue: TransactionService.extendGraphicValue(accountTransaction),
				recipient: accountTransaction.signer === address
					? accountTransaction.transactionBody?.recipient
					: ''
			}))
		};
	}

	/**
	 * Gets custom array of confirmed transactions dataset into Vue Component.
	 * @param {object} pageInfo - page info such as pageNumber, pageSize.
	 * @param {object} filterValue - search criteria.
	 * @param {string} address - Account address.
	 * @returns {object} Custom AggregateTransaction[]
	 */
	static getAccountNamespaceList = async (pageInfo, filterValue, address) => {
		const { pageNumber, pageSize } = pageInfo;
		const searchCriteria = {
			pageNumber,
			pageSize,
			order: Order.Desc,
			ownerAddress: Address.createFromRawAddress(address),
			...filterValue
		};

		const accountNamespaces = await NamespaceService.searchNamespaces(searchCriteria);

		const { height: currentHeight } = await ChainService.getChainInfo();

		return {
			...accountNamespaces,
			data: accountNamespaces.data.map(namespaces => {
				const { expiredInSecond } = helper.calculateNamespaceExpiration(currentHeight, namespaces.endHeight);

				return {
					...namespaces,
					status: namespaces.active,
					expirationDuration: helper.convertTimeFromNowInSec(expiredInSecond) || Constants.Message.UNLIMITED
				};
			})
		};
	}

	/**
	 * Gets account harvested block receipt list dataset into Vue Component.
	 * @param {object} pageInfo - page info such as pageNumber, pageSize.
	 * @param {string} address - Account address.
	 * @returns {object} formatted harvested blocks data list.
	 */
	static getAccountHarvestedReceiptList = async (pageInfo, address) => {
		const { pageNumber, pageSize } = pageInfo;

		const searchCriteria = {
			pageNumber,
			pageSize,
			order: Order.Desc,
			orderBy: BlockOrderBy.Height,
			targetAddress: Address.createFromRawAddress(address),
			receiptTypes: [ReceiptType.Harvest_Fee]
		};

		const harvestedBlockReceipt = await ReceiptService.searchReceipts(searchCriteria);

		const formattedReceipt = await ReceiptService.createReceiptTransactionStatement(harvestedBlockReceipt.data.balanceChangeStatement);

		return {
			...harvestedBlockReceipt,
			data: formattedReceipt.filter(receipt =>
				receipt.targetAddress === address &&
				receipt.type === ReceiptType.Harvest_Fee)
		};
	}

	/**
	 * Gets account receipt list dataset into Vue Component.
	 * @param {object} pageInfo - page info such as pageNumber, pageSize.
	 * @param {object} filterValue - search criteria.
	 * @param {string} address - Account address.
	 * @returns {object} formatted receipt data list.
	 */
	static getAccountReceiptList = async (pageInfo, filterValue, address) => {
		const { pageNumber, pageSize } = pageInfo;

		const { BalanceTransferReceipt, BalanceChangeReceipt } = Constants.ReceiptTransactionStatementType;

		let searchCriteria = {
			pageNumber,
			pageSize,
			order: Order.Desc,
			orderBy: BlockOrderBy.Height,
			...filterValue
		};

		if (filterValue.receiptTransactionStatementType === BalanceTransferReceipt)
			Object.assign(searchCriteria, { senderAddress: Address.createFromRawAddress(address) });

		if (filterValue.receiptTransactionStatementType === BalanceChangeReceipt)
			Object.assign(searchCriteria, { targetAddress: Address.createFromRawAddress(address) });

		const receipt = await ReceiptService.searchReceipts(searchCriteria);

		let formattedReceipt = [];

		if (filterValue.receiptTransactionStatementType === BalanceTransferReceipt) {
			formattedReceipt = await ReceiptService.createReceiptTransactionStatement(receipt.data.balanceTransferStatement);
			formattedReceipt = formattedReceipt.filter(receipt =>
				receipt.senderAddress === address);
		}

		if (filterValue.receiptTransactionStatementType === BalanceChangeReceipt) {
			formattedReceipt = await ReceiptService.createReceiptTransactionStatement(receipt.data.balanceChangeStatement);
			formattedReceipt = formattedReceipt.filter(receipt =>
				receipt.targetAddress === address &&
				receipt.type !== ReceiptType.Harvest_Fee);
		}

		return {
			...receipt,
			data: formattedReceipt
		};
	}

	/**
	 * Gets Account Metadata list dataset into Vue component
	 * @param {object} pageInfo - page info such as pageNumber, pageSize
	 * @param {object} filterValue - search criteria
	 * @param {string} address - Account address
	 * @returns {object} formatted account metadata list
	 */
	static getAccountMetadataList = async (pageInfo, filterValue, address) => {
		const { pageNumber, pageSize } = pageInfo;
		const searchCriteria = {
			pageNumber,
			pageSize,
			order: Order.Desc,
			targetAddress: Address.createFromRawAddress(address),
			...filterValue
		};
		const accountMetadatas = await MetadataService.searchMetadatas(searchCriteria);

		return accountMetadatas;
	}

	/**
	 * Gets Account Hash Lock list dataset into Vue component
	 * @param {object} pageInfo - object for page info such as pageNumber, pageSize
	 * @param {string} address - Account address
	 * @returns {object} formatted account hash lock list
	 */
	static getAccountHashLockList = async (pageInfo, address) => {
		const { pageNumber, pageSize } = pageInfo;
		const searchCriteria = {
			pageNumber,
			pageSize,
			order: Order.Desc,
			address: Address.createFromRawAddress(address)
		};
		const accountHashLocks = await LockService.searchHashLocks(searchCriteria);

		const tokens = accountHashLocks.data.map(hashlock => new Token(hashlock.tokenId, hashlock.amount));

		const tokensFieldObject = await helper.tokensFieldObjectBuilder(tokens);

		let hashLocks = [];

		for (const hashLock of accountHashLocks.data) {
			hashLocks.push({
				...hashLock,
				transactionHash: hashLock.hash,
				tokens: [tokensFieldObject.find(tokenFieldObject => tokenFieldObject.tokenId === hashLock.tokenId.toHex())]
			});
		}

		return {
			...accountHashLocks,
			data: hashLocks
		};
	}

	/**
	 * Gets Account Secret Lock list dataset into Vue component.
	 * @param {object} pageInfo - page info such as pageNumber, pageSize.
	 * @param {string} address - Account address.
	 * @returns {object} formatted account secret lock list.
	 */
	static getAccountSecretLockList = async (pageInfo, address) => {
		const { pageNumber, pageSize } = pageInfo;

		const searchCriteria = {
			pageNumber,
			pageSize,
			order: Order.Desc,
			address: Address.createFromRawAddress(address)
		};

		const accountSecretLocks = await LockService.searchSecretLocks(searchCriteria);

		const tokens = accountSecretLocks.data.map(secretlock => new Token(secretlock.tokenId, secretlock.amount));

		const tokensFieldObject = await helper.tokensFieldObjectBuilder(tokens);

		let secretLocks = [];

		for (const secretLock of accountSecretLocks.data) {
			secretLocks.push({
				...secretLock,
				tokens: [tokensFieldObject.find(tokenFieldObject => tokenFieldObject.tokenId === secretLock.tokenId.toHex())]
			});
		}

		return {
			...accountSecretLocks,
			data: secretLocks
		};
	}

	/**
	 * Format AccountInfo to readable accountInfo object.
	 * @param {object} accountInfo - AccountInfo DTO.
	 * @returns {object} Readable AccountInfo DTO object.
	 */
	static formatAccountInfo = accountInfo => ({
		...accountInfo,
		address: accountInfo.address.address,
		addressHeight: accountInfo.addressHeight.compact(),
		publicKey: 0 < accountInfo.publicKeyHeight.compact() ? accountInfo.publicKey : Constants.Message.UNKNOWN,
		publicKeyHeight: accountInfo.publicKeyHeight.compact(),
		accountType: Constants.AccountType[accountInfo.accountType],
		supplementalPublicKeys: this.formatSupplementalPublicKeys(accountInfo.supplementalPublicKeys),
		importance: helper.ImportanceScoreToPercent(accountInfo.importance.compact()),
		importanceHeight: accountInfo.importanceHeight.compact()
	})

	/**
	 * Format SupplementalPublicKeys to readable SupplementalPublicKeys object.
	 * @param {object} supplementalPublicKeys - supplementalPublicKeys DTO.
	 * @returns {object} Readable supplementalPublicKeys DTO object.
	 */
	static formatSupplementalPublicKeys = supplementalPublicKeys => ({
		...supplementalPublicKeys,
		linked: supplementalPublicKeys.linked?.publicKey || Constants.Message.UNAVAILABLE,
		node: supplementalPublicKeys.node?.publicKey || Constants.Message.UNAVAILABLE,
		vrf: supplementalPublicKeys.vrf?.publicKey || Constants.Message.UNAVAILABLE,
		voting: supplementalPublicKeys.voting || []
	})

	/**
	 * Extract Name for Account.
	 * @param {object} accountInfo - accountInfo DTO.
	 * @param {array} accountNames - accountNames.
	 * @returns {array} accountNames
	 */
	static extractAccountNamespace = (accountInfo, accountNames) => {
		let accountName = accountNames.find(name => name.address === accountInfo.address);

		const aliasNames = accountName.names.map(names => names.name);

		return 0 < aliasNames.length ? aliasNames : [Constants.Message.UNAVAILABLE];
	}

	/**
	 * Get customize TokenAmountView dataset for Vue component.
	 * @param {string} address - Account address.
	 * @returns {array} customize TokenAmountViews.
	 */
	static getAccountTokenList = async address => {
		const [tokens, chainInfo] = await Promise.all([
			TokenService.getTokenAmountViewList(address),
			ChainService.getChainInfo()
		]);

		let nonExpiredTokens = [];

		for (const token of tokens) {
			if (0 === token.duration)
				nonExpiredTokens.push(token);

			if (chainInfo.height < (token.startHeight + token.duration))
				nonExpiredTokens.push(token);
		}

		return helper.sortTokens(nonExpiredTokens);
	}


}

export default AccountService;
