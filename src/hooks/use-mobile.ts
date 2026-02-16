import * as React from "react"

import { isMobileViewport } from "@/lib/dom/viewport"

const MOBILE_BREAKPOINT = 768

type MediaQueryChangeHandler = (this: MediaQueryList, event: MediaQueryListEvent) => void

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (callback: MediaQueryChangeHandler | null) => void
  removeListener?: (callback: MediaQueryChangeHandler | null) => void
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() =>
    typeof window === "undefined" ? false : isMobileViewport(MOBILE_BREAKPOINT)
  )

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return undefined
    }

    const updateMobileState = () => {
      setIsMobile(isMobileViewport(MOBILE_BREAKPOINT))
    }

    // Set initial state before attaching listeners so unsupported APIs
    // (older iOS Safari) cannot block mobile detection.
    updateMobileState()

    const mediaQuery = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    const mql = typeof window.matchMedia === "function" ? window.matchMedia(mediaQuery) : null
    const onChange: MediaQueryChangeHandler = () => {
      updateMobileState()
    }

    if (mql && typeof mql.addEventListener === "function") {
      try {
        mql.addEventListener("change", onChange)
        return () => mql.removeEventListener("change", onChange)
      } catch {
        // Fall through to deprecated Safari listeners.
      }
    }

    if (mql) {
      const legacyList = mql as LegacyMediaQueryList
      if (typeof legacyList.addListener === "function" && typeof legacyList.removeListener === "function") {
        legacyList.addListener(onChange)
        return () => legacyList.removeListener?.(onChange)
      }
    }

    const onResize = () => {
      updateMobileState()
    }

    const viewport = window.visualViewport
    viewport?.addEventListener("resize", onResize)
    window.addEventListener("resize", onResize)
    window.addEventListener("orientationchange", onResize)

    return () => {
      viewport?.removeEventListener("resize", onResize)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("orientationchange", onResize)
    }
  }, [])

  return isMobile
}
