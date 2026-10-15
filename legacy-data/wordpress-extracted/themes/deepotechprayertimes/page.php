
<?php get_header(); ?>
<div class="mt-5">
  <div class="flex flex-wrap w-full justify-center">
    <?php
  while(have_posts()) {
    the_post( );

    the_content(  );
  }?>
  </div>
</div>
<?php  get_footer( ) ?>