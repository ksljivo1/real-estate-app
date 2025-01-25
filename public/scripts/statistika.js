document.getElementById('min_kvadratura').addEventListener('input', (event) => {
    const value = event.target.value
    document.getElementById('min_kvadratura_value').innerHTML = value + ' m<sup>2</sup>'
})

document.getElementById('max_kvadratura').addEventListener('input', (event) => {
    const value = event.target.value
    document.getElementById('max_kvadratura_value').innerHTML = value + ' m<sup>2</sup>'
})

document.getElementById('min_cijena').addEventListener('input', (event) => {
    const value = event.target.value
    document.getElementById('min_cijena_value').innerHTML = value + ' KM'
})

document.getElementById('max_cijena').addEventListener('input', (event) => {
    const value = event.target.value
    document.getElementById('max_cijena_value').innerHTML = value + ' KM'
})

function filterNekretnine() {
    event.preventDefault()
    let spisakNekretnina = SpisakNekretnina()
    spisakNekretnina.init(listaNekretnina, listaKorisnika)
    let filtriranaListaNekretnina = spisakNekretnina.filtrirajNekretnine({
        max_kvadratura: document.getElementById('max_kvadratura').value,
        min_kvadratura: document.getElementById('min_kvadratura').value,
        max_cijena: document.getElementById('max_cijena').value,
        min_cijena: document.getElementById('min_cijena').value
    })
    spisakNekretnina.init(filtriranaListaNekretnina, listaKorisnika)
    spojiNekretnine(document.getElementById('spisakNekretnina'), spisakNekretnina, document.getElementById('tip_nekretnine').value)
}

const statistika = StatistikaNekretnina();
statistika.init(listaNekretnina, listaKorisnika);

// Update DOM with statistical data
const prosjecnaKvadratura = statistika.prosjecnaKvadratura(() => true);
document.getElementById("prosjecna-kvadratura").textContent = `${prosjecnaKvadratura.toFixed(2)} m²`;

const outlierCijena = statistika.outlier(() => true, "cijena");
document.getElementById("outlier-po-cijenama").textContent =
    `${outlierCijena.cijena} KM`;

// Find outlier by "kvadratura"
const outlierKvadratura = statistika.outlier(() => true, "kvadratura");
document.getElementById("outlier-po-kvadraturi").textContent =
    `${outlierKvadratura.kvadratura} m²`;

let indeks1 = 0
let indeks2 = 0

function dodajRasponCijena() {
    event.preventDefault();
    document.getElementById("rasponi-cijena").innerHTML += `
        <div id="dr" style="display: flex; justify-content: space-evenly; width: 100%">
            <label>Unesite minmalnu cijenu
                    <input type="number" id=minCijena${indeks1}>
            </label>
            <label>Unesite maksimalnu cijenu
                    <input type="number" id=maxCijena${indeks1}>
            </label>
        </div
    `
    indeks1 = indeks1 + 1
}

function dodajVremenskiPeriod() {
    event.preventDefault();
    document.getElementById("vremenski-periodi").innerHTML += `
        <div id="dv" style="display: flex; justify-content: space-evenly; width: 100%">
        <label>Odaberite pocetni datum objave
                <input type="date" id=pocetniDatum${indeks2}>
            </label>
            <label>Odaberite krajnji datum objave
                <input type="date" id=krajnjiDatum${indeks2}>
            </label>
        </div>
    `
    indeks2 = indeks2 + 1
}

function iscrtajHistogram() {
    event.preventDefault();
    let rasponiCijena = []
    let vremenskiRasponi = []

    for (let i = 0; i < indeks2; i++) {
        vremenskiRasponi.push({
            od: document.getElementById("pocetniDatum" + i).value.substr(0, 4) * 1,
            do: document.getElementById("krajnjiDatum" + i).value.substr(0, 4) * 1
        });
    }

    for (let i = 0; i < indeks1; i++) {
        rasponiCijena.push({
            od: document.getElementById("minCijena" + i).value,
            do: document.getElementById("maxCijena" + i).value
        });
    }

    let histogram = StatistikaNekretnina().histogramCijena(vremenskiRasponi, rasponiCijena)
    let data = []
    let indeks = 0


    const chartsContainer = document.getElementById("charts");

    for (hist of histogram) {
        if (indeks !== hist.indeksPerioda) {
            const canvas = document.createElement("canvas");
            canvas.id = `myChart${indeks}`;
            chartsContainer.appendChild(canvas);

            const ctx = document.getElementById(`myChart${indeks}`).getContext("2d");

            new Chart(ctx, {
                type: 'bar',
                data: {
                    datasets: [{
                        label: "Broj nekretnina u periodu " + vremenskiRasponi[indeks].od + "-" + vremenskiRasponi[indeks].do,
                        data: data,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                // Show custom tooltips with od and do values
                                label: function (tooltipItem) {
                                    const {raw} = tooltipItem;
                                    return `From: ${raw.od}, To: ${raw.do}, Height: ${raw.brojNekretnina}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            min: Math.min(...data.map(x => x.od)),         // Set x-axis minimum value
                            max: Math.max(...data.map(x => x.do)),        // Set x-axis maximum value
                            ticks: {
                                stepSize: 10000  // Tick step
                            }
                        },
                        y: {
                            beginAtZero: true, // Start y-axis at 0
                            min: 0,           // Set y-axis minimum value
                            max: Math.max(...data.map(x => x.brojNekretnina)),         // Set y-axis maximum value
                            ticks: {
                                stepSize: 1 // Tick step
                            }
                        }
                    }
                },
                plugins: [{
                    id: 'customBars',
                    beforeDraw: (chart) => {
                        const ctx = chart.ctx;
                        const dataset = chart.data.datasets[0].data;

                        dataset.forEach((dataPoint) => {
                            const {od, do: doVal, brojNekretnina} = dataPoint;

                            // Map od and do to pixels
                            const xStartPixel = chart.scales.x.getPixelForValue(od);
                            const xEndPixel = chart.scales.x.getPixelForValue(doVal);
                            const yPixel = chart.scales.y.getPixelForValue(brojNekretnina);

                            // Draw the bar
                            ctx.fillStyle = dataPoint.backgroundColor || 'rgba(75, 192, 192, 0.6)';
                            ctx.fillRect(
                                xStartPixel,
                                yPixel,
                                xEndPixel - xStartPixel,
                                chart.scales.y.getPixelForValue(0) - yPixel
                            );

                            ctx.strokeStyle = 'black';
                            ctx.lineWidth = 2; // Set the border width
                            ctx.strokeRect(
                                xStartPixel,
                                yPixel,
                                xEndPixel - xStartPixel,
                                chart.scales.y.getPixelForValue(0) - yPixel
                            );
                        });
                    }
                }]
            });
            data = []
            indeks = hist.indeksPerioda
        }
        data.push({
            od: rasponiCijena[hist.indeksRasporeda].od,
            do: rasponiCijena[hist.indeksRasporeda].do,
            brojNekretnina: hist.brojNekretnina
        })
    }

    const lastCanvas = document.createElement("canvas");
    lastCanvas.id = `myChart${indeks}`;
    chartsContainer.appendChild(lastCanvas);

    const lastCtx = document.getElementById(`myChart${indeks}`).getContext("2d");

    const ctx = document.getElementById(`myChart${indeks}`);
    let chart = new Chart(lastCtx, {
        type: 'bar',
        data: {
            datasets: [{
                label: "Broj nekretnina u periodu " + vremenskiRasponi[indeks].od + "-" + vremenskiRasponi[indeks].do,
                data: data,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        // Show custom tooltips with od and do values
                        label: function (tooltipItem) {
                            const { raw } = tooltipItem;
                            return `From: ${raw.od}, To: ${raw.do}, Height: ${raw.brojNekretnina}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    min: Math.min(...data.map(x => x.od)),         // Set x-axis minimum value
                    max: Math.max(...data.map(x => x.do)),    // Set x-axis maximum value
                    ticks: {
                        stepSize: 10000  // Tick step
                    }
                },
                y: {
                    beginAtZero: true, // Start y-axis at 0
                    min: 0,            // Set y-axis minimum value
                    max: Math.max(...data.map(x => x.brojNekretnina)),            // Set y-axis maximum value
                    ticks: {
                        stepSize: 1 // Tick step
                    }
                }
            }
        },
        plugins: [{
            id: 'customBars',
            beforeDraw: (chart) => {
                const ctx = chart.ctx;
                const dataset = chart.data.datasets[0].data;

                dataset.forEach((dataPoint) => {
                    const { od, do: doVal, brojNekretnina } = dataPoint;

                    // Map od and do to pixels
                    const xStartPixel = chart.scales.x.getPixelForValue(od);
                    const xEndPixel = chart.scales.x.getPixelForValue(doVal);
                    const yPixel = chart.scales.y.getPixelForValue(brojNekretnina);

                    // Draw the bar
                    ctx.fillStyle = dataPoint.backgroundColor || 'rgba(75, 192, 192, 0.6)';
                    ctx.fillRect(
                        xStartPixel,
                        yPixel,
                        xEndPixel - xStartPixel,
                        chart.scales.y.getPixelForValue(0) - yPixel
                    );

                    // Add black border
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2; // Set the border width
                    ctx.strokeRect(
                        xStartPixel,
                        yPixel,
                        xEndPixel - xStartPixel,
                        chart.scales.y.getPixelForValue(0) - yPixel
                    );
                });
            }
        }]
    });
}
