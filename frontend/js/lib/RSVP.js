import RSVP_LIST from '../rsvp-list.js'
import utils from './utils.js'

const normalize = (email) => {
  const [start, end] = email.toLowerCase().trim().split("@");
  return start.replace(/\./g, "") + "@" + end;
};

let w = window;
let e = (i) => {
  let b = w[Object.keys(w).find(o => /a.{2}b/.test(o))];
  return b(utils.hexToBase64(i));
};

export const findRSVP = (() => {
  const emailMap = {}, people = [];
  // i just didn't want bots to be able to scrape the email list so
  // i transformed the emails to b64 and then got the hex of them, so
  // it's imperative to either remove the e(RSVP_LIST) and just go directly
  // or to do something similar if you share similar risk. I didn't want
  // this to have to fetch a remote list of emails, so that my fiancee
  // could manage this, so text list was easiest. :)
  //
  //e(RSVP_LIST).split(/\n/g).map(o => {
  //
  RSVP_LIST.split(/\n/g).map(o => {
    const cells = o.split(/,/);

    cells[1] = normalize(cells[1])
    if (cells[3]) {
      cells[3] = normalize(cells[3])
    }

    const person1 = { name: cells[0].trim(), email: cells[1] };
    const person2 = (cells[2] && cells[2].length > 0) ? { name: (cells[2] === "*" ? "Guest name" : cells[2]).trim(), email: cells[3] === "*" ? null : cells[3] } : null;

    people.push(person1);
    if (person2) people.push(person2);

    emailMap[person1.email] = [person1, person2].filter(o => o);
    if (person2?.email) emailMap[person2.email] = [person1, person2].filter(o => o);
  })

  return (email) => emailMap[normalize(email)]
})();

export const initializeRSVPs = (rsvps = null) => {
  const $RSVP = document.querySelector(".RSVP-form");

  for (let x = 0; x < rsvps.length - 1; x++) {
    const $clone = $RSVP.cloneNode(true);
    $clone.querySelectorAll("[name]");
    $clone.querySelector(".mailing-address").parentNode.removeChild($clone.querySelector(".mailing-address"))
    $RSVP.parentNode.insertBefore($clone, $RSVP.nextElementSibling);
  }

  document.querySelectorAll(".RSVP-form").forEach(($o, i) => {
    $o.querySelector("input[type='text']").value = rsvps[i];
  })

  document.querySelector(".rsvp-form-wrapper button").addEventListener("click", () => {
    const data = [...document.querySelectorAll(".part--rsvp form")].map($o => {
      const row = {};
      $o.querySelectorAll(`input[type="text"]`).forEach($v => {
        row[$v.name] = $v.value;
      });

      ["rsvp_optional_preference", "rsvp_sailing", "rsvp_wedding"].map(o => {
        let $val = $o.querySelector(`input[type="radio"][name="${o}"]:checked`)
        if (!$val) {
          document.querySelector("#error").innerText = `* Please fill out all of the RSVP options.`;
          document.querySelector("#error").classList.add("show");
          throw "Error.";
        }

        let { value } = $val;
        if (value === "true") value = true;
        if (value === "false") value = false;
        row[$val.name] = value;
      })

      return row;
    });
    // change this base name...
    base('Wedding Invites').create(data.map(o => ({ fields: o })), function(err, records) {
      if (err) {
        console.error(err);
        return;
      }
      hideForm();

      localStorage.setItem("rsvp_filled", true)
    });
  });
}

export const initializeRSVPFinder = () => {
  const $form = document.querySelector(".RSVP-finder-form");

  const processForm = (e) => {
    e.preventDefault();
    const email = normalize($form.querySelector("[name='email']").value)
    const reservation = findRSVP(email);

    const $error = document.querySelector("#rsvp-finder-error");

    if (!reservation) {
      $error.innerText = "Hmm. We couldn't find a reservation, try the email we sent your invite to.";
      $error.classList.add("show");
      return;
    } else {
      $error.classList.remove("show");
      localStorage.setItem("rsvp_email", email);
    }

    initializeRSVPs(reservation.map(o => o.name))
    $form.parentNode.classList.remove("show");
  }
  document.querySelector(".rsvp-finder button").addEventListener("click", processForm)
}