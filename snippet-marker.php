<main class="articles" id="post-<?php echo $this->id; ?>">
	<article class="<?php echo $this->classes; ?>">

		<!-- Kaartthema -->
		<header>
			<h1><a href="<?php echo $this->theme->permalink ?>"><?php echo $this->theme->title; ?></a></h1>
		</header>

		<!-- Foto -->
		<?php if ($this->thumbnail->exists) :
			echo $this->thumbnail->img; // see od/lib/images.php line 101 for styling & output
		endif; ?>

		<!-- Optioneel Streetview -->
		<?php if($this->imageSV) : ?>
		<div class="streetview">
			<?php echo $this->imageSV; ?>
			<span
				class="streetview-text"
				data-enabletxt="<?php _e('Toon streetview'); ?>"
				data-disableTxt="<?php _e('Verberg streetview'); ?>"
			>
				<?php _e('Toon streetview'); ?>
			</span>
		</div>
		<?php endif; ?>

		<!-- Content -->
		<div class="entry">
			<?php echo $this->content; ?>
		</div>

		<!-- Zie ook / Related -->
		<?php if($this->aRelated) : ?>
			<div class="row related-markers">
			<h2>Gerelateerde markers</h2>
			<?php foreach ($this->aRelated as $aMarker) : ?>
				<div class="col-xs-4 text-center">
					<a href="<?php echo $aMarker['url']; ?>">
						<img src="<?php echo $aMarker['imageSrc']; ?>"><span><?php echo $aMarker['year']; ?></span>
					</a>
				</div>
				<?php
			endforeach; ?>
			</div>
		<?php endif; ?>

		<!-- jaren van marker -->
		<?php if($this->aYears) : ?>
			<div class="row marker-years">
				<h2>Deze marker komt voor in:</h2>
				<ul>
					<?php foreach ($this->aYears as $year) : ?>
					<a href="./?jaar=<?php echo $year; ?>">
						<?php echo $year; ?>
					</a>
					<?php endforeach; ?>
				</ul>
			</div>
		<?php endif ?>

		<!-- Social shares -->
		<?php echo $this->social; ?>

	</article>
</main>
