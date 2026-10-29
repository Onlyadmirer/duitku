import { useState } from "react";
import { Loader2, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  CategoryIcon,
  EmptyState,
  ErrorState,
  ListSkeleton,
} from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-finance";
import { getApiError } from "@/lib/api";
import { CATEGORY_COLORS } from "@/lib/maps";
import { cn } from "@/lib/utils";
import type { Category, TransactionType } from "@/types/api";

function CategoriesPage() {
  const [type, setType] = useState<TransactionType>("expense");
  const categories = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const filtered = (categories.data ?? []).filter((category) => category.type === type);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteCategory.mutateAsync(deleting.id);
      toast.success("Kategori berhasil dihapus.");
      setDeleting(null);
    } catch (error) {
      toast.error(getApiError(error).message);
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex flex-col'>
          <h1 className='text-xl font-bold tracking-tight'>Kategori</h1>
          <p className='text-xs text-muted-foreground'>Kelompokkan transaksi kamu</p>
        </div>
        <Button
          type='button'
          className='h-9 rounded-full'
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={15} />
          Tambah
        </Button>
      </div>

      <Tabs value={type} onValueChange={(value) => setType(value as TransactionType)}>
        <TabsList className='w-full'>
          <TabsTrigger value='expense' className='flex-1'>
            Pengeluaran
          </TabsTrigger>
          <TabsTrigger value='income' className='flex-1'>
            Pemasukan
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {categories.isError ? (
        <ErrorState message='Gagal memuat kategori.' onRetry={() => void categories.refetch()} />
      ) : categories.isLoading ? (
        <ListSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Tags}
          title={`Belum ada kategori ${type === "income" ? "pemasukan" : "pengeluaran"}`}
          description='Buat kategori baru agar laporanmu lebih rapi.'
          actionLabel='Tambah kategori'
          onAction={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        />
      ) : (
        <div className='overflow-hidden rounded-2xl bg-surface-container-lowest ring-1 ring-border/50'>
          <div className='divide-y divide-border/40'>
            {filtered.map((category) => (
              <div
                key={category.id}
                className='flex items-center justify-between gap-3 px-4 py-3.5'
              >
                <div className='flex min-w-0 items-center gap-2.5'>
                  <CategoryIcon name={category.name} color={category.color} />
                  <div className='flex min-w-0 flex-col'>
                    <span className='truncate text-sm font-semibold'>{category.name}</span>
                    <span className='text-[10px] text-muted-foreground'>
                      {category.type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </div>
                </div>
                <div className='flex shrink-0 items-center gap-1'>
                  <button
                    type='button'
                    onClick={() => {
                      setEditing(category);
                      setFormOpen(true);
                    }}
                    className='flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground'
                    aria-label={`Edit kategori ${category.name}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type='button'
                    onClick={() => setDeleting(category)}
                    className='flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                    aria-label={`Hapus kategori ${category.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {formOpen && (
        <CategoryDialog
          category={editing}
          defaultType={type}
          submitting={createCategory.isPending || updateCategory.isPending}
          onClose={() => setFormOpen(false)}
          onSubmit={async (input) => {
            try {
              if (editing) {
                await updateCategory.mutateAsync({
                  id: editing.id,
                  input: { name: input.name, color: input.color },
                });
                toast.success("Kategori berhasil diperbarui.");
              } else {
                await createCategory.mutateAsync(input);
                toast.success("Kategori berhasil ditambahkan.");
              }
              setFormOpen(false);
            } catch (error) {
              toast.error(getApiError(error).message);
            }
          }}
        />
      )}

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kategori ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori {deleting?.name} hanya bisa dihapus jika tidak dipakai transaksi.
              Pertimbangkan mengganti nama kategori jika masih dibutuhkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CategoryDialog({
  category,
  defaultType,
  onClose,
  onSubmit,
  submitting,
}: {
  category: Category | null;
  defaultType: TransactionType;
  onClose: () => void;
  onSubmit: (input: { name: string; type: TransactionType; color: string }) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<TransactionType>(category?.type ?? defaultType);
  const [color, setColor] = useState(category?.color ?? CATEGORY_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Nama kategori minimal 2 karakter.");
      return;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      setError("Warna harus format hex #RRGGBB.");
      return;
    }
    setError(null);
    onSubmit({ name: name.trim(), type, color });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          <DialogDescription>
            {category
              ? "Perbarui nama atau warna kategori."
              : "Buat kategori baru untuk merapikan transaksi."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='category-name'>Nama kategori</Label>
            <Input
              id='category-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Contoh: Makan & Minum'
              className='h-10 rounded-xl'
              aria-invalid={Boolean(error)}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Tipe</Label>
            <div className='grid grid-cols-2 gap-2'>
              {(["expense", "income"] as TransactionType[]).map((option) => (
                <button
                  key={option}
                  type='button'
                  disabled={Boolean(category)}
                  onClick={() => setType(option)}
                  className={cn(
                    "h-9 rounded-xl text-xs font-semibold transition-colors disabled:opacity-60",
                    type === option
                      ? option === "income"
                        ? "bg-income-soft text-income"
                        : "bg-expense-soft text-expense"
                      : "bg-surface-container text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={type === option}
                >
                  {option === "income" ? "Pemasukan" : "Pengeluaran"}
                </button>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='category-color'>Warna</Label>
            <div className='flex flex-wrap gap-2'>
              {CATEGORY_COLORS.map((option) => (
                <button
                  key={option}
                  type='button'
                  onClick={() => setColor(option)}
                  className={cn(
                    "size-8 rounded-full ring-2 transition-transform hover:scale-110",
                    color === option ? "ring-foreground" : "ring-transparent",
                  )}
                  style={{ backgroundColor: option }}
                  aria-label={`Pilih warna ${option}`}
                  aria-pressed={color === option}
                />
              ))}
            </div>
            <div className='flex items-center gap-2'>
              <input
                id='category-color'
                type='color'
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className='size-9 cursor-pointer rounded-lg border border-input bg-transparent p-1'
                aria-label='Warna kategori'
              />
              <span className='text-xs font-medium text-muted-foreground tabular-nums'>
                {color.toUpperCase()}
              </span>
            </div>
          </div>

          {error && (
            <p className='rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive'>
              {error}
            </p>
          )}

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

export default CategoriesPage;
