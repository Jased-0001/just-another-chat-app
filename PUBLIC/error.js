window.onerror = function(error, url, line) {
  // make body so its easier to edit
  var body = `exception
    In line ${line}
    URL: ${url}
    Error "${error}"
  `;

  // alert and log
  console.error(body);
  alert(body);

  // return so the default doesnt fire
  return true;
};