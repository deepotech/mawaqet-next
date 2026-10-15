<?php /* Template Name: Embed Template */ ?>
<html dir="rtl" >

<head>
<?php wp_head( )?>
<style>
  html {margin-top: 0 !important;}
</style>
</head>
<body>
<div >
            <div class="p-4 w-full bg-white rounded-lg border shadow-md sm:p-8">
              <div class="flex justify-between items-center mb-4">
                <h5 id="selected-place" class="text-xl font-bold leading-none text-gray-900">
                  مواقيت الصلاة في مكة المكرمة
                </h5>
                <p
                id="time-now"
                  class="text-sm font-medium text-teal-600 hover:underline dark:text-teal-500"
                >
                  
                </p>
              </div>
              <div class="flow-root">
                <ul
                  role="list"
                  class="divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <li class="py-3 sm:py-4">
                    <div class="flex items-center space-x-4">
                      <div class="flex-shrink-0 ml-3">
                        <i
                          class="text-3xl icofont-wall-clock text-teal-900"
                        ></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-teal-900 truncate">
                          صلاة الفجر
                        </p>
                        <p
                        id="adan-fajr"
                        style="display:none"
                          class="text-sm text-teal-500 truncate dark:text-teal-400"
                        >
                          أذان صلاة الفجر بعد: <span class="timer"></span>
                        </p>
                      </div>
                      <div
                      id="fajr"
                        class="inline-flex items-center text-base font-semibold text-teal-900"
                      >
                        05:09
                      </div>
                    </div>
                  </li>
                  <li id="chorouk-b" class="py-3 sm:py-4">
                    <div class="flex items-center space-x-4">
                      <div class="flex-shrink-0 ml-3">
                        <i class="text-3xl icofont-sun-rise"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          الشروق
                        </p>
                      </div>
                      <div
                        id="chorouk"
                        class="inline-flex items-center text-base font-semibold text-gray-900"
                      >
                        06:23
                      </div>
                    </div>
                  </li>
                  <li class="py-3 sm:py-4">
                    <div class="flex items-center space-x-4">
                      <div class="flex-shrink-0 ml-3">
                        <i class="text-3xl icofont-wall-clock"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          صلاة الظهر
                        </p>
                        <p
                        id="adan-dohr"
                        style="display:none"
                          class="text-sm text-teal-500 truncate dark:text-teal-400"
                        >
                          أذان صلاة الظهر بعد: <span class="timer"></span>
                        </p>
                      </div>
                      <div
                      id="dohr"
                      
                        class="inline-flex items-center text-base font-semibold text-gray-900"
                      >
                        12:15
                      </div>
                    </div>
                  </li>
                  <li class="py-3 sm:py-4">
                    <div class="flex items-center space-x-4">
                      <div class="flex-shrink-0 ml-3">
                        <i class="text-3xl icofont-wall-clock"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          صلاة العصر
                        </p>
                        <p
                        id="adan-asr"
                        style="display:none"
                          class="text-sm text-teal-500 truncate dark:text-teal-400"
                        >
                          أذان صلاة العصر بعد: <span class="timer"></span>
</p>
                      </div>
                      <div
                      id="asr"
                        class="inline-flex items-center text-base font-semibold text-gray-900"
                      >
                        03:36
                      </div>
                    </div>
                  </li>
                  <li class="py-3 sm:pt-4">
                    <div class="flex items-center space-x-4">
                      <div class="flex-shrink-0 ml-3">
                        <i class="text-3xl icofont-wall-clock"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          صلاة المغرب
                        </p>
                        <p
                        id="adan-maghrib"
                        style="display:none"
                          class="text-sm text-teal-500 truncate dark:text-teal-400"
                        >
                          أذان صلاة المغرب بعد: <span class="timer"></span>
</p>
                      </div>
                      <div
                      id="maghrib"
                        class="inline-flex items-center text-base font-semibold text-gray-900"
                      >
                        06:06
                      </div>
                    </div>
                  </li>
                  <li class="pt-3 sm:pt-4">
                    <div class="flex items-center space-x-4">
                      <div class="flex-shrink-0 ml-3">
                        <i class="text-3xl icofont-wall-clock"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          صلاة العشاء
                        </p>
                        <p
                        id="adan-isha"
                        style="display:none"
                          class="text-sm text-teal-500 truncate dark:text-teal-400"
                        >
                          أذان صلاة العشاء بعد: <span class="timer"></span>
</p>
                      </div>
                      <div
                      id="isha"
                        class="inline-flex items-center text-base font-semibold text-gray-900"
                      >
                        07:20
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <p class="my-4 px-3 text-sm">
                مواقيت الصلاة بحسب التوقيت المحلي لمدينة <span id="city"></span> ليوم
                <span id="today-date-ar"></span>
              </p>
              <button
                id="add-btn"
                type="button"
                class="w-full justify-center text-teal-900 bg-white hover:bg-teal-100 border border-teal-200 focus:ring-4 focus:outline-none focus:ring-teal-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-teal-600 dark:bg-teal-800 dark:border-teal-700 dark:text-white dark:hover:bg-teal-700"
              >
                <i class="text-2xl ml-3 icofont-code"></i>
                إضافة هذا التوقيت لموقعك
              </button>
            </div>
            <script>
              const url = new URLSearchParams(decodeURIComponent(document.location.href));
              let country = url.get("country-s"),
              city = url.get("city-s"),
              chorouk = url.get("show-chorouk"),
              time = url.get("show-time"),
              countdown = url.get("show-countdown"),
              addbtn = url.get("show-addbtn"),
              color = url.get("design-color"),
              height = url.get("design-h"),
              width = url.get("design-w"),
              city_ar = url.get("city-ar");

              if(!parseInt(countdown)) {
                jQuery('[id^="adan-"]').hide()
              }
              
              // let d = parseInt(addbtn) ? "block":"none";
              jQuery("#add-btn").css("display", parseInt(addbtn) ? "block":"none");
              jQuery("#chorouk-b").css("display", parseInt(chorouk) ? "block":"none");
              jQuery("#time-now").css("display", parseInt(time) ? "block":"none");
              jQuery("#adan-time").css("display", parseInt(countdown) ? "block":"none");
              jQuery("#add-btn").css("background-color", "#" + color);
              jQuery("#adan-time").css("color", "#" + color);
              jQuery("#time-now").css("color", "#" + color);
              jQuery("#selected-place").text(`مواقيت الصلاة في ${city_ar}`);
              jQuery("#city").text(city_ar);
              jQuery(document).ready(function () {
                getSalatTime(city,country); 
              });
            </script>
          </div>
          <?php wp_footer( )?>
</body>
          </html>