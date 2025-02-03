//import createField from './form-fields.js';
import { createTag } from '../../scripts/aem.js';

function inquiryContact(productType, numbers) {
  const div = createTag('div');
  div.innerHTML = `
    <p><strong>${productType}</strong></p>
    <ul>
      ${numbers}
    </ul>
  `;
  return div;
}

function inquiryForm(scriptUrl, heading, description) {
  const div = createTag('div', { class: 'inquiryForm'});
  div.innerHTML = `
  <h1>${heading}</h1>
  <p>${description}</p>

  <form class="inquiry-form" name="inquiry" method="POST" action="${scriptUrl}">
    <div class="inquiry-form-col">
      <div>
        <label for="inquiryName">Name</label>
        <input id="inquiryName" name="name" type="text" required>
      </div>

      <div>
        <label for="inquiryEmail">Email address</label>
        <input id="inquiryEmail" name="email" type="email" required>
      </div>
    </div>

    <div>
      <label for="inquiryGetMore">Get More Pricing Info</label>
      <input id="inquiryGetMore" name="getMorePricing" type="checkbox" >
    </div>

    <div id="inquiry-more" class="not-visible">
      <div class="inquiry-form-col">
        <div>
          <label for="inquiryIndustry">Industry</label>
          <input id="inquiryIndustry" name="industry" type="text" > 
        </div>

        <div>
          <label for="inquiryCoreMaterial">Core Material</label>
          <input id="inquiryCoreMaterial" name="coreMaterial" type="text" >
        </div>
      </div>

      <div>
        <label for="inquiryProductDescription">Product Description</label>
        <input id="inquiryProductDescription" name="productDescription" type="text" >    
      </div>

      <div>
        <label for="inquirySpecs">Do you have completed Drawings/Specs?</label>
        <div id="inquirySpecs">
            <input id="inquirySpecsYes" name="completeSpec" type="radio" value="yes" > 
            <label for="inquirySpecsYes">Yes</label>

            <input id="inquirySpecsNo" name="completeSpec" type="radio" value="no" > 
            <label for="inquirySpecsNo">No</label>
        </div>
      </div>

      <div class="inquiry-form-col">
        <div>
          <label for="inquiryEstimatedAnnual">Estimated Annual Quantity</label>
          <input id="inquiryEstimatedAnnual" name="estimatedAnnualQuantity" type="number" >
        </div>
      </div>
    </div>
    <button type="submit">Let's Chat</button>
  </form>
  `
  return div;
}

export default async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`inquiryform-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('inquiryform-img-col');
        }
      }
    });
  });

  const inquiryformTitle = cols[1]?.querySelector('h2');
  const inquiryDescription = cols[1]?.querySelector('p');

  let inquiryContactText = [];
  cols[0]?.querySelectorAll('p:has(+ul)').forEach( (contact, index) => {
    let numbers = [];

    contact.parentElement.querySelectorAll(`p+ul`)[index].querySelectorAll('li').forEach( (theNumbers) => {
      numbers.push(theNumbers.innerText.trim());
      theNumbers.remove();
    });

    inquiryContactText.push([contact.innerText.trim(), numbers]);
    contact.remove();
  });

  const contactsGroup = createTag('div', { class: 'inquiryContactsGroup'});

  inquiryContactText.forEach( ( contact, index ) => {
    const contacts = createTag('div', { class: 'inquiryContactsWrapper'});

    let numbers = createTag('ul');
    contact[1].forEach((number) => {
      const li = createTag('li');
      li.innerText = number;
      numbers.append(li)
    })

    const contactLeft = inquiryContact(contact[0], numbers.innerHTML);

    const contactRight = createTag('div', { class: 'inquiryContactsRight'});

    contacts.append(contactLeft);
    contacts.append(contactRight);
    contactsGroup.append(contacts);

  });
  
  cols[0].append(contactsGroup);

  const links = [...cols[1].querySelectorAll('a')].map((a) => a.href);

  const submitSuccessUrl = links.find((link) => link.startsWith('https://siggh.us'));
  const submitLink = links.find((link) => link.startsWith('https://script.google.com'));

  if(submitSuccessUrl && submitLink) {
    cols[1].innerHTML = inquiryForm(submitLink, inquiryformTitle.innerHTML, inquiryDescription.innerHTML).innerHTML;
  
    const getMoreCheckbox = document.querySelector('#inquiryGetMore');
    const getMoreForm = document.querySelector('#inquiry-more');
  
    // toggle extra form info from checkbox
    getMoreCheckbox.addEventListener("change", () => {
      if (getMoreCheckbox.checked) {
        getMoreForm.classList.add('visible');
        getMoreForm.classList.remove('not-visible');
      } else {
        getMoreForm.classList.remove('visible');
        getMoreForm.classList.add('not-visible');
      }
    });
  
    const form = cols[1].querySelector('form');
    form.addEventListener('submit', e => {
      e.preventDefault()
      fetch(submitLink, { method: 'POST', body: new FormData(form)})
        .then( (response) => {
          window.location.href = submitSuccessUrl;
        })
        .catch(error => console.error('Error!', error.message))
    })
  }
  
}