type Entry = {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
};

type ParsedEntry = {
  name: string;
  componentName: string;
  phase: string;
  entryType: string;
  startTime: number;
  duration: number;
  warning: string | boolean | null;
};

const REACT_PREFIX = "\u269B ";
const WARNING_PREFIX = "\u26D4 ";

const RENDER_LIFECYCLE_REGEX = /^(\w+) \[(\w+)\]( Warning: (.*))?$/;
const LIFECYCLE_METHOD_REGEX = /^(\w+)\.(\w+)( Warning: (.*))?$/;

const ENTRY_TYPES = ["measure"];

export class ReactPerformanceObserver {
  static parseEntry(entry: Entry): ParsedEntry | null {
    const { name, entryType, startTime, duration } = entry;
    const isReact = name.startsWith(REACT_PREFIX);
    const isWarning = name.startsWith(WARNING_PREFIX);

    if (!isReact && !isWarning) return null;

    const normalized = name.replace(
      isReact ? REACT_PREFIX : WARNING_PREFIX,
      ""
    );
    const match =
      normalized.match(RENDER_LIFECYCLE_REGEX) ||
      normalized.match(LIFECYCLE_METHOD_REGEX);

    if (!match) return null;

    return {
      name,
      componentName: match[1],
      phase: match[2],
      warning: isWarning ? match[4] || true : null,
      entryType,
      startTime,
      duration,
    };
  }

  static observe(callback: (measurements: (ParsedEntry | null)[]) => void) {
    const observer = new window.PerformanceObserver(list => {
        const measurements = list.getEntries()
            .map(ReactPerformanceObserver.parseEntry)
            .filter(Boolean);

        callback(measurements);
    });

    observer.observe({ entryTypes: ENTRY_TYPES });
  }
}
