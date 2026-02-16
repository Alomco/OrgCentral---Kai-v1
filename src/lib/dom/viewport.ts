const DEFAULT_VIEWPORT_WIDTH = 1024

export function getViewportWidth(): number {
  if (typeof window === "undefined") {
    return DEFAULT_VIEWPORT_WIDTH
  }

  const visualViewportWidth = window.visualViewport?.width
  if (typeof visualViewportWidth === "number" && Number.isFinite(visualViewportWidth)) {
    return visualViewportWidth
  }

  if (typeof window.innerWidth === "number" && Number.isFinite(window.innerWidth)) {
    return window.innerWidth
  }

  return DEFAULT_VIEWPORT_WIDTH
}

export function isMobileViewport(breakpoint: number): boolean {
  return getViewportWidth() < breakpoint
}
