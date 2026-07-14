import { apiRequest } from "@/lib/queryClient";

export interface HostedCheckoutParams {
  amount: number;
  cropId: string;
  quantity?: number;
  successPath?: string; // e.g. "/customer/dashboard"
  cancelPath?: string;  // e.g. `/product/${cropId}`
}

/**
 * Launch Stripe Hosted Checkout (or compatible hosted page) and redirect the browser.
 * Can be called from anywhere in the app.
 */
export async function openHostedCheckout(params: HostedCheckoutParams) {
  // Dynamically load razorpay script
  await new Promise((resolve, reject) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });

  const resp = await apiRequest("POST", "/api/payments/checkout-session", params);
  const data = await resp.json();
  if (!resp.ok || !data?.id) {
    const message = data?.message || "Failed to create Razorpay order";
    throw new Error(message);
  }

  const options = {
    key: data.key, 
    amount: data.amount,
    currency: data.currency,
    name: "FarmConnect",
    description: `Order for crop ${params.cropId}`,
    order_id: data.id,
    handler: function (response: any) {
      if (params.successPath) {
        window.location.href = params.successPath;
      } else {
        window.location.reload();
      }
    },
    prefill: {
      name: "FarmConnect User",
      email: "user@example.com",
    },
    theme: {
      color: "#8b5cf6"
    }
  };

  // Mock UI trigger if it's a dummy test key to allow E2E UI flow to continue
  if (data.id.startsWith("order_mock_")) {
    console.log("Mocking Razorpay success UI due to test keys");
    setTimeout(() => {
       options.handler({ razorpay_payment_id: "pay_mock_123", razorpay_order_id: data.id, razorpay_signature: "mock_sig" });
    }, 1500);
    return;
  }

  const rzp = new (window as any).Razorpay(options);
  if (params.cancelPath) {
    rzp.on('payment.failed', function () {
       window.location.href = params.cancelPath as string;
    });
  }
  rzp.open();
}
