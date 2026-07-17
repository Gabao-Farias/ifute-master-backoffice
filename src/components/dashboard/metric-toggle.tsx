import { METRICS, type MetricKey } from '@/lib/metrics';
import { cn } from '@/lib/utils';

type MetricToggleProps = {
  value: MetricKey;
  onChange: (value: MetricKey) => void;
};

/** Segmented control para escolher a métrica exibida (GMV / Receita / Margem). */
export function MetricToggle({ value, onChange }: MetricToggleProps) {
  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-1">
      {METRICS.map((metric) => (
        <button
          key={metric.key}
          onClick={() => onChange(metric.key)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === metric.key
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {metric.short}
        </button>
      ))}
    </div>
  );
}
