'use client';

import { useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CartItem } from '@/components/quick-order/quick-order-cart';
import { useStorefrontCatalog } from '@/src/lib/hooks/useStorefrontCatalog';
import type { StorefrontProduct, StorefrontProductVariant, StorefrontCombo } from '@/src/lib/hooks/useStorefrontCatalog';

type QuickOrderProductGridProps = {
    onAddItem: (item: CartItem) => void;
};

const formatCurrency = (value?: number) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '—';
    }
    return `${value.toLocaleString('vi-VN')} đ`;
};

export function QuickOrderProductGrid({ onAddItem }: QuickOrderProductGridProps) {
    const { products, combos, isLoading, error } = useStorefrontCatalog();
    const [search, setSearch] = useState('');

    const keyword = search.trim().toLowerCase();

    const filteredCombos = useMemo(() => {
        if (!keyword) return combos;
        return combos.filter((combo) => combo.name?.toLowerCase().includes(keyword));
    }, [combos, keyword]);

    const filteredProducts = useMemo(() => {
        if (!keyword) return products;
        return products
            .map((product) => {
                const matchesProduct = product.name.toLowerCase().includes(keyword);
                const variants = product.variants.filter((variant) =>
                    variant.label.toLowerCase().includes(keyword),
                );
                if (matchesProduct && variants.length === 0) {
                    return product;
                }
                return {
                    ...product,
                    variants,
                };
            })
            .filter((product) => product.variants.length > 0 || product.name.toLowerCase().includes(keyword));
    }, [products, keyword]);

    const handleAddVariant = (product: StorefrontProduct, variant: StorefrontProductVariant) => {
        onAddItem({
            type: 'PRODUCT',
            variant_id: variant.id,
            quantity: 1,
            price_version: variant.priceVersion,
            productName: variant.label,
            clientPriceVnd: variant.priceVnd,
        });
    };

    const handleAddCombo = (combo: StorefrontCombo) => {
        onAddItem({
            type: 'COMBO',
            combo_id: combo.id,
            quantity: 1,
            price_version: combo.priceVersion,
            productName: combo.name,
            clientPriceVnd: combo.priceVnd,
        });
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-cyan-600" />
                        Sản phẩm nổi bật
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Chọn nhanh sản phẩm và thêm vào giỏ hàng
                    </p>
                </div>
                <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="md:w-64"
                />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="py-8 text-center text-sm text-gray-500">Đang tải danh sách sản phẩm...</div>
                ) : error ? (
                    <div className="py-8 text-center text-sm text-red-500">Không thể tải sản phẩm. Vui lòng thử lại.</div>
                ) : filteredCombos.length === 0 && filteredProducts.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">Không tìm thấy sản phẩm phù hợp.</div>
                ) : (
                    <div className="space-y-8">
                        {filteredCombos.length > 0 && (
                            <section className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-base font-semibold">Combo nổi bật</h4>
                                    <Badge variant="secondary">{filteredCombos.length} combo</Badge>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {filteredCombos.map((combo) => (
                                        <div key={combo.id} className="border rounded-2xl p-4 space-y-4 bg-white shadow-sm">
                                            <div>
                                                <div className="text-lg font-semibold text-gray-900">{combo.name}</div>
                                                <div className="text-xs text-gray-400 font-mono">{combo.slug}</div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-xs uppercase text-gray-500">Giá combo</div>
                                                    <div className="text-xl font-bold text-cyan-700">
                                                        {formatCurrency(combo.priceVnd)}
                                                    </div>
                                                </div>
                                                <Badge>Combo</Badge>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Bao gồm {combo.components.length} thành phần.
                                            </p>
                                            <Button onClick={() => handleAddCombo(combo)} className="w-full">
                                                Thêm combo
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {filteredProducts.length > 0 && (
                            <section className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-base font-semibold">Sản phẩm</h4>
                                    <Badge variant="outline">{filteredProducts.length} sản phẩm</Badge>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {filteredProducts.map((product) => (
                                        <div key={product.id} className="border rounded-2xl p-4 space-y-4 bg-white shadow-sm">
                                            <div>
                                                <div className="text-lg font-semibold text-gray-900">{product.name}</div>
                                                {product.description ? (
                                                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                                                ) : null}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-xs uppercase text-gray-500">Biến thể</div>
                                                <div className="space-y-2">
                                                    {product.variants.map((variant) => (
                                                        <div
                                                            key={variant.id}
                                                            className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                                                        >
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{variant.label}</div>
                                                                <div className="text-xs text-gray-500 font-mono">
                                                                    {variant.id.substring(0, 10)}...
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-semibold text-cyan-700">
                                                                    {formatCurrency(variant.priceVnd)}
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    className="mt-1"
                                                                    onClick={() => handleAddVariant(product, variant)}
                                                                >
                                                                    Thêm
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
