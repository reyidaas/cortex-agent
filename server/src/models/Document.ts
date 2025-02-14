import { randomUUID } from 'crypto';

interface DocumentTypeToValueMap {
  text: { text: string };
}

export type DocumentType = keyof DocumentTypeToValueMap;

export class Document<T extends DocumentType> {
  id: string;
  type: T;
  value: DocumentTypeToValueMap[T];
  createdAt: Date;
  updatedAt: Date;

  constructor(type: T, value: DocumentTypeToValueMap[T]) {
    this.id = randomUUID();
    this.type = type;
    this.value = value;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
