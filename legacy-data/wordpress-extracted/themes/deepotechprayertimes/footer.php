    </div>
  </main>
  <?php if ( is_active_sidebar( 'footer_ads' )): ?>
  <div class="flex justify-center md:mt-80 "><?php dynamic_sidebar( "footer_ads" ) ?></div>
  <?php endif; ?>
<footer class="max-w-7xl mx-auto p-4 border-t border-gray-300 md:mt-80">
        <div class="flex justify-between">
          <p>جميع الحقوق محفوظة © 2024 - <a class="text-teal-600 font-medium" href="https://mawaqetsalat.com/">مواقيت الصلاة</a></p>
			<a class="text-teal-600 font-medium" href="https://mawaqetsalat.com/%d8%b3%d9%8a%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%ae%d8%b5%d9%88%d8%b5%d9%8a%d8%a9/">سياسة الخصوصية</a></p>
          <div>
          <ul class="flex text-lg">
              <li>
                <a href="https://www.facebook.com/informationpr"
                  ><i class="m-3 hover:text-teal-700 icofont-facebook"></i
                ></a>
              </li>
              <li>
                <a href="https://twitter.com/HElmorsli"
                  ><i class="m-3 hover:text-teal-700 icofont-twitter"></i
                ></a>
              </li>
              <li>
                <a href="https://www.instagram.com/hecoplus/"
                  ><i class="m-3 hover:text-teal-700 icofont-instagram"></i
                ></a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
    <?php wp_footer(); ?>
    
  </body>
  
</html>