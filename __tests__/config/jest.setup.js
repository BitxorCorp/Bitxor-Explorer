/* Mock init http */
jest.mock('../../src/infrastructure/http', () => {
	return {
		networkType: 152,
		epochAdjustment: 1615853185,
		generationHash: '57F7DA205008026C776CB6AED843393F04CD458E0AA2D9F1D5F31A402072B2D6',
		networkCurrency: {
			divisibility: 6,
			tokenId: '6BED913FA20223F8',
			namespaceId: 'E74B99BA41F4AFEE',
			namespaceName: 'bitxor'
		},
		networkConfig: {
			TargetBlockTime: 30,
			NetworkType: 152,
			BxrsisTimestamp: 1637848847,
			NamespaceGraceDuration: 2880,
			TotalChainImportance: 7842928625000000
		},
		nativeNamespaces: [
			{
				namespaceName: 'bitxor'
			}
		]
	};
});