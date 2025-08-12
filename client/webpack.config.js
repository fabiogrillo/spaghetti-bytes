// client/webpack.config.js

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    const analyzeBundle = process.env.ANALYZE === 'true';

    return {
        entry: './src/index.js',

        output: {
            path: path.resolve(__dirname, 'build'),
            filename: isProduction
                ? 'static/js/[name].[contenthash:8].js'
                : 'static/js/[name].js',
            chunkFilename: isProduction
                ? 'static/js/[name].[contenthash:8].chunk.js'
                : 'static/js/[name].chunk.js',
            clean: true
        },

        optimization: {
            minimize: isProduction,
            minimizer: [
                // JavaScript minification
                new TerserPlugin({
                    terserOptions: {
                        parse: {
                            ecma: 8,
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            comparisons: false,
                            inline: 2,
                            drop_console: isProduction,
                            drop_debugger: isProduction,
                            pure_funcs: ['console.log', 'console.info'],
                        },
                        mangle: {
                            safari10: true,
                        },
                        output: {
                            ecma: 5,
                            comments: false,
                            ascii_only: true,
                        },
                    },
                }),

                // CSS minification
                new CssMinimizerPlugin({
                    minimizerOptions: {
                        preset: [
                            'default',
                            {
                                discardComments: { removeAll: true },
                            },
                        ],
                    },
                }),
            ],

            // Split chunks configuration
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    // Vendor chunk for node_modules
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        priority: 10,
                        reuseExistingChunk: true,
                    },

                    // Separate chunk for React and React DOM
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
                        name: 'react',
                        priority: 20,
                    },

                    // TipTap editor chunk
                    tiptap: {
                        test: /[\\/]node_modules[\\/]@tiptap[\\/]/,
                        name: 'tiptap',
                        priority: 15,
                    },

                    // Framer Motion chunk
                    framer: {
                        test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
                        name: 'framer',
                        priority: 15,
                    },

                    // Charts chunk (Recharts)
                    charts: {
                        test: /[\\/]node_modules[\\/](recharts|d3-.*|victory-.*)[\\/]/,
                        name: 'charts',
                        priority: 15,
                    },

                    // Common chunk for shared code
                    common: {
                        minChunks: 2,
                        priority: 5,
                        reuseExistingChunk: true,
                    },
                },
            },

            // Runtime chunk
            runtimeChunk: {
                name: 'runtime',
            },

            // Module IDs
            moduleIds: 'deterministic',
        },

        module: {
            rules: [
                // JavaScript/JSX
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    useBuiltIns: 'entry',
                                    corejs: 3,
                                    modules: false,
                                }],
                                ['@babel/preset-react', {
                                    runtime: 'automatic'
                                }]
                            ],
                            plugins: [
                                // Dynamic imports
                                '@babel/plugin-syntax-dynamic-import',

                                // Remove PropTypes in production
                                isProduction && [
                                    'transform-react-remove-prop-types',
                                    { removeImport: true }
                                ],

                                // Optimize lodash imports
                                'lodash',
                            ].filter(Boolean),
                        },
                    },
                },

                // CSS
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        'postcss-preset-env',
                                        'autoprefixer',
                                        isProduction && ['cssnano', {
                                            preset: 'default',
                                        }],
                                    ].filter(Boolean),
                                },
                            },
                        },
                    ],
                },

                // Images
                {
                    test: /\.(png|jpg|jpeg|gif|webp|avif)$/i,
                    type: 'asset',
                    parser: {
                        dataUrlCondition: {
                            maxSize: 8 * 1024, // 8kb
                        },
                    },
                    generator: {
                        filename: 'static/images/[name].[hash:8][ext]',
                    },
                },

                // SVG
                {
                    test: /\.svg$/,
                    use: ['@svgr/webpack', 'url-loader'],
                },

                // Fonts
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'static/fonts/[name].[hash:8][ext]',
                    },
                },
            ],
        },

        plugins: [
            // HTML generation
            new HtmlWebpackPlugin({
                template: './public/index.html',
                minify: isProduction && {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true,
                },
            }),

            // Extract CSS
            isProduction && new MiniCssExtractPlugin({
                filename: 'static/css/[name].[contenthash:8].css',
                chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),

            // Compression
            isProduction && new CompressionPlugin({
                algorithm: 'gzip',
                test: /\.(js|css|html|svg)$/,
                threshold: 8192,
                minRatio: 0.8,
            }),

            // Brotli compression
            isProduction && new CompressionPlugin({
                algorithm: 'brotliCompress',
                test: /\.(js|css|html|svg)$/,
                compressionOptions: {
                    level: 11,
                },
                threshold: 8192,
                minRatio: 0.8,
                filename: '[path][base].br',
            }),

            // Service Worker
            isProduction && new WorkboxPlugin.GenerateSW({
                clientsClaim: true,
                skipWaiting: true,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\./,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 5 * 60, // 5 minutes
                            },
                        },
                    },
                    {
                        urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                            },
                        },
                    },
                ],
            }),

            // Bundle analyzer
            analyzeBundle && new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: true,
            }),

            // Define environment variables
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(argv.mode),
            }),

            // Progress plugin
            new webpack.ProgressPlugin(),
        ].filter(Boolean),

        resolve: {
            extensions: ['.js', '.jsx', '.json'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@components': path.resolve(__dirname, 'src/Components'),
                '@pages': path.resolve(__dirname, 'src/Pages'),
                '@utils': path.resolve(__dirname, 'src/utils'),
                '@assets': path.resolve(__dirname, 'src/Assets'),
            },
        },

        devServer: {
            port: 3000,
            hot: true,
            open: true,
            compress: true,
            historyApiFallback: true,
            proxy: {
                '/api': {
                    target: 'http://localhost:5000',
                    changeOrigin: true,
                },
            },
        },

        performance: {
            hints: isProduction ? 'warning' : false,
            maxEntrypointSize: 512000,
            maxAssetSize: 512000,
        },
    };
};