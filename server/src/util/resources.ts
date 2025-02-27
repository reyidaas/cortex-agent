import type { ResourceType } from '@/types/common';

export const getResourceExtension = (type: ResourceType): string => {
  switch (type) {
    case 'prompts':
      return '.txt';
    case 'serp-results':
    default:
      return '.json';
  }
};

export const serializeResourceValue = <T>(type: ResourceType, value: T): string => {
  if (!value) return '';

  switch (type) {
    case 'prompts':
      return value.toString();
    case 'serp-results':
    default:
      return JSON.stringify(value);
  }
};

export const deserializeResourceValue = <T extends ResourceType>(
  type: T,
  value: Buffer,
): T extends 'prompts' ? string : any => {
  switch (type) {
    case 'prompts':
      return value.toString();
    case 'serp-results':
    default:
      return JSON.parse(value.toString());
  }
};
