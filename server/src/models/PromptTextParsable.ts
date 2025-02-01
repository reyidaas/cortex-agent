export abstract class PromptTextParsable<T> {
  value: T;

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  abstract parseToPromptText(): string;
}
