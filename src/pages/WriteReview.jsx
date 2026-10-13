import { useCallback, useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function WriteReview() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [request, setRequest] =
    useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================
  // LOAD REQUEST
  // ==========================================

  const fetchRequest = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/service-requests/client",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load request"
        );
      }

      const foundRequest = data.find(
        (item) =>
          String(item._id) ===
          String(requestId)
      );

      if (!foundRequest) {
        throw new Error(
          "Service request not found"
        );
      }

      setRequest(foundRequest);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, requestId]);

  useEffect(() => {
    if (token) {
      fetchRequest();
    }
  }, [token, fetchRequest]);

  // ==========================================
  // SUBMIT REVIEW
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (comment.trim().length < 10) {
      setError(
        "Review must be at least 10 characters."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestId,
            rating,
            comment:
              comment.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit review"
        );
      }

      setSuccess(
        "Review submitted successfully!"
      );

      setTimeout(() => {
        navigate("/my-requests");
      }, 1200);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="section">
        <p>
          Loading review page...
        </p>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !request) {
    return (
      <main className="section">

        <div className="empty-state">

          <h3>
            Unable to load review
          </h3>

          <p>{error}</p>

          <button
            className="primary-btn"
            onClick={() =>
              navigate("/my-requests")
            }
          >
            Back to My Requests
          </button>

        </div>

      </main>
    );
  }

  return (
    <main className="section">

      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >

        {/* =====================================
            HEADER
        ====================================== */}

        <p className="small-label">
          ARCHLINK REVIEW
        </p>

        <h1>
          Leave a Review
        </h1>

        <p>
          Share your experience with the
          service provider.
        </p>

        {/* =====================================
            SERVICE INFO
        ====================================== */}

        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            background: "#f7f7f7",
            borderRadius: "12px",
          }}
        >

          <h2>
            {request?.service?.title ||
              "Service"}
          </h2>

          <p>
            <strong>
              Provider:
            </strong>{" "}
            {request?.provider?.name ||
              "Not available"}
          </p>

          <p>
            <strong>
              City:
            </strong>{" "}
            {request?.service?.city ||
              "Not available"}
          </p>

        </div>

        {/* =====================================
            REVIEW FORM
        ====================================== */}

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "30px",
            padding: "25px",
            background: "#fff",
            border:
              "1px solid #ddd",
            borderRadius: "12px",
          }}
        >

          {/* RATING */}

          <div>

            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Rating
            </label>

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >

              {[1, 2, 3, 4, 5].map(
                (number) => (

                  <button
                    key={number}
                    type="button"
                    onClick={() =>
                      setRating(number)
                    }
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      cursor: "pointer",
                      fontSize: "32px",
                      opacity:
                        number <= rating
                          ? 1
                          : 0.3,
                    }}
                  >
                    ⭐
                  </button>

                )
              )}

            </div>

            <p>
              Selected rating:{" "}
              <strong>
                {rating}/5
              </strong>
            </p>

          </div>

          {/* COMMENT */}

          <div
            style={{
              marginTop: "25px",
            }}
          >

            <label
              htmlFor="comment"
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Your Review
            </label>

            <textarea
              id="comment"
              value={comment}
              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }
              placeholder="Write your experience about this service provider..."
              rows="6"
              maxLength="1000"
              required
              style={{
                width: "100%",
                padding: "12px",
                border:
                  "1px solid #ccc",
                borderRadius: "8px",
                resize: "vertical",
              }}
            />

            <p
              style={{
                fontSize: "13px",
                color: "#777",
              }}
            >
              Minimum 10 characters.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <p
              className="form-message error-message"
              style={{
                marginTop: "15px",
              }}
            >
              {error}
            </p>
          )}

          {/* SUCCESS */}

          {success && (
            <p
              className="form-message"
              style={{
                marginTop: "15px",
                color: "green",
              }}
            >
              {success}
            </p>
          )}

          {/* BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
            }}
          >

            <button
              type="submit"
              className="primary-btn"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Review"}
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() =>
                navigate(
                  "/my-requests"
                )
              }
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

export default WriteReview;