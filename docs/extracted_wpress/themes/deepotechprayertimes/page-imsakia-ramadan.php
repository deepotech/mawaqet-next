<?php /* Template Name: imsakia ramadan Template */ ?>
<?php get_header(); ?>

<div class="mt-5">
<div
            id="alert-border-2"
            class="flex p-3 mb-4 bg-teal-100 border-t-4 border-teal-500 dark:bg-teal-200"
          >
            <i class="text-3xl text-teal-700 icofont-hand-drawn-left"></i>

            <div class="mr-3 text-lg font-medium text-teal-700">
              <h2>إختر الدولة والمدينة</h2>
            </div>
          </div>
              <div class="mb-5 w-2/3 flex justify-around">
                <div class="w-1/3 me-3">
                  <label for="country_select" class="sr-only"
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

                <div class="w-1/3">
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
              <div class="overflow-x-scroll">
              <table id="calendar-table" class="w-full text-right border border-gray-400 ">
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
                      رمضان
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
            <script>
            fillCitySelect();
            
            function fillCitySelect() {
  const country_select = document.getElementById("country_select"),
    city_select = document.getElementById("city_select");

  country_select.addEventListener("change", function (event) {
    const selected_country = event.target.value;
    // 
    const link =  
      "https://mawaqetsalat.com" +
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
getImsakiaData();
function getImsakiaData() {
  const monthsAr = {
        "January" : "يناير",
        "February" : "فبراير",
        "March" : "مارس",
        "April" : "أبريل",
        "May" : "مايو",
        "June" : "يونيو",
        "July" : "يوليو",
        "August" : "أغسطس",
        "September" : "سبتمبر",
        "October" : "أكتوبر",
        "November" : "نوفمبر",
        "December" : "ديسمبر",
       
      };
  const country_select = document.getElementById("country_select"),
    city_select = document.getElementById("city_select"),
    calendarTable = document.getElementById('calendar-table').getElementsByTagName('tbody')[0];
    todayHijri = new Intl.DateTimeFormat("ar-TN-u-ca-islamic", {
      day: "numeric",
      month: "long",
      weekday: "long",
      year: "numeric",
    }).format(Date.now()),
    todayArr = todayHijri.split(" ");
   
  city_select.addEventListener("change", function (event) {
    const link = `https://api.aladhan.com/v1/hijriCalendarByCity?city=${city_select.value}&country=${country_select.value}&method=2&month=09&year=${todayArr[todayArr.length - 2]}`;
    fetch(link)
      .then((res) => res.json())
      .then(({data}) => {
        data.forEach((day, i) => {
          console.log(day)
          const row = calendarTable.insertRow(i),
          cell1 = row.insertCell(0),
          cell2 = row.insertCell(1),
          cell3 = row.insertCell(2),
          cell4 = row.insertCell(3),
          cell5 = row.insertCell(4),
          cell6 = row.insertCell(5),
          cell7 = row.insertCell(6),
          cell8 = row.insertCell(7),
          cell9 = row.insertCell(8);
          cell1.classList = "border border-gray-400 py-2 ps-3 bg-gray-300 font-bold";
          cell2.classList = "border border-gray-400 py-2 ps-3";
          cell3.classList = "border border-gray-400 py-2 ps-3";
          cell4.classList = "border border-gray-400 py-2 ps-3";
          cell5.classList = "border border-gray-400 py-2 ps-3";
          cell6.classList = "border border-gray-400 py-2 ps-3";
          cell7.classList = "border border-gray-400 py-2 ps-3";
          cell8.classList = "border border-gray-400 py-2 ps-3";
          cell9.classList = "border border-gray-400 py-2 ps-3";
          
          cell1.innerHTML = day.date.hijri.weekday.ar;
          cell2.innerHTML =  i + 1;
          cell3.innerHTML =  day.date.gregorian.day + " " + monthsAr[day.date.gregorian.month.en] + " " + day.date.gregorian.year;
          cell4.innerHTML = day.timings.Fajr.substr(0, 5);
          cell5.innerHTML = day.timings.Sunrise.substr(0, 5);
          cell6.innerHTML = day.timings.Dhuhr.substr(0, 5);
          cell7.innerHTML = day.timings.Asr.substr(0, 5);
          cell8.innerHTML = day.timings.Maghrib.substr(0, 5);
          cell9.innerHTML = day.timings.Isha.substr(0, 5);
        })
        
      });
  });
}
            
            
            </script>
<?php  get_footer( ) ?>