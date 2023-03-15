import http from './http';
import Constants from '../config/constants';
import helper from '../helper';
import {
	Address,
	AddressRestrictionFlag,
	TokenRestrictionFlag,
	OperationRestrictionFlag,
	TokenAddressRestriction,
	TokenGlobalRestriction,
	TokenRestrictionEntryType,
	Order
} from 'bitxor-sdk';

class RestrictionService {
  /**
   * Get Account Restriction from Bitxor SDK
   * @param {string} address - Account address to be created from PublicKey or RawAddress
   * @returns {array} AccountRestrictions[]
   */
  static getAccountRestrictions = async address => {
  	let accountRestrictions;

  	try {
  		accountRestrictions = await http.createRepositoryFactory.createRestrictionAccountRepository()
  			.getAccountRestrictions(Address.createFromRawAddress(address))
  			.toPromise();
  	} catch (e) {
  		// To Catach statusCode 404 if Account restrictions are not available.
  		throw Error('Account restrictions are not available.');
	  }

  	const formattedAccountRestrictions = accountRestrictions.map(accountRestriction => this.formatAccountRestriction(accountRestriction));

  	return formattedAccountRestrictions;
  }

  /**
   * Gets a token restrictions list from searchCriteria
   * @param {object} restrictionTokenSearchCriteria Object of Search Criteria
   * @returns {object} formatted namespace data with pagination info
   */
  static searchTokenRestrictions = async restrictionTokenSearchCriteria => {
  	const searchTokenRestrictions = await http.createRepositoryFactory.createRestrictionTokenRepository()
  		.search(restrictionTokenSearchCriteria)
  		.toPromise();

  	return {
  		...searchTokenRestrictions,
  		data: searchTokenRestrictions.data.map(tokenRestriction => {
  			if (tokenRestriction instanceof TokenAddressRestriction)
				  return this.formatTokenAddressRestriction(tokenRestriction);

  			if (tokenRestriction instanceof TokenGlobalRestriction)
  				return this.formatTokenGlobalRestriction(tokenRestriction);
  		})
  	};
  }

  /**
   * Format AccountRestriction to readable object.
   * @param {object} accountRestriction account restriction dto.
   * @returns {object} readable AccountRestriction object.
   */
  static formatAccountRestriction = accountRestriction => {
  	switch (accountRestriction.restrictionFlags) {
  	case AddressRestrictionFlag.AllowIncomingAddress:
  	case AddressRestrictionFlag.BlockIncomingAddress:
  	case AddressRestrictionFlag.AllowOutgoingAddress:
  	case AddressRestrictionFlag.BlockOutgoingAddress:
  		return {
  			restrictionType: Constants.AddressRestrictionFlag[accountRestriction.restrictionFlags],
  			restrictionAddressValues: accountRestriction.values.map(value => value.address)
  		};
  	case TokenRestrictionFlag.AllowToken:
  	case TokenRestrictionFlag.BlockToken:
  		return {
  			restrictionType: Constants.TokenRestrictionFlag[accountRestriction.restrictionFlags],
  			restrictionTokenValues: accountRestriction.values.map(value => value.id.toHex())
  		};
  	case OperationRestrictionFlag.AllowOutgoingTransactionType:
  	case OperationRestrictionFlag.BlockOutgoingTransactionType:
  		return {
  			restrictionType: Constants.OperationRestrictionFlag[accountRestriction.restrictionFlags],
  			restrictionTransactionValues: accountRestriction.values.map(value => Constants.TransactionType[value])
  		};
  	}
  }

  /**
   * Format TokenGlobalRestrictions to readable object.
   * @param {object} tokenRestriction token global restriction dto.
   * @returns {object } readable TokenGlobalRestrictions object.
   */
  static formatTokenGlobalRestriction = tokenRestriction => {
  	let tokenGlobalRestrictionItem = [];

  	// Convert Map<k,v> to Array
  	tokenRestriction.restrictions.forEach((value, key) => {
  		tokenGlobalRestrictionItem.push({ key, ...value });
  		return tokenGlobalRestrictionItem;
  	});

  	return {
  		...tokenRestriction,
  		entryType: Constants.TokenRestrictionEntryType[tokenRestriction.entryType],
  		tokenId: tokenRestriction.tokenId.toHex(),
  		restrictions: tokenGlobalRestrictionItem.map(item => ({
  			restrictionKey: item.key,
  			restrictionType: Constants.TokenRestrictionType[item.restrictionType],
  			restrictionValue: item.restrictionValue,
  			referenceTokenId: '0000000000000000' === item.referenceTokenId.toHex()
			  ? tokenRestriction.tokenId.toHex()
			  : item.referenceTokenId.toHex()
  		}))
  	};
  }

  /**
   * Format TokenAddressRestriction to readable object.
   * @param {object} addressRestriction address restriction dto.
   * @returns {object} Custom address restriction object
   */
  static formatTokenAddressRestriction = addressRestriction => {
  	let tokenAddressRestrictionItem = [];

  	// Convert Map<k,v> to Array
  	addressRestriction.restrictions.forEach((value, key) => {
  		tokenAddressRestrictionItem.push({ key, value });
	  });

  	return {
  		...addressRestriction,
  		entryType: Constants.TokenRestrictionEntryType[addressRestriction.entryType],
  		tokenId: addressRestriction.tokenId.toHex(),
  		targetAddress: addressRestriction.targetAddress.address,
  		restrictions: tokenAddressRestrictionItem.map(item => ({
  			restrictionKey: item.key,
  			restrictionValue: item.value
  		}))
  	};
  }

  /**
   * Format Account Restriction list dataset into Vue component
   * @param {string} address - Address in string format.
   * @returns {array} Account Restriction list
   */
  static getAccountRestrictionList = async address => {
	  const accountRestrictions = await this.getAccountRestrictions(address);

  	return accountRestrictions;
  }

  /**
   * Gets Token Restriction list dataset into Vue component
   * @param {object} pageInfo - page info such as pageNumber, pageSize
   * @param {object} filterValue - search criteria eg. token global or token address
   * @param {string} hexOrNamespace - hex value or namespace name
   * @returns {array} formatted token restriction list
   */
  static getTokenRestrictionList = async (pageInfo, filterValue, hexOrNamespace) => {
  	const tokenId = await helper.hexOrNamespaceToId(hexOrNamespace, 'token');

  	const { pageNumber, pageSize } = pageInfo;

  	const searchCriteria = {
  		pageNumber,
  		pageSize,
  		order: Order.Desc,
  		tokenId: tokenId,
  		...filterValue
	  };

  	const tokenRestrictions = await this.searchTokenRestrictions(searchCriteria);

  	return tokenRestrictions;
  }

  /**
   * Gets Token Address Restriction list dataset into Vue component
   * @param {object} pageInfo - object for page info such as pageNumber, pageSize
   * @param {string} address - account Address
   * @returns {array} formatted token address restriction list
   */
  static getTokenAddressRestrictionList = async (pageInfo, address) => {
  	const { pageNumber, pageSize } = pageInfo;

  	const searchCriteria = {
  		pageNumber,
  		pageSize,
  		order: Order.Desc,
  		entryType: TokenRestrictionEntryType.ADDRESS,
  		targetAddress: Address.createFromRawAddress(address)
  	};

  	const addressRestrictions = await this.searchTokenRestrictions(searchCriteria);

  	return addressRestrictions;
  }
}

export default RestrictionService;
