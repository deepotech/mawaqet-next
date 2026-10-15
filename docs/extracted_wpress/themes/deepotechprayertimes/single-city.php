<?php get_header(); 
$city_name_ar = '';
$city_name_en = '';
while(have_posts( )) {
  the_post( );
  $city_name_ar = get_field('city_name_ar');
  $city_name_en = get_field('city_name_en');
  $city_text = get_field('city_text');
}

$country_name_ar = '';
$country_name_en = '';
$all_cities = [];
$homepageCountries = new WP_Query(array(
  'posts_per_page' => -1,
  'post_type' => 'country',
   'orderby' => 'date',
'order' => 'ASC'
));

while($homepageCountries->have_posts()) {
  $homepageCountries->the_post();
  
  $cities = get_field('cities');
  foreach($cities as $city) {
    if($city_name_en == get_field('city_name_en',$city)) {
      $all_cities = $cities;
      $country_name_ar = get_field('country_name');
      $country_name_en = get_field('country_name_en');
      $country_text = get_field('country_text');
    }
  }
}
// echo '<pre>';
// echo print_r($all_cities);
// echo '</pre>';
?>

<div
            id="alert-border-2"
            class="flex p-3 mb-4 bg-teal-100 border-t-4 border-teal-500 dark:bg-teal-200"
          >
            <i class="text-3xl text-teal-700 icofont-hand-drawn-left"></i>

            <div class="mr-3 text-lg font-medium text-teal-700">
            <h1> <?php echo $city_name_ar ?> <td class="border border-gray-400 py-2 ps-2"><span class="font-bold"></span><span id="today-date-gr"></span>  </td></h1>
            </div>
          </div>
<div class="mb-10 flex flex-wrap w-full justify-center">
              <div class="w-full md:w-1/2 px-2">
                <table class="table-auto w-full border border-gray-400">
                  <thead>
                    <tr class="border border-gray-400">
                      <th
                        class="text-right border border-gray-400 bg-gray-300 py-2 ps-2"
                      >
                        الصلاة
                      </th>
                      <th
                        class="text-right border border-gray-400 bg-gray-300 py-2 ps-2"
                      >
                        وقت الأذان
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border border-gray-400 py-2 ps-2 bg-gray-200 font-bold">
                        صلاة الفجر
                      </td>
                      <td class="border border-gray-400 py-2 ps-2" id="fajr"></td>
                    </tr>
                    <tr>
                      <td class="border border-gray-400 py-2 ps-2 bg-gray-200 font-bold">
                        الشروق
                      </td>
                      <td class="border border-gray-400 py-2 ps-2" id="chorouk"></td>
                    </tr>
                    <tr>
                      <td class="border border-gray-400 py-2 ps-2 bg-gray-200 font-bold">
                        صلاة الظهر
                      </td>
                      <td class="border border-gray-400 py-2 ps-2" id="dohr"></td>
                    </tr>
                    <tr>
                      <td class="border border-gray-400 py-2 ps-2 bg-gray-200 font-bold">
                        صلاة العصر
                      </td>
                      <td class="border border-gray-400 py-2 ps-2" id="asr"></td>
                    </tr>
                    <tr>
                      <td class="border border-gray-400 py-2 ps-2 bg-gray-200 font-bold">
                        صلاة المغرب
                      </td>
                      <td class="border border-gray-400 py-2 ps-2" id="maghrib"></td>
                    </tr>
                    <tr>
                      <td class="border border-gray-400 py-2 ps-2 bg-gray-200 font-bold">
                        صلاة العشاء
                      </td>
                      <td class="border border-gray-400 py-2 ps-2" id="isha"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="w-full md:w-1/2 px-2 mt-3 md:mt-0">
                <div>
                  
                  <div 
                    class="bg-teal-600 text-white text-center py-2 mt-2"
                  >
                  <p class="font-bold ">يتبقى على رفع أذان صلاة  </p>
                  <span class="font-bold text-xl text-white text-center" id="before-countdown"></span><br>
                     <span id="countdown" class="text-4xl tracking-widest">--:--:--</span> 
                    
                  </div>
                </div>
                <div>
                  <table class="table-auto border border-gray-400 w-full mt-3">
                    <tbody>
                      <tr>
                        <td
                          class="border border-gray-400 py-2 bg-gray-200 ps-2"
                        ><span class="font-bold">
                        الصلاة القادمة : </span><span id="next-prayer"></span>                        </td>
                        <td class="border border-gray-400 py-2 ps-2 "><span class="font-bold">المكان  : </span><span id="place"><?php echo $city_name_ar ?></span> </td>
                      </tr>
                      <tr>
                        <td
                          class="border border-gray-400 py-2 bg-gray-200 ps-2"
                        >
                        <span class="font-bold">
                        الساعة الآن : </span><span id="time-now"></span>
                        </td>
                        <td class="border border-gray-400 py-2 ps-2"> <span class="font-bold">تاريخ اليوم هجري : </span><span id="today-date-ar"></span> </td>
                      </tr>
                      <tr>
                        <td
                          class="border border-gray-400 py-2 bg-gray-200 ps-2"
                        ><span class="font-bold">
                        يوم الأسبوع : </span><span id="weekday"></span>                        </td>
                        <td class="border border-gray-400 py-2 ps-2"><span class="font-bold">  تاريخ اليوم ميلادي : </span><span id="today-date-gr"></span>  </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

<div class="mb-10">
<?php if ( is_active_sidebar( 'after_pt_ads' )): ?>
  <div class="flex justify-center  "><?php dynamic_sidebar( "after_pt_ads" ) ?></div>
<?php endif; 

if($city_text != '' ):?>

<div
    id="alert-border-2"
    class="flex p-3 mb-4 bg-teal-100 border-t-4 border-teal-500 dark:bg-teal-200"
  >
    <i class="text-3xl text-teal-700 icofont-hand-drawn-left"></i>

    <div class="mr-3 text-lg font-medium text-teal-700">
    <h3> معلومات عن <?php echo $city_name_ar; ?></h3>
    </div>
  </div>
<div class="mb-4">
  <?php echo $city_text; ?> 
</div>
  <?php endif;

  
if( $country_text != ''):?>

  <div
      id="alert-border-2"
      class="flex p-3 mb-4 bg-teal-100 border-t-4 border-teal-500 dark:bg-teal-200"
    >
      <i class="text-3xl text-teal-700 icofont-hand-drawn-left"></i>
  
      <div class="mr-3 text-lg font-medium text-teal-700">
      <h3>معلومات عن <?php echo $country_name_ar; ?></h3>
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
            <h2>    <?php echo $city_name_ar ?> لهذا الشهر</h2>
            </div>
          </div>
<div  class="mb-10 flex flex-wrap w-full justify-center">
<div class="overflow-x-scroll w-full">
              <table id="prayer-time-table" class="w-full text-right border border-gray-400 ">
                <thead>
                  <tr>
                    <th
                      class="border border-gray-400 py-2 ps-3 bg-gray-300 font-bold"
                    >
                      اليوم
                    </th>
                    <th
                      class="border border-gray-400 py-2 ps-3 bg-gray-300 font-bold"
                    >
                    هجري
                    </th>
                    <th
                      class="border border-gray-400 py-2 ps-3 bg-gray-300 font-bold"
                    >
                      ميلادي
                    </th>
                    <th
                      class="border border-gray-400 py-2 ps-3 bg-gray-300 font-bold"
                    >
                      صلاة الفجر
                    </th>
                    <th
                      class="border border-gray-400 py-2 ps-3 bg-gray-300 font-bold"
                    >
                      الشروق
                    </th>
                    <th
                      class="border border-gray-400 py-2 ps-3 bg-gray-300 font-bold"
                    >
                      صلاة الظهر
                    </th>
                    <th
                      class="border border-gray-400 py-2 ps-3 bg-gray-300 font-bold"
                    >
                      صلاة العصر
                    </th>
                    <th
                      class="border border-gray-400 py-2 ps-3 bg-gray-300 font-bold"
                    >
                      صلاة المغرب
                    </th>
                    <th
                      class="border border-gray-400 py-2 ps-3 bg-gray-300 font-bold"
                    >
                      صلاة العشاء
                    </th>
                  </tr>
                </thead>
                <tbody >
                 
                </tbody>
              </table>
              </div>
</div>

<div
            id="alert-border-2"
            class="flex p-3 mb-4 bg-teal-100 border-t-4 border-teal-500 dark:bg-teal-200"
          >
            <i class="text-3xl text-teal-700 icofont-hand-drawn-left"></i>

            <div class="mr-3 text-lg font-medium text-teal-700">
            <h3>مواقيت الصلاة في مدن اخرى</h3>
            </div>
          </div>
<ul class="flex flex-wrap w-full justify-center">
  <?php


    foreach($all_cities as $city) {  
      $ct = get_field('city_name_ar', $city);
    ?>
         
        <li class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 text-center mx-3 my-3" >
          <a
            href="<?php echo get_the_permalink($city ); ?>"
            type="button"
            class="block rounded-full shadow-md w-full py-4 px-5 <?php echo ($ct == $city_name_ar) ?  'bg-teal-600 text-white': '' ?>"
          >
            <h3><?php echo $ct ?></h3>
          </a>
        </li>

    <?php
                  
  }
  ?>
                
                
               
    </ul>
  </div>





  <div>
    <?php if ( is_active_sidebar( 'after_cities_ads' )): ?>
    <div class="flex justify-center  "><?php dynamic_sidebar( "after_cities_ads" ) ?></div>
  <?php endif; ?>
  <div
            id="alert-border-2"
            class="flex p-3 mb-4 bg-teal-100 border-t-4 border-teal-500 dark:bg-teal-200"
          >
            <i class="text-3xl text-teal-700 icofont-hand-drawn-left"></i>

            <div class="mr-3 text-lg font-medium text-teal-700">
            <h3>مواقيت الصلاة والأذان في دول اخرى</h3>
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
          $ctr = get_field('country_name');
          ?>
             <li class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 mx-3 my-3">
                <a
                href="<?php the_permalink( ) ?>"
                  type="button"
                  class=" h-12 rounded-full justify-between w-full  focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium text-sm text-center inline-flex items-center ps-4 pe-px py-px shadow-md <?php echo ($ctr == $country_name_ar) ?  'bg-teal-600 text-white': 'text-gray-900 bg-white' ?>"
                >
                  <h3 class="font-bold"><?php  echo $ctr ?></h3>
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
<script> 
jQuery(document).ready(function () {
  
  getSalatTime("<?php echo $city_name_en ?>","<?php echo $country_name_en?>"); 
});

</script>
<?php  get_footer( ) ?>