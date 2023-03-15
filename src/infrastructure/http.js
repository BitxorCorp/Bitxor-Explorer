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

import globalConfig from '../config/globalConfig';
import { NamespaceService } from '../infrastructure';
import * as bitxor from 'bitxor-sdk';
import { Configuration, NodeApi } from 'bitxor-datanet-service-typescript-fetch-client';

let NODE_URL;

let MARKET_DATA_URL;

let NETWORK_TYPE;

let GENERATION_HASH;

let NETWORK_PROPERTIES;

let NETWORK_CURRECY;

let NATIVE_NAMESPACES;

let EPOCH_ADJUSTMENT;

export default class http {
  static init = async (nodeUrl, marketDataUrl) => {
  	NODE_URL = nodeUrl;
  	MARKET_DATA_URL = marketDataUrl;

  	[NETWORK_TYPE, GENERATION_HASH, NETWORK_PROPERTIES, EPOCH_ADJUSTMENT, NETWORK_CURRECY] = await Promise.all([
  		http.createRepositoryFactory.getNetworkType().toPromise(),
  		http.createRepositoryFactory.getGenerationHash().toPromise(),
  		http.createRepositoryFactory.createNetworkRepository().getNetworkProperties()
  			.toPromise(),
  		http.createRepositoryFactory.getEpochAdjustment().toPromise(),
  		http.createRepositoryFactory.getCurrencies().toPromise()
  	]);

	  NATIVE_NAMESPACES = await NamespaceService.getNativeNamespaces() || [];
  }

  static get networkCurrency () {
  	return {
  		namespaceName: NETWORK_CURRECY?.currency.namespaceId?.fullName || globalConfig.networkConfig.namespaceName,
  		namespaceId: NETWORK_CURRECY?.currency.namespaceId?.id?.toHex() || globalConfig.networkConfig.namespaceId,
  		tokenId: NETWORK_CURRECY?.currency.tokenId?.toHex() || undefined,
  		divisibility: NETWORK_CURRECY?.currency.divisibility || globalConfig.networkConfig.divisibility
  	};
  }

  static get nativeNamespaces () {
  	return NATIVE_NAMESPACES;
  }

  static get networkProperties () {
  	return new bitxor.NetworkConfiguration(NETWORK_PROPERTIES.network, NETWORK_PROPERTIES.chain, NETWORK_PROPERTIES.plugins);
  }

  static get networkConfig () {
  	const {
		  chain: { totalChainImportance, blockGenerationTargetTime },
		  plugins: { namespace, token }
  	} = this.networkProperties;
  	const convertedTotalChainImportance = +totalChainImportance.replace(/'/g, '');
  	const convertedNamespaceGracePeriodDuration = +namespace.namespaceGracePeriodDuration.replace(/d/g, '');
  	const convertedBlockGenerationTargetTime = +blockGenerationTargetTime.replace(/s/g, '');
  	const blockPerday = (60 / convertedBlockGenerationTargetTime) * 60 * 24;

  	return {
  		TokenRentalSinkAddress: bitxor.Address.createFromRawAddress(token.tokenRentalFeeSinkAddress),
  		NamespaceRentalFeeSinkAddress: bitxor.Address.createFromRawAddress(namespace.namespaceRentalFeeSinkAddress),
  		NetworkType: this.networkType,
  		BxrsisTimestamp: this.epochAdjustment,
  		TargetBlockTime: convertedBlockGenerationTargetTime,
  		NamespaceGraceDuration: convertedNamespaceGracePeriodDuration * blockPerday,
  		TotalChainImportance: convertedTotalChainImportance
  	};
  }

  static get marketDataUrl () {
  	return MARKET_DATA_URL;
  }

  static get nodeUrl () {
  	return NODE_URL;
  }

  static get generationHash () {
  	return GENERATION_HASH;
  }

  static get networkType () {
  	return NETWORK_TYPE;
  }

  static get epochAdjustment () {
	  return EPOCH_ADJUSTMENT;
  }

  static get createRepositoryFactory () {
  	return new bitxor.RepositoryFactoryHttp(this.nodeUrl, {
  		networkType: this.networkType,
  		generationHash: this.generationHash
  	});
  }

  static get tokenService () {
  	const accountRepository = this.createRepositoryFactory.createAccountRepository();
  	const tokenRepository = this.createRepositoryFactory.createTokenRepository();

  	return new bitxor.TokenService(accountRepository, tokenRepository);
  }

  static get namespaceService () {
  	const namespaceRepository = this.createRepositoryFactory.createNamespaceRepository();

  	return new bitxor.NamespaceService(namespaceRepository);
  }

  static get blockPaginationStreamer () {
  	return new bitxor.BlockPaginationStreamer(this.createRepositoryFactory.createBlockRepository());
  }

  static transactionStatementPaginationStreamer () {
	  return bitxor.ReceiptPaginationStreamer.transactionStatements(this.createRepositoryFactory.createReceiptRepository());
  }

  static addressResolutionStatementPaginationStreamer () {
	  return bitxor.ReceiptPaginationStreamer.addressResolutionStatements(this.createRepositoryFactory.createReceiptRepository());
  }

  static tokenResolutionStatementPaginationStreamer () {
	  return bitxor.ReceiptPaginationStreamer.tokenResolutionStatements(this.createRepositoryFactory.createReceiptRepository());
  }

  static get transactionPaginationStreamer () {
  	return new bitxor.TransactionPaginationStreamer(this.createRepositoryFactory.createTransactionRepository());
  }

  static statisticServiceRestClient () {
	  try {
  		const statisticsServiceUrl = globalConfig.endpoints.statisticsService;

  		if (statisticsServiceUrl && statisticsServiceUrl.length) {
  			return new NodeApi(new Configuration({
  					fetchApi: fetch,
  					basePath: statisticsServiceUrl
  				}));
  		} else { throw Error('Statistics service endpoint is not provided'); }
	  } catch (error) {
		  console.error(error);
	  }
  }
}
