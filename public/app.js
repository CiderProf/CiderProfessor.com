$(function(){

  $(".menu-icon").click( function() {
    $(".nav-list").toggleClass("hide");
  });

  if($(window).width() < 780) {
    $(".compslistRow td:nth-last-child(2)").toggleClass("padding-right")
  }

  if($(window).width() > 780) {
    $(".nav-list").removeClass("hide");
    $(".last-td").removeClass("hide");
  }
  if($(window).width() > 1080) $(".app-icon-placeholder").toggleClass("hide");

  $("#gradebook").click( function() {
    $(".gradebook").toggleClass("hide");
  });

  $("#gradebook ul").click( function(e){
    let $this = e.target.children;
    if($this && $this.length > 0){
      $(e.target.children).toggleClass("hide");    
    }
    $(this).toggleClass("hide");
  });

  $(".style").click( function() {
    $(this).next().children().toggleClass("hide");
    $(this).parent().toggleClass("hide");
  });

  $("#complit").click( function() {
    $(".complit").toggleClass("hide");
  });

  $("#complit ul").click( function(e){
    let $this = e.target.children;
    if($this && $this.length > 0){
      $(e.target.children).toggleClass("hide");    
    }
    $(this).toggleClass("hide");
  });

  $(".litstyle").click( function() {
    $(this).find(".sub-style").toggleClass("hide");
    $(this).parent().toggleClass("hide");
  })

  $("#cidreviews").click( function() {
    $(".cidreviews").toggleClass("hide");
  });

  $("#crgeography").click( function() {
    $(".crgeography").toggleClass("hide");
    $(this).parent().toggleClass("hide");
  });

  $(".state").click( function() {
    $(this).find(".state-item").toggleClass("hide");
    $(this).parent().toggleClass("hide");
  })

  $(".listRow").click(function () {
    var id = $( this ).attr("title");
    window.location.href = `/ciderdetail/${id}`;
  })
  $('.compslistRow').click(function () {
    var id = $( this ).attr("title");
    window.location.href = `/complits/${id}`;
  })

  $(".gradebookboxes li").hover((element) => {
    $(element).toggleClass("grow")
  });

  $('#vmap').vectorMap({ 
    map: 'usa_en', 
    backgroundcolor: '#D6D2C4',
    color: '#002b49',
    hoverColor:  '#CCE2EE',
    selectedColor: '#CCE2EE',
    onRegionClick: function(element, code)
      {
        let state = Object.keys(states_hash).find(key => states_hash[key] == code.toUpperCase());
        if(rejects.includes(code.toUpperCase())) return;
        else window.location.href = `/ciderlocations/${state}`;
      }
  });

  getCiderStates();

});



let states = {};
function getCiderStates() {
  $.get('/getCiderStates')
  .then( res => {
    let codes = res.map( state => {
      if(Object.keys(states_hash).includes(state)) return states_hash[state].toLowerCase();
    });
    codes.forEach(state => {
      states[state] = '#F1C400';
    });
    $('#vmap').vectorMap('set', 'colors', states);
    $('#vmap').vectorMap('set', 'backgroundColor', '#D6D2C4')
  })
}

states_hash =
  {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District Of Columbia': 'DC',
    'Washington DC': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
  }

  const rejects = [
    'AL',
    'AR',
    'DE',
    'HI',
    'LA',
    'MS',
    'NV',
    'NC',
    'OK',
    'RI'
  ]