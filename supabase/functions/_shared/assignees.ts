/** Cilvēki, kam var nodot pieprasījumu. Tikai vārdi. */
export interface Assignee {
  slug: string
  name: string
  email: string
}

export const ASSIGNEES: Assignee[] = [
  { slug: 'ilona', name: 'Ilona', email: 'ilona@ervitex.lv' },
  { slug: 'santa', name: 'Santa', email: 'santa.k@ervitex.lv' },
  { slug: 'justine', name: 'Justīne', email: 'justine@ervitex.lv' },
  { slug: 'evita', name: 'Evita', email: 'evita@ervitex.lv' },
  { slug: 'laura', name: 'Laura', email: 'laura@ervitex.lv' },
]

export const assigneeBySlug = (slug: string): Assignee | undefined =>
  ASSIGNEES.find((a) => a.slug === slug)
