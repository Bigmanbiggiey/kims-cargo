import type { en } from './en'

export type Messages = typeof en

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> }

type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`
}[keyof T & string]

/** Dotted key into Messages, e.g. 'home.headline'. */
export type MessageKey = Paths<Messages>
