'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useStorefrontCatalog } from '@/src/lib/hooks/useStorefrontCatalog';
import { Trash2, Plus } from 'lucide-react';

export interface CartItem {
  type: 'PRODUCT' | 'COMBO';
  variant_id?: string;
  combo_id?: string;
  quantity: number;
  price_version: number;
  clientPriceVnd?: number;
  productName?: string;
  productImage?: string;
}

interface QuickOrderCartProps {
  items: CartItem[];
  onItemsChange: (items: CartItem[]) => void;
}

/**
 * Component to display and manage items in quick order
 * Shows cart items and allows quantity adjustment and removal
 */
export function QuickOrderCart({ items, onItemsChange }: QuickOrderCartProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    variant_id: '',
    quantity: 1,
    price_version: '',
    productName: '',
    clientPriceVnd: '',
  });
  const [productSearch, setProductSearch] = useState('');

  const { products, combos, isLoading: catalogLoading, error: catalogError } = useStorefrontCatalog();

  const catalogEntries = useMemo(() => {
    const productEntries =
      products.flatMap((product) =>
        product.variants.map((variant) => ({
          key: `variant-${variant.id}`,
          label: variant.label,
          type: 'PRODUCT' as const,
          productName: product.name,
          variantId: variant.id,
          priceVersion: variant.priceVersion,
          price: variant.priceVnd,
        })),
      ) ?? [];

    const comboEntries =
      combos.map((combo) => ({
        key: `combo-${combo.id}`,
        label: `${combo.name} (Combo)`,
        type: 'COMBO' as const,
        productName: combo.name,
        comboId: combo.id,
        priceVersion: combo.priceVersion,
        price: combo.priceVnd,
      })) ?? [];

    return [...productEntries, ...comboEntries];
  }, [products, combos]);

  const filteredEntries = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase();
    if (!keyword) {
      return catalogEntries;
    }
    return catalogEntries.filter((entry) => entry.label.toLowerCase().includes(keyword));
  }, [catalogEntries, productSearch]);

  const formatCurrency = (value?: number) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '—';
    }

    return `${value.toLocaleString('vi-VN')} đ`;
  };

  const handleSelectEntry = (entry: (typeof catalogEntries)[number]) => {
    const cartItem: CartItem = {
      type: entry.type,
      variant_id: entry.variantId,
      combo_id: entry.comboId,
      quantity: 1,
      price_version: entry.priceVersion,
      productName: entry.productName,
      clientPriceVnd: entry.price,
    };

    onItemsChange([...items, cartItem]);
    setIsAddingItem(false);
    setProductSearch('');
  };

  const handleAddItem = () => {
    if (!newItem.variant_id) {
      alert('Vui lòng nhập ID biến thể sản phẩm');
      return;
    }

    // XỬ LÝ PRICE VERSION - CHUYỂN VỀ DẠNG NUMBER
    let finalPriceVersion: number;
    
    if (newItem.price_version.trim() === '') {
        // Mặc định là Timestamp (dạng number)
        finalPriceVersion = Date.now(); 
    } else {
        // Chuyển chuỗi input thành số
        finalPriceVersion = Number(newItem.price_version); 
        // Kiểm tra NaN (Not a Number)
        if (isNaN(finalPriceVersion)) {
             alert('Price Version không hợp lệ. Vui lòng nhập số.');
             return;
        }
    }

    const clientPrice =
      newItem.clientPriceVnd.trim().length > 0 ? Number(newItem.clientPriceVnd) : undefined;
    if (newItem.clientPriceVnd.trim().length > 0 && Number.isNaN(clientPrice)) {
      alert('Giá hiển thị không hợp lệ. Vui lòng nhập số.');
      return;
    }

    const cartItem: CartItem = {
      type: 'PRODUCT',
      variant_id: newItem.variant_id,
      quantity: newItem.quantity,
      price_version: finalPriceVersion,
      productName: newItem.productName || 'Sản phẩm',
      clientPriceVnd: clientPrice,
    };

    onItemsChange([...items, cartItem]);
    setNewItem({
      variant_id: '',
      quantity: 1,
      price_version: '',
      productName: '',
      clientPriceVnd: '',
    });
    setIsAddingItem(false);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, quantity);
    onItemsChange(updated);
  };

  const handleRemoveItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Giỏ Hàng</CardTitle>
            <CardDescription>{items.length} sản phẩm</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAddingItem(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Thêm Sản Phẩm
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Giỏ hàng trống. Thêm sản phẩm để bắt đầu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Sản Phẩm</TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead className="text-right">Số Lượng</TableHead>
                  <TableHead className="text-right">Price Version</TableHead>
                  <TableHead className="text-right">Giá hiển thị</TableHead>
                  <TableHead className="w-[100px]">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="uppercase text-xs font-semibold text-gray-500">
                      {item.type === 'COMBO' ? 'Combo' : 'Sản phẩm'}
                    </TableCell>
                    <TableCell>{item.productName || 'Sản phẩm'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {(() => {
                        const identifier = item.variant_id ?? item.combo_id ?? '—';
                        if (identifier.length <= 10) return identifier;
                        return `${identifier.substring(0, 10)}...`;
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          −
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                       {/* Hiển thị number dưới dạng chuỗi */}
                      {item.price_version.toString()} 
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.clientPriceVnd ? formatCurrency(item.clientPriceVnd) : '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Sản Phẩm</DialogTitle>
            <DialogDescription>
              Nhập thông tin sản phẩm để thêm vào giỏ hàng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium mb-1 block">Tìm & chọn sản phẩm</label>
              <Input
                placeholder="Nhập từ khoá"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              <div className="max-h-72 overflow-y-auto border rounded-lg divide-y">
                {catalogLoading ? (
                  <div className="py-6 text-center text-sm text-gray-500">Đang tải danh sách sản phẩm...</div>
                ) : catalogError ? (
                  <div className="py-6 text-center text-sm text-red-500">Không tải được danh sách sản phẩm.</div>
                ) : filteredEntries.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-500">Không tìm thấy sản phẩm phù hợp.</div>
                ) : (
                  filteredEntries.map((entry) => (
                    <div key={entry.key}>
                      <button
                        type="button"
                        onClick={() => handleSelectEntry(entry)}
                        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition text-left"
                      >
                        <div>
                          <div className="font-semibold text-sm text-gray-900">{entry.label}</div>
                          <div className="text-xs text-gray-500 font-mono">
                            {entry.type === 'COMBO' ? entry.comboId : entry.variantId}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {entry.type === 'COMBO' ? 'Combo' : 'Sản phẩm'}
                          </Badge>
                          <div className="text-sm font-semibold text-cyan-700">
                            {formatCurrency(entry.price)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Nhấn để thêm</div>
                        </div>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="text-xs uppercase tracking-wide text-gray-400 font-medium pt-2 border-t">
              Hoặc nhập thủ công
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tên Sản Phẩm</label>
              <Input
                placeholder="Nhập tên sản phẩm"
                value={newItem.productName}
                onChange={(e) =>
                  setNewItem({ ...newItem, productName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Variant ID *
              </label>
              <Input
                placeholder="Nhập UUID của biến thể sản phẩm"
                value={newItem.variant_id}
                onChange={(e) =>
                  setNewItem({ ...newItem, variant_id: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Số Lượng</label>
              <Input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    quantity: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Price Version
              </label>
              <Input
                type="text"
                value={newItem.price_version}
                // Lấy giá trị chuỗi từ input
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    price_version: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Mặc định: Timestamp hiện tại
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Giá hiển thị (tùy chọn)
              </label>
              <Input
                type="number"
                min="0"
                value={newItem.clientPriceVnd}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    clientPriceVnd: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAddItem} className="flex-1">
              Thêm
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddingItem(false)}
              className="flex-1"
            >
              Hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
