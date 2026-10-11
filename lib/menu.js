export const categories = ["Deals", "Pizzas", "Burgers & Pizza Fries", "Beverages"];
export const menu = {
  Deals: [
    { id: "d1", name: "Royal Duo", emoji: "👑", desc: "2 medium pizzas + 1.5L drink", price: 2499 },
    { id: "d2", name: "Family Feast", emoji: "🍕", desc: "2 large pizzas, fries, 4 drinks", price: 4199 },
    { id: "d3", name: "Solo King", emoji: "🔥", desc: "Small pizza, fries, drink", price: 999 },
    { id: "d4", name: "Party Throne", emoji: "🎉", desc: "4 large pizzas, 2 dips, 2L drinks", price: 7499 },
  ],
  Pizzas: [
    { id: "p1", name: "Crown Supreme", emoji: "🍕", desc: "Beef pepperoni, mushrooms, olives, peppers", price: 1699 },
    { id: "p2", name: "Fajita King", emoji: "🌶️", desc: "Spiced chicken, onions, capsicum, smoky sauce", price: 1599 },
    { id: "p3", name: "Triple Cheese", emoji: "🧀", desc: "Mozzarella, cheddar and cream cheese", price: 1499 },
    { id: "p4", name: "Tikka Crust", emoji: "🍗", desc: "Chicken tikka, green chilli, mint drizzle", price: 1649 },
  ],
  "Burgers & Pizza Fries": [
    { id: "b1", name: "King Zinger", emoji: "🍔", desc: "Crispy chicken, jalapeño mayo, cheese slice", price: 749 },
    { id: "b2", name: "Double Smash", emoji: "🥩", desc: "Two smashed patties, cheddar, house sauce", price: 999 },
    { id: "b3", name: "Pizza Fries", emoji: "🍟", desc: "Fries, melted mozzarella, chicken, pizza sauce", price: 649 },
    { id: "b4", name: "Loaded Fries", emoji: "🧆", desc: "Fries with nacho cheese and jalapeños", price: 549 },
  ],
  Beverages: [
    { id: "v1", name: "Cola 500ml", emoji: "🥤", desc: "Chilled and fizzy", price: 150 },
    { id: "v2", name: "Mint Margarita", emoji: "🍹", desc: "Fresh mint, lemon, soda", price: 299 },
    { id: "v3", name: "Mango Shake", emoji: "🥭", desc: "Thick and creamy", price: 399 },
    { id: "v4", name: "Iced Coffee", emoji: "☕", desc: "Cold brew with milk", price: 349 },
  ],
};
export const fmt = (n) => "Rs. " + n.toLocaleString("en-PK");
