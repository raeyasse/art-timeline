let centuries = [
    { label: "15th Century", url: "https://api.artic.edu/api/v1/artworks/search?params=%7B%22query%22%3A%7B%22range%22%3A%7B%22date_start%22%3A%7B%22gte%22%3A1400%2C%22lte%22%3A1499%7D%7D%7D%7D&fields=id,title,date_start,artist_title,image_id&limit=20" },
    { label: "17th Century", url: "https://api.artic.edu/api/v1/artworks/search?params=%7B%22query%22%3A%7B%22range%22%3A%7B%22date_start%22%3A%7B%22gte%22%3A1600%2C%22lte%22%3A1699%7D%7D%7D%7D&fields=id,title,date_start,artist_title,image_id&limit=20" },
    { label: "18th Century", url: "https://api.artic.edu/api/v1/artworks/search?params=%7B%22query%22%3A%7B%22range%22%3A%7B%22date_start%22%3A%7B%22gte%22%3A1700%2C%22lte%22%3A1799%7D%7D%7D%7D&fields=id,title,date_start,artist_title,image_id&limit=20" },
    { label: "19th Century", url: "https://api.artic.edu/api/v1/artworks/search?params=%7B%22query%22%3A%7B%22range%22%3A%7B%22date_start%22%3A%7B%22gte%22%3A1800%2C%22lte%22%3A1899%7D%7D%7D%7D&fields=id,title,date_start,artist_title,image_id&limit=20" },
    { label: "20th Century", url: "https://api.artic.edu/api/v1/artworks/search?params=%7B%22query%22%3A%7B%22range%22%3A%7B%22date_start%22%3A%7B%22gte%22%3A1900%2C%22lte%22%3A1999%7D%7D%7D%7D&fields=id,title,date_start,artist_title,image_id&limit=20" }
]

let container = document.getElementById("artwork-container")

function showDetail(id) {
    let timelineView = document.getElementById("timeline-view")
    let detailView = document.getElementById("detail-view")
    timelineView.style.display = "none"
    detailView.style.display = "block"

    fetch("https://api.artic.edu/api/v1/artworks/" + id + "?fields=id,title,date_start,artist_title,artist_id,image_id,medium_display,place_of_origin")
        .then(function(response) {
            return response.json()
        })
        .then(function(data) {
            let artwork = data.data
            detailView.innerHTML = `
                <button id="back-btn">← Back to Gallery</button>
                <h2>${artwork.title}</h2>
                <p><strong>Artist:</strong> <span id="artist-link">${artwork.artist_title || "Unknown"}</span></p>
                <p><strong>Date:</strong> ${artwork.date_start || "Unknown"}</p>
                <p><strong>Medium:</strong> ${artwork.medium_display || "Unknown"}</p>
                <p><strong>Origin:</strong> ${artwork.place_of_origin || "Unknown"}</p>
                <img src="https://www.artic.edu/iiif/2/${artwork.image_id}/full/800,/0/default.jpg" />
            `
            document.getElementById("back-btn").addEventListener("click", function() {
                detailView.style.display = "none"
                timelineView.style.display = "block"
            })
            if (artwork.artist_id) {
            document.getElementById("artist-link").addEventListener("click", function() {
                showArtist(artwork.artist_id)
                })
            }
            })
        .catch(function(error) {
            detailView.innerHTML = "<p>Could not load artwork details. Please try again.</p>"
        })
}

function showArtist(artist_id) {
    let detailView = document.getElementById("detail-view")
    let artistView = document.getElementById("artist-view")
    detailView.style.display = "none"
    artistView.style.display = "block"

    fetch("https://api.artic.edu/api/v1/agents/" + artist_id + "?fields=title,birth_date,death_date,description")
        .then(function(response) {
            return response.json()
        })
        .then(function(data) {
            let artist = data.data
            artistView.innerHTML = `
                <button id="back-to-artwork">← Back to Artwork</button>
                <h2>${artist.title || "Unknown Artist"}</h2>
                <p><strong>Born:</strong> ${artist.birth_date || "Unknown"}</p>
                <p><strong>Died:</strong> ${artist.death_date || "Unknown"}</p>
                <p>${artist.description || "No description available."}</p>
            `
            document.getElementById("back-to-artwork").addEventListener("click", function() {
                artistView.style.display = "none"
                detailView.style.display = "block"
            })
        })
        .catch(function(error) {
            artistView.innerHTML = "<p>Could not load artist details. Please try again.</p>"
        })
}

Promise.all(centuries.map(function (century) {
    return fetch(century.url)
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            return { label: century.label, artworks: data.data }
        })
}))
    .then(function (results) {
        results.forEach(function (century) {
            let section = document.createElement("div")
            section.innerHTML = "<h2>" + century.label + "</h2>"

            century.artworks.forEach(function (artwork) {
                let card = document.createElement("div")
                card.innerText = artwork.title

                card.addEventListener("click", function(){
                    showDetail(artwork.id)
                })

                let image = document.createElement("img")
                
                if(!artwork.image_id) {
                    return
                }

                image.src = "https://www.artic.edu/iiif/2/" + artwork.image_id + "/full/400,/0/default.jpg"
                card.appendChild(image)
                section.appendChild(card)
            })

            container.appendChild(section)
        })
    })
    .catch(function (error) {
        container.innerHTML = "<p>Could not load art. Please try again later.</p>"
    })