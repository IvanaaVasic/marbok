export function downloadFile(file) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url; link.download = file.name;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export async function shareFile(file) {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: "Marbok porudžbina" });
            return "shared";
        } catch (error) {
            if (error.name === "AbortError") return "cancelled";
            throw error;
        }
    }
    downloadFile(file);
    return "downloaded";
}
