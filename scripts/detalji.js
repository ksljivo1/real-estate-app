function postaviCarousel(glavniElement, sviElementi, indeks = 0) {
    const prefix= "\<div class=\"trenutni\"\> "
    const suffix = "\<\//>"
    glavniElement.innerHTML = prefix +  sviElementi[indeks].innerHTML + suffix;

    function fnLijevo() {
        indeks = indeks === 0 ? sviElementi.length - 1 : indeks - 1
        glavniElement.innerHTML = prefix +  sviElementi[indeks].innerHTML + suffix;
    }

    function fnDesno() {
        indeks = (indeks + 1) % sviElementi.length
        glavniElement.innerHTML = prefix +  sviElementi[indeks].innerHTML + suffix;
    }

    if (!glavniElement || sviElementi.length === 0 || indeks < 0 || indeks >= sviElementi.length) {
        return null
    }

    return {
        lijevo: fnLijevo,
        desno: fnDesno
    }
}

window.onload = function () {
    const carousel = postaviCarousel(document.getElementById("glavni-element"),
        document.getElementsByClassName("upit"))
    document.getElementById("lijevo").addEventListener("click", function (event) {
        carousel.lijevo()
    })
    document.getElementById("desno").addEventListener("click", function (event) {
        carousel.desno()
    })
}
