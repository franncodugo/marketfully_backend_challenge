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