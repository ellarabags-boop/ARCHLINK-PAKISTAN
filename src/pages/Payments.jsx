import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const formatPKR = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
export default function Payments() {
  const { token, user } = useAuth();
  const [data, setData] = useState({ payments: [], settlements: [] });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loadingId, setLoadingId] = useState("");
  const load = useCallback(async () => {
    try { const response = await fetch("/api/payments/mine", { headers: { Authorization: `Bearer ${token}` } }); const result = await response.json(); if (!response.ok) throw new Error(result.message || "Unable to load payment records."); setData(result); }
    catch (err) { setError(err.message); }
  }, [token]);
  useEffect(() => { load(); }, [load]);
  const requestSettlement = async (paymentId) => {
    setLoadingId(paymentId); setError(""); setMessage("");
    try { const response = await fetch("/api/payments/settlements", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ paymentId }) }); const result = await response.json(); if (!response.ok) throw new Error(result.message || "Unable to request settlement."); setMessage(result.message); await load(); }
    catch (err) { setError(err.message); }
    finally { setLoadingId(""); }
  };
  const paidPayments = data.payments.filter((payment) => payment.status === "paid");
  const settledIds = new Set(data.settlements.map((item) => String(item.payment?._id || item.payment)));
  return <main className="section"><div className="page-intro"><p className="small-label">PAYMENTS AND SETTLEMENTS</p><h1>{user?.role === "provider" ? "Provider Earnings" : "Payment History"}</h1><p>Review confirmed transactions, platform commission, and settlement status.</p></div>{error && <p className="error-message" role="alert">{error}</p>}{message && <p className="success-message" role="status">{message}</p>}{user?.role === "provider" && <section className="payment-summary-grid"><article><span>Paid service value</span><strong>{formatPKR(paidPayments.reduce((sum, item) => sum + item.grossAmount, 0))}</strong></article><article><span>Platform commission</span><strong>{formatPKR(paidPayments.reduce((sum, item) => sum + item.platformFee, 0))}</strong></article><article><span>Provider share</span><strong>{formatPKR(paidPayments.reduce((sum, item) => sum + item.providerAmount, 0))}</strong></article></section>}<section className="payment-record-list"><h2>Transactions</h2>{data.payments.length === 0 ? <div className="empty-state"><p>No payment transactions found.</p></div> : data.payments.map((payment) => <article className="payment-record" key={payment._id}><div><h3>{payment.serviceRequest?.message ? `Request ${String(payment.serviceRequest._id || payment.serviceRequest).slice(-6)}` : "Service Payment"}</h3><p>Payment status: <strong>{payment.status}</strong></p><p>Service total: {formatPKR(payment.grossAmount)} · Commission ({payment.commissionPercent}%): {formatPKR(payment.platformFee)} · Provider share: {formatPKR(payment.providerAmount)}</p><small>{payment.createdAt ? new Date(payment.createdAt).toLocaleString() : ""}</small></div>{user?.role === "provider" && payment.status === "paid" && payment.serviceRequest?.status === "completed" && !settledIds.has(String(payment._id)) && <button className="primary-btn" disabled={loadingId === payment._id} onClick={() => requestSettlement(payment._id)}>{loadingId === payment._id ? "Submitting..." : "Request Settlement"}</button>}</article>)}</section><section className="payment-record-list"><h2>Settlement Requests</h2>{data.settlements.length === 0 ? <div className="empty-state"><p>No settlement requests yet.</p></div> : data.settlements.map((item) => <article className="payment-record" key={item._id}><div><h3>{formatPKR(item.amount)}</h3><p>Status: <strong>{item.status}</strong></p>{item.transferReference && <p>Transfer reference: {item.transferReference}</p>}<small>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</small></div></article>)}</section><p className="payment-disclaimer">Provider settlements are currently recorded by an administrator after an external bank transfer. A status change in this app does not itself move money.</p></main>;
}
