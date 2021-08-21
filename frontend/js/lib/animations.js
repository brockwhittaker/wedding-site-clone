export const animateParts = (oldIndex, newIndex) => {
  const $oldPart = document.querySelector(`.part[data-part="${oldIndex + 1}"]`);
  const $newPart = document.querySelector(`.part[data-part="${newIndex + 1}"]`);
  if (!$newPart) return;
  const direction = oldIndex < newIndex ? `up` : `down`;
  $oldPart.classList.add(`fade-out--${direction}`);
  setTimeout(function () {
    $oldPart.classList.remove(`fade-out--${direction}`);
    $oldPart.classList.remove("show")
    $newPart.classList.add(`fade-in--${direction}`);
    $newPart.classList.add("show");
    setTimeout(function () {
      $newPart.classList.remove(`fade-in--${direction}`);
    }, 200);
  }, window.innerWidth > 800 ? 500 : 200);
}

export const hideForm = () => {
  document.querySelector(".rsvp-form-wrapper").classList.add("hide");
  document.querySelector(".RSVP-form").style.height = `450px`;
  document.querySelector(".RSVP-form").style.overflow = `hidden`;
  setTimeout(function () {
    document.querySelector(".rsvp-success").classList.remove("hide");
    document.querySelectorAll(".part--rsvp form").forEach(o => o.style.display = "none");
  }, 500);
}