
// Add Initialize for google map from google init (Search on google)
let map;
let bounds;

async function initMap() {
    const center = { lat: 30.044420, lng: 31.235712 }
    const zoom = 6;
  const { Map } = await google.maps.importLibrary("maps");
  map = new Map(document.getElementById("mapContainer"), {
    center: center,
    zoom: zoom,
    // لحذف الازرار الافتراضية من الخريطة
    disableDefaultUI: true
  });
  // لجعل الخريطة تنتقل الى المنطقة المختارة
  bounds = new google.maps.LatLngBounds();
  console.log(bounds);
}

window.initMap = initMap;

const API_KEY = '916cd2a7f4msh05963b54a842cb5p1a113djsn3c09d641f69a'

// api that bring the countries form rapidAPI GeoDB Cities API
const fetchCountries =  async () => {
    const url = 'https://wft-geo-db.p.rapidapi.com/v1/geo/countries?limit=10&offset=40';
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': API_KEY,
		'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.json();
	return result.data;
} catch (error) {
	console.error(error);
}
}
// fetchCountries();

// api thet bring hotels name form HOTELs API on rapidapi
const fetchHotels = async (country) => {
    const url = `https://hotels4.p.rapidapi.com/locations/v3/search?q=${country}&siteid=300000001`;
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': API_KEY,
		'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.json();
    const resultAr = result.sr;
	console.log(result.sr);
    console.log(result.sr[1].regionNames.fullName);
    result.sr.map((hotel, index)=> {
        const lat = parseFloat(hotel.coordinates.lat);
        const lng = parseFloat(hotel.coordinates.long);
        const position = {lat, lng}
        // ازا أردنا تغيير شكل الماركر على الخريطة والتحكم بحجمها نستخدم هذه ونضيف المتغير ايكون الى النيو ف=غوغل ماركر اسفل البوزيشن
        const icon = {
            url: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fmap-marker&psig=AOvVaw0qfV8TqEGd1ZEVNS6r7bCn&ust=1685632575462000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCOCc1ujsn_8CFQAAAAAdAAAAABAE',
            scaledSize: new google.maps.Size(40, 40)
        }
        new google.maps.Marker({
        position,
        label: result.sr[index].regionNames.displayName,
        map
        })
        console.log(position);
        // لتوسيع الخريطة عند تحديد ماركرز جدد
        bounds.extend(new google.maps.LatLng(position));
        map.fitBounds(bounds);
    })
    console.log(bounds);

} catch (error) {
	console.error(error);
}
}


// Add Countries list 
(async function loadCountries() {
    const countries = await fetchCountries();
    const countriesList = document.getElementById('countries_list')
    const countriesInput = document.querySelector('#countries_input')
    for (let i = 0 ; i < countries.length ; i++) {
        countriesList.innerHTML += `
        <li data-country="${countries[i].name}">${countries[i].name}</li>
        `
    }
    
    countriesList.style.display = "none";
    countriesInput.addEventListener('click', function() {
        countriesList.style.display = "block";
    })
    const allCountries = Array.from(countriesList.children);
    allCountries.map(
        country => 
        country.addEventListener('click', function(e) {
            const selectedCountry = e.target.dataset.country
            countriesInput.value = e.target.dataset.country
            countriesList.style.display = "none"
            fetchHotels(selectedCountry);
        })
    );
})()


const search = document.getElementById('search');
const suggestList = document.getElementById('auto_sggest_list');
search.addEventListener('input', async function(e) {
    if (e.target.value === '') {
        suggestList.innerHTML = '';
        
    } else {
        console.log(e.target.value);
    const countries = await fetchCountries()
    const selectedCounties = countries.filter((country)=> {
        return country.name.toLowerCase().startsWith(e.target.value);
    })
    suggestList.innerHTML = '';
    selectedCounties.map(country => {
        suggestList.innerHTML += `
        <li data-country="${country.name}">${country.name}</li>
        ` 
    })
    const filterCountries = Array.from(suggestList.children);
    filterCountries.map((country)=>{
        country.addEventListener('click', function(e) {
            fetchHotels(e.target.dataset.country)
            suggestList.innerHTML = '';
            search.value = e.target.dataset.country
        })
    })
    }
})