import { createContext, useContext } from 'react'

/** Lets beat content drive navigation (e.g. the hero's Begin button) without its own logic. */
export const PresentationContext = createContext<{ next: () => void }>({ next: () => {} })
export const usePresentation = () => useContext(PresentationContext)
