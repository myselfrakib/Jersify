/**
 * Shiprocket Integration Utility for Jersify Admin Panel
 * Handles Authentication, Courier Serviceability, Shipment & AWB Generation,
 * Pickup Scheduling, Shipment Cancellation, and Integration Health Checks.
 */

const DEFAULT_CREDENTIALS = {
  email: 'sekhrakib002@gmail.com',
  password: 'TJGR0G^7rU0ae$T3y*e9QubVEED73$Ps'
};

const BASE_DIRECT_URL = 'https://apiv2.shiprocket.in';
const BASE_PROXY_URL = '/api/shiprocket';

// Retrieve credentials (from siteConfig in RTDB / localStorage or defaults)
export function getShiprocketCredentials() {
  try {
    const saved = localStorage.getItem('jersify_shiprocket_creds');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email && parsed.password) return parsed;
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_CREDENTIALS;
}

export function saveShiprocketCredentials(creds) {
  if (creds && creds.email && creds.password) {
    localStorage.setItem('jersify_shiprocket_creds', JSON.stringify(creds));
  }
}

/**
 * Obtain Shiprocket JWT Token (with caching & automatic fallback between Direct & Proxy)
 */
export async function getShiprocketToken(forceRefresh = false) {
  const cachedToken = sessionStorage.getItem('shiprocket_jwt_token');
  const tokenExpires = Number(sessionStorage.getItem('shiprocket_token_expires') || '0');

  if (!forceRefresh && cachedToken && Date.now() < tokenExpires) {
    return cachedToken;
  }

  const creds = getShiprocketCredentials();

  // Try direct URL first, fallback to proxy if CORS / network failure
  const endpoints = [
    `${BASE_DIRECT_URL}/v1/external/auth/login`,
    `${BASE_PROXY_URL}/v1/external/auth/login`
  ];

  let lastError = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: creds.email.trim(),
          password: creds.password.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        // Cache token for 7 days
        sessionStorage.setItem('shiprocket_jwt_token', data.token);
        sessionStorage.setItem('shiprocket_token_expires', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
        return data.token;
      } else {
        throw new Error(data.message || 'Shiprocket authentication failed');
      }
    } catch (err) {
      lastError = err;
      // If direct failed (e.g. CORS), try the proxy in the loop
    }
  }

  throw lastError || new Error('Could not connect to Shiprocket API');
}

/**
 * Universal Shiprocket API requester with Bearer token & automatic retry
 */
export async function shiprocketRequest(path, options = {}) {
  const token = await getShiprocketToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const urls = [
    `${BASE_DIRECT_URL}${cleanPath}`,
    `${BASE_PROXY_URL}${cleanPath}`
  ];

  let lastError = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        ...options,
        headers
      });

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { body: text };
        }
      }

      // If token expired, clear cache
      if (res.status === 401) {
        sessionStorage.removeItem('shiprocket_jwt_token');
        sessionStorage.removeItem('shiprocket_token_expires');
        throw new Error(data?.message || 'Shiprocket session expired. Please retry.');
      }

      if (!res.ok) {
        const errMsg = data?.message || data?.errors || (typeof data === 'string' ? data : `API Error ${res.status}`);
        const err = new Error(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg);
        err.status = res.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (err) {
      lastError = err;
      // Try next URL fallback
    }
  }

  throw lastError;
}

/**
 * Retrieve registered Pickup Locations on Shiprocket
 */
export async function getPickupLocations() {
  const res = await shiprocketRequest('/v1/external/settings/company/pickup', { method: 'GET' });
  const addresses = res?.data?.shipping_address || [];
  return {
    addresses,
    companyName: res?.data?.company_name || 'jersify',
    defaultLocation: addresses[0]?.pickup_location || 'warehouse',
    defaultPincode: addresses[0]?.pin_code || '700136'
  };
}

/**
 * Check Courier Serviceability for a delivery address
 */
export async function checkCourierServiceability({
  pickupPostcode,
  deliveryPostcode,
  weight = 0.5,
  cod = 0
}) {
  if (!pickupPostcode || !deliveryPostcode) {
    throw new Error('Both pickup pincode and delivery pincode are required.');
  }

  const cleanPickup = String(pickupPostcode).trim();
  const cleanDelivery = String(deliveryPostcode).trim();

  const query = new URLSearchParams({
    pickup_postcode: cleanPickup,
    delivery_postcode: cleanDelivery,
    weight: String(weight || 0.5),
    cod: String(cod ? 1 : 0)
  });

  const res = await shiprocketRequest(`/v1/external/courier/serviceability?${query.toString()}`, {
    method: 'GET'
  });

  const couriers = res?.data?.available_courier_companies || [];
  return couriers.map(c => ({
    id: c.courier_company_id,
    courier_company_id: c.courier_company_id,
    name: c.courier_name,
    rate: Number(c.rate || 0),
    etd: c.etd || 'N/A',
    estimated_delivery_days: c.estimated_delivery_days || '3-5',
    rating: c.rating || '4.0',
    minWeight: c.min_weight || 0.5,
    cod: c.cod === 1,
    callCourier: c.call_courier || false,
    raw: c
  }));
}

/**
 * Parse and clean order address fields for Shiprocket compatibility
 */
export function sanitizeOrderDetails(order) {
  // Extract 6-digit Indian PIN code
  let pincode = order.pincode || '';
  if (!pincode && order.address) {
    const pinMatch = String(order.address).match(/\b[1-9][0-9]{5}\b/);
    if (pinMatch) pincode = pinMatch[0];
  }
  pincode = String(pincode || '').trim();

  // Names
  const fullName = (order.customerName || 'Customer').trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || '.';

  // Phone (10 digits)
  let phone = String(order.phone || '').replace(/\D/g, '');
  if (phone.length > 10 && phone.startsWith('91')) {
    phone = phone.slice(2);
  }
  if (phone.length < 10) {
    phone = '9999999999'; // fallback standard placeholder if missing
  }

  // Address
  let address = (order.address || 'Delivery Address').replace(/[\r\n]+/g, ', ').trim();
  if (address.length < 10) {
    address = `${address}, India`;
  }
  // Shiprocket max address length is 100 characters per field
  const address1 = address.slice(0, 95);
  const address2 = address.length > 95 ? address.slice(95, 190) : '';

  // City & State
  const city = (order.city || 'City').trim();
  const state = (order.state || 'State').trim();

  // Items
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map((item, idx) => ({
        name: (item.name || item.title || `Kit #${idx + 1}`).slice(0, 50),
        sku: (item.id || item.productId || `SKU-${idx + 1}`).slice(0, 30),
        units: Math.max(1, Number(item.quantity || item.qty || 1)),
        selling_price: Number(item.price || 0),
        discount: 0,
        tax: 0
      }))
    : [{
        name: (order.productName || order.title || 'Football Jersey Kit').slice(0, 50),
        sku: `SKU-${order.orderId || order.id || Date.now()}`,
        units: 1,
        selling_price: Number(order.total || 0),
        discount: 0,
        tax: 0
      }];

  const paymentMethod = (String(order.paymentMethod || '').toLowerCase() === 'cod') ? 'COD' : 'Prepaid';
  const subTotal = Number(order.total || items.reduce((sum, i) => sum + (i.units * i.selling_price), 0));

  // Date format: YYYY-MM-DD HH:mm
  let orderDate = '';
  try {
    const d = order.createdAt ? new Date(order.createdAt) : new Date();
    const pad = n => String(n).padStart(2, '0');
    orderDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    const now = new Date();
    orderDate = `${now.getFullYear()}-01-01 12:00`;
  }

  return {
    orderId: String(order.orderId || order.id || `JRS-${Date.now()}`),
    orderDate,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    pincode,
    phone,
    email: order.email || order.userEmail || 'customer@jersify.com',
    paymentMethod,
    subTotal,
    items
  };
}

/**
 * Create Shipment on Shiprocket and Assign Selected Courier (AWB Generation)
 */
export async function createShipmentAndAssignCourier({
  order,
  selectedCourier,
  pickupLocation = 'warehouse',
  weight = 0.5,
  length = 10,
  breadth = 10,
  height = 5
}) {
  if (!selectedCourier) {
    throw new Error('Please select a courier company from the list to create the shipment.');
  }

  const sanitized = sanitizeOrderDetails(order);

  // 1. Create Adhoc Order on Shiprocket
  const orderPayload = {
    order_id: sanitized.orderId,
    order_date: sanitized.orderDate,
    pickup_location: pickupLocation,
    channel_id: '',
    comment: 'Jersify Football Jersey Order',
    billing_customer_name: sanitized.firstName,
    billing_last_name: sanitized.lastName,
    billing_address: sanitized.address1,
    billing_address_2: sanitized.address2,
    billing_city: sanitized.city,
    billing_pincode: sanitized.pincode,
    billing_state: sanitized.state,
    billing_country: 'India',
    billing_email: sanitized.email,
    billing_phone: sanitized.phone,
    shipping_is_billing: true,
    order_items: sanitized.items,
    payment_method: sanitized.paymentMethod,
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: sanitized.subTotal,
    length: Number(length || 10),
    breadth: Number(breadth || 10),
    height: Number(height || 5),
    weight: Number(weight || 0.5)
  };

  const createRes = await shiprocketRequest('/v1/external/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify(orderPayload)
  });

  const srOrderId = createRes.order_id;
  const srShipmentId = createRes.shipment_id;

  if (!srShipmentId) {
    throw new Error(createRes.message || 'Shiprocket did not return a shipment ID.');
  }

  // 2. Assign Courier & Generate AWB
  const courierCompanyId = selectedCourier.courier_company_id || selectedCourier.id;
  const assignPayload = {
    shipment_id: srShipmentId,
    courier_id: courierCompanyId
  };

  let awbCode = '';
  let courierName = selectedCourier.name || selectedCourier.courier_name || 'Courier';
  let assignData = null;

  try {
    const awbRes = await shiprocketRequest('/v1/external/courier/assign/awb', {
      method: 'POST',
      body: JSON.stringify(assignPayload)
    });
    assignData = awbRes?.response?.data;
    awbCode = assignData?.awb_code || '';
    if (assignData?.courier_name) {
      courierName = assignData.courier_name;
    }
  } catch (awbErr) {
    console.warn('Courier AWB assignment returned warning:', awbErr);
    // Proceed with order/shipment created even if AWB generation requires a moment
  }

  // 3. Generate Label (Best Effort)
  let labelUrl = '';
  try {
    const labelRes = await shiprocketRequest('/v1/external/courier/generate/label', {
      method: 'POST',
      body: JSON.stringify({ shipment_id: [srShipmentId] })
    });
    if (labelRes?.label_created && labelRes?.label_url) {
      labelUrl = labelRes.label_url;
    }
  } catch (labelErr) {
    console.warn('Label generation info:', labelErr);
  }

  return {
    success: true,
    srOrderId: String(srOrderId),
    srShipmentId: String(srShipmentId),
    srAwb: awbCode || '',
    srCourier: courierName,
    srCourierCompanyId: courierCompanyId,
    srShippingRate: Number(selectedCourier.rate || 0),
    srPickupLocation: pickupLocation,
    srPickupScheduled: false,
    srPickupDate: '',
    srCancelled: false,
    labelUrl: labelUrl || '',
    createdAt: new Date().toISOString()
  };
}

/**
 * Schedule Pickup Date for Created Shipment
 */
export async function scheduleShipmentPickup({ shipmentId, pickupDate }) {
  if (!shipmentId) throw new Error('Shipment ID is required to schedule pickup.');
  if (!pickupDate) throw new Error('Please select a pickup date.');

  const payload = {
    shipment_id: [Number(shipmentId) || shipmentId],
    pickup_date: [String(pickupDate)]
  };

  const res = await shiprocketRequest('/v1/external/courier/generate/pickup', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return {
    success: true,
    pickupDate: pickupDate,
    response: res?.response || res
  };
}

/**
 * Cancel Shipment on Shiprocket (Without cancelling the customer order)
 */
export async function cancelShiprocketShipment({ awbCode, orderId, shipmentId }) {
  let cancelledOnSr = false;
  let message = 'Shipment marked as cancelled.';

  // 1. Try cancelling by AWB first
  if (awbCode && String(awbCode).trim()) {
    try {
      const res = await shiprocketRequest('/v1/external/orders/cancel/shipment/awbs', {
        method: 'POST',
        body: JSON.stringify({ awbs: [String(awbCode).trim()] })
      });
      cancelledOnSr = true;
      message = res.message || 'Shiprocket AWB cancelled successfully.';
    } catch (e) {
      console.warn('Cancel by AWB attempt:', e);
    }
  }

  // 2. Try cancelling by order ID if not cancelled yet
  if (!cancelledOnSr && orderId) {
    try {
      const res = await shiprocketRequest('/v1/external/orders/cancel', {
        method: 'POST',
        body: JSON.stringify({ ids: [orderId] })
      });
      cancelledOnSr = true;
      message = res.message || 'Shiprocket order cancelled successfully.';
    } catch (e) {
      console.warn('Cancel by order ID attempt:', e);
    }
  }

  return {
    success: true,
    cancelledOnSr,
    message
  };
}

/**
 * Check Integration Health and Account Info
 */
export async function checkShiprocketHealth() {
  const creds = getShiprocketCredentials();
  const startTime = Date.now();

  try {
    const token = await getShiprocketToken(true);
    const latency = Date.now() - startTime;

    // Fetch pickup locations
    let pickupData = null;
    try {
      pickupData = await getPickupLocations();
    } catch (e) {
      console.warn('Could not fetch pickup locations:', e);
    }

    // Fetch channels
    let channels = [];
    try {
      const chRes = await shiprocketRequest('/v1/external/channels', { method: 'GET' });
      channels = chRes?.data || [];
    } catch (e) {
      console.warn('Could not fetch channels:', e);
    }

    // Fetch recent orders
    let recentOrders = [];
    try {
      const ordRes = await shiprocketRequest('/v1/external/orders?per_page=10', { method: 'GET' });
      recentOrders = ordRes?.data || [];
    } catch (e) {
      console.warn('Could not fetch recent orders:', e);
    }

    return {
      connected: true,
      email: creds.email,
      tokenSnippet: token ? `${token.substring(0, 16)}...` : 'N/A',
      latencyMs: latency,
      companyName: pickupData?.companyName || 'jersify',
      pickupLocations: pickupData?.addresses || [],
      channels,
      recentOrders,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      connected: false,
      email: creds.email,
      error: error.message || 'Authentication or network error',
      checkedAt: new Date().toISOString()
    };
  }
}
