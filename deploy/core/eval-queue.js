/**
 * Minimal serialized evaluation queue/lock for single-simulation runtime.
 * - Ensures only one async task (battle) runs at a time.
 * - FIFO ordering.
 * - Continues after task errors.
 *
 * Usage:
 *  const { defaultQueue } = require('./core/eval-queue');
 *  await defaultQueue.enqueue(() => runBattle(params));
 */

class EvaluationQueue {
  constructor() {
    this._queue = [];
    this._running = false;
    this._currentLabel = null;
  }

  get isRunning() {
    return this._running;
  }

  get length() {
    return this._queue.length;
  }

  get currentLabel() {
    return this._currentLabel;
  }

  /**
   * Enqueue a task function which can return a value or a Promise.
   * The task will execute when the queue reaches it, with concurrency=1.
   * @param {Function} taskFn - () => any | Promise<any>
   * @param {string} [label] - Optional label for debugging/telemetry
   * @returns {Promise<any>} resolves/rejects with task result/error
   */
  enqueue(taskFn, label = undefined) {
    if (typeof taskFn !== 'function') {
      return Promise.reject(new TypeError('enqueue expects a function'));
    }

    return new Promise((resolve, reject) => {
      this._queue.push({ taskFn, resolve, reject, label });
      // Attempt to start if idle.
      this._drain();
    });
  }

  // Internal: run next task if available and not already running.
  _drain() {
    if (this._running) return;
    const next = this._queue.shift();
    if (!next) return;

    this._running = true;
    this._currentLabel = next.label || null;

    let result;
    try {
      result = next.taskFn();
    } catch (err) {
      // Synchronous error path
      this._finalize(next, undefined, err);
      return;
    }

    Promise.resolve(result)
      .then((val) => this._finalize(next, val, undefined))
      .catch((err) => this._finalize(next, undefined, err));
  }

  _finalize(entry, value, error) {
    try {
      if (error !== undefined) entry.reject(error);
      else entry.resolve(value);
    } finally {
      this._running = false;
      this._currentLabel = null;
      // Continue with the next queued task.
      // Use microtask to avoid deep recursion in extreme chains.
      Promise.resolve().then(() => this._drain());
    }
  }
}

const defaultQueue = new EvaluationQueue();

module.exports = {
  EvaluationQueue,
  defaultQueue,
};
