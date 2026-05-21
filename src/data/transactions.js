export const fallbackTransactions = [
  {
    id: 't1',
    title: 'Grocery shopping',
    amount: -650,
    note: 'Weekly groceries at SM Supermarket',
    occurred_at: new Date().toISOString(),
    category: { name: 'Food', icon: 'fast-food-outline', color: '#FF7A59' }
  },
  {
    id: 't2',
    title: 'Allowance',
    amount: 5000,
    note: 'Weekly allowance from mom',
    occurred_at: new Date().toISOString(),
    category: { name: 'Income', icon: 'cash-outline', color: '#22A06B' }
  },
  {
    id: 't3',
    title: 'Jeepney fare',
    amount: -85,
    note: 'Round trip to school',
    occurred_at: new Date().toISOString(),
    category: { name: 'Transport', icon: 'bus-outline', color: '#6B7FFF' }
  }
];
