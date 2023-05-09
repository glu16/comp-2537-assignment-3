const numPerPage = 10;
let currentPage = 1;
let pokemon = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $("#pagination").empty();

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = startPage + maxPagesToShow - 1;

  if (endPage > numPages) {
    endPage = numPages;
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  if (currentPage > 1) {
    $("#pagination").append(`
      <button class="btn btn-primary page mr-1" id="prevButton">Prev</button>
    `);
  }

  for (let i = startPage; i <= endPage; i++) {
    $("#pagination").append(`
      <button class="btn btn-primary page ml-1 numberedButtons ${
        i === currentPage ? "active" : ""
      }" value="${i}">${i}</button>
    `);
  }

  if (endPage < numPages) {
    $("#pagination").append(`
      <button class="btn btn-primary page ml-1" id="nextButton">Next</button>
    `);

    $("#nextButton").click(() => {
      currentPage++;
      paginate(currentPage, numPerPage, pokemon);
      updatePaginationDiv(currentPage, numPages);
    });
  }

  if (currentPage > 1) {
    $("#prevButton").click(() => {
      currentPage--;
      paginate(currentPage, numPerPage, pokemon);
      updatePaginationDiv(currentPage, numPages);
    });
  }
};

const paginate = async (currentPage, numPerPage, pokemon) => {
  selected_pokemon = pokemon.slice(
    (currentPage - 1) * numPerPage,
    currentPage * numPerPage
  );

  $("#pokeCards").empty();
  for (const pokemon of selected_pokemon) {
    const res = await axios.get(pokemon.url);
    $("#pokeCards").append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>  
    `);
  }
};

const setup = async () => {
  // test out poke api using axios here

  $("#pokeCards").empty();
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );
  pokemon = response.data.results;

  paginate(currentPage, numPerPage, pokemon);
  const numPages = Math.ceil(pokemon.length / numPerPage);
  updatePaginationDiv(currentPage, numPages);

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $("body").on("click", ".pokeCard", async function (e) {
    const pokemonName = $(this).attr("pokeName");
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name);
    // console.log("types: ", types);
    $(".modal-body").html(`
        <div style="width:200px">
        <img src="${
          res.data.sprites.other["official-artwork"].front_default
        }" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities
          .map((ability) => `<li>${ability.ability.name}</li>`)
          .join("")}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats
          .map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`)
          .join("")}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join("")}
          </ul>
      
        `);
    $(".modal-title").html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `);
  });

  // add event listener to pagination buttons
  $("body").on("click", ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, numPerPage, pokemon);

    // update pagination buttons
    updatePaginationDiv(currentPage, numPages);
  });
};

$(document).ready(setup);
