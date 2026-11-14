const { Resend } = require('resend');

let resend = null;

function getResend() {
  if (resend) return resend;

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      '[emailService] RESEND_API_KEY is not set. Emails will be logged to console instead of sent.'
    );
    return null;
  }

  resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

// Protects emails from HTML injection via customer-provided text
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const STORE_NAME = () => process.env.STORE_NAME || 'Nova Mobile';

async function sendMail({ to, subject, html }) {
  const client = getResend();

  if (!client) {
    console.log('----- EMAIL (Resend not configured, printed instead) -----');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('----------------------------------------------------------');
    return { simulated: true };
  }

  const from = process.env.MAIL_FROM || `${STORE_NAME()} <onboarding@resend.dev>`;

  // Resend does not throw on failure, it returns { data, error }
  const { data, error } = await client.emails.send({ from, to, subject, html });
  if (error) throw new Error(error.message);

  return data;
}

function itemsRowsHtml(items) {
  return items
    .map(
      (it) => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #EAEAEA;">${esc(it.title)}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #EAEAEA;">${esc(it.color || '-')}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #EAEAEA;">${esc(it.storage || '-')}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #EAEAEA;text-align:center;">${esc(it.quantity)}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #EAEAEA;text-align:right;">$${it.price.toFixed(2)}</td>
      </tr>`
    )
    .join('');
}

function baseWrapper(title, bodyHtml) {
  return `
  <div style="background:#0E1013;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
      <div style="background:#0E1013;padding:24px 32px;">
        <span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.5px;">${esc(STORE_NAME().toUpperCase())}</span>
      </div>
      <div style="padding:32px;color:#1A1D21;">
        <h2 style="margin-top:0;color:#0E1013;">${esc(title)}</h2>
        ${bodyHtml}
      </div>
      <div style="background:#F5F4F1;padding:20px 32px;color:#6B7280;font-size:12px;">
        ${esc(STORE_NAME())} · Premium Smartphones · Official Warranty on all devices
      </div>
    </div>
  </div>`;
}

async function sendOwnerOrderEmail(order) {
  const body = `
    <p><strong>Order #${esc(order.orderNumber)}</strong> was just placed.</p>
    <h3>Customer</h3>
    <p>${esc(order.customer.name)}<br/>${esc(order.customer.phone)}<br/>${esc(order.customer.email)}</p>
    <h3>Delivery</h3>
    <p>${esc(order.delivery.address)}, ${esc(order.delivery.city)}<br/>
    ${esc(order.delivery.date || '')} ${esc(order.delivery.time || '')}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <thead>
        <tr style="background:#F5F4F1;">
          <th style="padding:8px;text-align:left;">Phone</th>
          <th style="padding:8px;text-align:left;">Color</th>
          <th style="padding:8px;text-align:left;">Storage</th>
          <th style="padding:8px;text-align:center;">Qty</th>
          <th style="padding:8px;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsRowsHtml(order.items)}</tbody>
    </table>
    <table style="width:100%;margin-top:16px;">
      <tr><td>Subtotal</td><td style="text-align:right;">$${order.subtotal.toFixed(2)}</td></tr>
      <tr><td>Delivery</td><td style="text-align:right;">$${order.deliveryFee.toFixed(2)}</td></tr>
      <tr><td style="font-weight:bold;">Total</td><td style="text-align:right;font-weight:bold;">$${order.total.toFixed(2)}</td></tr>
    </table>
    ${order.comment ? `<p><strong>Customer comment:</strong> ${esc(order.comment)}</p>` : ''}
  `;
  return sendMail({
    to: process.env.STORE_EMAIL,
    subject: `New order ${order.orderNumber}`,
    html: baseWrapper('New Order Received', body)
  });
}

async function sendCustomerConfirmationEmail(order) {
  const body = `
    <p>Hi ${esc(order.customer.name)},</p>
    <p>Thank you for your order! Your order number is <strong>${esc(order.orderNumber)}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <thead>
        <tr style="background:#F5F4F1;">
          <th style="padding:8px;text-align:left;">Phone</th>
          <th style="padding:8px;text-align:left;">Color</th>
          <th style="padding:8px;text-align:left;">Storage</th>
          <th style="padding:8px;text-align:center;">Qty</th>
          <th style="padding:8px;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsRowsHtml(order.items)}</tbody>
    </table>
    <table style="width:100%;margin-top:16px;">
      <tr><td>Subtotal</td><td style="text-align:right;">$${order.subtotal.toFixed(2)}</td></tr>
      <tr><td>Delivery</td><td style="text-align:right;">$${order.deliveryFee.toFixed(2)}</td></tr>
      <tr><td style="font-weight:bold;">Total</td><td style="text-align:right;font-weight:bold;">$${order.total.toFixed(2)}</td></tr>
    </table>
    <p style="margin-top:24px;">We'll email you again once your order status changes.</p>
  `;
  return sendMail({
    to: order.customer.email,
    subject: `Your order ${order.orderNumber} was received`,
    html: baseWrapper('Order Confirmed', body)
  });
}

const STATUS_MESSAGES = {
  CONFIRMED: 'Your order has been confirmed.',
  PROCESSING: 'Your order is being prepared.',
  READY: 'Your order is ready for delivery.',
  DELIVERED: 'Your order has been delivered. Enjoy your new phone!',
  CANCELLED: 'Your order has been cancelled.'
};

async function sendStatusUpdateEmail(order) {
  const message = STATUS_MESSAGES[order.status];
  if (!message) return null;
  const body = `<p>Hi ${esc(order.customer.name)},</p><p>${esc(message)}</p><p>Order number: <strong>${esc(order.orderNumber)}</strong></p>`;
  return sendMail({
    to: order.customer.email,
    subject: `Update on order ${order.orderNumber}`,
    html: baseWrapper('Order Status Update', body)
  });
}

module.exports = {
  sendOwnerOrderEmail,
  sendCustomerConfirmationEmail,
  sendStatusUpdateEmail
};