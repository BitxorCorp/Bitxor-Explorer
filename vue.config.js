// Read config files that may not exist.

module.exports = {
	// base url
	publicPath: '/',
	// output dir
	outputDir: './www',
	// eslint-loader check
	lintOnSave: true,
	// webpack-dev-server
	devServer: {
		host: 'explorer.bitxor.org',
		port: 80,
		before: app => {
		}
	},
	css: {
		// modules: true,
		loaderOptions: {
			sass: {
				prependData: '@import "~@/styles/variables.scss";'
			}
		}
	}
};
