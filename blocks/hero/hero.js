import { createTag } from '../../scripts/aem.js';

export default function decorate(block) {
  const redBlockDiv = createTag('div', { class: 'red-block' });
  block.prepend(redBlockDiv);
}
