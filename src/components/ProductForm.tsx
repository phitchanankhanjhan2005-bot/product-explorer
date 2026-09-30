"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { defaultQuery, fetchProducts } from "@/lib/products";
import type {
  Product,
  ProductDraft,
  ProductList,
  SearchQuery,
} from "@/lib/products";
import ProductSearchForm from "./ProductSearchForm";

type LoadState = "loading" | "error" | "ready";

type ProductFormProps = {
  editing: Product | null;
  onSave: (draft: ProductDraft) => void;
  onCancel: () => void;
};

function ProductForm({
  editing,
  onSave,
  onCancel,
}: ProductFormProps) {
  const [draft, setDraft] = useState<ProductDraft>({
    title: "",
    price: 0,
    stock: 0,
    category: "beauty",
    description: "",
    brand: "",
    thumbnail: "",
    images: [],
  });

  useEffect(() => {
    if (editing) {
      setDraft({
        title: editing.title,
        price: editing.price,
        stock: editing.stock,
        category: editing.category,
        description: editing.description ?? "",
        brand: editing.brand ?? "",
        thumbnail: editing.thumbnail ?? "",
        images: editing.images ?? [],
      });
      return;
    }

    setDraft({
      title: "",
      price: 0,
      stock: 0,
      category: "beauty",
      description: "",
      brand: "",
      thumbnail: "",
      images: [],
    });
  }, [editing]);

  function updateField<K extends keyof ProductDraft>(
    field: K,
    value: ProductDraft[K]
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(draft);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        ชื่อสินค้า
        <input
          type="text"
          value={draft.title}
          onChange={(event) =>
            updateField("title", event.target.value)
          }
        />
      </label>

      <label>
        ราคา
        <input
          type="number"
          value={draft.price}
          onChange={(event) =>
            updateField("price", Number(event.target.value))
          }
        />
      </label>

      <label>
        จำนวนคงเหลือ
        <input
          type="number"
          value={draft.stock}
          onChange={(event) =>
            updateField("stock", Number(event.target.value))
          }
        />
      </label>

      <label>
        หมวดหมู่
        <select
          value={draft.category}
          onChange={(event) =>
            updateField("category", event.target.value as ProductDraft["category"])
          }
        >
          <option value="beauty">beauty</option>
          <option value="fragrances">fragrances</option>
          <option value="furniture">furniture</option>
          <option value="groceries">groceries</option>
          <option value="home-decoration">home-decoration</option>
          <option value="kitchen-accessories">kitchen-accessories</option>
          <option value="laptops">laptops</option>
          <option value="mens-shirts">mens-shirts</option>
          <option value="mens-shoes">mens-shoes</option>
          <option value="mens-watches">mens-watches</option>
          <option value="mobile-accessories">mobile-accessories</option>
          <option value="motorcycle">motorcycle</option>
          <option value="skin-care">skin-care</option>
          <option value="smartphones">smartphones</option>
          <option value="sports-accessories">sports-accessories</option>
          <option value="sunglasses">sunglasses</option>
          <option value="tablets">tablets</option>
          <option value="womens-bags">womens-bags</option>
          <option value="womens-dresses">womens-dresses</option>
          <option value="womens-jewellery">womens-jewellery</option>
          <option value="womens-shoes">womens-shoes</option>
          <option value="womens-watches">womens-watches</option>
        </select>
      </label>

      <label>
        แบรนด์
        <input
          type="text"
          value={draft.brand ?? ""}
          onChange={(event) =>
            updateField("brand", event.target.value)
          }
        />
      </label>

      <label>
        รายละเอียด
        <textarea
          value={draft.description ?? ""}
          onChange={(event) =>
            updateField("description", event.target.value)
          }
        />
      </label>

      <label>
        URL รูปภาพหลัก
        <input
          type="url"
          value={draft.thumbnail ?? ""}
          onChange={(event) =>
            updateField("thumbnail", event.target.value)
          }
        />
      </label>

      <div>
        <button type="submit">
          {editing ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
        </button>
        {editing && (
          <button type="button" onClick={onCancel}>
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
}

export default function ProductExplorer() {
  // เก็บรายการสินค้าและสถานะการโหลดข้อมูล
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // เก็บสินค้าที่ผู้ใช้เลือกเพื่อแก้ไข
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  // แสดงข้อมูลเมื่อโหลดสำเร็จ
  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");

    console.log(
      `พบข้อมูลสินค้า ${list.products.length} รายการ`
    );
    console.log("ข้อมูลสินค้า", list.products);
  }

  // จัดการกรณีโหลดข้อมูลไม่สำเร็จ
  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "เรียกข้อมูลไม่สำเร็จ"
    );

    setStatus("error");
    console.error("เรียกข้อมูลไม่สำเร็จ", error);
  }

  // โหลดข้อมูลอัตโนมัติเมื่อเปิดหน้าเว็บ
  useEffect(() => {
    fetchProducts(defaultQuery)
      .then(showResult)
      .catch(showError);
  }, []);

  // ค้นหาและกรองสินค้าตามเงื่อนไข
  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");

    try {
      const result = await fetchProducts(query);

      const filteredProducts = result.products.filter((item) => {
        // กรองตามหมวดหมู่
        if (
          query.category &&
          item.category !== query.category
        ) {
          return false;
        }

        // กรองตามราคาต่ำสุด
        if (
          query.minPrice !== undefined &&
          item.price < query.minPrice
        ) {
          return false;
        }

        // กรองตามราคาสูงสุด
        if (
          query.maxPrice !== undefined &&
          item.price > query.maxPrice
        ) {
          return false;
        }

        // กรองตามจำนวนคงเหลือขั้นต่ำ
        if (
          query.minStock !== undefined &&
          item.stock < query.minStock
        ) {
          return false;
        }

        return true;
      });

      showResult({
        ...result,
        products: filteredProducts,
      });
    } catch (error) {
      showError(error);
    }
  }

  // เพิ่มสินค้าใหม่ หรือแก้ไขสินค้าที่เลือก
  function saveProduct(draft: ProductDraft) {
    // ถ้ามีสินค้าที่กำลังแก้ไข ให้เปลี่ยนเฉพาะรายการนั้น
    if (editingProduct) {
      setProducts(
        products.map((product) =>
          product.id === editingProduct.id
            ? {
                ...draft,
                id: editingProduct.id,
              }
            : product
        )
      );

      // หลังแก้ไขเสร็จ ให้กลับไปโหมดเพิ่มสินค้า
      setEditingProduct(null);

      return;
    }

    // ถ้าไม่ได้แก้ไข ให้เพิ่มสินค้าใหม่เข้าไปใน Array
    setProducts([
      ...products,
      {
        ...draft,
        id: Date.now(),
      },
    ]);
  }

  // ลบสินค้าตาม id
  function removeProduct(id: number) {
    setProducts(
      products.filter((product) => product.id !== id)
    );

    // ถ้าลบสินค้าที่กำลังแก้ไข ให้กลับไปโหมดเพิ่ม
    if (editingProduct?.id === id) {
      setEditingProduct(null);
    }
  }

  return (
    <main>
      <h1>รายการสินค้า</h1>

      <ProductSearchForm onSearch={loadProducts} />

      {/* ฟอร์มเดียวกันใช้ได้ทั้งเพิ่มและแก้ไข */}
      <ProductForm
        editing={editingProduct}
        onSave={saveProduct}
        onCancel={() => setEditingProduct(null)}
      />

      <section aria-live="polite">
        {status === "loading" && (
          <p>กำลังโหลดข้อมูล...</p>
        )}

        {status === "error" && (
          <p role="alert">{errorMessage}</p>
        )}

        {status === "ready" &&
          products.length === 0 && (
            <p>
              ไม่พบสินค้าที่ตรงกับเงื่อนไข
            </p>
          )}

        {status === "ready" &&
          products.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>ชื่อสินค้า</th>
                  <th>ราคา</th>
                  <th>คงเหลือ</th>
                  <th>หมวดหมู่</th>
                  <th>รูปภาพ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {products.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.price}</td>
                    <td>{item.stock}</td>
                    <td>{item.category}</td>

                    <td>
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          width={60}
                          height={60}
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      ) : item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          width={60}
                          height={60}
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      {/* ส่งสินค้าที่เลือกไปเป็นข้อมูลสำหรับแก้ไข */}
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct(item)
                        }
                      >
                        แก้ไข
                      </button>

                      {/* ลบสินค้าที่เลือก */}
                      <button
                        type="button"
                        onClick={() =>
                          removeProduct(item.id)
                        }
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </section>
    </main>
  );
}