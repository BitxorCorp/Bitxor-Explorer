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
import { TokenService, RestrictionService } from '../infrastructure';

const managers = [
	new Pagination({
		name: 'timeline',
		fetchFunction: pageInfo => TokenService.getTokenList(pageInfo),
		pageInfo: {
			pageSize: Constants.PageSize
		}
	}),
	new Pagination({
		name: 'restrictions',
		fetchFunction: (pageInfo, filterValue, store) =>
			RestrictionService.getTokenRestrictionList(pageInfo, filterValue, store.getters.getCurrentTokenId),
		pageInfo: {
			pageSize: Constants.PageSize
		},
		filter: filters.tokenRestriction
	}),
	new DataSet(
		'info',
		hexOrNamespace => TokenService.getTokenInfo(hexOrNamespace)
	),
	new Pagination({
		name: 'metadatas',
		fetchFunction: (pageInfo, filterValue, store) =>
			TokenService.getTokenMetadataList(pageInfo, filterValue, store.getters.getCurrentTokenId),
		pageInfo: {
			pageSize: 10
		},
		filter: filters.metadata
	}),
	new Pagination({
		name: 'balanceTransferReceipt',
		fetchFunction: (pageInfo, filterValue, store) =>
			TokenService.getTokenBalanceTransferReceipt(pageInfo, store.getters.getCurrentTokenId),
		pageInfo: {
			pageSize: 10
		}
	}),
	new Pagination({
		name: 'artifactExpiryReceipt',
		fetchFunction: (pageInfo, filterValue, store) =>
			TokenService.getTokenArtifactExpiryReceipt(pageInfo, store.getters.getCurrentTokenId),
		pageInfo: {
			pageSize: 10
		}
	})
];

const LOCK = Lock.create();

export default {
	namespaced: true,
	state: {
		...getStateFromManagers(managers),
		// If the state has been initialized.
		initialized: false,
		currentTokenId: null
	},
	getters: {
		...getGettersFromManagers(managers),
		getInitialized: state => state.initialized,
		getRecentList: state => state.timeline?.data?.filter((item, index) => 4 > index) || [],
		getCurrentTokenId: state => state.currentTokenId
	},
	mutations: {
		...getMutationsFromManagers(managers),
		setInitialized: (state, initialized) => {
			state.initialized = initialized;
		},
		setCurrentTokenId: (state, currentTokenId) => {
			state.currentTokenId = currentTokenId;
		}
	},
	actions: {
		...getActionsFromManagers(managers),
		// Initialize the token model.
		async initialize ({ commit, dispatch, getters }) {
			const callback = async () => {
				await dispatch('initializePage');
			};

			await LOCK.initialize(callback, commit, dispatch, getters);
		},

		// Uninitialize the token model.
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

		// Fetch data from the SDK.
		fetchTokenInfo (context, payload) {
			context.dispatch('uninitializeDetail');
			context.commit('setCurrentTokenId', payload.tokenId);
			context.getters.info.setStore(context).initialFetch(payload.tokenId);
			context.getters.restrictions.setStore(context).initialFetch(payload.tokenId);
			context.getters.metadatas.setStore(context).initialFetch(payload.tokenId);
			context.getters.balanceTransferReceipt.setStore(context).initialFetch(payload.tokenId);
			context.getters.artifactExpiryReceipt.setStore(context).initialFetch(payload.tokenId);
		},

		uninitializeDetail (context) {
			context.getters.info.setStore(context).uninitialize();
			context.getters.restrictions.setStore(context).uninitialize();
			context.getters.metadatas.setStore(context).uninitialize();
			context.getters.balanceTransferReceipt.setStore(context).uninitialize();
			context.getters.artifactExpiryReceipt.setStore(context).uninitialize();
		}
	}
};
