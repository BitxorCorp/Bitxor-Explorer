import { TokenService, NamespaceService } from '../../src/infrastructure';
import TestHelper from '../TestHelper';
import { restore, stub } from 'sinon';
import { TokenNonce, TokenId } from 'bitxor-sdk';

describe('Token Service', () => {
	let getToken = {};
	let getTokensNames = [];

	beforeEach(() => {
		getToken = stub(TokenService, 'getToken');
		getTokensNames = stub(NamespaceService, 'getTokensNames');
	});

	afterEach(restore);

	describe('getTokenInfo should', () => {
		// Arrange:
		const {address} = TestHelper.generateAccount(1)[0];

		it('return token object', async () => {
			// Arrange:
			const tokenId = TokenId.createFromNonce(TokenNonce.createRandom(), address);
			const mockToken = TestHelper.mockTokenInfo(tokenId.toHex(), address.plain(), 1, 100);
			const mockTokensNames = [
				TestHelper.mockTokenName(tokenId.toHex(), 'token_alias')
			];

			getToken.returns(Promise.resolve(mockToken));

			getTokensNames.returns(Promise.resolve(mockTokensNames));

			// Act:
			const {tokenAliasNames, expiredInBlock, ...tokenInfo} = await TokenService.getTokenInfo(tokenId.toHex());

			// Assert:
			expect(tokenInfo).toEqual(mockToken);
			expect(tokenAliasNames).toEqual(mockTokensNames.map(m => m.names[0].name));
			expect(expiredInBlock).toEqual(101);
		});

		it('return native network token object', async () => {
			// Arrange:
			const mockNativeTokenId = '6BED913FA20223F8';
			const mockToken = TestHelper.mockTokenInfo(mockNativeTokenId, address.plain(), 1, 0);
			const mockTokensNames = [
				TestHelper.mockTokenName(mockNativeTokenId, 'bitxor')
			];

			getToken.returns(Promise.resolve(mockToken));

			getTokensNames.returns(Promise.resolve(mockTokensNames));

			// Act:
			const { tokenAliasNames, expiredInBlock, ...tokenInfo } = await TokenService.getTokenInfo(mockNativeTokenId);

			// Assert:
			expect(tokenInfo).toEqual(mockToken);
			expect(tokenAliasNames).toEqual(mockTokensNames.map(m => m.names[0].name));
			expect(expiredInBlock).toEqual('INFINITY');
		});
	});

	describe('getTokenList should', () => {
		it('return tokens', async () => {
			// Arrange:
			const pageInfo = {
				pageNumber: 1,
				pageSize: 10
			};

			const {address} = TestHelper.generateAccount(1)[0];

			const mockNativeTokenId = '6BED913FA20223F8';
			const mockTokenId = '5E62990DCAC5BE8A';

			const mockSearchTokens = {
				...pageInfo,
				data: [
					TestHelper.mockTokenInfo(mockNativeTokenId, address.plain(), 1, 0),
					TestHelper.mockTokenInfo(mockTokenId, address.plain(), 5, 100)
				]
			};

			const searchTokens = stub(TokenService, 'searchTokens');

			searchTokens.returns(Promise.resolve(mockSearchTokens));

			const mockTokensNames = [
				TestHelper.mockTokenName(mockNativeTokenId, 'bitxor'),
				TestHelper.mockTokenName(mockTokenId, 'token_alias')
			];

			getTokensNames.returns(Promise.resolve(mockTokensNames));

			// Act:
			const tokenList = await TokenService.getTokenList(pageInfo);

			// Assert:
			expect(tokenList.pageNumber).toEqual(pageInfo.pageNumber);
			expect(tokenList.pageSize).toEqual(pageInfo.pageSize);
			expect(tokenList.data).toHaveLength(2);
			tokenList.data.forEach((token, index) => {
				const {supplyMutable, transferable, restrictable, revokable} = mockSearchTokens.data[index];

				expect(token.ownerAddress).toEqual(address.plain());
				expect(token.tokenAliasNames).toEqual([mockTokensNames[index].names[0].name]);
				expect(token.tokenFlags).toEqual({
					supplyMutable,
					transferable,
					restrictable,
					revokable
				});
			});
		});
	});
});