let StatistikaNekretnina = function () {
    let statistikaNekretnina = SpisakNekretnina()

    let init = function (listaNekretnina, listaKorisnika) {
        statistikaNekretnina.init(listaNekretnina, listaKorisnika)
    }

    let prosjecnaKvadratura = function prosjecnaKvadratura(kriterij) {
        const filtriraneNekretnine = statistikaNekretnina.filtrirajNekretnine(kriterij)
        return filtriraneNekretnine ? filtriraneNekretnine
            .map(nekretnina => nekretnina.kvadratura)
            .reduce((a, b) => a + b, 0) / filtriraneNekretnine.length : 0
    }

    let outlier = function outlier(kriterij, nazivSvojstva) {
        const filtriraneNekretnine = statistikaNekretnina.filtrirajNekretnine(kriterij)
        const srednjaVrijednost = filtriraneNekretnine ? filtriraneNekretnine
            .map(nekretnina => nekretnina[nazivSvojstva])
            .reduce((a, b) => a + b, 0) / filtriraneNekretnine.length : 0
        return filtriraneNekretnine.reduce((max, nekretnina) => {
            return Math.abs(nekretnina.nazivSvojstva - srednjaVrijednost) > Math.abs(max.nazivSvojstva - srednjaVrijednost) ? nekretnina : max
        })
    }

    let mojeNekretnine = function(korisnik) {
        return listaNekretnina.filter(nekretnina => nekretnina.upiti.map(upit => upit.korisnik_id).includes(korisnik.id)).sort(
            (nekretnina1, nekretnina2) => {
                return nekretnina2.upiti.length - nekretnina1.upiti.length
            })
    }

    let histogramCijena = function (periodi, rasponiCijena) {
        let grupisanje = []
        for (let i = 0; i < periodi.length; i++) {
            for (let j = 0; j < rasponiCijena.length; j++) {
                grupisanje.push({
                    indeksPerioda: i,
                    indeksRasporeda: j,
                    brojNekretnina: listaNekretnina.filter(nekretnina => {
                        let datum = nekretnina.datum_objave.substr(-5, 4)
                        let datumOd = periodi[i].od
                        let datumDo = periodi[i].do
                        let cijena = nekretnina.cijena
                        let cijenaOd = rasponiCijena[j].od
                        let cijenaDo = rasponiCijena[j].do
                        return datum >= datumOd && datum <= datumDo && cijena >= cijenaOd && cijena <= cijenaDo
                    }).length
                })
            }
        }
        return grupisanje
    }

    return {
        init: init,
        prosjecnaKvadratura: prosjecnaKvadratura,
        outlier: outlier,
        mojeNekretnine: mojeNekretnine,
        histogramCijena: histogramCijena
    }
}