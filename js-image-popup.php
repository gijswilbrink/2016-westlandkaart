<script id="template-image-popup" type="text/html">
	<div class="image-popup">
		<div class="center">
			<div class="box">
				<div class="panzoom" style="text-align: center;">
					<img src="{{imgSrc}}">
				</div>
				<button class="image-popup-close">
					<svg width="2em" height="2em" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 100 100" version="1.1" viewBox="0 0 100 100" xml:space="preserve"><polygon fill="#010101" points="77.6,21.1 49.6,49.2 21.5,21.1 19.6,23 47.6,51.1 19.6,79.2 21.5,81.1 49.6,53 77.6,81.1 79.6,79.2   51.5,51.1 79.6,23 "/></svg>
				</button>
				<button class="zoom-in">
					<svg width="2em" height="2em" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 100 100" version="1.1" viewBox="0 0 100 100" xml:space="preserve"><polygon fill="#010101" points="80.2,51.6 51.4,51.6 51.4,22.6 48.9,22.6 48.9,51.6 19.9,51.6 19.9,54.1 48.9,54.1 48.9,83.1   51.4,83.1 51.4,54.1 80.4,54.1 80.4,51.6 "/></svg>
				</button>
				<button class="zoom-out">
					<svg width="2em" height="2em" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 100 100" version="1.1" viewBox="0 0 100 100" xml:space="preserve"><rect fill="#010101" height="2.5" width="60" x="21.5" y="51.6"/></svg>
				</button>
				{{caption}}
			</div>
		</div>
	</div>
</script>
