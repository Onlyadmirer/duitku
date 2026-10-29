import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { authApi, budgetApi, categoryApi, reportApi, transactionApi, walletApi } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import type {
  BudgetInput,
  CategoryInput,
  LoginInput,
  RegisterInput,
  TransactionFilters,
  TransactionInput,
  TransactionType,
  WalletInput,
} from "@/types/api";

export const useMe = () =>
  useQuery({
    queryKey: qk.me,
    queryFn: authApi.me,
    staleTime: 60_000,
  });

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: () => {
      // Jangan percaya bentuk respons login; guard akan memverifikasi lewat /me.
      queryClient.removeQueries();
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: () => {
      queryClient.removeQueries();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useWallets = () =>
  useQuery({ queryKey: qk.wallets, queryFn: walletApi.list });

export const useCreateWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WalletInput) => walletApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.wallets });
      queryClient.invalidateQueries({ queryKey: ["report", "wallet-balances"] });
    },
  });
};

export const useUpdateWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<WalletInput> }) =>
      walletApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.wallets });
      queryClient.invalidateQueries({ queryKey: ["report", "wallet-balances"] });
    },
  });
};

export const useDeleteWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => walletApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.wallets });
      queryClient.invalidateQueries({ queryKey: ["report", "wallet-balances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useCategories = (type?: TransactionType) =>
  useQuery({
    queryKey: qk.categories(type),
    queryFn: () => categoryApi.list(type),
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => categoryApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<Pick<CategoryInput, "name" | "color">>;
    }) => categoryApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useTransactions = (filters: TransactionFilters = {}) =>
  useQuery({
    queryKey: qk.transactions(filters),
    queryFn: () => transactionApi.list(filters),
  });

export const useInfiniteTransactions = (filters: TransactionFilters = {}) =>
  useInfiniteQuery({
    queryKey: qk.transactions(filters),
    queryFn: ({ pageParam }) => transactionApi.list({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

export const useTransaction = (id: string) =>
  useQuery({
    queryKey: qk.transaction(id),
    queryFn: () => transactionApi.get(id),
    enabled: Boolean(id),
  });

const invalidateFinance = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: ["transaction"] });
  queryClient.invalidateQueries({ queryKey: ["report"] });
  queryClient.invalidateQueries({ queryKey: ["budgets"] });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInput) => transactionApi.create(input),
    onSuccess: () => invalidateFinance(queryClient),
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TransactionInput> }) =>
      transactionApi.update(id, input),
    onSuccess: () => invalidateFinance(queryClient),
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionApi.remove(id),
    onSuccess: () => invalidateFinance(queryClient),
  });
};

export const useBudgets = (month: string) =>
  useQuery({ queryKey: qk.budgets(month), queryFn: () => budgetApi.list(month) });

export const useUpsertBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BudgetInput) => budgetApi.upsert(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
};

export const useReportSummary = (month: string) =>
  useQuery({
    queryKey: qk.reportSummary(month),
    queryFn: () => reportApi.summary(month),
  });

export const useCategoryReport = (month: string) =>
  useQuery({
    queryKey: qk.reportByCategory(month),
    queryFn: () => reportApi.byCategory(month),
  });

export const useMonthlyTrend = (year: number) =>
  useQuery({
    queryKey: qk.reportTrend(year),
    queryFn: () => reportApi.monthlyTrend(year),
  });

export const useWalletBalances = () =>
  useQuery({
    queryKey: qk.reportWalletBalances,
    queryFn: reportApi.walletBalances,
  });
