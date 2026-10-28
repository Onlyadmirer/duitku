const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** 1500000 -> "Rp 1.500.000" */
export const formatRupiah = (value: number) => rupiahFormatter.format(value);

/** 8.500.000 -> "+Rp 8.500.000" | -540.000 -> "-Rp 540.000" */
export const formatSignedRupiah = (value: number) =>
  `${value >= 0 ? "+" : "-"}${formatRupiah(Math.abs(value))}`;
