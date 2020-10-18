const musicInfo = [];

function addTagFromField() {
  return new Promise((resolve, reject)=>{
    const info = $('#tagsField').eq(0).val();
   
    if(info.length > 2){
      musicInfo.push(info);
      renderList();
      $('#tagsField').eq(0).val('');
      return resolve(info);
    }
    else{

      return reject("error");
    }
});
}
function getSynonymsArrayFromRespond(data){
    var finalArray = [];
    data.response.forEach(element=>{
    var synonyms_array = [...element.list.synonyms.matchAll(/(\w|\s)(\w|\s)*\w/g)];
    var filtered_synonyms_array = synonyms_array.filter(synonym => synonym[0] != "generic term");
    var filtered_synonyms_array = filtered_synonyms_array.filter(synonym => synonym[0] != "antonym");
    var only_terms_array = filtered_synonyms_array.map(elem => elem[0]);
    finalArray = finalArray.concat(only_terms_array);
  }
    );
    let uniquefinalArray = [...new Set(finalArray)];
    return uniquefinalArray;
}
function fillEnginesSectionWithSynonyms(synonymsArray){
  synonymsArray.forEach((elem)=>$(".engine").append($('<div class="item"></div>').text(elem)));
}
function callForSynonyms(info){
  $.get(`http://thesaurus.altervista.org/thesaurus/v1?key=HPFgRxhyo2eYa7NMKxWH&word=${info}&language=en_US&output=json`,(data)=>{
    synonymsArray = getSynonymsArrayFromRespond(data);
    fillEnginesSectionWithSynonyms(synonymsArray);
  })
};

$('#addButton').click(()=>{
  const newtagpromise = addTagFromField();
  newtagpromise.then((info)=>{callForSynonyms(info);}).catch((err)=>{console.log(err)});
});
$('#tagsField').keyup(function(event) {
  if (event.which == 13) {
    const newtagpromise = addTagFromField();
    newtagpromise.then((info)=>{callForSynonyms(info);}).catch((err)=>{console.log(err)});
  }
});

function renderList() {
  const $list = $('.info').eq(0);

  $list.empty();

  for (const info of musicInfo) {
    const $item = $('<div class="item"></div>').text(info);

    $list.append($item)
  }
}

$('#getPlaylistBtn').click(function (event) {
  // TODO: Display a list of music.
  // You may use anything from musicInfo.
  console.log('Testing Music Call');
});


