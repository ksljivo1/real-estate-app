let page = 0
let mojiUpiti = []
let napunjen = false
let id

function napraviUpitElement(upit) {
    return `
        <div class="upit">
            <p><strong>Username ${upit.KorisnikId}:</strong></p>
            <p>${upit.tekst}</p>
        </div>
    `
}

function postaviCarousel(glavniElement, indeks = 0) {
    glavniElement.innerHTML = napraviUpitElement(mojiUpiti[indeks])

    function fnLijevo() {
        indeks = indeks === 0 ? mojiUpiti.length - 1 : indeks - 1
        glavniElement.innerHTML = napraviUpitElement(mojiUpiti[indeks])
    }

    function fnDesno() {
        if (indeks === mojiUpiti.length - 1 && !napunjen) {
            page++
            PoziviAjax.getNextUpiti(id, page, (err, data) => {
                if (err != null && err.status === 404) {
                    napunjen = true
                } else {
                    let res = JSON.parse(data)
                    mojiUpiti = [...mojiUpiti, ...res]
                }
                indeks = (indeks + 1) % mojiUpiti.length
                glavniElement.innerHTML = napraviUpitElement(mojiUpiti[indeks])
            })
        } else {
            indeks = (indeks + 1) % mojiUpiti.length
            glavniElement.innerHTML = napraviUpitElement(mojiUpiti[indeks])
        }
    }

    return {
        lijevo: fnLijevo,
        desno: fnDesno
    }
}

window.onload = function () {
    const queryString = window.location.search
    const params = new URLSearchParams(queryString)
    id = params.get('id')
    console.log(id)
    PoziviAjax.getNextUpiti(id, page, (err, data) => {
        if (err != null && err.status === 404) {
            napunjen = true
            console.log("huh")
        } else {
            let res = JSON.parse(data)
            console.log("ovo bi trebalo biti prazno za id = 2", res)
            mojiUpiti = [...mojiUpiti, ...res]
        }

        const carousel = postaviCarousel(document.getElementById("glavni-element"))
        document.getElementById("lijevo").addEventListener("click", function (event) {
            carousel.lijevo()
        })
        document.getElementById("desno").addEventListener("click", function (event) {
            carousel.desno()
        })
    })
}

window.addEventListener('load', function () {
    const iframe = document.getElementById('meni-iframe');
    iframe.src = 'meni.html'; // Set the src dynamically
});
