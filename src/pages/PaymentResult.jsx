import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PaymentResult() {
  const [params] = useSearchParams();
  const requestId = params.get("requestId");
  const cancelled = params.get("cancelled") === "1";
  const { token } = useAuth();
  const [status, setStatus] = useState(cancelled ? "cancelled" : "checking");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!requestId || !token || cancelled) return undefined;
    let active = true;
    let attempts = 0;
    const check = async () => {
      try {
        const response = await fetch(`/api/payments/status/${requestId}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to confirm payment status.");
        if (!active) return;
        setStatus(data.status || "unpaid");
        if (data.status !== "paid" && attempts++ < 5) setTimeout(check, 2500);
      } catch (err) { if (active) setError(err.message); }
    };
    check();
    return () => { active = false; };
  }, [requestId, token, cancelled]);
  const message = status === "paid" ? "Payment confirmed. Your payment record has been updated." : status === "failed" ? "The payment was not completed. You can retry from My Requests." : status === "cancelled" ? "Checkout was cancelled. No payment confirmation was received." : "Waiting for the payment provider to confirm your transaction...";
  return <main className="section"><div className="empty-state payment-result-card"><p className="small-label">PAYMENT STATUS</p><h1>{status === "paid" ? "Payment Successful" : status === "failed" ? "Payment Failed" : status === "cancelled" ? "Checkout Cancelled" : "Confirming Payment"}</h1><p>{message}</p>{error && <p className="error-message">{error}</p>}<div className="dashboard-actions" style={{ justifyContent: "center", marginTop: 20 }}><Link className="primary-btn button-link" to="/my-requests">Back to My Requests</Link><Link className="secondary-btn button-link" to="/chat-inbox">Open Messages</Link></div></div></main>;
}
