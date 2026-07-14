import { expect, test } from "@playwright/test";

test("landing page has prototype disclosure", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Hackathon prototype on Solana devnet")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tutela" })).toBeVisible();
});
