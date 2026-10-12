/** Staff work in the offer workspace, never the administration shell. */
export const offerEditorPath = (id: string) => `/offers/${encodeURIComponent(id)}`;