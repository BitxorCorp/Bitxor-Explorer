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
import { Constants } from '../config';
import helper from '../helper';
import { NamespaceService, MetadataService, ReceiptService } from '../infrastructure';
import { Address, TokenId, Order, ReceiptType, UInt64 } from 'bitxor-sdk';

class TokenService {
	/**
   * Gets TokenInfo for different tokenIds.
   * @param {array} tokenIds - Array of token ids.
   * @returns {array} Formatted TokenInfos.
   */
   static getTokens = async tokenIds => {
   	const tokens = await http.createRepositoryFactory.createTokenRepository()
   		.getTokens(tokenIds)
   		.toPromise();
   	const formattedTokens = tokens.map(token => this.formatTokenInfo(token));

   	return formattedTokens;
   }

   /**
   * Gets the TokenInfo for a given tokenId.
   * @param {object} tokenId -  Token id
   * @returns {object} Formatted TokenInfo
   */
   static getToken = async tokenId => {
   	const token = await http.createRepositoryFactory.createTokenRepository()
   		.getToken(tokenId)
   		.toPromise();

   	const formattedToken = this.formatTokenInfo(token);

   	return formattedToken;
   }

   /**
    * Get balance tokens in form of TokenAmountViews for a given account address.
    * @param {string} address - Account address
    * @returns {array} formatted TokenAmountViews
    */
   static getTokenAmountView = async address => {
   	const tokenAmountViews = await http.tokenService.tokensAmountViewFromAddress(Address.createFromRawAddress(address)).toPromise();

   	return tokenAmountViews.map(tokenAmountView => this.formatTokenAmountView(tokenAmountView));
   }

   /**
   * Gets a tokens list from searchCriteria.
   * @param {object} tokenSearchCriteria Search Criteria.
   * @returns {object} formatted token data with pagination info.
   */
  static searchTokens = async tokenSearchCriteria => {
  	const searchTokens = await http.createRepositoryFactory.createTokenRepository()
  		.search(tokenSearchCriteria)
  		.toPromise();

  	return {
  		...searchTokens,
  		data: searchTokens.data.map(token => this.formatTokenInfo(token))
  	};
  }

   /**
    * Get formatted TokenInfo dataset into Vue Component.
    * @param {string} hexOrNamespace - hex value or namespace name.
    * @returns {object} TokenInfo info object.
    */
   static getTokenInfo = async hexOrNamespace => {
   	const tokenId = await helper.hexOrNamespaceToId(hexOrNamespace, 'token');
   	const tokenInfo = await this.getToken(tokenId);

   	const tokenNames = await NamespaceService.getTokensNames([tokenId]);

   	const expiredInBlock = tokenInfo.duration + tokenInfo.startHeight;

   	return {
   		...tokenInfo,
   		tokenAliasNames: this.extractTokenNamespace(tokenInfo, tokenNames),
   		expiredInBlock: expiredInBlock === tokenInfo.startHeight ? Constants.Message.INFINITY : expiredInBlock
   	};
   }

   /**
    * Get custom TokenInfo dataset into Vue Component.
    * @param {object} pageInfo - pagination info.
    * @returns {object} Custom TokenInfos
    */
   static getTokenList = async pageInfo => {
   	const { pageNumber, pageSize } = pageInfo;
   	const searchCriteria = {
   		pageNumber,
   		pageSize,
   		order: Order.Desc
   	};

   	const tokenInfos = await this.searchTokens(searchCriteria);

   	const tokenIdsList = tokenInfos.data.map(tokenInfo => new TokenId(tokenInfo.tokenId));

   	const tokenNames = await NamespaceService.getTokensNames(tokenIdsList);

   	return {
   		...tokenInfos,
   		data: tokenInfos.data.map(token => ({
   			...token,
   			ownerAddress: token.address,
   			tokenAliasNames: this.extractTokenNamespace(token, tokenNames),
   			tokenFlags: {
   				supplyMutable: token.supplyMutable,
   				transferable: token.transferable,
   				restrictable: token.restrictable,
   				revokable: token.revokable,
				duration: token.duration
   			}
   		}))
   	};
   }

   /**
    * Get customize TokenAmountView dataset for Vue component.
    * @param {string} address - Account address.
    * @returns {object} customize TokenAmountViews.
    */
   static getTokenAmountViewList = async address => {
   	const tokenAmountViewInfos = await this.getTokenAmountView(address);

   	const tokenIdsList = tokenAmountViewInfos.map(tokenAmountViewInfo => new TokenId(tokenAmountViewInfo.tokenId));
   	const tokenNames = await NamespaceService.getTokensNames(tokenIdsList);

   	return tokenAmountViewInfos.map(tokenAmountViewInfo => ({
   		...tokenAmountViewInfo,
   		tokenAliasNames: this.extractTokenNamespace(tokenAmountViewInfo, tokenNames)
   	}));
   }

   /**
   * Gets token Metadata list dataset into Vue component.
   * @param {object} pageInfo - page info such as pageNumber, pageSize.
   * @param {object} filterValue - search criteria.
   * @param {string} hexOrNamespace - hex value or namespace name.
   * @returns {object} formatted token Metadata list.
   */
   static getTokenMetadataList = async (pageInfo, filterValue, hexOrNamespace) => {
   	const tokenId = await helper.hexOrNamespaceToId(hexOrNamespace, 'token');

   	const { pageNumber, pageSize } = pageInfo;

   	const searchCriteria = {
   		pageNumber,
   		pageSize,
   		order: Order.Desc,
   		targetId: tokenId,
   		...filterValue
   	};
   	const tokenMetadatas = await MetadataService.searchMetadatas(searchCriteria);

   	return tokenMetadatas;
   }

   /**
	* Gets token balance transfer receipt list dataset into Vue component.
	* @param {object} pageInfo - page info such as pageNumber, pageSize.
	* @param {string} hexOrNamespace - hex value or namespace name.
	* @returns {object} formatted balance transfer receipt list.
	*/
   static getTokenBalanceTransferReceipt = async (pageInfo, hexOrNamespace) => {
   	const tokenId = await helper.hexOrNamespaceToId(hexOrNamespace, 'token');

   	const { startHeight, address } = await this.getToken(tokenId);

   	const { pageNumber, pageSize } = pageInfo;

   	const searchCriteria = {
   		pageNumber,
   		pageSize,
   		order: Order.Desc,
   		height: UInt64.fromUint(startHeight),
   		receiptTypes: [ReceiptType.Token_Rental_Fee],
   		senderAddress: Address.createFromRawAddress(address)
   	};

   	const balanceTransferReceipt = await ReceiptService.searchReceipts(searchCriteria);

   	const formattedReceipt = await ReceiptService.createReceiptTransactionStatement(balanceTransferReceipt.data.balanceTransferStatement);

   	return {
   		...balanceTransferReceipt,
   		data: formattedReceipt.filter(receipt =>
   			receipt.senderAddress === address &&
         receipt.type === ReceiptType.Token_Rental_Fee)
   	};
   }

   /**
	* Gets token artifact expiry receipt list dataset into Vue component.
	* @param {object} pageInfo - page info such as pageNumber, pageSize.
	* @param {string} hexOrNamespace - hex value or namespace name.
	* @returns {object} formatted artifact expiry receipt list.
	*/
   static getTokenArtifactExpiryReceipt = async (pageInfo, hexOrNamespace) => {
   	const tokenId = await helper.hexOrNamespaceToId(hexOrNamespace, 'token');

   	const { startHeight, duration } = await this.getToken(tokenId);

   	const { pageNumber, pageSize } = pageInfo;

   	const endHeight = startHeight + duration;

   	if (endHeight === startHeight)
   		return {};

   	// Todo: Should filter with with ArtifactId rather than height.
   	// Bug: https://github.com/bitxorcorp/bitxorcore-rest/issues/517
   	const searchCriteria = {
   		pageNumber,
   		pageSize,
   		order: Order.Desc,
   		height: UInt64.fromUint(endHeight),
   		receiptTypes: [ReceiptType.Token_Expired]
   	};

   	const artifactExpiryReceipt = await ReceiptService.searchReceipts(searchCriteria);
   	const formattedReceipt = await ReceiptService.createReceiptTransactionStatement(artifactExpiryReceipt.data.artifactExpiryStatement);

   	return {
   		...artifactExpiryReceipt,
   		data: formattedReceipt.filter(receipt => receipt.type === ReceiptType.Token_Expired)
   	};
   }

   /**
    * Format TokenInfo to readable tokenInfo object.
    * @param {object} tokenInfo TokenInfoDTO.
    * @returns {object} readable TokenInfoDTO object.
    */
   static formatTokenInfo = tokenInfo => ({
   	tokenId: tokenInfo.id.toHex(),
   	divisibility: tokenInfo.divisibility,
   	address: tokenInfo.ownerAddress.plain(),
   	supply: tokenInfo.supply.compact().toLocaleString('en-US'),
   	relativeAmount: helper.formatTokenAmountWithDivisibility(tokenInfo.supply, tokenInfo.divisibility),
   	revision: tokenInfo.revision,
   	startHeight: Number(tokenInfo.startHeight.toString()),
   	duration: Number(tokenInfo.duration.toString()),
   	supplyMutable: tokenInfo.flags.supplyMutable,
   	transferable: tokenInfo.flags.transferable,
   	restrictable: tokenInfo.flags.restrictable,
   	revokable: tokenInfo.flags.revokable
   })

   /**
    * format TokenAmountView to readable object.
    * @param {object} tokenAmountView - tokenAmountView DTO.
    * @returns {object} formatted tokenAmountView.
    */
   static formatTokenAmountView = tokenAmountView => ({
   	...this.formatTokenInfo(tokenAmountView.tokenInfo),
   	amount: helper.formatTokenAmountWithDivisibility(tokenAmountView.amount, tokenAmountView.tokenInfo.divisibility)
   })

   /**
    * Extract Name for Token.
    * @param {object} tokenInfo - tokenInfo DTO.
    * @param {array} tokenNames - TokenNames[].
    * @returns {array} tokenNames.
    */
   static extractTokenNamespace = (tokenInfo, tokenNames) => {
   	const tokenName = tokenNames.find(name => name.tokenId === tokenInfo.tokenId);

   	const aliasNames = tokenName.names.map(names => names.name);

   	const names = 0 < aliasNames.length ? aliasNames : [Constants.Message.UNAVAILABLE];

   	return names;
   }
}

export default TokenService;
