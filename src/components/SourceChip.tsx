import { STATUS_LABEL, type SourceStatus } from '../data/investigations';

const CHIP_CLASS: Record<SourceStatus, string> = {
  local: 'chip-local',
  registered: 'chip-registered',
  external: 'chip-external',
  monitor: 'chip-caution',
};

export function StatusChip({ status }: { status: SourceStatus }) {
  return (
    <span className={`chip ${CHIP_CLASS[status]}`}>
      <span className="dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function FunctionTag({ fn }: { fn: 'prevent' | 'detect' | 'suppress' | 'context' }) {
  const label = { prevent: 'Prevent', detect: 'Detect', suppress: 'Suppress', context: 'Context' }[fn];
  return (
    <span className={`chip fn-tag fn-${fn}`}>
      <span className="dot" aria-hidden="true" />
      {label}
    </span>
  );
}