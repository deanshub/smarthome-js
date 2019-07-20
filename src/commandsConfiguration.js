export default [
  {
    name: 'start',
    regex: /\/start$/,
    disabled: false,
    description: 'let the bot help you around',
  },
  {
    name: 'rediscover',
    regex: /\/rediscover$/,
    disabled: false,
    description: 'rediscover controlled devices',
  },
  {
    name: 'log',
    regex: /\/log( \d+)?/,
    disabled: false,
    description: 'get the log of the last hour',
  },
  {
    name: 'web',
    regex: /\/search (.+)/,
    disabled: false,
    description: 'Google search',
    fn: 'google',
    auth: false,
  },
  {
    name: 'web',
    regex: /\/youtube (.+)/,
    disabled: false,
    description: 'Youtube search',
    fn: 'youtube',
    auth: true,
  },
  {
    name: 'help',
    regex: /\/help/,
    disabled: false,
    description: 'help instructions',
  },
  {
    name: 'reminder',
    regex: /\/remind/,
    disabled: false,
    description: 'set a reminder',
  },
  {
    name: 'reminder',
    fn: 'getAllReminders',
    regex: /\/allreminders/,
    disabled: false,
    description: 'set a reminder',
  },
  {
    name: 'callback',
    disabled: false,
  },
]
