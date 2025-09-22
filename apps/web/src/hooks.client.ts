// force le focus visible au clavier sur Safari/Firefox
document.addEventListener('keydown', (e) => {
	if (e.key === 'Tab') document.documentElement.classList.add('user-tabbing');
});
