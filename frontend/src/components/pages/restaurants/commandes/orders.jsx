export const sampleOrders = [
  {
    id: 1,
    clientName: "Issa",
    type: "sur place",
    items: [
      { name: "Poulet", quantity: 1, price: 2500 },
      { name: "Bière", quantity: 2, price: 1000 },
    ],
    paid: true,
    paymentMethod: "espèces",
    date: "2025-07-29 11:30",
  },
  {
    id: 2,
    clientName: "Fatou",
    type: "livraison",
    items: [{ name: "Pizza", quantity: 1, price: 3500 }],
    paid: false,
    paymentMethod: "Orange Money",
    date: "2025-07-29 11:45",
  },
  {
    id: 3,
    clientName: "Seydou",
    type: "à emporter",
    items: [{ name: "Thiakry", quantity: 3, price: 500 }],
    paid: true,
    paymentMethod: "Mobile Cash",
    date: "2025-07-28 20:10",
  },
];
