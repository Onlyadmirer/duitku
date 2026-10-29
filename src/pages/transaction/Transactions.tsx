import { useDeferredValue, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  CalendarDays,
  Filter,
  Loader2,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  CategoryIcon,
  EmptyState,
  ErrorState,
  ListSkeleton,
} from "@/components/app/common";
import {
  useCategories,
  useDeleteTransaction,
  useInfiniteTransactions,
  useWallets,
} from "@/hooks/use-finance";
import {
  formatDate,
  formatDayLabel,
  formatRupiah,
  formatSignedRupiah,
} from "@/lib/format";
import type { Transaction, TransactionType } from "@/types/api";
import { cn } from "@/lib/utils";

type TransactionSearch = {
  q?: string;
  type?: TransactionType;
  walletId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
};

type FilterDraft = {
  type: string;
  walletId: string;
  categoryId: string;
  from: string;
  to: string;
};

const emptyDraft: FilterDraft = {
  type: "all",
  walletId: "all",
  categoryId: "all",
  from: "",
  to: "",
};

const toDraft = (search: TransactionSearch): FilterDraft => ({
  type: search.type ?? "all",
  walletId: search.walletId ?? "all",
  categoryId: search.categoryId ?? "all",
  from: search.from ?? "",
  to: search.to ?? "",
});

function filterCount(search: TransactionSearch) {
  return [search.type, search.walletId, search.categoryId, search.from, search.to].filter(
    Boolean,
  ).length;
}

function TransactionsPage() {
  const search = useSearch({ strict: false }) as TransactionSearch;
  const navigate = useNavigate();
  const term = search.q ?? "";
  const deferredTerm = useDeferredValue(term);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const wallets = useWallets();
  const categories = useCategories();
  const deleteTransaction = useDeleteTransaction();

  const filters = useMemo(
    () => ({
      type: search.type,
      walletId: search.walletId,
      categoryId: search.categoryId,
      from: search.from,
      to: search.to,
      search: deferredTerm.trim() || undefined,
      limit: 20,
    }),
    [search.type, search.walletId, search.categoryId, search.from, search.to, deferredTerm],
  );

  const transactions = useInfiniteTransactions(filters);
  const rawItems = useMemo(
    () => transactions.data?.pages.flatMap((page) => page.items) ?? [],
    [transactions.data],
  );
  const categoryById = useMemo(
    () => new Map((categories.data ?? []).map((category) => [category.id, category])),
    [categories.data],
  );
  const walletById = useMemo(
    () => new Map((wallets.data ?? []).map((wallet) => [wallet.id, wallet])),
    [wallets.data],
  );
  const items = useMemo(
    () =>
      rawItems.map((transaction) => ({
        ...transaction,
        category:
          transaction.category ?? categoryById.get(transaction.categoryId) ?? null,
        wallet: transaction.wallet ?? walletById.get(transaction.walletId) ?? null,
      })),
    [rawItems, categoryById, walletById],
  );
  const total = transactions.data?.pages[0]?.total ?? 0;

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const item of items) {
      const list = map.get(item.date) ?? [];
      list.push(item);
      map.set(item.date, list);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [items]);

  const updateSearch = (
    patch: Partial<TransactionSearch>,
    options?: { replace?: boolean },
  ) => {
    navigate({
      to: "/transaksi",
      search: { ...search, ...patch },
      replace: options?.replace,
    });
  };

  const updateTerm = (value: string) => {
    updateSearch({ q: value.trim() ? value : undefined }, { replace: true });
  };

  const applyFilters = (draft: FilterDraft) => {
    updateSearch({
      type: draft.type === "all" ? undefined : (draft.type as TransactionType),
      walletId: draft.walletId === "all" ? undefined : draft.walletId,
      categoryId: draft.categoryId === "all" ? undefined : draft.categoryId,
      from: draft.from || undefined,
      to: draft.to || undefined,
    });
    setFilterOpen(false);
  };

  const clearFilters = () => {
    navigate({ to: "/transaksi", search: {}, replace: true });
  };

  const activeCount = filterCount(search);
  const walletName = wallets.data?.find((wallet) => wallet.id === search.walletId)?.name;
  const categoryName = categories.data?.find(
    (category) => category.id === search.categoryId,
  )?.name;

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteTransaction.mutateAsync(selected.id);
      toast.success("Transaksi berhasil dihapus.");
      setDeleteOpen(false);
      setSelected(null);
    } catch {
      toast.error("Gagal menghapus transaksi.");
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex flex-col'>
          <h1 className='text-xl font-bold tracking-tight'>Transaksi</h1>
          <p className='text-xs text-muted-foreground'>
            {total > 0 ? `${total} transaksi ditemukan` : "Semua catatan keuanganmu"}
          </p>
        </div>
        <Link
          to='/transaksi/baru'
          className='inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
        >
          <Plus size={16} />
          Catat
        </Link>
      </div>

      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Search
            size={16}
            className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
          />
          <Input
            value={term}
            onChange={(event) => updateTerm(event.target.value)}
            placeholder='Cari catatan transaksi...'
            className='h-10 rounded-xl pl-9'
            aria-label='Cari transaksi'
          />
          {term && (
            <button
              type='button'
              onClick={() => updateTerm("")}
              className='absolute top-1/2 right-2.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-container'
              aria-label='Hapus pencarian'
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type='button'
          onClick={() => setFilterOpen(true)}
          className='relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-foreground transition-colors hover:bg-surface-container'
          aria-label='Buka filter'
        >
          <Filter size={17} />
          {activeCount > 0 && (
            <span className='absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground'>
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {(activeCount > 0 || term) && (
        <div className='flex flex-wrap items-center gap-1.5'>
          {search.type && (
            <FilterChip
              label={search.type === "income" ? "Pemasukan" : "Pengeluaran"}
              onRemove={() => updateSearch({ type: undefined })}
            />
          )}
          {walletName && (
            <FilterChip
              label={walletName}
              onRemove={() => updateSearch({ walletId: undefined })}
            />
          )}
          {categoryName && (
            <FilterChip
              label={categoryName}
              onRemove={() => updateSearch({ categoryId: undefined })}
            />
          )}
          {search.from && (
            <FilterChip
              label={`Dari ${formatDate(search.from)}`}
              onRemove={() => updateSearch({ from: undefined })}
            />
          )}
          {search.to && (
            <FilterChip
              label={`Sampai ${formatDate(search.to)}`}
              onRemove={() => updateSearch({ to: undefined })}
            />
          )}
          {term && (
            <FilterChip label={`"${term}"`} onRemove={() => updateTerm("")} />
          )}
          <button
            type='button'
            onClick={clearFilters}
            className='ml-1 text-[11px] font-semibold text-primary hover:underline'
          >
            Reset
          </button>
        </div>
      )}

      {transactions.isLoading ? (
        <ListSkeleton rows={5} />
      ) : transactions.isError ? (
        <ErrorState
          message='Gagal memuat transaksi.'
          onRetry={() => void transactions.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title='Tidak ada transaksi'
          description={
            activeCount > 0 || term
              ? "Coba ubah kata kunci atau filter pencarianmu."
              : "Mulai catat pemasukan dan pengeluaran pertamamu."
          }
          actionLabel='Catat transaksi'
          onAction={() => navigate({ to: "/transaksi/baru" })}
        />
      ) : (
        <div className='flex flex-col gap-5'>
          {groups.map(([date, dayItems]) => {
            const dayExpense = dayItems
              .filter((item) => item.type === "expense")
              .reduce((sum, item) => sum + item.amount, 0);
            const dayIncome = dayItems
              .filter((item) => item.type === "income")
              .reduce((sum, item) => sum + item.amount, 0);
            return (
              <section key={date} className='flex flex-col gap-2'>
                <div className='flex items-center justify-between px-1'>
                  <span className='text-[11px] font-bold tracking-wide text-muted-foreground uppercase'>
                    {formatDayLabel(date)}
                  </span>
                  <span className='text-[10px] font-semibold text-muted-foreground tabular-nums'>
                    {dayIncome > 0 && (
                      <span className='mr-2 text-income'>+{formatRupiah(dayIncome)}</span>
                    )}
                    {dayExpense > 0 && (
                      <span className='text-expense'>-{formatRupiah(dayExpense)}</span>
                    )}
                  </span>
                </div>

                <div className='overflow-hidden rounded-2xl bg-surface-container-lowest ring-1 ring-border/50'>
                  <div className='divide-y divide-border/40'>
                    {dayItems.map((transaction) => {
                      const isIncome = transaction.type === "income";
                      return (
                        <button
                          key={transaction.id}
                          type='button'
                          onClick={() => setSelected(transaction)}
                          className='flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'
                        >
                          <div className='flex min-w-0 items-center gap-3'>
                            <CategoryIcon
                              name={transaction.category?.name}
                              color={transaction.category?.color}
                            />
                            <div className='flex min-w-0 flex-col'>
                              <span className='truncate text-sm font-semibold text-foreground'>
                                {transaction.note || transaction.category?.name || "Transaksi"}
                              </span>
                              <span className='truncate text-xs text-muted-foreground'>
                                {[transaction.category?.name, transaction.wallet?.name]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </span>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "ml-2 shrink-0 text-sm font-bold whitespace-nowrap tabular-nums",
                              isIncome ? "text-income" : "text-expense",
                            )}
                          >
                            {formatSignedRupiah(isIncome ? transaction.amount : -transaction.amount)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}

          {transactions.hasNextPage && (
            <Button
              type='button'
              variant='outline'
              className='h-10 rounded-xl'
              onClick={() => void transactions.fetchNextPage()}
              disabled={transactions.isFetchingNextPage}
            >
              {transactions.isFetchingNextPage ? (
                <>
                  <Loader2 size={15} className='animate-spin' />
                  Memuat...
                </>
              ) : (
                "Muat lebih banyak"
              )}
            </Button>
          )}
        </div>
      )}

      {filterOpen && (
        <FilterSheet
          onOpenChange={setFilterOpen}
          initial={toDraft(search)}
          wallets={wallets.data ?? []}
          categories={categories.data ?? []}
          onApply={applyFilters}
          onReset={() => {
            applyFilters(emptyDraft);
          }}
        />
      )}

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side='bottom' className='mx-auto max-w-[480px] rounded-t-3xl'>
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Detail Transaksi</SheetTitle>
                <SheetDescription>
                  {formatDayLabel(selected.date)}
                </SheetDescription>
              </SheetHeader>

              <div className='flex flex-col gap-4 px-4 pb-2'>
                <div className='flex flex-col items-center gap-1 rounded-2xl bg-surface-container-low py-5'>
                  <span
                    className={cn(
                      "text-[11px] font-bold tracking-widest uppercase",
                      selected.type === "income" ? "text-income" : "text-expense",
                    )}
                  >
                    {selected.type === "income" ? "Pemasukan" : "Pengeluaran"}
                  </span>
                  <span
                    className={cn(
                      "text-2xl font-bold tracking-tight tabular-nums",
                      selected.type === "income" ? "text-income" : "text-expense",
                    )}
                  >
                    {formatSignedRupiah(
                      selected.type === "income" ? selected.amount : -selected.amount,
                    )}
                  </span>
                </div>

                <div className='flex flex-col divide-y divide-border/40 rounded-2xl bg-surface-container-lowest ring-1 ring-border/50'>
                  <DetailRow label='Kategori' value={selected.category?.name ?? "-"} />
                  <DetailRow label='Dompet' value={selected.wallet?.name ?? "-"} />
                  <DetailRow label='Tanggal' value={formatDate(selected.date)} />
                  <DetailRow label='Catatan' value={selected.note || "-"} />
                </div>
              </div>

              <SheetFooter className='flex-row'>
                <Button
                  type='button'
                  variant='destructive'
                  className='h-10 flex-1 rounded-xl'
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 size={15} />
                  Hapus
                </Button>
                <Button
                  type='button'
                  className='h-10 flex-1 rounded-xl'
                  onClick={() =>
                    navigate({ to: "/transaksi/$id", params: { id: selected.id } })
                  }
                >
                  Edit transaksi
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus transaksi ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Saldo dompet dan laporan akan ikut
              diperbarui.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={handleDelete}
              disabled={deleteTransaction.isPending}
            >
              {deleteTransaction.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className='inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pr-1 pl-2.5 text-[11px] font-semibold text-primary'>
      {label}
      <button
        type='button'
        onClick={onRemove}
        className='flex size-4 items-center justify-center rounded-full hover:bg-primary/15'
        aria-label={`Hapus filter ${label}`}
      >
        <X size={11} />
      </button>
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between gap-4 px-4 py-3'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <span className='max-w-[60%] truncate text-right text-xs font-semibold text-foreground'>
        {value}
      </span>
    </div>
  );
}

function FilterSheet({
  onOpenChange,
  initial,
  wallets,
  categories,
  onApply,
  onReset,
}: {
  onOpenChange: (open: boolean) => void;
  initial: FilterDraft;
  wallets: { id: string; name: string }[];
  categories: { id: string; name: string; type: TransactionType }[];
  onApply: (draft: FilterDraft) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<FilterDraft>(initial);

  const set = (patch: Partial<FilterDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='mx-auto max-w-[480px] rounded-t-3xl'>
        <SheetHeader>
          <SheetTitle>Filter Transaksi</SheetTitle>
          <SheetDescription>
            Persempit daftar transaksi sesuai kebutuhanmu.
          </SheetDescription>
        </SheetHeader>

        <div className='flex flex-col gap-4 px-4'>
          <div className='flex flex-col gap-2'>
            <Label>Tipe transaksi</Label>
            <Select value={draft.type} onValueChange={(value) => set({ type: String(value) })}>
              <SelectTrigger className='h-10 w-full rounded-xl'>
                <SelectValue>
                  {(value) =>
                    value === "income"
                      ? "Pemasukan"
                      : value === "expense"
                        ? "Pengeluaran"
                        : "Semua tipe"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Semua tipe</SelectItem>
                <SelectItem value='income'>Pemasukan</SelectItem>
                <SelectItem value='expense'>Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Dompet</Label>
            <Select value={draft.walletId} onValueChange={(value) => set({ walletId: String(value) })}>
              <SelectTrigger className='h-10 w-full rounded-xl'>
                <SelectValue>
                  {(value) =>
                    value === "all"
                      ? "Semua dompet"
                      : wallets.find((wallet) => wallet.id === value)?.name ?? "Semua dompet"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Semua dompet</SelectItem>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Kategori</Label>
            <Select
              value={draft.categoryId}
              onValueChange={(value) => set({ categoryId: String(value) })}
            >
              <SelectTrigger className='h-10 w-full rounded-xl'>
                <SelectValue>
                  {(value) =>
                    value === "all"
                      ? "Semua kategori"
                      : categories.find((category) => category.id === value)?.name ??
                        "Semua kategori"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Semua kategori</SelectItem>
                {categories
                  .filter((category) => draft.type === "all" || category.type === draft.type)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='filter-from'>Dari tanggal</Label>
              <Input
                id='filter-from'
                type='date'
                value={draft.from}
                onChange={(event) => set({ from: event.target.value })}
                className='h-10 rounded-xl'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='filter-to'>Sampai tanggal</Label>
              <Input
                id='filter-to'
                type='date'
                value={draft.to}
                onChange={(event) => set({ to: event.target.value })}
                className='h-10 rounded-xl'
              />
            </div>
          </div>

          <button
            type='button'
            onClick={onReset}
            className='flex items-center gap-1.5 self-start text-[11px] font-semibold text-muted-foreground hover:text-foreground'
          >
            <CalendarDays size={13} />
            Reset semua filter
          </button>
        </div>

        <SheetFooter className='flex-row'>
          <Button
            type='button'
            variant='outline'
            className='h-10 flex-1 rounded-xl'
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type='button'
            className='h-10 flex-1 rounded-xl'
            onClick={() => onApply(draft)}
          >
            Terapkan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default TransactionsPage;
