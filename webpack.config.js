const path = require('path');
module.exports = {
    entry: './src/clock.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'clock.js'
    },
    resolve: {
		extensions: [".ts", ".js"]
	},
    module: {
		rules: [
			{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }
		]
	},
};