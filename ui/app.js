const baseUrl = "http://localhost:3000";

const productFields = {
  id: document.querySelector("#productId"),
  name: document.querySelector("#productName"),
  price: document.querySelector("#productPrice"),
  qty: document.querySelector("#productQty")
};

const productsContainer = document.querySelector("#products");

const analyticsFields = {
  start: document.querySelector("#analyticsStart"),
  end: document.querySelector("#analyticsEnd"),
  limit: document.querySelector("#analyticsLimit")
};
const chartCanvas = document.querySelector("#trendChart");
const chartCtx = chartCanvas.getContext("2d");
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
});

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
};

const apiUrl = (path) => {
  return `${baseUrl}${path}`;
};

const pretty = (data) => JSON.stringify(data, null, 2);

const request = async (path, options = {}) => {
  const response = await fetch(apiUrl(path), {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const drawBarChart = (labels, values, options = {}) => {
  const width = chartCanvas.width;
  const height = chartCanvas.height;
  const padding = 32;
  const maxValue = Math.max(...values, 1);
  const title = options.title || "";
  const xLabel = options.xLabel || "";
  const yLabel = options.yLabel || "";

  chartCtx.clearRect(0, 0, width, height);
  chartCtx.fillStyle = "#ffffff";
  chartCtx.fillRect(0, 0, width, height);

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2 - 24;
  const barWidth = chartWidth / labels.length;

  const bottom = height - padding;
  const left = padding;
  const top = padding + 16;

  chartCtx.strokeStyle = "#e5e7eb";
  chartCtx.beginPath();
  chartCtx.moveTo(left, top);
  chartCtx.lineTo(left, bottom);
  chartCtx.lineTo(width - padding, bottom);
  chartCtx.stroke();

  // Y-axis ticks
  chartCtx.fillStyle = "#6b7280";
  chartCtx.font = "10px Segoe UI, sans-serif";
  chartCtx.textAlign = "right";
  chartCtx.textBaseline = "middle";
  const ticks = 4;
  const step = Math.max(1, Math.ceil(maxValue / ticks));
  const yAxisMax = step * ticks;
  for (let i = 0; i <= ticks; i += 1) {
    const value = step * i;
    const y = bottom - (chartHeight / ticks) * i;
    chartCtx.strokeStyle = "#f3f4f6";
    chartCtx.beginPath();
    chartCtx.moveTo(left, y);
    chartCtx.lineTo(width - padding, y);
    chartCtx.stroke();
    chartCtx.fillText(String(value), left - 6, y);
  }

  values.forEach((value, index) => {
    const barHeight = (value / yAxisMax) * chartHeight;
    const innerWidth = Math.max(barWidth - 16, 6);
    const x = left + index * barWidth + (barWidth - innerWidth) / 2;
    const y = bottom - barHeight;

    chartCtx.fillStyle = "#2563eb";
    chartCtx.fillRect(x, y, innerWidth, barHeight);
  });

  // X labels
  chartCtx.fillStyle = "#6b7280";
  chartCtx.textAlign = "center";
  chartCtx.textBaseline = "top";
  labels.forEach((label, index) => {
    const x = left + index * barWidth + barWidth / 2;
    chartCtx.fillText(label, x, bottom + 10);
  });

  // Title and axis labels
  chartCtx.fillStyle = "#111827";
  chartCtx.font = "12px Segoe UI, sans-serif";
  chartCtx.textAlign = "center";
  chartCtx.textBaseline = "bottom";
  if (title) chartCtx.fillText(title, left + chartWidth / 2, padding - 6);
  chartCtx.textBaseline = "top";
  if (xLabel) chartCtx.fillText(xLabel, left + chartWidth / 2, height - padding + 6);
  if (yLabel) {
    chartCtx.save();
    chartCtx.translate(left - 24, top + chartHeight / 2);
    chartCtx.rotate(-Math.PI / 2);
    chartCtx.textAlign = "center";
    chartCtx.textBaseline = "top";
    chartCtx.fillText(yLabel, 0, 0);
    chartCtx.restore();
  }
};

const renderTrendChart = (rows, labelKey, valueKey, options) => {
  if (!rows || rows.length === 0) {
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    return;
  }
  const labels = rows.map((row) => row[labelKey]);
  const values = rows.map((row) => row[valueKey] || 0);
  let start = null;
  const duration = 500;

  const animate = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const scaled = values.map((value) => value * progress);
    drawBarChart(labels, scaled, options);
    if (progress < 1) requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};

const renderProducts = (products) => {
  productsContainer.innerHTML = "";

  if (!products || products.length === 0) {
    productsContainer.innerHTML = "<p class=\"muted\">No products yet.</p>";
    return;
  }

  products.forEach((product) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <span>${product.productId}</span>
      <span>${product.name}</span>
      <span>${currency.format(product.price)}</span>
      <span>${product.inventory?.quantity ?? 0}</span>
      <span>${currency.format(product.price * (product.inventory?.quantity ?? 0))}</span>
      <button class="btn ghost" data-id="${product.productId}">Use</button>
    `;
    row.querySelector("button").addEventListener("click", () => {
      productFields.id.value = product.productId;
      productFields.name.value = product.name;
      productFields.price.value = product.price;
      productFields.qty.value = product.inventory?.quantity ?? 0;
    });
    productsContainer.appendChild(row);
  });
};

const loadProducts = async () => {
  try {
    const products = await request("/api/products");
    renderProducts(products);
  } catch (error) {
    productsContainer.innerHTML = `<p class=\"muted\">${error.message}</p>`;
  }
};

const productPayload = () => {
  const productId = productFields.id.value.trim();
  const name = productFields.name.value.trim();

  return {
    productId,
    name,
    price: toNumber(productFields.price.value) || 0,
    inventory: {
      quantity: toNumber(productFields.qty.value) || 0
    }
  };
};

const clearProductForm = () => {
  productFields.id.value = "";
  productFields.name.value = "";
  productFields.price.value = "";
  productFields.qty.value = "";
};

const createProduct = async () => {
  const payload = productPayload();
  const product = await request("/api/products", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  clearProductForm();
  await loadProducts();
};

const updateProduct = async () => {
  if (!productFields.id.value) return;
  const payload = productPayload();
  await request(`/api/products/${productFields.id.value}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  clearProductForm();
  await loadProducts();
};

const deleteProduct = async () => {
  if (!productFields.id.value) return;
  await request(`/api/products/${productFields.id.value}`, { method: "DELETE" });
  clearProductForm();
  await loadProducts();
};


const analyticsQuery = () => {
  const params = new URLSearchParams();
  if (analyticsFields.start.value) params.set("start", analyticsFields.start.value);
  if (analyticsFields.end.value) params.set("end", analyticsFields.end.value);
  return params.toString();
};

const salesByDay = async () => {
  const query = analyticsQuery();
  const data = await request(`/api/analytics/sales-by-day${query ? `?${query}` : ""}`);
  renderTrendChart(
    data.map((row) => ({ label: row._id, value: row.totalQuantity })),
    "label",
    "value",
    {
      title: "Products Sold by Day",
      xLabel: "Date",
      yLabel: "Qty"
    }
  );
};

const topProducts = async () => {
  const limit = analyticsFields.limit.value || 10;
  const data = await request(`/api/analytics/top-products?limit=${limit}`);
  renderTrendChart(
    data.map((row) => ({ label: row.name, value: row.totalValue })),
    "label",
    "value",
    {
      title: "Top Sales till Date",
      xLabel: "Product",
      yLabel: "INR"
    }
  );
};

const revenueTrend = async () => {
  const data = await request("/api/analytics/revenue-trend");
  renderTrendChart(
    data.map((row) => ({
      label: `${row._id.year}-${String(row._id.month).padStart(2, "0")}`,
      value: row.totalValue
    })),
    "label",
    "value",
    {
      title: "Sales per Month",
      xLabel: "Month",
      yLabel: "INR"
    }
  );
};

document.querySelector("#createProduct").addEventListener("click", createProduct);
document.querySelector("#updateProduct").addEventListener("click", updateProduct);
document.querySelector("#deleteProduct").addEventListener("click", deleteProduct);
document.querySelector("#salesByDay").addEventListener("click", salesByDay);
document.querySelector("#topProducts").addEventListener("click", topProducts);
document.querySelector("#revenueTrend").addEventListener("click", revenueTrend);
loadProducts();
