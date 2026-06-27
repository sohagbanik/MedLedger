import React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { describe, it, expect, vi } from "vitest";

const ProblemChild = () => {
  throw new Error("Test error!");
};

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>All good here</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("All good here")).toBeInTheDocument();
  });

  it("catches error and displays fallback UI", () => {
    // Suppress console.error for the intentional throw
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error!")).toBeInTheDocument();

    spy.mockRestore();
  });

  it("renders custom fallback if provided", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Custom fallback UI</div>}>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom fallback UI")).toBeInTheDocument();

    spy.mockRestore();
  });
});
