export default [{
  name: 'start',
  regex: /\/start$/,
  disabled: false,
  description: 'let the bot help you around',
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
// },{
//   name: 'diff',
//   regex:/\/diff ([^ ]+) ([+-]?\d+(\.\d+)?)$/,
//   params: [
//     'stock-symbol',
//     'numer',
//   ],
//   disabled: false,
//   description: 'Stock will also show ratio to this number',
// },{
//   name: 'add',
//   regex: /\/add ([^ ]+)$/,
//   params: [
//     'stock-symbol',
//   ],
//   disabled: false,
//   description: 'Add stock to full stocks report',
// },{
//   name: 'remove',
//   regex: /\/remove ([^ ]+)$/,
//   params: [
//     'stock-symbol',
//   ],
//   disabled: false,
//   description: 'Remove stock from full stocks report',
// },{
//   name: 'time',
//   regex: /\/time (.+)$/,
//   params: [
//     'time-string',
//   ],
//   disabled: false,
//   description: 'What time to send the report at',
// },{
//   name: 'graph',
//   fn: 'sectorGraphs',
//   regex: /^\/graph$/,
//   disabled: false,
//   description: 'Get sector graphs',
// },{
//   name: 'graph',
//   fn: 'stock3dGraph',
//   regex: /^\/graph ([^ ]+)$/,
//   params: [
//     'stock-symbol',
//   ],
//   disabled: false,
//   description: 'Get stock\'s 3 day graph',
// },{
//   name: 'graph',
//   fn: 'stockGraph',
//   regex: /^\/graph ([^ ]+) (\d+)([dym])?$/,
//   params: [
//     'stock-symbol',
//     'period-amount',
//     'period-sign',
//   ],
//   disabled: false,
//   description: 'Get stock\'s graph for specified period (PERIOD-AMOUNT = number, PERIDO-SIGN = d|m|y)',
// },{
//   name: 'predict',
//   fn: 'predictionByParams',
//   regex: /^\/predict ([01]) (\d+) (\d+(\.\d+)?) (\d+) ([mhD])$/,
//   params: [
//     'days-or-months',
//     'time-back',
//     'percent',
//     'interval',
//     'time-frame',
//   ],
//   disabled: false,
//   description: 'Predict when it\'s a good time to buy a stock\nDAYS-OR-MONTHS = 1|0 TIME-BACK=number PERCENT=float INTERVAL=number TIME-FRAME=m|h|D',
// },{
//   name: 'predict',
//   fn: 'predictNow',
//   regex: /^\/predict$/,
//   disabled: false,
//   description: 'Predict now by previously defined parameters',
// },{
//   disabled: false,
//   name: 'help',
//   regex:/\/help/,
//   description: 'Get this message of explanation of how to use the bot',
}]
