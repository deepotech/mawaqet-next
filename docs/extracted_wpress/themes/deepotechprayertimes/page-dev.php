<?php /* Template Name: developer page Template */ ?>
<?php get_header(); ?>
<div class="mt-5">
<div class="flex flex-wrap w-full justify-center">
            <div class="w-full md:w-2/3 px-2 flex flex-col">
              <div class="w-full flex">
                <div class="w-1/3 me-3">
                  <label for="underline_select" class="sr-only"
                    >Underline select</label
                  >
                  <select
                    id="country_select"
                    class="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-teal-200 appearance-none dark:text-gray-400 dark:border-teal-600 focus:outline-none focus:ring-0 focus:border-teal-200 peer"
                  >
                    <option selected>إختر الدولة</option>
                    <?php
                    $homepageCountries = new WP_Query(array(
                      'posts_per_page' => -1,
                      'post_type' => 'country',
                       'orderby' => 'date',
                      'order' => 'ASC'
                    ));

                    while($homepageCountries->have_posts()) {
                      $homepageCountries->the_post();
                      ?>
                        <option value="<?php the_field('country_name_en') ?>"><?php the_field('country_name') ?></option>


                      <?php
                    }
                      ?>
                  </select>
                </div>

                <div class="w-1/3 me-3">
                <label for="city_select" class="sr-only"
                    >Underline select</label
                  >
                  <select
                    id="city_select"
                    class="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-teal-200 appearance-none dark:text-gray-400 dark:border-teal-600 focus:outline-none focus:ring-0 focus:border-teal-200 peer"
                  >
                    <option selected>إختر المدينة</option>
                    
                  </select>
                </div>
              </div>

              <div class="flex flex-col justify-between mt-5 p-2">
                <p>
                  سيتم تحديث التصميم بشكل اوتوماتيكي بعد تعديل إحدى الخيارات:
                </p>
                <label for="show-chorouk" class="mt-3 p-2"
                  ><input type="checkbox" checked name="show-chorouk" id="show-chorouk" /> عرض وقت شروق الشمس.
                </label>
                <label for="show-time" class="mt-3 p-2"
                  ><input type="checkbox" checked name="show-time" id="show-time" /> عرض التوقيت الخاص بالمدينة.
                </label>
                <label for="show-countdown" class="mt-3 p-2"
                  ><input type="checkbox" checked name="show-countdown" id="show-countdown" /> عرض الوقت المتبقي
                  للصلاة القادمة
                </label>
                <label for="show-add-button" class="mt-3 p-2"
                  ><input type="checkbox" checked name="show-add-button" id="show-add-button" /> إضافة زر اضف هذا
                  التوقيت لموقعك.
                </label>
                <label for="design-color" class="mt-3 flex justify-between p-2">
                  لون التصميم
                  <input type="color" value="#0f766e" name="design-color" id="design-color" />
                </label>
                <!-- <label for="design-height"  class="mt-3 flex justify-between p-2">
                  طول التصميم
                  <div>
                  <span id="h-current-value">560px</span>
                  <input type="range" value="560" min="100" max="600" name="design-height" id="design-height" />
                  </div>
                </label>
                <label for="design-width" class="mt-3 flex justify-between p-2">
                  عرض التصميم
                  <div>
                  <span id="w-current-value">100%</span>
                  <input type="range" value="100" min="50" max="100" name="design-width" id="design-width" />
                  </div>
                </label> -->
                <label
                  for="final-code"
                  class="mt-3 flex justify-between align-middle p-2"
                >
                  الكود النهائي
                  <div class="bg-gray-200 font-mono text-sm overflow-x-scroll overflow-y-hidden" >
                    <pre id="final-code">

                    </pre>
                  </div>
                  <button
                    type="button"
                    id="copy-btn"
                    class="text-teal-700 border border-teal-700 hover:bg-teal-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center mr-2 dark:border-teal-500 dark:text-teal-500 dark:hover:text-white dark:focus:ring-teal-800"
                    title="نسخ"
                  >
                    <i class="text-xl icofont-ui-copy"></i>
                  </button>
                </label>
                <p class="mt-5 p-2">
                  * أنسخ الكود وقم بوضعه بالمكان الذي تريد في موقعك.
                </p>
              </div>
            </div>
            <div class="w-full md:w-1/3 px-2" id="iframe-container">
              
            </div>
          </div>

</div>

<script>
  let show_chorouk = "show-chorouk=1",
  show_time = "show-time=1",
  show_countdown = "show-countdown=1",
  show_addbtn = "show-addbtn=1",
  design_color = "design-color=#0f766e",
  design_h = "design-h=560",
  design_w = "design-w=100",
  city = "city-s=mecca",
  country = "country-s=saudi arabia",
  city_ar = "city-ar=مكة المكرمة";

  

let embed_link = `https://mawaqetsalat.com/embd?${country}&${city}&${show_chorouk}&${show_time}&${show_countdown}&${show_addbtn}&${design_color}&${design_h}&${design_w}&${city_ar}`;
let finalCode = '<iframe height="560" width="100%" style="background:#f8f8f8;border:1px solid #ddd;" src="'+ embed_link +'"></iframe>';

jQuery("#final-code").text(finalCode);

jQuery("#city_select").on('change', function(e) {
  city = 'city-s=' + e.target.value;
  city_ar = 'city-ar=' + e.target.selectedOptions[0].text;
  embed_link = `https://mawaqetsalat.com/embd?${country}&${city}&${show_chorouk}&${show_time}&${show_countdown}&${show_addbtn}&${design_color}&${design_h}&${design_w}&${city_ar}`;
 finalCode = '<iframe height="560" width="100%" style="background:#f8f8f8;border:1px solid #ddd;" src="'+ embed_link +'"></iframe>';
  jQuery("#final-code").text(finalCode);
  jQuery('#iframe-container').html(finalCode);
})
jQuery("#country_select").on('change', function(e) {
  country = 'country-s=' + e.target.value;
  embed_link = `https://mawaqetsalat.com/embd?${country}&${city}&${show_chorouk}&${show_time}&${show_countdown}&${show_addbtn}&${design_color}&${design_h}&${design_w}&${city_ar}`;
 finalCode = '<iframe height="560" width="100%" style="background:#f8f8f8;border:1px solid #ddd;" src="'+ embed_link +'"></iframe>';
  jQuery("#final-code").text(finalCode);
  jQuery('#iframe-container').html(finalCode);
})
jQuery("#show-chorouk").on('change', function(e) {
  show_chorouk = (e.target.checked) ? 'show-chorouk=1' : 'show-chorouk=0';
   embed_link = `https://mawaqetsalat.com/embd?${country}&${city}&${show_chorouk}&${show_time}&${show_countdown}&${show_addbtn}&${design_color}&${design_h}&${design_w}&${city_ar}`;
 finalCode = '<iframe height="560" width="100%" style="background:#f8f8f8;border:1px solid #ddd;" src="'+ embed_link +'"></iframe>';
  jQuery("#final-code").text(finalCode);
  jQuery('#iframe-container').html(finalCode);
})
jQuery("#show-time").on('change', function(e) {
  show_time = (e.target.checked) ? 'show-time=1' : 'show-time=0';
   embed_link = `https://mawaqetsalat.com/embd?${country}&${city}&${show_chorouk}&${show_time}&${show_countdown}&${show_addbtn}&${design_color}&${design_h}&${design_w}&${city_ar}`;
 finalCode = '<iframe height="560" width="100%" style="background:#f8f8f8;border:1px solid #ddd;" src="'+ embed_link +'"></iframe>';
  jQuery("#final-code").text(finalCode);
  jQuery('#iframe-container').html(finalCode);
})
jQuery("#show-countdown").on('change', function(e) {
  show_countdown = (e.target.checked) ? 'show-countdown=1' : 'show-countdown=0';
   embed_link = `https://mawaqetsalat.com/embd?${country}&${city}&${show_chorouk}&${show_time}&${show_countdown}&${show_addbtn}&${design_color}&${design_h}&${design_w}&${city_ar}`;
 finalCode = '<iframe height="560" width="100%" style="background:#f8f8f8;border:1px solid #ddd;" src="'+ embed_link +'"></iframe>';
  jQuery("#final-code").text(finalCode);
  jQuery('#iframe-container').html(finalCode);
})
jQuery("#show-add-button").on('change', function(e) {
  show_addbtn = (e.target.checked) ? 'show-addbtn=1' : 'show-addbtn=0';
   embed_link = `https://mawaqetsalat.com/embd?${country}&${city}&${show_chorouk}&${show_time}&${show_countdown}&${show_addbtn}&${design_color}&${design_h}&${design_w}&${city_ar}`;
 finalCode = '<iframe height="560" width="100%" style="background:#f8f8f8;border:1px solid #ddd;" src="'+ embed_link +'"></iframe>';
  jQuery("#final-code").text(finalCode);
  jQuery('#iframe-container').html(finalCode);
})
jQuery("#design-color").on('change', function(e) {
  design_color = 'design-color='+e.target.value.replace("#", "");
   embed_link = `https://mawaqetsalat.com/embd?${country}&${city}&${show_chorouk}&${show_time}&${show_countdown}&${show_addbtn}&${design_color}&${design_h}&${design_w}&${city_ar}`;
 finalCode = '<iframe height="560" width="100%" style="background:#f8f8f8;border:1px solid #ddd;" src="'+ embed_link +'"></iframe>';
  jQuery("#final-code").text(finalCode);
  jQuery('#iframe-container').html(finalCode);
})
jQuery("#design-width").on('change', function(e) {
  design_w = 'design-w=' + e.target.value;
  jQuery("#w-current-value").text(e.target.value + '%');
   embed_link = `https://mawaqetsalat.com/embd?${country}&${city}&${show_chorouk}&${show_time}&${show_countdown}&${show_addbtn}&${design_color}&${design_h}&${design_w}&${city_ar}`;
 finalCode = '<iframe height="560" width="100%" style="background:#f8f8f8;border:1px solid #ddd;" src="'+ embed_link +'"></iframe>';
  jQuery("#final-code").text(finalCode);
  jQuery('#iframe-container').html(finalCode);
})
jQuery("#design-height").on('change', function(e) {
  design_h = 'design-h=' + e.target.value;
  jQuery("#h-current-value").text(e.target.value + 'px');
   embed_link = `https://mawaqetsalat.com/embd?${country}&${city}&${show_chorouk}&${show_time}&${show_countdown}&${show_addbtn}&${design_color}&${design_h}&${design_w}&${city_ar}`;
 finalCode = '<iframe height="560" width="100%" style="background:#f8f8f8;border:1px solid #ddd;" src="'+ embed_link +'"></iframe>';
  jQuery("#final-code").text(finalCode);
  jQuery('#iframe-container').html(finalCode);
})

jQuery("#copy-btn").on('click', function() {
  navigator.clipboard.writeText(finalCode);
})

jQuery('#iframe-container').html(finalCode);

fillCitySelect();
            
function fillCitySelect() {
  const country_select = document.getElementById("country_select"),
    city_select = document.getElementById("city_select");

  country_select.addEventListener("change", function (event) {
    const selected_country = event.target.value;
    // window.Location.origin
    const link =
      "https://mawaqetsalat.com/" +
      "/wp-json/prayertimes/v1/cities?country=" +
      selected_country;
    fetch(link)
      .then((res) => res.json())
      .then((cities) => {
        city_select.innerHTML = "<option selected>إختر المدينة</option>";
        cities.forEach((city) => {
          city_select.innerHTML += `<option value="${city[1]}" >${city[0]}</option>`;
        });
        
      });
  });
}
</script>
<?php  get_footer( ) ?>