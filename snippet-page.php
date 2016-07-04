<main class="articles" id="post-<?php echo $this->id; ?>">
	<article class="<?php echo $this->classes; ?>">
		<header>
			<h1><?php echo $this->title; ?></h1>
		</header>

		<!-- Foto -->
		<?php if ($this->thumbnail->exists) :
			echo $this->thumbnail->img; // see od/lib/images.php line 101 for styling & output
		endif; ?>

		<div class="entry">
			<?php echo $this->content; ?>
		</div>

		<!-- Social shares -->
		<?php echo $this->social; ?>

	</article>
</main>
