import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Services from "./pages/Services";
import Providers from "./pages/Providers";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ServiceDetails from "./pages/ServiceDetails";
import ProviderDashboard from "./pages/ProviderDashboard";
import AddService from "./pages/AddService";
import EditService from "./pages/EditService";
import MyRequests from "./pages/myrequests";
import ProviderProfile from "./pages/ProviderProfile";
import AddPortfolio from "./pages/AddPortfolio";
import PortfolioDetails from "./pages/PortfolioDetails";
import WriteReview from "./pages/WriteReview";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import ProviderVerification from "./pages/ProviderVerification";
import Meetings from "./pages/Meetings";
import Chat, { ChatInbox } from "./pages/Chat";
import Payments from "./pages/Payments";
import PaymentResult from "./pages/PaymentResult";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/providers/:id" element={<ProviderProfile />} />
        <Route path="/portfolio/:id" element={<PortfolioDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/provider-dashboard" element={<ProtectedRoute role="provider"><ProviderDashboard /></ProtectedRoute>} />
        <Route path="/provider-verification" element={<ProtectedRoute role="provider"><ProviderVerification /></ProtectedRoute>} />
        <Route path="/add-service" element={<ProtectedRoute role="provider"><AddService /></ProtectedRoute>} />
        <Route path="/edit-service/:id" element={<ProtectedRoute role="provider"><EditService /></ProtectedRoute>} />
        <Route path="/add-portfolio" element={<ProtectedRoute role="provider"><AddPortfolio /></ProtectedRoute>} />
        <Route path="/my-requests" element={<ProtectedRoute role="client"><MyRequests /></ProtectedRoute>} />
        <Route path="/write-review/:requestId" element={<ProtectedRoute role="client"><WriteReview /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
        <Route path="/chat-inbox" element={<ProtectedRoute><ChatInbox /></ProtectedRoute>} />
        <Route path="/chat/:requestId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
        <Route path="/payment-result" element={<ProtectedRoute role="client"><PaymentResult /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
