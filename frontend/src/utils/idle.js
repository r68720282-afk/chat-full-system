export default function attachIdleDetector(socket, opts = {}) {
  const idleMs = opts.idleMs || (1000 * 60 * 2); // 2 minutes default
  let timer = null;
  let isIdle = false;

  function reset() {
    if (isIdle) {
      isIdle = false;
      socket.emit('presence_idle', { isIdle: false });
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      isIdle = true;
      socket.emit('presence_idle', { isIdle: true });
    }, idleMs);
  }

  ['mousemove','keydown','mousedown','touchstart'].forEach(ev => {
    window.addEventListener(ev, reset);
  });

  reset(); // start
  // return cleanup
  return function detach() {
    ['mousemove','keydown','mousedown','touchstart'].forEach(ev => {
      window.removeEventListener(ev, reset);
    });
    clearTimeout(timer);
  };
}
