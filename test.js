const { EventEmitter } = require('./dist/index');
console.warn('#### ', EventEmitter);

class eventemitter extends EventEmitter {
  constructor () {
    super();
    const listener = (...args) => {
      console.log('event a fire',  ...args);
    };
    this.on('eventa', listener);

    this.once('eventonce', (...args) => {
      console.log('event once fire', ...args);
    });

    this.emit('eventa', 1,2,3);
    this.emit('eventa', 4,5,6);
    this.off('eventa', listener);
    console.log('eventa should off');
    this.emit('eventa', 7,8,9);

    this.emit('eventonce', 1,2,3);
    console.log('eventonce should off');
    this.emit('eventonce', 4,5,6);
  }
}

new eventemitter();