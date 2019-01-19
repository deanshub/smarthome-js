export default [{
  name: 'start',
  regex: /\/start$/,
  disabled: false,
  description: 'let the bot help you around',
},{
  name: 'rediscover',
  regex: /\/rediscover$/,
  disabled: false,
  description: 'rediscover controlled devices',
},{
  name: 'log',
  regex: /\/log( \d+)?/,
  disabled: false,
  description: 'get the log of the last hour',
},{
//   name: 'cold',
//   regex: /\/cold/,
//   disabled: false,
//   description: 'make it 17 degrees',
// },{
//   name: 'hot',
//   regex: /\/hot/,
//   disabled: false,
//   description: 'make it 30 degrees',
// },{
//   name: 'off',
//   regex: /\/off/,
//   disabled: false,
//   description: 'turn ac off',
// },{
//   name: 'temp',
//   regex: /\/temp/,
//   disabled: false,
//   description: 'check temperature',
// },{
  name: 'help',
  regex: /\/help/,
  disabled: false,
  description: 'help instructions',
}, {
  name: 'callback',
  disabled: false,
}]
