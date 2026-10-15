getSalatTime = function (selectedCityName, selectedCountryName) {
  let link = "",
    prayerDataMonth = [],
    prayerData = {},
    calcMethod = 1,
    monthsAr = {
      January: "يناير",
      February: "فبراير",
      March: "مارس",
      April: "أبريل",
      May: "مايو",
      June: "يونيو",
      July: "يوليو",
      August: "أغسطس",
      September: "سبتمبر",
      October: "أكتوبر",
      November: "نوفمبر",
      December: "ديسمبر",
    };

  if (selectedCountryName == "saudi arabia") {
    calcMethod = 4;
  } else if (selectedCountryName == "kuwait") {
    calcMethod = 9;
  } else if (selectedCountryName == "qatar") {
    calcMethod = 10;
  } else if (selectedCountryName == "egypt") {
    calcMethod = 3;
  } else if (selectedCountryName == "morocco") {
    calcMethod = 15;
  } else {
    calcMethod = 8;
  }

  // https://api.aladhan.com/v1/calendarByCity?city=mecca&country=saudi%20arabia&method=4&month=01&year=2023
  link = `https://api.aladhan.com/v1/calendarByCity?city=${selectedCityName}&country=${selectedCountryName}&method=${calcMethod}`;

  fetch(link)
    .then((res) => res.json())
    .then((json) => {
      prayerDataMonth = [...json.data];

      clock(prayerDataMonth);
      let now = getCurrentTime(prayerDataMonth[0].meta.timezone),
        [nowDay, nowMonth, nowYear] = now.split(/, | /)[0].split("/");
      prayerData = prayerDataMonth[parseInt(nowDay) - 1];

      // console.log(prayerData);
      const hijri = prayerData.date.hijri;

      // console.log(this.time.split(':'));
      let dateGr = `${hijri.weekday.ar} ${prayerData.date.gregorian.day} ${
        monthsAr[prayerData.date.gregorian.month.en]
      } ${prayerData.date.gregorian.year}`;
      let dateAr = `  ${hijri.weekday.ar} ${hijri.day} ${hijri.month.ar} ${hijri.year}`;
      jQuery("#weekday").text(hijri.weekday.ar);
      jQuery("#today-date-ar").text(dateAr);
      jQuery("#today-date-gr").text(dateGr);
	 
      // if (!(selectedCountryName === "morocco")) {
      jQuery("#fajr").text(prayerData.timings["Fajr"].substr(0, 5));
      jQuery("#chorouk").text(prayerData.timings["Sunrise"].substr(0, 5));
      jQuery("#dohr").text(prayerData.timings["Dhuhr"].substr(0, 5));
      jQuery("#asr").text(prayerData.timings["Asr"].substr(0, 5));
      jQuery("#maghrib").text(prayerData.timings["Maghrib"].substr(0, 5));
      jQuery("#isha").text(prayerData.timings["Isha"].substr(0, 5));
      // }
      prayerTimeForMonth(prayerDataMonth, monthsAr);
    });
};

function prayerTimeForMonth(prayerDataMonth, monthsAr) {
  let now = getCurrentTime(prayerDataMonth[0].meta.timezone),
    [nowDay, nowMonth, nowYear] = now.split(/, | /)[0].split("/");
  const calendarTable = document
    .getElementById("prayer-time-table")
    .getElementsByTagName("tbody")[0];

  prayerDataMonth.forEach((day, i) => {
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
       if (i == parseInt(nowDay) - 1) row.classList = "bg-teal-100";
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
    cell2.innerHTML =
      day.date.hijri.day +
      " " +
      day.date.hijri.month.ar +
      " " +
      day.date.hijri.year;
    cell3.innerHTML =
      day.date.gregorian.day +
      " " +
      monthsAr[day.date.gregorian.month.en] +
      " " +
      day.date.gregorian.year;
    cell4.innerHTML = day.timings.Fajr.substr(0, 5);
    cell5.innerHTML = day.timings.Sunrise.substr(0, 5);
    cell6.innerHTML = day.timings.Dhuhr.substr(0, 5);
    cell7.innerHTML = day.timings.Asr.substr(0, 5);
    cell8.innerHTML = day.timings.Maghrib.substr(0, 5);
    cell9.innerHTML = day.timings.Isha.substr(0, 5);
  });
}

function clock(prayerDataMonth) {
  let now = getCurrentTime(prayerDataMonth[0].meta.timezone),
    [nowHours, nowMinuts, nowSeconds] = now.split(/, | /)[1].split(":"),
     [nowDay, nowMonth, nowYear] = now.split(/, | /)[0].split("/");
  prayerData = prayerDataMonth[parseInt(nowDay) - 1];

  const [day, month, year] = prayerData.date.gregorian["date"].split("-");

  let [f_hours, f_minuts] = prayerData.timings["Fajr"].substr(0, 4).split(":"),
    [d_hours, d_minuts] = prayerData.timings["Dhuhr"].substr(0, 4).split(":"),
    [a_hours, a_minuts] = prayerData.timings["Asr"].substr(0, 4).split(":"),
    [m_hours, m_minuts] = prayerData.timings["Maghrib"].substr(0, 4).split(":"),
    [i_hours, i_minuts] = prayerData.timings["Isha"].substr(0, 4).split(":"),
    fajr = new Date(year, month - 1, day, f_hours, f_minuts, 0),
    dhuhr = new Date(year, month - 1, day, d_hours, d_minuts, 0),
    asr = new Date(year, month - 1, day, a_hours, a_minuts, 0),
    maghrib = new Date(year, month - 1, day, m_hours, m_minuts, 0),
    isha = new Date(year, month - 1, day, i_hours, i_minuts, 0),
    nowTimestamp = new Date(
      nowYear,
      nowMonth - 1,
      nowDay,
      nowHours,
      nowMinuts,
      nowSeconds
    );

  let sec = (fajr - nowTimestamp) / 1000,
    next_prayer = "الفجر",
    selector = "#adan-fajr";

  if (sec > 0) {
    next_prayer = "الفجر";
  } else if ((dhuhr - nowTimestamp) / 1000 > 0) {
    next_prayer = "الظهر";
    selector = "#adan-dohr";
    sec = (dhuhr - nowTimestamp) / 1000;
  } else if ((asr - nowTimestamp) / 1000 > 0) {
    next_prayer = "العصر";
    selector = "#adan-asr";
    sec = (asr - nowTimestamp) / 1000;
  } else if ((maghrib - nowTimestamp) / 1000 > 0) {
    next_prayer = "المغرب";
    selector = "#adan-maghrib";
    sec = (maghrib - nowTimestamp) / 1000;
  } else if ((isha - nowTimestamp) / 1000 > 0) {
    next_prayer = "العشاء";
    selector = "#adan-isha";
    sec = (isha - nowTimestamp) / 1000;
  } else {
    next_prayer = "الفجر";
    selector = "#adan-fajr";
    fajr = fajr.setDate(fajr.getDate() + 1);
    sec = (fajr - nowTimestamp) / 1000;
  }

  let h = parseInt(sec / 3600),
    m = parseInt((sec % 3600) / 60),
    s = (sec % 3600) % 60;

  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  s = s < 10 ? "0" + s : s;

  jQuery("#next-prayer").text(next_prayer);
  jQuery("#before-countdown").text(next_prayer);

  jQuery("#countdown").text(h + ":" + m + ":" + s);
  jQuery(selector + " .timer").text(h + ":" + m + ":" + s);
  jQuery(selector).css("display", "block");
  jQuery("#time-now").text(now.split(",")[1]);
  setTimeout(clock, 1000, prayerDataMonth);
}

function getCurrentTime(timezone) {
  // console.log(timezone);
  let options = {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  return new Date().toLocaleDateString("en-GB", options);
  // this.timeout = setTimeout(this.getCurrentTime, 1000);
  // console.log(this.time);
}


const menu = document.getElementById("menu"),
        menu_items = document.getElementById("navbar-solid-bg");

      menu.addEventListener("click", function (event) {
        menu_items.classList.toggle("hidden");
      });

let city_data = [];
jQuery("#city-search").on("input", function (event) {
  jQuery("#search-list").html("");
  const link =
    "https://mawaqetsalat.com/wp-json/prayertimes/v1/cities-with-country";

  if (city_data.length === 0) {
    fetch(link)
      .then((res) => res.json())
      .then((cities) => {
        city_data = cities;
      });
  }

  const search_term = event.target.value.toLowerCase();
  let city_list = "<ul>";
  const filtred_list = city_data.filter(function (city) {
    return (
      city.cityAr.toLowerCase().includes(search_term) ||
      city.cityEn.toLowerCase().includes(search_term)
    );
  });
  if (filtred_list.length !== city_data.length) {
    filtred_list.forEach(function (city) {
      city_list += `<li><a class="p-4 block hover:bg-teal-200" href="${city.link}">${city.cityAr}, ${city.country}</a></li>`;
    });
    city_list += "</ul>";

    jQuery("#search-list").html(city_list);
  }
});
