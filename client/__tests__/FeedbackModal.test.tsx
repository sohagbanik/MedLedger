import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedbackModal from "../components/FeedbackModal";
import { describe, it, expect, vi } from "vitest";

describe("FeedbackModal", () => {
  it("does not render when isOpen is false", () => {
    render(<FeedbackModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText("We Value Your Feedback")).toBeNull();
  });

  it("renders correctly when isOpen is true", () => {
    render(<FeedbackModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("We Value Your Feedback")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const handleClose = vi.fn();
    render(<FeedbackModal isOpen={true} onClose={handleClose} />);
    fireEvent.click(screen.getByTestId("close-modal"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("disables the submit button if rating or feedback is missing", () => {
    render(<FeedbackModal isOpen={true} onClose={() => {}} />);
    const submitBtn = screen.getByText("Submit Feedback");
    expect(submitBtn).toBeDisabled();
  });

  it("submits the form successfully and resets", async () => {
    const handleClose = vi.fn();
    render(<FeedbackModal isOpen={true} onClose={handleClose} />);
    
    // Select rating
    fireEvent.click(screen.getByTestId("star-4"));
    
    // Enter feedback
    const input = screen.getByPlaceholderText(/Tell us what you love/i);
    await userEvent.type(input, "Great app!");
    
    const submitBtn = screen.getByRole("button", { name: "Submit Feedback" });
    expect(submitBtn).not.toBeDisabled();
    
    // Submit
    fireEvent.click(submitBtn);
    expect(screen.getByText("Submitting...")).toBeInTheDocument();
    
    // Wait for success screen
    await waitFor(() => {
      expect(screen.getByText("Thank You!")).toBeInTheDocument();
    }, { timeout: 1500 });
    
    // Wait for auto-close
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    }, { timeout: 2500 });
  });
});
