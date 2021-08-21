export default {
  // makes the <li> tags the furthest from the actively selected one grey,
  // and makes the actively selected one orange.
  blurList: ($ul) => {
    let selected = $ul.querySelector("li.selected");
    selected.style.opacity = 1;
    let pp = selected, ppc = 0, np = selected, npc = 0;
    while (pp.previousElementSibling) {
      pp = pp.previousElementSibling;
      pp.style.opacity = 1 - (++ppc) / 8;
    }

    while (np.nextElementSibling) {
      np = np.nextElementSibling;
      np.style.opacity = 1 - (++ppc / 8);
    }
  },

  getParam: (key) => {
    const url = new URL(location.href);
  },

  hexToBase64: (str) => {
    return btoa(String.fromCharCode.apply(null,
      str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
  },

  base64ToHex: (str) => {
    for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
      var tmp = bin.charCodeAt(i).toString(16);
      if (tmp.length === 1) tmp = "0" + tmp;
      hex[hex.length] = tmp;
    }
    return hex.join(" ");
  },
};
