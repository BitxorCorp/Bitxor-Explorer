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

import Lock from './lock';
import {
	DataSet,
	Pagination,
	getStateFromManagers,
	getGettersFromManagers,
	getMutationsFromManagers,
	getActionsFromManagers
} from './manager';
import { Constants, filters } from '../config';
import helper from '../helper';
import {
	AccountService,
	MultisigService,
	RestrictionService
} from '../infrastructure';
import { Address } from 'bitxor-sdk';

const managers = [
	new Pagination({
		name: 'timeline',
		fetchFunction: (pageInfo, filterValue) => AccountService.getAccountList(pageInfo, filterValue),
		pageInfo: {
			pageSize: Constants.PageSize
		},
		filter: filters.account
	}),
	new DataSet(
		'info',
		address => AccountService.getAccountInfo(address)
	),
	new DataSet(
		'OwnedToken',
		address => AccountService.getAccountTokenList(address)
	),
	new Pagination({
		name: 'OwnedNamespace',
		fetchFunction: (pageInfo, filterValue, store) =>
			AccountService.getAccountNamespaceList(pageInfo, filterValue, store.getters.getCurrentAccountAddress),
		pageInfo: {
			pageSize: 10
		},
		filter: filters.namespace
	}),
	new DataSet(
		'multisig',
		address => MultisigService.getMultisigAccountInfo(address)
	),
	new Pagination({
		name: 'transactions',
		fetchFunction: (pageInfo, filterValue, store) =>
			AccountService.getAccountTransactionList(pageInfo, filterValue, store.getters.getCurrentAccountAddress),
		pageInfo: {
			pageSize: 10
		},
		filter: filters.transaction
	}),
	new Pagination({
		name: 'harvestedBlocks',
		fetchFunction: (pageInfo, filterValue, store) =>
			AccountService.getAccountHarvestedReceiptList(pageInfo, store.getters.getCurrentAccountAddress),
		pageInfo: {
			pageSize: 10
		}
	}),
	new Pagination({
		name: 'receipt',
		fetchFunction: (pageInfo, filterValue, store) =>
			AccountService.getAccountReceiptList(pageInfo, filterValue, store.getters.getCurrentAccountAddress),
		pageInfo: {
			pageSize: 10
		},
		filter: filters.accountTransactionReceipt
	}),
	new Pagination({
		name: 'tokenAddressRestrictions',
		fetchFunction: (pageInfo, filterValue, store) =>
			RestrictionService.getTokenAddressRestrictionList(pageInfo, store.getters.getCurrentAccountAddress),
		pageInfo: {
			pageSize: Constants.PageSize
		}
	}),
	new Pagination({
		name: 'metadatas',
		fetchFunction: (pageInfo, filterValue, store) =>
			AccountService.getAccountMetadataList(pageInfo, filterValue, store.getters.getCurrentAccountAddress),
		pageInfo: {
			pageSize: 10
		},
		filter: filters.metadata
	}),
	new Pagination({
		name: 'hashLocks',
		fetchFunction: (pageInfo, filterValue, store) =>
			AccountService.getAccountHashLockList(pageInfo, store.getters.getCurrentAccountAddress),
		pageInfo: {
			pageSize: 10
		}
	}),
	new Pagination({
		name: 'secretLocks',
		fetchFunction: (pageInfo, filterValue, store) =>
			AccountService.getAccountSecretLockList(pageInfo, store.getters.getCurrentAccountAddress),
		pageInfo: {
			pageSize: 10
		}
	}),
	new DataSet(
		'accountRestrictions',
		address => RestrictionService.getAccountRestrictionList(address)
	)
];

const LOCK = Lock.create();

export default {
	namespaced: true,
	state: {
		...getStateFromManagers(managers),
		// If the state has been initialized.
		initialized: false,
		currentAccountAddress: null
	},
	getters: {
		...getGettersFromManagers(managers),
		getInitialized: state => state.initialized,
		getActivityBucketList: state => state.info?.data.activityBucket || [],
		getSupplementalPublicKeys: state => state.info?.data.supplementalPublicKeys || {},
		getVotingKeyList: state => state.info?.data.votingList || [],
		getCurrentAccountAddress: state => state.currentAccountAddress,
		balanceWidget: (state, getters) => ({
			address: state.currentAccountAddress ? Address
				.createFromRawAddress(state.currentAccountAddress)
				.pretty() : '',
			token: getters.OwnedToken?.data[0],
			alias: getters.info?.data?.accountAliasNames /* || Constants.Message.UNAVAILABLE */
		})
	},
	mutations: {
		...getMutationsFromManagers(managers),
		setInitialized: (state, initialized) => {
			state.initialized = initialized;
		},
		setCurrentAccountAddress: (state, currentAccountAddress) => {
			state.currentAccountAddress = currentAccountAddress;
		}
	},
	actions: {
		...getActionsFromManagers(managers),
		// Initialize the account model.
		async initialize ({ commit, dispatch, getters }) {
			const callback = async () => {
				await dispatch('initializePage');
			};

			await LOCK.initialize(callback, commit, dispatch, getters);
		},

		// Uninitialize the account model.
		async uninitialize ({ commit, dispatch, getters }) {
			const callback = async () => {
				dispatch('uninitializeDetail');
 				getters.timeline?.uninitialize();
			};

			await LOCK.uninitialize(callback, commit, dispatch, getters);
		},

		// Fetch data from the SDK and initialize the page.
		initializePage (context) {
			context.getters.timeline.setStore(context).initialFetch();
		},

		// Fetch account data by address, publicKey or alias namespaceName
		async fetchAccountDetail (context, payload) {
			let { address } = payload;

			try {
				address = Address.createFromRawAddress(address).plain();
			} catch (e) {
				address = await helper.decodeToAddress(address);
			}

			context.dispatch('uninitializeDetail');
			context.commit('setCurrentAccountAddress', address);

			context.getters.info.setStore(context).initialFetch(address);
			context.getters.transactions.setStore(context).initialFetch(address);
			context.getters.OwnedToken.setStore(context).initialFetch(address);
			context.getters.OwnedNamespace.setStore(context).initialFetch(address);
			context.getters.multisig.setStore(context).initialFetch(address);
			context.getters.metadatas.setStore(context).initialFetch(address);
			context.getters.tokenAddressRestrictions.setStore(context).initialFetch(address);
			context.getters.harvestedBlocks.setStore(context).initialFetch(address);
			context.getters.accountRestrictions.setStore(context).initialFetch(address);
			context.getters.hashLocks.setStore(context).initialFetch(address);
			context.getters.secretLocks.setStore(context).initialFetch(address);
			context.getters.receipt.setStore(context).initialFetch(address);
		},

		uninitializeDetail (context) {
			context.getters.info.setStore(context).uninitialize();
			context.getters.OwnedToken.setStore(context).uninitialize();
			context.getters.OwnedNamespace.setStore(context).uninitialize();
			context.getters.multisig.setStore(context).uninitialize();
			context.getters.transactions.setStore(context).uninitialize();
			context.getters.metadatas.setStore(context).uninitialize();
			context.getters.tokenAddressRestrictions.setStore(context).uninitialize();
			context.getters.harvestedBlocks.setStore(context).uninitialize();
			context.getters.accountRestrictions.setStore(context).uninitialize();
			context.getters.hashLocks.setStore(context).uninitialize();
			context.getters.secretLocks.setStore(context).uninitialize();
			context.getters.receipt.setStore(context).uninitialize();
		}
	}
};
