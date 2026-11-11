const CracoAliasPlugin = require('craco-alias');

module.exports = {
  plugins: [
    {
      plugin: CracoAliasPlugin,
      options: {
        aliases: {
          '@core': 'src/core',
          '@ui': 'src/ui'
        }
      }
    }
  ]
}
