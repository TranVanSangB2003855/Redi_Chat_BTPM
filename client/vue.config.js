module.exports = {
  // configureWebpack: {
  //   module: {
  //     rules: [
  //       {
  //         test: /\.mjs$/,
  //         include: /node_modules/,
  //         type: 'javascript/auto',
  //       },
  //     ],
  //   },
  // },
    publicPath: process.env.NODE_ENV === 'production'
      ? '/Redi/'
      : '/'
  }