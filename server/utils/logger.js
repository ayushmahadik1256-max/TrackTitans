/**
 * Simple structured console logger for TrackTitans backend services.
 */
export const logger = {
  info: (message, meta = {}) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message,
        ...meta,
      })
    );
  },

  warn: (message, meta = {}) => {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        message,
        ...meta,
      })
    );
  },

  error: (message, meta = {}) => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message,
        stack: meta.stack || (meta.error && meta.error.stack),
        ...meta,
      })
    );
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'DEBUG',
          message,
          ...meta,
        })
      );
    }
  },
};

export default logger;
