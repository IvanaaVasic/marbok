import { useQueryClient, useMutation, useQuery } from "react-query";

export function useCart() {
  const queryClient = useQueryClient();

  // Check if localStorage is available
  const isLocalStorageAvailable =
    typeof window !== "undefined" && window.localStorage;

  // Retrieve cart items from local storage, if available
  const initialCartItems = isLocalStorageAvailable
    ? JSON.parse(localStorage.getItem("cart")) || []
    : [];

  const addToCart = useMutation(
    async (product) => {
      const newCartItems = [...initialCartItems, product];
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
    const updatedCart = [...initialCartItems];
    updatedCart.splice(index, 1);
    if (isLocalStorageAvailable) {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
    queryClient.invalidateQueries("cart"); // Invalidate the 'cart' query to refetch
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
  return { addToCart, removeFromCart, clearCart, cart, isLoading };
}
