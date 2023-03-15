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

import { Constants } from './config';
import { NamespaceService, TokenService, ReceiptService } from './infrastructure';
import http from './infrastructure/http';
import moment from 'moment';
import {
	NetworkType,
	TokenId,
	NamespaceId,
	Address,
	Token,
	NodeVersion,
	UInt64
} from 'bitxor-sdk';
const Url = require('url-parse');

const getNetworkTypeAddressFormat = {
	[NetworkType.MAIN_NET]: 'bB',
	[NetworkType.TEST_NET]: 'tT'
	
};

class helper {
	static timeSince (interval) {
		if (1 < interval.years)
			return interval.years + ' years';
		else if (1 === interval.years)
			return interval.years + ' year';
		else if (1 < interval.days)
			return interval.days + ' days';
		else if (1 === interval.days)
			return interval.days + ' day';
		else if (1 < interval.hours)
			return interval.hours + ' hours';
		else if (1 === interval.hours)
			return interval.hours + ' hour';
		else if (1 < interval.minutes)
			return interval.minutes + ' min';// ' minutes'
		else if (1 === interval.minutes)
			return interval.minutes + ' min';// ' minute'
		else if (1 !== interval.seconds)
			return interval.seconds + ' sec';// ' seconds'
		else
			return interval.seconds + ' sec';// ' second'
	}

	static formatSeconds = _second => {
		let second = _second;

		if (!second && 0 !== second)
			return '';

		let d = 0;

		let h = 0;

		let m = 0;

		if (86400 < second) {
			d = Math.floor(second / 86400);
			second = second % 86400;
		}
		if (3600 < second) {
			h = Math.floor(second / 3600);
			second = second % 3600;
		}
		if (60 < second) {
			m = Math.floor(second / 60);
			second = second % 60;
		}
		let result = '';

		if (0 < m || 0 < h || 0 < d)
			result = `${m} m ${result}`;

		if (0 < h || 0 < d)
			result = `${h} h ${result}`;

		if (0 < d)
			result = `${d} d ${result}`;

		return result;
	}

	static isTokenOrNamespaceId = str =>
		16 === str.length && /^[0-9a-fA-F]+$/.test(str);

	static isAccountPublicKey = str =>
		64 === str.length &&
		str.match('^[A-z0-9]+$')

	static isAccountAddress = str =>
		39 === str.length &&
		str.match(`[${getNetworkTypeAddressFormat[http.networkType]}]` +
			'{1,1}[a-zA-Z0-9]{5,5}[a-zA-Z0-9]{6,6}[a-zA-Z0-9]{6,6}[a-zA-Z0-9]{6,6}[a-zA-Z0-9]{6,6}[a-zA-Z0-9]{6,6}[a-zA-Z0-9]{3,3}')

	static isBlockHeight = str =>
		str.match(/^-{0,1}\d+$/)

	static validURL (url) {
		// All we expect is there is a valid origin for the url, IE,
		// the origin is not 'null'.
		return 'null' !== url.origin;
	}

	static parseUrl (str) {
		let url = new Url(str);

		if (this.validURL(url))
			return url;
	}

	static httpToWssUrl (str) {
		let url = new Url(str);

		if (this.validURL(url)) {
			url.set('protocol', '3000' === url.port ? 'ws:' : 'wss:');
			return url;
		}
	}

	static async logError (dispatch, action, ...args) {
		try {
			await dispatch(action, ...args);
		} catch (e) {
			console.error(`Failed to call ${action}`, e);
		}
	}

	static convertToSecond = durationInBlocks => durationInBlocks * http.networkConfig.TargetBlockTime

	static calculateNamespaceExpiration = (currentHeight, endHeight) => {
		const expired = currentHeight > endHeight - http.networkConfig.NamespaceGraceDuration;
		const expiredInBlock = endHeight - http.networkConfig.NamespaceGraceDuration - currentHeight;

		return {
			isExpired: expired,
			expiredInBlock: expiredInBlock,
			expiredInSecond: this.convertToSecond(expiredInBlock)
		};
	}

	static fetchData = async (fetchFunction, commit, before, error, success) => {
		if ('function' === typeof before) { await before(); } else {
			commit('setLoading', true);
			commit('setError', false);
		}
		try {
			await fetchFunction();
		} catch (e) {
			if ('function' === typeof error) { await error(e); } else {
				console.error(e);
				commit('setError', true);
			}
		}
		if ('function' === typeof success)
			await success();
		else
			commit('setLoading', false);
	}

	/**
	 * Convert hex value or namespace name to tokenId or namespaceId.
	 * @param {string} hexOrNamespace - hex value or namespace name.
	 * @param {string} toId - 'token' | 'namespace'
	 * @returns {Promise<TokenId|NamespaceId>} TokenId | NamespaceId
	 */
	static hexOrNamespaceToId = async (hexOrNamespace, toId) => {
		let Id = TokenId | NamespaceId;

		const isHexadecimal = this.isTokenOrNamespaceId(hexOrNamespace);

		if (isHexadecimal){
			Id = 'token' === toId
				? new TokenId(hexOrNamespace)
				: NamespaceId.createFromEncoded(hexOrNamespace);
		}
		else
		{
			Id = 'token' === toId
				? await NamespaceService.getLinkedTokenId(new NamespaceId(hexOrNamespace))
				: new NamespaceId(hexOrNamespace);
		}

		return Id;
	}

	/**
	 * Decode Account Public key or Namespace name to plan Address.
	 * @param {string} address Account publicKey string | namespace name
	 * @returns {Promise<string>} example : SB3KUBHATFCPV7UZQLWAQ2EUR6SIHBSBEOEDDDF3
	 */
	static decodeToAddress = async address => {
		if (this.isAccountPublicKey(address))
			return Address.createFromPublicKey(address, http.networkType).plain();

		if (!this.isAccountAddress(address)) {
			try {
				const namespaceId = new NamespaceId(address);

				return await NamespaceService.getLinkedAddress(namespaceId);
			} catch (e) {
				console.error(e);
			}
		}

		return address;
	}

	/**
	 * Convert Token amount to relative Amount with divisibility.
	 * @param {number} amount - number
	 * @param {number} divisibility - decimal
	 * @returns {string} relativeAmount in string
	 */
	static formatTokenAmountWithDivisibility = (amount, divisibility) => {
		let relativeAmount = 0 !== divisibility ? amount / Math.pow(10, divisibility) : amount.compact();

		return relativeAmount.toLocaleString('en-US', { minimumFractionDigits: divisibility });
	}

	/**
	 * Get network currency balance.
	 * @param {array} tokens - formatted tokens.
	 * @returns {string} network currency balance.
	 */
	static getNetworkCurrencyBalance = tokens => {
		let token = tokens.find(token =>
			token.id.toHex() === http.networkCurrency.tokenId ||
			(token.id instanceof NamespaceId &&
				token.id.toHex() === http.networkCurrency.namespaceId));

		let balance = token !== undefined ? this.toNetworkCurrency(token.amount) : Constants.Message.UNAVAILABLE;

		return balance;
	}

	/**
	 * Convert networkTimestamp to UTC date.
	 * @param {number} networkTimestamp network timestamp.
	 * @returns {string} UTC date with format YYYY-MM-DD HH:mm:ss.
	 */
	static convertToUTCDate = networkTimestamp => moment.utc(networkTimestamp * 1000).format('YYYY-MM-DD HH:mm:ss')

	/**
	 * convert difficulty raw score to readable
	 * @param {UInt64} difficulty - raw difficulty score
	 * @returns {string} difficulty - readable difficulty score
	 */
	static convertBlockDifficultyToReadable = difficulty => (difficulty.compact() / 1000000000000).toFixed(2).toString()

	/**
	 * Format Importance score to percentage.
	 * @param {number} rawScore raw score.
	 * @returns {string} importance score in percentage.
	 */
	static ImportanceScoreToPercent = rawScore => {
		const totalChainImportance = http.networkConfig.TotalChainImportance;
		const { divisibility } = http.networkCurrency;

		let percent = rawScore;

		if (0 < rawScore)
			percent = rawScore / totalChainImportance;

		return (percent * 100).toFixed(divisibility).toString() + ' %';
	}

	/**
	 * Format number to Network currency divisibility.
	 * example transaction fees
	 * @param {number} amount - token amount.
	 * @returns {string} amount - (string) with formatted divisibility
	 */
	static toNetworkCurrency = amount =>
		(amount / Math.pow(10, http.networkCurrency.divisibility))
			.toLocaleString('en-US', { minimumFractionDigits: http.networkCurrency.divisibility })

	/**
	 * Convert public key to Address.
	 * @param {string} publicKey - raw public key
	 * @returns {string} address - address in plain format
	 */
	static publicKeyToAddress = publicKey => Address.createFromPublicKey(publicKey, http.networkType).plain()

	/**
	 * convert network timestamp to world time
	 * @param {number} timestamp - raw timestamp
	 * @returns {number} timestamp - world timestamp
	 */
	static networkTimestamp = timestamp => Math.round(timestamp / 1000) + http.networkConfig.BxrsisTimestamp

	/**
	 * Sort Native token to top of list.
	 * @param {array} tokens - array of token.
	 * @returns {array} token[] - sort array of token.
	 */
	static sortTokens = tokens => {
		let sortedTokens = [];

		tokens.forEach(token =>
			token.tokenId === http.networkCurrency.tokenId
				? sortedTokens.unshift(token)
				: sortedTokens.push(token));

		return sortedTokens;
	}

	/**
	 * Convert second to time from now in second.
	 * @param {number} second number of second.
	 * @returns {string} time from now in second.
	 */
	static convertTimeFromNowInSec = second => moment.utc().add(second, 's')
		.fromNow()

	/**
	 * convert second to Date.
	 * @param {number} second number of second.
	 * @returns {string} YYYY.MM.DD HH:mm UTC.
	 */
	static convertSecondToDate = second => moment.utc().add(second, 's')
		.format('YYYY.MM.DD @ HH:mm UTC')

	/**
	 * Convert block deadline to date.
	 * @param {number} deadline - deadline from block.
	 * @returns {string} YYYY-MM-DD HH:mm:ss.
	 */
	static convertDeadlinetoDate = deadline => this.convertToUTCDate(this.networkTimestamp(deadline))

	/**
	 * Converts an HSL color value to RGB. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes h, s, and l are contained in the set [0, 1] and
	 * returns r, g, and b in the set [0, 255].
	 *
	 * @param   {number}  h       The hue
	 * @param   {number}  s       The saturation
	 * @param   {number}  l       The lightness
	 * @returns {object} {R: Number, G: Number, B: Number}
	 */
	 static hslToRgb (h, s, l) {
		let r, g, b;

		if (0 === s) { r = g = b = l; } // achromatic
		 else {
			/* eslint-disable no-param-reassign */
			const hue2rgb = (_p, _q, _t) => {
				if (0 > _t)
					_t += 1;
				if (1 < _t)
					_t -= 1;
				if (_t < 1 / 6)
					return _p + ((_q - _p) * (6 * _t));
				if (_t < 1 / 2)
					return _q;
				if (_t < 2 / 3)
					return _p + ((_q - _p) * (((2 / 3) - _t) * 6));
				return _p;
			};
			/* eslint-disable no-param-reassign */

			const q = 0.5 > l ? (l * (1 + s)) : l + s - (l * s);

			const p = (2 * l) - q;

			r = hue2rgb(p, q, h + (1 / 3));
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - (1 / 3));
		}

		return {
			R: Math.round(r * 255),
			G: Math.round(g * 255),
			B: Math.round(b * 255)
		};
	}

	/**
	 * Get RGB color from hash.
	 * @param {string} hash - hash to be converted.
	 * @param {boolean} isHex - default true
	 * @returns {object} { R: Number, G: Number, B: Number }
	 */
	static getColorFromHash = (hash, isHex = true) => {
		const color = {
			R: 0,
			G: 0,
			B: 0
		};
		const spread = 100;
		const saturation = 0.9;
		const lightness = 0.8;

		let totalValue = 0;

		if ('string' !== typeof hash) {
			console.error('Failed to convert hash to color. Hash is not a String');
			return color;
		}
		if (3 > hash.length) {
			console.error('Failed to convert hash to color. Hash string length < 3');
			return color;
		}

		if (isHex) {
			for (const hex of hash)
				totalValue += parseInt(hex, 16);
		} else {
			const charset = [
				'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
				'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
				'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
			];

			for (const char of hash)
				totalValue += charset.indexOf(char.toLowerCase());
		};

		const k = Math.trunc(totalValue / spread);
		const offsetValue = totalValue - (spread * k);
		const hue = offsetValue / 100;

		return this.hslToRgb(hue, saturation, lightness);
	}

	static truncString (str, strLen = 4) {
		if ('string' === typeof str) {
			if (str.length > (strLen * 2) + 1)
				return `${str.substring(0, strLen)}...${str.substring(str.length - strLen, str.length)}`;
			return str;
		}
		console.error('Failed to trunc string. Provided value is not a string');
		return str;
	}

	/**
	 * Get plain address from unResolvedAddress Object
	 * @param {NamespaceId | Address} unResolvedAddress - NamespaceId | Address
	 * @param {number} blockHeight block height
	 * @returns {string} example : SB3KUBHATFCPV7UZQLWAQ2EUR6SIHBSBEOEDDDF3
	 */
	static resolvedAddress = async (unResolvedAddress, blockHeight) => {
		// Handle partial txs without block height
		if (!blockHeight) {
			if (unResolvedAddress instanceof NamespaceId)
				return unResolvedAddress.id.toHex();

			return unResolvedAddress.address;
		}

		if (!(unResolvedAddress instanceof NamespaceId))
			return unResolvedAddress.address;

		const searchCriteria = {
			height: UInt64.fromUint(blockHeight)
		};

		const namespaceHex = unResolvedAddress.id.toHex();

		const addressResolutionStatements = await ReceiptService.searchAddressResolutionStatements(searchCriteria);

		const address = addressResolutionStatements.data.find(item => item.unresolved === namespaceHex
			&& 'Address' === item.resolutionType)?.addressResolutionEntries[0];

		if (!address)
			throw new Error('Failed to resolved address');

		return address;
	}

	/**
	 * To resolved unresolvedTokenId.
	 * @param {NamespaceId | TokenId} unresolvedTokenId - NamespaceId | TokenId
	 * @returns {Id} Id
	 */
	static resolveTokenId = async unresolvedTokenId => {
		if (!(unresolvedTokenId instanceof NamespaceId))
			return unresolvedTokenId.id;

		const tokenId = await NamespaceService.getLinkedTokenId(unresolvedTokenId);

		return tokenId.id;
	}

	/**
	 * Build token field object use in TokenField components.
	 * @param {array} tokens - Tokens.
	 * @returns {object} { tokenId, amount, tokenAliasName }
	 */
	static tokensFieldObjectBuilder = async tokens => {
		if (0 === tokens.length)
			return [];

		const resolvedTokens = await Promise.all(tokens.map(async token => {
			const resolvedToken = await this.resolveTokenId(token.id);
			const tokenId = new TokenId(resolvedToken.toHex()).id;

			return new Token(tokenId, token.amount);
		}));

		const resolvedTokenIds = resolvedTokens
			.map(token => token.id)
			.filter(tokenId => tokenId.toHex() !== http.networkCurrency.tokenId);

		let tokenInfos = [];

		let tokenNames = [];

		if (0 < resolvedTokenIds.length) {
			[tokenInfos, tokenNames] = await Promise.all([
				TokenService.getTokens(resolvedTokenIds),
				NamespaceService.getTokensNames(resolvedTokenIds)
			]);
		}

		let tokensFieldObject = [];

		for (const resolvedToken of resolvedTokens) {
			if (resolvedToken.id.toHex() === http.networkCurrency.tokenId) {
				tokensFieldObject.push(this.networkCurrencyTokenBuilder(resolvedToken));
			} else {
				if (0 < tokenInfos.length && 0 < tokenNames.length) {
					let { divisibility } = tokenInfos.find(info => info.tokenId === resolvedToken.id.toHex());

					tokensFieldObject.push({
						...resolvedToken,
						rawAmount: resolvedToken.amount,
						tokenId: resolvedToken.id.toHex(),
						amount: helper.formatTokenAmountWithDivisibility(resolvedToken.amount, divisibility),
						tokenAliasName: TokenService.extractTokenNamespace({ tokenId: resolvedToken.id.toHex() }, tokenNames)
					});
				}
			}
		}

		return tokensFieldObject;
	}

	static networkCurrencyTokenBuilder = token => {
		if (!(token instanceof Token))
			throw new Error('It required Token instance.');

		if (token.id.toHex() !== http.networkCurrency.tokenId)
			throw new Error('Token id does not match network Currency.');

		return {
			...token,
			rawAmount: token.amount,
			tokenId: token.id.toHex(),
			amount: this.formatTokenAmountWithDivisibility(token.amount, http.networkCurrency.divisibility),
			tokenAliasName: http.networkCurrency.namespaceName
		};
	}

	/**
	 * Check native namespace.
	 * @param {string} namespaceName - namespace name in string format.
	 * @returns {boolean} boolean
	 */
	static isNativeNamespace = namespaceName => {
		if (!http.nativeNamespaces)
			return false;

		const values = http.nativeNamespaces.map(namespace => namespace.namespaceName);

		return -1 !== values.indexOf(namespaceName);
	}

	/**
	 * Check native namespace.
	 * @param {string} namespaceName - namespace name in string format.
	 * @returns {boolean} boolean
	 */
	 static isInfinity = (namespace) => {
		if(this.isNativeNamespace(namespace.namespaceName))
		{return true;}
		else
		{	return namespace.endHeight >= 18446744073709551615 ? true : false; }
	
	}
	

	/**
	 * Gets single token alias name.
	 * @param {TokenId} tokenId tokenId.
	 * @returns {array} token alias name.
	 */
	static getTokenAliasNames = async tokenId => {
		const getTokenNames = await NamespaceService.getTokensNames([tokenId]);
		const tokenAliasNames = TokenService.extractTokenNamespace({ tokenId: tokenId.toHex() }, getTokenNames);

		return tokenAliasNames;
	}

	static fallbackCopyTextToClipboard = text => {
		let textArea = document.createElement('textarea');

		let success = false;

		textArea.value = text;

		// Avoid scrolling to bottom
		textArea.style.top = '0';
		textArea.style.left = '0';
		textArea.style.position = 'fixed';

		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		try {
			success = document.execCommand('copy');
		} catch (err) {
			console.error('Fallback: Could not copy text', err);
		}

		document.body.removeChild(textArea);
		return success;
	}

	static copyTextToClipboard = text => {
		return new Promise((resolve, reject) => {
			if (!navigator.clipboard) {
				if (this.fallbackCopyTextToClipboard(text))
					resolve();
				else
					reject(Error('Could not copy text. document.execCommand() failed'));
			}
			navigator.clipboard.writeText(text).then(function () {
				resolve();
			}, function (err) {
				console.error('Async: Could not copy text: ', err);
				reject(Error('Async: Could not copy text: ', err));
			});
		});
	}

	static formatNodeVersion = rawNodeVersion => {
		try {
			return NodeVersion.createFromRawNodeVersion(rawNodeVersion).formatted();
		} catch (e) {
			return Constants.Message.UNAVAILABLE;
		}
	}

	static getTokenName (token) {
		let tokenAliasName;

		if (Array.isArray(token.tokenAliasName))
			tokenAliasName = token.tokenAliasName.length ? token.tokenAliasName[0] : 'N/A';
		else
			tokenAliasName = token.tokenAliasName ? token.tokenAliasName : 'N/A';

		return 'N/A' !== tokenAliasName
			? tokenAliasName
			: token.tokenId;
	}

	/**
	 * Convert dataset into CSV format.
	 * @param {array} dataset - list of data.
	 * @returns {string} csv data in string format.
	 */
	static convertArrayToCSV (dataset) {
		if (!Array.isArray(dataset))
			throw Error('Convert dataset to CSV fail.');

		if (0 === dataset.length)
			return 'Nothing to show';

		let csvContent = '';

		csvContent += Object.keys(dataset[0]).join(',') + '\n';

		for (const value of dataset) {
			let row = '';

			for (let prop in value) {
				if ('' !== row)
					row += ',';

				row += value[prop];
			}

			csvContent += row + '\r\n';
		}

		return csvContent;
	}

	/**
	 * Gets first index from the list.
	 * @param {number} pageNumber number of page.
	 * @param {number} pageSize number of page size.
	 * @returns {number} first index from the list
	 */
	static getStartListIndex = (pageNumber, pageSize) => {
		return 1 === pageNumber ? 0 : (pageNumber - 1) * pageSize;
	}
}

export default helper;
