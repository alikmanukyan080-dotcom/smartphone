const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(
      '[emailService] SMTP is not fully configured. Emails will be logged to console instead of sent.'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

async function sendMail({ to, subject, html }) {
  const t = getTransporter();
  const from = `"${process.env.STORE_NAME || 'Nova Mobile'}" <${process.env.SMTP_USER || 'no-reply@example.com'}>`;

  if (!t) {
    console.log('----- EMAIL (SMTP not configured, printed instead) -----');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    console.log('----------------------------------------------------------');
    return { simulated: true };
  }

  return t.sendMail({ from, to, subject, html });
}

function itemsRowsHtml(items) {
  return items
    .map(
      (it) => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #EAEAEA;">${it.title}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #EAEAEA;">${it.color || '-'}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #EAEAEA;">${it.storage || '-'}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #EAEAEA;text-align:center;">${it.quantity}</td>
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
        <span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.5px;">NOVA MOBILE</span>
      </div>
      <div style="padding:32px;color:#1A1D21;">
        <h2 style="margin-top:0;color:#0E1013;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="background:#F5F4F1;padding:20px 32px;color:#6B7280;font-size:12px;">
        Nova Mobile · Premium Smartphones · Official Warranty on all devices
      </div>
    </div>
  </div>`;
}

async function sendOwnerOrderEmail(order) {
  const body = `
    <p><strong>Order #${order.orderNumber}</strong> was just placed.</p>
    <h3>Customer</h3>
    <p>${order.customer.name}<br/>${order.customer.phone}<br/>${order.customer.email}</p>
    <h3>Delivery</h3>
    <p>${order.delivery.address}, ${order.delivery.city}<br/>
    ${order.delivery.date || ''} ${order.delivery.time || ''}</p>
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
    ${order.comment ? `<p><strong>Customer comment:</strong> ${order.comment}</p>` : ''}
  `;
  return sendMail({
    to: process.env.STORE_EMAIL || process.env.SMTP_USER,
    subject: `New order ${order.orderNumber}`,
    html: baseWrapper('New Order Received', body)
  });
}

async function sendCustomerConfirmationEmail(order) {
  const body = `
    <p>Hi ${order.customer.name},</p>
    <p>Thank you for your order! Your order number is <strong>${order.orderNumber}</strong>.</p>
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
  const body = `<p>Hi ${order.customer.name},</p><p>${message}</p><p>Order number: <strong>${order.orderNumber}</strong></p>`;
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
