const CracoAliasPlugin = require('craco-alias');

module.exports = {
  plugins: [
    {
      plugin: CracoAliasPlugin,
      options: {
        aliases: {
          '@': 'src',
        }
      }
    }
  ]
}
