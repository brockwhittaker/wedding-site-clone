import { animateParts, hideForm } from './lib/animations.js'
import { findRSVP, initializeRSVPs, initializeRSVPFinder } from './lib/RSVP.js'
import utils from './lib/utils.js'

// this is kind of a sloppy catch code that both deals with leaf generation
// which is somewhat complex, as well as then initializing some of the DOM
// events around the forms.
const Airtable = require('airtable');
const base = new Airtable({ apiKey: 'API_KEY' }).base('BASE_KEY');

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const numLeaves = document.querySelectorAll(".leaf").length
const leafStyles = new Array(numLeaves).fill(0).map((o, i) => ({
  top: (150 / numLeaves) * i + Math.random() * 20 - 10 - 50,
  left: [0, 50, 100][i % 3] + Math.random() * 30 - 15,
  transform: ``,
}));

const urlRouter = () => {
  if (/rsvp/.test(location.href)) {
    document.querySelector(`li[data-name="rsvp"]`).click();
  } else {
    document.querySelector(`li[data-name="home"]`).click();
  }
}
const loadPage = () => {
  urlRouter();
}

leafStyles.unshift(null);
leafStyles.forEach(o => {
  if (o) {
    o.leftDrift = (Math.random() * 10) - 5;
    o.leftDriftAcc = 0;
    o.rotateDrift = Math.random() * 8 - 4;
    o.rotateDriftAcc = 0;
  }
});

(() => {
  document.querySelectorAll("li").forEach(node => node.addEventListener("click", function () {
    document.querySelector("#app").classList.add("show-content");
    if (this.classList.contains("selected")) return;

    const $ul = this.closest("ul");
    const $prev = $ul.querySelector(".selected");
    const $children = [...$prev.parentElement.children];
    const oldIndex = $children.indexOf($prev);
    $prev.classList.remove("selected");
    const newIndex = $children.indexOf(this);
    this.classList.add("selected");
    utils.blurList($ul);
    animateParts(oldIndex, newIndex)

    oneTimeAdjustment = (newIndex - oldIndex) * 8;
    leafLoop(false);
  }))

  utils.blurList(document.querySelector("ul"))

  let hasRun = false,
      oneTimeAdjustment = 0;

  const leafLoop = (repeat = true) => {
    if (document.hidden) {
      if (repeat) setTimeout(() => leafLoop(repeat), 1000);
      return;
    }
    if (oneTimeAdjustment && repeat) return;

    let count = 0;
    document.querySelectorAll(".leaf").forEach($leaf => {
      ++count;
      if (oneTimeAdjustment) {
        $leaf.style.transition = "all 1s ease";
        setTimeout(function () {
          $leaf.style.removeProperty("transition");
        }, 1000);
      }
      const styles = leafStyles[count]
      if (!isMobile) styles.top += 2 + oneTimeAdjustment;
      if (styles.top > 140) {
        $leaf.classList.add("no-animate");
        styles.top -= 170;
        styles.leftDriftAcc = 0;
        styles.rotateDriftAcc = 0;
        setTimeout(() => $leaf.classList.remove("no-animate"), 100)
      }
      for (let x in styles) {
        if (x === "left") {
          styles.leftDriftAcc += styles.leftDrift;
          styles.rotateDriftAcc += styles.rotateDrift;
          if (styles.left > 100) styles.left = 100;
          if (styles.left < -100) styles.left = -100;
          $leaf.style.left = styles.left + "%";
          if (styles.leftDriftAcc > 100) styles.leftDriftAcc = 100;
          $leaf.style.transform = styles.transform + `rotate(${180 - styles.rotateDriftAcc}deg) translateX(${styles.leftDriftAcc}%)`;
        } else if (x === "top") {
          $leaf.style[x] = styles[x] + "%";
        } else if (x === "transform") {
          // do nothing..
        } else {
          $leaf.style[x] = styles[x];
        }
      }
      if (!hasRun) $leaf.classList.remove("no-animate");
    })

    if (repeat) setTimeout(() => leafLoop(repeat), 1000);
    oneTimeAdjustment = 0;
    if (!hasRun) {
      hasRun = true;
    }
  }
  leafLoop();
  setTimeout(function () {
    document.querySelector("#app").classList.remove("hide");
  }, 750);

  const attemptGoToNextPage = () => {
    document.querySelector("li.selected:not(.hide)").nextElementSibling?.click();
    if (document.querySelector("li.selected:not(.hide)").nextElementSibling) {
      document.querySelector("#down").classList.add("show");
    } else {
      document.querySelector("#down").classList.remove("show");
    }
  };

  const attemptGoToPrevPage = () => {
    document.querySelector("li.selected:not(.hide)").previousElementSibling?.click();
    document.querySelector("#down").classList.add("show");
  };

  let lastMoved = new Date(), lastIntraMoved = new Date();

  const onScroll = function (e) {
    const $shownPart = document.querySelector('.part.show');
    const atBottom = ($shownPart.scrollHeight - $shownPart.getBoundingClientRect().height) - $shownPart.scrollTop < 1;
    const atTop = $shownPart.scrollTop === 0;

    if ((atBottom && e.deltaY > 0) || (atTop && e.deltaY < 0)) {
      if (new Date() - lastIntraMoved < 500) return;

      if (e.deltaY > 20 && new Date() - lastMoved > 500) {
        lastMoved = new Date();
        attemptGoToNextPage()
      } else if (e.deltaY < -20 && new Date() - lastMoved > 500) {
        lastMoved = new Date();
        attemptGoToPrevPage();
      }
      e.preventDefault();
    } else {
      lastIntraMoved = new Date();
    }
  };
  window.addEventListener("mousewheel", onScroll);
  window.addEventListener("scroll", onScroll);

  document.querySelector(".back-button").addEventListener("click", () => {
    document.querySelector("#app").classList.remove("show-content");
  });

  document.querySelector("#down").addEventListener("click", attemptGoToNextPage)

  const potentialEmail = localStorage.getItem("rsvp_email");
  const rsvpFilled = localStorage.getItem("rsvp_filled");

  if (potentialEmail) {
    initializeRSVPs(findRSVP(potentialEmail).map(o => o.name));
    document.querySelector(".rsvp-finder").classList.remove("show");
    document.querySelector(".rsvp-form-wrapper").classList.add("no-animate");
    setTimeout(function () {
      document.querySelector(".rsvp-form-wrapper").classList.remove("no-animate");
    }, 1000);
  }

  if (rsvpFilled) {
    hideForm()
  } else {
    if (!isMobile) document.querySelector(".RSVP-finder-form input").focus()
  }

  initializeRSVPFinder();
  loadPage();

  const appHeight = () => {
    if (isMobile) {
      const doc = document.documentElement;
      const height = Math.min(document.body.clientHeight, window.innerHeight);
      doc.style.setProperty('--app-height', `${height}px`)
    }
  }
  window.addEventListener('resize', appHeight);
  window.add
  appHeight()
})();

/*
How should the page animation work?
I think they should be simple, but what comes to four distinct steps with two
animation breaks.

Step 1: OLD CONTENT IN PLAIN VIEW. (.show)
Step 2: OLD CONTENT SLIDES UP. (.show.fade-out)
Step 3: NEW CONTENT SLIDES UP. (.fade-in)
Step 4: NEW CONTENT IN PLAIN VIEW. (.show)

*/