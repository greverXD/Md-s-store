import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui";
export default function NotFoundPage() {
  return <EmptyState title="Страница не найдена" action={<Link to="/" className="btn-primary">На главную</Link>} />;
}
