let centuries = [
    { label: "15th Century", url: "https://api.artic.edu/api/v1/artworks/search?query[range][date_start][gte]=1400&query[range][date_start][lte]=1499&fields=id,title,date_start,artist_title,image_id&limit=20" },
    { label: "17th Century", url: "https://api.artic.edu/api/v1/artworks/search?query[range][date_start][gte]=1600&query[range][date_start][lte]=1699&fields=id,title,date_start,artist_title,image_id&limit=20" },
    { label: "18th Century", url: "https://api.artic.edu/api/v1/artworks/search?query[range][date_start][gte]=1700&query[range][date_start][lte]=1799&fields=id,title,date_start,artist_title,image_id&limit=20" },
    { label: "19th Century", url: "https://api.artic.edu/api/v1/artworks/search?query[range][date_start][gte]=1800&query[range][date_start][lte]=1899&fields=id,title,date_start,artist_title,image_id&limit=20" },
    { label: "20th Century", url: "https://api.artic.edu/api/v1/artworks/search?query[range][date_start][gte]=1900&query[range][date_start][lte]=1999&fields=id,title,date_start,artist_title,image_id&limit=20" }
]

let container = document.getElementById("artwork-container")

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
                let image = document.createElement("img")
                
                image.src = "https://www.artic.edu/iiif/2/" + artwork.image_id + "/full/400,/0/default.jpg"
                card.appendChild(image)
                section.appendChild(card)
            })

            container.appendChild(section)
        })
    })
    .catch(function (error) {
        console.log("Something went wrong:", error)
    })