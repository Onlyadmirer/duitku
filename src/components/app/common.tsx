import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox, Loader2, RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { categoryIcon, walletIcon } from "@/lib/maps";

export function CategoryIcon({
  name,
  color,
  size = "md",
  className,
}: {
  name?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = categoryIcon(name);
  const dimension = size === "sm" ? "size-8" : size === "lg" ? "size-12" : "size-10";
  const iconSize = size === "sm" ? 15 : size === "lg" ? 22 : 19;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        dimension,
        className,
      )}
      style={{
        backgroundColor: color ? `${color}18` : "var(--surface-container)",
        color: color ?? "var(--foreground)",
      }}
      aria-hidden='true'
    >
      {/* Ikon berasal dari map statis, bukan komponen baru per render. */}
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon size={iconSize} />
    </span>
  );
}

export function WalletIcon({
  name,
  size = "md",
  className,
}: {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon: LucideIcon = walletIcon(name);
  const dimension = size === "sm" ? "size-8" : size === "lg" ? "size-12" : "size-10";
  const iconSize = size === "sm" ? 15 : size === "lg" ? 22 : 19;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-surface-container text-foreground",
        dimension,
        className,
      )}
      aria-hidden='true'
    >
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon size={iconSize} />
    </span>
  );
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionTo,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}) {
  return (
    <div className='flex items-end justify-between gap-3'>
      <div className='flex min-w-0 flex-col'>
        <h2 className='text-base font-bold tracking-tight text-foreground'>{title}</h2>
        {subtitle && (
          <span className='mt-0.5 text-xs text-muted-foreground'>{subtitle}</span>
        )}
      </div>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className='shrink-0 text-xs font-semibold text-primary hover:underline'
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          type='button'
          onClick={onAction}
          className='shrink-0 text-xs font-semibold text-primary hover:underline'
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-container-lowest px-6 py-10 text-center ring-1 ring-border/50'>
      <span className='flex size-12 items-center justify-center rounded-full bg-surface-container text-muted-foreground'>
        <Icon size={22} />
      </span>
      <div className='flex flex-col gap-1'>
        <p className='text-sm font-semibold text-foreground'>{title}</p>
        {description && (
          <p className='text-xs leading-relaxed text-muted-foreground'>{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type='button'
          onClick={onAction}
          className='mt-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  message = "Gagal memuat data. Coba lagi.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-container-lowest px-6 py-10 text-center ring-1 ring-border/50'>
      <span className='flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive'>
        <AlertCircle size={22} />
      </span>
      <p className='max-w-xs text-xs leading-relaxed text-muted-foreground'>{message}</p>
      {onRetry && (
        <button
          type='button'
          onClick={onRetry}
          className='inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface-container'
        >
          <RefreshCw size={14} />
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function LoadingBlock({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className='flex items-center justify-center gap-2 rounded-2xl bg-surface-container-lowest px-6 py-10 text-xs text-muted-foreground ring-1 ring-border/50'>
      <Loader2 size={16} className='animate-spin' />
      {label}
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className='flex flex-col gap-2.5'>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className='flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'
        >
          <Skeleton className='size-10 rounded-full' />
          <div className='flex flex-1 flex-col gap-2'>
            <Skeleton className='h-3 w-2/3' />
            <Skeleton className='h-2.5 w-1/3' />
          </div>
          <Skeleton className='h-3 w-20' />
        </div>
      ))}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "income" | "expense" | "primary";
  hint?: string;
}) {
  const tones = {
    income: {
      icon: "bg-income-soft text-income",
      value: "text-income",
    },
    expense: {
      icon: "bg-expense-soft text-expense",
      value: "text-expense",
    },
    primary: {
      icon: "bg-primary/10 text-primary",
      value: "text-foreground",
    },
  }[tone];

  return (
    <Card className='flex-1 gap-3 rounded-2xl border-0 bg-surface-container-lowest px-4 py-4 ring-1 ring-border/50'>
      <div className='flex items-center justify-between gap-2'>
        <span className={cn("flex size-9 items-center justify-center rounded-full", tones.icon)}>
          <Icon size={19} />
        </span>
        {hint && (
          <span className='truncate rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-bold text-muted-foreground'>
            {hint}
          </span>
        )}
      </div>
      <div className='flex min-w-0 flex-col'>
        <span className='text-xs text-muted-foreground'>{label}</span>
        <span className={cn("mt-0.5 truncate text-base font-bold tabular-nums", tones.value)}>
          {value}
        </span>
      </div>
    </Card>
  );
}

export function PageIntro({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className='flex items-start gap-3 rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/10'>
      <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
        <Icon size={20} />
      </span>
      <div className='flex flex-col gap-0.5'>
        <p className='text-sm font-semibold text-foreground'>{title}</p>
        <p className='text-xs leading-relaxed text-muted-foreground'>{description}</p>
      </div>
    </div>
  );
}
