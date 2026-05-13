fetch("https://api.artic.edu/api/v1/artworks?fields=title,date_display,artist_title,image_id")
    .then(function(response){
        return response.json()
    })
    .then(function(data){
        let artworks = data.data
        let container = document.getElementById("artwork-container")
        artworks.forEach(function(artwork){
            let artWorkCard = document.createElement("div")
            artWorkCard.innerText = artwork.title
        })
        console.log(artworks)
    })
    .catch(function(error){
        console.log("Something went wrong:", error)
    })