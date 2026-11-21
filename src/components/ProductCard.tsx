import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { fmt } from "@/lib/format";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  const { addProduct } = useCart();
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(58,46,39,0.12)]"
      style={{ boxShadow: "0 2px 16px rgba(58,46,39,0.07)" }}>
      <div className="relative overflow-hidden aspect-[4/5] bg-[#F5EEE6]">
        <Link to={`/product/${product.id}`} aria-label={product.name}>
          {product.image && (
            <img src={product.image} alt={product.name} loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          )}
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.isNew && product.inStock && (
          <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase font-['Jost'] font-medium px-2.5 py-1 rounded-full"
            style={{ background: "#B8975A", color: "#fff" }}>Новинка</span>
        )}
        {!product.inStock && (
          <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase font-['Jost'] font-medium px-2.5 py-1 rounded-full bg-[#E8DDD0] text-[#8B7B6E]">
            На заказ
          </span>
        )}
        <button onClick={() => setLiked(l => !l)} aria-label="В избранное"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-200 hover:scale-110">
          <Heart size={14} fill={liked ? "#B8975A" : "none"} stroke={liked ? "#B8975A" : "#8B7B6E"} />
        </button>
        {/* На телефоне кнопка видна всегда, на десктопе — при наведении */}
        <div className="hidden lg:block absolute bottom-3 inset-x-3 transition-all duration-300 lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0">
          <button onClick={() => addProduct(product)}
            className="w-full py-2.5 rounded-xl text-sm font-['Jost'] font-medium tracking-wide transition-all duration-200 hover:opacity-90"
            style={{ background: "#B8975A", color: "#fff" }}>
            {product.inStock ? "В корзину" : "Заказать"}
          </button>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <Link to={`/product/${product.id}`}><h3 className="font-['Gilda_Display'] text-[#3A2E27] text-base leading-snug mb-1 hover:text-[#B8975A] transition-colors">{product.name}</h3></Link>
        {product.height && <p className="text-xs font-['Jost'] text-[#8B7B6E] mb-1">{product.height} · {product.hairColor}</p>}
        {product.category && <p className="text-xs font-['Jost'] text-[#8B7B6E] mb-1">{product.category}</p>}
        <div className="flex items-center justify-between gap-2 mt-2">
          <p className="font-['Jost'] font-medium text-[#B8975A] text-sm">{fmt(product.price)}</p>
          <button onClick={() => addProduct(product)} aria-label="В корзину"
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: "#B8975A" }}>
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
