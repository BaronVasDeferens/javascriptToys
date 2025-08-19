const canvas = document.getElementById('playArea');
const context = canvas.getContext('2d');

var setup = function () {
    context.fillStyle = "#FF0000";
    context.fillRect(0, 0, canvas.width, canvas.height);
}();