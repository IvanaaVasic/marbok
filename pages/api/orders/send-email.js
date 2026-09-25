import { createClient } from "next-sanity";
import clientConfig from "@/sanity/config/client-config";
import { buildOrderEmailParams } from "@/server/orderEmail";

const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";
const EMAIL_SERVICE_ID = "service_pn5jvkb";
const EMAIL_TEMPLATE_ID = "template_ji1obt8";
const EMAIL_PUBLIC_KEY = "vEKyEbs258TNVtxqI";
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendThroughEmailJs(templateParams) {
    let lastError;

    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            const response = await fetch(EMAILJS_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id: EMAIL_SERVICE_ID,
                    template_id: EMAIL_TEMPLATE_ID,
                    user_id: EMAIL_PUBLIC_KEY,
                    template_params: templateParams,
                }),
                signal: AbortSignal.timeout(12000),
            });

            if (response.ok) return;

            const providerMessage = await response.text().catch(() => "");
            lastError = new Error(
                `EmailJS ${response.status}${providerMessage ? `: ${providerMessage.slice(0, 180)}` : ""}`
            );
            if (!RETRYABLE_STATUS.has(response.status)) break;
        } catch (error) {
            lastError = error;
        }

        if (attempt === 0) await wait(1600);
    }

    throw lastError || new Error("EmailJS slanje nije uspelo.");
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Metoda nije dozvoljena." });
    }

    const { orderNumber, orderExcelUrl } = req.body || {};
    if (typeof orderNumber !== "string" || !/^ORD-\d{10,20}$/.test(orderNumber)) {
        return res.status(400).json({ error: "Neispravan broj porudžbine." });
    }

    try {
        const order = await createClient({ ...clientConfig, useCdn: false }).fetch(
            `*[_type == "order" && orderNumber == $orderNumber][0]{
                orderNumber, companyName, customerName, email, phone, message, pib,
                items[]{name, quantity, productKey, price}
            }`,
            { orderNumber }
        );
        if (!order) {
            return res.status(404).json({ error: "Porudžbina nije pronađena." });
        }

        const forwardedHost = req.headers["x-forwarded-host"];
        const host = Array.isArray(forwardedHost)
            ? forwardedHost[0]
            : forwardedHost || req.headers.host;
        const forwardedProto = req.headers["x-forwarded-proto"];
        const protocol = Array.isArray(forwardedProto)
            ? forwardedProto[0]
            : forwardedProto || "https";
        const safeExcelUrl =
            typeof orderExcelUrl === "string" &&
            orderExcelUrl.startsWith("https://cdn.sanity.io/")
                ? orderExcelUrl
                : "";
        const templateParams = buildOrderEmailParams(order, {
            orderUrl: host
                ? `${protocol}://${host}/order/${encodeURIComponent(orderNumber)}`
                : "",
            orderExcelUrl: safeExcelUrl,
        });
        await sendThroughEmailJs(templateParams);
        return res.status(200).json({ sent: true });
    } catch (error) {
        console.error("Order email delivery failed", error);
        return res.status(502).json({
            error: "Porudžbina je sačuvana, ali email trenutno nije poslat.",
        });
    }
}
