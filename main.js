
let your_scores = [];

let song_element = document.getElementById("songs");

let html = '<table class="table table-striped table-sm overflow-auto table-responsive" style="height:400px;">';
html +="<thead><tr><th></th><th>曲名</th><th>作詞</th><th>作曲</th><th>編曲</th><th>歌手</th></tr></thead>";
html += '<tbody class="small">';
for (let i=0; i<songs.length; i++){
    const song = songs[i];
    if (song["ミリシタ"]=="未") continue;
    let idols = "";
    if (song.Idol1) idols += song.Idol1;
    if (song.Idol2) idols += ", " + song.Idol2;
    if (song.Idol3) idols += ", " + song.Idol3;
    if (song.Idol4) idols += ", " + song.Idol4;
    if (song.Idol5) idols += ", " + song.Idol5;

    html += `<tr><td><input type="checkbox" name="checkbox" value="${song["ID"]}"></td><td>${song["Title"]}</td><td>${song["作詞"]}</td><td>${song["作曲"]}</td><td>${song["編曲"]}</td><td>${idols}</td></tr>`;
};
html += "</tbody>";
html +="</table>";

song_element.innerHTML = html;
/*
window.addEventListener('DOMContentLoaded', function(){
    $.get("scoredsongs.json", (data) => {
        // JSONデータを受信した後に実行する処理
        const songs = $.parseJSON(data);
        alert(songs[0]["ID"]);
    }); 
});
*/
function updateData(chart, labels, dataset){
    //removeData(chart);
    chart.data.labels = labels;
    chart.data.datasets[0].data = dataset;
    chart.update();
}

const barChartData = {
    labels: [],
    datasets: [{
        label: 'ポイント',
        data: [],
    }]
};

const ctx = document.getElementById("graph").getContext("2d");
let chart = new Chart(ctx, {
    type: 'horizontalBar',
    data: barChartData,
    options: {
        responsive: true,
        scales: {
            xAxes: [{
                display: true,
                ticks: {
                    suggestedMin: 0, // minimum will be 0, unless there is a lower value.
                    // OR //
                    beginAtZero: true, // minimum value will be 0.
                    stepSize: 1,
                }
            }]
        }
    }
});

function updateScores(){

    let scores = [];
    $("input[type='checkbox']").filter(":checked").each(function (index, element) {
        const song = songs.find((song) => song.ID === $(element).val());

        for (let i = 0; i < song.scores.length; i++) {
            const artist = song.scores[i]['artist'];

            const score = scores.find((v) => v.artist === artist);

            if (score) {
                score.value += song.scores[i]['value'];
            } else {
                scores.push({artist:artist, value:song.scores[i]['value']});
            }

        }
    });

    scores.sort((a, b) => {
        if (a.value > b.value) return -1;
        if (a.value < b.value) return 1;
        return 0;
    });

    return scores;
}

function updateGraph(){

    const scores = your_scores;

    let labels = [];
    let dataset = [];
    for (let i = 0; i < scores.length; i++){
        labels.push(scores[i].artist);
        dataset.push(scores[i].value);
    }
    updateData(chart, labels, dataset);

}

function updateRecommends(){
    let recommended_songs = [];



    for (let i = 0; i < songs.length; i++){
        const song = songs[i];
        if (song["ミリシタ"]=="未"){
            let total_score = 0;
            
            for (let j = 0; j<song.scores.length; j++){
                const artist = song.scores[j].artist;
                const value = song.scores[j].value;
                const score = your_scores.find((v) => v.artist === artist);
                if (score) {
                    total_score += score.value*value;

                }
            }
            if (total_score > 0) {
                let recommended_song = song;
                song.scores.total_score = total_score;
                recommended_songs.push(song);
            }
        }
        
    }
    recommended_songs.sort((a, b) => {
        if (a.scores.total_score > b.scores.total_score) return -1;
        if (a.scores.total_score < b.scores.total_score) return 1;
        return 0;
    });
    //console.log(recommended_songs);

    let song_element = document.getElementById("recommends");

    let html = '<table class="table table-striped table-sm overflow-auto table-responsive" style="height:400px;">';
    html += "<thead><tr><th>ポイント</th><th>曲名(試聴)</th><th>作詞</th><th>作曲</th><th>編曲</th><th>歌手</th></tr></thead>";
    html += '<tbody class="small">';
    for (let i = 0; i < recommended_songs.length; i++) {
        const song = recommended_songs[i];

        let idols = "";
        if (song.Idol1) idols += song.Idol1;
        if (song.Idol2) idols += ", " + song.Idol2;
        if (song.Idol3) idols += ", " + song.Idol3;
        if (song.Idol4) idols += ", " + song.Idol4;
        if (song.Idol5) idols += ", " + song.Idol5;

        html += `<tr><td>${song.scores.total_score}</td><td><a href="${song["試聴"]}">${song["Title"]}</a></td><td>${song["作詞"]}</td><td>${song["作曲"]}</td><td>${song["編曲"]}</td><td>${idols}</td></tr>`;
    };
    html += "</tbody>";
    html += "</table>";

    song_element.innerHTML = html;
}

$('input[name=checkbox]').change(function () {
    your_scores = updateScores();
    updateGraph();
    updateRecommends();
});