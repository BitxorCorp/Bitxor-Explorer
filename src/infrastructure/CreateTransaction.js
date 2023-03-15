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
import { NamespaceService } from '../infrastructure';
import { Address, Token, TokenId, Convert } from 'bitxor-sdk';

class CreateTransaction {
    static transferTransaction = async transactionObj => {
    	const { transactionInfo } = transactionObj;
    	const [resolvedAddress, tokensFieldObject] = await Promise.all([
    		helper.resolvedAddress(transactionObj.recipientAddress, transactionInfo.height),
    		helper.tokensFieldObjectBuilder(transactionObj.tokens)
    	]);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			message: transactionObj.message,
    			recipient: resolvedAddress,
    			tokens: tokensFieldObject
    		}
    	};
    }

    static namespaceRegistration = async transactionObj => {
    	return {
    		...transactionObj,
  			transactionBody: {
    			transactionType: transactionObj.type,
  				recipient: http.networkConfig.NamespaceRentalFeeSinkAddress.address,
  				registrationType: Constants.NamespaceRegistrationType[transactionObj.registrationType],
  				namespaceName: transactionObj.namespaceName,
  				namespaceId: transactionObj.namespaceId.toHex(),
  				parentId: 'undefined' !== typeof transactionObj.parentId ? transactionObj.parentId?.toHex() : Constants.Message.UNAVAILABLE,
  				duration: 'undefined' !== typeof transactionObj.duration ? transactionObj.duration?.compact() : Constants.Message.UNLIMITED
  			}
    	};
    }

    static addressAlias = async transactionObj => {
    	const namespaceNames = await NamespaceService.getNamespacesNames([transactionObj.namespaceId]);
    	const namespaceName = namespaceNames.find(namespace => namespace.namespaceId === transactionObj.namespaceId.toHex());

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			aliasAction: Constants.AliasAction[transactionObj.aliasAction],
    			namespaceId: transactionObj.namespaceId.toHex(),
    			namespaceName: namespaceName.name,
    			address: transactionObj.address.address
    		}
    	};
    }

    static tokenAlias = async transactionObj => {
    	const namespaceNames = await NamespaceService.getNamespacesNames([transactionObj.namespaceId]);
    	const namespaceName = namespaceNames.find(namespace => namespace.namespaceId === transactionObj.namespaceId.toHex());

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			aliasAction: Constants.AliasAction[transactionObj.aliasAction],
    			namespaceId: transactionObj.namespaceId.id.toHex(),
    			namespaceName: namespaceName.name,
    			tokenId: transactionObj.tokenId.id.toHex()
    		}
    	};
    };

    static tokenDefinition = async transactionObj => {
    	const resolvedToken = await helper.resolveTokenId(transactionObj.tokenId);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			recipient: http.networkConfig.TokenRentalSinkAddress.address,
    			tokenId: resolvedToken.toHex(),
    			divisibility: transactionObj.divisibility,
    			duration: transactionObj.duration.compact(),
    			nonce: transactionObj.nonce.toHex(),
    			supplyMutable: transactionObj.flags.supplyMutable,
    			transferable: transactionObj.flags.transferable,
    			restrictable: transactionObj.flags.restrictable,
    			revokable: transactionObj.flags.revokable
    		}
    	};
    };

    static tokenSupplyChange = async transactionObj => {
    	const resolvedToken = await helper.resolveTokenId(transactionObj.tokenId);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			tokenId: resolvedToken.toHex(),
    			action: Constants.TokenSupplyChangeAction[transactionObj.action],
    			delta: transactionObj.delta.compact()
    		}
    	};
    };

  static tokenSupplyRevocation = async transactionObj => {
  	const resolvedToken = await helper.resolveTokenId(transactionObj.token);
  	const token = new Token(new TokenId(resolvedToken.toHex()), transactionObj.token.amount);

  	const tokensFieldObject = await helper.tokensFieldObjectBuilder([token]);

  	return {
  		...transactionObj,
  		transactionBody: {
  			transactionType: transactionObj.type,
  			address: transactionObj.sourceAddress.address,
  			tokens: tokensFieldObject
  		}
  	};
  };

    static multisigAccountModification = async transactionObj => {
    	const { transactionInfo } = transactionObj;
    	const [addressAdditions, addressDeletions] = await Promise.all([
    		Promise.all(transactionObj.addressAdditions.map(address => {
    			return helper.resolvedAddress(address, transactionInfo.height);
    		})),
    		Promise.all(transactionObj.addressDeletions.map(address => {
    			return helper.resolvedAddress(address, transactionInfo.height);
    		}))
    	]);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			minApprovalDelta: transactionObj.minApprovalDelta,
    			minRemovalDelta: transactionObj.minRemovalDelta,
    			addressAdditions: addressAdditions,
    			addressDeletions: addressDeletions
    		}
    	};
    }

    static hashLock = async transactionObj => {
    	const resolvedToken = await helper.resolveTokenId(transactionObj.token);

    	const token = new Token(new TokenId(resolvedToken.toHex()), transactionObj.token.amount);

    	const tokensFieldObject = await helper.tokensFieldObjectBuilder([token]);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			duration: transactionObj.duration.compact(),
    			tokens: tokensFieldObject,
    			hash: transactionObj.hash
    		}
    	};
    }

    static secretLock = async transactionObj => {
    	const { transactionInfo } = transactionObj;
    	const [tokensFieldObject, resolvedAddress] = await Promise.all([
    		helper.tokensFieldObjectBuilder([transactionObj.token]),
    		helper.resolvedAddress(transactionObj.recipientAddress, transactionInfo.height)
    	]);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			duration: transactionObj.duration.compact(),
    			tokens: tokensFieldObject,
    			secret: transactionObj.secret,
    			recipient: resolvedAddress,
    			hashAlgorithm: Constants.LockHashAlgorithm[transactionObj.hashAlgorithm]
    		}
    	};
    };

    static secretProof = async transactionObj => {
    	const { transactionInfo } = transactionObj;
    	const resolvedAddress = await helper.resolvedAddress(transactionObj.recipientAddress, transactionInfo.height);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			hashAlgorithm: Constants.LockHashAlgorithm[transactionObj.hashAlgorithm],
    			recipient: resolvedAddress,
    			secret: transactionObj.secret,
    			proof: transactionObj.proof
    		}
    	};
    };

    static accountAddressRestriction = async transactionObj => {
    	const { transactionInfo } = transactionObj;
    	const [addressAdditions, addressDeletions] = await Promise.all([
    		Promise.all(transactionObj.restrictionAdditions.map(address => {
    			return helper.resolvedAddress(address, transactionInfo.height);
    		})),
    		Promise.all(transactionObj.restrictionDeletions.map(address => {
    			return helper.resolvedAddress(address, transactionInfo.height);
    		}))
    	]);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			restrictionType: Constants.AddressRestrictionFlag[transactionObj.restrictionFlags],
    			restrictionAddressAdditions: addressAdditions,
    			restrictionAddressDeletions: addressDeletions
    		}
    	};
    };

    static accountTokenRestriction = async transactionObj => {
    	// Todo: token restriction field
    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			restrictionType: Constants.TokenRestrictionFlag[transactionObj.restrictionFlags],
    			restrictionTokenAdditions: transactionObj.restrictionAdditions.map(restriction => restriction.id.toHex()),
    			restrictionTokenDeletions: transactionObj.restrictionDeletions.map(restriction => restriction.id.toHex())
    		}
    	};
    }

    static accountOperationRestriction = async transactionObj => {
    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			restrictionType: Constants.OperationRestrictionFlag[transactionObj.restrictionFlags],
    			restrictionOperationAdditions: transactionObj.restrictionAdditions.map(operation => operation),
    			restrictionOperationDeletions: transactionObj.restrictionDeletions.map(operation => operation)
    		}
    	};
    };

    static tokenAddressRestriction = async transactionObj => {
    	const { transactionInfo } = transactionObj;
    	const [resolvedToken, targetAddress] = await Promise.all([
    		helper.resolveTokenId(transactionObj.tokenId),
    		helper.resolvedAddress(transactionObj.targetAddress, transactionInfo.height)
    	]);

    	const tokenAliasNames = await helper.getTokenAliasNames(resolvedToken);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			tokenId: resolvedToken.toHex(),
    			tokenAliasNames,
    			targetAddress: targetAddress,
    			restrictionKey: transactionObj.restrictionKey.toHex(),
    			previousRestrictionValue: transactionObj.previousRestrictionValue.toString(),
    			newRestrictionValue: transactionObj.newRestrictionValue.toString()
    		}
    	};
    };

    static tokenGlobalRestriction = async transactionObj => {
    	const referenceTokenId = '0000000000000000' === transactionObj.referenceTokenId.toHex()
    		? transactionObj.tokenId
    		: transactionObj.referenceTokenId;
    	const tokenAliasNames = await helper.getTokenAliasNames(referenceTokenId);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			referenceTokenId: referenceTokenId.toHex(),
    			tokenAliasNames,
    			restrictionKey: transactionObj.restrictionKey.toHex(),
    			previousRestrictionType: Constants.TokenRestrictionType[transactionObj.previousRestrictionType],
    			previousRestrictionValue: transactionObj.previousRestrictionValue.compact(),
    			newRestrictionType: Constants.TokenRestrictionType[transactionObj.newRestrictionType],
    			newRestrictionValue: transactionObj.newRestrictionValue.compact()
    		}
    	};
    };

    static accountMetadata = async transactionObj => {
    	const { transactionInfo } = transactionObj;
    	const resolvedAddress = await helper.resolvedAddress(transactionObj.targetAddress, transactionInfo.height);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			scopedMetadataKey: transactionObj.scopedMetadataKey.toHex(),
    			targetAddress: resolvedAddress,
    			metadataValue: `${Convert.uint8ToHex(transactionObj.value)} (Text: ${Convert.uint8ToUtf8(transactionObj.value)})`,
    			valueSizeDelta: transactionObj.valueSizeDelta
    		}
    	};
    };

    static tokenMetadata = async transactionObj => {
    	const { transactionInfo } = transactionObj;
    	const [resolvedToken, resolvedAddress] = await Promise.all([
    		helper.resolveTokenId(transactionObj.targetTokenId),
    		helper.resolvedAddress(transactionObj.targetAddress, transactionInfo.height)
    	]);

    	const tokenAliasNames = await helper.getTokenAliasNames(resolvedToken);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			scopedMetadataKey: transactionObj.scopedMetadataKey.toHex(),
    			targetTokenId: resolvedToken.toHex(),
    			targetTokenAliasNames: tokenAliasNames,
    			targetAddress: resolvedAddress,
    			metadataValue: `${Convert.uint8ToHex(transactionObj.value)} (Text: ${Convert.uint8ToUtf8(transactionObj.value)})`,
    			valueSizeDelta: transactionObj.valueSizeDelta
    		}
    	};
    };

    static namespaceMetadata = async transactionObj => {
    	const { transactionInfo } = transactionObj;
    	const [namespaceName, resolvedAddress] = await Promise.all([
    		NamespaceService.getNamespacesNames([transactionObj.targetNamespaceId]),
    		helper.resolvedAddress(transactionObj.targetAddress, transactionInfo.height)
    	]);

    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			scopedMetadataKey: transactionObj.scopedMetadataKey.toHex(),
    			targetNamespaceId: transactionObj.targetNamespaceId.toHex(),
    			namespaceName: namespaceName,
    			targetAddress: resolvedAddress,
    			metadataValue: `${Convert.uint8ToHex(transactionObj.value)} (Text: ${Convert.uint8ToUtf8(transactionObj.value)})`,
    			valueSizeDelta: transactionObj.valueSizeDelta
    		}
    	};
    };

    static votingKeyLink = transactionObj => {
    	return {
    		...transactionObj,
    		transactionBody: {
    			linkAction: Constants.LinkAction[transactionObj.linkAction],
    			linkedPublicKey: transactionObj.linkedPublicKey,
    			linkedAccountAddress: Address.createFromPublicKey(transactionObj.linkedPublicKey, http.networkType).plain(),
    			startEpoch: transactionObj.startEpoch,
    			endEpoch: transactionObj.endEpoch
    		}
    	};
    };

    static vrfKeyLink = transactionObj => {
    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			linkAction: Constants.LinkAction[transactionObj.linkAction],
    			linkedPublicKey: transactionObj.linkedPublicKey,
    			linkedAccountAddress: Address.createFromPublicKey(transactionObj.linkedPublicKey, http.networkType).plain()
    		}
    	};
    };

    static nodeKeyLink = transactionObj => {
    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			linkAction: Constants.LinkAction[transactionObj.linkAction],
    			linkedPublicKey: transactionObj.linkedPublicKey,
    			linkedAccountAddress: Address.createFromPublicKey(transactionObj.linkedPublicKey, http.networkType).plain()
    		}
    	};
    };

    static accountKeyLink = transactionObj => {
    	return {
    		...transactionObj,
    		transactionBody: {
    			transactionType: transactionObj.type,
    			linkAction: Constants.LinkAction[transactionObj.linkAction],
    			linkedPublicKey: transactionObj.linkedPublicKey,
    			linkedAccountAddress: Address.createFromPublicKey(transactionObj.linkedPublicKey, http.networkType).plain()
    		}
    	};
    };
};

export default CreateTransaction;
