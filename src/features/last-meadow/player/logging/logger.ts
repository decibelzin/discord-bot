export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, err?: unknown): void;
  debug(message: string): void;
}

export function createConsoleLogger(): Logger {
  return {
    info: (m) => console.log(m),
    warn: (m) => console.warn(m),
    error: (m, err) => {
      console.error(m);
      if (err !== undefined) console.error(err);
    },
    debug: (m) => console.debug(m),
  };
}
