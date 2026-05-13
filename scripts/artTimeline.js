let centuries = [
    { label: "15th Century", url: "https://api.artic.edu/api/v1/artworks/search?query[range][date_start][gte]=1400&query[range][date_start][lte]=1499&fields=id,title,date_start,artist_title,image_id&limit=20" },
    { label: "17th Century", url: "https://api.artic.edu/api/v1/artworks/search?query[range][date_start][gte]=1600&query[range][date_start][lte]=1699&fields=id,title,date_start,artist_title,image_id&limit=20" },
    { label: "18th Century", url: "https://api.artic.edu/api/v1/artworks/search?query[range][date_start][gte]=1700&query[range][date_start][lte]=1799&fields=id,title,date_start,artist_title,image_id&limit=20" },
    { label: "19th Century", url: "https://api.artic.edu/api/v1/artworks/search?query[range][date_start][gte]=1800&query[range][date_start][lte]=1899&fields=id,title,date_start,artist_title,image_id&limit=20" },
    { label: "20th Century", url: "https://api.artic.edu/api/v1/artworks/search?query[range][date_start][gte]=1900&query[range][date_start][lte]=1999&fields=id,title,date_start,artist_title,image_id&limit=20" }
]
fetch("https://api.artic.edu/api/v1/artworks?fields=title,date_start,artist_title,image_id&limit=100")
    .then(function(response){
        return response.json()
    })
    .then(function(data){
        let artworks = data.data
        let container = document.getElementById("artwork-container")

        let centuryGroups = {}

        artworks.forEach(function(artwork){
            if (!artwork.date_start){
                return 
            }
            let year = artwork.date_start
            let century = Math.floor(year/100) + 1
            
            if (!centuryGroups[century]){
                centuryGroups[century] = []
            }
            centuryGroups[century].push(artwork)
        })
        console.log(centuryGroups)

        
    })
    .catch(function(error){
        console.log("Something went wrong:", error)
    })