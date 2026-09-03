import { useQueryClient, useMutation, useQuery } from "react-query";

export function useCart() {
  const queryClient = useQueryClient();

  // Check if localStorage is available
  const isLocalStorageAvailable =
    typeof window !== "undefined" && window.localStorage;

  const addToCart = useMutation(
    async (product) => {
      const currentCartItems = isLocalStorageAvailable
        ? JSON.parse(localStorage.getItem("cart")) || []
        : [];
      const existingProductIndex = currentCartItems.findIndex(
        (item) =>
          (product.productId && item.productId === product.productId) ||
          (product.productKey && item.productKey === product.productKey)
      );
      const newCartItems = [...currentCartItems];

      if (existingProductIndex >= 0) {
        const currentQuantity =
          parseInt(newCartItems[existingProductIndex].quantity, 10) || 0;
        const addedQuantity = parseInt(product.quantity, 10) || 0;
        newCartItems[existingProductIndex] = {
          ...newCartItems[existingProductIndex],
          ...product,
          quantity: String(currentQuantity + addedQuantity),
        };
      } else {
        newCartItems.push(product);
      }

      if (isLocalStorageAvailable) {
        localStorage.setItem("cart", JSON.stringify(newCartItems));
      }
      return product;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("cart");
      },
    }
  );

  const removeFromCart = (index) => {
    const updatedCart = isLocalStorageAvailable
      ? JSON.parse(localStorage.getItem("cart")) || []
      : [];
    updatedCart.splice(index, 1);
    if (isLocalStorageAvailable) {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
    queryClient.invalidateQueries("cart"); // Invalidate the 'cart' query to refetch
  };

  const updateCartQuantity = (index, quantity) => {
    const parsedQuantity = Math.max(parseInt(quantity, 10) || 1, 1);
    const updatedCart = isLocalStorageAvailable
      ? JSON.parse(localStorage.getItem("cart")) || []
      : [];

    if (!updatedCart[index]) return;

    updatedCart[index] = {
      ...updatedCart[index],
      quantity: String(parsedQuantity),
    };
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    queryClient.invalidateQueries("cart");
  };

  const clearCart = () => {
    if (isLocalStorageAvailable) {
      localStorage.removeItem("cart");
    }
    queryClient.invalidateQueries("cart"); // Invalidate the 'cart' query to refetch
  };

  const { data: cart, isLoading } = useQuery("cart", () => {
    // Retrieve cart items from local storage
    if (isLocalStorageAvailable) {
      const storedCartItems = JSON.parse(localStorage.getItem("cart")) || [];
      return storedCartItems;
    }
    return [];
  });
  return {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cart,
    isLoading,
  };
}
