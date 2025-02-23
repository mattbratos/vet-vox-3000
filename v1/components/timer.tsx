import { cn } from "@/lib/utils";

interface TimerProps {
  hourLeft: string;
  hourRight: string;
  minuteLeft: string;
  minuteRight: string;
  secondLeft: string;
  secondRight: string;
  timerClassName?: string;
}

export function Timer({
  hourLeft,
  hourRight,
  minuteLeft,
  minuteRight,
  secondLeft,
  secondRight,
  timerClassName,
}: TimerProps) {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 flex items-center gap-1 text-xs font-mono p-2",
        timerClassName,
      )}
    >
      <span>{hourLeft}</span>
      <span>{hourRight}</span>
      <span>:</span>
      <span>{minuteLeft}</span>
      <span>{minuteRight}</span>
      <span>:</span>
      <span>{secondLeft}</span>
      <span>{secondRight}</span>
    </div>
  );
} 