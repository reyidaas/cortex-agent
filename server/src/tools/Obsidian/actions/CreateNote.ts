import { Action } from '@/models/Action';
import { Document } from '@/models/Document';
import { createNote, generateNoteLink } from '@/util/obsidian';
import { hasPropertyOfType } from '@/util/types';
import type { State } from '@/models/State';

interface Payload {
  title: string;
  content: string;
}

export class ObsidianCreateNote extends Action<Payload> {
  constructor() {
    super({ name: 'create-note' });
  }

  override validatePayload(payload: unknown): payload is Payload {
    return (
      hasPropertyOfType('title', 'string')(payload) &&
      hasPropertyOfType('content', 'string')(payload)
    );
  }

  override async execute(
    { title, content }: Payload,
    _message: string,
    _state: State,
  ): Promise<Document<'text'>> {
    await createNote(title, content);
    return new Document('text', {
      text: `Note created: ${title}\nLink to note: ${generateNoteLink(title)}`,
    });
  }
}
