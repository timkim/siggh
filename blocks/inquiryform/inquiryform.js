//import createField from './form-fields.js';
import { createTag } from '../../scripts/aem.js';

async function createForm(formHref, submitHref) {
  const { pathname } = new URL(formHref);
  const resp = await fetch(pathname);
  const json = await resp.json();

  const form = document.createElement('form');
  form.method = "POST";
  form.action = submitHref;

  const fields = await Promise.all(json.data.map((fd) => createField(fd, form)));
  fields.forEach((field) => {
    if (field) {
      form.append(field);
    }
  });

  // group fields into fieldsets
  const fieldsets = form.querySelectorAll('fieldset');
  fieldsets.forEach((fieldset) => {
    form.querySelectorAll(`[data-fieldset="${fieldset.name}"`).forEach((field) => {
      fieldset.append(field);
    });
  });

  return form;
}

function generatePayload(form) {
  const payload = {};

  [...form.elements].forEach((field) => {
    if (field.name && field.type !== 'submit' && !field.disabled) {
      if (field.type === 'radio') {
        if (field.checked) payload[field.name] = field.value;
      } else if (field.type === 'checkbox') {
        if (field.checked) payload[field.name] = payload[field.name] ? `${payload[field.name]},${field.value}` : field.value;
      } else {
        payload[field.name] = field.value;
      }
    }
  });
  return payload;
}

async function handleSubmit(form, submitObj) {
  if (form.getAttribute('data-submitting') === 'true') return;

  const submit = form.querySelector('button[type="submit"]');
  try {
    form.setAttribute('data-submitting', 'true');
    submit.disabled = true;

    // create payload
    const payload = generatePayload(form);
    const data = new FormData(form);
    const response = await fetch(submitObj.target.action, {
      method: 'POST',
      body: data,
    });
    if (response.ok) {
      console.log('form submit ok');
      console.log(form)
      if (form.dataset.confirmation) {
        window.location.href = form.dataset.confirmation;
      }
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  } finally {
    form.setAttribute('data-submitting', 'false');
    submit.disabled = false;
  }
}

function findAttribute(obj, attribute) {
  for (const key in obj) {
    if (key === attribute) {
      return obj[key];
    } else if (typeof obj[key] === "object") {
      const result = findAttribute(obj[key], attribute);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

function inquiryForm(scriptURL) {
  const div = createTag('div', { class: 'inquiryForm'});
  div.innerHTML = `
  <form name="inquiry">
    <div>
      <label for="inquiryName">Name</label>
      <input id="inquiryName" name="name" type="text" required>

      <label for="inquiryEmail">Email address</label>
      <input id="inquiryEmail" name="email" type="email" required>
    </div>

    <div>
      <label for="inquiryGetMore">Get More Pricing Info</label>
      <input id="inquiryGetMore" name="getMorePricing" type="checkbox" >
    </div>

    <div>
      <label for="inquiryIndustry">Industry</label>
      <input id="inquiryIndustry" name="industry" type="text" > 

      <label for="inquiryCoreMaterial">Core Material</label>
      <input id="inquiryCoreMaterial" name="coreMaterial" type="text" >
    </div>

    <div>
      <label for="inquiryProductDescription">Product Description</label>
      <input id="inquiryProductDescription" name="productDescription" type="text" >    
    </div>

    <div>
      <label for="inquirySpecs">Do you have completed Drawings/Specs?</label>
      <div id="inquirySpecs">
          <input id="inquirySpecsYes" name="inquirySpecsYes" type="radio" value="yes" > 
          <label for="inquirySpecsYes">Yes</label>

          <input id="inquirySpecsNo" name="inquirySpecsNo" type="radio" value="no" > 
          <label for="inquirySpecsNo">No</label>
      </div>
    </div>

    <div>
      <label for="inquiryEstimatedAnnual">Estimated Annual Quantity</label>
      <input id="inquiryEstimatedAnnual" name="estimatedAnnlyal" type="text" >
    </div>
    <button type="submit">Let's Chat</button>
  </form>
  `
  return div;
}
export default async function decorate(block) {
  // const links = [...block.querySelectorAll('a')].map((a) => a.href);
  // const formLink = links.find((link) => link.startsWith(window.location.origin) && link.endsWith('.json'));

  
  // if (!formLink || !submitLink) return;
  // console.log(formLink)
  // const form = await createForm(formLink, submitLink);
  // block.replaceChildren(form);

  // form.addEventListener('submit', (e) => {
  //   e.preventDefault();
  //   const valid = form.checkValidity();
  //   if (valid) {
  //     handleSubmit(form, e);
  //   } else {
  //     const firstInvalidEl = form.querySelector(':invalid:not(fieldset)');
  //     if (firstInvalidEl) {
  //       firstInvalidEl.focus();
  //       firstInvalidEl.scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }
  // });

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

  console.log(cols)
  console.log(cols[1].innerHTML)

  const inquiryformTitle = cols[1].querySelector('h1');
  const inquiryDescription = cols[1].querySelector('p');

  cols[1].innerHTML = inquiryForm(1234).innerHTML;
  
  // const links = [...block.querySelectorAll('a')].map((a) => a.href);
  // const submitLink = links.find((link) => link.startsWith('https://script.google.com'));

  // block.querySelector('div');
  // block.append(inquiryForm(submitLink));


  block.addEventListener('submit', e => {
    e.preventDefault()
    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
      .then(response => console.log('Success!', response))
      .catch(error => console.error('Error!', error.message))
  })
}