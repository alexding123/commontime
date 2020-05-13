module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.module.rules.push({
          test: /\.(js)$/,
          use: 'react-hot-loader/webpack',
          include: /node_modules/,
        });
  
        return webpackConfig;
      },
    },
  };