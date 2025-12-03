"use client";

import React from "react";
import {
  useAdminProductsList,
  useAdminProductCreate,
  useAdminProductUpdate,
  useAdminProductDelete,
  useAdminProductDetail,
} from "@/lib/hooks/useAdminProducts";

export function AdminProducts() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);

  // Create modal state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isDonationItem, setIsDonationItem] = React.useState(false);

  // Edit modal state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editIsDonationItem, setEditIsDonationItem] = React.useState(false);

  const { products, pagination, isLoading, isError, refetch } = useAdminProductsList({
    page,
    limit,
    q: search || undefined,
  });

  const { createProduct, isPending: createLoading } = useAdminProductCreate();
  const { updateProduct, isPending: updateLoading } = useAdminProductUpdate();
  const { deleteProduct, isPending: deleteLoading } = useAdminProductDelete();

  async function handleCreateProduct() {
    if (!name.trim()) return;

    try {
      await createProduct({
        data: {
          name,
          description: description || undefined,
          is_donation_item: isDonationItem,
        },
      });

      // Reset form
      setName("");
      setDescription("");
      setIsDonationItem(false);
      setCreateOpen(false);

      // Refetch list
      refetch();
    } catch (err) {
      console.error("Create product failed", err);
    }
  }

  function handleOpenEdit(id: string) {
    setEditingId(id);
    setEditOpen(true);

    const current = products.find((p: any) => p.id === id);
    if (current) {
      setEditName(current.name ?? "");
      setEditDescription(current.description ?? "");
      setEditIsDonationItem(!!current.is_donation_item);
    }
  }

  async function handleUpdateProduct() {
    if (!editingId || !editName.trim()) return;

    try {
      await updateProduct({
        id: editingId,
        data: {
          name: editName,
          description: editDescription || undefined,
          is_donation_item: editIsDonationItem,
        },
      });

      setEditOpen(false);
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error("Update product failed", err);
    }
  }

  async function handleDeleteProduct(id: string, productName: string) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`)) {
      return;
    }

    try {
      await deleteProduct({ id });
      refetch();
    } catch (err) {
      console.error("Delete product failed", err);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Sản phẩm</h2>
          <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition">
            Thêm sản phẩm
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-sm text-gray-500">Đang tải danh sách sản phẩm...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Sản phẩm</h2>
          <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition">
            Thêm sản phẩm
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-sm text-red-600">Không thể tải danh sách sản phẩm.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Sản phẩm</h2>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
        >
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-xs text-gray-600">
              <tr>
                <th className="py-2 px-4 text-left">Tên sản phẩm</th>
                <th className="py-2 px-4 text-left">Quyên góp</th>
                <th className="py-2 px-4 text-left">Biến thể</th>
                <th className="py-2 px-4 text-left">Cập nhật</th>
                <th className="py-2 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} className="border-b last:border-none hover:bg-gray-50">
                  <td className="py-3 px-4">{p.name || "-"}</td>
                  <td className="py-3 px-4">
                    {p.is_donation_item ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Có</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Không</span>
                    )}
                  </td>
                  <td className="py-3 px-4">{p.variants?.length ?? 0}</td>
                  <td className="py-3 px-4 text-gray-500">
                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString("vi-VN") : "-"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(p.id)}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        disabled={deleteLoading}
                        className="px-3 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-gray-500">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit)} · Tổng {pagination.total} sản phẩm
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= Math.ceil(pagination.total / pagination.limit)}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Product Dialog */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Tạo sản phẩm mới</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="product-name" className="text-sm font-medium text-gray-700">
                  Tên sản phẩm
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="product-description" className="text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  id="product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="product-donation"
                  checked={isDonationItem}
                  onChange={(e) => setIsDonationItem(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="product-donation" className="text-sm text-gray-700">
                  Sản phẩm quyên góp
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setCreateOpen(false)}
                disabled={createLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateProduct}
                disabled={createLoading || !name.trim()}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading ? "Đang lưu..." : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Dialog */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa sản phẩm</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-product-name" className="text-sm font-medium text-gray-700">
                  Tên sản phẩm
                </label>
                <input
                  id="edit-product-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-product-description" className="text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  id="edit-product-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-product-donation"
                  checked={editIsDonationItem}
                  onChange={(e) => setEditIsDonationItem(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="edit-product-donation" className="text-sm text-gray-700">
                  Sản phẩm quyên góp
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setEditOpen(false)}
                disabled={updateLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateProduct}
                disabled={updateLoading || !editName.trim() || !editingId}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
