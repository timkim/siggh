import { createTag } from '../../scripts/aem.js';


export default function decorate(block) {
  //const redBlockDiv = createTag('div', { class: 'red-block' });
  //block.prepend(redBlockDiv);
  const links = [...block.querySelectorAll('a')].map((a) => a.href);
  const submitLink = links.find((link) => link.startsWith('https://script.google.com'));

  const submissionFormHTML = `
    <form 
      method="POST" 
      action="${submitLink}"
    >
      <input name="Email" type="email" placeholder="Email" required>
      <button type="submit">Send</button>
    </form>`;

    block.innerHTML = submissionFormHTML;
}
