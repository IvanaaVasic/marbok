import { useState } from "react";
import { FaFileExcel } from "react-icons/fa6";
import { createCatalogWorkbook } from "@/utils/catalogWorkbook";
import styles from "./CatalogExportButton.module.css";

function CatalogExportButton({ categories = [], menu = false }) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (isExporting || !categories.length) return;
        setIsExporting(true);

        try {
            const workbook = await createCatalogWorkbook(categories);
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const date = new Date().toISOString().slice(0, 10);
            link.href = downloadUrl;
            link.download = `MARBOK_Ponuda_${date}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Greška pri izvozu kataloga:", error);
            window.alert(
                "Excel trenutno nije moguće napraviti. Pokušajte ponovo."
            );
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            type="button"
            className={`${styles.exportButton} ${
                menu ? styles.menuButton : ""
            }`}
            onClick={handleExport}
            disabled={isExporting || !categories.length}
            title="Preuzmi trenutnu ponudu u Excel formatu"
        >
            <FaFileExcel aria-hidden="true" className={styles.icon} />
            <span className={styles.label}>
                {isExporting ? "Pravim Excel..." : "Preuzmi Excel"}
            </span>
        </button>
    );
}

export default CatalogExportButton;
