const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const {QueryTypes, where} = require("sequelize");
let blokiraniKorisnici = []

const app = express();
const PORT = 3000;

app.use(session({
    secret: 'tajna sifra',
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));

// Enable JSON parsing without body-parser
app.use(express.json());

const sequelize = new Sequelize('wt24', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const Korisnik = sequelize.define('Korisnik', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ime: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    prezime: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    username: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'Korisnici', // Explicitly defining the table name
    timestamps: false // Assuming no createdAt/updatedAt columns
})

const Nekretnina = sequelize.define('Nekretnina', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tip_nekretnine: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    naziv: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    kvadratura: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cijena: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    tip_grijanja: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    lokacija: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    godina_izgradnje: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    datum_objave: {
        type: Sequelize.STRING,
        allowNull: false
    },
    opis: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    tableName: 'Nekretnine', // Explicit table name
    timestamps: false // No createdAt/updatedAt columns
});


const Upit = sequelize.define('Upit', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tekst: {
        type: Sequelize.TEXT,
        allowNull: false
    }
}, {
    tableName: 'Upiti', // Explicitly define the table name
    timestamps: false // Assuming no createdAt/updatedAt columns
});

const Zahtjev = sequelize.define('Zahtjev', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tekst: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    trazeniDatum: {
        type: Sequelize.STRING,
        allowNull: false
    },
    odobren: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'Zahtjevi',
    timestamps: false
});

const Ponuda = sequelize.define('Ponuda', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tekst: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    cijenaPonude: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    datumPonude: {
        type: Sequelize.STRING,
        allowNull: false
    },
    odbijenaPonuda: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'Ponude',
    timestamps: false
});

const Interesovanje = sequelize.define('Interesovanje', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    interesovanje_fk: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    tip_interesovanja: {
        type: Sequelize.STRING(255),
        allowNull: false,
        isIn: {
            args: [
                ['upit', 'zahtjev', 'ponuda']
            ],
            msg: "Treba biti upit, zahtjev ili ponuda"
        }

    }
}, {
    tableName: 'Interesovanja', // Explicitly defining the table name
    timestamps: false // Assuming no createdAt/updatedAt columns
})

Nekretnina.hasMany(Upit, { as:'Upiti' })
Upit.belongsTo(Nekretnina)

Korisnik.hasMany(Upit, { as:'Upiti' })
Upit.belongsTo(Korisnik)

Nekretnina.hasMany(Zahtjev, { as:'Zahtjevi' })
Zahtjev.belongsTo(Nekretnina)

Korisnik.hasMany(Zahtjev, { as:'Zahtjevi' })
Zahtjev.belongsTo(Korisnik)

Nekretnina.hasMany(Ponuda, { as:'Ponude' })
Ponuda.belongsTo(Nekretnina)

Korisnik.hasMany(Ponuda, { as:'Ponude' })
Ponuda.belongsTo(Korisnik)

Ponuda.hasMany(Ponuda, { as: 'vezanePonude', foreignKey: 'parentPonuda_id' });
Ponuda.belongsTo(Ponuda, { as: 'glavnaPonuda', foreignKey: 'parentPonuda_id' });

async function seedDatabase() {
    await sequelize.sync({ force: true });

    const adminPass = await bcrypt.hash("admin", 10);
    const userPass = await bcrypt.hash("user", 10);
    // Insert users
    const users = await Korisnik.bulkCreate([
        { ime: "admin", prezime: "admin", username: "admin", password: adminPass, admin: true },
        { ime: "user", prezime: "user", username: "user", password: userPass },
        { ime: "Neko3", prezime: "Nekic3", username: "username3", password: "$2b$10$J6FJzniIpRva.W/V5Cd1g.lDLKSQ0MtE.cF.w7AEde5RuDp5AktLO", admin: false }
    ]);

    // Insert properties
    const properties = await Nekretnina.bulkCreate([
        { tip_nekretnine: "Stan", naziv: "Stan Sarajevo", kvadratura: 58, cijena: 232000, tip_grijanja: "plin", lokacija: "Novo Sarajevo", godina_izgradnje: 2019, datum_objave: "01.10.2023.", opis: "Opis stana." },
        {
            tip_nekretnine: "Stan",
            naziv: "Luksuzni penthouse",
            kvadratura: 120,
            cijena: 450000,
            tip_grijanja: "plin",
            lokacija: "Novo Sarajevo",
            godina_izgradnje: 2021,
            datum_objave: "15.11.2023.",
            opis: "Penthouse sa prelijepim pogledom na grad."}
    ]);

    // Insert inquiries (Upiti)
    const inquiries = await Upit.bulkCreate([
        { tekst: "Da li je cena fiksna?", KorisnikId: 1, NekretninaId: 1 },
        { tekst: "Koliko su troškovi režija?", KorisnikId: 2, NekretninaId: 1 },
        { tekst: "Sta je ovo?", KorisnikId: 3, NekretninaId: 1 }
    ]);

    // Insert requests (Zahtjevi)
    const requests = await Zahtjev.bulkCreate([
        { tekst: "Želim zakazati obilazak.", trazeniDatum: "2024-02-01", odobren: false, KorisnikId: 3, NekretninaId: 1 }
    ]);

    // Insert offers (Ponude)
    const offers = await Ponuda.bulkCreate([
        { tekst: "Nudim 220000 EUR za stan.", cijenaPonude: 220000, datumPonude: "2024-02-05", odbijenaPonuda: false, KorisnikId: 1, NekretninaId: 1 }
    ]);

    // Insert into Interesovanja
    await Interesovanje.bulkCreate([
        { interesovanje_fk: inquiries[0].id, tip_interesovanja: "upit" },
        { interesovanje_fk: inquiries[1].id, tip_interesovanja: "upit" },
        { interesovanje_fk: requests[0].id, tip_interesovanja: "zahtjev" },
        { interesovanje_fk: offers[0].id, tip_interesovanja: "ponuda" },
        { interesovanje_fk: inquiries[2].id, tip_interesovanja: "upit" }
    ]);

    console.log("Database seeded successfully!");
}

seedDatabase().catch(console.error);



/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
    const htmlPath = path.join(__dirname, 'public/html', fileName);
    try {
        const content = await fs.readFile(htmlPath, 'utf-8');
        res.send(content);
    } catch (error) {
        console.error('Error serving HTML file:', error);
        res.status(500).json({ greska: 'Internal Server Error' });
    }
}

// Helper function to render upiti (inquiries)
function renderUpiti(upiti) {
    return upiti.map(upit => `
        <div class="upit">
            <p><strong>Username ${upit.KorisnikId}:</strong></p>
            <p>${upit.tekst}</p>
        </div>
    `).join('');
}


// Array of HTML files and their routes
const routes = [
    { route: '/nekretnine.html', file: 'nekretnine.html' },
    { route: '/meni.html', file: 'meni.html' },
    { route: '/prijava.html', file: 'prijava.html' },
    { route: '/profil.html', file: 'profil.html' },
    { route: '/mojiUpiti.html', file: 'mojiUpiti.html' }
    // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
    app.get(route, async (req, res) => {
        await serveHTMLFile(req, res, file);
    });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder
async function readJsonFile(filename) {
    const filePath = path.join(__dirname, 'data', `${filename}.json`);
    try {
        const rawdata = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(rawdata);
    } catch (error) {
        throw error;
    }
}

// Async function for reading json data from data folder
async function saveJsonFile(filename, data) {
    const filePath = path.join(__dirname, 'data', `${filename}.json`);
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        throw error;
    }
}

// GET /nekretnina/:id/interesovanja
// vraća listu svih interesovanja vezanih za nekretninu.
//     Ako je loginovani korisnik admin, onda vratite sve kolone,
//     a ako korisnik ili nije loginovan ili je obični korisnik, iz ponuda ne vraćajte atribut cijene
// (osim za korisnika koji je napravio tu ponudu ili ako je ponuda vezana za njegovu raniju ponudu).

app.get('/nekretnina/:id/interesovanja', async (req, res) => {
    try {
        const id = req.params.id;

        const upiti = await sequelize.query(
            `SELECT i.*, u.*
             FROM Interesovanja i
             JOIN Upiti u ON i.interesovanje_fk = u.id AND u.NekretninaId = :id
             WHERE i.tip_interesovanja = 'upit'`,
            {
                replacements: { id },
                type: QueryTypes.SELECT
            }
        );

        const zahtjevi = await sequelize.query(
            `SELECT i.*, z.*
             FROM Interesovanja i
             JOIN Zahtjevi z ON i.interesovanje_fk = z.id and z.NekretninaId = :id
             WHERE i.tip_interesovanja = 'zahtjev'`,
            {
                replacements: { id },
                type: QueryTypes.SELECT
            }
        );

        const ponude = await sequelize.query(
            `SELECT i.*, p.*
             FROM Interesovanja i
             JOIN Ponude p ON i.interesovanje_fk = p.id and p.NekretninaId = :id
             WHERE i.tip_interesovanja = 'ponuda'`,
            {
                replacements: { id },
                type: QueryTypes.SELECT
            }
        );

        let results = [...upiti, ...zahtjevi, ...ponude]

        const username = req.session.username
        if(!username) {
            results = results.map((interesovanje) => {
                if (interesovanje.cijenaPonude) {
                    let interesovanjeMapirano = {}
                    interesovanjeMapirano.tekst = interesovanje.tekst
                    interesovanjeMapirano.datumPonude = interesovanje.datumPonude
                    interesovanjeMapirano.odbijenaPonuda = interesovanje.odbijenaPonuda
                    interesovanjeMapirano.KorisnikId = interesovanje.KorisnikId
                    interesovanjeMapirano.NekretninaId = interesovanje.NekretninaId
                    return interesovanjeMapirano
                }
                return interesovanje
            })
            return res.status(200).json(results);
        }
        const loggedUser = await Korisnik.findOne({ where: { username: username } })

        if (loggedUser.admin) {
            return res.status(200).json(results);
        } else {
            results = results.map((interesovanje) => {
                if (interesovanje.cijenaPonude && interesovanje.KorisnikId === loggedUser.id) {
                    let interesovanjeMapirano = {}
                    interesovanjeMapirano.tekst = interesovanje.tekst
                    interesovanjeMapirano.datumPonude = interesovanje.datumPonude
                    interesovanjeMapirano.odbijenaPonuda = interesovanje.odbijenaPonuda
                    interesovanjeMapirano.KorisnikId = interesovanje.KorisnikId
                    interesovanjeMapirano.NekretninaId = interesovanje.NekretninaId
                    return interesovanjeMapirano
                }
                return interesovanje
            })
            return res.status(200).json(results);
        }

        // If no results are found, return a 404
        if (!results || results.length === 0) {
            return res.status(404).json({ message: "No interesovanja found for this nekretnina." });
        }
    } catch (error) {
        console.error("Error fetching interesovanja:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



app.get('/detalji.html', async (req, res) => {
    try {
        const id = req.query.id;

        const nekretninaDataValue = await Nekretnina.findOne({ where: { id: id } })
        const nekretnina = nekretninaDataValue.dataValues
        // const upitiDataValue = await nekretninaDataValue.getUpiti()
        // console.log(upitiDataValue)
        // const upiti = upitiDataValue.map(upit => upit.dataValues)
        // console.log(upiti)

        let upiti = await sequelize.query(
            `SELECT * FROM Upiti WHERE NekretninaId = :id`,
            {
                replacements: { id: id },
                type: sequelize.QueryTypes.SELECT
            }
        );



        console.log(upiti)

        if (!nekretnina) {
            return res.status(404).send('Nekretnina not found');
        }

        const filePath = path.join(__dirname, 'public', 'html', 'detalji.html');
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="bs-BA">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Detalji</title>
                <link rel="stylesheet" type="text/css" href="../style/detalji.css">
            </head>
            <body>
                <iframe id="meni-iframe"></iframe>

                <div id="osnovno">
                    <img src="../resources/${nekretnina.id}.jpg" alt="Nekretnina">
                    <p><strong>Naziv:</strong> ${nekretnina.naziv}</p>
                    <p><strong>Kvadratura:</strong> ${nekretnina.kvadratura} m<sup>2</sup></p>
                    <p><strong>Cijena:</strong> ${nekretnina.cijena.toLocaleString()} KM</p>
                </div>

                <h3>DETALJI</h3>
                <div id="detalji">
                    <div id="kolona1">
                        <p><strong>Tip grijanja:</strong> ${nekretnina.tip_grijanja}</p>
                        <p><strong>Lokacija:</strong> ${nekretnina.lokacija}</p>
                    </div>
                    <div id="kolona2">
                        <p><strong>Godina izgradnje:</strong> ${nekretnina.godina_izgradnje}</p>
                        <p><strong>Datum objave oglasa:</strong> ${nekretnina.datum_objave}</p>
                    </div>
                    <div id="opis">
                        <p><strong>Opis:</strong> ${nekretnina.opis}</p>
                    </div>
                </div>
               
                <h3>UPITI</h3>
                <div id="carousel">
                    <button class="btn-reset carousel-navigation" id="lijevo">
                        <img src="../images/left.svg" alt="" width="70" height="50">
                    </button>
                    <div id="glavni-element"></div>
                    <div id="upiti">
                        ${renderUpiti(upiti)}
                    </div>
                    <button class="btn-reset carousel-navigation" id="desno">
                        <img src="../images/right.svg" alt="" width="70" height="50">
                    </button>
                </div>

                <script src="../scripts/PoziviAjax.js"></script>
                <script src="../scripts/detalji.js"></script>
            </body>
            </html>
        `;

        // Send the rendered HTML to the client
        res.send(htmlContent);
    } catch (error) {
        console.error('Error rendering detalji.html:', error);
        res.status(500).send('Internal Server Error');
    }
});
/*
Checks if the user exists and if the password is correct based on korisnici.json data.
If the data is correct, the username is saved in the session and a success message is sent.
*/
app.post('/login', async (req, res) => {
    const jsonObj = req.body;
    const datum = new Date()

    req.session.blokiraniKorisnici = blokiraniKorisnici

    let prijava = "[" + datum.toDateString() + " - " + datum.toTimeString() +  "]" + " - username: "
    try {
        // const data = await fs.readFile(path.join(__dirname, 'data', 'korisnici.json'), 'utf-8');

        const data = await Korisnik.findAll()
        const korisnici = data.map(x => x.dataValues)
        let found = false;

        if(req.session.blokiraniKorisnici.includes(jsonObj.username)) return

        for (const korisnik of korisnici) {
            if (korisnik.username == jsonObj.username) {
                const isPasswordMatched = await bcrypt.compare(jsonObj.password, korisnik.password);
                if (isPasswordMatched) {
                    req.session.username = korisnik.username;
                    found = true;
                    break;
                }
            }
        }

        prijava += jsonObj.username + " - status: "

        found ? prijava += "uspješno" : prijava +="neuspješno"

        await fs.appendFile(path.join(__dirname, 'public', 'resources', 'ostalo', 'prijave.txt'), prijava + "\n")
        let listOfLogs = await fs.readFile(path.join(__dirname, 'public', 'resources', 'ostalo', 'prijave.txt'))
        let reversedListOfLogs = listOfLogs.toString('utf-8').split("\n").toReversed().filter(x => x !== "")
        let neuspjesnoCount = 0
        for (let i = 0; i < reversedListOfLogs.length; i++) {
            if (reversedListOfLogs[i].includes("status: neuspješno") && reversedListOfLogs[i].includes(`username: ${jsonObj.username} `)) {
                neuspjesnoCount++
            }
            if (reversedListOfLogs[i].includes("status: uspješno") && reversedListOfLogs[i].includes(`username: ${jsonObj.username} `)) {
                break;
            }
        }
        let blokiran = (neuspjesnoCount % 3 === 0) && (neuspjesnoCount !== 0)
        if(blokiran) {
            blokiraniKorisnici.push(jsonObj.username)
            req.session.save((err) => {
                if(err) console.log("Failed to save session:", err)
                setTimeout(() => {
                    blokiraniKorisnici.shift()
                    req.session.save((saveErr) => {
                        if (saveErr) {
                            console.error('Failed to save session after unblock:', saveErr);
                        } else {
                            console.log('Session unblocked');
                        }
                    });
                }, 60000);
            })
        }
        if(found) {
            res.json({ poruka: 'Uspješna prijava' })
        }
        else if(blokiran) res.status(429).json({ greska: 'Previse neuspjesnih pokusaja. Pokusajte ponovo za 1 minutu.' })
        else res.json({ poruka: 'Neuspješna prijava' })
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ greska: 'Internal Server Error' });
    }
});

/*
Delete everything from the session.
*/
app.post('/logout', (req, res) => {
    // Check if the user is authenticated
    if (!req.session.username) {
        // User is not logged in
        return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Clear all information from the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            res.status(500).json({ greska: 'Internal Server Error' });
        } else {
            res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
        }
    });
});

/*
Returns currently logged user data. First takes the username from the session and grabs other data
from the .json file.
*/
app.get('/korisnik', async (req, res) => {
    // Check if the username is present in the session
    if (!req.session.username) {
        // User is not logged in
        return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // User is logged in, fetch additional user data
    const username = req.session.username;

    try {
        // Read user data from the JSON file
        const data = await Korisnik.findAll()
        const users = data.map(x => x.dataValues)

        // Find the user by username
        const user = users.find((u) => u.username === username);

        if (!user) {
            // User not found (should not happen if users are correctly managed)
            return res.status(401).json({ greska: 'Neautorizovan pristup' });
        }

        // Send user data
        const userData = {
            id: user.id,
            ime: user.ime,
            prezime: user.prezime,
            username: user.username,
            password: user.password // Should exclude the password for security reasons
        };

        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ greska: 'Internal Server Error' });
    }
});

/*
Allows logged user to make a request for a property
*/
app.post('/upit', async (req, res) => {
    // Check if the user is authenticated
    if (!req.session.username) {
        return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Get data from the request body
    const { nekretnina_id, tekst_upita } = req.body;

    try {
        // Read user data from the JSON file
        const data = await Korisnik.findAll()
        const users = data.map(x => x.dataValues)
        const  loggedInUser = users.find((user) => user.username === req.session.username);

        const nekretnina = await Nekretnina.findByPk(nekretnina_id)

        const [upiti] = await sequelize.query(
            `SELECT * FROM Upiti WHERE NekretninaId = :id`,
            { replacements: { id: nekretnina_id } }
        )

        if (!nekretnina) {
            return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
        } else if (upiti.filter((upit) => upit.KorisnikId === loggedInUser.id).length >= 3) {
            return res.status(429).json( { greska: "Previse upita za istu nekretninu." })
        } else {

            const newUpit = await Upit.create({
                KorisnikId: loggedInUser.id,
                tekst: tekst_upita,
                NekretninaId: nekretnina_id
            });

            const newUpitId = newUpit.id;

            await Interesovanje.create({
                interesovanje_fk: newUpitId,
                tip_interesovanja: 'upit',
            });

            res.status(200).json({ poruka: 'Upit je uspješno dodan' });
        }
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ greska: 'Internal Server Error' });
    }
});

/*
Updates any user field
*/
app.put('/korisnik', async (req, res) => {
    // Check if the user is authenticated
    if (!req.session.username) {
        // User is not logged in
        return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Get data from the request body
    const { ime, prezime, username, password } = req.body;

    try {
        const user = await Korisnik.findOne({ where: { username: req.session.username } });

        if (!user) {
            // User not found (should not happen if users are correctly managed)
            return res.status(401).json({ greska: 'Neautorizovan pristup' });
        }

        // Update user data with the provided values
        if (ime) user.ime = ime;
        if (prezime) user.prezime = prezime;
        if (username) user.username = username;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save()
        res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ greska: 'Internal Server Error' });
    }
});

/*
Returns all properties from the file.
*/
app.get('/nekretnine', async (req, res) => {
    try {
        const nekretnineData = await Nekretnina.findAll();
        res.json(nekretnineData);
    } catch (error) {
        console.error('Error fetching properties data:', error);
        res.status(500).json({ greska: 'Internal Server Error' });
    }
});

/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post('/marketing/nekretnine', async (req, res) => {
    const { nizNekretnina } = req.body;

    try {
        // Load JSON data
        let preferencije = await readJsonFile('preferencije');

        // Check format
        if (!preferencije || !Array.isArray(preferencije)) {
            console.error('Neispravan format podataka u preferencije.json.');
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // Init object for search
        preferencije = preferencije.map((nekretnina) => {
            nekretnina.pretrage = nekretnina.pretrage || 0;
            return nekretnina;
        });

        // Update atribute pretraga
        nizNekretnina.forEach((id) => {
            const nekretnina = preferencije.find((item) => item.id === id);
            if (nekretnina) {
                nekretnina.pretrage += 1;
            }
        });

        // Save JSON file
        await saveJsonFile('preferencije', preferencije);

        res.status(200).json({});
    } catch (error) {
        console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/marketing/nekretnina/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Read JSON
        const preferencije = await readJsonFile('preferencije');

        // Finding the needed objects based on id
        const nekretninaData = preferencije.find((item) => item.id === parseInt(id, 10));

        if (nekretninaData) {
            // Update clicks
            nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

            // Save JSON file
            await saveJsonFile('preferencije', preferencije);

            res.status(200).json({ success: true, message: 'Broj klikova ažuriran.' });
        } else {
            res.status(404).json({ error: 'Nekretnina nije pronađena.' });
        }
    } catch (error) {
        console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/marketing/osvjezi/pretrage', async (req, res) => {
    const { nizNekretnina } = req.body || { nizNekretnina: [] };

    try {
        // Read JSON
        const preferencije = await readJsonFile('preferencije');

        // Finding the needed objects based on id
        const promjene = nizNekretnina.map((id) => {
            const nekretninaData = preferencije.find((item) => item.id === id);
            return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
        });

        res.status(200).json({ nizNekretnina: promjene });
    } catch (error) {
        console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/marketing/osvjezi/klikovi', async (req, res) => {
    const { nizNekretnina } = req.body || { nizNekretnina: [] };

    try {
        // Read JSON
        const preferencije = await readJsonFile('preferencije');

        // Finding the needed objects based on id
        const promjene = nizNekretnina.map((id) => {
            const nekretninaData = preferencije.find((item) => item.id === id);
            return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
        });

        res.status(200).json({ nizNekretnina: promjene });
    } catch (error) {
        console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

function parseDate(dateString) {
    const [day, month, year] = dateString.slice(0, -1).split('.')
    return new Date(`${year}-${month}-${day}`)
}

app.get('/nekretnine/top5', async (req, res) => {
    try {
        const { lokacija } = req.query
        let nekretnineDataValues = await Nekretnina.findAll()
        let nekretnine = nekretnineDataValues.map(x => x.dataValues)

        nekretnine.sort((a, b) => {
            const dateA = parseDate(a.datum_objave)
            const dateB = parseDate(b.datum_objave)
            return dateA - dateB
        })

        res.status(200).json(nekretnine.filter((nekretnina) => nekretnina.lokacija === lokacija).slice(-5))
    } catch (error) {
        console.error("Error fetching nekretnine:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
});

app.get('/upiti/moji', async (req, res) => {
    try {
        if(!req.session.username) {
            return res.status(401).json({ greska: "Neautorizovan pristup" })
        }
        let [user] = await sequelize.query(
            `SELECT * FROM Korisnici WHERE username = :username`,
            { replacements: { username: req.session.username } }
        )
        let [upiti] = await sequelize.query(
            `SELECT * FROM Upiti WHERE KorisnikId = :id`,
            { replacements: { id: user[0].id } }
        )

        upiti = upiti.map((upit) => {
            return {
                tekst_upita: upit.tekst,
                id_nekretnine: upit.NekretninaId
            }
        })
        res.json(upiti)
    } catch (error) {
        console.error("Error fetching upiti:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})


app.get('/nekretnina/:id', async (req, res) => {
    try {
        const { id } = req.params
        let nekretnina = await Nekretnina.findOne({ where: { id: id } })
        if (!nekretnina) return res.status(404).json([])
        let upiti = await Upit.findAll({ where: { NekretninaId: id } })
        let zadnjaTri = upiti.slice(-3)
        let responseNekretnina = nekretnina.dataValues
        responseNekretnina.upiti = zadnjaTri
        res.json(responseNekretnina)
    } catch (error) {
        console.error("Error fetching nekretnina:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get('/next/upiti/nekretnina/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { page } = req.query
        // let nekretnine = await readJsonFile('nekretnine')
        // let nekretnina = nekretnine.find((nekretnina) => nekretnina.id == id)
        // const offset = nekretnina.upiti.length - 3 * (parseInt(page) + 1)
        // if (offset + 3 <= 0) return res.status(404).json([])
        // nekretnina.upiti = nekretnina.upiti.slice(Math.max(offset, 0), offset + 3)
        // let statusniKod = nekretnina.upiti.length === 0 ? 404 : 200


        // let nekretninaDataValue = await Nekretnina.findOne({ id: id })
        // const upitiDataValue = await nekretninaDataValue.getUpiti()
        // console.log(upitiDataValue)
        // const upiti = upitiDataValue.map((upit) => upit.dataValues)

        let upiti = await sequelize.query(
            `SELECT * FROM Upiti WHERE NekretninaId = :id`,
            {
                replacements: { id: id },
                type: sequelize.QueryTypes.SELECT
            }
        );

        // upiti = upiti.map((upit) => upit.dataValues)

        const offset = upiti.length - 3 * (parseInt(page) + 1)
        if (offset + 3 <= 0) return res.status(404).json([])
        let upitiResponse = upiti.slice(Math.max(offset, 0), offset + 3)
        let statusniKod = upitiResponse.length === 0 ? 404 : 200
        res.status(statusniKod).json(upitiResponse)
    } catch (error) {
        console.error("Error fetching nekretnina:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// Start server
app.listen(PORT, () => {
    console.log(`test: Server is running on http://localhost:${PORT}`);
});