import { useEffect, useState } from "react";
import styles from "./Cart.module.css";
import Link from "next/link";
import { FaCartShopping } from "react-icons/fa6";
import { useCart } from "@/hooks/useCart";

function Cart() {
  const { cart } = useCart();
  const [cartLength, setCartLength] = useState(cart?.length);
  const [animationClass, setAnimationClass] = useState(false);

  useEffect(() => {
    setCartLength(cart?.length);

    setAnimationClass(true);
    const timer = setTimeout(() => {
      setAnimationClass(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [cart, cartLength, setCartLength, setAnimationClass]);

  return (
    <Link href={`/contact`}>
      <div className={styles.cartContainer}>
        <FaCartShopping className={styles.cartIcon} />
        <span
          className={`${styles.quantity} ${animationClass && styles.animation}`}
        >
          {cart?.length}
        </span>
      </div>
    </Link>
  );
}
export default Cart;
