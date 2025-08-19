const { EvaluationQueue, defaultQueue } = require('../core/eval-queue');

// Helper to wait N ms
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

describe('EvaluationQueue', () => {
  test('runs only one task at a time and preserves order', async () => {
    const q = new EvaluationQueue();
    const runningFlags = [];

    // Track concurrency (should never exceed 1)
    let concurrent = 0;
    const task = (id, ms) => async () => {
      concurrent += 1;
      runningFlags.push({ id, concurrent });
      expect(concurrent).toBe(1);
      await delay(ms);
      concurrent -= 1;
      return id;
    };

    const p1 = q.enqueue(task('A', 50), 'A');
    const p2 = q.enqueue(task('B', 10), 'B');
    const p3 = q.enqueue(task('C', 5), 'C');

    const results = await Promise.all([p1, p2, p3]);

    expect(results).toEqual(['A', 'B', 'C']);
    // Ensure order of start was FIFO and concurrency was enforced
    expect(runningFlags.map((r) => r.id)).toEqual(['A', 'B', 'C']);
    expect(Math.max(...runningFlags.map((r) => r.concurrent))).toBe(1);
    expect(q.isRunning).toBe(false);
    expect(q.length).toBe(0);
  });

  test('continues after a task throws and rejects that one only', async () => {
    const q = new EvaluationQueue();
    const calls = [];

    const okTask = (label) => async () => {
      calls.push(label);
      await delay(10);
      return label;
    };
    const badTask = async () => {
      calls.push('bad');
      await delay(5);
      throw new Error('boom');
    };

    const p1 = q.enqueue(okTask('first'), 'first');
    const p2 = q.enqueue(badTask, 'bad');
    const p3 = q.enqueue(okTask('third'), 'third');

    const r1 = await p1;
    await expect(p2).rejects.toThrow('boom');
    const r3 = await p3;

    expect(r1).toBe('first');
    expect(r3).toBe('third');
    expect(calls).toEqual(['first', 'bad', 'third']);
    expect(q.isRunning).toBe(false);
    expect(q.length).toBe(0);
  });

  test('defaultQueue is shared and serializes tasks globally', async () => {
    const markers = [];

    const t = (label, ms) => async () => {
      markers.push(`start:${label}`);
      await delay(ms);
      markers.push(`end:${label}`);
      return label;
    };

    const p1 = defaultQueue.enqueue(t('X', 25), 'X');
    const p2 = defaultQueue.enqueue(t('Y', 10), 'Y');

    const res = await Promise.all([p1, p2]);
    expect(res).toEqual(['X', 'Y']);

    // Ensure no interleaving that indicates concurrency
    const joined = markers.join('|');
    expect(joined).toBe('start:X|end:X|start:Y|end:Y');
  });
});
