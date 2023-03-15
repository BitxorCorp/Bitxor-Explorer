import Constants from '../config/constants';
import helper from '../helper';
import { Token, ReceiptType } from 'bitxor-sdk';

class CreateReceiptTransaction {
    static balanceChangeReceipt = async transactionStatement => {
    	let balanceChangeReceipt = [];

    	const tokens = transactionStatement.map(statement => new Token(statement.tokenId, statement.amount));

    	const tokensFieldObject = await helper.tokensFieldObjectBuilder(tokens);

    	for (const statement of transactionStatement) {
    		balanceChangeReceipt.push({
    			...statement,
    			height: statement.height.compact(),
  				receiptType: Constants.ReceiptType[statement.type],
  				targetAddress: statement.targetAddress.plain(),
    			tokens: [tokensFieldObject.find(tokenFieldObject => tokenFieldObject.tokenId === statement.tokenId.toHex() &&
					statement.amount.equals(tokenFieldObject.rawAmount))]
    		});
    	}

    	return balanceChangeReceipt;
    }

    static balanceTransferReceipt = async transactionStatement => {
    	let balanceTransferReceipt = [];

    	const tokens = transactionStatement.map(statement => new Token(statement.tokenId, statement.amount));

    	const tokensFieldObject = await helper.tokensFieldObjectBuilder(tokens);

    	for (const statement of transactionStatement) {
    		balanceTransferReceipt.push({
    			...statement,
    			height: statement.height.compact(),
    			receiptType: Constants.ReceiptType[statement.type],
  				senderAddress: statement.senderAddress.address,
  				recipient: statement.recipientAddress.address,
    			tokens: [tokensFieldObject.find(tokenFieldObject => tokenFieldObject.tokenId === statement.tokenId.toHex() &&
					statement.amount.equals(tokenFieldObject.rawAmount))]
    		});
    	}

    	return balanceTransferReceipt;
    }

    static inflationReceipt = async transactionStatement => {
    	let inflationReceipt = [];

    	const tokens = transactionStatement.map(statement => new Token(statement.tokenId, statement.amount));

    	const tokensFieldObject = await helper.tokensFieldObjectBuilder(tokens);

    	for (const statement of transactionStatement) {
    		inflationReceipt.push({
    			...statement,
    			height: statement.height.compact(),
    			receiptType: Constants.ReceiptType[statement.type],
    			tokens: [tokensFieldObject.find(tokenFieldObject => tokenFieldObject.tokenId === statement.tokenId.toHex() &&
					statement.amount.equals(tokenFieldObject.rawAmount))]
    		});
    	}

    	return inflationReceipt;
    }

    static artifactExpiryReceipt = async transactionStatement => {
    	let artifactExpiryReceipt = [];

    	for (const statement of transactionStatement) {
    		let artifactObj = {
    			...statement,
    			height: statement.height.compact(),
    			receiptType: Constants.ReceiptType[statement.type],
    			artifactId: statement.artifactId.toHex()
    		};

    		if (ReceiptType.Token_Expired === statement.type)
    			Object.assign(artifactObj, { tokenArtifactId: statement.artifactId.toHex() });
    		else if (ReceiptType.Namespace_Expired === statement.type || ReceiptType.Namespace_Deleted === statement.type)
    			Object.assign(artifactObj, { namespaceArtifactId: statement.artifactId.toHex() });

    		artifactExpiryReceipt.push(artifactObj);
    	}

    	return artifactExpiryReceipt;
    }
}

export default CreateReceiptTransaction;
