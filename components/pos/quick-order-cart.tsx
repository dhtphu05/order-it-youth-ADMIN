'use client';

import { useState } from 'react';
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
import type { OrderItem } from '@/src/lib/api/models/pos';
import { Trash2, Plus } from 'lucide-react';

export interface CartItem extends OrderItem {
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
    // Giữ price_version là chuỗi rỗng để quản lý input dễ hơn
    price_version: '', 
    productName: '',
  });

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

    const cartItem: CartItem = {
      variant_id: newItem.variant_id,
      quantity: newItem.quantity,
      // Đã là number, phù hợp với OrderItem.price_version: number
      price_version: finalPriceVersion, 
      productName: newItem.productName || 'Sản phẩm',
    };

    onItemsChange([...items, cartItem]);
    setNewItem({
      variant_id: '',
      quantity: 1,
      price_version: '',
      productName: '',
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
                  <TableHead>Sản Phẩm</TableHead>
                  <TableHead>Variant ID</TableHead>
                  <TableHead className="text-right">Số Lượng</TableHead>
                  <TableHead className="text-right">Price Version</TableHead>
                  <TableHead className="w-[100px]">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName || 'Sản phẩm'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.variant_id.substring(0, 8)}...
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