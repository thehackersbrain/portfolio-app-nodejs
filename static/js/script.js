var Nav = document.getElementById('nav-items');
var items = Nav.getElementsByClassName('nav-item');
for (let i = 0; i < items.length; i++) {
	items[i].addEventListener('click', function () {
		var current = document.getElementsByClassName('active');
		if (current.length > 0) {
			current[0].className = current[0].className.replace(' active', '');
		}
		this.className += ' active';
	});
}
