(function () {

function item ( text, callback ) {
	var dom = document.create( '<a>' + text + '</a>');
	this.text = function ( newtext ) {
		newtext && dom.innerText = newtext;
		return newtext || dom.innerText;
	}
};
var menu = window.GameMenu = function () {

};

})();