"use client";

import { useForm } from "react-hook-form";
import {
  CATEGORIES,
  SORT_FIELDS,
  SearchQuerySchema,
  defaultQuery,
} from "@/lib/products";
import type { SearchQuery } from "@/lib/products";
import { zodResolver } from "@hookform/resolvers/zod";

type ProductSearchFormProps = {
  onSearch: (query: SearchQuery) => Promise<void>;
};

export default function ProductSearchForm({
  onSearch,
}: ProductSearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SearchQuery>({
    resolver: zodResolver(SearchQuerySchema),
    mode: "onTouched",
    defaultValues: defaultQuery,
  });

  return (
    <form onSubmit={handleSubmit(onSearch)}>
      <h2>ค้นหาสินค้า</h2>

      {/* ชื่อสินค้า */}
      <label htmlFor="q">ค้นหาชื่อสินค้า</label>
      <input
        id="q"
        {...register("q")}
        placeholder="เช่น phone"
      />

      {/* หมวดหมู่ */}
      <label htmlFor="category">หมวดหมู่</label>
      <select id="category" {...register("category")}>
        <option value="">ทุกหมวดหมู่</option>

        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {/* ราคาต่ำสุด */}
      <label htmlFor="minPrice">ราคาต่ำสุด</label>
      <input
        id="minPrice"
        type="number"
        min="0"
        {...register("minPrice", {
          setValueAs: (value) =>
            value === "" ? undefined : Number(value),
        })}
      />

      {/* ราคาสูงสุด */}
      <label htmlFor="maxPrice">ราคาสูงสุด</label>
      <input
        id="maxPrice"
        type="number"
        min="0"
        {...register("maxPrice", {
          setValueAs: (value) =>
            value === "" ? undefined : Number(value),
        })}
      />

      {/* จำนวนคงเหลือขั้นต่ำ */}
      <label htmlFor="minStock">
        จำนวนคงเหลือขั้นต่ำ
      </label>
      <input
        id="minStock"
        type="number"
        min="0"
        {...register("minStock", {
          setValueAs: (value) =>
            value === "" ? undefined : Number(value),
        })}
      />

      {/* จำนวนรายการ */}
      <label htmlFor="limit">จำนวนรายการ</label>
      <input
        id="limit"
        type="number"
        {...register("limit", {
          valueAsNumber: true,
        })}
        aria-invalid={!!errors.limit}
      />

      {errors.limit && (
        <span role="alert">
          {errors.limit.message}
        </span>
      )}

      {/* เรียงตาม */}
      <label htmlFor="sortBy">เรียงตาม</label>
      <select id="sortBy" {...register("sortBy")}>
        {SORT_FIELDS.map((field) => (
          <option key={field} value={field}>
            {field}
          </option>
        ))}
      </select>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "กำลังค้นหา..." : "ค้นหา"}
      </button>
    </form>
  );
}