import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CircleDollarSign,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { MonthPicker } from "@/components/app/month-picker";
import {
  CategoryIcon,
  EmptyState,
  ErrorState,
  ListSkeleton,
} from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBudgets,
  useCategories,
  useCategoryReport,
  useDeleteBudget,
  useUpsertBudget,
} from "@/hooks/use-finance";
import {
  currentMonth,
  formatMonthLong,
  formatNumber,
  formatRupiah,
  parseDigits,
  percentage,
} from "@/lib/format";
import { statusTone } from "@/lib/maps";
import { cn } from "@/lib/utils";
import type { Budget, Category } from "@/types/api";

type BudgetRow = {
  budget: Budget;
  category: Category;
  spent: number;
};

function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth);
  const budgets = useBudgets(month);
  const categories = useCategories("expense");
  const byCategory = useCategoryReport(month);
  const upsertBudget = useUpsertBudget();
  const deleteBudget = useDeleteBudget();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetRow | null>(null);
  const [deleting, setDeleting] = useState<BudgetRow | null>(null);

  const rows = useMemo<BudgetRow[]>(() => {
    const categoryList = categories.data ?? [];
    const spentByCategory = new Map(
      (byCategory.data?.items ?? []).map((item) => [item.categoryId, item.total]),
    );
    return (budgets.data ?? [])
      .map((budget) => {
        const category =
          budget.category ?? categoryList.find((item) => item.id === budget.categoryId);
        if (!category) return null;
        return {
          budget,
          category,
          spent: budget.spent ?? spentByCategory.get(budget.categoryId) ?? 0,
        };
      })
      .filter((row): row is BudgetRow => Boolean(row))
      .sort((a, b) => b.spent / b.budget.limitAmount - a.spent / a.budget.limitAmount);
  }, [budgets.data, categories.data, byCategory.data]);

  const unbudgeted = useMemo(
    () =>
      (categories.data ?? []).filter(
        (category) => !(budgets.data ?? []).some((budget) => budget.categoryId === category.id),
      ),
    [categories.data, budgets.data],
  );

  const totalLimit = rows.reduce((sum, row) => sum + row.budget.limitAmount, 0);
  const totalSpent = rows.reduce((sum, row) => sum + row.spent, 0);
  const totalRatio = totalLimit > 0 ? totalSpent / totalLimit : 0;
  const totalStatus = statusTone(totalRatio);
  const remaining = Math.max(0, totalLimit - totalSpent);
  const error = budgets.error ?? categories.error ?? byCategory.error;

  const openCreate = (category?: Category) => {
    if (unbudgeted.length === 0) {
      toast.info("Semua kategori pengeluaran sudah punya anggaran bulan ini.");
      return;
    }
    const selected = category ?? unbudgeted[0];
    setEditing({
      budget: {
        id: "",
        categoryId: selected.id,
        month,
        limitAmount: 0,
      },
      category: selected,
      spent: 0,
    });
    setFormOpen(true);
  };

  const openEdit = (row: BudgetRow) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteBudget.mutateAsync(deleting.budget.id);
      toast.success("Anggaran berhasil dihapus.");
      setDeleting(null);
    } catch {
      toast.error("Gagal menghapus anggaran.");
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex flex-col'>
          <h1 className='text-xl font-bold tracking-tight'>Anggaran</h1>
          <p className='text-xs text-muted-foreground'>Kendalikan pengeluaran per kategori</p>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      <section className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-container p-5 text-primary-foreground shadow-[0_12px_28px_-6px_rgba(79,70,229,0.35)]'>
        <div className='pointer-events-none absolute -top-10 -right-8 size-36 rounded-full bg-primary-foreground/15 blur-2xl' />
        <div className='relative z-10 flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-bold tracking-widest text-primary-foreground/80 uppercase'>
              Total Anggaran {formatMonthLong(month)}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                totalRatio >= 1
                  ? "bg-destructive text-white"
                  : "bg-primary-foreground/15 text-primary-foreground",
              )}
            >
              {totalRatio >= 1 ? <AlertTriangle size={12} /> : <CircleDollarSign size={12} />}
              {Math.round(percentage(totalSpent, totalLimit))}%
            </span>
          </div>

          <div className='flex flex-col gap-0.5'>
            <span className='text-2xl font-bold tracking-tight tabular-nums'>
              {formatRupiah(totalSpent)}
            </span>
            <span className='text-xs text-primary-foreground/80 tabular-nums'>
              dari {formatRupiah(totalLimit)} • sisa {formatRupiah(remaining)}
            </span>
          </div>

          <div className='h-2 w-full overflow-hidden rounded-full bg-primary-foreground/20'>
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                totalRatio >= 1 ? "bg-destructive" : "bg-secondary",
              )}
              style={{ width: `${Math.min(100, percentage(totalSpent, totalLimit))}%` }}
            />
          </div>
          <p className='text-[10px] text-primary-foreground/70'>
            {totalStatus.label} • {rows.length} kategori dianggarkan
          </p>
        </div>
      </section>

      {error && (
        <ErrorState
          message='Gagal memuat data anggaran.'
          onRetry={() => {
            void budgets.refetch();
            void byCategory.refetch();
            void categories.refetch();
          }}
        />
      )}

      <div className='flex items-center justify-between'>
        <h2 className='text-base font-bold tracking-tight'>Anggaran per Kategori</h2>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-8 rounded-full'
          onClick={() => openCreate()}
          disabled={categories.isLoading || budgets.isLoading}
        >
          <Plus size={14} />
          Tambah
        </Button>
      </div>

      {budgets.isLoading || categories.isLoading ? (
        <ListSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={CircleDollarSign}
          title='Belum ada anggaran'
          description={`Tetapkan batas pengeluaran untuk ${formatMonthLong(month)}.`}
          actionLabel='Atur anggaran pertama'
          onAction={() => openCreate()}
        />
      ) : (
        <div className='flex flex-col gap-2.5'>
          {rows.map((row) => {
            const ratio = row.budget.limitAmount > 0 ? row.spent / row.budget.limitAmount : 0;
            const status = statusTone(ratio);
            return (
              <div
                key={row.budget.id}
                className='flex flex-col gap-2.5 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'
              >
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex min-w-0 items-center gap-2.5'>
                    <CategoryIcon name={row.category.name} color={row.category.color} />
                    <div className='flex min-w-0 flex-col'>
                      <span className='truncate text-sm font-semibold'>{row.category.name}</span>
                      <span className='truncate text-xs text-muted-foreground tabular-nums'>
                        {formatRupiah(row.spent)} / {formatRupiah(row.budget.limitAmount)}
                      </span>
                    </div>
                  </div>

                  <div className='flex shrink-0 items-center gap-1'>
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        status.bg,
                        status.text,
                      )}
                    >
                      {ratio >= 1 ? <AlertTriangle size={11} /> : <span className='size-1.5 rounded-full bg-current' />}
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className='h-2 w-full overflow-hidden rounded-full bg-surface-container-high'>
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", status.bar)}
                    style={{ width: `${Math.min(100, percentage(row.spent, row.budget.limitAmount))}%` }}
                  />
                </div>

                <div className='flex items-center justify-between border-t border-border/40 pt-2'>
                  <span className='text-[10px] text-muted-foreground tabular-nums'>
                    Sisa {formatRupiah(Math.max(0, row.budget.limitAmount - row.spent))}
                  </span>
                  <div className='flex items-center gap-1'>
                    <button
                      type='button'
                      onClick={() => openEdit(row)}
                      className='flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground'
                      aria-label={`Edit anggaran ${row.category.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type='button'
                      onClick={() => setDeleting(row)}
                      className='flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                      aria-label={`Hapus anggaran ${row.category.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {unbudgeted.length > 0 && (
        <section className='flex flex-col gap-2.5'>
          <div className='flex items-center gap-2'>
            <h2 className='text-base font-bold tracking-tight'>Belum Dianggarkan</h2>
            <span className='rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-bold text-muted-foreground'>
              {unbudgeted.length}
            </span>
          </div>
          <div className='overflow-hidden rounded-2xl bg-surface-container-lowest ring-1 ring-border/50'>
            <div className='divide-y divide-border/40'>
              {unbudgeted.map((category) => (
                <div key={category.id} className='flex items-center justify-between gap-3 px-4 py-3'>
                  <div className='flex min-w-0 items-center gap-2.5'>
                    <CategoryIcon name={category.name} color={category.color} size='sm' />
                    <span className='truncate text-sm font-medium'>{category.name}</span>
                  </div>
                  <button
                    type='button'
                    onClick={() => openCreate(category)}
                    className='shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15'
                  >
                    Atur budget
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {formOpen && (
        <BudgetDialog
          month={month}
          row={editing}
          categories={editing?.budget.id ? (categories.data ?? []) : unbudgeted}
          onClose={() => setFormOpen(false)}
          onSubmit={async (categoryId, limitAmount) => {
            try {
              await upsertBudget.mutateAsync({ categoryId, month, limitAmount });
              toast.success("Anggaran berhasil disimpan.");
              setFormOpen(false);
            } catch {
              toast.error("Gagal menyimpan anggaran.");
            }
          }}
          submitting={upsertBudget.isPending}
        />
      )}

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus anggaran ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Anggaran {deleting?.category.name} untuk {formatMonthLong(month)} akan dihapus.
              Transaksinya tetap tersimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={handleDelete}
              disabled={deleteBudget.isPending}
            >
              {deleteBudget.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BudgetDialog({
  month,
  row,
  categories,
  onClose,
  onSubmit,
  submitting,
}: {
  month: string;
  row: BudgetRow | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (categoryId: string, limitAmount: number) => void;
  submitting: boolean;
}) {
  const [categoryId, setCategoryId] = useState(
    row?.category.id ?? categories.find((category) => category.type === "expense")?.id ?? "",
  );
  const [amount, setAmount] = useState(
    row?.budget.limitAmount ? String(row.budget.limitAmount) : "",
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!categoryId) {
      setError("Pilih kategori terlebih dahulu.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Batas anggaran harus lebih dari 0.");
      return;
    }
    setError(null);
    onSubmit(categoryId, Number(amount));
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle>{row?.budget.id ? "Edit Anggaran" : "Atur Anggaran"}</DialogTitle>
          <DialogDescription>
            Tetapkan batas pengeluaran untuk {formatMonthLong(month)}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='budget-category'>Kategori</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => setCategoryId(String(value))}
              disabled={Boolean(row?.budget.id)}
            >
              <SelectTrigger id='budget-category' className='h-10 w-full rounded-xl'>
                <SelectValue placeholder='Pilih kategori'>
                  {(value) =>
                    categories.find((category) => category.id === value)?.name ??
                    "Pilih kategori"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((category) => category.type === "expense")
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='budget-amount'>Batas anggaran</Label>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-bold text-muted-foreground'>Rp</span>
              <Input
                id='budget-amount'
                inputMode='numeric'
                value={amount ? formatNumber(Number(amount)) : ""}
                onChange={(event) => setAmount(parseDigits(event.target.value))}
                placeholder='0'
                className='h-10 rounded-xl'
                aria-invalid={Boolean(error)}
              />
            </div>
          </div>

          {error && (
            <p className='rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive'>
              {error}
            </p>
          )}

          <div className='flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2.5 text-[11px] text-muted-foreground'>
            <Check size={14} className='text-secondary' />
            Satu kategori hanya punya satu budget per bulan.
          </div>

          <DialogFooter className='flex-row'>
            <Button
              type='button'
              variant='outline'
              className='h-10 flex-1 rounded-xl'
              onClick={onClose}
            >
              Batal
            </Button>
            <Button type='submit' className='h-10 flex-1 rounded-xl' disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={15} className='animate-spin' />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BudgetsPage;
