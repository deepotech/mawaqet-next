<!DOCTYPE html>
<html <?php language_attributes(); ?>>
	
  <head>
	  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6331163447795368"
     crossorigin="anonymous"></script>
	  <meta name="yandex-verification" content="0bb69223fb081911" />
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
    <title>مواقيت الصلاة</title>
	  <meta name="google-site-verification" content="CYJSyxTsV4b7XbSze2wiTr7nKTp1Ch5CCpPCJQbpcs8" />
    <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Z3189YVP04"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-Z3189YVP04');
</script>
	  
  </head>
  <body class="bg-gray-100">
  <div>
      <header>
        <nav class="bg-teal-600">
          <div
            class="container px-4 py-3 max-w-7xl flex flex-wrap justify-between items-center mx-auto"
          >
            <a href="<?php echo site_url() ?>" class="flex items-center">
              <img
                src="<?php echo get_theme_file_uri('/imgs/salat.png'); ?>"
                class="me-3 h-6 sm:h-10"
                alt="Flowbite Logo"
              />
              <h3
                class="self-center text-xl font-semibold whitespace-nowrap text-white"
                >مواقيت الصلاة
              </h3>
            </a>
            <button
              id="menu"
              data-collapse-toggle="navbar-solid-bg"
              type="button"
              class="inline-flex justify-center items-center me-3 text-gray-400 rounded-lg md:hidden hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-gray-400 dark:hover:text-white dark:focus:ring-gray-500"
              aria-controls="navbar-solid-bg"
              aria-expanded="false"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="w-6 h-6"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
            <div class="hidden w-full md:block md:w-auto" id="navbar-solid-bg">
              <ul
                class="flex flex-col mt-4 bg-teal-600 rounded-lg md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-transparent dark:bg-teal-600 md:dark:bg-transparent dark:border-gray-700"
              >
                <li class="pe-8">
                  <a
                    href="<?php echo site_url('imsakia-ramadan') ?>"
                    class="block py-2 pl-4 pr-3 text-white bg-teal-600 rounded md:bg-transparent  md:p-0 md:text-white dark:bg-teal-600 md:dark:bg-transparent"
                    aria-current="page"
                    >إمساكية رمضان</a
                  >
                </li>
                <li class="pe-8">
                  <a
                    href="<?php echo site_url('developers') ?>"
                    class="block py-2 pl-4 pr-3 text-white bg-teal-600 rounded md:bg-transparent  md:p-0 md:text-white dark:bg-teal-600 md:dark:bg-transparent"
                    aria-current="page"
                    >المطورون</a
                  >
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <?php if ( is_active_sidebar( 'header_ads' )): ?>
      <div class="flex justify-center  "><?php dynamic_sidebar( "header_ads" ) ?></div>
      <?php endif; ?>
      <main class="">
        <div class="max-w-7xl mx-auto p-4">