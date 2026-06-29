// SERVER CONFIGURATION
// IP must match the host's IP (not 127.0.0.1)
const ip = "192.168.0.77";
const port = 8080;

var deviceIdList = [];

(function initialize() {
  console.log("Initializing....");
})();

function addDeviceId() {
  var keyField = document.getElementById("deviceIdText");
  var deviceId = keyField.value;
  this.deviceIdList.push(deviceId);

  var option = document.createElement("option");
  option.text = deviceId;
  option.value = deviceId;

  var deviceIdSelection = document.getElementById("deviceIdSelection");
  deviceIdSelection.appendChild(option);
}

function sendCommand() {
  var deviceIdSelection = document.getElementById("deviceIdSelection");
  var deviceId = deviceIdSelection.value;

  var commandActionSelect = document.getElementById("commandActionSelect")
  var commandAction = commandActionSelect.options[commandActionSelect.selectedIndex].value;

  var url = `http://${ip}:${port}/command/${deviceId}?command=${commandAction}`;
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  xhr.send();
}