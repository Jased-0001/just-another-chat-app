function getCookie(cookieName) {
var name = cookieName + "=";
var ca = document.cookie.split(';');

for (var i = 0; i < ca.length; i++) {
var c = ca[i].trim();
if ((c.indexOf(name)) == 0) {
return c.substr(name.length);
}
}
return null;
}

function setCookie(cname, cvalue, exdays) {
const d = new Date();
d.setTime(d.getTime() + (exdays*24*60*60*1000));
let expires = "expires="+ d.toUTCString();
document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

window.onload = function() {
  usern = getCookie("username");

  if (usern != undefined || usern != null) {
    window.location.href = "/";
  } else {
    document.getElementById('usrnform')
    .addEventListener('submit', function(e) {
      var userna = document.getElementById('username');
      var pfpField = document.getElementById('pfpField');

      if (userna.value) {
        if (userna.value.length >= 16) {
          alert("Username too long!");
        } else if (userna.value.length <= 3) {
         alert("Username too short!");
        } else {
          joined = true;
          usern = userna.value;
          // add cookie
          setCookie("username", userna.value, 30);
          if (pfpField.value)
            setCookie("pfp", pfpField.value, 30);
          else
            setCookie("pfp", "default.png", 30);

          window.location.href = "/";
        }
      } else { alert("You need to input a username!"); }
    });
  }
}