const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const glob = require('glob');

const currencies = glob.sync('src/config/*.json', {cwd: __dirname})
    .map(file => file.replace(/src\/config\//, '').replace(/.json$/, ''));

function htmlWebpackPluginFactory(currencies, currency) {
    return new HtmlWebpackPlugin({
        template: 'src/front/index.ejs',
        chunks: ['index'],
        filename: `${currency}.html`,
        config: require(`./src/config/${currency}.json`),
        currencies,
        minify: {
            collapseInlineTagWhitespace: false,
            collapseWhitespace: true
        },
        pkg
    });
}

module.exports = {
    devtool: ' source-map',

    entry: {
        'index': './src/front/index.js'
    },

    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name].[hash].js'
    },

    plugins: [
        new CleanWebpackPlugin(['public', 'config']),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default']
        }),
        new CopyWebpackPlugin([
            {from: './src/front', to: '../public', toType: 'dir'},
            {from: './src/config', to: '../config', toType: 'dir'}
        ], {
            ignore: ['*.js', '*.ejs', '*.less']
        })
    ].concat(
        currencies.map(c => htmlWebpackPluginFactory(currencies, c))
    ),

    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
            {test: /\.ejs?$/, use: 'ejs-compiled-loader', exclude: /node_modules/},
            {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
            {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml'},
            {test: /\.jpg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader'},
            {test: /\.less$/, loader: 'style-loader!css-loader!less-loader'},
            {test: /\.css$/, loader: 'style-loader!css-loader'}
        ]
    },

    devServer: {
        https: true,
        contentBase: 'src/front',
        port: 9000,
        proxy: {
            '/api': {
                target: 'http://localhost:8888'
            },
            '/auth': {
                target: 'http://localhost:8888'
            }
        }
    }
};
