import { useParams } from "@tanstack/react-router";
import { TransactionForm } from "./TransactionForm";

function EditTransactionPage() {
  const params = useParams({ strict: false }) as { id?: string };
  return <TransactionForm id={params.id} />;
}

export default EditTransactionPage;
