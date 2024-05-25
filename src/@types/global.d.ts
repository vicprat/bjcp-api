export interface BeerStyle {
  name: string
  category_id: string
  style_id: string
  overall_impression: string
  appearance: string
  aroma: string
  flavor: string
  mouthfeel: string
  comments: string
  history: string
  style_comparison: string
  tags: string[]
  original_gravity_min: number | null
  original_gravity_max: number | null
  international_bitterness_units_min: number | null
  international_bitterness_units_max: number | null
  final_gravity_min: number | null
  final_gravity_max: number | null
  alcohol_by_volume_min: number | null
  alcohol_by_volume_max: number | null
  color_min: number | null
  color_max: number | null
  ingredients: string
  examples: string
  style_guide: string
}

export interface BeerCategory {
  category: string
  category_id: string
  category_description: string
}
export interface YeastData {
  brand: string
  yeast_name: string
  yeast_id: string
  yeast_description: string
  yeast_strain: string
  beer_styles: string[]
  attenuation_min: number
  attenuation_max: number
  fermentation_temperature_range_min: number
  fermentation_temperature_range_max: number
  floculation: string
  aroma: string
  abv_alcohol_tolerance: number
  pitching_rate: string
}
export interface YeastUrl {
  name: string
  url: string
}
