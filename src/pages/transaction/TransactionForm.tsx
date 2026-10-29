import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowDownLeft, ArrowUpRight, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/app/common";
import {
  useCategories,
  useCreateTransaction,
  useTransaction,
  useUpdateTransaction,
  useWallets,
} from "@/hooks/use-finance";
import { getApiError } from "@/lib/api";
import {
  currentMonth,
  formatMonth,
  formatNumber,
  parseDigits,
  todayISO,
} from "@/lib/format";
import type { Transaction, TransactionType } from "@/types/api";
import { cn } from "@/lib/utils";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .string()
    .min(1, "Nominal wajib diisi")
    .refine((value) => Number(value) > 0, "Nominal harus lebih dari 0"),
  walletId: z.string().min(1, "Pilih dompet"),
  categoryId: z.string().min(1, "Pilih kategori"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  note: z.string().max(200, "Catatan maksimal 200 karakter").optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

type FormInitial = {
  type: TransactionType;
  amount: string;
  walletId: string;
  categoryId: string;
  date: string;
  note: string;
};

const buildInitial = (
  transaction: Transaction | undefined,
  wallets: { id: string }[],
  categories: { id: string; type: TransactionType }[],
): FormInitial => {
  if (transaction) {
    return {
      type: transaction.type,
      amount: String(transaction.amount),
      walletId: transaction.walletId,
      categoryId: transaction.categoryId,
      date: transaction.date.slice(0, 10),
      note: transaction.note ?? "",
    };
  }
  const type: TransactionType = "expense";
  return {
    type,
    amount: "",
    walletId: wallets[0]?.id ?? "",
    categoryId: categories.find((category) => category.type === type)?.id ?? "",
    date: todayISO(),
    note: "",
  };
};

export function TransactionForm({ id }: { id?: string }) {
  const navigate = useNavigate();
  const transaction = useTransaction(id ?? "");
  const wallets = useWallets();
  const categories = useCategories();

  if (id && transaction.isLoading) {
    return <LoadingBlock label='Memuat transaksi...' />;
  }
  if (id && transaction.isError) {
    return (
      <ErrorState
        message='Transaksi tidak ditemukan atau gagal dimuat.'
        onRetry={() => void transaction.refetch()}
      />
    );
  }
  if (wallets.isLoading || categories.isLoading) {
    return <LoadingBlock label='Menyiapkan form...' />;
  }

  if ((wallets.data ?? []).length === 0) {
    return (
      <EmptyState
        icon={Save}
        title='Belum ada dompet'
        description='Tambahkan dompet terlebih dahulu sebelum mencatat transaksi.'
        actionLabel='Tambah dompet'
        onAction={() => {
          navigate({ to: "/dompet" });
        }}
      />
    );
  }

  return (
    <TransactionFormInner
      key={id ?? "new"}
      id={id}
      transaction={transaction.data}
      wallets={wallets.data ?? []}
      categories={categories.data ?? []}
    />
  );
}

function TransactionFormInner({
  id,
  transaction,
  wallets,
  categories,
}: {
  id?: string;
  transaction?: Transaction;
  wallets: { id: string; name: string }[];
  categories: { id: string; name: string; type: TransactionType; color: string }[];
}) {
  const navigate = useNavigate();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const initial = useMemo(
    () => buildInitial(transaction, wallets, categories),
    [transaction, wallets, categories],
  );
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    defaultValues: initial,
  });

  const type = useWatch({ control, name: "type" }) ?? initial.type;
  const amount = useWatch({ control, name: "amount" }) ?? "";
  const walletId = useWatch({ control, name: "walletId" }) ?? initial.walletId;
  const categoryId = useWatch({ control, name: "categoryId" }) ?? initial.categoryId;
  const note = useWatch({ control, name: "note" }) ?? "";
  const date = useWatch({ control, name: "date" }) ?? initial.date;
  const filteredCategories = categories.filter((category) => category.type === type);
  const currentMonthKey = date.slice(0, 7) || currentMonth();

  const handleTypeChange = (nextType: TransactionType) => {
    setValue("type", nextType, { shouldDirty: true });
    if (!filteredCategoriesFor(nextType, categories).some((item) => item.id === categoryId)) {
      setValue(
        "categoryId",
        filteredCategoriesFor(nextType, categories)[0]?.id ?? "",
        { shouldDirty: true },
      );
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const parsed = transactionSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof TransactionFormValues;
        setError(field, { message: issue.message });
      }
      return;
    }
    const payload = {
      walletId: parsed.data.walletId,
      categoryId: parsed.data.categoryId,
      amount: Number(parsed.data.amount),
      type: parsed.data.type,
      date: parsed.data.date,
      note: parsed.data.note?.trim() || undefined,
    };
    try {
      if (id) {
        await updateTransaction.mutateAsync({ id, input: payload });
        toast.success("Transaksi berhasil diperbarui.");
      } else {
        await createTransaction.mutateAsync(payload);
        toast.success("Transaksi berhasil dicatat.");
      }
      navigate({ to: "/transaksi" });
    } catch (error) {
      const apiError = getApiError(error);
      if (apiError.fields) {
        for (const field of apiError.fields) {
          setError(field.path as keyof TransactionFormValues, { message: field.message });
        }
      }
      toast.error(apiError.message);
    }
  });

  return (
    <form onSubmit={onSubmit} className='flex flex-col gap-5' noValidate>
      <div className='flex flex-col gap-1'>
        <h1 className='text-xl font-bold tracking-tight'>
          {id ? "Edit Transaksi" : "Catat Transaksi"}
        </h1>
        <p className='text-xs text-muted-foreground'>
          {id
            ? "Perbarui detail transaksi yang sudah tercatat."
            : "Isi detail transaksi supaya laporanmu tetap akurat."}
        </p>
      </div>

      <div className='grid grid-cols-2 gap-2 rounded-2xl bg-surface-container p-1'>
        <button
          type='button'
          onClick={() => handleTypeChange("expense")}
          className={cn(
            "flex h-11 items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all",
            type === "expense"
              ? "bg-expense-soft text-expense shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={type === "expense"}
        >
          <ArrowUpRight size={16} />
          Pengeluaran
        </button>
        <button
          type='button'
          onClick={() => handleTypeChange("income")}
          className={cn(
            "flex h-11 items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all",
            type === "income"
              ? "bg-income-soft text-income shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={type === "income"}
        >
          <ArrowDownLeft size={16} />
          Pemasukan
        </button>
      </div>

      <div className='flex flex-col gap-2 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'>
        <Label htmlFor='amount'>Nominal</Label>
        <div className='flex items-center gap-2'>
          <span className='text-lg font-bold text-muted-foreground'>Rp</span>
          <Input
            id='amount'
            inputMode='numeric'
            autoComplete='off'
            placeholder='0'
            value={amount ? formatNumber(Number(amount)) : ""}
            onChange={(event) => {
              const digits = parseDigits(event.target.value);
              setValue("amount", digits, { shouldDirty: true, shouldValidate: false });
            }}
            className='h-12 border-0 bg-transparent px-0 text-2xl font-bold tracking-tight shadow-none focus-visible:ring-0'
            aria-invalid={Boolean(errors.amount)}
          />
        </div>
        <FieldError errors={[errors.amount]} />
      </div>

      <div className='flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='wallet'>Dompet</Label>
          <Select
            value={walletId}
            onValueChange={(value) =>
              setValue("walletId", String(value), { shouldDirty: true })
            }
          >
            <SelectTrigger id='wallet' className='h-10 w-full rounded-xl'>
              <SelectValue placeholder='Pilih dompet'>
                {(value) =>
                  wallets.find((wallet) => wallet.id === value)?.name ?? "Pilih dompet"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.walletId]} />
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='category'>Kategori</Label>
          <Select
            value={categoryId}
            onValueChange={(value) =>
              setValue("categoryId", String(value), { shouldDirty: true })
            }
          >
            <SelectTrigger id='category' className='h-10 w-full rounded-xl'>
              <SelectValue placeholder='Pilih kategori'>
                {(value) =>
                  filteredCategories.find((category) => category.id === value)?.name ??
                  "Pilih kategori"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <span
                    className='size-2.5 rounded-full'
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.categoryId]} />
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='date'>Tanggal</Label>
          <Input
            id='date'
            type='date'
            className='h-10 rounded-xl'
            aria-invalid={Boolean(errors.date)}
            {...register("date")}
          />
          <FieldError errors={[errors.date]} />
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='note'>Catatan (opsional)</Label>
          <Textarea
            id='note'
            rows={3}
            maxLength={200}
            placeholder='Contoh: makan siang di kantor'
            aria-invalid={Boolean(errors.note)}
            {...register("note")}
          />
          <div className='flex items-center justify-between'>
            <FieldError errors={[errors.note]} />
            <span className='ml-auto text-[10px] text-muted-foreground tabular-nums'>
              {note.length}/200
            </span>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3'>
        <div className='flex items-center gap-2 text-[11px] text-muted-foreground'>
          <span className='font-semibold text-foreground'>
            {formatMonth(currentMonthKey)}
          </span>
          <span>periode laporan</span>
        </div>
        <span className='text-[10px] text-muted-foreground'>Otomatis</span>
      </div>

      <Button
        type='submit'
        className='h-11 rounded-xl'
        disabled={isSubmitting || createTransaction.isPending || updateTransaction.isPending}
      >
        {isSubmitting || createTransaction.isPending || updateTransaction.isPending ? (
          <>
            <Loader2 size={16} className='animate-spin' />
            Menyimpan...
          </>
        ) : (
          <>
            <Save size={16} />
            {id ? "Simpan perubahan" : "Simpan transaksi"}
          </>
        )}
      </Button>
    </form>
  );
}

function filteredCategoriesFor(
  type: TransactionType,
  categories: { id: string; type: TransactionType }[],
) {
  return categories.filter((category) => category.type === type);
}
