import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useProduct } from "@/lib/catalog";
import { fmt } from "@/lib/format";
import { DOLL_META } from "@/data/demo";
import { useCart } from "@/context/CartContext";
import { EmptyState, Spinner, StockBadge } from "@/components/ui";

export default function ProductPage() {
  const { id } = useParams();
  const product = useProduct(id);
  const { addProduct } = useCart();
  const navigate = useNavigate();

  if (product === undefined) return <Spinner />;
  if (product === null) return <EmptyState title="Товар не найден" action={<Link to="/" className="btn-primary">На главную</Link>} />;

  const specs: [string, string | null][] = [
    ["Рост", product.height], ["Цвет волос", product.hairColor], ["Цвет глаз", product.eyeColor],
    ["Коллекция", product.collection], ["Категория", product.category],
    ["Для куклы", product.kind === "clothing" && product.dollType ? DOLL_META[product.dollType].shortLabel : null],
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16">
      <button onClick={() => navigate(-1)} className="text-sm font-['Jost'] text-[#8B7B6E] hover:text-[#B8975A] flex items-center gap-1 mb-6">
        <ChevronLeft size={14} /> Назад
      </button>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start">
        <div className="rounded-3xl overflow-hidden bg-[#F5EEE6] aspect-[4/5]">
          {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
        </div>
        <div>
          <StockBadge inStock={product.inStock} className="mb-4" />
          <h1 className="font-['Gilda_Display'] text-3xl sm:text-4xl lg:text-5xl text-[#3A2E27] mb-4">{product.name}</h1>
          <p className="font-['Jost'] text-2xl text-[#B8975A] mb-8">{fmt(product.price)}</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 mb-8 font-['Jost'] text-sm">
            {specs.filter(([, v]) => v).map(([k, v]) => (
              <div key={k}><dt className="text-[#8B7B6E]">{k}</dt><dd className="text-[#3A2E27]">{v}</dd></div>
            ))}
          </dl>
          {product.description && (
            <p className="font-['Jost'] font-light text-[#3A2E27] leading-relaxed whitespace-pre-line mb-8">{product.description}</p>
          )}
          <button onClick={() => addProduct(product)} className="btn-primary w-full sm:w-auto sm:px-12 py-3.5">
            {product.inStock ? "В корзину" : "Заказать"}
          </button>
          {!product.inStock && (
            <p className="font-['Jost'] text-xs text-[#8B7B6E] mt-3">Изготовим на заказ: мастер сошьёт эту модель после оформления заказа и сообщит сроки.</p>
          )}
        </div>
      </div>
    </div>
  );
}
