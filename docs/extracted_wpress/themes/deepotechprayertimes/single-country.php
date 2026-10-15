<?php get_header(); ?>

<div class="mb-10">
  <?php
  while(have_posts()) {
    the_post( );
    $ctr = get_field('country_name');
    $country_text = get_field('country_text');
    ?>
    <div
            id="alert-border-2"
            class="flex p-3 mb-4 bg-teal-100 border-t-4 border-teal-500 dark:bg-teal-200"
          >
            <i class="text-3xl text-teal-700 icofont-hand-drawn-left"></i>

            <div class="mr-3 text-lg font-medium text-teal-700">
            <h1> <?php echo $ctr ?> <td class="border border-gray-400 py-2 ps-2"><span class="font-bold"></span><span id="today-date-grs"></span>  </td></h1>
            </div>
          </div>
    
   
    <ul class="flex flex-wrap w-full justify-center">

             
                  <?php
                  $rows = get_field('cities');
                  
                  if($rows) {
                    foreach($rows as $row) {
                  ?>
                      <li class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 text-center mx-3 my-3" >
                        <a
                          href="<?php echo get_the_permalink($row ) ?>"
                          type="button"
                          class="rounded-full shadow-md w-full py-4 px-5 block"
                        >
                          <h2><?php echo get_field('city_name_ar',$row->ID) ?></h2>
                        </a>
                      </li>

                  <?php
                    }
                  }
  }
  ?>
                
                
               
    </ul>
  </div>

<div>
  <?php if ( is_active_sidebar( 'after_cities_ads' )): ?>
    <div class="flex justify-center  "><?php dynamic_sidebar( "after_cities_ads" ) ?></div>
  <?php endif; 

    if( $country_text != ''):?>
  
    <div
        id="alert-border-2"
        class="flex p-3 mb-4 bg-teal-100 border-t-4 border-teal-500 dark:bg-teal-200"
      >
        <i class="text-3xl text-teal-700 icofont-hand-drawn-left"></i>
    
        <div class="mr-3 text-lg font-medium text-teal-700">
        <h2>معلومات عن <?php echo $ctr; ?></h2>
        </div>
      </div>
    <div class="mb-4">
    
      <?php echo $country_text; ?>
    </div>
      <?php endif;?>

<div
            id="alert-border-2"
            class="flex p-3 mb-4 bg-teal-100 border-t-4 border-teal-500 dark:bg-teal-200"
          >
            <i class="text-3xl text-teal-700 icofont-hand-drawn-left"></i>

            <div class="mr-3 text-lg font-medium text-teal-700">
            <h2>مواقيت الصلاة في دول اخرى</h2>
            </div>
          </div>

    <ul class="flex flex-wrap w-full justify-center">

      <?php
        $homepageCountries = new WP_Query(array(
          'posts_per_page' => -1,
          'post_type' => 'country',
           'orderby' => 'date',
'order' => 'ASC'
        ));

        while($homepageCountries->have_posts()) {
          $homepageCountries->the_post();
          $ctr2 = get_field('country_name');
          ?>
             <li class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 mx-3 my-3">
                <a
                href="<?php the_permalink( ) ?>"
                  type="button"
                  class=" h-12 rounded-full justify-between w-full  focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium text-sm text-center inline-flex items-center ps-4 pe-px py-px shadow-md <?php echo ($ctr == $ctr2) ?  'bg-teal-600 text-white': 'text-gray-900 bg-white' ?>"
                >
                  <h3 class="font-bold"><?php echo $ctr2  ?></h3>
                  <img
                    src="<?php  the_field('country_flag') ?>"
                    class="h-full w-auto rounded-full"
                  />
                </a>
              </li>

          <?php
        }
      ?>
     
      
    </ul>
  </div>
<?php  get_footer( ) ?>