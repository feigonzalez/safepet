window.addEventListener('load', ()=>{
	const btn = document.querySelector('#saveOwnerBtn');
	if(btn){
		btn.addEventListener('click', (e)=>{
			e.preventDefault();
			const id = (params && params.id) ? ('?id='+encodeURIComponent(params.id)) : '';
			window.location.href = 'addOwnerSuccess.html'+id;
		});
	}
});