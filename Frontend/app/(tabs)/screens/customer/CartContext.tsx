// import React, { createContext, useState, ReactNode } from 'react';

// export interface CartItem {
//   id: number;
//   name: string;
//   price: number;
//   image_url?: string;
// }

// interface CartContextType {
//   cart: CartItem[];
//   setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
// }

// export const CartContext = createContext<CartContextType>({
//   cart: [],
//   setCart: () => {},
// });

// export function CartProvider({ children }: { children: ReactNode }) {
//   const [cart, setCart] = useState<CartItem[]>([]);

//   return (
//     <CartContext.Provider value={{ cart, setCart }}>
//       {children}
//     </CartContext.Provider>
//   );
// }


import React, { createContext, useState, useContext } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add item (your current logic: just push another copy)
  const addItem = (item) => {
    setCart((prev) => [...prev, item]);
  };

  // Remove only ONE matching item
  const removeItem = (itemId) => {
    setCart((prev) => {
      const index = prev.findIndex((p) => p.id === itemId);
      if (index !== -1) {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      }
      return prev;
    });
  };

  // Clear whole cart
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
