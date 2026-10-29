import { useState } from "react";
import { CreditCard, Loader2, Pencil, Plus, Trash2, WalletCards } from "lucide-react";
import { toast } from "sonner";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  WalletIcon,
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
  useCreateWallet,
  useDeleteWallet,
  useUpdateWallet,
  useWalletBalances,
  useWallets,
} from "@/hooks/use-finance";
import { formatNumber, formatRupiah, parseDigits } from "@/lib/format";
import type { Wallet } from "@/types/api";

function WalletsPage() {
  const wallets = useWallets();
  const balances = useWalletBalances();
  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet();
  const deleteWallet = useDeleteWallet();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [deleting, setDeleting] = useState<Wallet | null>(null);

  const balanceByWallet = new Map(
    (balances.data?.items ?? []).map((item) => [item.walletId, item.balance]),
  );

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteWallet.mutateAsync(deleting.id);
      toast.success("Dompet berhasil dihapus.");
      setDeleting(null);
    } catch {
      toast.error("Gagal menghapus dompet.");
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex flex-col'>
          <h1 className='text-xl font-bold tracking-tight'>Dompet</h1>
          <p className='text-xs text-muted-foreground'>Kelola sumber dana kamu</p>
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

      <div className='flex items-center justify-between rounded-2xl bg-gradient-to-br from-primary to-primary-container p-4 text-primary-foreground shadow-[0_10px_24px_-8px_rgba(79,70,229,0.4)]'>
        <div className='flex flex-col'>
          <span className='text-[10px] font-bold tracking-widest uppercase opacity-80'>
            Total Saldo
          </span>
          <span className='mt-1 text-2xl font-bold tracking-tight tabular-nums'>
            {formatRupiah(balances.data?.total ?? 0)}
          </span>
        </div>
        <span className='flex size-11 items-center justify-center rounded-full bg-primary-foreground/15'>
          <WalletCards size={21} />
        </span>
      </div>

      {wallets.isError ? (
        <ErrorState message='Gagal memuat dompet.' onRetry={() => void wallets.refetch()} />
      ) : wallets.isLoading ? (
        <ListSkeleton rows={3} />
      ) : (wallets.data ?? []).length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title='Belum ada dompet'
          description='Tambahkan dompet seperti tunai, rekening bank, atau e-wallet.'
          actionLabel='Tambah dompet'
          onAction={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        />
      ) : (
        <div className='flex flex-col gap-2.5'>
          {(wallets.data ?? []).map((wallet) => (
            <div
              key={wallet.id}
              className='flex items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'
            >
              <div className='flex min-w-0 items-center gap-3'>
                <WalletIcon name={wallet.name} />
                <div className='flex min-w-0 flex-col'>
                  <span className='truncate text-sm font-semibold'>{wallet.name}</span>
                  <span className='text-[10px] text-muted-foreground tabular-nums'>
                    Saldo awal {formatRupiah(wallet.initialBalance)}
                  </span>
                </div>
              </div>
              <div className='flex shrink-0 items-center gap-1'>
                <div className='flex flex-col items-end pr-1'>
                  <span className='text-sm font-bold tabular-nums'>
                    {formatRupiah(balanceByWallet.get(wallet.id) ?? wallet.initialBalance)}
                  </span>
                  <span className='text-[10px] text-muted-foreground'>saldo kini</span>
                </div>
                <button
                  type='button'
                  onClick={() => {
                    setEditing(wallet);
                    setFormOpen(true);
                  }}
                  className='flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground'
                  aria-label={`Edit dompet ${wallet.name}`}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type='button'
                  onClick={() => setDeleting(wallet)}
                  className='flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                  aria-label={`Hapus dompet ${wallet.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <WalletDialog
          wallet={editing}
          submitting={createWallet.isPending || updateWallet.isPending}
          onClose={() => setFormOpen(false)}
          onSubmit={async (name, initialBalance) => {
            try {
              if (editing) {
                await updateWallet.mutateAsync({ id: editing.id, input: { name, initialBalance } });
                toast.success("Dompet berhasil diperbarui.");
              } else {
                await createWallet.mutateAsync({ name, initialBalance });
                toast.success("Dompet berhasil ditambahkan.");
              }
              setFormOpen(false);
            } catch {
              toast.error("Gagal menyimpan dompet.");
            }
          }}
        />
      )}

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus dompet ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Dompet {deleting?.name} akan dihapus beserta transaksi yang terkait. Tindakan
              ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={handleDelete}
              disabled={deleteWallet.isPending}
            >
              {deleteWallet.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function WalletDialog({
  wallet,
  onClose,
  onSubmit,
  submitting,
}: {
  wallet: Wallet | null;
  onClose: () => void;
  onSubmit: (name: string, initialBalance: number) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState(wallet?.name ?? "");
  const [balance, setBalance] = useState(
    wallet?.initialBalance ? String(wallet.initialBalance) : "",
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Nama dompet minimal 2 karakter.");
      return;
    }
    setError(null);
    onSubmit(name.trim(), Number(balance || 0));
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle>{wallet ? "Edit Dompet" : "Tambah Dompet"}</DialogTitle>
          <DialogDescription>
            {wallet
              ? "Perbarui nama atau saldo awal dompet."
              : "Buat dompet baru untuk memisahkan sumber dana."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='wallet-name'>Nama dompet</Label>
            <Input
              id='wallet-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Contoh: BCA, Tunai, GoPay'
              className='h-10 rounded-xl'
              aria-invalid={Boolean(error)}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='wallet-balance'>Saldo awal</Label>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-bold text-muted-foreground'>Rp</span>
              <Input
                id='wallet-balance'
                inputMode='numeric'
                value={balance ? formatNumber(Number(balance)) : ""}
                onChange={(event) => setBalance(parseDigits(event.target.value))}
                placeholder='0'
                className='h-10 rounded-xl'
              />
            </div>
            <p className='text-[10px] text-muted-foreground'>
              Saldo awal tidak menghitung transaksi yang sudah ada.
            </p>
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

export default WalletsPage;
