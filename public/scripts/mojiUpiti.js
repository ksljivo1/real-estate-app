document.addEventListener("DOMContentLoaded", function() {
    const upitiLista = document.getElementById("upiti-lista")
    PoziviAjax.getMojiUpiti((err, data) => {
        if (err != null && err.statusText === "Unauthorized") {
            document.getElementById("naslov").innerText = "Ulogujte se da vidite vaše upite"
        } else {
            var upiti = JSON.parse(data)
            upiti.forEach((upit) => {
                const upitDiv = document.createElement("div")
                upitDiv.classList.add("upit-item");
                upitDiv.innerHTML = `
                                    <div>${upit.id_nekretnine}</div>
                                    <div>${upit.tekst_upita}</div>
                                `
                upitiLista.appendChild(upitDiv)
            })
        }
    })
})