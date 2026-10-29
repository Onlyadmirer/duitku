const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateLongFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dayFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export const MONTHS_LONG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** 1500000 -> "Rp 1.500.000" */
export const formatRupiah = (value: number) => rupiahFormatter.format(value);

/** 1500000 -> "1.500.000" */
export const formatNumber = (value: number) => numberFormatter.format(value);

/** 8.500.000 -> "+Rp 8.500.000" | -540.000 -> "-Rp 540.000" */
export const formatSignedRupiah = (value: number) =>
  `${value >= 0 ? "+" : "-"}${formatRupiah(Math.abs(value))}`;

/** 12500000 -> "Rp 12,5 jt" untuk label chart yang sempit */
export const formatCompactRupiah = (value: number) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000)
    return `${sign}Rp ${compactNumberFormatter.format(abs / 1_000_000_000)} M`;
  if (abs >= 1_000_000)
    return `${sign}Rp ${compactNumberFormatter.format(abs / 1_000_000)} jt`;
  if (abs >= 1_000) return `${sign}Rp ${formatNumber(abs / 1_000)} rb`;
  return `${sign}${formatRupiah(abs)}`;
};

/** "2026-10-21" -> "21 Okt 2026" */
export const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
};

/** "2026-10-21" -> "Rabu, 21 Oktober 2026" */
export const formatDateLong = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return dateLongFormatter.format(date);
};

/** "2026-10-21" -> "Rabu, 21 Oktober" */
export const formatDayLabel = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return dayFormatter.format(date);
};

export const todayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
};

export const currentMonth = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/** "2026-10" -> "Okt 2026" */
export const formatMonth = (month: string) => {
  const [year, monthNumber] = month.split("-");
  return `${MONTHS_SHORT[Number(monthNumber) - 1] ?? month} ${year}`;
};

/** "2026-10" -> "Oktober 2026" */
export const formatMonthLong = (month: string) => {
  const [year, monthNumber] = month.split("-");
  return `${MONTHS_LONG[Number(monthNumber) - 1] ?? month} ${year}`;
};

/** "2026-10" -> "Okt" */
export const formatMonthShort = (month: string) =>
  MONTHS_SHORT[Number(month.slice(5, 7)) - 1] ?? month;

export const monthYear = (month: string) => Number(month.slice(0, 4));

export const shiftMonth = (month: string, delta: number) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + delta, 1);
  return currentMonth(date);
};

export const initials = (name?: string) => {
  if (!name) return "DU";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export const parseDigits = (value: string) => value.replace(/\D/g, "");

export const percentage = (value: number, total: number) => {
  if (total <= 0) return 0;
  return Math.round((value / total) * 1000) / 10;
};

export const firstName = (name?: string) => name?.trim().split(/\s+/)[0] ?? "Kamu";
