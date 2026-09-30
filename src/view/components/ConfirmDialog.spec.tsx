import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfirmDialog, type ConfirmDialogProps } from "./ConfirmDialog";
import { userEvent } from "@testing-library/user-event";
const textQueries = {
  confirmLabel: "Apply",
  description: "Are you sure?",
  title: "Confirm your choice",
  cancel: "Cancelar",
  pending: "Aguarde...",
  children: "mockChildren",
} as const;

function makeConfirmDialog(overrides: Partial<ConfirmDialogProps> = {}) {
  return (
    <ConfirmDialog
      confirmLabel={textQueries.confirmLabel}
      description={textQueries.description}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={overrides.open ?? true}
      title={textQueries.title}
      confirmDisabled={overrides.confirmDisabled ?? false}
      confirmVariant="default"
      isPending={overrides.isPending ?? false}
      children={overrides.children}
    />
  );
}

function MockChildren() {
  return <h1>{textQueries.children}</h1>;
}

const onConfirm = vi.fn();
const onOpenChange = vi.fn();

describe("ConfirmDialog", () => {
  it("should render Confirm Dialog correctly", () => {
    render(makeConfirmDialog());

    expect(screen.queryByText(textQueries.confirmLabel)).toBeInTheDocument();
    expect(screen.queryByText(textQueries.description)).toBeInTheDocument();
    expect(screen.queryByText(textQueries.title)).toBeInTheDocument();
    expect(screen.queryByText(textQueries.cancel)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: textQueries.cancel }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: textQueries.confirmLabel }),
    ).toBeEnabled();
  });
  it("Should disable buttons when isPending is true", () => {
    render(makeConfirmDialog({ isPending: true }));
    expect(
      screen.getByRole("button", { name: textQueries.cancel }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: textQueries.pending }),
    ).toBeDisabled();
  });
  it("Should no render when open is false", () => {
    render(makeConfirmDialog({ open: false }));
    expect(screen.queryByText(textQueries.confirmLabel)).toBeNull();
    expect(screen.queryByText(textQueries.description)).toBeNull();
    expect(screen.queryByText(textQueries.title)).toBeNull();
    expect(screen.queryByText(textQueries.cancel)).toBeNull();
  });
  it("Should call onConfirm when user click at confirm button", async () => {
    const events = userEvent.setup();
    render(makeConfirmDialog());
    await events.click(screen.getByText(textQueries.confirmLabel));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
  it("Should call onOpenChange when user try to close the component", async () => {
    const events = userEvent.setup();
    render(makeConfirmDialog());
    await events.click(screen.getByText(textQueries.cancel));

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: "close-press" }),
    );
  });
  it("Should call onOpenChange when user use escape key", async () => {
    const events = userEvent.setup();
    render(makeConfirmDialog());
    await events.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: "escape-key" }),
    );
  });
  it("Should disable confirm button when confirmDisabled is true", async () => {
    const events = userEvent.setup();
    render(makeConfirmDialog({ confirmDisabled: true }));
    await events.click(screen.getByText(textQueries.confirmLabel));

    expect(screen.getByText(textQueries.confirmLabel)).toBeDisabled();
    expect(onConfirm).toHaveBeenCalledTimes(0);
  });
  it("Should don't call onConfirm when isPeding is true", async () => {
    const events = userEvent.setup();
    render(makeConfirmDialog({ isPending: true }));
    await events.click(screen.getByText(textQueries.pending));

    expect(screen.getByText(textQueries.pending)).toBeDisabled();
    expect(onConfirm).toHaveBeenCalledTimes(0);
  });
  it("Should render children correctly", () => {
    render(makeConfirmDialog({ children: <MockChildren /> }));
    expect(screen.getByText(textQueries.children)).toBeInTheDocument();
  });
});
