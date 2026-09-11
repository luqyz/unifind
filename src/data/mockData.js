export const categories = [
  'Electronics',
  'Wallets',
  'Keys',
  'Bags',
  'Jewelry',
  'Documents',
  'Pets',
  'Clothing',
  'Accessories',
  'Other',
]

export const mockItems = [
  {
    id: 'item-1',
    title: 'Black leather wallet near the library',
    description: 'A black leather wallet with a few cards and a small keyring. Found near the main library entrance on Tuesday evening.',
    type: 'found',
    category: 'Wallets',
    location: 'Downtown Library',
    date: '2026-08-10',
    image:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80',
    user: {
      name: 'Maya R.',
      verified: true,
      joined: '2025-02-18',
    },
    status: 'open',
    isResolved: false,
  },
  {
    id: 'item-2',
    title: 'Silver iPhone 14 lost in market square',
    description: 'Lost my iPhone 14 with a clear case. Last seen near the cafe and the bus station around 6pm.',
    type: 'lost',
    category: 'Electronics',
    location: 'Market Square',
    date: '2026-08-12',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    user: {
      name: 'Daniel K.',
      verified: false,
      joined: '2026-01-25',
    },
    status: 'open',
    isResolved: false,
  },
  {
    id: 'item-3',
    title: 'Blue bicycle helmet found by the park gate',
    description: 'A blue bike helmet with a sticker of a mountain shape was left by the gate and picked up during the evening ride.',
    type: 'found',
    category: 'Accessories',
    location: 'Central Park',
    date: '2026-08-11',
    image:
      'https://images.unsplash.com/photo-1558980664-10e7170b5df9?auto=format&fit=crop&w=900&q=80',
    user: {
      name: 'Nina T.',
      verified: true,
      joined: '2024-11-03',
    },
    status: 'open',
    isResolved: false,
  },
  {
    id: 'item-4',
    title: 'House keys recovered from coffee shop table',
    description: 'Set of house keys with a red tag. Found on a table in the back corner near the restrooms.',
    type: 'found',
    category: 'Keys',
    location: 'Oak Street Café',
    date: '2026-08-09',
    image:
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80',
    user: {
      name: 'Chris M.',
      verified: false,
      joined: '2026-03-14',
    },
    status: 'resolved',
    isResolved: true,
  },
]

export const defaults = {
  type: 'all',
  category: 'all',
  location: 'all',
  keyword: '',
}
