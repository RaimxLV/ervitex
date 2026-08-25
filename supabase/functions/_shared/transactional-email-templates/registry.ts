/// <reference types="npm:@types/react@18.3.1" />
import type { ComponentType } from 'npm:react@18.3.1'
import { template as quoteRequest } from './quote-request.tsx'
import { template as quoteConfirmation } from './quote-confirmation.tsx'
import { template as pmOffer } from './pm-offer.tsx'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: any) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'quote-request': quoteRequest,
  'quote-confirmation': quoteConfirmation,
  'pm-offer': pmOffer,
}
