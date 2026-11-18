import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApplicationInput } from "../types/career";

const mocks = vi.hoisted(() => ({
  insert: vi.fn(), select: vi.fn(), single: vi.fn(), invoke: vi.fn(), from: vi.fn(),
}));
vi.mock("../lib/supabase", () => ({
  supabase: { from: mocks.from, functions: { invoke: mocks.invoke } },
}));
import { createApplication, sendApplicationNotification } from "./careerService";

describe("application notification", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.from.mockReturnValue({ insert: mocks.insert });
    mocks.insert.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ single: mocks.single });
    mocks.single.mockResolvedValue({ data: { id: "saved-application" }, error: null });
  });

  it("notifies only after the application has been saved", async () => {
    mocks.invoke.mockResolvedValue({ data: { notification_sent: true }, error: null });
    expect(await createApplication({} as ApplicationInput)).toEqual({ id: "saved-application", notificationSent: true });
    expect(mocks.invoke).toHaveBeenCalledWith("send-application-notification", { body: { application_id: "saved-application" } });
  });

  it("does not notify when saving fails", async () => {
    mocks.single.mockResolvedValue({ data: null, error: new Error("duplicate") });
    await expect(createApplication({} as ApplicationInput)).rejects.toThrow("duplicate");
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it("keeps the saved application when notification fails", async () => {
    mocks.invoke.mockRejectedValue(new Error("network error"));
    expect(await createApplication({} as ApplicationInput)).toEqual({ id: "saved-application", notificationSent: false });
    expect(mocks.insert).toHaveBeenCalledTimes(1);
  });

  it("retries only the notification without creating another application", async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: new Error("delivery failed") });
    expect(await sendApplicationNotification("saved-application")).toBe(false);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
