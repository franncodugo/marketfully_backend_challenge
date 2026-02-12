export interface ZipDemographics {
    zip_code: string;
    median_income: number | null;
    population: number | null;
    median_age: number | null;
}

export interface Property {
    id: number;
    status: string;
    price: number;
    bed: number | null;
    bath: number | null;
    acre_lot: number | null;
    full_address: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    house_size: number | null;
    sold_date: string | null;
    state_code: string | null;
    price_per_sq_ft: number | null;
    price_per_acre: number | null;
    zip_info?: ZipDemographics | null; 
}

export interface PropertyFilters {
    status: 'for_sale' | 'sold' | 'ready_to_build';
    min_price?: number;
    max_price?: number;
    min_bed?: number;
    max_bed?: number;
    min_bath?: number;
    max_bath?: number;
    min_acre_lot?: number;
    max_acre_lot?: number;
    min_house_size?: number;
    max_house_size?: number;
    city?: string;
    state?: string;
    state_code?: string;
    zip_code?: string;
    // Demographics
    min_population?: number;
    max_population?: number;
    min_median_income?: number;
    max_median_income?: number;
    min_median_age?: number;
    max_median_age?: number;
    // Pagination & Sort
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
}