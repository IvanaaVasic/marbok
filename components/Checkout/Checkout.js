import styles from "./Checkout.module.css";
import { MdDelete } from "react-icons/md";
import { urlFromThumbnail } from "@/utils/image";

function Checkout({ cart, removeFromCart }) {
  return (
    <div className={styles.checkoutContainer}>
      <h2 className={styles.heading}>Proizvodi dodati u korpu</h2>
      {cart?.length != 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableHeader}>Sl.</th>
              <th className={styles.tableHeader}>Proizvod</th>
              <th className={styles.tableHeader}>Kol.</th>
              <th className={styles.tableHeader}>Šifra</th>
              <th className={styles.tableHeader}>Del.</th>
            </tr>
          </thead>

          <tbody>
            {cart?.map((item, index) => {
              return (
                <tr key={index} className={styles.infoRow}>
                  {item?.image && (
                    <td className={styles.tableData}>
                      <img
                        src={urlFromThumbnail(item?.image)}
                        alt={item?.name}
                        className={styles.img}
                      />
                    </td>
                  )}
                  <td className={styles.tableData}>
                    <p>{item?.name}</p>
                  </td>
                  <td className={styles.tableData}>
                    <p>{item?.quantity}</p>
                  </td>
                  <td className={styles.tableData}>
                    <p>{item?.productKey}</p>
                  </td>
                  <td className={styles.tableData}>
                    <MdDelete
                      onClick={() => removeFromCart(index)}
                      className={styles.deleteIcon}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className={styles.infoMessage}>Nemate proizvode u korpi</p>
      )}
    </div>
  );
}
export default Checkout;
