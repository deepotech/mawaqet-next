<?php
//require get_theme_file_path('/inc/recette-filter-route.php');

add_action('wp_enqueue_scripts', 'deepotechpt_files');
// add_action('after_setup_theme', 'lelapin_features');
// add_filter('rest_query_vars', 'my_allow_meta_query');
 add_action('rest_api_init', 'get_cities_of_selected_country');

 function get_cities_of_selected_country() {
		register_rest_route('prayertimes/v1','cities',array(
			'methods' => WP_REST_SERVER::READABLE,
			'callback' => function($data) {
			
				$all_cities = [];
				$homepageCountries = new WP_Query(array(
					'posts_per_page' => -1,
					'post_type' => 'country',
				));

				while($homepageCountries->have_posts()) {
					$homepageCountries->the_post();
					if($data['country'] == get_field('country_name_en')) {
						$cities = get_field('cities');
						foreach($cities as $city) {
							array_push($all_cities, [$city->city_name_ar, $city->city_name_en]);
						}
					}
					
				}
				return $all_cities;
			}
		) );
 }


 add_action('rest_api_init', 'get_cities_with_country');

 function get_cities_with_country() {
		register_rest_route('prayertimes/v1','cities-with-country',array(
			'methods' => WP_REST_SERVER::READABLE,
			'callback' => function() {
			
				$all_cities_countries = [];
				$homepageCountries = new WP_Query(array(
					'posts_per_page' => -1,
					'post_type' => 'country',
				));

				while($homepageCountries->have_posts()) {
					$homepageCountries->the_post();
					$cities = get_field('cities');
						foreach($cities as $city) {
							array_push($all_cities_countries, ['cityAr' => $city->city_name_ar,'cityEn' => $city->city_name_en, 'country' => get_field('country_name'), 'link' => get_permalink( $city )]);
						}
				}
				return $all_cities_countries;
			}
		) );
 }


 add_action( 'widgets_init', 'deepotechpt_ads_widgets' );

 function deepotechpt_ads_widgets() {
		register_sidebar( array(
			'name' => 'Header Ads',
			'id' => 'header_ads',
			'before_widget' => '<div>',
			'after_widget' => '</div>',
		) );

		register_sidebar( array(
			'name' => 'Footer Ads',
			'id' => 'footer_ads',
			'before_widget' => '<div>',
			'after_widget' => '</div>',
		) );

		register_sidebar( array(
			'name' => 'After Prayer Times Ads',
			'id' => 'after_pt_ads',
			'before_widget' => '<div>',
			'after_widget' => '</div>',
		) );

		register_sidebar( array(
			'name' => 'After Cities Ads',
			'id' => 'after_cities_ads',
			'before_widget' => '<div>',
			'after_widget' => '</div>',
		) );
 }

// function remove_content_editor()
// {
//   remove_post_type_support('page', 'editor');
// }

// function my_allow_meta_query($valid_vars)
// {
//     $valid_vars = array_merge($valid_vars, array('meta_key', 'meta_value'));
//     return $valid_vars;
// }

// function lelapin_features()
// {
//     add_theme_support('title-tag');
// }

function deepotechpt_files()
{
    // wp_enqueue_script('lelapin_vendorjs', get_theme_file_uri('/src/js/vendor.min.js'), null, '1.0', false);
     wp_enqueue_script('deepotechpt_main_js', get_theme_file_uri('/js/main.js'), array( 'jquery' ), '1.0', true);
    // if (is_page('recettes-gourmandes')) {
    // wp_enqueue_script('lelapin_filter_js', get_theme_file_uri('/src/js/filter.js'), null, '1.0', true);
    // }
		wp_enqueue_style('deepotechpt_main_iconfont', get_template_directory_uri() . '/css/icofont.min.css', array(), '1.0', false);
    wp_enqueue_style('deepotechpt_main_style', get_stylesheet_uri());
}

add_action('init', 'recette_post_types');




function recette_post_types() {
	register_post_type('country', array(
		'public' => true,
		'show_in_rest' => true,
		'labels' => array(
			'name' => 'دولة',
			'add_new_item' => 'إضافة دولة',
			'edit_item' => 'تغيير دولة',
			'all_items' => 'قائمة الدول',
			'singular_name' => 'دولة',
		),
		'menu_icon' => 'dashicons-flag',
	));
	register_post_type('city', array(
		'public' => true,
		'show_in_rest' => true,
		'labels' => array(
			'name' => 'مدينة',
			'add_new_item' => 'إضافة مدينة',
			'edit_item' => 'تغيير مدينة',
			'all_items' => 'قائمة المدن',
			'singular_name' => 'مدينة',
		),
		'menu_icon' => 'dashicons-location-alt',
	));
	

	remove_post_type_support('country', 'editor');
	remove_post_type_support('city', 'editor');
	
}