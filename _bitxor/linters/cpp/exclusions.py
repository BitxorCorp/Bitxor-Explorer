import re

# those files won't be checked at all
SKIP_FILES = (
	# macro-based enums
	re.compile(r'src.bitxorcore.utils.MacroBasedEnum.h'),

	# inline includes
	re.compile(r'src.bitxorcore.model.EntityType.cpp'),
	re.compile(r'src.bitxorcore.model.ReceiptType.cpp'),
	re.compile(r'src.bitxorcore.validators.ValidationResult.cpp'),
	re.compile(r'tools.statusgen.main.cpp')
)

NAMESPACES_FALSEPOSITIVES = (
	# multiple namespaces (specialization)
	re.compile(r'src.bitxorcore.utils.Logging.cpp'),  # (boost::log)
	re.compile(r'tests.bitxorcore.deltaset.ConditionalContainerTests.cpp'),  # (bitxorcore::test)
	re.compile(r'tests.TestHarness.h'),  # (std)
	re.compile(r'tools.health.ApiNodeHealthUtils.cpp'),  # (boost::asio)

	# disallowed top-level namespaces
	re.compile(r'src.bitxorcore.thread.detail.FutureSharedState.h'),  # (detail)

	# no types (only includes and/or fwd declares and/or defines)
	re.compile(r'src.bitxorcore.constants.h'),
	re.compile(r'src.bitxorcore.plugins.h'),
	re.compile(r'src.bitxorcore.preprocessor.h'),
	re.compile(r'src.bitxorcore.cache_db.RocksInclude.h'),
	re.compile(r'src.bitxorcore.utils.BitwiseEnum.h'),
	re.compile(r'src.bitxorcore.utils.ExceptionLogging.h'),
	re.compile(r'src.bitxorcore.utils.MacroBasedEnumIncludes.h'),
	re.compile(r'src.bitxorcore.version.version_inc.h'),
	re.compile(r'src.bitxorcore.version.nix.what_version.cpp'),

	re.compile(r'extensions.mongo.src.mappers.MapperInclude.h'),
	re.compile(r'extensions.mongo.src.CacheStorageInclude.h'),
	re.compile(r'plugins.txes.lock_shared.src.validators.LockDurationValidator.h'),
	re.compile(r'plugins.txes.token.src.model.TokenConstants.h'),
	re.compile(r'plugins.txes.namespace.src.model.NamespaceConstants.h'),
	re.compile(r'tests.test.nodeps.Stress.h'),
	re.compile(r'internal.tools.*Generators.h'),

	# cache aliases (only headers without 'real' types)
	re.compile(r'plugins.services.hashcache.src.cache.HashCacheTypes.h'),
	re.compile(r'plugins.txes.token.src.cache.TokenCacheTypes.h'),
	re.compile(r'plugins.txes.multisig.src.cache.MultisigCacheTypes.h'),
	re.compile(r'plugins.txes.namespace.src.cache.NamespaceCacheTypes.h'),

	# main entry points
	re.compile(r'src.bitxorcore.process.broker.main.cpp'),
	re.compile(r'src.bitxorcore.process.importer.main.cpp'),
	re.compile(r'src.bitxorcore.process.recovery.main.cpp'),
	re.compile(r'src.bitxorcore.process.server.main.cpp'),
	re.compile(r'tests.bench.nodeps.BenchMain.cpp'),

	# mongo plugins (only entry point)
	re.compile(r'extensions.mongo.plugins.*.src.Mongo.*Plugin.cpp')
)

EMPTYLINES_FALSEPOSITIVES = (
)

LONGLINES_FALSEPOSITIVES = (
)

SPECIAL_INCLUDES = (
	# src (these include double quotes because they have to match what is after `#include `)
	re.compile(r'"bitxorcore/utils/MacroBasedEnum\.h"'),
	re.compile(r'"ReentrancyCheckReaderNotificationPolicy.h"'),

	re.compile(r'<ref10/crypto_verify_32.h>'),

	# those always should be in an ifdef
	re.compile(r'<dlfcn.h>'),
	re.compile(r'<io.h>'),
	re.compile(r'<mach/mach.h>'),
	re.compile(r'<psapi.h>'),
	re.compile(r'<stdexcept>'),
	re.compile(r'<sys/file.h>'),
	re.compile(r'<sys/resource.h>'),
	re.compile(r'<sys/time.h>'),
	re.compile(r'<unistd.h>'),
	re.compile(r'<windows.h>')
)

CORE_FIRSTINCLUDES = {
	# src
	'src/bitxorcore/consumers/BatchSignatureConsumer.cpp': 'BlockConsumers.h',
	'src/bitxorcore/consumers/BlockchainCheckConsumer.cpp': 'BlockConsumers.h',
	'src/bitxorcore/consumers/BlockchainSyncCleanupConsumer.cpp': 'BlockConsumers.h',
	'src/bitxorcore/consumers/BlockchainSyncConsumer.cpp': 'BlockConsumers.h',
	'src/bitxorcore/consumers/HashCalculatorConsumer.cpp': 'BlockConsumers.h',
	'src/bitxorcore/consumers/HashCheckConsumer.cpp': 'BlockConsumers.h',
	'src/bitxorcore/consumers/NewBlockConsumer.cpp': 'BlockConsumers.h',
	'src/bitxorcore/consumers/NewTransactionsConsumer.cpp': 'TransactionConsumers.h',
	'src/bitxorcore/consumers/StatelessValidationConsumer.cpp': 'BlockConsumers.h',

	'src/bitxorcore/ionet/IoEnums.cpp': 'ConnectResult.h',
	'src/bitxorcore/net/NetEnums.cpp': 'NodeRequestResult.h',
	'src/bitxorcore/process/broker/main.cpp': 'bitxorcore/extensions/ProcessBootstrapper.h',
	'src/bitxorcore/process/importer/main.cpp': 'bitxorcore/extensions/ProcessBootstrapper.h',
	'src/bitxorcore/process/recovery/main.cpp': 'bitxorcore/extensions/ProcessBootstrapper.h',
	'src/bitxorcore/process/server/main.cpp': 'bitxorcore/extensions/ProcessBootstrapper.h',
	'src/bitxorcore/version/nix/what_version.cpp': 'bitxorcore/version/version.h',

	# tests
	'tests/test/nodeps/TestMain.cpp': 'bitxorcore/utils/ConfigurationValueParsers.h',

	'tests/bitxorcore/consumers/BatchSignatureConsumerTests.cpp': 'bitxorcore/consumers/BlockConsumers.h',
	'tests/bitxorcore/consumers/BlockchainCheckConsumerTests.cpp': 'bitxorcore/consumers/BlockConsumers.h',
	'tests/bitxorcore/consumers/BlockchainSyncCleanupConsumerTests.cpp': 'bitxorcore/consumers/BlockConsumers.h',
	'tests/bitxorcore/consumers/BlockchainSyncConsumerTests.cpp': 'bitxorcore/consumers/BlockConsumers.h',
	'tests/bitxorcore/consumers/HashCalculatorConsumerTests.cpp': 'bitxorcore/consumers/BlockConsumers.h',
	'tests/bitxorcore/consumers/HashCheckConsumerTests.cpp': 'bitxorcore/consumers/BlockConsumers.h',
	'tests/bitxorcore/consumers/NewBlockConsumerTests.cpp': 'bitxorcore/consumers/BlockConsumers.h',
	'tests/bitxorcore/consumers/NewTransactionsConsumerTests.cpp': 'bitxorcore/consumers/TransactionConsumers.h',
	'tests/bitxorcore/consumers/StatelessValidationConsumerTests.cpp': 'bitxorcore/consumers/BlockConsumers.h',

	'tests/bitxorcore/deltaset/MapVirtualizedTests.cpp': 'tests/bitxorcore/deltaset/test/BaseSetDeltaTests.h',
	'tests/bitxorcore/deltaset/OrderedTests.cpp': 'tests/bitxorcore/deltaset/test/BaseSetDeltaTests.h',
	'tests/bitxorcore/deltaset/ReverseOrderedTests.cpp': 'tests/bitxorcore/deltaset/test/BaseSetDeltaTests.h',
	'tests/bitxorcore/deltaset/SetVirtualizedTests.cpp': 'tests/bitxorcore/deltaset/test/BaseSetDeltaTests.h',
	'tests/bitxorcore/deltaset/UnorderedMapTests.cpp': 'tests/bitxorcore/deltaset/test/BaseSetDeltaTests.h',
	'tests/bitxorcore/deltaset/UnorderedTests.cpp': 'tests/bitxorcore/deltaset/test/BaseSetDeltaTests.h',
	'tests/bitxorcore/thread/FutureSharedStateTests.cpp': 'bitxorcore/thread/detail/FutureSharedState.h',
	'tests/bitxorcore/utils/BitxorcoreExceptionTests.cpp': 'bitxorcore/exceptions.h',
	'tests/bitxorcore/utils/BitxorcoreTypesTests.cpp': 'bitxorcore/types.h',
	'tests/bitxorcore/utils/CountOfTests.cpp': 'bitxorcore/types.h',
	'tests/bitxorcore/utils/MacroBasedEnumTests.cpp': 'bitxorcore/utils/MacroBasedEnumIncludes.h',
	'tests/bitxorcore/utils/TraitsTests.cpp': 'bitxorcore/utils/traits/Traits.h',
	'tests/bitxorcore/utils/StlTraitsTests.cpp': 'bitxorcore/utils/traits/StlTraits.h'
}

PLUGINS_FIRSTINCLUDES = {
	# plugins
	'plugins/coresystem/src/importance/PosImportanceCalculator.cpp': 'ImportanceCalculator.h',
	'plugins/coresystem/src/importance/RestoreImportanceCalculator.cpp': 'ImportanceCalculator.h',
	'plugins/coresystem/src/validators/KeyLinkActionValidator.cpp': 'KeyLinkValidators.h',
	'plugins/coresystem/src/validators/VotingKeyLinkRangeValidator.cpp': 'KeyLinkValidators.h',

	'plugins/coresystem/tests/importance/PosImportanceCalculatorTests.cpp': 'src/importance/ImportanceCalculator.h',
	'plugins/coresystem/tests/importance/RestoreImportanceCalculatorTests.cpp': 'src/importance/ImportanceCalculator.h',
	'plugins/coresystem/tests/validators/KeyLinkActionValidatorTests.cpp': 'src/validators/KeyLinkValidators.h',
	'plugins/coresystem/tests/validators/VotingKeyLinkRangeValidatorTests.cpp': 'src/validators/KeyLinkValidators.h',

	'plugins/txes/metadata/tests/model/MetadataTransactionTests.cpp': 'src/model/AccountMetadataTransaction.h',

	'plugins/txes/restriction_account/tests/model/AccountRestrictionTransactionTests.cpp':
		'src/model/AccountAddressRestrictionTransaction.h',

	# sdk
	'sdk/tests/builders/AliasBuilderTests.cpp': 'src/builders/AddressAliasBuilder.h',
	'sdk/tests/builders/AccountRestrictionBuilderTests.cpp': 'src/builders/AccountAddressRestrictionBuilder.h',
	'sdk/tests/builders/KeyLinkBuilderTests.cpp': 'src/builders/AccountKeyLinkBuilder.h',
	'sdk/tests/builders/MetadataBuilderTests.cpp': 'src/builders/AccountMetadataBuilder.h'
}

TOOLS_FIRSTINCLUDES = {
	'tools/health/main.cpp': 'ApiNodeHealthUtils.h'
}

EXTENSION_FIRSTINCLUDES = {
	'extensions/mongo/plugins/metadata/src/MongoMetadataPlugin.cpp': 'AccountMetadataMapper.h',
	'extensions/mongo/plugins/token/src/MongoTokenPlugin.cpp': 'TokenDefinitionMapper.h',
	'extensions/mongo/plugins/multisig/src/MongoMultisigPlugin.cpp': 'MultisigAccountModificationMapper.h',
	'extensions/mongo/plugins/namespace/src/MongoNamespacePlugin.cpp': 'AddressAliasMapper.h',
	'extensions/mongo/plugins/restriction_token/src/MongoTokenRestrictionPlugin.cpp': 'TokenAddressRestrictionMapper.h'
}

SKIP_FORWARDS = (
	re.compile(r'src.bitxorcore.validators.ValidatorTypes.h'),
	re.compile(r'src.bitxorcore.utils.ClampedBaseValue.h'),
	re.compile(r'.*\.cpp$')
)

FILTER_NAMESPACES = (
	re.compile(r'.*detail'),
	re.compile(r'.*_types::'),
	re.compile(r'.*_types$'),
	re.compile(r'.*bson_stream$')
)
