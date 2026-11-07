/**
 * Makes writes to chrome.storage run one after another, so a read-modify-write
 * never works on data another write is about to replace.
 * A failed task rejects for its caller only; later tasks still run.
 */
export default function createWriteQueue() {
  let tail: Promise<unknown> = Promise.resolve();
  return function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = tail.then(task);
    tail = run.catch(() => undefined);
    return run;
  };
}
