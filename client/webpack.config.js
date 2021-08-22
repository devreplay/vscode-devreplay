'use strict';

const withDefaults = require('../shared.webpack.config');
const path = require('path');

module.exports = withDefaults({
	context: path.join(__dirname),
	entry: {
		extension: './src/extension.ts',
	},
	output: {
		filename: 'extension.js',
		path: path.join(__dirname, 'out')
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [{
					// configure TypeScript loader:
					// * enable sources maps for end-to-end source maps
					loader: 'ts-loader',
					options: {
						compilerOptions: {
							'sourceMap': true,
						}
					}
				}]
			},
			{
				test: /\.wasm$/,
				loader: 'file-loader',
				options: {
					name: '[path][name].[ext]',
				}
			}
		]
	}
}); 