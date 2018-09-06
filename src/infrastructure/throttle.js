export function createThrottle (callback, delay)
{
  let isThrottled = false, args, context;

  function throttle() {
    if (isThrottled) {
      args = arguments;
      context = this;
      return;
    }


    isThrottled = true;
    callback.apply(this, arguments);

    setTimeout(() => {
      isThrottled = false;
      if (args) {
        throttle.apply(context, args);
        args = context = null;
      }
    }, delay);
  }

  return throttle;
}
