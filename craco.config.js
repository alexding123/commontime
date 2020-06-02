/**
 * Configuration for Craco on how to hijack the underlying webpack
 * Create-React-App uses. Mainly used to enable hot module replacement
 * for now
 */

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.(js)$/,
        use: 'react-hot-loader/webpack',
        include: /node_modules/,
      })

      return webpackConfig
    },
  },
}