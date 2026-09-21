export const selectFavorites = items => items.filter(item => item.favorite);
export const selectCategories = items => [...new Set(items.map(item => item.category || 'General'))].sort();
