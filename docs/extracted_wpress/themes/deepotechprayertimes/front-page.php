<?php get_header(); ?>

<div>
<form class="flex items-center mb-4 relative ">
            <label for="simple-search" class="sr-only">Search</label>
            <div class="relative w-full">
              <div
                class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
              >
                <svg
                width="20px"
                height="20px"
                  aria-hidden="true"
                  class="w-5 h-5 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
              <input
               autocomplete="off"
                type="text"
                id="city-search"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full pr-10 p-4"
                placeholder="بحث عن المدينة ..."
              />
              <div
                class="absolute top-full bg-white w-full shadow-md max-h-80 overflow-y-scroll"
                id="search-list"
              ></div>
            </div>
            <button
              type="submit"
              class="p-4 mr-2 text-sm font-medium text-white bg-teal-600 rounded-lg border border-tealbg-teal-600 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300"
              title="search"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
              <span class="sr-only">Search</span>
            </button>

            <!-- <button
              type="submit"
              class=" p-4 mr-2 text-sm font-medium text-white bg-teal-600 rounded-lg border border-tealbg-teal-600 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300"
              title="My position"
            >
            <i class="text-md icofont-location-pin"></i>
             
              <span class="sr-only">Search</span>
            </button> -->
	
           
          </form>
  <div
            id="alert-border-2"
            class="flex p-3 mb-4 bg-teal-100 border-t-4 border-teal-500 dark:bg-teal-200"
          >
            <i class="text-3xl text-teal-700 icofont-hand-drawn-left"></i>

            <div class="mr-3 text-lg font-medium text-teal-700">
            <h1>  مواقيت الصلاة في جميع دول العالم  </h1>
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
          ?>
             <li class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 mx-3 my-3">
                <a
                href="<?php the_permalink( ) ?>"
                  type="button"
                  class="text-gray-900 h-12 rounded-full justify-between w-full bg-white focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium text-sm text-center inline-flex items-center ps-4 pe-px py-px shadow-md"
                >
                  <h2 class="font-bold"><?php  the_field('country_name') ?></h2>
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