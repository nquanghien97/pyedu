import { EventEmitter } from 'events';

/**
 * Global notification emitter for Server-Sent Events (SSE).
 * Components call `notificationEmitter.emit('notification:<userId>', payload)`
 * and the SSE handler listens for these events to push to connected clients.
 */
class NotificationEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Allow many SSE listeners (one per connected client)
    this.setMaxListeners(500);
  }
}

export const notificationEmitter = new NotificationEventEmitter();
