const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function htmlWebpackPluginFactory(currency) {
    return new HtmlWebpackPlugin({
        template: 'src/front/page.index.ejs',
        chunks: ['index'],
        filename: `${currency}.html`,
        config: require(`./src/config/${currency}.json`),
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
        'index': './src/front/page.index.js'
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
        htmlWebpackPluginFactory('intensecoin'),
        htmlWebpackPluginFactory('bitsum'),
        new CopyWebpackPlugin([
            {from: './src/front', to: '../public', toType: 'dir'},
            {from: './src/config', to: '../config', toType: 'dir'}
        ], {
            ignore: ['*.js', '*.ejs', '*.less']
        })
    ],
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
            {test: /\.html?$/, use: 'html-loader', exclude: /node_modules/},
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
                target: 'http://127.0.0.1:8888'
            }
        }
    }
};
