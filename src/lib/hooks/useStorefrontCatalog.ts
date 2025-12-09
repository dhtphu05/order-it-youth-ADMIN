'use client';

import { useMemo } from 'react';
import {
    useCombosControllerListCombos,
    useProductsControllerListProducts,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type {
    ComboComponentDto,
    ComboResponseDto,
    ProductResponseDto,
    ProductVariantDto,
} from '@/lib/api/generated/models';

export type StorefrontProductVariant = {
    id: string;
    label: string;
    sku?: string;
    priceVnd: number;
    priceVersion: number;
};

export type StorefrontProduct = {
    id: string;
    name: string;
    description?: string;
    variants: StorefrontProductVariant[];
};

export type StorefrontCombo = {
    id: string;
    name: string;
    slug: string;
    priceVnd: number;
    listPriceVnd: number;
    priceVersion: number;
    pricingType?: ComboResponseDto['pricing_type'];
    amountOff?: number;
    percentOff?: number;
    components: ComboComponentDto[];
};

const getVariantLabel = (productName: string, variant: ProductVariantDto) => {
    const optionLabels: string[] = [];
    const tryPush = (value: unknown) => {
        if (!value) return;
        if (typeof value === 'string') {
            optionLabels.push(value);
        } else if (typeof value === 'object') {
            const label = (value as Record<string, unknown>).value ?? (value as any).label;
            if (typeof label === 'string') {
                optionLabels.push(label);
            }
        }
    };

    tryPush(variant.option1);
    tryPush(variant.option2);

    if (optionLabels.length === 0 && variant.sku) {
        optionLabels.push(variant.sku);
    }

    const suffix = optionLabels.length > 0 ? ` – ${optionLabels.join(' / ')}` : '';
    return `${productName}${suffix}`;
};

const normalizeProducts = (products?: ProductResponseDto[]): StorefrontProduct[] => {
    if (!Array.isArray(products)) return [];
    return products
        .map((product) => {
            const variants = (product.variants ?? []).map((variant) => ({
                id: variant.id,
                label: getVariantLabel(product.name, variant),
                sku: variant.sku,
                priceVnd: variant.price_vnd,
                priceVersion: variant.price_version,
            }));
            return {
                id: product.id,
                name: product.name,
                description:
                    typeof product.description === 'string'
                        ? product.description
                        : (product.description as any)?.text ?? undefined,
                variants,
            };
        })
        .filter((product) => product.variants.length > 0);
};

const computeComboPrice = (combo: ComboResponseDto) => {
    const listPrice = combo.list_price_vnd ?? 0;
    if (combo.pricing_type === 'SUM_MINUS_AMOUNT') {
        return Math.max(0, listPrice - (combo.amount_off_vnd ?? 0));
    }
    if (combo.pricing_type === 'SUM_MINUS_PERCENT') {
        const percent = combo.percent_off ?? 0;
        return Math.max(0, Math.round(listPrice * (1 - percent / 100)));
    }
    return listPrice;
};

const normalizeCombos = (combos?: ComboResponseDto[]): StorefrontCombo[] => {
    if (!Array.isArray(combos)) return [];
    return combos.map((combo) => ({
        id: combo.id,
        name: combo.name,
        slug: combo.slug,
        priceVnd: computeComboPrice(combo),
        listPriceVnd: combo.list_price_vnd ?? 0,
        priceVersion: combo.price_version ?? Date.now(),
        pricingType: combo.pricing_type,
        amountOff: combo.amount_off_vnd,
        percentOff: combo.percent_off,
        components: combo.components ?? [],
    }));
};

export function useStorefrontCatalog() {
    const productsQuery = useProductsControllerListProducts<ProductResponseDto[]>({
        query: {
            keepPreviousData: true,
        },
    });
    const combosQuery = useCombosControllerListCombos<ComboResponseDto[]>({
        query: {
            keepPreviousData: true,
        },
    });

    const products = useMemo(
        () => normalizeProducts(productsQuery.data as ProductResponseDto[]),
        [productsQuery.data],
    );
    const combos = useMemo(
        () => normalizeCombos(combosQuery.data as ComboResponseDto[]),
        [combosQuery.data],
    );

    return {
        products,
        combos,
        isLoading: productsQuery.isLoading || combosQuery.isLoading,
        isFetching: productsQuery.isFetching || combosQuery.isFetching,
        error: productsQuery.error ?? combosQuery.error,
        refetch: async () => {
            await Promise.all([productsQuery.refetch(), combosQuery.refetch()]);
        },
    };
}
