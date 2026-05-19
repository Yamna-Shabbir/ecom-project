const nodemailer = require("nodemailer");

function getTransport() {
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").trim();
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

function formatOrderEmailHtml(order) {
  const placed = new Date(order.createdAt || Date.now()).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const rows = (order.products || [])
    .map(
      (p) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e0da;">${p.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e0da;text-align:center;">${p.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e0da;text-align:right;">Rs. ${Math.round(p.price * p.quantity).toLocaleString("en-PK")}</td>
        </tr>`
    )
    .join("");

  const timeline = [
    { label: "Order confirmed", detail: "We received your order and started preparing it." },
    { label: "Packed (3–5 days)", detail: "Your handmade items are being carefully packed." },
    { label: "Dispatched (within ~1 week)", detail: "Your parcel leaves our studio for delivery." },
    { label: "Delivered (2–3 weeks total)", detail: "Estimated arrival at your address." },
  ]
    .map(
      (t) =>
        `<li style="margin-bottom:10px;"><strong>${t.label}</strong><br/><span style="color:#7a6358;">${t.detail}</span></li>`
    )
    .join("");

  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3a2920;">
<h2 style="color:#a05d52;font-weight:normal;">Thank you for your order, ${order.buyerName}!</h2>
<p style="color:#7a6358;line-height:1.6;">Your Gülkaar order <strong>#${String(order._id).slice(-6)}</strong> was placed on ${placed}.</p>
<h3 style="color:#5c4033;font-size:1rem;">Items ordered</h3>
<table style="width:100%;border-collapse:collapse;font-size:0.95rem;">
<thead><tr style="color:#7a6358;font-size:0.8rem;text-transform:uppercase;">
<th style="text-align:left;padding-bottom:8px;">Product</th>
<th style="text-align:center;padding-bottom:8px;">Qty</th>
<th style="text-align:right;padding-bottom:8px;">Subtotal</th>
</tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr>
<td colspan="2" style="padding-top:12px;font-weight:bold;">Total</td>
<td style="padding-top:12px;text-align:right;font-weight:bold;color:#c9867a;">Rs. ${Math.round(Number(order.totalPrice)).toLocaleString("en-PK")}</td>
</tr></tfoot></table>
<p style="margin-top:16px;color:#7a6358;"><strong>Delivery:</strong> ${order.buyerCity}, ${order.buyerAddress}</p>
<p style="color:#7a6358;"><strong>Payment:</strong> Cash on delivery</p>
<h3 style="color:#5c4033;font-size:1rem;margin-top:24px;">Delivery timeline (2–3 weeks)</h3>
<ul style="padding-left:18px;line-height:1.5;">${timeline}</ul>
<p style="margin-top:20px;font-size:0.9rem;color:#7a6358;">Handmade with care — thank you for supporting Gülkaar.</p>
</body></html>`;
}

async function sendOrderConfirmationEmail(order) {
  const transport = getTransport();
  if (!transport) {
    console.warn("Order email skipped: SMTP_USER / SMTP_PASS not set on server.");
    return { sent: false, reason: "smtp_not_configured" };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transport.sendMail({
    from,
    to: order.buyerEmail,
    subject: `Gülkaar order confirmed #${String(order._id).slice(-6)}`,
    html: formatOrderEmailHtml(order),
    text: `Thank you ${order.buyerName}! Your order #${String(order._id).slice(-6)} total is Rs. ${Math.round(Number(order.totalPrice)).toLocaleString("en-PK")}. Estimated delivery: 2–3 weeks.`,
  });

  return { sent: true };
}

module.exports = { sendOrderConfirmationEmail, getTransport };
