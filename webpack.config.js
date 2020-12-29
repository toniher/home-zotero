const Webpack = require('webpack');
const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const IgnoreEmitPlugin = require('ignore-emit-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

// take debug mode from the
const devMode = (process.env.NODE_ENV !== 'production');

var performance = {};

if ( devMode ) {
	performance = {
			hints: false,
			maxEntrypointSize: 512000,
			maxAssetSize: 512000
	};
}

const rootAssetPath = path.join(__dirname, 'assets');

const hashType = devMode ? '[hash]': '[hash]';
// const hashType = devMode ? '[hash]': '[contentHash]'

let publicHost = devMode ? 'http://0.0.0.0:2992' : '';

const dist = path.resolve(__dirname, 'elementaldb', 'static');

const plugins = [];

plugins.push(
	new Webpack.ProvidePlugin( {
		$: 'jquery',
		jQuery: 'jquery',
		'window.jQuery': 'jquery',
		async: 'async',
		Popper: ['popper.js', 'default']
	} ),
	new MiniCssExtractPlugin({
		filename: 'css/[name].'+hashType+'.css'
  }),
	new Webpack.NamedModulesPlugin(),
	new Webpack.HotModuleReplacementPlugin(),
	// new IgnoreEmitPlugin(/(?<=main_css\s*).*?(?=\s*js)/gs),
	new ManifestPlugin( {
			map: (file) => {
			// Remove hash in manifest key
			file.name = file.name.replace(/(\.[a-f0-9]{32})(\..*)$/, '$2');
			return file;
			},
			writeToFileEmit: true,
	} ),
	new IgnoreEmitPlugin(/(?<=main_css\s*).*?(?=\s*js)/gs)
);

module.exports = {
	optimization: {
	minimize: true,
  minimizer: [
		// new TerserJSPlugin({
		//	test: /\.js(\?.*)?$/i,
		// 	exclude: /node_modules/
		// }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      canPrint: true
    }),
  	],
	},
  mode : devMode ? 'development' : 'production',
	performance: performance,
  entry: {
		main_js: path.join(__dirname, 'assets', 'js', 'main.js'),
    main_css: [
      path.join(__dirname, 'assets', 'styles', 'main.scss'),
			'bootstrap/dist/css/bootstrap.min.css'
    ]
	},
  output: {
    path: dist,
    publicPath: `${publicHost}/static/`,
		filename: "js/[name]." + hashType + ".js",
		chunkFilename: "js/[name]." + hashType + ".chunk.js"
	},
  devtool: false,
  module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: {
            loader: 'babel-loader',
            query: {
              presets: ['es2015']
            }
          },
            exclude: /(node_modules|bower_components)/,
        },
				{
						test: /\.s?[ac]ss$/,
						use: [
								MiniCssExtractPlugin.loader,
								{ loader: 'css-loader', options: { url: false, sourceMap: true } },
								{ loader: 'sass-loader', options: { sourceMap: true } }
						],
				},

				{ test: /\.html$/, loader: 'raw-loader' },
				{ test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
        {
          test: /\.json$/,
					type: 'javascript/auto',
          include: [
            path.resolve(__dirname, "assets/data"),
          ],
          use: [
            {
              loader: 'file-loader',
              options: {
                name: "[name].[ext]"
              }
            }
          ]
        },
				{
	        test: /\.(ttf|eot|svg|png|jpe?g|gif|ico)(\?.*)?$/i,
					include: [
            path.resolve(__dirname, "assets/img")
          ],
	        loader: `file-loader?context=${rootAssetPath}&name=[path][name].${hashType}.[ext]`
	      },
      ],
  },
  plugins: plugins,
  node : {
		fs: "empty"
  }
};
