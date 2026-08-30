import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { InstallationProgress } from "@openbible/engine-core";

const toastMocks = vi.hoisted(() => ({
  custom: vi.fn((..._args: unknown[]) => "download-toast"),
}));

vi.mock("sonner", () => ({ toast: toastMocks }));

import {
  DownloadToast,
  showDownloadError,
  showDownloadProgress,
  showDownloadStart,
  showDownloadSuccess,
} from "@/components/ui/download-toast";

const receivingProgress: InstallationProgress = {
  versionId: "ara",
  stage: "receiving",
  receivedBytes: 50,
  totalBytes: 100,
};

afterEach(() => {
  cleanup();
  toastMocks.custom.mockClear();
});

// SPECSFY: US-001 FR-001 NFR-003 AC-001 AC-008
describe("feedback Sonner de download", () => {
  it("exibe percentual somente quando o total está disponível", () => {
    render(<DownloadToast name="ARA" progress={receivingProgress} />);

    expect(screen.getByRole("progressbar", { name: "Progresso do download de ARA" })).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByText("50%")).toBeInTheDocument();

    cleanup();
    render(<DownloadToast name="ARA" progress={{ ...receivingProgress, totalBytes: undefined, receivedBytes: 128 }} />);

    expect(screen.getByText("128 bytes recebidos")).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("cria, atualiza e finaliza o mesmo toast da instalação", () => {
    const toastId = showDownloadStart("ARA");
    showDownloadProgress(toastId, "ARA", receivingProgress);
    showDownloadSuccess(toastId, "ARA");
    showDownloadError(toastId, "ARA");

    expect(toastMocks.custom).toHaveBeenCalledTimes(4);
    expect(toastMocks.custom.mock.calls[1]?.[1]).toMatchObject({ id: toastId, duration: Infinity });
    expect(toastMocks.custom.mock.calls[2]?.[1]).toMatchObject({ id: toastId });
    expect(toastMocks.custom.mock.calls[3]?.[1]).toMatchObject({ id: toastId });
  });
});
